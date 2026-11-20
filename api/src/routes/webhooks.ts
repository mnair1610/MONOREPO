import { Router } from 'express';
import { eventStore } from '../storage/eventStore';
import { webhookEventSchema } from '../types/webhookEvent';

export const webhookRouter = Router();

webhookRouter.post('/', (req, res) => {
  const parsed = webhookEventSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: 'Invalid webhook event',
      details: parsed.error.flatten(),
    });
    return;
  }

  const stored = eventStore.save(parsed.data);
  res.status(201).json({ data: stored });
});
