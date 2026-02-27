import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';

type MenuKey = 'dashboard' | 'patients' | 'chat' | 'faq' | 'settings';

type ThemeMode = 'light' | 'dark';

const menuItems: Array<{ key: MenuKey; label: string; icon: string }> = [
  { key: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { key: 'patients', label: 'Patients', icon: '🧑‍⚕️' },
  { key: 'chat', label: 'Chat', icon: '💬' },
  { key: 'faq', label: 'FAQ', icon: '❓' },
  { key: 'settings', label: 'Settings', icon: '⚙️' },
];

const kpiCards = [
  { title: 'Total Patients', value: '128' },
  { title: 'Alerts', value: '5 Critical', danger: true },
  { title: 'Unread Messages', value: '12' },
  { title: 'Recent Measurements', value: '122 / 81 mmHg' },
];

function App() {
  const [activeMenu, setActiveMenu] = useState<MenuKey>('dashboard');
  const [theme, setTheme] = useState<ThemeMode>('light');

  const colors = useMemo(() => {
    if (theme === 'dark') {
      return {
        pageBg: '#d9dde7',
        shellBg: 'linear-gradient(125deg, #13254b 0%, #101f3f 55%, #1d3f77 100%)',
        panel: 'rgba(20, 36, 67, 0.86)',
        panelStrong: 'rgba(27, 50, 90, 0.95)',
        text: '#e8eefc',
        textMuted: '#aab8d9',
        border: 'rgba(255,255,255,0.1)',
        active: '#1f67d8',
        button: '#2f76e7',
      };
    }

    return {
      pageBg: '#e7ebf2',
      shellBg: '#f6f8fc',
      panel: '#ffffff',
      panelStrong: '#ffffff',
      text: '#22314d',
      textMuted: '#6f7f99',
      border: '#e6ebf4',
      active: '#e8f1ff',
      button: '#3678e9',
    };
  }, [theme]);

  return (
    <div
      style={{
        background: colors.pageBg,
        minHeight: '100vh',
        padding: 28,
        boxSizing: 'border-box',
        fontFamily: 'Inter, Arial, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          borderRadius: 16,
          overflow: 'hidden',
          border: `1px solid ${colors.border}`,
          background: colors.shellBg,
          boxShadow: '0 20px 60px rgba(7, 24, 58, 0.18)',
        }}
      >
        <header
          style={{
            height: 74,
            borderBottom: `1px solid ${colors.border}`,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '0 18px',
            color: colors.text,
          }}
        >
          <div style={{ fontWeight: 800, fontSize: 28, color: '#3b82f6' }}>✚</div>
          <div style={{ fontWeight: 700, minWidth: 130 }}>HealthCodex</div>
          <input
            aria-label="Search patients"
            placeholder="Search patients..."
            style={{
              flex: 1,
              maxWidth: 520,
              borderRadius: 10,
              border: `1px solid ${colors.border}`,
              padding: '10px 12px',
              background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : '#eef2f8',
              color: colors.text,
              outline: 'none',
            }}
          />
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            style={{
              borderRadius: 10,
              border: `1px solid ${colors.border}`,
              background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : '#fff',
              color: colors.text,
              padding: '8px 10px',
              cursor: 'pointer',
            }}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <span style={{ fontSize: 20 }}>🔔</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
            <span style={{ fontSize: 22 }}>👨‍⚕️</span>
            Dr. Smith
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: 680 }}>
          <aside
            style={{
              borderRight: `1px solid ${colors.border}`,
              padding: 12,
              color: colors.textMuted,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {menuItems.map((item) => {
              const active = item.key === activeMenu;
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveMenu(item.key)}
                  style={{
                    textAlign: 'left',
                    marginBottom: 8,
                    border: 'none',
                    background: active ? colors.active : 'transparent',
                    color: active ? '#2d71df' : colors.textMuted,
                    borderRadius: 8,
                    padding: '11px 12px',
                    cursor: 'pointer',
                    fontWeight: active ? 700 : 600,
                  }}
                >
                  <span style={{ marginRight: 8 }}>{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
            <div style={{ marginTop: 'auto', padding: '8px 10px', borderTop: `1px solid ${colors.border}` }}>⚙️ Settings</div>
          </aside>

          <main style={{ padding: 22, color: colors.text }}>
            <h1 style={{ marginTop: 0, marginBottom: 16 }}>Dashboard</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(120px, 1fr))', gap: 12, marginBottom: 12 }}>
              {kpiCards.map((card) => (
                <div
                  key={card.title}
                  style={{
                    background: colors.panelStrong,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 10,
                    padding: 14,
                  }}
                >
                  <div style={{ color: colors.textMuted, fontSize: 14 }}>{card.title}</div>
                  <div style={{ fontSize: 34, marginTop: 6, color: card.danger ? '#ef5350' : colors.text }}>{card.value}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Panel title="Alerts" colors={colors}>
                <Line text="John Doe - High Blood Pressure" badge="Active" />
                <Line text="Anna Ivanova - High Heart Rate" badge="Active" />
              </Panel>

              <Panel title="Recent Activity" colors={colors}>
                <Line text="Appointment scheduled with Sarah Brown" badge="New" />
                <Line text="Patient feedback offer for Diree Morn" badge="New" />
              </Panel>

              <Panel title="Unread Chats" colors={colors}>
                <Line text="John Doe" badge="5 min" />
                <Line text="Elena Petrova" badge="4 min" />
              </Panel>

              <Panel title="Quick Actions" colors={colors}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {['Add Patient', 'Import Profile', 'Export Profile'].map((action) => (
                    <button
                      key={action}
                      onClick={() => window.alert(`${action} clicked`)}
                      style={{
                        border: 'none',
                        borderRadius: 8,
                        background: colors.button,
                        color: '#fff',
                        padding: '10px 8px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </Panel>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function Panel({
  title,
  colors,
  children,
}: {
  title: string;
  colors: { panel: string; border: string; text: string };
  children: React.ReactNode;
}) {
  return (
    <section style={{ background: colors.panel, border: `1px solid ${colors.border}`, borderRadius: 10, padding: 14 }}>
      <h2 style={{ margin: '0 0 8px 0', fontSize: 18, color: colors.text }}>{title}</h2>
      {children}
    </section>
  );
}

function Line({ text, badge }: { text: string; badge: string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '9px 0',
        borderBottom: '1px solid rgba(120, 140, 170, 0.22)',
      }}
    >
      <span>{text}</span>
      <span style={{ opacity: 0.75 }}>{badge}</span>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
