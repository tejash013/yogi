import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { socketService } from '@/services/socket';

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
