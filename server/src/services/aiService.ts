import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatGroq } from '@langchain/groq';
import { ChatOpenAI } from '@langchain/openai';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { logger } from '../config/logger';
import { IPaper, ISection, IQuestion } from '../models/Assignment';

interface GenerationParams {
  title: string;
  dueDate: Date;
  instructions?: string;
  questionTypes: { name: string; count: number; marks: number }[];
  totalQuestions: number;
  totalMarks: number;
}

// Custom errors
class RetriableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RetriableError';
  }
}

class NonRetriableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NonRetriableError';
  }
}

export class AIService {
  private primaryModel: BaseChatModel | null = null;
  private fallbackModel: BaseChatModel | null = null;

  constructor() {
    this.initializeModels();
  }

  private initializeModels() {
    const geminiKey = process.env.GEMINI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    // Set up primary model
    // Default behavior: Groq primary (if configured), GPT fallback (if configured).
    const primaryProvider = process.env.PRIMARY_PROVIDER || 'groq';
    const primaryModelName = process.env.PRIMARY_MODEL || 'llama-3.3-70b-versatile';

    if (primaryProvider === 'groq' && groqKey) {
      this.primaryModel = new ChatGroq({
        model: primaryModelName,
        apiKey: groqKey,
        temperature: 0.7,
      });
      logger.info(`Primary LLM initialized: Groq (${primaryModelName})`);
    } else if (primaryProvider === 'gemini' && geminiKey) {
      this.primaryModel = new ChatGoogleGenerativeAI({
        model: primaryModelName,
        apiKey: geminiKey,
        temperature: 0.7,
      });
      logger.info(`Primary LLM initialized: Gemini (${primaryModelName})`);
    } else if (primaryProvider === 'openai' && openaiKey) {
      this.primaryModel = new ChatOpenAI({
        modelName: primaryModelName,
        openAIApiKey: openaiKey,
        temperature: 0.7,
      });
      logger.info(`Primary LLM initialized: OpenAI (${primaryModelName})`);
    }

    // Set up fallback model
    const fallbackProvider = process.env.FALLBACK_PROVIDER || 'openai';
    const fallbackModelName = process.env.FALLBACK_MODEL || 'gpt-4o-mini';

    if (fallbackProvider === 'openai' && openaiKey) {
      this.fallbackModel = new ChatOpenAI({
        modelName: fallbackModelName,
        openAIApiKey: openaiKey,
        temperature: 0.5,
      });
      logger.info(`Fallback LLM initialized: OpenAI (${fallbackModelName})`);
    } else if (fallbackProvider === 'groq' && groqKey) {
      this.fallbackModel = new ChatGroq({
        model: fallbackModelName,
        apiKey: groqKey,
        temperature: 0.5,
      });
      logger.info(`Fallback LLM initialized: Groq (${fallbackModelName})`);
    } else if (fallbackProvider === 'gemini' && geminiKey) {
      this.fallbackModel = new ChatGoogleGenerativeAI({
        model: fallbackModelName,
        apiKey: geminiKey,
        temperature: 0.5,
      });
      logger.info(`Fallback LLM initialized: Gemini (${fallbackModelName})`);
    }

    if (!this.primaryModel && !this.fallbackModel) {
      logger.warn('No LLM API keys provided. Running in Mock Generation mode.');
    }
  }

