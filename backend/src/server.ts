import dotenv from 'dotenv';
import http from 'http';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const backendRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: resolve(backendRoot, '.env') });
dotenv.config({ path: resolve(backendRoot, 'atlas-credentials.env') });

import { app } from './app.js';
import { attachSocketHandlers } from './socket/index.js';
import { connectDatabase } from './db.js';
import mongoose from 'mongoose';
import { logger } from './utils/logger.js';
import User from './models/User.js';
import { seedDatabase } from './data/seed.js';

const port = Number(process.env.PORT ?? 3000);

async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined. Database checks will fail until this is set.');
    }

    logger.info('Connecting to MongoDB');
    await connectDatabase();
    const migratedUsers = await User.updateMany({ role: 'admin' }, { $set: { role: 'manager' } });
    if (migratedUsers.modifiedCount > 0) {
      logger.info({ count: migratedUsers.modifiedCount }, 'Migrated legacy admin users to manager');
    }
    const migratedPlatformAdmins = await User.updateMany(
      { role: { $in: ['platformadmin', 'platform-admin'] } },
      { $set: { role: 'platformAdmin' } },
    );
    if (migratedPlatformAdmins.modifiedCount > 0) {
      logger.info({ count: migratedPlatformAdmins.modifiedCount }, 'Normalized platform administrator roles');
    }
    await seedDatabase();
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
