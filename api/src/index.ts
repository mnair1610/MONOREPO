import express from 'express';
import { webhookRouter } from './routes/webhooks';

const app = express();
app.use(express.json());

// Existing routes
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'api' });
});

app.get('/api/events', (_req, res) => {
  res.json({ data: [], count: 0 });
});

app.use('/api/webhooks', webhookRouter);

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, () => {
  console.log(`API service running on http://localhost:${PORT}`);
});
