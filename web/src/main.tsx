import React, { useMemo, useState, useCallback } from 'react';
import { createRoot } from 'react-dom/client';

/* ─── Localization ─── */

type Lang = 'en' | 'ru';

const translations: Record<Lang, Record<string, string>> = {
  en: {
    dashboard: 'Dashboard',
    patients: 'Patients',
    chat: 'Chat',
    faq: 'FAQ',
    settings: 'Settings',
    searchPatients: 'Search patients...',
    totalPatients: 'Total Patients',
    alerts: 'Alerts',
    critical: 'Critical',
    unreadMessages: 'Unread Messages',
    recentMeasurements: 'Recent Measurements',
    alertsPanel: 'Alerts',
    recentActivity: 'Recent Activity',
    unreadChats: 'Unread Chats',
    quickActions: 'Quick Actions',
    addPatient: 'Add Patient',
    importProfile: 'Import Profile',
    exportProfile: 'Export Profile',
    active: 'Active',
    new: 'New',
    // Patients page
    patientList: 'Patient List',
    name: 'Name',
    age: 'Age',
    diagnosis: 'Diagnosis',
    status: 'Status',
    lastVisit: 'Last Visit',
    stable: 'Stable',
    monitoring: 'Monitoring',
    critical2: 'Critical',
    // Chat page
    conversations: 'Conversations',
    typeMessage: 'Type a message...',
    send: 'Send',
    online: 'Online',
    offline: 'Offline',
    // FAQ page
    faqTitle: 'Frequently Asked Questions',
    faq1q: 'How do I add a new patient?',
    faq1a: 'Go to the Patients section and click "Add Patient" button, then fill in the required information.',
    faq2q: 'How do I export patient data?',
    faq2a: 'Navigate to Quick Actions on the Dashboard and click "Export Profile". You can also export from the Patients page.',
    faq3q: 'How do I change the interface language?',
    faq3a: 'Click the language toggle (EN/RU) in the top header bar to switch between English and Russian.',
    faq4q: 'How do I reset my password?',
    faq4a: 'Go to Settings and find the "Change Password" section. Enter your current password and the new one.',
    faq5q: 'What do the alert levels mean?',
    faq5a: 'Critical — immediate attention needed. Active — ongoing monitoring required. Stable — within normal parameters.',
    // Settings page
    general: 'General',
    appearance: 'Appearance',
    notifications: 'Notifications',
    security: 'Security',
    language: 'Language',
    theme: 'Theme',
    lightTheme: 'Light',
    darkTheme: 'Dark',
    emailNotifications: 'Email Notifications',
    pushNotifications: 'Push Notifications',
    alertNotifications: 'Critical Alert Notifications',
    changePassword: 'Change Password',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm Password',
    save: 'Save',
    saved: 'Saved!',
    profileInfo: 'Profile Information',
    fullName: 'Full Name',
    email: 'Email',
    role: 'Role',
    doctor: 'Doctor',
  },
  ru: {
    dashboard: 'Главная',
    patients: 'Пациенты',
    chat: 'Чат',
    faq: 'ЧаВо',
    settings: 'Настройки',
    searchPatients: 'Поиск пациентов...',
    totalPatients: 'Всего пациентов',
    alerts: 'Тревоги',
    critical: 'Критических',
    unreadMessages: 'Непрочитанных',
    recentMeasurements: 'Последние измерения',
    alertsPanel: 'Тревоги',
    recentActivity: 'Последняя активность',
    unreadChats: 'Непрочитанные чаты',
    quickActions: 'Быстрые действия',
    addPatient: 'Добавить пациента',
    importProfile: 'Импорт профиля',
    exportProfile: 'Экспорт профиля',
    active: 'Активна',
    new: 'Новое',
    // Patients page
    patientList: 'Список пациентов',
    name: 'Имя',
    age: 'Возраст',
    diagnosis: 'Диагноз',
    status: 'Статус',
    lastVisit: 'Последний визит',
    stable: 'Стабильно',
    monitoring: 'Наблюдение',
    critical2: 'Критично',
    // Chat page
    conversations: 'Диалоги',
    typeMessage: 'Введите сообщение...',
    send: 'Отправить',
    online: 'Онлайн',
    offline: 'Оффлайн',
    // FAQ page
    faqTitle: 'Часто задаваемые вопросы',
    faq1q: 'Как добавить нового пациента?',
    faq1a: 'Перейдите в раздел "Пациенты" и нажмите кнопку "Добавить пациента", затем заполните необходимую информацию.',
    faq2q: 'Как экспортировать данные пациента?',
    faq2a: 'Перейдите в "Быстрые действия" на главной и нажмите "Экспорт профиля". Также можно экспортировать со страницы пациентов.',
    faq3q: 'Как изменить язык интерфейса?',
    faq3a: 'Нажмите переключатель языка (EN/RU) в верхней панели для переключения между английским и русским.',
    faq4q: 'Как сбросить пароль?',
    faq4a: 'Перейдите в "Настройки" и найдите раздел "Изменить пароль". Введите текущий и новый пароль.',
    faq5q: 'Что означают уровни тревог?',
    faq5a: 'Критично — требуется немедленное внимание. Активна — требуется наблюдение. Стабильно — в пределах нормы.',
    // Settings page
    general: 'Общие',
    appearance: 'Внешний вид',
    notifications: 'Уведомления',
    security: 'Безопасность',
    language: 'Язык',
    theme: 'Тема',
    lightTheme: 'Светлая',
    darkTheme: 'Тёмная',
    emailNotifications: 'Email-уведомления',
    pushNotifications: 'Push-уведомления',
    alertNotifications: 'Уведомления о критических тревогах',
    changePassword: 'Изменить пароль',
    currentPassword: 'Текущий пароль',
    newPassword: 'Новый пароль',
    confirmPassword: 'Подтвердите пароль',
    save: 'Сохранить',
    saved: 'Сохранено!',
    profileInfo: 'Информация профиля',
    fullName: 'Полное имя',
    email: 'Email',
    role: 'Роль',
    doctor: 'Врач',
  },
};

