import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// --- VERCEL TOOLBAR KILLER (Definitive removal of injected dev tools) ---
const killVercelTools = () => {
  const selectors = [
    'vercel-toolbar',
    '#vercel-toolbar',
    '.vercel-toolbar',
    '[data-vercel-toolbar]',
    '[id^="vercel-toolbar"]',
    '[class^="vercel-toolbar"]',
    '#__next-live-feedback',
    '.v0-badge',
    '#vercel-live-feedback'
  ];
  
  selectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => el.remove());
  });
};

// Initial kill
killVercelTools();

// Continuous kill on mutations
const observer = new MutationObserver(() => {
  killVercelTools();
});
observer.observe(document.documentElement, { childList: true, subtree: true });

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
