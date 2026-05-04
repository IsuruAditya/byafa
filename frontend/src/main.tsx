import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { HelmetProvider } from 'react-helmet-async'
import { store } from './store'
import { AppInitializer } from './components/AppInitializer'
import { ToastContainer } from './components/ui/Toast'
import './index.css'
import App from './App.tsx'

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