/* ─── Types ─── */

type MenuKey = 'dashboard' | 'patients' | 'chat' | 'faq' | 'settings';
type ThemeMode = 'light' | 'dark';

interface Colors {
  pageBg: string;
  shellBg: string;
  panel: string;
  panelStrong: string;
  text: string;
  textMuted: string;
  border: string;
  active: string;
  button: string;
  inputBg: string;
  danger: string;
}

/* ─── Helpers ─── */

function useColors(theme: ThemeMode): Colors {
  return useMemo(() => {
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
        inputBg: 'rgba(255,255,255,0.06)',
        danger: '#ef5350',
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
      inputBg: '#eef2f8',
      danger: '#ef5350',
    };
  }, [theme]);
}

/* ─── Reusable Components ─── */

function Panel({ title, colors, children }: { title: string; colors: Colors; children: React.ReactNode }) {
  return (
    <section style={{ background: colors.panel, border: `1px solid ${colors.border}`, borderRadius: 10, padding: 14 }}>
      <h2 style={{ margin: '0 0 8px 0', fontSize: 18, color: colors.text }}>{title}</h2>
      {children}
    </section>
  );
}

function Line({ text, badge }: { text: string; badge: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid rgba(120,140,170,0.22)' }}>
      <span>{text}</span>
      <span style={{ opacity: 0.75 }}>{badge}</span>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        width: 44, height: 24, borderRadius: 12, cursor: 'pointer',
        background: checked ? '#3678e9' : '#ccc',
        position: 'relative', transition: 'background 0.2s',
      }}
    >
      <div style={{
        width: 20, height: 20, borderRadius: 10, background: '#fff',
        position: 'absolute', top: 2, left: checked ? 22 : 2, transition: 'left 0.2s',
      }} />
    </div>
  );
}

/* ─── Page: Dashboard ─── */

