import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

/* =========================================
   MOCK DATA GENERATION
========================================= */
const rInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const genTrend = (len: number, start: number, min: number, max: number, volatility: number) => {
  let arr = [start];
  for(let i=1; i<len; i++) {
    let next = arr[i-1] + rInt(-volatility, volatility);
    if(next < min) next = min;
    if(next > max) next = max;
    arr.push(next);
  }
  return arr;
};

const PATIENTS = [
  {
    id: 'p1', name: 'Иван Иванов', age: 54, initials: 'ИИ',
    tags: ['Гипертония', 'ХСН'], meds: ['Enalapril 10 мг', 'Bisoprolol 5 мг'],
    globalStatus: 'critical',
    metrics: {
      bp: { cat: 'clinical', title: 'АД', unit: 'мм рт. ст.', type: 'dual', val1: genTrend(30, 140, 110, 195, 10), val2: genTrend(30, 90, 70, 110, 5), threshold: '< 130/80', time: '5 мин назад', quality: 'Устройство: 98%' },
      hr: { cat: 'clinical', title: 'Пульс', unit: 'уд/мин', type: 'single', val: genTrend(30, 75, 60, 120, 8), threshold: '60 - 90', time: '12 мин назад', quality: 'Устройство: 99%' },
      spo2: { cat: 'clinical', title: 'SpO₂', unit: '%', type: 'single', val: genTrend(30, 96, 88, 100, 2), threshold: '> 94%', time: '1 час назад', quality: 'Сигнал: средний' },
      weight: { cat: 'clinical', title: 'Вес', unit: 'кг', type: 'single', val: genTrend(30, 84, 82, 86, 1), threshold: 'Цель: 80 кг', time: 'Вчера', quality: 'Домашние весы' },
      temp: { cat: 'clinical', title: 'Температура', unit: '°C', type: 'single', val: genTrend(30, 366, 360, 385, 4).map(v=>v/10), threshold: '36.5 - 37.2', time: '3 ч назад', quality: 'Термометр' },
      sleep: { cat: 'context', title: 'Сон', unit: 'ч', type: 'single', val: genTrend(30, 6, 3, 9, 2), threshold: '> 7 ч', time: 'Сегодня утром', quality: 'Браслет' },
      activity: { cat: 'context', title: 'Активность', unit: 'шагов', type: 'single', val: genTrend(30, 4000, 1000, 10000, 2000), threshold: '> 7000', time: 'Вчера', quality: 'Браслет' },
      stress: { cat: 'context', title: 'Стресс', unit: '%', type: 'single', val: genTrend(30, 50, 20, 90, 10), threshold: '< 40%', time: 'Вчера', quality: 'Индекс HRV' }
    }
  },
  {
    id: 'p2', name: 'Анна Смирнова', age: 41, initials: 'АС',
    tags: ['Тахикардия', 'СД 2 типа'], meds: ['Metformin 500 мг'],
    globalStatus: 'warning',
    metrics: {
      bp: { cat: 'clinical', title: 'АД', unit: 'мм рт. ст.', type: 'dual', val1: genTrend(30, 120, 110, 135, 5), val2: genTrend(30, 80, 70, 85, 3), threshold: '< 130/80', time: '2 ч назад', quality: 'Ок' },
      hr: { cat: 'clinical', title: 'Пульс', unit: 'уд/мин', type: 'single', val: genTrend(30, 95, 80, 115, 5), threshold: '60 - 90', time: '10 мин назад', quality: 'Apple Watch' },
      spo2: { cat: 'clinical', title: 'SpO₂', unit: '%', type: 'single', val: genTrend(30, 98, 96, 100, 1), threshold: '> 94%', time: '2 ч назад', quality: 'Ок' },
      weight: { cat: 'clinical', title: 'Вес', unit: 'кг', type: 'single', val: genTrend(30, 65, 64, 66, 1), threshold: 'Стабильно', time: '3 дня назад', quality: 'Ок' },
      temp: { cat: 'clinical', title: 'Температура', unit: '°C', type: 'single', val: genTrend(30, 366, 364, 370, 2).map(v=>v/10), threshold: '36.5 - 37.2', time: 'Вчера', quality: 'Ок' },
      sleep: null, // Test NO DATA state
      activity: { cat: 'context', title: 'Активность', unit: 'шагов', type: 'single', val: genTrend(30, 8000, 5000, 12000, 1500), threshold: '> 7000', time: 'Вчера', quality: 'Apple Watch' },
      stress: { cat: 'context', title: 'Стресс', unit: '%', type: 'single', val: genTrend(30, 60, 40, 80, 5), threshold: '< 40%', time: 'Вчера', quality: 'Индекс HRV' }
    }
  },
  {
    id: 'p3', name: 'Елена Петрова', age: 62, initials: 'ЕП',
    tags: ['Здорова'], meds: ['Витамин D'],
    globalStatus: 'normal',
    metrics: {
      bp: { cat: 'clinical', title: 'АД', unit: 'мм рт. ст.', type: 'dual', val1: genTrend(30, 115, 110, 125, 4), val2: genTrend(30, 75, 70, 80, 3), threshold: '< 130/80', time: 'Вчера', quality: 'Ок' },
      hr: { cat: 'clinical', title: 'Пульс', unit: 'уд/мин', type: 'single', val: genTrend(30, 68, 60, 75, 3), threshold: '60 - 90', time: 'Вчера', quality: 'Ок' },
      spo2: { cat: 'clinical', title: 'SpO₂', unit: '%', type: 'single', val: genTrend(30, 99, 97, 100, 1), threshold: '> 94%', time: 'Вчера', quality: 'Ок' },
      weight: { cat: 'clinical', title: 'Вес', unit: 'кг', type: 'single', val: genTrend(30, 60, 59, 61, 0.5), threshold: 'Стабильно', time: 'Неделю назад', quality: 'Ок' },
      temp: { cat: 'clinical', title: 'Температура', unit: '°C', type: 'single', val: genTrend(30, 365, 364, 368, 2).map(v=>v/10), threshold: '36.5 - 37.2', time: 'Вчера', quality: 'Ок' },
      sleep: { cat: 'context', title: 'Сон', unit: 'ч', type: 'single', val: genTrend(30, 8, 7, 9, 1), threshold: '> 7 ч', time: 'Сегодня утром', quality: 'Ок' },
      activity: { cat: 'context', title: 'Активность', unit: 'шагов', type: 'single', val: genTrend(30, 10000, 8000, 12000, 1000), threshold: '> 7000', time: 'Вчера', quality: 'Ок' },
      stress: { cat: 'context', title: 'Стресс', unit: '%', type: 'single', val: genTrend(30, 20, 10, 30, 5), threshold: '< 40%', time: 'Вчера', quality: 'Ок' }
    }
  }
];

