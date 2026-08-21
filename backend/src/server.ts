import dotenv from 'dotenv';
import http from 'http';
dotenv.config();

import { app } from './app.js';
import { attachSocketHandlers } from './socket/index.js';
import { connectDatabase } from './db.js';
import mongoose from 'mongoose';
import { logger } from './utils/logger.js';

const port = Number(process.env.PORT ?? 3000);

async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined. Database checks will fail until this is set.');
    }

    logger.info('Connecting to MongoDB');
    await connectDatabase();
    logger.info('Successfully connected to MongoDB');
  } catch (error) {
    logger.fatal({ err: error }, 'MongoDB connection error');
    process.exit(1);
  }

  const server = http.createServer(app);
  attachSocketHandlers(server);

  server.listen(port, () => {
    logger.info({ port }, 'Backend server listening');
  });

  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'Shutting down');
    server.close(async () => {
      await connectDatabase().then(() => mongoose.disconnect()).catch(() => undefined);
      process.exit(0);
    });
  };

  process.once('SIGINT', () => void shutdown('SIGINT'));
  process.once('SIGTERM', () => void shutdown('SIGTERM'));
}

startServer();
