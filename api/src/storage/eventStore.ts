import { WebhookEvent } from '../types/webhookEvent';

const events: WebhookEvent[] = [];

export const eventStore = {
  save(event: WebhookEvent): WebhookEvent {
    events.push(event);
    return event;
  },

  all(): WebhookEvent[] {
    return [...events];
  },

  clear(): void {
    events.length = 0;
  },
};
