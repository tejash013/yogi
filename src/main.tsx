import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { socketService } from '@/services/socket';

// Proactively warm up backend service on free hosting (Render) so mobile users experience zero cold-start delay
const apiBase = import.meta.env.VITE_API_URL || 'https://yogi-0a5s.onrender.com';
if (typeof window !== 'undefined' && apiBase) {
  fetch(`${apiBase}/health`, { mode: 'cors' }).catch(() => {});
}

const startSocket = () => {
  const token = localStorage.getItem('restaurantos-token');
  if (token) {
    socketService.connect();
  }
};

startSocket();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
