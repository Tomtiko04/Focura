import mongoose from 'mongoose';

export async function connectToDatabase() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/focura';
  if (!mongoUri) throw new Error('MONGODB_URI not configured');

  mongoose.set('strictQuery', true);
  await mongoose.connect(mongoUri, {
    autoIndex: true
  });

  // eslint-disable-next-line no-console
  console.log('[backend] Connected to MongoDB');
}


