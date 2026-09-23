import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/globals.css'
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

// Auto-recover from deployment updates when dynamic chunk hashes change
if (typeof window !== 'undefined') {
  sessionStorage.removeItem('yogi_route_chunk_reload');

  window.addEventListener('vite:preloadError', (event) => {
    event.preventDefault();
    const count = Number(sessionStorage.getItem('yogi_preload_reload') || '0');
    if (count < 2) {
      sessionStorage.setItem('yogi_preload_reload', String(count + 1));
      window.location.reload();
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    const msg = String(event.reason?.message || event.reason || '');
    if (
      msg.includes('Failed to fetch dynamically imported module') ||
      msg.includes('Importing a module script failed') ||
      msg.includes('loading chunk')
    ) {
      const count = Number(sessionStorage.getItem('yogi_preload_reload') || '0');
      if (count < 2) {
        sessionStorage.setItem('yogi_preload_reload', String(count + 1));
        window.location.reload();
      }
    }
  });
}

startSocket();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
