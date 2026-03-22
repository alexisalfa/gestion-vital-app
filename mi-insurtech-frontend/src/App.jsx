// src/App.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate, Link } from 'react-router-dom';
import { useGlobal } from './context/GlobalContext'; 

import AuthPage from './components/AuthPage';
import ClientesPage from './pages/ClientesPage';
import AsesoresPage from './pages/AsesoresPage';
import PolizasPage from './pages/PolizasPage';
import ReclamacionesPage from './pages/ReclamacionesPage';
import EmpresasAseguradorasPage from './pages/EmpresasAseguradorasPage';
import ComisionesPage from './pages/ComisionesPage';
import ConfiguracionPage from './pages/ConfiguracionPage';
import Dashboard from './components/Dashboard';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/lib/use-toast';
import { ConfirmationProvider } from './components/ConfirmationContext';
import { ShieldAlert, Bell, X, AlertCircle, CheckCircle2, Plus, UserPlus, Zap, MessageCircle, DollarSign, Mail, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

// 🧠 IMPORTACIÓN DEL CEREBRITO (Hook de Gestión de Configuración)
import { useConfiguracion } from './hooks/useConfiguracion';

function App() {
  const { API_BASE_URL, MASTER_LICENSE_KEY } = useGlobal();
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  // 🧠 ACTIVACIÓN DEL CEREBRITO
  // El Líder (App.jsx) delega toda la lógica de configuración a este hook.
  const {
    selectedLanguage, currencySymbol, dateFormat, selectedCountry, licenseKey, isLicenseValid,
    setSelectedLanguage, setCurrencySymbol, setDateFormat, setSelectedCountry, setLicenseKey, saveSettings
  } = useConfiguracion(MASTER_LICENSE_KEY, i18n);

  // Estados de Autenticación y Datos
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('access_token'));
  const [comisiones, setComisiones] = useState([]);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);

  // --- 🦾 BLINDAJE CONTRA EL ERROR toLowerCase ---
  // Calculamos el "Dinero en la Calle" de forma defensiva para evitar la pantalla blanca.
  const dineroEnLaCalle = useMemo(() => {
    if (!comisiones || !Array.isArray(comisiones)) return { cantidad: 0, total: 0 };
    
    const pendientes = comisiones.filter(c => 
      c && c.estatus_pago && String(c.estatus_pago).toLowerCase() === 'pendiente'
    );
    
    const total = pendientes.reduce((sum, c) => sum + (parseFloat(c.monto_final) || 0), 0);
    return { cantidad: pendientes.length, total };
  }, [comisiones]);

  // Opciones de configuración (Constantes para la jerarquía)
  const LANGUAGE_OPTIONS = [
    { id: 'es', nombre: 'Español' },
    { id: 'en', nombre: 'English' }
  ];

  const CURRENCY_OPTIONS = [
    { id: '$', nombre: 'Dólar ($)' },
    { id: 'Bs', nombre: 'Bolívar (Bs)' }
  ];

  // Sincronización de Comisiones para las alertas
  useEffect(() => {
    if (isAuthenticated) {
      const fetchComisiones = async () => {
        try {
          const token = localStorage.getItem('access_token');
          const res = await fetch(`${API_BASE_URL}/comisiones?limit=999`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setComisiones(data);
          }
        } catch (e) { console.error("Error cargando alertas:", e); }
      };
      fetchComisiones();
    }
  }, [isAuthenticated, API_BASE_URL]);

  const handleLoginSuccess = () => setIsAuthenticated(true);
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setIsAuthenticated(false);
    navigate('/login');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AuthPage onLoginSuccess={handleLoginSuccess} apiBaseUrl={API_BASE_URL} />
        <Toaster />
      </div>
    );
  }

  return (
    <ConfirmationProvider>
      <div className="flex flex-col min-h-screen bg-[#f8fafc]">
        {/* --- HEADER PRINCIPAL (LIDERAZGO VISUAL) --- */}
        <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-md">
          <div className="container flex h-16 items-center justify-between px-4 max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center space-x-2">
                <div className="bg-indigo-600 p-1.5 rounded-lg shadow-indigo-200 shadow-lg">
                  <ShieldAlert className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-black tracking-tighter text-slate-800">GESTIÓN VITAL</span>
              </Link>
            </div>

            <nav className="hidden md:flex items-center space-x-1">
              <Link to="/polizas" className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">Pólizas</Link>
              <Link to="/comisiones" className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">Cobranza</Link>
              <Link to="/configuracion" className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">Configuración</Link>
            </nav>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative" onClick={() => setIsAlertsOpen(!isAlertsOpen)}>
                <Bell className="h-5 w-5 text-slate-600" />
                {dineroEnLaCalle.cantidad > 0 && (
                  <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {dineroEnLaCalle.cantidad}
                  </span>
                )}
              </Button>
              <Button onClick={handleLogout} variant="ghost" className="text-slate-500 font-bold hover:text-red-600">Salir</Button>
            </div>
          </div>
        </header>

        {/* --- CUERPO DEL SISTEMA --- */}
        <main className="flex-1 container max-w-7xl mx-auto py-8 px-4">
          <Routes>
            <Route path="/" element={<Dashboard apiBaseUrl={API_BASE_URL} currencySymbol={currencySymbol} />} />
            <Route path="/clientes" element={<ClientesPage apiBaseUrl={API_BASE_URL} />} />
            <Route path="/asesores" element={<AsesoresPage apiBaseUrl={API_BASE_URL} />} />
            <Route path="/polizas" element={<PolizasPage apiBaseUrl={API_BASE_URL} currencySymbol={currencySymbol} />} />
            <Route path="/siniestros" element={<ReclamacionesPage apiBaseUrl={API_BASE_URL} />} />
            <Route path="/companias" element={<EmpresasAseguradorasPage apiBaseUrl={API_BASE_URL} />} />
            <Route path="/comisiones" element={<ComisionesPage apiBaseUrl={API_BASE_URL} currencySymbol={currencySymbol} />} />
            
            {/* 🎯 ORQUESTACIÓN DE CONFIGURACIÓN */}
            <Route path="/configuracion" element={
              <ConfiguracionPage 
                {...{
                  selectedLanguage, currencySymbol, dateFormat, selectedCountry, licenseKey, isLicenseValid,
                  setSelectedLanguage, setCurrencySymbol, setDateFormat, setSelectedCountry, setLicenseKey,
                  saveSettings, MASTER_LICENSE_KEY
                }}
                LANGUAGE_OPTIONS={LANGUAGE_OPTIONS}
                CURRENCY_SYMBOL_OPTIONS={CURRENCY_OPTIONS}
              />
            } />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        <Toaster />
      </div>
    </ConfirmationProvider>
  );
}

export default App;