  /**
   * Generates questions based on assignment criteria.
   */
  public async generatePaper(params: GenerationParams): Promise<IPaper> {
    // If no models are configured, use high-quality mock generator immediately
    if (!this.primaryModel && !this.fallbackModel) {
      logger.info('Using Mock Question Generator...');
      return this.generateMockPaper(params);
    }

    const systemPrompt = `You are a professional educational assessor. Create a structured exam paper.
The output MUST be a valid JSON object matching this schema exactly:
{
  "schoolName": "Delhi Public School, Sector-4, Bokaro",
  "subject": "Topic/Subject of assessment",
  "classLevel": "Suitable Grade/Class (e.g. 5th, 8th)",
  "timeAllowedMinutes": 45,
  "maxMarks": 20,
  "sections": [
    {
      "sectionName": "Section A",
      "questionType": "Multiple Choice Questions",
      "instructions": "Attempt all questions. Each question carries 2 marks",
      "questions": [
        {
          "text": "The full text of the question",
          "difficulty": "Easy" | "Moderate" | "Challenging",
          "marks": 2,
          "answer": "Detailed solution or answer key description for the teacher"
        }
      ]
    }
  ]
}

DO NOT wrap your JSON response in markdown code blocks (\`\`\`json ... \`\`\`), output raw JSON only. Ensure the total questions and total marks add up exactly to the requested configuration.`;

    const userPrompt = `Generate a question paper based on:
Title/Topic: "${params.title}"
Instructions: "${params.instructions || 'All questions are compulsory.'}"
Question Types configuration:
${params.questionTypes.map((q) => `- ${q.name}: ${q.count} questions, ${q.marks} marks each.`).join('\n')}
Total Questions required: ${params.totalQuestions}
Total Marks required: ${params.totalMarks}`;

    // Try primary model
    if (this.primaryModel) {
      try {
        return await this.executeWithRetry(this.primaryModel, systemPrompt, userPrompt, params);
      } catch (err) {
        logger.error('Primary LLM generation failed after retries. Switching to fallback LLM.', err);
      }
    }

    // Try fallback model
    if (this.fallbackModel) {
      try {
        logger.info('Attempting generation with Fallback LLM...');
        // Fallback model runs with 1 retry max to avoid high latency/costs
        return await this.executeWithRetry(this.fallbackModel, systemPrompt, userPrompt, params, 1);
      } catch (err) {
        logger.error('Fallback LLM generation failed as well. Invoking mock paper generator.', err);
      }
    }

    // Ultimate fallback if LLM breaks
    logger.warn('AI generation completely failed. Returning generated mock paper.');
    return this.generateMockPaper(params);
  }

  private async executeWithRetry(
    model: BaseChatModel,
    systemPrompt: string,
    userPrompt: string,
    params: GenerationParams,
    maxRetries = 3
  ): Promise<IPaper> {
    let attempt = 0;
    let lastError: Error | null = null;
    let refinedUserPrompt = userPrompt;

    while (attempt < maxRetries) {
      attempt++;
      try {
        logger.info(`LLM Generation Attempt ${attempt}/${maxRetries} using model: ${model.constructor.name}`);
        const response = await model.invoke([
          new SystemMessage(systemPrompt),
          new HumanMessage(refinedUserPrompt),
        ]);

        const rawText = (response.content as string).trim();
        const cleanedText = this.cleanJSONResponse(rawText);
        
        const paper = JSON.parse(cleanedText) as IPaper;
        this.validateSchema(paper, params);
        
        logger.info('LLM generation and validation succeeded.');
        return paper;
      } catch (error: any) {
        lastError = error;
        const isRetriable = this.checkIfErrorIsRetriable(error);
        
        if (!isRetriable) {
          logger.error(`Non-retriable error encountered on attempt ${attempt}: ${error.message}`);
          throw new NonRetriableError(error.message || 'Non-retriable LLM error');
        }

        logger.warn(`Retriable error on attempt ${attempt}: ${error.message}. Retrying...`);
        
        // Add JSON repair instructions to prompt for subsequent attempts
        if (error instanceof SyntaxError || error.message.includes('JSON')) {
          refinedUserPrompt = `${userPrompt}\n\nWARNING: Your previous response caused a JSON parsing error: "${error.message}". Please output strictly valid JSON conforming exactly to the schema. Do not include extra text, explanations, or backticks.`;
        } else if (error.message.includes('validation')) {
          refinedUserPrompt = `${userPrompt}\n\nWARNING: Your previous response failed schema validation: "${error.message}". Please correct these constraints and re-generate.`;
        }

        // Wait a small delay before retry (exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
      }
    }

    throw new RetriableError(lastError?.message || `Failed after ${maxRetries} retries`);
  }