// Generate 12 more generic normal patients
for(let i=4; i<=15; i++) {
  PATIENTS.push({
    id: 'p'+i, name: `Пациент ${i}`, age: rInt(30, 70), initials: `П${i}`,
    tags: ['Наблюдение'], meds: [], globalStatus: 'normal',
    metrics: PATIENTS[2].metrics // copy normal metrics for simplicity
  });
}

const statusLabels: Record<string, string> = { 'normal': 'Норма', 'warning': 'Внимание', 'critical': 'Критично', 'nodata': 'Нет данных' };

function calcStats(arr: number[] | null, days: number) {
  if(!arr || arr.length === 0) return {cur:0, min:0, max:0, avg:0, delta:0, rawSlice: []};
  const slice = arr.slice(-days);
  const cur = slice[slice.length-1];
  const min = Math.min(...slice);
  const max = Math.max(...slice);
  const avg = slice.reduce((a,b)=>a+b,0)/slice.length;
  // fake delta
  const prevSlice = arr.slice(-Math.min(days*2, arr.length), -days);
  const prevAvg = prevSlice.length ? prevSlice.reduce((a,b)=>a+b,0)/prevSlice.length : avg;
  let delta = prevAvg ? ((avg - prevAvg)/prevAvg)*100 : 0;

  // Format based on value scale
  const fmt = (v: number) => v > 200 ? v.toFixed(0) : v % 1 === 0 ? v : v.toFixed(1);
  return {
    cur: fmt(cur), min: fmt(min), max: fmt(max),
    avg: fmt(avg), delta: Math.round(delta),
    rawSlice: slice
  };
}

