import React, { useMemo, useState, useCallback, useRef } from 'react';
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
    patientList: 'Patient List',
    name: 'Name',
    age: 'Age',
    diagnosis: 'Diagnosis',
    status: 'Status',
    lastVisit: 'Last Visit',
    stable: 'Stable',
    monitoring: 'Monitoring',
    critical2: 'Critical',
    conversations: 'Conversations',
    typeMessage: 'Type a message...',
    send: 'Send',
    online: 'Online',
    offline: 'Offline',
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
    // Patient profile
    patientProfile: 'Patient Profile',
    back: 'Back',
    personalInfo: 'Personal Information',
    dateOfBirth: 'Date of Birth',
    gender: 'Gender',
    phone: 'Phone',
    address: 'Address',
    bloodType: 'Blood Type',
    allergies: 'Allergies',
    healthMetrics: 'Health Metrics',
    bloodPressure: 'Blood Pressure',
    heartRate: 'Heart Rate',
    weight: 'Weight',
    height: 'Height',
    temperature: 'Temperature',
    oxygenSat: 'Oxygen Saturation',
    bmi: 'BMI',
    glucose: 'Glucose',
    forecast: 'Health Forecast (6 months)',
    bpTrend: 'Blood Pressure Trend',
    hrTrend: 'Heart Rate Trend',
    visitHistory: 'Visit History',
    date: 'Date',
    doctor2: 'Doctor',
    notes: 'Notes',
    male: 'Male',
    female: 'Female',
    medications: 'Current Medications',
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
    patientList: 'Список пациентов',
    name: 'Имя',
    age: 'Возраст',
    diagnosis: 'Диагноз',
    status: 'Статус',
    lastVisit: 'Последний визит',
    stable: 'Стабильно',
    monitoring: 'Наблюдение',
    critical2: 'Критично',
    conversations: 'Диалоги',
    typeMessage: 'Введите сообщение...',
    send: 'Отправить',
    online: 'Онлайн',
    offline: 'Оффлайн',
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
    // Patient profile
    patientProfile: 'Профиль пациента',
    back: 'Назад',
    personalInfo: 'Личная информация',
    dateOfBirth: 'Дата рождения',
    gender: 'Пол',
    phone: 'Телефон',
    address: 'Адрес',
    bloodType: 'Группа крови',
    allergies: 'Аллергии',
    healthMetrics: 'Показатели здоровья',
    bloodPressure: 'Давление',
    heartRate: 'Пульс',
    weight: 'Вес',
    height: 'Рост',
    temperature: 'Температура',
    oxygenSat: 'Сатурация O2',
    bmi: 'ИМТ',
    glucose: 'Глюкоза',
    forecast: 'Прогноз здоровья (6 месяцев)',
    bpTrend: 'Тренд давления',
    hrTrend: 'Тренд пульса',
    visitHistory: 'История визитов',
    date: 'Дата',
    doctor2: 'Врач',
    notes: 'Заметки',
    male: 'Мужской',
    female: 'Женский',
    medications: 'Текущие препараты',
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

interface PatientFull {
  id: number;
  name: string;
  age: number;
  diagnosis: string;
  diagnosisRu: string;
  status: string;
  lastVisit: string;
  dob: string;
  gender: 'male' | 'female';
  phone: string;
  address: string;
  bloodType: string;
  allergies: string;
  allergiesRu: string;
  weight: number;
  height: number;
  temperature: number;
  oxygenSat: number;
  bmi: number;
  glucose: number;
  medications: string[];
  medicationsRu: string[];
  bpHistory: number[];
  hrHistory: number[];
  visits: Array<{ date: string; doctor: string; notes: string; notesRu: string }>;
}

/* ─── Patient Data ─── */

