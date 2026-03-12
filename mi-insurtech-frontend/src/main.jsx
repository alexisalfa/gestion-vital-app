import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// AQUÍ ENCENDEMOS EL MOTOR DE IDIOMAS ANTES DE CARGAR LA APP
import './i18n';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)