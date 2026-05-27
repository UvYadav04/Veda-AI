import { Queue, Worker, Job } from 'bullmq';
import { getRedisConnectionOptions } from '../config/redis';
import { Assignment } from '../models/Assignment';
import { AIService } from '../services/aiService';
import { PDFService } from '../services/pdfService';
import { SocketService } from '../config/socket';
import { logger } from '../config/logger';

const connection = getRedisConnectionOptions();
const QUEUE_NAME = 'assessment-generation';

export const assessmentQueue = new Queue(QUEUE_NAME, {
  connection,
  defaultJobOptions: {
    attempts: 1,
    removeOnComplete: true,
    removeOnFail: false,
  },
});

const aiService = new AIService();

export const initializeWorker = () => {
  const worker = new Worker(
    QUEUE_NAME,
    async (job: Job) => {
      const { assignmentId } = job.data;
      logger.info(`Starting background generation job: ${job.id} for Assignment: ${assignmentId}`);

      // 1. Fetch assignment details
      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) {
        throw new Error(`Assignment with ID ${assignmentId} not found`);
      }

      try {
        // 2. Mark progress as generating
        assignment.status = 'generating';
        assignment.progress = 15;
        await assignment.save();
        SocketService.emitJobProgress(assignmentId, 'generating', 15);
        logger.info(`Assignment status updated to 'generating' for ${assignmentId}`);

        // 3. Invoke AI generation
        SocketService.emitJobProgress(assignmentId, 'generating', 30);
        const paperData = await aiService.generatePaper({
          title: assignment.title,
          dueDate: assignment.dueDate,
          instructions: assignment.instructions,
          questionTypes: assignment.questionTypes.map(q => ({
            name: q.name,
            count: q.count,
            marks: q.marks
          })),
          totalQuestions: assignment.totalQuestions,
          totalMarks: assignment.totalMarks
        });

        assignment.paper = paperData;
        assignment.progress = 65;
        await assignment.save();
        SocketService.emitJobProgress(assignmentId, 'generating', 65);
        logger.info(`AI questions generated for ${assignmentId}. Creating PDF...`);

        // 4. Generate PDF
        SocketService.emitJobProgress(assignmentId, 'generating', 80);
        const pdfUrl = await PDFService.generateAssessmentPDF(paperData, assignmentId);
        
        // 5. Complete assignment
        assignment.pdfPath = pdfUrl;
        assignment.status = 'completed';
        assignment.progress = 100;
        await assignment.save();
        
        SocketService.emitJobProgress(assignmentId, 'completed', 100, assignment);
        logger.info(`Background job successfully finished for Assignment: ${assignmentId}`);
      } catch (err: any) {
        logger.error(`Error processing job for Assignment ${assignmentId}`, err);
        
        assignment.status = 'failed';
        assignment.progress = 100;
        assignment.errorMessage = err.message || 'Unknown generation error occurred';
        await assignment.save();
        
        SocketService.emitJobProgress(assignmentId, 'failed', 100, {
          error: assignment.errorMessage
        });
        
        throw err;
      }
    },
    { connection }
  );

  worker.on('ready', () => {
    logger.info('BullMQ worker is listening for jobs.');
  });

  worker.on('failed', (job, err) => {
    logger.error(`Job failed: ${job?.id}`, err);
  });
};