function determineStatus(key: string, curVal: number, val2: number | null = null) {
  if (key === 'bp' && val2 !== null) {
    if(curVal > 160 || val2 > 100) return 'critical';
    if(curVal > 135 || val2 > 85) return 'warning';
    return 'normal';
  }
  if (key === 'hr') {
    if(curVal > 120 || curVal < 45) return 'critical';
    if(curVal > 95 || curVal < 55) return 'warning';
    return 'normal';
  }
  if (key === 'spo2') {
    if(curVal < 92) return 'critical';
    if(curVal < 95) return 'warning';
    return 'normal';
  }
  if (key === 'stress') {
    if(curVal > 70) return 'warning';
    return 'normal';
  }
  if (key === 'sleep') {
    if(curVal < 5) return 'warning';
    return 'normal';
  }
  return 'normal';
}

const ICONS: Record<string, React.ReactNode> = {
  info: <><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></>,
  clinical: <><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></>,
  activity: <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></>,
  sleep: <><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></>,
  device: <><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></>,
  context: <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></> // Fallback
};

const COLORS: Record<string, string> = {
  normal: '#38D67A', warning: '#FFB020', critical: '#FF4D4F'
};

function setupCanvas(canvas: HTMLCanvasElement) {
  const rect = canvas.parentElement!.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(dpr, dpr);
  return { ctx, w: rect.width, h: rect.height };
}

function drawSparkline(canvas: HTMLCanvasElement | null, data: number[], status: string) {
  if (!canvas || !data || data.length < 2) return;
  const { ctx, w, h } = setupCanvas(canvas);

  const color = COLORS[status] || COLORS.normal;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = (max - min) || 1;

  const pad = 4;
  const step = (w - pad*2) / (data.length - 1);

  const pts = data.map((v, i) => ({
    x: pad + i * step,
    y: pad + (h - pad*2) - ((v - min) / range) * (h - pad*2)
  }));

  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, color + '33');
  grad.addColorStop(1, color + '00');

  ctx.beginPath();
  ctx.moveTo(pts[0].x, h);
  pts.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.lineTo(pts[pts.length-1].x, h);
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  pts.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.stroke();

  const endP = pts[pts.length-1];
  ctx.beginPath();
  ctx.arc(endP.x, endP.y, 3, 0, Math.PI*2);
  ctx.fillStyle = '#fff';
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = color;
  ctx.stroke();
}

function drawSparklineDual(canvas: HTMLCanvasElement | null, data1: number[], data2: number[], status: string) {
  if (!canvas || !data1 || data1.length < 2) return;
  const { ctx, w, h } = setupCanvas(canvas);

  const color1 = COLORS[status] || COLORS.normal;
  const color2 = 'rgba(255,255,255,0.3)';

  const min = Math.min(...data1, ...data2);
  const max = Math.max(...data1, ...data2);
  const range = (max - min) || 1;
  const pad = 4;
  const step = (w - pad*2) / (data1.length - 1);

  const getPts = (arr: number[]) => arr.map((v, i) => ({
    x: pad + i * step,
    y: pad + (h - pad*2) - ((v - min) / range) * (h - pad*2)
  }));

  const pts1 = getPts(data1);
  const pts2 = getPts(data2);

  ctx.beginPath();
  ctx.moveTo(pts2[0].x, pts2[0].y);
  pts2.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.strokeStyle = color2;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, color1 + '33');
  grad.addColorStop(1, color1 + '00');

  ctx.beginPath();
  ctx.moveTo(pts1[0].x, pts1[0].y);
  pts1.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.strokeStyle = color1;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(pts1[0].x, pts1[0].y);
  pts1.forEach(p => ctx.lineTo(p.x, p.y));
  for(let i = pts2.length-1; i>=0; i--) {
    ctx.lineTo(pts2[i].x, pts2[i].y);
  }
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(pts1[pts1.length-1].x, pts1[pts1.length-1].y, 3, 0, Math.PI*2);
  ctx.fillStyle = '#fff';
  ctx.fill();
}


