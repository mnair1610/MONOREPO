import request from 'supertest';
import express from 'express';
import { webhookRouter } from '../src/routes/webhooks';
import { eventStore } from '../src/storage/eventStore';

// Simple test setup for the api service
function createTestApp(): express.Application {
  const app = express();
  app.use(express.json());
  app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'api' }));
  app.get('/api/events', (_req, res) => res.json({ data: [], count: 0 }));
  app.use('/api/webhooks', webhookRouter);
  return app;
}

const app = createTestApp();

const validEvent = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  type: 'payment.completed',
  timestamp: '2026-11-16T09:00:00.000Z',
  payload: { amount: 100, currency: 'USD' },
  source: 'billing',
};

beforeEach(() => {
  eventStore.clear();
});

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

  it('POST /api/webhooks accepts valid WebhookEvent', async () => {
    const res = await request(app).post('/api/webhooks').send(validEvent);

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({
      ...validEvent,
      retryCount: 0,
    });
    expect(eventStore.all()).toHaveLength(1);
    expect(eventStore.all()[0]).toMatchObject({
      id: validEvent.id,
      type: validEvent.type,
      source: validEvent.source,
      retryCount: 0,
    });
    expect(eventStore.all()[0].timestamp).toEqual(new Date(validEvent.timestamp));
  });

  it('POST /api/webhooks rejects invalid event type', async () => {
    const res = await request(app)
      .post('/api/webhooks')
      .send({ ...validEvent, type: 'payment.initiated' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid webhook event');
    expect(res.body.details.fieldErrors.type).toBeDefined();
    expect(eventStore.all()).toHaveLength(0);
  });

  it('POST /api/webhooks requires id field', async () => {
    const { id: _id, timestamp: _timestamp, source: _source, ...incomplete } = validEvent;
    const res = await request(app).post('/api/webhooks').send(incomplete);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid webhook event');
    expect(res.body.details.fieldErrors.id).toBeDefined();
    expect(res.body.details.fieldErrors.timestamp).toBeDefined();
    expect(res.body.details.fieldErrors.source).toBeDefined();
    expect(eventStore.all()).toHaveLength(0);
  });
});
