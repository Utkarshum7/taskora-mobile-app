import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createTestApp, closeTestApp } from './utils/test-app';

describe('Tasks (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;

  let userAToken: string;
  let userBToken: string;

  beforeAll(async () => {
    ({ app, mongod } = await createTestApp());

    const userA = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'user-a@example.com', password: 'Password123' });
    userAToken = userA.body.accessToken;

    const userB = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'user-b@example.com', password: 'Password123' });
    userBToken = userB.body.accessToken;
  });

  afterAll(async () => {
    await closeTestApp(app, mongod);
  });

  const authed = (token: string) => (req: request.Test) =>
    req.set('Authorization', `Bearer ${token}`);

  describe('POST /tasks', () => {
    it('rejects an unauthenticated request', async () => {
      await request(app.getHttpServer())
        .post('/tasks')
        .send({ title: 'No auth' })
        .expect(401);
    });

    it('creates a task for the authenticated user', async () => {
      const res = await authed(userAToken)(
        request(app.getHttpServer()).post('/tasks'),
      ).send({
        title: 'Write README',
        description: 'Explain setup steps',
        deadline: '2025-06-02T18:00:00.000Z',
        priority: 'high',
        category: 'docs',
      });

      expect(res.status).toBe(201);
      expect(res.body.title).toBe('Write README');
      expect(res.body.priority).toBe('high');
      expect(res.body.isCompleted).toBe(false);
    });

    it('rejects an invalid priority value with 400', async () => {
      const res = await authed(userAToken)(
        request(app.getHttpServer()).post('/tasks'),
      ).send({
        title: 'Bad priority',
        priority: 'urgent', // not one of low|medium|high
      });
      expect(res.status).toBe(400);
    });

    it('rejects a missing title with 400', async () => {
      const res = await authed(userAToken)(
        request(app.getHttpServer()).post('/tasks'),
      ).send({
        description: 'no title here',
      });
      expect(res.status).toBe(400);
    });

    it('rejects an invalid deadline with 400', async () => {
      const res = await authed(userAToken)(
        request(app.getHttpServer()).post('/tasks'),
      ).send({
        title: 'Bad date',
        deadline: 'not-a-date',
      });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /tasks — scoped to the caller', () => {
    it("lists only the current user's tasks", async () => {
      // user A already has a task from the previous block; give user B one too.
      await authed(userBToken)(
        request(app.getHttpServer()).post('/tasks'),
      ).send({
        title: "User B's task",
      });

      const resA = await authed(userAToken)(
        request(app.getHttpServer()).get('/tasks'),
      );
      expect(resA.status).toBe(200);
      expect(
        resA.body.every((t: { title: string }) => t.title !== "User B's task"),
      ).toBe(true);

      const resB = await authed(userBToken)(
        request(app.getHttpServer()).get('/tasks'),
      );
      expect(resB.status).toBe(200);
      expect(
        resB.body.some((t: { title: string }) => t.title === "User B's task"),
      ).toBe(true);
    });

    it('filters by status=completed / status=pending', async () => {
      const created = await authed(userAToken)(
        request(app.getHttpServer()).post('/tasks'),
      ).send({
        title: 'To be completed',
      });
      await authed(userAToken)(
        request(app.getHttpServer()).patch(`/tasks/${created.body._id}`),
      ).send({
        isCompleted: true,
      });

      const completed = await authed(userAToken)(
        request(app.getHttpServer()).get('/tasks?status=completed'),
      );
      expect(
        completed.body.every((t: { isCompleted: boolean }) => t.isCompleted),
      ).toBe(true);
      expect(
        completed.body.some((t: { _id: string }) => t._id === created.body._id),
      ).toBe(true);

      const pending = await authed(userAToken)(
        request(app.getHttpServer()).get('/tasks?status=pending'),
      );
      expect(
        pending.body.every((t: { isCompleted: boolean }) => !t.isCompleted),
      ).toBe(true);
    });

    it('rejects an invalid status filter with 400', async () => {
      const res = await authed(userAToken)(
        request(app.getHttpServer()).get('/tasks?status=whatever'),
      );
      expect(res.status).toBe(400);
    });
  });

  describe('cross-user access protection', () => {
    let userATaskId: string;

    beforeAll(async () => {
      const res = await authed(userAToken)(
        request(app.getHttpServer()).post('/tasks'),
      ).send({
        title: "User A's private task",
      });
      userATaskId = res.body._id;
    });

    it('returns 404 (not 403) when another user requests the task by id', async () => {
      const res = await authed(userBToken)(
        request(app.getHttpServer()).get(`/tasks/${userATaskId}`),
      );
      expect(res.status).toBe(404);
    });

    it('returns 404 when another user tries to update the task', async () => {
      const res = await authed(userBToken)(
        request(app.getHttpServer()).patch(`/tasks/${userATaskId}`),
      ).send({ title: 'hijacked' });
      expect(res.status).toBe(404);
    });

    it('returns 404 when another user tries to delete the task', async () => {
      const res = await authed(userBToken)(
        request(app.getHttpServer()).delete(`/tasks/${userATaskId}`),
      );
      expect(res.status).toBe(404);
    });

    it('leaves the task intact and accessible to its real owner', async () => {
      const res = await authed(userAToken)(
        request(app.getHttpServer()).get(`/tasks/${userATaskId}`),
      );
      expect(res.status).toBe(200);
      expect(res.body.title).toBe("User A's private task");
    });
  });

  describe('PATCH /tasks/:id', () => {
    it('updates fields and marks a task complete', async () => {
      const created = await authed(userAToken)(
        request(app.getHttpServer()).post('/tasks'),
      ).send({
        title: 'Original title',
        priority: 'low',
      });

      const res = await authed(userAToken)(
        request(app.getHttpServer()).patch(`/tasks/${created.body._id}`),
      ).send({ title: 'Updated title', priority: 'high', isCompleted: true });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Updated title');
      expect(res.body.priority).toBe('high');
      expect(res.body.isCompleted).toBe(true);
    });

    it('returns 400 for a malformed id', async () => {
      const res = await authed(userAToken)(
        request(app.getHttpServer()).patch('/tasks/not-a-valid-id'),
      ).send({ title: 'x' });
      expect(res.status).toBe(400);
    });

    it('returns 404 for a well-formed id that does not exist', async () => {
      const res = await authed(userAToken)(
        request(app.getHttpServer()).patch('/tasks/64b64b64b64b64b64b64b64b'),
      ).send({ title: 'x' });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /tasks/:id', () => {
    it("deletes the caller's own task", async () => {
      const created = await authed(userAToken)(
        request(app.getHttpServer()).post('/tasks'),
      ).send({
        title: 'To be deleted',
      });

      await authed(userAToken)(
        request(app.getHttpServer()).delete(`/tasks/${created.body._id}`),
      ).expect(200);

      const getAfterDelete = await authed(userAToken)(
        request(app.getHttpServer()).get(`/tasks/${created.body._id}`),
      );
      expect(getAfterDelete.status).toBe(404);
    });
  });
});
