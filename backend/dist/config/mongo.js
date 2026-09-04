import mongoose from 'mongoose';
const getMongoUri = (env) => {
    const uri = env.MONGODB_URI;
    if (!uri) {
        throw new Error('Missing MONGODB_URI in environment');
    }
    return uri;
};
export async function connectMongo() {
    const uri = getMongoUri(process.env);
    mongoose.set('strictQuery', true);
    await mongoose.connect(uri);
    // eslint-disable-next-line no-console
    console.log('[mongo] connected');
}
