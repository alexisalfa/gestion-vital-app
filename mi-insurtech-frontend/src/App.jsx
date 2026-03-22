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
import { ShieldAlert, Bell, X, AlertCircle, CheckCircle2, Plus, UserPlus, Zap, MessageCircle, DollarSign, Mail, Menu, Settings2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

// --- NUEVOS HOOKS ---
import { useClientes } from './hooks/useClientes';
import { usePolizas } from './hooks/usePolizas';
import { useReclamaciones } from './hooks/useReclamaciones';
import { useEmpresas } from './hooks/useEmpresas';
import { useAsesores } from './hooks/useAsesores';
import { useComisiones } from './hooks/useComisiones';
import { useConfiguracion } from './hooks/useConfiguracion';

import ClientForm from './components/ClientForm';
import ReclamacionForm from './components/ReclamacionForm';

const CLIENTES_PER_PAGE = 10;
const POLIZAS_PER_PAGE = 10;
const RECLAMACIONES_PER_PAGE = 10;
const EMPRESAS_ASEGURADORAS_PER_PAGE = 10;
const ASESORES_PER_PAGE = 10;
const COMISIONES_PER_PAGE = 10;

function App() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname.replace('/', '') || 'dashboard';

  const { API_BASE_URL, MASTER_LICENSE_KEY } = useGlobal();

  // 🧠 ACTIVACIÓN DEL CEREBRITO (CORREGIDO: Ahora recibe API_BASE_URL para validar el pago)
  const {
    selectedLanguage, currencySymbol, dateFormat, selectedCountry, licenseKey, isLicenseValid,
    setSelectedLanguage, setCurrencySymbol, setDateFormat, setSelectedCountry, setLicenseKey, saveSettings
  } = useConfiguracion(MASTER_LICENSE_KEY, i18n, API_BASE_URL);

  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('access_token'));
  const [editingClient, setEditingClient] = useState(null);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);
  const [quickAddModal, setQuickAddModal] = useState(null); 

  const [statisticsSummaryData, setStatisticsSummaryData] = useState(null);
  const [isLoadingStatisticsSummary, setIsLoadingStatisticsSummary] = useState(true);
  const [polizasProximasAVencer, setPolizasProximasAVencer] = useState([]);
  const [isLoadingPolizasProximasAVencer, setIsLoadingPolizasProximasAVencer] = useState(true);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('access_token');
    setIsAuthenticated(false);
    navigate('/');
  }, [navigate]);

  const handleLoginSuccess = useCallback(() => {
    setIsAuthenticated(true);
    navigate('/dashboard');
  }, [navigate]);

  // --- HOOKS OPERATIVOS ---
  const { clientes, totalClients, isLoadingClients, clienteSearchTerm, clienteEmailFilter, clienteCurrentPage, fetchClientsData, handleClientDelete, handleClienteSearch, handleClientePageChange } = useClientes(API_BASE_URL, handleLogout);
  const { polizas, totalPolizas, isLoadingPolicies, polizaSearchTerm, polizaTipoFilter, polizaEstadoFilter, polizaClienteIdFilter, polizaFechaInicioFilter, polizaFechaFinFilter, polizaCurrentPage, fetchPoliciesData, handlePolizaDelete, handlePolizaSearch, handlePolizaPageChange } = usePolizas(API_BASE_URL, handleLogout);
  const { reclamaciones, totalReclamaciones, isLoadingReclamaciones, reclamacionSearchTerm, reclamacionEstadoFilter, fetchClaimsData, handleReclamacionDelete, handleReclamacionSearch, handleReclamacionPageChange } = useReclamaciones(API_BASE_URL, handleLogout);
  const { empresasAseguradoras, totalEmpresasAseguradoras, isLoadingCompanies, empresaAseguradoraSearchTerm, empresaAseguradoraCurrentPage, fetchInsuranceCompaniesData, handleEmpresaAseguradoraDelete, handleEmpresaAseguradoraSearch, handleEmpresaAseguradoraPageChange } = useEmpresas(API_BASE_URL, handleLogout);
  const { asesores, totalAsesores, isLoadingAdvisors, asesorSearchTerm, asesorCurrentPage, fetchAdvisorsData, handleAsesorDelete, handleAsesorSearch, handleAsesorPageChange } = useAsesores(API_BASE_URL, handleLogout);
  const { comisiones } = useComisiones(API_BASE_URL, handleLogout, polizas, asesores);

  const dineroEnLaCalle = useMemo(() => {
    if (!comisiones || !Array.isArray(comisiones)) return { cantidad: 0, total: 0 };
    const pendientes = comisiones.filter(c => c && c.estatus_pago && String(c.estatus_pago).toLowerCase() === 'pendiente');
    return { cantidad: pendientes.length, total: pendientes.reduce((sum, c) => sum + (parseFloat(c.monto_final) || 0), 0) };
  }, [comisiones]);

  const LANGUAGE_OPTIONS = [{ id: 'es', nombre: 'Español' }, { id: 'en', nombre: 'English' }];
  const CURRENCY_SYMBOL_OPTIONS = [{ id: '$', nombre: 'Dólar ($)' }, { id: 'Bs', nombre: 'Bolívar (Bs)' }];
  const DATE_FORMAT_OPTIONS = [{ id: 'DD/MM/YYYY', nombre: 'Día/Mes/Año' }, { id: 'MM/DD/YYYY', nombre: 'Mes/Día/Año' }];
  const COUNTRY_OPTIONS = [{ id: 'VE', nombre: 'Venezuela' }, { id: 'US', nombre: 'Estados Unidos' }];

  useEffect(() => {
    if (isAuthenticated) {
      const fetchGlobalData = async () => {
        try {
          const token = localStorage.getItem('access_token');
          const res = await fetch(`${API_BASE_URL}/statistics/summary`, { headers: { 'Authorization': `Bearer ${token}` } });
          if (res.ok) setStatisticsSummaryData(await res.json());
        } catch (error) { console.error(error); }
        finally { setIsLoadingStatisticsSummary(false); }
      };
      fetchGlobalData();
      if (currentPath === 'dashboard') {
        const fetchUpcoming = async () => {
          try {
            const token = localStorage.getItem('access_token');
            const res = await fetch(`${API_BASE_URL}/proximas_a_vencer?days_out=30`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (res.ok) setPolizasProximasAVencer(await res.json());
          } catch (e) { console.error(e); }
          finally { setIsLoadingPolizasProximasAVencer(false); }
        };
        fetchUpcoming();
      }
    }
  }, [isAuthenticated, currentPath, API_BASE_URL]);

  const handleOpenQuickAdd = (type) => { setQuickAddModal(type); setIsQuickMenuOpen(false); };
  const handleCloseQuickAdd = () => setQuickAddModal(null);

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
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-md">
          <div className="container flex h-16 items-center justify-between px-4 max-w-7xl mx-auto">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-indigo-600 p-1.5 rounded-lg shadow-lg">
                <ShieldAlert className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-black text-slate-800">GESTIÓN VITAL</span>
            </Link>
            <nav className="hidden lg:flex items-center space-x-1">
              {[
                { path: '/', label: 'Dashboard' },
                { path: '/clientes', label: 'Clientes' },
                { path: '/polizas', label: 'Pólizas' },
                { path: '/comisiones', label: 'Cobranza' },
                { path: '/configuracion', label: 'Ajustes' }
              ].map((item) => (
                <Link key={item.path} to={item.path} className={`px-4 py-2 text-sm font-bold rounded-lg ${location.pathname === item.path ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'}`}>
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative" onClick={() => setIsAlertsOpen(!isAlertsOpen)}>
                <Bell className="h-5 w-5 text-slate-600" />
                {dineroEnLaCalle.cantidad > 0 && <span className="absolute top-2 right-2 h-4 w-4 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-white">{dineroEnLaCalle.cantidad}</span>}
              </Button>
              <Button onClick={handleLogout} variant="ghost" className="text-slate-500 font-bold">Salir</Button>
            </div>
          </div>
        </header>

        <main className="flex-1 container max-w-7xl mx-auto py-8 px-4">
          <Routes>
            <Route path="/" element={<Dashboard statistics={statisticsSummaryData} upcomingPolicies={polizasProximasAVencer} isLoadingStats={isLoadingStatisticsSummary} currencySymbol={currencySymbol} />} />
            <Route path="/clientes" element={<ClientesPage apiBaseUrl={API_BASE_URL} clientes={clientes} totalClients={totalClients} isLoadingClients={isLoadingClients} fetchClientsData={fetchClientsData} handleClientDelete={handleClientDelete} handleClienteSearch={handleClienteSearch} handleClientePageChange={handleClientePageChange} clienteCurrentPage={clienteCurrentPage} clienteSearchTerm={clienteSearchTerm} clienteEmailFilter={clienteEmailFilter} itemsPerPage={CLIENTES_PER_PAGE} />} />
            <Route path="/polizas" element={<PolizasPage apiBaseUrl={API_BASE_URL} polizas={polizas} totalPolizas={totalPolizas} isLoadingPolicies={isLoadingPolicies} fetchPoliciesData={fetchPoliciesData} handlePolizaDelete={handlePolizaDelete} handlePolizaSearch={handlePolizaSearch} handlePolizaPageChange={handlePolizaPageChange} polizaCurrentPage={polizaCurrentPage} polizaSearchTerm={polizaSearchTerm} polizaTipoFilter={polizaTipoFilter} polizaEstadoFilter={polizaEstadoFilter} polizaClienteIdFilter={polizaClienteIdFilter} polizaFechaInicioFilter={polizaFechaInicioFilter} polizaFechaFinFilter={polizaFechaFinFilter} itemsPerPage={POLIZAS_PER_PAGE} clientes={clientes} empresasAseguradoras={empresasAseguradoras} asesores={asesores} currencySymbol={currencySymbol} />} />
            <Route path="/comisiones" element={<ComisionesPage apiBaseUrl={API_BASE_URL} comisiones={comisiones} polizas={polizas} asesores={asesores} currencySymbol={currencySymbol} />} />
            
            <Route path="/configuracion" element={
              <ConfiguracionPage 
                selectedLanguage={selectedLanguage} 
                currencySymbol={currencySymbol} 
                dateFormat={dateFormat} 
                selectedCountry={selectedCountry} 
                licenseKey={licenseKey} 
                isLicenseValid={isLicenseValid} 
                setSelectedLanguage={setSelectedLanguage} 
                setCurrencySymbol={setCurrencySymbol} 
                setDateFormat={setDateFormat} 
                setSelectedCountry={setSelectedCountry} 
                setLicenseKey={setLicenseKey} 
                saveSettings={saveSettings} 
                LANGUAGE_OPTIONS={LANGUAGE_OPTIONS} 
                CURRENCY_SYMBOL_OPTIONS={CURRENCY_SYMBOL_OPTIONS} 
                DATE_FORMAT_OPTIONS={DATE_FORMAT_OPTIONS} 
                COUNTRY_OPTIONS={COUNTRY_OPTIONS} 
                MASTER_LICENSE_KEY={MASTER_LICENSE_KEY} 
              />
            } />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        
        <div className="fixed bottom-8 right-8 z-40">
          <Button onClick={() => setIsQuickMenuOpen(!isQuickMenuOpen)} className="h-16 w-16 rounded-2xl shadow-2xl bg-indigo-600 hover:bg-indigo-700">
            <Plus className="h-8 w-8 text-white" />
          </Button>
          {isQuickMenuOpen && (
            <div className="absolute bottom-20 right-0 space-y-3">
              <button onClick={() => handleOpenQuickAdd('cliente')} className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl shadow-xl border font-bold text-sm text-slate-700">Nuevo Cliente</button>
              <button onClick={() => handleOpenQuickAdd('siniestro')} className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl shadow-xl border font-bold text-sm text-slate-700">Nuevo Siniestro</button>
            </div>
          )}
        </div>

        {quickAddModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden p-6 relative">
              <button onClick={handleCloseQuickAdd} className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-red-100"><X size={20} /></button>
              {quickAddModal === 'cliente' ? <ClientForm apiBaseUrl={API_BASE_URL} onClientSaved={handleCloseQuickAdd} /> : <ReclamacionForm apiBaseUrl={API_BASE_URL} clientes={clientes} polizas={polizas} onReclamacionSaved={handleCloseQuickAdd} />}
            </div>
          </div>
        )}
        <Toaster />
      </div>
    </ConfirmationProvider>
  );
}

export default App;