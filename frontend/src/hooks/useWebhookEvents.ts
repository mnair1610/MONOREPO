import { useEffect, useState } from 'react';
import {
  DEFAULT_RETRY_COUNT,
  WebhookEvent,
  WebhookEventType,
} from '../types/webhookEvent';

export interface UseWebhookEventsResult {
  events: WebhookEvent[];
  loading: boolean;
  error: string | null;
}

const WEBHOOKS_URL = '/api/webhooks';

const WEBHOOK_EVENT_TYPES: readonly WebhookEventType[] = [
  'payment.completed',
  'payment.failed',
  'refund.initiated',
];

function isWebhookEventType(value: unknown): value is WebhookEventType {
  return typeof value === 'string' && WEBHOOK_EVENT_TYPES.includes(value as WebhookEventType);
}

function normalizeEvent(raw: unknown): WebhookEvent | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const event = raw as Record<string, unknown>;
  if (typeof event.id !== 'string' || !isWebhookEventType(event.type) || typeof event.source !== 'string') {
    return null;
  }

  const timestampValue = event.timestamp;
  const timestamp = timestampValue instanceof Date
    ? timestampValue
    : new Date(
      typeof timestampValue === 'string' || typeof timestampValue === 'number' ? timestampValue : '',
    );

  if (Number.isNaN(timestamp.getTime())) {
    return null;
  }

  const payload = event.payload && typeof event.payload === 'object' && !Array.isArray(event.payload)
    ? event.payload as Record<string, unknown>
    : {};

  return {
    id: event.id,
    type: event.type,
    timestamp,
    payload,
    source: event.source,
    retryCount: typeof event.retryCount === 'number' ? event.retryCount : DEFAULT_RETRY_COUNT,
  };
}

function extractEvents(body: unknown): WebhookEvent[] {
  const list = Array.isArray(body)
    ? body
    : body && typeof body === 'object' && Array.isArray((body as { data?: unknown }).data)
      ? (body as { data: unknown[] }).data
      : [];

  return list
    .map(normalizeEvent)
    .filter((event): event is WebhookEvent => event !== null);
}

export function useWebhookEvents(): UseWebhookEventsResult {
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load(): Promise<void> {
      try {
        const response = await fetch(WEBHOOKS_URL, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const body: unknown = await response.json();
        if (controller.signal.aborted) {
          return;
        }

        setEvents(extractEvents(body));
        setError(null);
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }
        setEvents([]);
        setError(err instanceof Error ? err.message : 'Failed to load webhook events');
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      controller.abort();
    };
  }, []);

  return { events, loading, error };
}
