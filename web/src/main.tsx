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
    // Health metric categories
    catHeart: 'Heart & Circulation',
    catTemp: 'Temperature',
    catStress: 'Stress & Recovery',
    catSleep: 'Sleep',
    catActivity: 'Physical Activity',
    catFitness: 'Fitness',
    catBody: 'Body Composition',
    catWellbeing: 'Well-being',
    catNutrition: 'Nutrition & Habits',
    catWomen: "Women's Health",
    catEnv: 'Environment',
    // Heart
    mPulse: 'Pulse', mRestPulse: 'Resting Pulse', mMaxPulse: 'Max Pulse', mMinPulse: 'Min Pulse',
    mHrv: 'HRV', mSpo2: 'SpO2', mBpSys: 'Systolic BP', mBpDia: 'Diastolic BP',
    mRespRate: 'Respiratory Rate', mEcg: 'ECG', mArrhythmia: 'Arrhythmia Signs',
    mPulseZones: 'Pulse Zones', mTrainPulse: 'Training Pulse', mAvgDayPulse: 'Avg Daily Pulse',
    // Temp
    mBodyTemp: 'Body Temp', mSkinTemp: 'Skin Temp',
    // Stress
    mStress: 'Stress Level', mRecovery: 'Recovery Level', mBodyBattery: 'Body Battery',
    // Sleep
    mSleepQuality: 'Sleep Quality', mSleepDuration: 'Sleep Duration',
    mFallAsleep: 'Fall Asleep Time', mWakeUp: 'Wake Up Time',
    mDeepSleep: 'Deep Sleep', mLightSleep: 'Light Sleep', mRemSleep: 'REM Sleep',
    mNightWake: 'Night Awakenings', mDayNap: 'Day Nap', mSnoring: 'Snoring',
    // Activity
    mSteps: 'Steps', mDistance: 'Distance', mFloors: 'Floors',
    mSedentary: 'Sedentary Time', mActiveTime: 'Active Time',
    mModerateMin: 'Moderate Activity', mIntenseMin: 'Intense Activity',
    mBurnedCal: 'Burned Calories', mActiveCal: 'Active Calories', mTotalEnergy: 'Total Energy',
    mWalkPace: 'Walking Pace', mSpeed: 'Speed', mCadence: 'Cadence', mStrideLen: 'Stride Length',
    // Fitness
    mVo2max: 'VO2 Max', mCardioLoad: 'Cardio Load', mTrainLoad: 'Training Load', mRecoveryTime: 'Recovery Time',
    // Body
    mWeight: 'Weight', mBmi: 'BMI', mFatPct: 'Fat %', mMuscleMass: 'Muscle Mass',
    mBodyWater: 'Body Water', mBoneMass: 'Bone Mass', mGlucose: 'Glucose',
    // Wellbeing
    mSymptoms: 'Symptoms', mDailyWell: 'Daily Well-being', mFatigue: 'Fatigue',
    mAnxiety: 'Anxiety', mMood: 'Mood',
    // Nutrition
    mWater: 'Water Intake', mFoodCal: 'Food Calories', mCaffeine: 'Caffeine',
    mAlcohol: 'Alcohol', mSmoking: 'Smoking', mMedsTaken: 'Medications Taken',
    // Women
    mCycleDay: 'Cycle Day', mOvulation: 'Ovulation',
    // Env
    mNoise: 'Noise Level', mSunExposure: 'Sun Exposure', mOutdoorTime: 'Outdoor Time', mLocation: 'Location',
    // Units & misc
    bpm: 'bpm', ms: 'ms', mmHg: 'mmHg', breathMin: 'br/min', pct: '%',
    min: 'min', hrs: 'hrs', times: 'times', steps: 'steps', km: 'km',
    kcal: 'kcal', minKm: 'min/km', kmH: 'km/h', stepsMin: 'steps/min',
    cm: 'cm', kg: 'kg', ml: 'ml', mgDay: 'mg/day', dB: 'dB',
    normal: 'Normal', elevated: 'Elevated', low: 'Low', high: 'High', good: 'Good', poor: 'Poor',
    none: 'None', yes: 'Yes', no: 'No', moderate: 'Moderate',
    forecastTitle: 'Health Forecast & Predictions',
    riskLevel: 'Risk Level', prediction: 'Prediction', recommendation: 'Recommendation',
    lowRisk: 'Low Risk', moderateRisk: 'Moderate Risk', highRisk: 'High Risk',
    // Add patient modal
    addPatientTitle: 'Add New Patient',
    patientName: 'Full Name',
    patientAge: 'Age',
    patientDiagnosis: 'Diagnosis',
    patientPhone: 'Phone',
    cancel: 'Cancel',
    create: 'Create',
    fieldRequired: 'Please fill in all required fields',
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
    // Health metric categories
    catHeart: 'Сердце и сосуды',
    catTemp: 'Температура',
    catStress: 'Стресс и восстановление',
    catSleep: 'Сон',
    catActivity: 'Физическая активность',
    catFitness: 'Фитнес',
    catBody: 'Состав тела',
    catWellbeing: 'Самочувствие',
    catNutrition: 'Питание и привычки',
    catWomen: 'Женское здоровье',
    catEnv: 'Окружение',
    // Heart
    mPulse: 'Пульс', mRestPulse: 'Пульс в покое', mMaxPulse: 'Макс. пульс', mMinPulse: 'Мин. пульс',
    mHrv: 'ВСР (HRV)', mSpo2: 'SpO2', mBpSys: 'Сист. давление', mBpDia: 'Диаст. давление',
    mRespRate: 'Частота дыхания', mEcg: 'ЭКГ', mArrhythmia: 'Признаки аритмии',
    mPulseZones: 'Зоны пульса', mTrainPulse: 'Пульс на тренировке', mAvgDayPulse: 'Средний пульс за день',
    // Temp
    mBodyTemp: 'Температура тела', mSkinTemp: 'Температура кожи',
    // Stress
    mStress: 'Уровень стресса', mRecovery: 'Уровень восстановления', mBodyBattery: 'Энергия (Body Battery)',
    // Sleep
    mSleepQuality: 'Качество сна', mSleepDuration: 'Длительность сна',
    mFallAsleep: 'Время засыпания', mWakeUp: 'Время пробуждения',
    mDeepSleep: 'Глубокий сон', mLightSleep: 'Лёгкий сон', mRemSleep: 'Фаза REM',
    mNightWake: 'Пробуждения ночью', mDayNap: 'Дневной сон', mSnoring: 'Храп',
    // Activity
    mSteps: 'Шаги', mDistance: 'Расстояние', mFloors: 'Этажи',
    mSedentary: 'Время сидения', mActiveTime: 'Время активности',
    mModerateMin: 'Умеренная активность', mIntenseMin: 'Интенсивная активность',
    mBurnedCal: 'Сожжённые калории', mActiveCal: 'Активные калории', mTotalEnergy: 'Общий расход энергии',
    mWalkPace: 'Темп ходьбы', mSpeed: 'Скорость', mCadence: 'Каденс', mStrideLen: 'Длина шага',
    // Fitness
    mVo2max: 'VO2 Max', mCardioLoad: 'Кардионагрузка', mTrainLoad: 'Тренировочная нагрузка', mRecoveryTime: 'Время восстановления',
    // Body
    mWeight: 'Масса тела', mBmi: 'ИМТ', mFatPct: '% жира', mMuscleMass: 'Мышечная масса',
    mBodyWater: 'Вода в организме', mBoneMass: 'Костная масса', mGlucose: 'Глюкоза',
    // Wellbeing
    mSymptoms: 'Симптомы', mDailyWell: 'Самочувствие за день', mFatigue: 'Усталость',
    mAnxiety: 'Тревожность', mMood: 'Настроение',
    // Nutrition
    mWater: 'Потребление воды', mFoodCal: 'Калории из еды', mCaffeine: 'Кофеин',
    mAlcohol: 'Алкоголь', mSmoking: 'Курение', mMedsTaken: 'Приём лекарств',
    // Women
    mCycleDay: 'День цикла', mOvulation: 'Овуляция',
    // Env
    mNoise: 'Уровень шума', mSunExposure: 'Солнечный свет', mOutdoorTime: 'Время на улице', mLocation: 'Геолокация',
    // Units & misc
    bpm: 'уд/мин', ms: 'мс', mmHg: 'мм рт.ст.', breathMin: 'вд/мин', pct: '%',
    min: 'мин', hrs: 'ч', times: 'раз', steps: 'шагов', km: 'км',
    kcal: 'ккал', minKm: 'мин/км', kmH: 'км/ч', stepsMin: 'шаг/мин',
    cm: 'см', kg: 'кг', ml: 'мл', mgDay: 'мг/день', dB: 'дБ',
    normal: 'Норма', elevated: 'Повышен', low: 'Низкий', high: 'Высокий', good: 'Хорошо', poor: 'Плохо',
    none: 'Нет', yes: 'Да', no: 'Нет', moderate: 'Умеренный',
    forecastTitle: 'Прогноз здоровья и предсказания',
    riskLevel: 'Уровень риска', prediction: 'Прогноз', recommendation: 'Рекомендация',
    lowRisk: 'Низкий риск', moderateRisk: 'Умеренный риск', highRisk: 'Высокий риск',
    // Add patient modal
    addPatientTitle: 'Добавить нового пациента',
    patientName: 'ФИО',
    patientAge: 'Возраст',
    patientDiagnosis: 'Диагноз',
    patientPhone: 'Телефон',
    cancel: 'Отмена',
    create: 'Создать',
    fieldRequired: 'Пожалуйста, заполните все обязательные поля',
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
  health: HealthMetrics;
}

