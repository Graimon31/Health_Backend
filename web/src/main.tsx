import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import theme from './theme/theme';
import Layout from './layout/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';

const queryClient = new QueryClient();

// Placeholder components
const Patients = () => <div style={{ padding: 20 }}><h1>Patients List</h1><p>Patient management coming soon...</p></div>;
const Chat = () => <div style={{ padding: 20 }}><h1>Chat</h1><p>Chat interface coming soon...</p></div>;
const FAQ = () => <div style={{ padding: 20 }}><h1>FAQ</h1><p>FAQ editor coming soon...</p></div>;

// Simple "App" component wrapper
function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="patients" element={<Patients />} />
        <Route path="chat" element={<Chat />} />
        <Route path="faq" element={<FAQ />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
