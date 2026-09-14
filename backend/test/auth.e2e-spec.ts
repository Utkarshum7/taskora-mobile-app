import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createTestApp, closeTestApp } from './utils/test-app';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;

  const credentials = { email: 'alice@example.com', password: 'Password123' };

  beforeAll(async () => {
    ({ app, mongod } = await createTestApp());
  });

  afterAll(async () => {
    await closeTestApp(app, mongod);
  });

  describe('POST /auth/register', () => {
    it('creates a new account and returns a safe user + token', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send(credentials)
        .expect(201);

      expect(res.body.user.email).toBe(credentials.email);
      expect(res.body.user.passwordHash).toBeUndefined();
      expect(res.body.user.password).toBeUndefined();
      expect(typeof res.body.accessToken).toBe('string');
    });

    it('rejects a duplicate email with 409', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send(credentials)
        .expect(409);

      expect(res.body.message).toMatch(/already exists/i);
    });

    it('rejects an invalid email with 400', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'not-an-email', password: 'Password123' })
        .expect(400);
    });

    it('rejects a weak password with 400', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'weakpass@example.com', password: 'short' })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    it('logs in with correct credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send(credentials)
        .expect(200);

      expect(res.body.user.email).toBe(credentials.email);
      expect(typeof res.body.accessToken).toBe('string');
    });

    it('rejects a wrong password with a generic 401 message', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: credentials.email, password: 'WrongPassword1' })
        .expect(401);

      expect(res.body.message).toBe('Invalid email or password');
    });

    it('rejects an unregistered email with the same generic 401 message', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'nobody@example.com', password: 'Password123' })
        .expect(401);

      expect(res.body.message).toBe('Invalid email or password');
    });
  });

  describe('GET /auth/me', () => {
    it('rejects a request with no token', async () => {
      await request(app.getHttpServer()).get('/auth/me').expect(401);
    });

    it('rejects a garbage token', async () => {
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer not-a-real-token')
        .expect(401);
    });

    it('returns the current user for a valid token, without passwordHash', async () => {
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send(credentials)
        .expect(200);

      const res = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${loginRes.body.accessToken}`)
        .expect(200);

      expect(res.body.email).toBe(credentials.email);
      expect(res.body.passwordHash).toBeUndefined();
    });
  });
});
