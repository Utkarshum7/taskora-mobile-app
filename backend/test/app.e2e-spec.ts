import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createTestApp, closeTestApp } from './utils/test-app';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    ({ app, mongod } = await createTestApp());
  });

  afterAll(async () => {
    await closeTestApp(app, mongod);
  });

  it('/ (GET) reports liveness status', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect({ status: 'ok', service: 'Modulus17 backend' });
  });
});
