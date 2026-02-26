import React from 'react';
import { createRoot } from 'react-dom/client';

function App() {
  return (
    <main style={{ fontFamily: 'Arial, sans-serif', padding: 24 }}>
      <h1>Health Doctor Panel</h1>
      <p>Frontend scaffold is ready.</p>
      <p>Backend health check: <code>/api/v1/health</code></p>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
