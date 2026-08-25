import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './app/App.tsx'
import { AuthProvider } from './app/AuthContext.tsx'
import { ensureFbc } from './lib/analytics.ts'

// Captura el fbclid del anuncio en la cookie _fbc antes del primer render:
// sin ella Meta reporta baja cobertura de emparejamiento.
ensureFbc()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
