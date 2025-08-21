// ESM-aware Jest setup
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongo;

beforeAll(async () => {
  // Speed up bcrypt in tests if used
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
  process.env.BACKEND_PUBLIC_URL = 'http://localhost:4000'; // for email links
  // We'll mock the email service; no SMTP needed
  process.env.EMAIL_DISABLE = 'true';

  mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri();
  process.env.MONGODB_URI = uri;

  // Mongoose connects lazily in tests via our utility (see testServer.js)
});

afterAll(async () => {
  if (mongoose.connection.readyState) {
    await mongoose.disconnect();
  }
  if (mongo) await mongo.stop();
});

afterEach(async () => {
  const { connections } = mongoose;
  if (connections && connections[0] && connections[0].db) {
    const collections = await connections[0].db.collections();
    await Promise.all(collections.map((c) => c.deleteMany({})));
  }
});