function SparklineChart({ data, data2, status, type }: { data: number[], data2?: number[], status: string, type: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let timeoutId: number;
    const render = () => {
      if (type === 'dual' && data2) {
        drawSparklineDual(canvasRef.current, data, data2, status);
      } else {
        drawSparkline(canvasRef.current, data, status);
      }
    };

    render();

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(render, 200);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [data, data2, status, type]);

  return (
    <div className="mc-chart">
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}


function App() {
  const [currentPatientId, setCurrentPatientId] = useState('p1');
  const [periodDays, setPeriodDays] = useState(30);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const p = PATIENTS.find(p => p.id === currentPatientId)!;

  const filteredPatients = PATIENTS.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  let alerts: any[] = [];
  Object.keys(p.metrics).forEach(key => {
    const m = (p.metrics as any)[key];
    if(!m) return;
    const stats = calcStats(m.val || m.val1, periodDays);
    const stats2 = m.val2 ? calcStats(m.val2, periodDays) : null;
    const status = determineStatus(key, Number(stats.cur), stats2 ? Number(stats2.cur) : null);

    if(status === 'critical') {
      alerts.push({ key, m, stats, stats2 });
    }
  });

  const metricKeys = ['bp', 'hr', 'spo2', 'weight', 'temp', 'sleep', 'activity', 'stress'];

  return (
    <div className="app-container">
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`} id="sidebar">
        <div className="logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          HealthCodex
        </div>

        <nav className="nav-menu">
          <a className="nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
            Панель
          </a>
          <a className="nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Пациенты
          </a>
          <a className="nav-item active">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            Измерения
          </a>
          <a className="nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Чат
          </a>
        </nav>

        <div className="patient-search">
          <div className="search-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="text"
              className="search-input"
              placeholder="Поиск пациента..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="patient-list">
          {filteredPatients.map(pat => (
            <div key={pat.id} className={`patient-item ${pat.id === currentPatientId ? 'active' : ''}`} onClick={() => {
              setCurrentPatientId(pat.id);
              if (window.innerWidth <= 1024) setIsSidebarOpen(false);
            }}>
              <div className="pat-head">
                <div className="pat-name">
                  <div className={`status-dot ${pat.globalStatus}`}></div>
                  {pat.name}
                </div>
                <div style={{fontSize: '12px', color: 'var(--textTertiary)'}}>{pat.age} л.</div>
              </div>
              <div className="pat-tags">
                {pat.tags.map(t => <span key={t} className="micro-chip">{t}</span>)}
                {pat.globalStatus === 'critical' && <span className="micro-chip alert">Тревога</span>}
              </div>
            </div>
          ))}
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div style={{display: 'flex', alignItems: 'center'}}>
            <button className="mobile-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <h1 className="page-title">Измерения</h1>
          </div>

          <div className="controls-group">
            <div className="segmented-control">
              <button className={`seg-btn ${periodDays === 7 ? 'active' : ''}`} onClick={() => setPeriodDays(7)}>7 дней</button>
              <button className={`seg-btn ${periodDays === 14 ? 'active' : ''}`} onClick={() => setPeriodDays(14)}>14 дней</button>
              <button className={`seg-btn ${periodDays === 30 ? 'active' : ''}`} onClick={() => setPeriodDays(30)}>30 дней</button>
            </div>
            <button className="btn" onClick={() => setIsModalOpen(true)}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              Пороги пациента
            </button>
          </div>
        </header>

        <div className="scroll-area">
          <div className="patient-header">
            <div className="ph-left">
              <div className="avatar">{p.initials}</div>
              <div className="ph-info">
                <h2>
                  {p.name}
                  <span className={`status-pill ${p.globalStatus}`} style={{fontSize: '10px', marginLeft: '8px'}}>{statusLabels[p.globalStatus]}</span>
                </h2>
                <div className="ph-meta">{p.age} лет • Последняя синхронизация: 5 мин назад</div>
                <div className="ph-tags">
                  {p.tags.map(t => (
                    <span key={t} className="micro-chip" style={{background: 'var(--glassMed)'}}>
                      <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" style={{verticalAlign: 'middle', marginRight: '2px'}}><circle cx="12" cy="12" r="10"/></svg>{t}
                    </span>
                  ))}
                  {p.meds.map(t => (
                    <span key={t} className="micro-chip" style={{background: 'var(--glassMed)'}}>
                      <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" style={{verticalAlign: 'middle', marginRight: '2px'}}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="ph-actions">
              <button className="btn"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>Связаться</button>
              <button className="btn"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>Заметка</button>
            </div>
          </div>

          <div className={`alerts-wrapper ${alerts.length > 0 ? 'active' : ''}`}>
            <div className="alerts-title">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              Критично сейчас / Требует реакции
            </div>
            <div className="alerts-grid">
              {alerts.map(a => {
                const valStr = a.stats2 ? `${a.stats.cur} / ${a.stats2.cur}` : a.stats.cur;
                return (
                  <div key={a.key} className="alert-card">
                    <div className="alert-head">
                      <span className="alert-metric">{a.m.title}</span>
                      <span className="alert-time">{a.m.time}</span>
                    </div>
                    <div className="alert-value">{valStr} <span className="alert-unit">{a.m.unit}</span></div>
                    <div className="alert-desc">
                      <span>Порог: {a.m.threshold}</span>
                      <span>Δ {periodDays}д: {a.stats.delta > 0 ? '+'+a.stats.delta : a.stats.delta}%</span>
                    </div>
                    <div className="alert-actions">
                      <button className="btn btn-critical" style={{padding: '4px 8px', fontSize: '11px'}}>Связаться</button>
                      <button className="btn" style={{padding: '4px 8px', fontSize: '11px'}}>Эскалация</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="filter-bar">
            <button className={`filter-chip ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>Все</button>
            <button className={`filter-chip ${filter === 'alerts' ? 'active' : ''}`} onClick={() => setFilter('alerts')}>Только тревоги</button>
            <button className={`filter-chip ${filter === 'clinical' ? 'active' : ''}`} onClick={() => setFilter('clinical')}>Клинические</button>
            <button className={`filter-chip ${filter === 'context' ? 'active' : ''}`} onClick={() => setFilter('context')}>Контекст</button>
          </div>

          <div className="metrics-grid">
            {metricKeys.map(key => {
              const m = (p.metrics as any)[key];

              if (filter === 'clinical' && m && m.cat !== 'clinical') return null;
              if (filter === 'context' && m && m.cat !== 'context') return null;

              if (!m) {
                if(filter === 'alerts') return null;
                return (
                  <div key={key} className="metric-card" data-status="nodata">
                    <div className="mc-header">
                      <div className="mc-title">{key.toUpperCase()} <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
                      <div className="status-pill nodata">Нет данных</div>
                    </div>
                    <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', opacity: 0.6, padding: '20px 0'}}>
                       <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" style={{marginBottom: '10px', strokeWidth: 1}}><path d="M2 12h4l2-3 4 6 2-3h4"/></svg>
                       <button className="btn" style={{fontSize: '11px'}}>Запросить измерение</button>
                    </div>
                  </div>
                );
              }

              const stats = calcStats(m.val || m.val1, periodDays);
              const stats2 = m.val2 ? calcStats(m.val2, periodDays) : null;
              const status = determineStatus(key, Number(stats.cur), stats2 ? Number(stats2.cur) : null);

              if (filter === 'alerts' && status === 'normal') return null;

              const deltaCls = stats.delta > 0 ? (key==='bp'||key==='hr'||key==='stress' ? 'up bad' : 'up good') : (key==='bp'||key==='hr'||key==='stress' ? 'down good' : 'down bad');
              const deltaSign = stats.delta > 0 ? '+' : '';
              const iconNode = ICONS[m.cat] || ICONS.info;

              return (
                <div key={key} className="metric-card" data-category={m.cat} data-status={status}>
                  <div className="mc-header">
                    <div className="mc-title">{m.title} <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">{iconNode}</svg></div>
                    <div className={`status-pill ${status}`}>{statusLabels[status]}</div>
                  </div>
                  <div className="mc-value-row">
                    <div className="mc-value">
                      {stats.cur}
                      {stats2 && <span style={{fontSize: '0.6em', color: 'var(--textTertiary)'}}> / {stats2.cur}</span>}
                    </div>
                    <div className="mc-unit">{m.unit}</div>
                  </div>
                  <div className="mc-time">Последнее: {m.time}</div>

                  <SparklineChart
                    data={stats.rawSlice}
                    data2={stats2?.rawSlice}
                    status={status}
                    type={m.type}
                  />

                  <div className="mc-footer">
                    <div className="mc-stats">
                      <span>Мин: {stats.min}</span>
                      <span>Сред: {stats.avg}</span>
                    </div>
                    <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
                      <span className={`mc-trend ${deltaCls}`}>{deltaSign}{stats.delta}%</span>
                      <span className="mc-quality" title={m.quality}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor">{ICONS.device}</svg></span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {isModalOpen && (
        <div className="modal-overlay active">
          <div className="modal-content">
            <h3 style={{marginBottom: '16px'}}>Настройка порогов</h3>
            <p style={{color: 'var(--textSecondary)', marginBottom: '24px', fontSize: '13px'}}>Индивидуальные клинические рамки для текущего пациента. (Заглушка)</p>
            <div style={{display: 'flex', justifyContent: 'flex-end', gap: '8px'}}>
              <button className="btn" onClick={() => setIsModalOpen(false)}>Закрыть</button>
              <button className="btn btn-primary" onClick={() => setIsModalOpen(false)}>Сохранить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
