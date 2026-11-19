import React from 'react';
import { WebhookEvent, WebhookEventType } from '../types/webhookEvent';

export const WEBHOOK_EVENT_TYPE_COLORS: Record<WebhookEventType, string> = {
  'payment.completed': 'green',
  'payment.failed': 'red',
  'refund.initiated': 'orange',
};

interface WebhookEventListProps {
  events: WebhookEvent[];
}

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
};

const cellStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '8px 12px',
  borderBottom: '1px solid #e5e7eb',
};

function formatPayload(payload: Record<string, unknown>): string {
  const keys = Object.keys(payload);
  if (keys.length === 0) {
    return '—';
  }
  return JSON.stringify(payload);
}

export function WebhookEventList({ events }: WebhookEventListProps): React.ReactElement {
  if (events.length === 0) {
    return <p>No webhook events</p>;
  }

  return (
    <table style={tableStyle}>
      <thead>
        <tr>
          <th style={cellStyle}>Type</th>
          <th style={cellStyle}>Source</th>
          <th style={cellStyle}>Timestamp</th>
          <th style={cellStyle}>Retries</th>
          <th style={cellStyle}>Payload</th>
        </tr>
      </thead>
      <tbody>
        {events.map((event) => {
          const typeColor = WEBHOOK_EVENT_TYPE_COLORS[event.type];
          return (
            <tr key={event.id} data-event-id={event.id}>
              <td
                style={{ ...cellStyle, color: typeColor, fontWeight: 600 }}
                data-event-type={event.type}
              >
                {event.type}
              </td>
              <td style={cellStyle}>{event.source}</td>
              <td style={cellStyle}>{event.timestamp.toISOString()}</td>
              <td style={cellStyle}>{event.retryCount}</td>
              <td style={cellStyle}>{formatPayload(event.payload)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
