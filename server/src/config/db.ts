import mongoose from 'mongoose';
import { env } from './env';

export async function connectDB(): Promise<void> {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongoUri, { dbName: env.mongoDbName });
  // eslint-disable-next-line no-console
  console.log('[db] Connected to MongoDB');
}