function DashboardPage({ colors, t }: { colors: Colors; t: Record<string, string> }) {
  const kpiCards = [
    { title: t.totalPatients, value: '128' },
    { title: t.alerts, value: `5 ${t.critical}`, danger: true },
    { title: t.unreadMessages, value: '12' },
    { title: t.recentMeasurements, value: '122 / 81 mmHg' },
  ];

  return (
    <>
      <h1 style={{ marginTop: 0, marginBottom: 16 }}>{t.dashboard}</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(120px, 1fr))', gap: 12, marginBottom: 12 }}>
        {kpiCards.map((card) => (
          <div key={card.title} style={{ background: colors.panelStrong, border: `1px solid ${colors.border}`, borderRadius: 10, padding: 14 }}>
            <div style={{ color: colors.textMuted, fontSize: 14 }}>{card.title}</div>
            <div style={{ fontSize: 34, marginTop: 6, color: card.danger ? colors.danger : colors.text }}>{card.value}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Panel title={t.alertsPanel} colors={colors}>
          <Line text="John Doe - High Blood Pressure" badge={t.active} />
          <Line text="Anna Ivanova - High Heart Rate" badge={t.active} />
        </Panel>
        <Panel title={t.recentActivity} colors={colors}>
          <Line text="Appointment scheduled with Sarah Brown" badge={t.new} />
          <Line text="Patient feedback offer for Diree Morn" badge={t.new} />
        </Panel>
        <Panel title={t.unreadChats} colors={colors}>
          <Line text="John Doe" badge="5 min" />
          <Line text="Elena Petrova" badge="4 min" />
        </Panel>
        <Panel title={t.quickActions} colors={colors}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {[t.addPatient, t.importProfile, t.exportProfile].map((action) => (
              <button
                key={action}
                onClick={() => window.alert(`${action} clicked`)}
                style={{ border: 'none', borderRadius: 8, background: colors.button, color: '#fff', padding: '10px 8px', fontWeight: 600, cursor: 'pointer' }}
              >
                {action}
              </button>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}

/* ─── Page: Patients ─── */

const patientsData = [
  { name: 'John Doe', age: 45, diagnosis: 'Hypertension', status: 'stable', lastVisit: '2026-03-05' },
  { name: 'Anna Ivanova', age: 32, diagnosis: 'Tachycardia', status: 'critical', lastVisit: '2026-03-08' },
  { name: 'Sarah Brown', age: 58, diagnosis: 'Diabetes Type 2', status: 'monitoring', lastVisit: '2026-03-01' },
  { name: 'Elena Petrova', age: 27, diagnosis: 'Anemia', status: 'stable', lastVisit: '2026-02-28' },
  { name: 'Michael Chen', age: 63, diagnosis: 'Coronary Artery Disease', status: 'monitoring', lastVisit: '2026-03-07' },
  { name: 'Diree Morn', age: 41, diagnosis: 'Asthma', status: 'stable', lastVisit: '2026-03-03' },
];

function PatientsPage({ colors, t }: { colors: Colors; t: Record<string, string> }) {
  const [search, setSearch] = useState('');
  const filtered = patientsData.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const statusLabel = (s: string) => {
    if (s === 'stable') return t.stable;
    if (s === 'monitoring') return t.monitoring;
    return t.critical2;
  };
  const statusColor = (s: string) => {
    if (s === 'stable') return '#22c55e';
    if (s === 'monitoring') return '#f59e0b';
    return colors.danger;
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>{t.patientList}</h1>
        <button
          onClick={() => window.alert(`${t.addPatient} clicked`)}
          style={{ border: 'none', borderRadius: 8, background: colors.button, color: '#fff', padding: '10px 18px', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}
        >
          + {t.addPatient}
        </button>
      </div>
      <input
        placeholder={t.searchPatients}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.inputBg, color: colors.text, marginBottom: 16, boxSizing: 'border-box', outline: 'none' }}
      />
      <div style={{ background: colors.panel, border: `1px solid ${colors.border}`, borderRadius: 10, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${colors.border}`, textAlign: 'left' }}>
              {[t.name, t.age, t.diagnosis, t.status, t.lastVisit].map((h) => (
                <th key={h} style={{ padding: '12px 14px', color: colors.textMuted, fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.name} style={{ borderBottom: `1px solid ${colors.border}`, cursor: 'pointer' }}>
                <td style={{ padding: '12px 14px', fontWeight: 600 }}>{p.name}</td>
                <td style={{ padding: '12px 14px' }}>{p.age}</td>
                <td style={{ padding: '12px 14px' }}>{p.diagnosis}</td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ background: statusColor(p.status) + '22', color: statusColor(p.status), padding: '4px 10px', borderRadius: 6, fontWeight: 600, fontSize: 12 }}>
                    {statusLabel(p.status)}
                  </span>
                </td>
                <td style={{ padding: '12px 14px', color: colors.textMuted }}>{p.lastVisit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ─── Page: Chat ─── */

const chatContacts = [
  { name: 'John Doe', online: true, lastMsg: 'Doctor, my blood pressure is still high...', time: '5 min' },
  { name: 'Elena Petrova', online: true, lastMsg: 'Thank you for the prescription!', time: '4 min' },
  { name: 'Sarah Brown', online: false, lastMsg: 'When is my next appointment?', time: '2h' },
  { name: 'Michael Chen', online: false, lastMsg: 'I have the test results ready.', time: '1d' },
];

function ChatPage({ colors, t }: { colors: Colors; t: Record<string, string> }) {
  const [selected, setSelected] = useState(0);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ from: string; text: string }>>([
    { from: 'patient', text: chatContacts[0].lastMsg },
    { from: 'doctor', text: 'I see. Let me adjust your medication. Please measure again tomorrow morning.' },
    { from: 'patient', text: 'Okay, thank you doctor.' },
  ]);

  const handleSend = () => {
    if (!message.trim()) return;
    setMessages([...messages, { from: 'doctor', text: message }]);
    setMessage('');
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 0, height: 600, borderRadius: 10, overflow: 'hidden', border: `1px solid ${colors.border}` }}>
      <div style={{ background: colors.panelStrong, borderRight: `1px solid ${colors.border}`, overflowY: 'auto' }}>
        <div style={{ padding: '14px', fontWeight: 700, fontSize: 16, borderBottom: `1px solid ${colors.border}` }}>{t.conversations}</div>
        {chatContacts.map((c, i) => (
          <div
            key={c.name}
            onClick={() => setSelected(i)}
            style={{
              padding: '12px 14px', cursor: 'pointer', borderBottom: `1px solid ${colors.border}`,
              background: i === selected ? colors.active : 'transparent',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>{c.name}</span>
              <span style={{ fontSize: 11, color: colors.textMuted }}>{c.time}</span>
            </div>
            <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.lastMsg}</div>
            <span style={{ fontSize: 10, color: c.online ? '#22c55e' : colors.textMuted }}>{c.online ? t.online : t.offline}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', background: colors.panel }}>
        <div style={{ padding: '14px 18px', borderBottom: `1px solid ${colors.border}`, fontWeight: 700 }}>
          {chatContacts[selected].name}
          <span style={{ fontSize: 12, fontWeight: 400, marginLeft: 8, color: chatContacts[selected].online ? '#22c55e' : colors.textMuted }}>
            {chatContacts[selected].online ? t.online : t.offline}
          </span>
        </div>
        <div style={{ flex: 1, padding: '14px 18px', overflowY: 'auto' }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.from === 'doctor' ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
              <div style={{
                background: m.from === 'doctor' ? colors.button : colors.panelStrong,
                color: m.from === 'doctor' ? '#fff' : colors.text,
                padding: '10px 14px', borderRadius: 12, maxWidth: '70%', fontSize: 14, lineHeight: 1.5,
              }}>
                {m.text}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, padding: '12px 18px', borderTop: `1px solid ${colors.border}` }}>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t.typeMessage}
            style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.inputBg, color: colors.text, outline: 'none' }}
          />
          <button
            onClick={handleSend}
            style={{ border: 'none', borderRadius: 8, background: colors.button, color: '#fff', padding: '10px 18px', fontWeight: 600, cursor: 'pointer' }}
          >
            {t.send}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Page: FAQ ─── */

function FAQPage({ colors, t }: { colors: Colors; t: Record<string, string> }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const faqs = [
    { q: t.faq1q, a: t.faq1a },
    { q: t.faq2q, a: t.faq2a },
    { q: t.faq3q, a: t.faq3a },
    { q: t.faq4q, a: t.faq4a },
    { q: t.faq5q, a: t.faq5a },
  ];

  return (
    <>
      <h1 style={{ marginTop: 0, marginBottom: 20 }}>{t.faqTitle}</h1>
      {faqs.map((faq, i) => (
        <div key={i} style={{ background: colors.panel, border: `1px solid ${colors.border}`, borderRadius: 10, marginBottom: 10, overflow: 'hidden' }}>
          <div
            onClick={() => setOpenIdx(openIdx === i ? null : i)}
            style={{ padding: '14px 18px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600 }}
          >
            {faq.q}
            <span style={{ fontSize: 18, transform: openIdx === i ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>▼</span>
          </div>
          {openIdx === i && (
            <div style={{ padding: '0 18px 14px', color: colors.textMuted, lineHeight: 1.6 }}>
              {faq.a}
            </div>
          )}
        </div>
      ))}
    </>
  );
}

/* ─── Page: Settings ─── */

function SettingsPage({ colors, t, lang, setLang, theme, setTheme }: {
  colors: Colors; t: Record<string, string>;
  lang: Lang; setLang: (l: Lang) => void;
  theme: ThemeMode; setTheme: (t: ThemeMode) => void;
}) {
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [alertNotif, setAlertNotif] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const sectionStyle: React.CSSProperties = {
    background: colors.panel, border: `1px solid ${colors.border}`, borderRadius: 10, padding: 20, marginBottom: 16,
  };
  const labelRow: React.CSSProperties = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0',
    borderBottom: `1px solid ${colors.border}`,
  };

  return (
    <>
      <h1 style={{ marginTop: 0, marginBottom: 20 }}>{t.settings}</h1>

      {/* Profile */}
      <div style={sectionStyle}>
        <h3 style={{ margin: '0 0 12px' }}>{t.profileInfo}</h3>
        <div style={labelRow}>
          <span style={{ color: colors.textMuted }}>{t.fullName}</span>
          <span style={{ fontWeight: 600 }}>Dr. Smith</span>
        </div>
        <div style={labelRow}>
          <span style={{ color: colors.textMuted }}>{t.email}</span>
          <span style={{ fontWeight: 600 }}>admin@example.com</span>
        </div>
        <div style={{ ...labelRow, borderBottom: 'none' }}>
          <span style={{ color: colors.textMuted }}>{t.role}</span>
          <span style={{ fontWeight: 600 }}>{t.doctor}</span>
        </div>
      </div>

      {/* General */}
      <div style={sectionStyle}>
        <h3 style={{ margin: '0 0 12px' }}>{t.general}</h3>
        <div style={labelRow}>
          <span>{t.language}</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {(['en', 'ru'] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                style={{
                  border: `1px solid ${colors.border}`, borderRadius: 6, padding: '6px 14px', cursor: 'pointer',
                  background: lang === l ? colors.button : 'transparent',
                  color: lang === l ? '#fff' : colors.text, fontWeight: 600,
                }}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div style={{ ...labelRow, borderBottom: 'none' }}>
          <span>{t.theme}</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {(['light', 'dark'] as ThemeMode[]).map((tm) => (
              <button
                key={tm}
                onClick={() => setTheme(tm)}
                style={{
                  border: `1px solid ${colors.border}`, borderRadius: 6, padding: '6px 14px', cursor: 'pointer',
                  background: theme === tm ? colors.button : 'transparent',
                  color: theme === tm ? '#fff' : colors.text, fontWeight: 600,
                }}
              >
                {tm === 'light' ? t.lightTheme : t.darkTheme}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div style={sectionStyle}>
        <h3 style={{ margin: '0 0 12px' }}>{t.notifications}</h3>
        <div style={labelRow}><span>{t.emailNotifications}</span><Toggle checked={emailNotif} onChange={setEmailNotif} /></div>
        <div style={labelRow}><span>{t.pushNotifications}</span><Toggle checked={pushNotif} onChange={setPushNotif} /></div>
        <div style={{ ...labelRow, borderBottom: 'none' }}><span>{t.alertNotifications}</span><Toggle checked={alertNotif} onChange={setAlertNotif} /></div>
      </div>

      {/* Security */}
      <div style={sectionStyle}>
        <h3 style={{ margin: '0 0 12px' }}>{t.security}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input placeholder={t.currentPassword} type="password" style={{ padding: '10px 14px', borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.inputBg, color: colors.text, outline: 'none' }} />
          <input placeholder={t.newPassword} type="password" style={{ padding: '10px 14px', borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.inputBg, color: colors.text, outline: 'none' }} />
          <input placeholder={t.confirmPassword} type="password" style={{ padding: '10px 14px', borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.inputBg, color: colors.text, outline: 'none' }} />
        </div>
      </div>

      <button
        onClick={handleSave}
        style={{ border: 'none', borderRadius: 8, background: colors.button, color: '#fff', padding: '12px 32px', fontWeight: 600, cursor: 'pointer', fontSize: 15 }}
      >
        {saved ? t.saved : t.save}
      </button>
    </>
  );
}

/* ─── App Shell ─── */

function App() {
  const [activeMenu, setActiveMenu] = useState<MenuKey>('dashboard');
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [lang, setLang] = useState<Lang>('en');

  const colors = useColors(theme);
  const t = translations[lang];

  const menuItems: Array<{ key: MenuKey; label: string; icon: string }> = [
    { key: 'dashboard', label: t.dashboard, icon: '🏠' },
    { key: 'patients', label: t.patients, icon: '🧑‍⚕️' },
    { key: 'chat', label: t.chat, icon: '💬' },
    { key: 'faq', label: t.faq, icon: '❓' },
    { key: 'settings', label: t.settings, icon: '⚙️' },
  ];

  const renderPage = useCallback(() => {
    switch (activeMenu) {
      case 'dashboard': return <DashboardPage colors={colors} t={t} />;
      case 'patients': return <PatientsPage colors={colors} t={t} />;
      case 'chat': return <ChatPage colors={colors} t={t} />;
      case 'faq': return <FAQPage colors={colors} t={t} />;
      case 'settings': return <SettingsPage colors={colors} t={t} lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} />;
    }
  }, [activeMenu, colors, t, lang, theme]);

  return (
    <div style={{ background: colors.pageBg, minHeight: '100vh', padding: 28, boxSizing: 'border-box', fontFamily: 'Inter, Arial, sans-serif' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', borderRadius: 16, overflow: 'hidden', border: `1px solid ${colors.border}`, background: colors.shellBg, boxShadow: '0 20px 60px rgba(7,24,58,0.18)' }}>
        {/* Header */}
        <header style={{ height: 74, borderBottom: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: 16, padding: '0 18px', color: colors.text }}>
          <div style={{ fontWeight: 800, fontSize: 28, color: '#3b82f6' }}>✚</div>
          <div style={{ fontWeight: 700, minWidth: 130 }}>HealthCodex</div>
          <input
            aria-label="Search patients"
            placeholder={t.searchPatients}
            style={{ flex: 1, maxWidth: 520, borderRadius: 10, border: `1px solid ${colors.border}`, padding: '10px 12px', background: colors.inputBg, color: colors.text, outline: 'none' }}
          />
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            style={{ borderRadius: 10, border: `1px solid ${colors.border}`, background: colors.inputBg, color: colors.text, padding: '8px 10px', cursor: 'pointer' }}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button
            onClick={() => setLang(lang === 'en' ? 'ru' : 'en')}
            style={{ borderRadius: 10, border: `1px solid ${colors.border}`, background: colors.inputBg, color: colors.text, padding: '8px 12px', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}
          >
            {lang === 'en' ? 'RU' : 'EN'}
          </button>
          <span style={{ fontSize: 20 }}>🔔</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
            <span style={{ fontSize: 22 }}>👨‍⚕️</span>
            Dr. Smith
          </div>
        </header>

        {/* Body */}
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: 680 }}>
          {/* Sidebar */}
          <aside style={{ borderRight: `1px solid ${colors.border}`, padding: 12, color: colors.textMuted, display: 'flex', flexDirection: 'column' }}>
            {menuItems.map((item) => {
              const isActive = item.key === activeMenu;
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveMenu(item.key)}
                  style={{
                    textAlign: 'left', marginBottom: 8, border: 'none',
                    background: isActive ? colors.active : 'transparent',
                    color: isActive ? '#2d71df' : colors.textMuted,
                    borderRadius: 8, padding: '11px 12px', cursor: 'pointer',
                    fontWeight: isActive ? 700 : 600,
                  }}
                >
                  <span style={{ marginRight: 8 }}>{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </aside>

          {/* Main content */}
          <main style={{ padding: 22, color: colors.text, overflowY: 'auto' }}>
            {renderPage()}
          </main>
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
