(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

import React from 'react';
import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { WebhookEventList, WEBHOOK_EVENT_TYPE_COLORS } from '../src/components/WebhookEventList';
import { useWebhookEvents } from '../src/hooks/useWebhookEvents';
import { WebhookEvent } from '../src/types/webhookEvent';

const sampleEvents: WebhookEvent[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    type: 'payment.completed',
    timestamp: new Date('2024-06-01T12:00:00.000Z'),
    payload: { amount: 2500 },
    source: 'payments',
    retryCount: 0,
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    type: 'payment.failed',
    timestamp: new Date('2024-06-01T12:05:00.000Z'),
    payload: { reason: 'declined' },
    source: 'payments',
    retryCount: 2,
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    type: 'refund.initiated',
    timestamp: new Date('2024-06-01T12:10:00.000Z'),
    payload: {},
    source: 'billing',
    retryCount: 1,
  },
];

function render(element: React.ReactElement): { container: HTMLDivElement; root: Root } {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(element);
  });
  return { container, root };
}

describe('WebhookEventList', () => {
  let root: Root | null = null;

  afterEach(() => {
    act(() => {
      root?.unmount();
    });
    root = null;
    document.body.innerHTML = '';
  });

  it('renders events', () => {
    const view = render(React.createElement(WebhookEventList, { events: sampleEvents }));
    root = view.root;

    expect(view.container.querySelectorAll('tbody tr')).toHaveLength(sampleEvents.length);
    expect(view.container.textContent).toContain('payment.completed');
    expect(view.container.textContent).toContain('payment.failed');
    expect(view.container.textContent).toContain('refund.initiated');
    expect(view.container.textContent).toContain('payments');
    expect(view.container.textContent).toContain('billing');
    expect(view.container.textContent).toContain('2');
  });

  it('handles empty state', () => {
    const view = render(React.createElement(WebhookEventList, { events: [] }));
    root = view.root;

    expect(view.container.textContent).toContain('No webhook events');
    expect(view.container.querySelector('table')).toBeNull();
  });

  it('shows correct type colors', () => {
    const view = render(React.createElement(WebhookEventList, { events: sampleEvents }));
    root = view.root;

    for (const event of sampleEvents) {
      const cell = view.container.querySelector(`[data-event-type="${event.type}"]`) as HTMLElement | null;
      expect(cell).not.toBeNull();
      expect(cell?.textContent).toBe(event.type);
      expect(cell?.style.color).toBe(WEBHOOK_EVENT_TYPE_COLORS[event.type]);
    }

    expect(WEBHOOK_EVENT_TYPE_COLORS['payment.completed']).toBe('green');
    expect(WEBHOOK_EVENT_TYPE_COLORS['payment.failed']).toBe('red');
    expect(WEBHOOK_EVENT_TYPE_COLORS['refund.initiated']).toBe('orange');
  });
});

function HookProbe(): React.ReactElement {
  const { events, loading, error } = useWebhookEvents();
  if (loading) {
    return React.createElement('p', null, 'loading');
  }
  if (error) {
    return React.createElement('p', null, error);
  }
  return React.createElement('p', null, events.map((event) => event.type).join(','));
}

describe('useWebhookEvents', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    document.body.innerHTML = '';
  });

  it('fetches from /api/webhooks', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [
          {
            id: '44444444-4444-4444-4444-444444444444',
            type: 'payment.completed',
            timestamp: '2024-06-02T00:00:00.000Z',
            source: 'api',
            payload: { amount: 10 },
          },
        ],
      }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(React.createElement(HookProbe));
    });

    expect(fetchMock).toHaveBeenCalledWith('/api/webhooks', expect.anything());
    expect(container.textContent).toContain('payment.completed');
    expect(container.textContent).not.toContain('loading');

    await act(async () => {
      root.unmount();
    });
  });
});
