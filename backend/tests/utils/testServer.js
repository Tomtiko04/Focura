import request from 'supertest';
import mongoose from 'mongoose';
import { connectToDatabase } from '../../src/config/db.js';
import app from '../../src/app.js';

export async function setupTestApp() {
  if (mongoose.connection.readyState === 0) {
    await connectToDatabase();
  }
  return { app: request(app) };
}