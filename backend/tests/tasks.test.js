import { describe, test, expect } from '@jest/globals';
import { setupTestApp } from './utils/testServer.js';

describe('Health check', () => {
  test('GET /api/health', async () => {
    const { app } = await setupTestApp();
    const res = await app.get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });
});