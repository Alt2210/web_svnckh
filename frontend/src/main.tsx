import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { Router } from './lib/navigation';
import { initializeAuth } from './services/auth.service';
import './styles/landing.css';
import './styles/motion.css';
import './styles/mobile.css';
import './styles/refinements.css';
import './styles/portal.css';
import './styles/events.css';

void initializeAuth();
createRoot(document.getElementById('root')!).render(
  <StrictMode><Router><AuthProvider><App /></AuthProvider></Router></StrictMode>,
);
