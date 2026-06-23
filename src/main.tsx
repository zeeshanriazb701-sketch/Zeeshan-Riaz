if (typeof window !== 'undefined') {
  const silentErrorHandler = (msg: any, url: any, line: any, col: any, error: any) => {
    const messageStr = String(msg || '');
    const urlStr = String(url || '');
    if (
      messageStr === 'Script error.' || 
      messageStr.includes('Script error') || 
      urlStr.includes('chrome-extension') || 
      urlStr.includes('google') ||
      !urlStr
    ) {
      return true; // Suppress error propagation
    }
    return false;
  };
  window.onerror = silentErrorHandler;

  window.addEventListener('error', (event) => {
    // Suppress cross-origin system/extension errors and noisy iframe errors
    if (
      event.message === 'Script error.' || 
      event.message?.includes('Script error') || 
      event.filename?.includes('chrome-extension') ||
      event.filename?.includes('google') ||
      !event.filename
    ) {
      event.stopImmediatePropagation();
      event.preventDefault();
    }
  }, true);

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason?.message || '';
    if (reason.includes('Script error') || reason.includes('extension') || !reason) {
      event.stopImmediatePropagation();
      event.preventDefault();
    }
  }, true);
}

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
