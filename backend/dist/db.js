import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
export async function connectDatabase() {
    let uri = process.env.MONGODB_URI;
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }
    mongoose.set('strictQuery', true);
    // In-memory MongoDB is opt-in for local development and tests only.
    if (!uri) {
        if (process.env.ALLOW_IN_MEMORY_DB !== 'true')
            throw new Error('MONGODB_URI is not defined in environment variables');
        const mongod = await MongoMemoryServer.create();
        uri = mongod.getUri();
        console.warn('No MONGODB_URI provided — using in-memory MongoDB for development');
    }
    await mongoose.connect(uri, {
        dbName: process.env.MONGODB_DATABASE,
    });
    return mongoose.connection;
}
export async function checkDbConnection() {
    await connectDatabase();
    if (!mongoose.connection.db) {
        throw new Error('Database connection not established');
    }
    return mongoose.connection.db.command({ ping: 1 });
}
export function getDatabaseName() {
    return process.env.MONGODB_DATABASE ?? mongoose.connection.name;
}
