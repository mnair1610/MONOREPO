import { z } from 'zod';
import { BaseEvent } from './event';

export const WEBHOOK_EVENT_TYPES = [
  'payment.completed',
  'payment.failed',
  'refund.initiated',
] as const;

export type WebhookEventType = (typeof WEBHOOK_EVENT_TYPES)[number];

export interface WebhookEvent extends BaseEvent {
  type: WebhookEventType;
  payload: Record<string, unknown>;
  retryCount: number;
}

export const webhookEventSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(WEBHOOK_EVENT_TYPES),
  timestamp: z.coerce.date(),
  payload: z.record(z.unknown()),
  source: z.string().min(1),
  retryCount: z.number().int().nonnegative().default(0),
});
