// Existing processor — follow this pattern when adding WebhookEventProcessor
export interface ProcessResult {
  success: boolean;
  message: string;
  processedAt: Date;
}

export async function processPaymentInitiated(payload: {
  amount: number;
  currency: string;
  customerId: string;
}): Promise<ProcessResult> {
  // In production: validate, charge, update database, etc.
  console.log(`Processing payment: ${payload.amount} ${payload.currency} for ${payload.customerId}`);

  return {
    success: true,
    message: `Payment of ${payload.amount} ${payload.currency} processed`,
    processedAt: new Date(),
  };
}

// Webhook events are routed by WebhookEventProcessor in webhookEventProcessor.ts.
