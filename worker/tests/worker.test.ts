import { processPaymentInitiated } from '../src/processors/paymentProcessor';

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

  // Exercise 4: After implementing WebhookEventProcessor, add tests:
  // it('routes payment.completed events to correct handler', ...)
  // it('routes payment.failed events to correct handler', ...)
  // it('routes refund.initiated events to correct handler', ...)
});
