# Exercise 4 — Multi-Agent Pipeline Monorepo

Three-service TypeScript monorepo for the Cursor curriculum Exercise 4.

## Services

| Service | Directory | Port | Description |
|---------|-----------|------|-------------|
| API | `api/` | 3000 | Express REST API — receives incoming events |
| Worker | `worker/` | 3002 | Background job processor — processes events |
| Frontend | `frontend/` | 3003 | React SPA — displays event status |

## Setup

```bash
# Install all services
npm install --prefix api
npm install --prefix worker
npm install --prefix frontend

# Run all services (in separate terminals)
npm run dev --prefix api
npm run dev --prefix worker
npm run dev --prefix frontend

# Test all services
npm test --prefix api       # Should show: 4 passing
npm test --prefix worker    # Should show: 3 passing
npm test --prefix frontend  # Should show: 1 passing (placeholder)
```

## Your Exercise Goal

Add a `WebhookEvent` type across all three services simultaneously, using parallel agents in separate worktrees.

The `WebhookEvent` type:
```typescript
interface WebhookEvent {
  id: string;
  type: "payment.completed" | "payment.failed" | "refund.initiated";
  timestamp: Date;
  payload: Record<string, unknown>;
  source: string;
  retryCount: number;
}
```

Each service gets a TODO comment showing where to add the WebhookEvent support.

See `Reference Docs/Exercises/Ex4-Multi-Agent-Pipeline.md` for the complete exercise guide.

## Architecture

```
Client
  └── HTTP → api/ (POST /api/webhooks)
                └── Queue → worker/ (WebhookEventProcessor)
                              └── Results → frontend/ (WebhookEventList)
```
