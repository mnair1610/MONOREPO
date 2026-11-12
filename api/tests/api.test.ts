import request from 'supertest';
import express from 'express';

// Simple test setup for the api service
function createTestApp(): express.Application {
  const app = express();
  app.use(express.json());
  app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'api' }));
  app.get('/api/events', (_req, res) => res.json({ data: [], count: 0 }));
  return app;
}

const app = createTestApp();

describe('API Service', () => {
  it('health check returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /api/events returns empty list', async () => {
    const res = await request(app).get('/api/events');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it('GET /api/events returns count', async () => {
    const res = await request(app).get('/api/events');
    expect(res.body.count).toBe(0);
  });

  it('has correct service identifier in health response', async () => {
    const res = await request(app).get('/health');
    expect(res.body.service).toBe('api');
  });

  // Exercise 4: After implementing WebhookEvent support, add tests here:
  // it('POST /api/webhooks accepts valid WebhookEvent', ...)
  // it('POST /api/webhooks rejects invalid event type', ...)
  // it('POST /api/webhooks requires id field', ...)
});
