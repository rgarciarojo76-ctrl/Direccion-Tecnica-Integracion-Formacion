import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// --- VERCEL TOOLBAR KILLER (Shadow DOM Aware) ---
const killVercelTools = () => {
  const selectors = [
    'vercel-toolbar', '#vercel-toolbar', '.vercel-toolbar',
    '[data-vercel-toolbar]', '[id^="vercel-toolbar"]', '[class^="vercel-toolbar"]',
    '[id*="vercel"]', '[class*="vercel"]',
    '#__next-live-feedback', '#vercel-live-feedback', '.v0-badge'
  ];

  const clean = (root) => {
    if (!root) return;
    selectors.forEach(sel => {
      try {
        root.querySelectorAll(sel).forEach(el => el.remove());
      } catch (e) {}
    });
    // Recursive Shadow DOM walk
    try {
      root.querySelectorAll('*').forEach(el => {
        if (el.shadowRoot) clean(el.shadowRoot);
      });
    } catch (e) {}
  };

  clean(document);
};

// Continuous kill on mutations
const observer = new MutationObserver(() => killVercelTools());
observer.observe(document.documentElement, { childList: true, subtree: true });

// Initial kill after short delay to catch platform injections
setTimeout(killVercelTools, 100);
setTimeout(killVercelTools, 1000);
setTimeout(killVercelTools, 5000);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
