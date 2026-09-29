import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { applyFakeEnvWhereMissing, createTestApp } from './helpers/test-app';

applyFakeEnvWhereMissing();

describe('AppController (e2e)', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health → 200 và đúng tên service', async () => {
    const res = await request(app.getHttpServer()).get('/health').expect(200);
    expect(res.body).toMatchObject({ status: 'ok', service: 'eh-am-backend' });
  });
});
