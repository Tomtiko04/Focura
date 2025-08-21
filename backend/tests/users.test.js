import { describe, test, expect } from '@jest/globals';
import { setupTestApp } from './utils/testServer.js';
import { User } from '../src/models/User.js';

async function registerAndLogin(app, email) {
  const password = 'Str0ng!Pass';
  await app.post('/api/auth/register').send({ email, password, name: 'Prefs' });
  // mark verified directly
  const u = await User.findOne({ email });
  u.emailVerified = true;
  await u.save();
  const login = await app.post('/api/auth/login').send({ email, password });
  return { access: login.body.accessToken };
}

describe('User preferences', () => {
  test('GET and PATCH preferences', async () => {
    const { app } = await setupTestApp();
    const email = 'prefs@example.com';
    const { access } = await registerAndLogin(app, email);

    // GET defaults
    const get1 = await app.get('/api/users/me/preferences').set('Authorization', `Bearer ${access}`);
    expect(get1.status).toBe(200);
    expect(get1.body).toHaveProperty('notifications');
    expect(get1.body).toHaveProperty('onboarding');

    // PATCH
    const patch = await app
      .patch('/api/users/me/preferences')
      .set('Authorization', `Bearer ${access}`)
      .send({ notifications: { enabled: true, dailySummary: true, timeOfDay: '08:30' }, onboarding: { completed: true } });
    expect(patch.status).toBe(200);
    expect(patch.body.notifications.enabled).toBe(true);
    expect(patch.body.onboarding.completed).toBe(true);
  });
});