const patientsData: PatientFull[] = [
  {
    id: 1, name: 'John Doe', age: 45, diagnosis: 'Hypertension', diagnosisRu: 'Гипертония', status: 'stable', lastVisit: '2026-03-05',
    dob: '1981-06-15', gender: 'male', phone: '+1 (555) 123-4567', address: '42 Elm Street, New York, NY',
    bloodType: 'A+', allergies: 'Penicillin', allergiesRu: 'Пенициллин', weight: 82, height: 178, temperature: 36.6, oxygenSat: 98, bmi: 25.9, glucose: 5.4,
    medications: ['Lisinopril 10mg', 'Amlodipine 5mg', 'Aspirin 81mg'],
    medicationsRu: ['Лизиноприл 10мг', 'Амлодипин 5мг', 'Аспирин 81мг'],
    bpHistory: [145, 142, 138, 135, 130, 128, 125, 122, 120, 118, 119, 117],
    hrHistory: [78, 76, 80, 74, 72, 75, 70, 68, 72, 70, 69, 68],
    visits: [
      { date: '2026-03-05', doctor: 'Dr. Smith', notes: 'BP improved. Continue current medication.', notesRu: 'Давление улучшилось. Продолжить текущее лечение.' },
      { date: '2026-02-10', doctor: 'Dr. Smith', notes: 'Adjusted Amlodipine dosage to 5mg.', notesRu: 'Скорректирована доза Амлодипина до 5мг.' },
      { date: '2026-01-15', doctor: 'Dr. Lee', notes: 'Initial diagnosis. Started Lisinopril.', notesRu: 'Первичный диагноз. Назначен Лизиноприл.' },
    ],
  },
  {
    id: 2, name: 'Anna Ivanova', age: 32, diagnosis: 'Tachycardia', diagnosisRu: 'Тахикардия', status: 'critical', lastVisit: '2026-03-08',
    dob: '1994-02-20', gender: 'female', phone: '+7 (916) 234-5678', address: 'ул. Тверская 12, Москва',
    bloodType: 'B-', allergies: 'None', allergiesRu: 'Нет', weight: 58, height: 165, temperature: 37.1, oxygenSat: 96, bmi: 21.3, glucose: 4.8,
    medications: ['Metoprolol 50mg', 'Magnesium 400mg'],
    medicationsRu: ['Метопролол 50мг', 'Магний 400мг'],
    bpHistory: [120, 125, 128, 132, 130, 135, 138, 140, 137, 134, 132, 130],
    hrHistory: [110, 108, 112, 105, 115, 120, 118, 108, 105, 100, 98, 95],
    visits: [
      { date: '2026-03-08', doctor: 'Dr. Smith', notes: 'HR elevated. Increased Metoprolol.', notesRu: 'Пульс учащён. Увеличена доза Метопролола.' },
      { date: '2026-02-20', doctor: 'Dr. Kim', notes: 'ECG shows sinus tachycardia.', notesRu: 'ЭКГ показала синусовую тахикардию.' },
    ],
  },
  {
    id: 3, name: 'Sarah Brown', age: 58, diagnosis: 'Diabetes Type 2', diagnosisRu: 'Сахарный диабет 2 типа', status: 'monitoring', lastVisit: '2026-03-01',
    dob: '1968-11-03', gender: 'female', phone: '+1 (555) 987-6543', address: '88 Oak Ave, Chicago, IL',
    bloodType: 'O+', allergies: 'Sulfa drugs', allergiesRu: 'Сульфаниламиды', weight: 75, height: 162, temperature: 36.5, oxygenSat: 97, bmi: 28.6, glucose: 7.2,
    medications: ['Metformin 1000mg', 'Glimepiride 2mg', 'Atorvastatin 20mg'],
    medicationsRu: ['Метформин 1000мг', 'Глимепирид 2мг', 'Аторвастатин 20мг'],
    bpHistory: [130, 128, 132, 135, 130, 128, 125, 127, 124, 122, 120, 118],
    hrHistory: [72, 74, 70, 68, 72, 76, 74, 70, 68, 70, 72, 70],
    visits: [
      { date: '2026-03-01', doctor: 'Dr. Smith', notes: 'HbA1c: 7.1%. Adjust Metformin.', notesRu: 'HbA1c: 7,1%. Скорректировать дозу Метформина.' },
      { date: '2026-01-25', doctor: 'Dr. Smith', notes: 'Glucose trending up. Added Glimepiride.', notesRu: 'Глюкоза растёт. Добавлен Глимепирид.' },
    ],
  },
  {
    id: 4, name: 'Elena Petrova', age: 27, diagnosis: 'Anemia', diagnosisRu: 'Анемия', status: 'stable', lastVisit: '2026-02-28',
    dob: '1999-07-10', gender: 'female', phone: '+7 (903) 111-2233', address: 'ул. Ленина 5, Санкт-Петербург',
    bloodType: 'AB+', allergies: 'None', allergiesRu: 'Нет', weight: 52, height: 170, temperature: 36.4, oxygenSat: 99, bmi: 18.0, glucose: 4.5,
    medications: ['Ferrous sulfate 325mg', 'Vitamin C 500mg', 'Folic acid 1mg'],
    medicationsRu: ['Сульфат железа 325мг', 'Витамин C 500мг', 'Фолиевая кислота 1мг'],
    bpHistory: [110, 112, 108, 110, 112, 115, 113, 110, 112, 114, 112, 110],
    hrHistory: [82, 80, 84, 78, 76, 80, 78, 76, 74, 76, 74, 72],
    visits: [
      { date: '2026-02-28', doctor: 'Dr. Smith', notes: 'Hemoglobin rising — 11.2 g/dL. Continue iron.', notesRu: 'Гемоглобин растёт — 11,2 г/дл. Продолжить приём железа.' },
      { date: '2026-01-30', doctor: 'Dr. Lee', notes: 'Hemoglobin 9.8 g/dL. Started iron therapy.', notesRu: 'Гемоглобин 9,8 г/дл. Начата терапия железом.' },
    ],
  },
  {
    id: 5, name: 'Michael Chen', age: 63, diagnosis: 'Coronary Artery Disease', diagnosisRu: 'Ишемическая болезнь сердца', status: 'monitoring', lastVisit: '2026-03-07',
    dob: '1963-04-22', gender: 'male', phone: '+1 (555) 456-7890', address: '15 Pine Rd, San Francisco, CA',
    bloodType: 'O-', allergies: 'Ibuprofen', allergiesRu: 'Ибупрофен', weight: 88, height: 175, temperature: 36.7, oxygenSat: 95, bmi: 28.7, glucose: 6.1,
    medications: ['Clopidogrel 75mg', 'Atorvastatin 40mg', 'Metoprolol 25mg', 'Aspirin 81mg'],
    medicationsRu: ['Клопидогрел 75мг', 'Аторвастатин 40мг', 'Метопролол 25мг', 'Аспирин 81мг'],
    bpHistory: [150, 148, 145, 140, 138, 135, 132, 130, 128, 126, 124, 122],
    hrHistory: [68, 70, 66, 64, 68, 72, 70, 66, 64, 66, 64, 62],
    visits: [
      { date: '2026-03-07', doctor: 'Dr. Smith', notes: 'Stress test negative. Continue monitoring.', notesRu: 'Нагрузочный тест отрицательный. Продолжить наблюдение.' },
      { date: '2026-02-15', doctor: 'Dr. Kim', notes: 'Echocardiogram: EF 55%. Stable.', notesRu: 'ЭхоКГ: ФВ 55%. Стабильно.' },
      { date: '2026-01-10', doctor: 'Dr. Smith', notes: 'Post-stent follow-up. Doing well.', notesRu: 'Контроль после стентирования. Состояние хорошее.' },
    ],
  },
  {
    id: 6, name: 'Diree Morn', age: 41, diagnosis: 'Asthma', diagnosisRu: 'Бронхиальная астма', status: 'stable', lastVisit: '2026-03-03',
    dob: '1985-09-18', gender: 'male', phone: '+1 (555) 321-0987', address: '7 Maple Ln, Austin, TX',
    bloodType: 'A-', allergies: 'Dust, Pollen', allergiesRu: 'Пыль, Пыльца', weight: 76, height: 180, temperature: 36.5, oxygenSat: 97, bmi: 23.5, glucose: 5.0,
    medications: ['Fluticasone inhaler', 'Salbutamol PRN', 'Montelukast 10mg'],
    medicationsRu: ['Флутиказон ингалятор', 'Сальбутамол по требованию', 'Монтелукаст 10мг'],
    bpHistory: [118, 120, 116, 118, 120, 122, 118, 116, 118, 120, 118, 116],
    hrHistory: [74, 72, 76, 70, 72, 74, 70, 68, 72, 70, 68, 70],
    visits: [
      { date: '2026-03-03', doctor: 'Dr. Smith', notes: 'Spirometry stable. No exacerbations.', notesRu: 'Спирометрия стабильная. Обострений нет.' },
      { date: '2026-01-20', doctor: 'Dr. Lee', notes: 'Seasonal allergy flare. Added Montelukast.', notesRu: 'Сезонное обострение аллергии. Добавлен Монтелукаст.' },
    ],
  },
];

