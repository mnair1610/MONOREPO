import React from 'react';
import { WebhookEventList } from './components/WebhookEventList';
import { useWebhookEvents } from './hooks/useWebhookEvents';

function App(): React.ReactElement {
  const { events, loading, error } = useWebhookEvents();

  let body: React.ReactElement;
  if (loading) {
    body = <p>Loading webhook events…</p>;
  } else if (error) {
    body = <p role="alert">{error}</p>;
  } else {
    body = <WebhookEventList events={events} />;
  }

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
      <h1>Event Dashboard</h1>
      <p>Webhook events from the API.</p>
      {body}
    </div>
  );
}

export default App;
