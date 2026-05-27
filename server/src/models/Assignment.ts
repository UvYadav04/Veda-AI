import { Schema, model, Document } from 'mongoose';

export interface IQuestion {
  text: string;
  difficulty: 'Easy' | 'Moderate' | 'Challenging';
  marks: number;
  answer: string;
}

export interface ISection {
  sectionName: string;
  questionType: string;
  instructions: string;
  questions: IQuestion[];
}

export interface IPaper {
  schoolName: string;
  subject: string;
  classLevel: string;
  timeAllowedMinutes: number;
  maxMarks: number;
  sections: ISection[];
}

export interface IQuestionConfig {
  name: string;
  count: number;
  marks: number;
}

export interface IAssignment extends Document {
  title: string;
  dueDate: Date;
  instructions?: string;
  questionTypes: IQuestionConfig[];
  status: 'queued' | 'generating' | 'completed' | 'failed';
  progress: number;
  errorMessage?: string;
  pdfPath?: string;
  totalQuestions: number;
  totalMarks: number;
  paper?: IPaper;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  text: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Moderate', 'Challenging'], required: true },
  marks: { type: Number, required: true },
  answer: { type: String, required: true },
});

const SectionSchema = new Schema<ISection>({
  sectionName: { type: String, required: true },
  questionType: { type: String, required: true },
  instructions: { type: String, required: true },
  questions: [QuestionSchema],
});

const PaperSchema = new Schema<IPaper>({
  schoolName: { type: String, required: true },
  subject: { type: String, required: true },
  classLevel: { type: String, required: true },
  timeAllowedMinutes: { type: Number, required: true },
  maxMarks: { type: Number, required: true },
  sections: [SectionSchema],
});

const AssignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true },
    dueDate: { type: Date, required: true },
    instructions: { type: String },
    questionTypes: [
      {
        name: { type: String, required: true },
        count: { type: Number, required: true },
        marks: { type: Number, required: true },
      },
    ],
    status: {
      type: String,
      enum: ['queued', 'generating', 'completed', 'failed'],
      default: 'queued',
    },
    progress: { type: Number, default: 0 },
    errorMessage: { type: String },
    pdfPath: { type: String },
    totalQuestions: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    paper: PaperSchema,
  },
  { timestamps: true }
);

export const Assignment = model<IAssignment>('Assignment', AssignmentSchema);