/* ─── Helpers ─── */

function useColors(theme: ThemeMode): Colors {
  return useMemo(() => {
    if (theme === 'dark') {
      return {
        pageBg: '#0f172a',
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

function MetricCard({ label, value, unit, color, colors }: { label: string; value: string; unit: string; color?: string; colors: Colors }) {
  return (
    <div style={{ background: colors.panelStrong, border: `1px solid ${colors.border}`, borderRadius: 10, padding: '14px 16px' }}>
      <div style={{ color: colors.textMuted, fontSize: 12, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: color || colors.text }}>{value}</div>
      <div style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>{unit}</div>
    </div>
  );
}

/* ─── SVG Chart Component ─── */

function LineChart({ data1, data2, label1, label2, colors, months }: {
  data1: number[]; data2: number[]; label1: string; label2: string; colors: Colors; months: string[];
}) {
  const W = 700;
  const H = 220;
  const padL = 45;
  const padR = 15;
  const padT = 20;
  const padB = 35;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  const allVals = [...data1, ...data2];
  const minV = Math.min(...allVals) - 5;
  const maxV = Math.max(...allVals) + 5;
  const range = maxV - minV || 1;

  const toX = (i: number) => padL + (i / (data1.length - 1)) * chartW;
  const toY = (v: number) => padT + chartH - ((v - minV) / range) * chartH;

  const path = (data: number[]) => data.map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(' ');

  const gridLines = 5;
  const gridVals = Array.from({ length: gridLines }, (_, i) => minV + (range / (gridLines - 1)) * i);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', maxHeight: 260 }}>
      {/* Grid */}
      {gridVals.map((v) => (
        <g key={v}>
          <line x1={padL} x2={W - padR} y1={toY(v)} y2={toY(v)} stroke={colors.border} strokeWidth={1} />
          <text x={padL - 6} y={toY(v) + 4} textAnchor="end" fontSize={11} fill={colors.textMuted}>{Math.round(v)}</text>
        </g>
      ))}
      {/* X labels */}
      {months.map((m, i) => {
        const idx = Math.round((i / (months.length - 1)) * (data1.length - 1));
        return <text key={m} x={toX(idx)} y={H - 8} textAnchor="middle" fontSize={11} fill={colors.textMuted}>{m}</text>;
      })}
      {/* Lines */}
      <path d={path(data1)} fill="none" stroke="#3678e9" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      <path d={path(data2)} fill="none" stroke="#ef5350" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      {/* Dots */}
      {data1.map((v, i) => <circle key={`a${i}`} cx={toX(i)} cy={toY(v)} r={3.5} fill="#3678e9" />)}
      {data2.map((v, i) => <circle key={`b${i}`} cx={toX(i)} cy={toY(v)} r={3.5} fill="#ef5350" />)}
      {/* Legend */}
      <rect x={padL + 10} y={4} width={12} height={12} rx={3} fill="#3678e9" />
      <text x={padL + 26} y={14} fontSize={12} fill={colors.text}>{label1}</text>
      <rect x={padL + 170} y={4} width={12} height={12} rx={3} fill="#ef5350" />
      <text x={padL + 186} y={14} fontSize={12} fill={colors.text}>{label2}</text>
    </svg>
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(140px, 1fr))', gap: 14, marginBottom: 14 }}>
        {kpiCards.map((card) => (
          <div key={card.title} style={{ background: colors.panelStrong, border: `1px solid ${colors.border}`, borderRadius: 10, padding: 18 }}>
            <div style={{ color: colors.textMuted, fontSize: 14 }}>{card.title}</div>
            <div style={{ fontSize: 34, marginTop: 6, color: card.danger ? colors.danger : colors.text }}>{card.value}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
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
              <button key={action} onClick={() => window.alert(`${action} clicked`)} style={{ border: 'none', borderRadius: 8, background: colors.button, color: '#fff', padding: '10px 8px', fontWeight: 600, cursor: 'pointer' }}>
                {action}
              </button>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}

/* ─── Page: Patient Profile ─── */

function PatientProfilePage({ patient, colors, t, lang, onBack }: { patient: PatientFull; colors: Colors; t: Record<string, string>; lang: Lang; onBack: () => void }) {
  const statusLabel = (s: string) => s === 'stable' ? t.stable : s === 'monitoring' ? t.monitoring : t.critical2;
  const statusColor = (s: string) => s === 'stable' ? '#22c55e' : s === 'monitoring' ? '#f59e0b' : colors.danger;

  const months = lang === 'ru'
    ? ['Окт', 'Ноя', 'Дек', 'Янв', 'Фев', 'Мар']
    : ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
  const diagnosis = lang === 'ru' ? patient.diagnosisRu : patient.diagnosis;
  const allergies = lang === 'ru' ? patient.allergiesRu : patient.allergies;
  const medications = lang === 'ru' ? patient.medicationsRu : patient.medications;
  const infoRow: React.CSSProperties = {
    display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${colors.border}`,
  };

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={onBack} style={{ border: `1px solid ${colors.border}`, borderRadius: 8, background: 'transparent', color: colors.text, padding: '8px 16px', cursor: 'pointer', fontWeight: 600 }}>
          ← {t.back}
        </button>
        <h1 style={{ margin: 0 }}>{t.patientProfile}</h1>
      </div>

      {/* Top summary card */}
      <div style={{ background: colors.panel, border: `1px solid ${colors.border}`, borderRadius: 12, padding: 24, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 24 }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: colors.button, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, color: '#fff', fontWeight: 700, flexShrink: 0 }}>
          {patient.name.split(' ').map((n) => n[0]).join('')}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{patient.name}</div>
          <div style={{ color: colors.textMuted, marginBottom: 8 }}>{diagnosis} · {patient.age} {t.age.toLowerCase()}</div>
          <span style={{ background: statusColor(patient.status) + '22', color: statusColor(patient.status), padding: '4px 12px', borderRadius: 6, fontWeight: 600, fontSize: 13 }}>
            {statusLabel(patient.status)}
          </span>
        </div>
        <div style={{ textAlign: 'right', color: colors.textMuted, fontSize: 14 }}>
          <div>{t.lastVisit}: <strong style={{ color: colors.text }}>{patient.lastVisit}</strong></div>
          <div style={{ marginTop: 4 }}>{t.bloodType}: <strong style={{ color: colors.text }}>{patient.bloodType}</strong></div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Personal Info */}
        <div style={{ background: colors.panel, border: `1px solid ${colors.border}`, borderRadius: 12, padding: 20 }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 16 }}>{t.personalInfo}</h3>
          <div style={infoRow}><span style={{ color: colors.textMuted }}>{t.dateOfBirth}</span><span>{patient.dob}</span></div>
          <div style={infoRow}><span style={{ color: colors.textMuted }}>{t.gender}</span><span>{patient.gender === 'male' ? t.male : t.female}</span></div>
          <div style={infoRow}><span style={{ color: colors.textMuted }}>{t.phone}</span><span>{patient.phone}</span></div>
          <div style={infoRow}><span style={{ color: colors.textMuted }}>{t.address}</span><span style={{ textAlign: 'right', maxWidth: 200 }}>{patient.address}</span></div>
          <div style={infoRow}><span style={{ color: colors.textMuted }}>{t.bloodType}</span><span>{patient.bloodType}</span></div>
          <div style={{ ...infoRow, borderBottom: 'none' }}><span style={{ color: colors.textMuted }}>{t.allergies}</span><span style={{ color: patient.allergies !== 'None' ? colors.danger : colors.text }}>{allergies}</span></div>
        </div>

        {/* Medications */}
        <div style={{ background: colors.panel, border: `1px solid ${colors.border}`, borderRadius: 12, padding: 20 }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 16 }}>{t.medications}</h3>
          {medications.map((med, i) => (
            <div key={i} style={{ padding: '10px 0', borderBottom: i < medications.length - 1 ? `1px solid ${colors.border}` : 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: colors.button, flexShrink: 0 }} />
              <span>{med}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Health Metrics Grid */}
      <h3 style={{ margin: '0 0 12px', fontSize: 16 }}>{t.healthMetrics}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        <MetricCard label={t.bloodPressure} value={`${patient.bpHistory[patient.bpHistory.length - 1]}/${Math.round(patient.bpHistory[patient.bpHistory.length - 1] * 0.6)}`} unit="mmHg" colors={colors} />
        <MetricCard label={t.heartRate} value={`${patient.hrHistory[patient.hrHistory.length - 1]}`} unit="bpm" color={patient.hrHistory[patient.hrHistory.length - 1] > 100 ? colors.danger : undefined} colors={colors} />
        <MetricCard label={t.weight} value={`${patient.weight}`} unit="kg" colors={colors} />
        <MetricCard label={t.height} value={`${patient.height}`} unit="cm" colors={colors} />
        <MetricCard label={t.temperature} value={`${patient.temperature}`} unit="°C" color={patient.temperature > 37.0 ? '#f59e0b' : undefined} colors={colors} />
        <MetricCard label={t.oxygenSat} value={`${patient.oxygenSat}%`} unit="SpO2" color={patient.oxygenSat < 96 ? colors.danger : '#22c55e'} colors={colors} />
        <MetricCard label={t.bmi} value={`${patient.bmi}`} unit="kg/m²" color={patient.bmi > 25 ? '#f59e0b' : undefined} colors={colors} />
        <MetricCard label={t.glucose} value={`${patient.glucose}`} unit="mmol/L" color={patient.glucose > 6.0 ? '#f59e0b' : undefined} colors={colors} />
      </div>

      {/* Forecast Chart */}
      <div style={{ background: colors.panel, border: `1px solid ${colors.border}`, borderRadius: 12, padding: 20, marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 16 }}>{t.forecast}</h3>
        <LineChart data1={patient.bpHistory} data2={patient.hrHistory} label1={t.bpTrend} label2={t.hrTrend} colors={colors} months={months} />
      </div>

      {/* Visit History */}
      <div style={{ background: colors.panel, border: `1px solid ${colors.border}`, borderRadius: 12, padding: 20 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 16 }}>{t.visitHistory}</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${colors.border}`, textAlign: 'left' }}>
              <th style={{ padding: '10px 14px', color: colors.textMuted, fontWeight: 600 }}>{t.date}</th>
              <th style={{ padding: '10px 14px', color: colors.textMuted, fontWeight: 600 }}>{t.doctor2}</th>
              <th style={{ padding: '10px 14px', color: colors.textMuted, fontWeight: 600 }}>{t.notes}</th>
            </tr>
          </thead>
          <tbody>
            {patient.visits.map((v, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${colors.border}` }}>
                <td style={{ padding: '10px 14px', fontWeight: 600, whiteSpace: 'nowrap' }}>{v.date}</td>
                <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>{v.doctor}</td>
                <td style={{ padding: '10px 14px', color: colors.textMuted }}>{lang === 'ru' ? v.notesRu : v.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ─── Page: Patients ─── */

function PatientsPage({ colors, t, lang, onOpenPatient }: { colors: Colors; t: Record<string, string>; lang: Lang; onOpenPatient: (id: number) => void }) {
  const [search, setSearch] = useState('');
  const filtered = patientsData.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const statusLabel = (s: string) => s === 'stable' ? t.stable : s === 'monitoring' ? t.monitoring : t.critical2;
  const statusColor = (s: string) => s === 'stable' ? '#22c55e' : s === 'monitoring' ? '#f59e0b' : colors.danger;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>{t.patientList}</h1>
        <button onClick={() => window.alert(`${t.addPatient} clicked`)} style={{ border: 'none', borderRadius: 8, background: colors.button, color: '#fff', padding: '10px 18px', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
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
              <tr
                key={p.id}
                onClick={() => onOpenPatient(p.id)}
                style={{ borderBottom: `1px solid ${colors.border}`, cursor: 'pointer', transition: 'background 0.15s' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = colors.active)}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '12px 14px', fontWeight: 600 }}>{p.name}</td>
                <td style={{ padding: '12px 14px' }}>{p.age}</td>
                <td style={{ padding: '12px 14px' }}>{lang === 'ru' ? p.diagnosisRu : p.diagnosis}</td>
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
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 0, height: 'calc(100vh - 140px)', borderRadius: 10, overflow: 'hidden', border: `1px solid ${colors.border}` }}>
      <div style={{ background: colors.panelStrong, borderRight: `1px solid ${colors.border}`, overflowY: 'auto' }}>
        <div style={{ padding: '14px', fontWeight: 700, fontSize: 16, borderBottom: `1px solid ${colors.border}` }}>{t.conversations}</div>
        {chatContacts.map((c, i) => (
          <div key={c.name} onClick={() => setSelected(i)} style={{ padding: '12px 14px', cursor: 'pointer', borderBottom: `1px solid ${colors.border}`, background: i === selected ? colors.active : 'transparent' }}>
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
              <div style={{ background: m.from === 'doctor' ? colors.button : colors.panelStrong, color: m.from === 'doctor' ? '#fff' : colors.text, padding: '10px 14px', borderRadius: 12, maxWidth: '70%', fontSize: 14, lineHeight: 1.5 }}>
                {m.text}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, padding: '12px 18px', borderTop: `1px solid ${colors.border}` }}>
          <input value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder={t.typeMessage} style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.inputBg, color: colors.text, outline: 'none' }} />
          <button onClick={handleSend} style={{ border: 'none', borderRadius: 8, background: colors.button, color: '#fff', padding: '10px 18px', fontWeight: 600, cursor: 'pointer' }}>{t.send}</button>
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
          <div onClick={() => setOpenIdx(openIdx === i ? null : i)} style={{ padding: '14px 18px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600 }}>
            {faq.q}
            <span style={{ fontSize: 18, transform: openIdx === i ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>▼</span>
          </div>
          {openIdx === i && <div style={{ padding: '0 18px 14px', color: colors.textMuted, lineHeight: 1.6 }}>{faq.a}</div>}
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

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const sectionStyle: React.CSSProperties = { background: colors.panel, border: `1px solid ${colors.border}`, borderRadius: 10, padding: 20, marginBottom: 16 };
  const labelRow: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${colors.border}` };

  return (
    <>
      <h1 style={{ marginTop: 0, marginBottom: 20 }}>{t.settings}</h1>
      <div style={sectionStyle}>
        <h3 style={{ margin: '0 0 12px' }}>{t.profileInfo}</h3>
        <div style={labelRow}><span style={{ color: colors.textMuted }}>{t.fullName}</span><span style={{ fontWeight: 600 }}>Dr. Smith</span></div>
        <div style={labelRow}><span style={{ color: colors.textMuted }}>{t.email}</span><span style={{ fontWeight: 600 }}>admin@example.com</span></div>
        <div style={{ ...labelRow, borderBottom: 'none' }}><span style={{ color: colors.textMuted }}>{t.role}</span><span style={{ fontWeight: 600 }}>{t.doctor}</span></div>
      </div>
      <div style={sectionStyle}>
        <h3 style={{ margin: '0 0 12px' }}>{t.general}</h3>
        <div style={labelRow}>
          <span>{t.language}</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {(['en', 'ru'] as Lang[]).map((l) => (
              <button key={l} onClick={() => setLang(l)} style={{ border: `1px solid ${colors.border}`, borderRadius: 6, padding: '6px 14px', cursor: 'pointer', background: lang === l ? colors.button : 'transparent', color: lang === l ? '#fff' : colors.text, fontWeight: 600 }}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div style={{ ...labelRow, borderBottom: 'none' }}>
          <span>{t.theme}</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {(['light', 'dark'] as ThemeMode[]).map((tm) => (
              <button key={tm} onClick={() => setTheme(tm)} style={{ border: `1px solid ${colors.border}`, borderRadius: 6, padding: '6px 14px', cursor: 'pointer', background: theme === tm ? colors.button : 'transparent', color: theme === tm ? '#fff' : colors.text, fontWeight: 600 }}>
                {tm === 'light' ? t.lightTheme : t.darkTheme}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div style={sectionStyle}>
        <h3 style={{ margin: '0 0 12px' }}>{t.notifications}</h3>
        <div style={labelRow}><span>{t.emailNotifications}</span><Toggle checked={emailNotif} onChange={setEmailNotif} /></div>
        <div style={labelRow}><span>{t.pushNotifications}</span><Toggle checked={pushNotif} onChange={setPushNotif} /></div>
        <div style={{ ...labelRow, borderBottom: 'none' }}><span>{t.alertNotifications}</span><Toggle checked={alertNotif} onChange={setAlertNotif} /></div>
      </div>
      <div style={sectionStyle}>
        <h3 style={{ margin: '0 0 12px' }}>{t.security}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input placeholder={t.currentPassword} type="password" style={{ padding: '10px 14px', borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.inputBg, color: colors.text, outline: 'none' }} />
          <input placeholder={t.newPassword} type="password" style={{ padding: '10px 14px', borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.inputBg, color: colors.text, outline: 'none' }} />
          <input placeholder={t.confirmPassword} type="password" style={{ padding: '10px 14px', borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.inputBg, color: colors.text, outline: 'none' }} />
        </div>
      </div>
      <button onClick={handleSave} style={{ border: 'none', borderRadius: 8, background: colors.button, color: '#fff', padding: '12px 32px', fontWeight: 600, cursor: 'pointer', fontSize: 15 }}>
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
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);

  const colors = useColors(theme);
  const t = translations[lang];

  const menuItems: Array<{ key: MenuKey; label: string; icon: string }> = [
    { key: 'dashboard', label: t.dashboard, icon: '🏠' },
    { key: 'patients', label: t.patients, icon: '🧑‍⚕️' },
    { key: 'chat', label: t.chat, icon: '💬' },
    { key: 'faq', label: t.faq, icon: '❓' },
    { key: 'settings', label: t.settings, icon: '⚙️' },
  ];

  const mainRef = useRef<HTMLElement>(null);

  const handleMenuClick = (key: MenuKey) => {
    setActiveMenu(key);
    setSelectedPatientId(null);
    mainRef.current?.scrollTo(0, 0);
  };

  const renderPage = useCallback(() => {
    if (activeMenu === 'patients' && selectedPatientId !== null) {
      const patient = patientsData.find((p) => p.id === selectedPatientId);
      if (patient) return <PatientProfilePage patient={patient} colors={colors} t={t} lang={lang} onBack={() => { setSelectedPatientId(null); mainRef.current?.scrollTo(0, 0); }} />;
    }
    switch (activeMenu) {
      case 'dashboard': return <DashboardPage colors={colors} t={t} />;
      case 'patients': return <PatientsPage colors={colors} t={t} lang={lang} onOpenPatient={(id) => { setSelectedPatientId(id); mainRef.current?.scrollTo(0, 0); }} />;
      case 'chat': return <ChatPage colors={colors} t={t} />;
      case 'faq': return <FAQPage colors={colors} t={t} />;
      case 'settings': return <SettingsPage colors={colors} t={t} lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} />;
    }
  }, [activeMenu, colors, t, lang, theme, selectedPatientId]);

  return (
    <div style={{ background: colors.pageBg, minHeight: '100vh', fontFamily: 'Inter, Arial, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: colors.shellBg }}>
        {/* Header */}
        <header style={{ height: 64, borderBottom: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: 16, padding: '0 24px', color: colors.text, flexShrink: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 28, color: '#3b82f6' }}>✚</div>
          <div style={{ fontWeight: 700, fontSize: 18, minWidth: 130 }}>HealthCodex</div>
          <input
            aria-label="Search patients"
            placeholder={t.searchPatients}
            style={{ flex: 1, maxWidth: 600, borderRadius: 10, border: `1px solid ${colors.border}`, padding: '10px 14px', background: colors.inputBg, color: colors.text, outline: 'none', fontSize: 14 }}
          />
          <div style={{ flex: 1 }} />
          <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} style={{ borderRadius: 10, border: `1px solid ${colors.border}`, background: colors.inputBg, color: colors.text, padding: '8px 10px', cursor: 'pointer' }}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button onClick={() => setLang(lang === 'en' ? 'ru' : 'en')} style={{ borderRadius: 10, border: `1px solid ${colors.border}`, background: colors.inputBg, color: colors.text, padding: '8px 12px', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
            {lang === 'en' ? 'RU' : 'EN'}
          </button>
          <span style={{ fontSize: 20 }}>🔔</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
            <span style={{ fontSize: 22 }}>👨‍⚕️</span>
            Dr. Smith
          </div>
        </header>

        {/* Body */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: 0 }}>
          {/* Sidebar */}
          <aside style={{ borderRight: `1px solid ${colors.border}`, padding: 12, color: colors.textMuted, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            {menuItems.map((item) => {
              const isActive = item.key === activeMenu;
              return (
                <button
                  key={item.key}
                  onClick={() => handleMenuClick(item.key)}
                  style={{
                    textAlign: 'left', marginBottom: 8, border: 'none',
                    background: isActive ? colors.active : 'transparent',
                    color: isActive ? '#2d71df' : colors.textMuted,
                    borderRadius: 8, padding: '11px 12px', cursor: 'pointer',
                    fontWeight: isActive ? 700 : 600, fontSize: 14,
                  }}
                >
                  <span style={{ marginRight: 8 }}>{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </aside>

          {/* Main content */}
          <main ref={mainRef} style={{ padding: 28, color: colors.text, overflowY: 'auto' }}>
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
