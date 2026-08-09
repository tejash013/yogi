import mongoose from 'mongoose';

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, {
    dbName: process.env.MONGODB_DATABASE,
  });
  return mongoose.connection;
}

export async function checkDbConnection() {
  await connectDatabase();
  return mongoose.connection.db.command({ ping: 1 });
}

export function getDatabaseName() {
  return process.env.MONGODB_DATABASE ?? mongoose.connection.name;
}
