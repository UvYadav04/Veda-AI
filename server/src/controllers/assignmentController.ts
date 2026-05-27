import { Request, Response } from 'express';
import { Assignment } from '../models/Assignment';
import { assessmentQueue } from '../queues/assessmentQueue';
import { logger } from '../config/logger';

export const createAssignment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, dueDate, instructions, questionTypes } = req.body;

    // Validate inputs
    if (!title || !dueDate || !questionTypes || !Array.isArray(questionTypes) || questionTypes.length === 0) {
      res.status(400).json({ error: 'Title, due date, and at least one question type are required.' });
      return;
    }

    // Check for negative counts/marks
    let totalQuestions = 0;
    let totalMarks = 0;
    for (const q of questionTypes) {
      if (q.count <= 0 || q.marks <= 0) {
        res.status(400).json({ error: 'Question counts and marks must be positive values.' });
        return;
      }
      totalQuestions += q.count;
      totalMarks += q.count * q.marks;
    }

    // Create assignment in DB
    const assignment = new Assignment({
      title,
      dueDate: new Date(dueDate),
      instructions,
      questionTypes,
      status: 'queued',
      progress: 0,
      totalQuestions,
      totalMarks,
    });

    await assignment.save();
    logger.info(`Assignment created in DB with ID: ${assignment._id}`);

    // Add to BullMQ queue
    const job = await assessmentQueue.add(`generate:${assignment._id}`, {
      assignmentId: assignment._id,
    });
    logger.info(`Scheduled background job ID: ${job.id} for assignment: ${assignment._id}`);

    res.status(201).json(assignment);
  } catch (err: any) {
    logger.error('Error creating assignment', err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
};

export const getAssignments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, status } = req.query;
    const filter: any = {};

    if (search) {
      filter.title = { $regex: search as string, $options: 'i' };
    }

    if (status) {
      filter.status = status as string;
    }

    const assignments = await Assignment.find(filter).sort({ createdAt: -1 });
    res.status(200).json(assignments);
  } catch (err: any) {
    logger.error('Error fetching assignments', err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
};

export const getAssignmentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findById(id);

    if (!assignment) {
      res.status(404).json({ error: 'Assignment not found' });
      return;
    }

    res.status(200).json(assignment);
  } catch (err: any) {
    logger.error(`Error fetching assignment ${req.params.id}`, err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
};

export const deleteAssignment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findByIdAndDelete(id);

    if (!assignment) {
      res.status(404).json({ error: 'Assignment not found' });
      return;
    }

    logger.info(`Assignment deleted: ${id}`);
    res.status(200).json({ message: 'Assignment successfully deleted' });
  } catch (err: any) {
    logger.error(`Error deleting assignment ${req.params.id}`, err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
};

export const regenerateAssignment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findById(id);

    if (!assignment) {
      res.status(404).json({ error: 'Assignment not found' });
      return;
    }

    // Reset status to queued
    assignment.status = 'queued';
    assignment.progress = 0;
    assignment.errorMessage = undefined;
    assignment.paper = undefined;
    assignment.pdfPath = undefined;
    await assignment.save();

    logger.info(`Re-triggering generation for Assignment ID: ${id}`);

    // Add to queue
    const job = await assessmentQueue.add(`generate:${assignment._id}`, {
      assignmentId: assignment._id,
    });
    logger.info(`Re-scheduled background job ID: ${job.id} for assignment: ${assignment._id}`);

    res.status(200).json(assignment);
  } catch (err: any) {
    logger.error(`Error regenerating assignment ${req.params.id}`, err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
};
