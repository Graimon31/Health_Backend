import React, { FormEvent, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

type HealthResponse = { status: string };

type LoginResponse = {
  access_token: string;
  refresh_token: string;
  user: { id: number; role: string; full_name: string };
};

function App() {
  const [health, setHealth] = useState<string>('loading...');
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('change_me_please');
  const [loginResult, setLoginResult] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/v1/health')
      .then((res) => res.json())
      .then((data: HealthResponse) => setHealth(data.status))
      .catch(() => setHealth('unavailable'));
  }, []);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setLoginResult('');

    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        setLoginResult(`Ошибка входа: HTTP ${response.status}`);
        return;
      }

      const data = (await response.json()) as LoginResponse;
      setLoginResult(`Успешно! Вы вошли как ${data.user.full_name} (${data.user.role}).`);
    } catch {
      setLoginResult('Ошибка сети. Проверьте, запущен ли контейнер и доступен ли API.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main style={{ fontFamily: 'Arial, sans-serif', padding: 24, maxWidth: 760, margin: '0 auto' }}>
      <h1 style={{ marginBottom: 8 }}>Health Doctor Panel</h1>
      <p style={{ color: '#444', marginTop: 0 }}>Теперь это не пустая заглушка: ниже есть живая проверка API и тест входа.</p>

      <section style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16, marginBottom: 16 }}>
        <h2 style={{ marginTop: 0, fontSize: 20 }}>Статус системы</h2>
        <p>
          Health API: <strong>{health}</strong>
        </p>
        <p style={{ marginBottom: 0 }}>
          Полезные ссылки: <a href="/api/docs">Swagger</a> · <a href="/api/v1/health">/api/v1/health</a>
        </p>
      </section>

      <section style={{ border: '1px solid #ddd', borderRadius: 8, padding: 16 }}>
        <h2 style={{ marginTop: 0, fontSize: 20 }}>Быстрый тест логина</h2>
        <form onSubmit={handleLogin} style={{ display: 'grid', gap: 12 }}>
          <label>
            Email
            <input
              style={{ display: 'block', width: '100%', marginTop: 6, padding: 8 }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label>
            Password
            <input
              type="password"
              style={{ display: 'block', width: '100%', marginTop: 6, padding: 8 }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <button type="submit" disabled={isSubmitting} style={{ padding: '10px 12px', cursor: 'pointer' }}>
            {isSubmitting ? 'Входим...' : 'Войти'}
          </button>
        </form>

        {loginResult ? <p style={{ marginTop: 12 }}>{loginResult}</p> : null}
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
