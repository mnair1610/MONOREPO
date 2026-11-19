import { ProcessResult } from './paymentProcessor';
import {
  DEFAULT_RETRY_COUNT,
  isWebhookEventType,
  WebhookEvent,
  WebhookEventType,
} from '../types/webhookEvent';

/** Incoming event. `type` is a string so unknown types can be rejected at runtime. */
export interface IncomingWebhookEvent {
  id: string;
  type: string;
  timestamp: Date;
  payload: Record<string, unknown>;
  source: string;
  retryCount?: number;
}

type WebhookEventHandler = (event: WebhookEvent) => Promise<ProcessResult>;

export class WebhookEventProcessor {
  private readonly handlers: Record<WebhookEventType, WebhookEventHandler> = {
    'payment.completed': (event) => this.handlePaymentCompleted(event),
    'payment.failed': (event) => this.handlePaymentFailed(event),
    'refund.initiated': (event) => this.handleRefundInitiated(event),
  };

  async process(event: IncomingWebhookEvent): Promise<ProcessResult> {
    if (!isWebhookEventType(event.type)) {
      return this.handleUnknownEvent(event);
    }

    const webhookEvent = this.normalize(event, event.type);
    return this.handlers[webhookEvent.type](webhookEvent);
  }

  private normalize(event: IncomingWebhookEvent, type: WebhookEventType): WebhookEvent {
    return {
      id: event.id,
      type,
      timestamp: event.timestamp,
      payload: event.payload,
      source: event.source,
      retryCount: event.retryCount ?? DEFAULT_RETRY_COUNT,
    };
  }

  private async handlePaymentCompleted(event: WebhookEvent): Promise<ProcessResult> {
    console.log('Processing payment.completed event', event);

    return {
      success: true,
      message: `payment.completed event ${event.id} processed`,
      processedAt: new Date(),
    };
  }

  private async handlePaymentFailed(event: WebhookEvent): Promise<ProcessResult> {
    console.log('Processing payment.failed event', event);

    return {
      success: true,
      message: `payment.failed event ${event.id} processed`,
      processedAt: new Date(),
    };
  }

  private async handleRefundInitiated(event: WebhookEvent): Promise<ProcessResult> {
    console.log('Processing refund.initiated event', event);

    return {
      success: true,
      message: `refund.initiated event ${event.id} processed`,
      processedAt: new Date(),
    };
  }

  private async handleUnknownEvent(event: IncomingWebhookEvent): Promise<ProcessResult> {
    console.log('Received unknown webhook event type', event);

    return {
      success: false,
      message: `Unknown event type: ${event.type}`,
      processedAt: new Date(),
    };
  }
}
