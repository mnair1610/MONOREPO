# Frontend Components

The `frontend/` service is a React SPA, described in the root README as
"displays event status". This page documents `WebhookEventList` and the code it
depends on.

## `WebhookEventList`

`frontend/src/components/WebhookEventList.tsx`

A presentational component that renders webhook events as a table. It holds no
state and does no fetching.

```tsx
import { WebhookEventList } from './components/WebhookEventList';

<WebhookEventList events={events} />
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `events` | `WebhookEvent[]` | yes | Events to display, in the order given |

### Rendering

* **Empty list:** renders `<p>No webhook events</p>`.
* **Otherwise:** renders a full-width table with the columns below. Each row has
  `key={event.id}` and a `data-event-id={event.id}` attribute.

| Column | Source field | Formatting |
|--------|--------------|------------|
| Type | `event.type` | Bold and colored by type. The cell carries `data-event-type={event.type}`. |
| Source | `event.source` | Plain text |
| Timestamp | `event.timestamp` | `toISOString()`, so it must be a real `Date` |
| Retries | `event.retryCount` | Plain number |
| Payload | `event.payload` | `JSON.stringify(payload)`, or `—` for an empty object |

### Type colors

The component also exports `WEBHOOK_EVENT_TYPE_COLORS: Record<WebhookEventType, string>`:

| Type | Color |
|------|-------|
| `payment.completed` | `green` |
| `payment.failed` | `red` |
| `refund.initiated` | `orange` |

Styling is done with inline `React.CSSProperties`. Cells are left-aligned with
8px/12px padding and a `#e5e7eb` bottom border.

### Types

`frontend/src/types/webhookEvent.ts`:

```ts
type WebhookEventType = 'payment.completed' | 'payment.failed' | 'refund.initiated';
const DEFAULT_RETRY_COUNT = 0;

interface WebhookEvent extends BaseEvent {   // BaseEvent: id, timestamp: Date, source
  id: string;
  type: WebhookEventType;
  timestamp: Date;
  payload: Record<string, unknown>;
  source: string;
  retryCount: number;
}
```

## `useWebhookEvents`

`frontend/src/hooks/useWebhookEvents.ts`

A hook that loads the events to pass to `WebhookEventList`.

```ts
const { events, loading, error } = useWebhookEvents();
```

| Return field | Type | Description |
|--------------|------|-------------|
| `events` | `WebhookEvent[]` | Normalized events. Empty while loading or on error. |
| `loading` | `boolean` | `true` until the first request finishes |
| `error` | `string \| null` | Error message, or `null` |

Behavior:

* On mount it sends `fetch('/api/webhooks', { signal })`. Unmounting aborts the
  request, and state is not updated after an abort.
* A non-OK response sets `error` to `Request failed with status <status>`.
  Other failures use the error's message, or `Failed to load webhook events`.
* The body may be a bare array or `{ data: [...] }`.
* Each item is validated and normalized. Items are dropped silently if `id` or
  `source` is not a string, `type` is not a known `WebhookEventType`, or
  `timestamp` is not a parseable date. `timestamp` strings and numbers are
  converted to `Date`. A non-object `payload` becomes `{}`, and a missing
  `retryCount` becomes `0`.

> **API mismatch:** the hook issues a `GET /api/webhooks`, but the API service
> currently implements only `POST /api/webhooks` (see `api-spec.yaml`). Until a
> `GET` handler is added, the hook gets a 404 and `App` shows the error state.

## `App`

`frontend/src/App.tsx` renders the "Event Dashboard" page. It calls
`useWebhookEvents()` and shows one of:

| State | Output |
|-------|--------|
| `loading` | `<p>Loading webhook events…</p>` |
| `error` | `<p role="alert">{error}</p>` |
| otherwise | `<WebhookEventList events={events} />` |

## Tests

`frontend/tests/frontend.test.ts` covers `WebhookEventList` (renders events,
empty state, type colors) and `useWebhookEvents` (fetches `/api/webhooks`).
