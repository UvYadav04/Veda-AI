import dotenv from 'dotenv';
// Load environment variables first
dotenv.config();

import express from 'express';
import cors from 'cors';
import http from 'http';
import path from 'path';
import { connectDB } from './config/db';
import { logger } from './config/logger';
import { SocketService } from './config/socket';
import { initializeWorker } from './queues/assessmentQueue';
import assignmentRouter from './routes/assignmentRoutes';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Enable CORS for all requests
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Serve static PDF files
app.use('/pdfs', express.static(path.join(__dirname, '../public/pdfs')));

// API Routes
app.use('/api/assignments', assignmentRouter);

// Basic health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

const bootstrap = async () => {
  try {
    // 1. Connect MongoDB
    await connectDB();

    // 2. Initialize WebSocket Socket.io Server
    SocketService.initialize(server);
    logger.info('WebSocket Socket.io server initialized.');

    // 3. Initialize BullMQ Workers
    initializeWorker();
    logger.info('BullMQ worker initialized.');

    // 4. Start HTTP Server
    server.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server bootstrap', error);
    process.exit(1);
  }
};

bootstrap();
