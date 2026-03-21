// src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// AQUÍ ENCENDEMOS EL MOTOR DE IDIOMAS ANTES DE CARGAR LA APP
import './i18n';

// IMPORTAMOS LA NUBE GLOBAL (FASE 3)
import { GlobalProvider } from './context/GlobalContext';

// INJERTO FASE 4: Importamos el enrutador
import { BrowserRouter } from 'react-router-dom';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GlobalProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </GlobalProvider>
  </StrictMode>,
)