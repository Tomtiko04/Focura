import { describe, test, expect } from '@jest/globals';
import { setupTestApp } from './utils/testServer.js';
import { User } from '../src/models/User.js';
import { randomToken, sha256 } from '../src/utils/crypto.js';

describe('Auth flow', () => {
  test('register -> verify (web) -> login -> refresh -> logout', async () => {
    const { app } = await setupTestApp();

    // Register
    const email = 'test1@example.com';
    const password = 'Str0ng!Pass';
    const reg = await app.post('/api/auth/register').send({ email, password, name: 'Tester' });
    expect(reg.status).toBe(201);

    // Simulate clicking the verification link by creating our own token and setting its hash
    const rawVerify = randomToken(32);
    const u1 = await User.findOne({ email });
    u1.verification = { tokenHash: sha256(rawVerify), expiresAt: new Date(Date.now() + 60 * 60 * 1000) };
    await u1.save();

    const ver = await app.get('/api/auth/verify').query({ token: rawVerify });
    expect(ver.status).toBe(200);

    const user = await User.findOne({ email });
    expect(user).toBeTruthy();
    expect(user.emailVerified).toBe(true);

    // Login
    const login = await app.post('/api/auth/login').send({ email, password });
    expect(login.status).toBe(200);
    expect(login.body.accessToken).toBeTruthy();
    expect(login.body.refreshToken).toBeTruthy();

    const oldRefresh = login.body.refreshToken;

    // Refresh (rotate)
    const refresh = await app.post('/api/auth/refresh').send({ refreshToken: oldRefresh });
    expect(refresh.status).toBe(200);
    expect(refresh.body.refreshToken).toBeTruthy();
    expect(refresh.body.refreshToken).not.toBe(oldRefresh);

    // Logout
    const logout = await app.post('/api/auth/logout').send({ refreshToken: refresh.body.refreshToken });
    expect(logout.status).toBe(200);
    expect(logout.body.ok).toBe(true);
  });

  test('forgot/reset password invalidates old refresh tokens', async () => {
    const { app } = await setupTestApp();

    const email = 'reset@example.com';
    const password = 'Str0ng!Pass';
    await app.post('/api/auth/register').send({ email, password, name: 'ResetUser' });

    // Mark verified directly to proceed
    const u2 = await User.findOne({ email });
    u2.emailVerified = true;
    await u2.save();

    // Login
    const login = await app.post('/api/auth/login').send({ email, password });
    expect(login.status).toBe(200);
    const refreshToken = login.body.refreshToken;

    // Create our own reset token and set its hash
    const rawReset = randomToken(32);
    const userForReset = await User.findOne({ email });
    userForReset.passwordReset = { tokenHash: sha256(rawReset), expiresAt: new Date(Date.now() + 60 * 60 * 1000) };
    await userForReset.save();

    // Reset password via endpoint
    const newPw = 'N3w!StrongPass';
    const reset = await app.post('/api/auth/reset-password').send({ token: rawReset, password: newPw });
    expect(reset.status).toBe(200);

    // Old refresh should now be invalid
    const badRefresh = await app.post('/api/auth/refresh').send({ refreshToken });
    expect([400, 401]).toContain(badRefresh.status);

    // New login works
    const login2 = await app.post('/api/auth/login').send({ email, password: newPw });
    expect(login2.status).toBe(200);
  });

  test('login blocked until verified', async () => {
    const { app } = await setupTestApp();
    const email = 'unverified@example.com';
    const password = 'Str0ng!Pass';
    await app.post('/api/auth/register').send({ email, password });

    const login = await app.post('/api/auth/login').send({ email, password });
    expect(login.status).toBe(403);
  });
});