import { processPaymentInitiated } from '../src/processors/paymentProcessor';
import {
  IncomingWebhookEvent,
  WebhookEventProcessor,
} from '../src/processors/webhookEventProcessor';

describe('PaymentProcessor', () => {
  it('processes payment successfully', async () => {
    const result = await processPaymentInitiated({
      amount: 1000,
      currency: 'USD',
      customerId: 'cust-123',
    });

    expect(result.success).toBe(true);
    expect(result.processedAt).toBeInstanceOf(Date);
    expect(result.message).toContain('1000');
  });

  it('includes currency in result message', async () => {
    const result = await processPaymentInitiated({
      amount: 500,
      currency: 'EUR',
      customerId: 'cust-456',
    });

    expect(result.message).toContain('EUR');
  });

  it('returns processedAt as a recent date', async () => {
    const before = new Date();
    const result = await processPaymentInitiated({
      amount: 100,
      currency: 'USD',
      customerId: 'cust-789',
    });
    const after = new Date();

    expect(result.processedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(result.processedAt.getTime()).toBeLessThanOrEqual(after.getTime());
  });

});

describe('WebhookEventProcessor', () => {
  const processor = new WebhookEventProcessor();
  let logSpy: jest.SpyInstance;

  const buildEvent = (
    type: string,
    overrides: Partial<IncomingWebhookEvent> = {}
  ): IncomingWebhookEvent => ({
    id: 'evt-123',
    type,
    timestamp: new Date('2026-11-16T09:00:00.000Z'),
    payload: { amount: 1000, currency: 'USD' },
    source: 'billing-service',
    retryCount: 0,
    ...overrides,
  });

  beforeEach(() => {
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it('routes payment.completed events to the payment completed handler', async () => {
    const event = buildEvent('payment.completed');
    const before = new Date();

    const result = await processor.process(event);

    const after = new Date();
    expect(result.success).toBe(true);
    expect(result.message).toBe('payment.completed event evt-123 processed');
    expect(result.processedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(result.processedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    expect(logSpy).toHaveBeenCalledWith(
      'Processing payment.completed event',
      expect.objectContaining({ id: event.id, type: 'payment.completed', source: event.source })
    );
  });

  it('routes payment.failed events to the payment failed handler', async () => {
    const event = buildEvent('payment.failed', { id: 'evt-failed' });

    const result = await processor.process(event);

    expect(result.success).toBe(true);
    expect(result.message).toBe('payment.failed event evt-failed processed');
    expect(result.processedAt).toBeInstanceOf(Date);
    expect(logSpy).toHaveBeenCalledWith(
      'Processing payment.failed event',
      expect.objectContaining({ id: 'evt-failed', type: 'payment.failed' })
    );
  });

  it('routes refund.initiated events to the refund initiated handler', async () => {
    const event = buildEvent('refund.initiated', { id: 'evt-refund', retryCount: 2 });

    const result = await processor.process(event);

    expect(result.success).toBe(true);
    expect(result.message).toBe('refund.initiated event evt-refund processed');
    expect(result.processedAt).toBeInstanceOf(Date);
    expect(logSpy).toHaveBeenCalledWith(
      'Processing refund.initiated event',
      expect.objectContaining({ id: 'evt-refund', type: 'refund.initiated', retryCount: 2 })
    );
  });

  it('handles unknown event types without calling a known handler', async () => {
    const event = buildEvent('invoice.paid');

    const result = await processor.process(event);

    expect(result.success).toBe(false);
    expect(result.message).toBe('Unknown event type: invoice.paid');
    expect(result.processedAt).toBeInstanceOf(Date);
    expect(logSpy).toHaveBeenCalledWith(
      'Received unknown webhook event type',
      expect.objectContaining({ type: 'invoice.paid' })
    );
    expect(logSpy).not.toHaveBeenCalledWith(
      'Processing payment.completed event',
      expect.anything()
    );
  });

  it('defaults retryCount to 0 when the incoming event omits it', async () => {
    const event = buildEvent('payment.completed', { retryCount: undefined });

    await processor.process(event);

    expect(logSpy).toHaveBeenCalledWith(
      'Processing payment.completed event',
      expect.objectContaining({ retryCount: 0 })
    );
  });
});