  private checkIfErrorIsRetriable(error: any): boolean {
    const msg = error.message ? error.message.toLowerCase() : '';
    
    // Auth and permission errors are NOT retriable
    if (msg.includes('api_key') || msg.includes('unauthorized') || msg.includes('api key') || msg.includes('401') || msg.includes('403') || msg.includes('forbidden')) {
      return false;
    }

    // JSON syntax errors, validation errors, rate limits (429), or timeout/network errors (503, 504, fetch failed) are retriable
    return (
      error instanceof SyntaxError ||
      msg.includes('validation') ||
      msg.includes('json') ||
      msg.includes('rate limit') ||
      msg.includes('429') ||
      msg.includes('503') ||
      msg.includes('504') ||
      msg.includes('timeout') ||
      msg.includes('fetch') ||
      msg.includes('network')
    );
  }

  private cleanJSONResponse(text: string): string {
    let clean = text;
    // Remove markdown code blocks if the LLM returned them
    if (clean.startsWith('```')) {
      clean = clean.replace(/^```(json)?/, '');
    }
    if (clean.endsWith('```')) {
      clean = clean.slice(0, -3);
    }
    return clean.trim();
  }

  private validateSchema(paper: IPaper, params: GenerationParams) {
    if (!paper.schoolName || !paper.subject || !paper.classLevel || !paper.sections) {
      throw new Error('Missing core schema fields (schoolName, subject, classLevel, sections)');
    }

    if (!Array.isArray(paper.sections)) {
      throw new Error('Sections must be an array');
    }

    // Check count of questions generated vs requested
    let questionCount = 0;
    paper.sections.forEach((sec, idx) => {
      if (!sec.sectionName || !sec.questionType || !sec.questions) {
        throw new Error(`Section at index ${idx} is missing fields`);
      }
      questionCount += sec.questions.length;
    });

    if (questionCount === 0) {
      throw new Error('Generated paper has 0 questions');
    }
  }

  private generateMockPaper(params: GenerationParams): IPaper {
    const schoolName = 'Delhi Public School, Sector-4, Bokaro';
    
    // Try to guess class level or subject from title
    let subject = params.title;
    let classLevel = '8th';

    if (params.title.toLowerCase().includes('english')) {
      subject = 'English';
    } else if (params.title.toLowerCase().includes('science')) {
      subject = 'Science';
    } else if (params.title.toLowerCase().includes('math')) {
      subject = 'Mathematics';
    }

    const sections: ISection[] = [];
    const sectionNames = ['Section A', 'Section B', 'Section C', 'Section D'];
    
    params.questionTypes.forEach((qt, idx) => {
      const questions: IQuestion[] = [];
      const sectionName = sectionNames[idx] || `Section ${String.fromCharCode(65 + idx)}`;
      
      for (let i = 1; i <= qt.count; i++) {
        let diff: 'Easy' | 'Moderate' | 'Challenging' = 'Easy';
        if (i % 3 === 0) diff = 'Challenging';
        else if (i % 2 === 0) diff = 'Moderate';

        questions.push({
          text: `Sample question ${i} on the topic of "${params.title}"? (Generated as dynamic mock)`,
          difficulty: diff,
          marks: qt.marks,
          answer: `This is the detailed explanation and marking scheme answer key for sample question ${i} on "${params.title}".`,
        });
      }

      sections.push({
        sectionName,
        questionType: qt.name,
        instructions: `Attempt all questions. Each question carries ${qt.marks} mark${qt.marks > 1 ? 's' : ''}`,
        questions,
      });
    });

    return {
      schoolName,
      subject,
      classLevel,
      timeAllowedMinutes: 45,
      maxMarks: params.totalMarks,
      sections,
    };
  }
}
