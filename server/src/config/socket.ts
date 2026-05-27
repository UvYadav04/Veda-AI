import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { logger } from './logger';

export class SocketService {
  private static io: SocketIOServer | null = null;

  public static initialize(server: HttpServer): SocketIOServer {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: '*', // In production, restrict this to client URL
        methods: ['GET', 'POST'],
      },
    });

    this.io.on('connection', (socket) => {
      logger.info(`Socket client connected: ${socket.id}`);

      socket.on('join:job', (jobId: string) => {
        socket.join(`job:${jobId}`);
        logger.info(`Socket ${socket.id} joined room: job:${jobId}`);
      });

      socket.on('disconnect', () => {
        logger.info(`Socket client disconnected: ${socket.id}`);
      });
    });

    return this.io;
  }

  public static getIO(): SocketIOServer {
    if (!this.io) {
      throw new Error('Socket.io has not been initialized');
    }
    return this.io;
  }

  /**
   * Broadcasts job progress updates to all sockets in the specific room
   */
  public static emitJobProgress(jobId: string, status: string, progress: number, data?: any) {
    if (!this.io) {
      logger.warn('Skipping WS progress broadcast: socket not initialized');
      return;
    }
    
    this.io.to(`job:${jobId}`).emit('job:progress', {
      jobId,
      status,
      progress,
      data,
    });
    
    // Also emit a general system update for dashboard sync
    this.io.emit('assignments:update', { jobId, status });
  }
}
