# Worker Service: Processors

The `worker/` service is a background job processor. `worker/src/index.ts`
instantiates a `WebhookEventProcessor`, logs startup messages and keeps the
process alive with a 30-second heartbeat interval.

> **Current state:** the worker is not yet connected to a queue or to the API.
> `index.ts` only constructs the processor; nothing calls `process()` outside
> the tests. The architecture diagram in the root README (`api/` -> queue ->
> `worker/`) describes the intended flow.

All processors return the shared `ProcessResult`:

```ts
interface ProcessResult {
  success: boolean;
  message: string;
  processedAt: Date;
}
```

## Processors

| Processor | File | Input | Purpose |
|-----------|------|-------|---------|
| `processPaymentInitiated` | `src/processors/paymentProcessor.ts` | `{ amount, currency, customerId }` | Pre-existing payment processor |
| `WebhookEventProcessor` | `src/processors/webhookEventProcessor.ts` | `IncomingWebhookEvent` | Routes webhook events to a handler by `type` |

### `processPaymentInitiated(payload)`

An async function (not a class). It logs
`Processing payment: <amount> <currency> for <customerId>` and always returns:

```ts
{ success: true, message: `Payment of ${amount} ${currency} processed`, processedAt: new Date() }
```

It has no event routing, and the code comments say a real implementation would
validate, charge and update a database.

### `WebhookEventProcessor`

```ts
const processor = new WebhookEventProcessor();
const result: ProcessResult = await processor.process(event);
```

#### Input: `IncomingWebhookEvent`

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | |
| `type` | `string` | A plain string, so unknown types can be rejected at runtime |
| `timestamp` | `Date` | |
| `payload` | `Record<string, unknown>` | |
| `source` | `string` | |
| `retryCount` | `number` (optional) | Defaults to `0` (`DEFAULT_RETRY_COUNT`) when omitted |

#### Event routing

`process(event)` works as follows:

1. It calls `isWebhookEventType(event.type)`. If the type is not known, it
   returns the result of `handleUnknownEvent`.
2. Otherwise it normalizes the event into a `WebhookEvent` with a typed `type`
   and `retryCount` defaulted to `0`.
3. It dispatches to the handler registered for that type in a
   `Record<WebhookEventType, handler>` map.

| `event.type` | Handler | `success` | `message` |
|--------------|---------|-----------|-----------|
| `payment.completed` | `handlePaymentCompleted` | `true` | `payment.completed event <id> processed` |
| `payment.failed` | `handlePaymentFailed` | `true` | `payment.failed event <id> processed` |
| `refund.initiated` | `handleRefundInitiated` | `true` | `refund.initiated event <id> processed` |
| anything else | `handleUnknownEvent` | `false` | `Unknown event type: <type>` |

Each known handler currently only logs `Processing <type> event` plus the event
and returns a success result. The handlers are stubs for real business logic.
`handleUnknownEvent` logs `Received unknown webhook event type`. It does not
throw.

Because the handler map is typed as `Record<WebhookEventType, ...>`, adding a
value to `WEBHOOK_EVENT_TYPES` fails to compile until a handler is registered.

#### Types (`src/types/webhookEvent.ts`)

```ts
const WEBHOOK_EVENT_TYPES = ['payment.completed', 'payment.failed', 'refund.initiated'] as const;
type WebhookEventType = (typeof WEBHOOK_EVENT_TYPES)[number];
const DEFAULT_RETRY_COUNT = 0;

interface WebhookEvent {
  id: string;
  type: WebhookEventType;
  timestamp: Date;
  payload: Record<string, unknown>;
  source: string;
  retryCount: number;
}

function isWebhookEventType(type: string): type is WebhookEventType;
```

This mirrors the API's `WebhookEvent`. The worker's copy has no `BaseEvent`
parent and no validation schema.

## Tests

`worker/tests/worker.test.ts` covers `processPaymentInitiated`, and
`WebhookEventProcessor` routing for each of the three types, unknown types, and
the `retryCount` default.
