import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { HelmetProvider } from 'react-helmet-async'
import { store } from './store'
import { AppInitializer } from './components/AppInitializer'
import { ToastContainer } from './components/ui/Toast'
import './index.css'
import App from './App.tsx'

// ── Theme initialization — runs synchronously before React renders ────────────
// This prevents the "flash of wrong theme" (FOWT) by applying the correct
// class to <html> before any paint occurs. Must run before createRoot().
;(function initTheme() {
  try {
    const stored = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDark = stored === 'dark' || (!stored && prefersDark)
    if (isDark) document.documentElement.classList.add('dark')
  } catch { /* localStorage unavailable */ }
})()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <Provider store={store}>
        <AppInitializer>
          <App />
        </AppInitializer>
        <ToastContainer />
      </Provider>
    </HelmetProvider>
  </StrictMode>,
)
