import dotenv from 'dotenv';
import http from 'http';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '../atlas-credentials.env') });

import { app } from './app.js';
import { attachSocketHandlers } from './socket/index.js';
import { connectDatabase } from './db.js';

const port = Number(process.env.PORT ?? 3000);

async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined. Database checks will fail until this is set.');
    }

    console.log('🔄 Connecting to MongoDB Atlas...');
    await connectDatabase();
    console.log('✅ Successfully connected to MongoDB Atlas');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }

  const server = http.createServer(app);
  attachSocketHandlers(server);

  server.listen(port, () => {
    console.log(`Backend server running at http://localhost:${port}`);
  });
}

startServer();
