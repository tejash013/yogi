import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

export async function connectDatabase() {
  let uri = process.env.MONGODB_URI;

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  mongoose.set('strictQuery', true);

  // If no URI provided, and not production, spin up an in-memory MongoDB for developer convenience
  if (!uri) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    const mongod = await MongoMemoryServer.create();
    uri = mongod.getUri();
    console.warn('No MONGODB_URI provided — using in-memory MongoDB for development');
  }

  try {
    await mongoose.connect(uri, {
      dbName: process.env.MONGODB_DATABASE,
    });
    return mongoose.connection;
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Failed to connect to provided MongoDB URI — falling back to in-memory MongoDB', err);
      const mongod = await MongoMemoryServer.create();
      uri = mongod.getUri();
      await mongoose.connect(uri, { dbName: process.env.MONGODB_DATABASE });
      return mongoose.connection;
    }
    throw err;
  }
}

export async function checkDbConnection() {
  await connectDatabase();
  return mongoose.connection.db.command({ ping: 1 });
}

export function getDatabaseName() {
  return process.env.MONGODB_DATABASE ?? mongoose.connection.name;
}