interface HealthMetrics {
  // Heart
  pulse: number; restPulse: number; maxPulse: number; minPulse: number;
  hrv: number; spo2: number; bpSys: number; bpDia: number;
  respRate: number; ecg: string; arrhythmia: boolean;
  pulseZones: string; trainPulse: number; avgDayPulse: number;
  // Temp
  bodyTemp: number; skinTemp: number;
  // Stress
  stress: number; recovery: number; bodyBattery: number;
  // Sleep
  sleepQuality: number; sleepDuration: number;
  fallAsleep: string; wakeUp: string;
  deepSleep: number; lightSleep: number; remSleep: number;
  nightWake: number; dayNap: number; snoring: number;
  // Activity
  steps: number; distance: number; floors: number;
  sedentary: number; activeTime: number;
  moderateMin: number; intenseMin: number;
  burnedCal: number; activeCal: number; totalEnergy: number;
  walkPace: number; speed: number; cadence: number; strideLen: number;
  // Fitness
  vo2max: number; cardioLoad: number; trainLoad: number; recoveryTime: number;
  // Body
  weight: number; bmi: number; fatPct: number; muscleMass: number;
  bodyWater: number; boneMass: number; glucose: number;
  // Wellbeing
  symptoms: string; dailyWell: number; fatigue: number; anxiety: number; mood: number;
  // Nutrition
  water: number; foodCal: number; caffeine: number; alcohol: number; smoking: number; medsTaken: boolean;
  // Women (optional)
  cycleDay: number | null; ovulation: boolean | null;
  // Env
  noise: number; sunExposure: number; outdoorTime: number; location: string;
  // Trends (12 data points each - last 6 months biweekly)
  bpTrend: number[]; hrTrend: number[]; stressTrend: number[];
  sleepTrend: number[]; stepsTrend: number[]; weightTrend: number[];
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
    health: {
      pulse: 72, restPulse: 68, maxPulse: 145, minPulse: 58, hrv: 38, spo2: 98, bpSys: 138, bpDia: 85,
      respRate: 16, ecg: 'Normal sinus rhythm', arrhythmia: false, pulseZones: '55% fat burn, 30% cardio, 15% peak',
      trainPulse: 132, avgDayPulse: 74, bodyTemp: 36.6, skinTemp: 33.2,
      stress: 62, recovery: 55, bodyBattery: 48,
      sleepQuality: 65, sleepDuration: 6.5, fallAsleep: '23:45', wakeUp: '06:15',
      deepSleep: 1.2, lightSleep: 3.1, remSleep: 1.5, nightWake: 2, dayNap: 0, snoring: 15,
      steps: 6200, distance: 4.3, floors: 3, sedentary: 540, activeTime: 85,
      moderateMin: 45, intenseMin: 15, burnedCal: 2150, activeCal: 650, totalEnergy: 2800,
      walkPace: 9.2, speed: 6.5, cadence: 112, strideLen: 72,
      vo2max: 32, cardioLoad: 65, trainLoad: 180, recoveryTime: 18,
      weight: 82, bmi: 25.9, fatPct: 28, muscleMass: 35, bodyWater: 52, boneMass: 3.2, glucose: 5.4,
      symptoms: '', dailyWell: 6, fatigue: 4, anxiety: 3, mood: 7,
      water: 1800, foodCal: 2200, caffeine: 200, alcohol: 0, smoking: 0, medsTaken: true,
      cycleDay: null, ovulation: null,
      noise: 35, sunExposure: 45, outdoorTime: 40, location: 'New York, NY',
      bpTrend: [145, 142, 138, 135, 130, 128, 125, 122, 120, 118, 119, 117],
      hrTrend: [78, 76, 80, 74, 72, 75, 70, 68, 72, 70, 69, 68],
      stressTrend: [75, 72, 68, 70, 65, 62, 60, 58, 62, 60, 58, 55],
      sleepTrend: [5.8, 6.0, 6.2, 6.0, 6.5, 6.3, 6.8, 6.5, 7.0, 6.5, 6.8, 6.5],
      stepsTrend: [4500, 5000, 5200, 5500, 5800, 6000, 6200, 5800, 6500, 6200, 6000, 6200],
      weightTrend: [85, 84.5, 84, 83.5, 83, 83, 82.5, 82.5, 82, 82, 82, 82],
    },
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
    health: {
      pulse: 105, restPulse: 95, maxPulse: 185, minPulse: 72, hrv: 22, spo2: 96, bpSys: 128, bpDia: 78,
      respRate: 20, ecg: 'Sinus tachycardia', arrhythmia: true, pulseZones: '20% fat burn, 50% cardio, 30% peak',
      trainPulse: 165, avgDayPulse: 102, bodyTemp: 37.1, skinTemp: 34.0,
      stress: 78, recovery: 35, bodyBattery: 30,
      sleepQuality: 45, sleepDuration: 5.5, fallAsleep: '01:00', wakeUp: '06:30',
      deepSleep: 0.8, lightSleep: 2.8, remSleep: 1.2, nightWake: 4, dayNap: 20, snoring: 0,
      steps: 8500, distance: 6.1, floors: 5, sedentary: 420, activeTime: 120,
      moderateMin: 60, intenseMin: 30, burnedCal: 1850, activeCal: 550, totalEnergy: 2400,
      walkPace: 8.5, speed: 7.1, cadence: 118, strideLen: 68,
      vo2max: 38, cardioLoad: 82, trainLoad: 250, recoveryTime: 28,
      weight: 58, bmi: 21.3, fatPct: 22, muscleMass: 24, bodyWater: 58, boneMass: 2.5, glucose: 4.8,
      symptoms: '', dailyWell: 4, fatigue: 7, anxiety: 8, mood: 4,
      water: 1500, foodCal: 1600, caffeine: 300, alcohol: 0, smoking: 0, medsTaken: true,
      cycleDay: 14, ovulation: true,
      noise: 42, sunExposure: 30, outdoorTime: 25, location: 'Moscow, RU',
      bpTrend: [120, 125, 128, 132, 130, 135, 138, 140, 137, 134, 132, 130],
      hrTrend: [110, 108, 112, 105, 115, 120, 118, 108, 105, 100, 98, 95],
      stressTrend: [82, 80, 85, 78, 82, 80, 78, 75, 78, 76, 74, 72],
      sleepTrend: [4.5, 5.0, 4.8, 5.2, 5.5, 5.0, 5.8, 5.5, 5.2, 5.8, 5.5, 5.5],
      stepsTrend: [9000, 8500, 9200, 8800, 8500, 8200, 8800, 8500, 8200, 8500, 8800, 8500],
      weightTrend: [57, 57.5, 57, 58, 57.5, 58, 58, 57.5, 58, 58, 58, 58],
    },
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
    health: {
      pulse: 76, restPulse: 72, maxPulse: 140, minPulse: 60, hrv: 30, spo2: 97, bpSys: 135, bpDia: 82,
      respRate: 17, ecg: 'Normal sinus rhythm', arrhythmia: false, pulseZones: '60% fat burn, 30% cardio, 10% peak',
      trainPulse: 120, avgDayPulse: 78, bodyTemp: 36.5, skinTemp: 33.0,
      stress: 55, recovery: 50, bodyBattery: 45,
      sleepQuality: 60, sleepDuration: 7.0, fallAsleep: '23:00', wakeUp: '06:00',
      deepSleep: 1.5, lightSleep: 3.2, remSleep: 1.5, nightWake: 1, dayNap: 0, snoring: 20,
      steps: 4800, distance: 3.2, floors: 2, sedentary: 600, activeTime: 60,
      moderateMin: 30, intenseMin: 10, burnedCal: 1950, activeCal: 450, totalEnergy: 2400,
      walkPace: 10.5, speed: 5.7, cadence: 105, strideLen: 65,
      vo2max: 26, cardioLoad: 50, trainLoad: 120, recoveryTime: 22,
      weight: 75, bmi: 28.6, fatPct: 35, muscleMass: 28, bodyWater: 48, boneMass: 2.8, glucose: 7.2,
      symptoms: '', dailyWell: 5, fatigue: 5, anxiety: 4, mood: 6,
      water: 1600, foodCal: 2100, caffeine: 150, alcohol: 1, smoking: 0, medsTaken: true,
      cycleDay: null, ovulation: null,
      noise: 30, sunExposure: 35, outdoorTime: 30, location: 'Chicago, IL',
      bpTrend: [130, 128, 132, 135, 130, 128, 125, 127, 124, 122, 120, 118],
      hrTrend: [72, 74, 70, 68, 72, 76, 74, 70, 68, 70, 72, 70],
      stressTrend: [60, 58, 62, 55, 58, 55, 52, 55, 50, 52, 50, 48],
      sleepTrend: [6.5, 6.8, 7.0, 6.5, 7.0, 7.2, 7.0, 7.0, 7.2, 7.0, 7.0, 7.0],
      stepsTrend: [3500, 4000, 4200, 4500, 4800, 4500, 5000, 4800, 4500, 5000, 4800, 4800],
      weightTrend: [78, 77.5, 77, 76.5, 76, 76, 75.5, 75.5, 75, 75, 75, 75],
    },
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
    health: {
      pulse: 82, restPulse: 78, maxPulse: 155, minPulse: 62, hrv: 28, spo2: 99, bpSys: 112, bpDia: 70,
      respRate: 15, ecg: 'Normal sinus rhythm', arrhythmia: false, pulseZones: '70% fat burn, 25% cardio, 5% peak',
      trainPulse: 125, avgDayPulse: 80, bodyTemp: 36.4, skinTemp: 32.8,
      stress: 40, recovery: 70, bodyBattery: 72,
      sleepQuality: 80, sleepDuration: 8.0, fallAsleep: '22:30', wakeUp: '06:30',
      deepSleep: 2.0, lightSleep: 3.5, remSleep: 2.0, nightWake: 0, dayNap: 0, snoring: 0,
      steps: 7500, distance: 5.2, floors: 4, sedentary: 480, activeTime: 100,
      moderateMin: 50, intenseMin: 20, burnedCal: 1600, activeCal: 400, totalEnergy: 2000,
      walkPace: 8.8, speed: 6.8, cadence: 115, strideLen: 70,
      vo2max: 35, cardioLoad: 55, trainLoad: 150, recoveryTime: 14,
      weight: 52, bmi: 18.0, fatPct: 20, muscleMass: 22, bodyWater: 60, boneMass: 2.3, glucose: 4.5,
      symptoms: '', dailyWell: 7, fatigue: 3, anxiety: 2, mood: 8,
      water: 2000, foodCal: 1800, caffeine: 80, alcohol: 0, smoking: 0, medsTaken: true,
      cycleDay: 8, ovulation: false,
      noise: 28, sunExposure: 50, outdoorTime: 60, location: 'St. Petersburg, RU',
      bpTrend: [110, 112, 108, 110, 112, 115, 113, 110, 112, 114, 112, 110],
      hrTrend: [82, 80, 84, 78, 76, 80, 78, 76, 74, 76, 74, 72],
      stressTrend: [45, 42, 48, 40, 42, 38, 40, 38, 36, 38, 36, 35],
      sleepTrend: [7.5, 7.8, 8.0, 7.5, 8.0, 8.2, 8.0, 8.0, 8.0, 8.2, 8.0, 8.0],
      stepsTrend: [6000, 6500, 7000, 7200, 7500, 7200, 7800, 7500, 7200, 7500, 7500, 7500],
      weightTrend: [50, 50.5, 51, 51, 51.5, 51.5, 52, 52, 52, 52, 52, 52],
    },
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
    health: {
      pulse: 66, restPulse: 60, maxPulse: 155, minPulse: 52, hrv: 25, spo2: 95, bpSys: 145, bpDia: 88,
      respRate: 18, ecg: 'Minor ST changes', arrhythmia: false, pulseZones: '40% fat burn, 40% cardio, 20% peak',
      trainPulse: 118, avgDayPulse: 68, bodyTemp: 36.7, skinTemp: 33.5,
      stress: 70, recovery: 40, bodyBattery: 35,
      sleepQuality: 50, sleepDuration: 6.0, fallAsleep: '00:15', wakeUp: '06:15',
      deepSleep: 1.0, lightSleep: 3.0, remSleep: 1.2, nightWake: 3, dayNap: 15, snoring: 35,
      steps: 3800, distance: 2.6, floors: 1, sedentary: 660, activeTime: 45,
      moderateMin: 25, intenseMin: 5, burnedCal: 2200, activeCal: 400, totalEnergy: 2600,
      walkPace: 11.0, speed: 5.5, cadence: 100, strideLen: 68,
      vo2max: 24, cardioLoad: 72, trainLoad: 100, recoveryTime: 32,
      weight: 88, bmi: 28.7, fatPct: 30, muscleMass: 34, bodyWater: 50, boneMass: 3.0, glucose: 6.1,
      symptoms: '', dailyWell: 5, fatigue: 6, anxiety: 5, mood: 5,
      water: 1400, foodCal: 2400, caffeine: 250, alcohol: 2, smoking: 0, medsTaken: true,
      cycleDay: null, ovulation: null,
      noise: 38, sunExposure: 25, outdoorTime: 20, location: 'San Francisco, CA',
      bpTrend: [150, 148, 145, 140, 138, 135, 132, 130, 128, 126, 124, 122],
      hrTrend: [68, 70, 66, 64, 68, 72, 70, 66, 64, 66, 64, 62],
      stressTrend: [80, 78, 75, 72, 70, 72, 68, 70, 65, 68, 65, 62],
      sleepTrend: [5.5, 5.8, 6.0, 5.5, 6.0, 6.2, 5.8, 6.0, 6.2, 6.0, 6.0, 6.0],
      stepsTrend: [3000, 3200, 3500, 3800, 3500, 4000, 3800, 3500, 4000, 3800, 3800, 3800],
      weightTrend: [92, 91, 90.5, 90, 89.5, 89, 88.5, 88.5, 88, 88, 88, 88],
    },
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
    health: {
      pulse: 72, restPulse: 65, maxPulse: 165, minPulse: 55, hrv: 42, spo2: 97, bpSys: 118, bpDia: 74,
      respRate: 18, ecg: 'Normal sinus rhythm', arrhythmia: false, pulseZones: '50% fat burn, 35% cardio, 15% peak',
      trainPulse: 140, avgDayPulse: 72, bodyTemp: 36.5, skinTemp: 33.1,
      stress: 45, recovery: 65, bodyBattery: 62,
      sleepQuality: 75, sleepDuration: 7.5, fallAsleep: '23:00', wakeUp: '06:30',
      deepSleep: 1.8, lightSleep: 3.2, remSleep: 1.8, nightWake: 1, dayNap: 0, snoring: 5,
      steps: 9200, distance: 6.8, floors: 6, sedentary: 400, activeTime: 140,
      moderateMin: 65, intenseMin: 35, burnedCal: 2400, activeCal: 800, totalEnergy: 3200,
      walkPace: 8.0, speed: 7.5, cadence: 120, strideLen: 75,
      vo2max: 42, cardioLoad: 60, trainLoad: 220, recoveryTime: 12,
      weight: 76, bmi: 23.5, fatPct: 18, muscleMass: 38, bodyWater: 58, boneMass: 3.1, glucose: 5.0,
      symptoms: '', dailyWell: 8, fatigue: 2, anxiety: 2, mood: 8,
      water: 2200, foodCal: 2300, caffeine: 120, alcohol: 1, smoking: 0, medsTaken: true,
      cycleDay: null, ovulation: null,
      noise: 32, sunExposure: 60, outdoorTime: 80, location: 'Austin, TX',
      bpTrend: [118, 120, 116, 118, 120, 122, 118, 116, 118, 120, 118, 116],
      hrTrend: [74, 72, 76, 70, 72, 74, 70, 68, 72, 70, 68, 70],
      stressTrend: [50, 48, 52, 45, 48, 45, 42, 45, 42, 40, 42, 40],
      sleepTrend: [7.0, 7.2, 7.5, 7.0, 7.5, 7.8, 7.5, 7.5, 7.5, 7.8, 7.5, 7.5],
      stepsTrend: [8000, 8500, 8800, 9000, 9200, 9000, 9500, 9200, 9000, 9500, 9200, 9200],
      weightTrend: [77, 77, 76.5, 76.5, 76, 76, 76, 76, 76, 76, 76, 76],
    },
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

/* ─── Add Patient Modal ─── */

function AddPatientModal({ colors, t, onClose, onAdd }: { colors: Colors; t: Record<string, string>; onClose: () => void; onAdd: (p: { name: string; age: number; diagnosis: string; phone: string }) => void }) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!name.trim() || !age.trim() || !diagnosis.trim()) {
      setError(t.fieldRequired);
      return;
    }
    onAdd({ name: name.trim(), age: parseInt(age, 10), diagnosis: diagnosis.trim(), phone: phone.trim() });
    onClose();
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 8,
    border: `1px solid ${colors.border}`, background: colors.inputBg,
    color: colors.text, fontSize: 14, boxSizing: 'border-box', outline: 'none',
  };
  const labelStyle: React.CSSProperties = { display: 'block', marginBottom: 4, fontWeight: 600, fontSize: 14, color: colors.textMuted };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: colors.panel, borderRadius: 14, padding: 28, width: 420, maxWidth: '90vw', border: `1px solid ${colors.border}` }}>
        <h2 style={{ margin: '0 0 20px', color: colors.text }}>{t.addPatientTitle}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>{t.patientName} *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>{t.patientAge} *</label>
            <input type="number" min="0" max="150" value={age} onChange={(e) => setAge(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>{t.patientDiagnosis} *</label>
            <input value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>{t.patientPhone}</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} />
          </div>
          {error && <div style={{ color: colors.danger, fontSize: 13, fontWeight: 600 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
            <button onClick={onClose} style={{ border: `1px solid ${colors.border}`, borderRadius: 8, background: 'transparent', color: colors.text, padding: '10px 20px', fontWeight: 600, cursor: 'pointer' }}>
              {t.cancel}
            </button>
            <button onClick={handleSubmit} style={{ border: 'none', borderRadius: 8, background: colors.button, color: '#fff', padding: '10px 20px', fontWeight: 600, cursor: 'pointer' }}>
              {t.create}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Page: Dashboard ─── */

function DashboardPage({ colors, t, onAddPatient }: { colors: Colors; t: Record<string, string>; onAddPatient: () => void }) {
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
            <button onClick={onAddPatient} style={{ border: 'none', borderRadius: 8, background: colors.button, color: '#fff', padding: '10px 8px', fontWeight: 600, cursor: 'pointer' }}>
              {t.addPatient}
            </button>
          </div>
        </Panel>
      </div>
    </>
  );
}

/* ─── Collapsible Section ─── */

function Section({ title, colors, defaultOpen, children }: { title: string; colors: Colors; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen ?? true);
  return (
    <div style={{ background: colors.panel, border: `1px solid ${colors.border}`, borderRadius: 12, marginBottom: 14, overflow: 'hidden' }}>
      <div onClick={() => setOpen(!open)} style={{ padding: '14px 20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', userSelect: 'none' }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>{title}</h3>
        <span style={{ fontSize: 14, transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', color: colors.textMuted }}>▼</span>
      </div>
      {open && <div style={{ padding: '0 20px 16px' }}>{children}</div>}
    </div>
  );
}

function MGrid({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>{children}</div>;
}

/* ─── Forecast helpers ─── */

function computeForecast(h: HealthMetrics, t: Record<string, string>): Array<{ area: string; risk: string; riskColor: string; pred: string; rec: string }> {
  const forecasts: Array<{ area: string; risk: string; riskColor: string; pred: string; rec: string }> = [];
  // BP forecast
  const bpLast = h.bpTrend[h.bpTrend.length - 1];
  const bpFirst = h.bpTrend[0];
  const bpDelta = bpLast - bpFirst;
  if (bpLast > 140 || bpDelta > 5) {
    forecasts.push({ area: t.mBpSys, risk: t.highRisk, riskColor: '#ef5350', pred: `${bpLast + Math.round(bpDelta * 0.3)} ${t.mmHg}`, rec: t.mBpSys });
  } else if (bpLast > 125) {
    forecasts.push({ area: t.mBpSys, risk: t.moderateRisk, riskColor: '#f59e0b', pred: `${bpLast + Math.round(bpDelta * 0.2)} ${t.mmHg}`, rec: t.mBpSys });
  } else {
    forecasts.push({ area: t.mBpSys, risk: t.lowRisk, riskColor: '#22c55e', pred: `${bpLast + Math.round(bpDelta * 0.1)} ${t.mmHg}`, rec: t.mBpSys });
  }
  // HR forecast
  const hrLast = h.hrTrend[h.hrTrend.length - 1];
  if (hrLast > 100) {
    forecasts.push({ area: t.mPulse, risk: t.highRisk, riskColor: '#ef5350', pred: `${hrLast - 5}–${hrLast + 5} ${t.bpm}`, rec: t.mPulse });
  } else if (hrLast > 80) {
    forecasts.push({ area: t.mPulse, risk: t.moderateRisk, riskColor: '#f59e0b', pred: `${hrLast - 3}–${hrLast + 3} ${t.bpm}`, rec: t.mPulse });
  } else {
    forecasts.push({ area: t.mPulse, risk: t.lowRisk, riskColor: '#22c55e', pred: `${hrLast - 2}–${hrLast + 2} ${t.bpm}`, rec: t.mPulse });
  }
  // Stress forecast
  const stressLast = h.stressTrend[h.stressTrend.length - 1];
  if (stressLast > 70) {
    forecasts.push({ area: t.mStress, risk: t.highRisk, riskColor: '#ef5350', pred: `${stressLast}+`, rec: t.mStress });
  } else if (stressLast > 50) {
    forecasts.push({ area: t.mStress, risk: t.moderateRisk, riskColor: '#f59e0b', pred: `${stressLast - 5}–${stressLast}`, rec: t.mStress });
  }
  // Sleep forecast
  const sleepLast = h.sleepTrend[h.sleepTrend.length - 1];
  if (sleepLast < 6) {
    forecasts.push({ area: t.mSleepDuration, risk: t.highRisk, riskColor: '#ef5350', pred: `${sleepLast} ${t.hrs}`, rec: t.mSleepDuration });
  } else if (sleepLast < 7) {
    forecasts.push({ area: t.mSleepDuration, risk: t.moderateRisk, riskColor: '#f59e0b', pred: `${sleepLast} ${t.hrs}`, rec: t.mSleepDuration });
  }
  // Weight/BMI
  if (h.bmi > 28) {
    forecasts.push({ area: t.mBmi, risk: t.moderateRisk, riskColor: '#f59e0b', pred: `${h.bmi}`, rec: t.mBmi });
  }
  // Glucose
  if (h.glucose > 6.5) {
    forecasts.push({ area: t.mGlucose, risk: t.highRisk, riskColor: '#ef5350', pred: `${h.glucose} mmol/L`, rec: t.mGlucose });
  } else if (h.glucose > 5.6) {
    forecasts.push({ area: t.mGlucose, risk: t.moderateRisk, riskColor: '#f59e0b', pred: `${h.glucose} mmol/L`, rec: t.mGlucose });
  }
  // SpO2
  if (h.spo2 < 95) {
    forecasts.push({ area: t.mSpo2, risk: t.highRisk, riskColor: '#ef5350', pred: `${h.spo2}%`, rec: t.mSpo2 });
  }
  return forecasts;
}

/* ─── Page: Patient Profile ─── */

function PatientProfilePage({ patient, colors, t, lang, onBack }: { patient: PatientFull; colors: Colors; t: Record<string, string>; lang: Lang; onBack: () => void }) {
  const statusLabel = (s: string) => s === 'stable' ? t.stable : s === 'monitoring' ? t.monitoring : t.critical2;
  const statusColor = (s: string) => s === 'stable' ? '#22c55e' : s === 'monitoring' ? '#f59e0b' : colors.danger;
  const months = lang === 'ru' ? ['Окт', 'Ноя', 'Дек', 'Янв', 'Фев', 'Мар'] : ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
  const diagnosis = lang === 'ru' ? patient.diagnosisRu : patient.diagnosis;
  const allergies = lang === 'ru' ? patient.allergiesRu : patient.allergies;
  const medications = lang === 'ru' ? patient.medicationsRu : patient.medications;
  const h = patient.health;
  const forecasts = computeForecast(h, t);

  const infoRow: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${colors.border}` };

  const valColor = (val: number, low: number, high: number) => val > high ? colors.danger : val < low ? '#f59e0b' : undefined;
  const scaleColor = (val: number, okMax: number, warnMax: number) => val > warnMax ? colors.danger : val > okMax ? '#f59e0b' : '#22c55e';

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={onBack} style={{ border: `1px solid ${colors.border}`, borderRadius: 8, background: 'transparent', color: colors.text, padding: '8px 16px', cursor: 'pointer', fontWeight: 600 }}>← {t.back}</button>
        <h1 style={{ margin: 0 }}>{t.patientProfile}</h1>
      </div>

      {/* Summary */}
      <div style={{ background: colors.panel, border: `1px solid ${colors.border}`, borderRadius: 12, padding: 24, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 24 }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: colors.button, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, color: '#fff', fontWeight: 700, flexShrink: 0 }}>
          {patient.name.split(' ').map((n) => n[0]).join('')}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{patient.name}</div>
          <div style={{ color: colors.textMuted, marginBottom: 8 }}>{diagnosis} · {patient.age} {t.age.toLowerCase()}</div>
          <span style={{ background: statusColor(patient.status) + '22', color: statusColor(patient.status), padding: '4px 12px', borderRadius: 6, fontWeight: 600, fontSize: 13 }}>{statusLabel(patient.status)}</span>
        </div>
        <div style={{ textAlign: 'right', color: colors.textMuted, fontSize: 14 }}>
          <div>{t.lastVisit}: <strong style={{ color: colors.text }}>{patient.lastVisit}</strong></div>
          <div style={{ marginTop: 4 }}>{t.bloodType}: <strong style={{ color: colors.text }}>{patient.bloodType}</strong></div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        {/* Personal Info */}
        <div style={{ background: colors.panel, border: `1px solid ${colors.border}`, borderRadius: 12, padding: 20 }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 16 }}>{t.personalInfo}</h3>
          <div style={infoRow}><span style={{ color: colors.textMuted }}>{t.dateOfBirth}</span><span>{patient.dob}</span></div>
          <div style={infoRow}><span style={{ color: colors.textMuted }}>{t.gender}</span><span>{patient.gender === 'male' ? t.male : t.female}</span></div>
          <div style={infoRow}><span style={{ color: colors.textMuted }}>{t.phone}</span><span>{patient.phone}</span></div>
          <div style={infoRow}><span style={{ color: colors.textMuted }}>{t.address}</span><span style={{ textAlign: 'right', maxWidth: 220 }}>{patient.address}</span></div>
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

      {/* ── Heart & Circulation ── */}
      <Section title={t.catHeart} colors={colors}>
        <MGrid>
          <MetricCard label={t.mPulse} value={`${h.pulse}`} unit={t.bpm} color={valColor(h.pulse, 50, 100)} colors={colors} />
          <MetricCard label={t.mRestPulse} value={`${h.restPulse}`} unit={t.bpm} color={valColor(h.restPulse, 50, 85)} colors={colors} />
          <MetricCard label={t.mMaxPulse} value={`${h.maxPulse}`} unit={t.bpm} colors={colors} />
          <MetricCard label={t.mMinPulse} value={`${h.minPulse}`} unit={t.bpm} colors={colors} />
          <MetricCard label={t.mHrv} value={`${h.hrv}`} unit={t.ms} color={h.hrv < 30 ? '#f59e0b' : '#22c55e'} colors={colors} />
          <MetricCard label={t.mSpo2} value={`${h.spo2}`} unit={t.pct} color={h.spo2 < 95 ? colors.danger : h.spo2 < 97 ? '#f59e0b' : '#22c55e'} colors={colors} />
          <MetricCard label={t.mBpSys} value={`${h.bpSys}`} unit={t.mmHg} color={valColor(h.bpSys, 90, 140)} colors={colors} />
          <MetricCard label={t.mBpDia} value={`${h.bpDia}`} unit={t.mmHg} color={valColor(h.bpDia, 60, 90)} colors={colors} />
          <MetricCard label={t.mRespRate} value={`${h.respRate}`} unit={t.breathMin} color={valColor(h.respRate, 12, 20)} colors={colors} />
          <MetricCard label={t.mEcg} value={h.ecg.length > 12 ? h.ecg.slice(0, 12) + '…' : h.ecg} unit="" colors={colors} />
          <MetricCard label={t.mArrhythmia} value={h.arrhythmia ? t.yes : t.no} unit="" color={h.arrhythmia ? colors.danger : '#22c55e'} colors={colors} />
          <MetricCard label={t.mTrainPulse} value={`${h.trainPulse}`} unit={t.bpm} colors={colors} />
          <MetricCard label={t.mAvgDayPulse} value={`${h.avgDayPulse}`} unit={t.bpm} colors={colors} />
        </MGrid>
      </Section>

      {/* ── Temperature ── */}
      <Section title={t.catTemp} colors={colors} defaultOpen={false}>
        <MGrid>
          <MetricCard label={t.mBodyTemp} value={`${h.bodyTemp}`} unit="°C" color={h.bodyTemp > 37.0 ? '#f59e0b' : undefined} colors={colors} />
          <MetricCard label={t.mSkinTemp} value={`${h.skinTemp}`} unit="°C" colors={colors} />
        </MGrid>
      </Section>

      {/* ── Stress & Recovery ── */}
      <Section title={t.catStress} colors={colors}>
        <MGrid>
          <MetricCard label={t.mStress} value={`${h.stress}`} unit="/100" color={scaleColor(h.stress, 50, 70)} colors={colors} />
          <MetricCard label={t.mRecovery} value={`${h.recovery}`} unit="/100" color={h.recovery < 40 ? colors.danger : h.recovery < 60 ? '#f59e0b' : '#22c55e'} colors={colors} />
          <MetricCard label={t.mBodyBattery} value={`${h.bodyBattery}`} unit="/100" color={h.bodyBattery < 30 ? colors.danger : h.bodyBattery < 50 ? '#f59e0b' : '#22c55e'} colors={colors} />
        </MGrid>
      </Section>

      {/* ── Sleep ── */}
      <Section title={t.catSleep} colors={colors}>
        <MGrid>
          <MetricCard label={t.mSleepQuality} value={`${h.sleepQuality}`} unit="/100" color={h.sleepQuality < 50 ? colors.danger : h.sleepQuality < 70 ? '#f59e0b' : '#22c55e'} colors={colors} />
          <MetricCard label={t.mSleepDuration} value={`${h.sleepDuration}`} unit={t.hrs} color={h.sleepDuration < 6 ? colors.danger : h.sleepDuration < 7 ? '#f59e0b' : '#22c55e'} colors={colors} />
          <MetricCard label={t.mFallAsleep} value={h.fallAsleep} unit="" colors={colors} />
          <MetricCard label={t.mWakeUp} value={h.wakeUp} unit="" colors={colors} />
          <MetricCard label={t.mDeepSleep} value={`${h.deepSleep}`} unit={t.hrs} color={h.deepSleep < 1.0 ? '#f59e0b' : '#22c55e'} colors={colors} />
          <MetricCard label={t.mLightSleep} value={`${h.lightSleep}`} unit={t.hrs} colors={colors} />
          <MetricCard label={t.mRemSleep} value={`${h.remSleep}`} unit={t.hrs} colors={colors} />
          <MetricCard label={t.mNightWake} value={`${h.nightWake}`} unit={t.times} color={h.nightWake > 3 ? '#f59e0b' : undefined} colors={colors} />
          <MetricCard label={t.mDayNap} value={`${h.dayNap}`} unit={t.min} colors={colors} />
          <MetricCard label={t.mSnoring} value={`${h.snoring}`} unit={t.min} color={h.snoring > 30 ? '#f59e0b' : undefined} colors={colors} />
        </MGrid>
      </Section>

      {/* ── Physical Activity ── */}
      <Section title={t.catActivity} colors={colors}>
        <MGrid>
          <MetricCard label={t.mSteps} value={`${h.steps.toLocaleString()}`} unit={t.steps} color={h.steps < 5000 ? '#f59e0b' : '#22c55e'} colors={colors} />
          <MetricCard label={t.mDistance} value={`${h.distance}`} unit={t.km} colors={colors} />
          <MetricCard label={t.mFloors} value={`${h.floors}`} unit="" colors={colors} />
          <MetricCard label={t.mSedentary} value={`${Math.round(h.sedentary / 60)}`} unit={t.hrs} color={h.sedentary > 540 ? '#f59e0b' : undefined} colors={colors} />
          <MetricCard label={t.mActiveTime} value={`${h.activeTime}`} unit={t.min} colors={colors} />
          <MetricCard label={t.mModerateMin} value={`${h.moderateMin}`} unit={t.min} colors={colors} />
          <MetricCard label={t.mIntenseMin} value={`${h.intenseMin}`} unit={t.min} colors={colors} />
          <MetricCard label={t.mBurnedCal} value={`${h.burnedCal}`} unit={t.kcal} colors={colors} />
          <MetricCard label={t.mActiveCal} value={`${h.activeCal}`} unit={t.kcal} colors={colors} />
          <MetricCard label={t.mTotalEnergy} value={`${h.totalEnergy}`} unit={t.kcal} colors={colors} />
          <MetricCard label={t.mWalkPace} value={`${h.walkPace}`} unit={t.minKm} colors={colors} />
          <MetricCard label={t.mSpeed} value={`${h.speed}`} unit={t.kmH} colors={colors} />
          <MetricCard label={t.mCadence} value={`${h.cadence}`} unit={t.stepsMin} colors={colors} />
          <MetricCard label={t.mStrideLen} value={`${h.strideLen}`} unit={t.cm} colors={colors} />
        </MGrid>
      </Section>


      {/* ── Body Composition ── */}
      <Section title={t.catBody} colors={colors}>
        <MGrid>
          <MetricCard label={t.mWeight} value={`${h.weight}`} unit={t.kg} colors={colors} />
          <MetricCard label={t.mBmi} value={`${h.bmi}`} unit="kg/m²" color={h.bmi > 25 ? '#f59e0b' : undefined} colors={colors} />
          <MetricCard label={t.mFatPct} value={`${h.fatPct}`} unit={t.pct} color={h.fatPct > 30 ? '#f59e0b' : undefined} colors={colors} />
          <MetricCard label={t.mMuscleMass} value={`${h.muscleMass}`} unit={t.kg} colors={colors} />
          <MetricCard label={t.mBodyWater} value={`${h.bodyWater}`} unit={t.pct} colors={colors} />
          <MetricCard label={t.mBoneMass} value={`${h.boneMass}`} unit={t.kg} colors={colors} />
          <MetricCard label={t.mGlucose} value={`${h.glucose}`} unit="mmol/L" color={h.glucose > 6.5 ? colors.danger : h.glucose > 5.6 ? '#f59e0b' : undefined} colors={colors} />
        </MGrid>
      </Section>

      {/* ── Well-being ── */}
      <Section title={t.catWellbeing} colors={colors} defaultOpen={false}>
        <MGrid>
          <MetricCard label={t.mSymptoms} value={h.symptoms || t.none} unit="" colors={colors} />
          <MetricCard label={t.mDailyWell} value={`${h.dailyWell}`} unit="/10" color={h.dailyWell < 4 ? colors.danger : h.dailyWell < 6 ? '#f59e0b' : '#22c55e'} colors={colors} />
          <MetricCard label={t.mFatigue} value={`${h.fatigue}`} unit="/10" color={scaleColor(h.fatigue, 5, 7)} colors={colors} />
          <MetricCard label={t.mAnxiety} value={`${h.anxiety}`} unit="/10" color={scaleColor(h.anxiety, 5, 7)} colors={colors} />
          <MetricCard label={t.mMood} value={`${h.mood}`} unit="/10" color={h.mood < 4 ? colors.danger : h.mood < 6 ? '#f59e0b' : '#22c55e'} colors={colors} />
        </MGrid>
      </Section>

      {/* ── Nutrition & Habits ── */}
      <Section title={t.catNutrition} colors={colors} defaultOpen={false}>
        <MGrid>
          <MetricCard label={t.mWater} value={`${h.water}`} unit={t.ml} color={h.water < 1500 ? '#f59e0b' : '#22c55e'} colors={colors} />
          <MetricCard label={t.mFoodCal} value={`${h.foodCal}`} unit={t.kcal} colors={colors} />
          <MetricCard label={t.mCaffeine} value={`${h.caffeine}`} unit={t.mgDay} color={h.caffeine > 400 ? '#f59e0b' : undefined} colors={colors} />
          <MetricCard label={t.mAlcohol} value={`${h.alcohol}`} unit={t.times} color={h.alcohol > 2 ? '#f59e0b' : undefined} colors={colors} />
          <MetricCard label={t.mSmoking} value={`${h.smoking}`} unit={t.times} color={h.smoking > 0 ? colors.danger : '#22c55e'} colors={colors} />
          <MetricCard label={t.mMedsTaken} value={h.medsTaken ? t.yes : t.no} unit="" color={h.medsTaken ? '#22c55e' : '#f59e0b'} colors={colors} />
        </MGrid>
      </Section>

      {/* ── Women's Health (if applicable) ── */}
      {h.cycleDay !== null && (
        <Section title={t.catWomen} colors={colors} defaultOpen={false}>
          <MGrid>
            <MetricCard label={t.mCycleDay} value={`${h.cycleDay}`} unit="" colors={colors} />
            <MetricCard label={t.mOvulation} value={h.ovulation ? t.yes : t.no} unit="" colors={colors} />
          </MGrid>
        </Section>
      )}

      {/* ── Environment ── */}
      <Section title={t.catEnv} colors={colors} defaultOpen={false}>
        <MGrid>
          <MetricCard label={t.mNoise} value={`${h.noise}`} unit={t.dB} color={h.noise > 50 ? '#f59e0b' : undefined} colors={colors} />
          <MetricCard label={t.mSunExposure} value={`${h.sunExposure}`} unit={t.min} colors={colors} />
          <MetricCard label={t.mOutdoorTime} value={`${h.outdoorTime}`} unit={t.min} color={h.outdoorTime < 30 ? '#f59e0b' : undefined} colors={colors} />
          <MetricCard label={t.mLocation} value={h.location} unit="" colors={colors} />
        </MGrid>
      </Section>

      {/* ── Forecast Charts ── */}
      <Section title={t.forecastTitle} colors={colors}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: colors.textMuted }}>{t.mBpSys} + {t.mPulse}</div>
            <LineChart data1={h.bpTrend} data2={h.hrTrend} label1={t.bpTrend} label2={t.hrTrend} colors={colors} months={months} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: colors.textMuted }}>{t.mStress} + {t.mSleepDuration}</div>
            <LineChart data1={h.stressTrend} data2={h.sleepTrend.map((v) => v * 10)} label1={t.mStress} label2={`${t.mSleepDuration} (×10)`} colors={colors} months={months} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: colors.textMuted }}>{t.mSteps}</div>
            <LineChart data1={h.stepsTrend} data2={h.weightTrend.map((v) => v * 100)} label1={t.mSteps} label2={`${t.mWeight} (×100)`} colors={colors} months={months} />
          </div>
        </div>

        {/* Risk predictions */}
        {forecasts.length > 0 && (
          <div style={{ border: `1px solid ${colors.border}`, borderRadius: 10, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${colors.border}`, textAlign: 'left' }}>
                  <th style={{ padding: '10px 14px', color: colors.textMuted, fontWeight: 600 }}>{t.healthMetrics}</th>
                  <th style={{ padding: '10px 14px', color: colors.textMuted, fontWeight: 600 }}>{t.riskLevel}</th>
                  <th style={{ padding: '10px 14px', color: colors.textMuted, fontWeight: 600 }}>{t.prediction}</th>
                </tr>
              </thead>
              <tbody>
                {forecasts.map((f, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${colors.border}` }}>
                    <td style={{ padding: '10px 14px', fontWeight: 600 }}>{f.area}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ background: f.riskColor + '22', color: f.riskColor, padding: '3px 10px', borderRadius: 6, fontWeight: 600, fontSize: 12 }}>{f.risk}</span>
                    </td>
                    <td style={{ padding: '10px 14px', color: colors.textMuted }}>{f.pred}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* ── Visit History ── */}
      <Section title={t.visitHistory} colors={colors} defaultOpen={false}>
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
      </Section>
    </>
  );
}

/* ─── Page: Patients ─── */

function PatientsPage({ colors, t, lang, onOpenPatient, patients, onAddPatient }: { colors: Colors; t: Record<string, string>; lang: Lang; onOpenPatient: (id: number) => void; patients: PatientFull[]; onAddPatient: () => void }) {
  const [search, setSearch] = useState('');
  const filtered = patients.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const statusLabel = (s: string) => s === 'stable' ? t.stable : s === 'monitoring' ? t.monitoring : t.critical2;
  const statusColor = (s: string) => s === 'stable' ? '#22c55e' : s === 'monitoring' ? '#f59e0b' : colors.danger;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>{t.patientList}</h1>
        <button onClick={onAddPatient} style={{ border: 'none', borderRadius: 8, background: colors.button, color: '#fff', padding: '10px 18px', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
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
  const [patients, setPatients] = useState<PatientFull[]>(patientsData);
  const [showAddModal, setShowAddModal] = useState(false);

  const colors = useColors(theme);
  const t = translations[lang];

  const handleAddPatient = (data: { name: string; age: number; diagnosis: string; phone: string }) => {
    const basePatient = patientsData[0];
    const newId = Math.max(...patients.map((p) => p.id)) + 1;
    const today = new Date().toISOString().slice(0, 10);
    const newPatient: PatientFull = {
      ...basePatient,
      id: newId,
      name: data.name,
      age: data.age,
      diagnosis: data.diagnosis,
      diagnosisRu: data.diagnosis,
      status: 'stable',
      lastVisit: today,
      phone: data.phone || '-',
      medications: [],
      medicationsRu: [],
      visits: [],
      health: { ...basePatient.health },
    };
    setPatients((prev) => [newPatient, ...prev]);
  };

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

  const openAddModal = () => setShowAddModal(true);

  const renderPage = useCallback(() => {
    if (activeMenu === 'patients' && selectedPatientId !== null) {
      const patient = patients.find((p) => p.id === selectedPatientId);
      if (patient) return <PatientProfilePage patient={patient} colors={colors} t={t} lang={lang} onBack={() => { setSelectedPatientId(null); mainRef.current?.scrollTo(0, 0); }} />;
    }
    switch (activeMenu) {
      case 'dashboard': return <DashboardPage colors={colors} t={t} onAddPatient={openAddModal} />;
      case 'patients': return <PatientsPage colors={colors} t={t} lang={lang} patients={patients} onOpenPatient={(id) => { setSelectedPatientId(id); mainRef.current?.scrollTo(0, 0); }} onAddPatient={openAddModal} />;
      case 'chat': return <ChatPage colors={colors} t={t} />;
      case 'faq': return <FAQPage colors={colors} t={t} />;
      case 'settings': return <SettingsPage colors={colors} t={t} lang={lang} setLang={setLang} theme={theme} setTheme={setTheme} />;
    }
  }, [activeMenu, colors, t, lang, theme, selectedPatientId, patients]);

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
      {showAddModal && <AddPatientModal colors={colors} t={t} onClose={() => setShowAddModal(false)} onAdd={handleAddPatient} />}
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
