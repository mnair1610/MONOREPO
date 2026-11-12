import express from 'express';

const app = express();
app.use(express.json());

// Existing routes
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'api' });
});

app.get('/api/events', (_req, res) => {
  res.json({ data: [], count: 0 });
});

// TODO (Exercise 4): Add POST /api/webhooks endpoint for WebhookEvent

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`API service running on http://localhost:${PORT}`);
});
