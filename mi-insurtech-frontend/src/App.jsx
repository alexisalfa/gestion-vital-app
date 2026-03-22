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
import DashboardCharts from './components/DashboardCharts'; // <-- RECUPERADO
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

import ClientForm from './components/ClientForm';
import ReclamacionForm from './components/ReclamacionForm';

import { useClientes } from './hooks/useClientes';
import { usePolizas } from './hooks/usePolizas';
import { useReclamaciones } from './hooks/useReclamaciones';
import { useEmpresas } from './hooks/useEmpresas';
import { useAsesores } from './hooks/useAsesores';
import { useComisiones } from './hooks/useComisiones';
import { useConfiguracion } from './hooks/useConfiguracion';

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

  // 🧠 CEREBRITO CONECTADO: Ahora con API_BASE_URL para validar la licencia real
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
  const [polizasPendientesDashboard, setPolizasPendientesDashboard] = useState(0);
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

  // --- HOOKS OPERATIVOS RESTAURADOS ---
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

  const lossRatioData = useMemo(() => {
    const totalPrimas = statisticsSummaryData?.total_primas || 0;
    const totalSiniestros = reclamaciones.filter(r => r.estado_reclamacion === 'Pagada').reduce((acc, curr) => acc + (parseFloat(curr.monto_aprobado) || 0), 0);
    return { ratio: totalPrimas > 0 ? ((totalSiniestros / totalPrimas) * 100).toFixed(2) : 0, totalSiniestros };
  }, [statisticsSummaryData, reclamaciones]);

  const LANGUAGE_OPTIONS = [{ id: 'es', nombre: 'Español' }, { id: 'en', nombre: 'English' }];
  const CURRENCY_SYMBOL_OPTIONS = [{ id: '$', nombre: 'Dólar ($)' }, { id: 'Bs', nombre: 'Bolívar (Bs)' }];
  const DATE_FORMAT_OPTIONS = [{ id: 'DD/MM/YYYY', nombre: 'DD/MM/YYYY' }, { id: 'MM/DD/YYYY', nombre: 'MM/DD/YYYY' }, { id: 'YYYY-MM-DD', nombre: 'YYYY-MM-DD' }];
  const COUNTRY_OPTIONS = [{ id: 'VE', nombre: 'Venezuela' }, { id: 'US', nombre: 'Estados Unidos' }, { id: 'CO', nombre: 'Colombia' }];

  useEffect(() => {
    if (isAuthenticated) {
      const fetchGlobalData = async () => {
        try {
          const token = localStorage.getItem('access_token');
          const [statsRes, pendingRes] = await Promise.all([
            fetch(`${API_BASE_URL}/statistics/summary`, { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch(`${API_BASE_URL}/polizas?estado_filter=Pendiente&limit=999`, { headers: { 'Authorization': `Bearer ${token}` } })
          ]);
          if (statsRes.ok) setStatisticsSummaryData(await statsRes.json());
          if (pendingRes.ok) {
            const pendingData = await pendingRes.json();
            setPolizasPendientesDashboard(pendingData.length || 0);
          }
        } catch (error) { console.error("Error global:", error); }
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
      <Routes>
        <Route path="*" element={<><AuthPage onLoginSuccess={handleLoginSuccess} apiBaseUrl={API_BASE_URL} /><Toaster /></>} />
      </Routes>
    );
  }

  return (
    <ConfirmationProvider>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <nav className="bg-blue-600 text-white shadow-md sticky top-0 z-50 h-16 flex items-center px-4 justify-between">
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="flex items-center gap-2">
              <ShieldAlert className="h-6 w-6" />
              <span className="text-xl font-bold tracking-tight">Gestión Vital</span>
            </Link>
            <div className="hidden lg:flex gap-4">
              {['dashboard', 'clientes', 'polizas', 'comisiones', 'configuracion'].map(id => (
                <Link key={id} to={`/${id}`} className={`px-3 py-2 rounded-md text-sm font-bold transition-all ${currentPath === id ? 'bg-white/20' : 'hover:bg-white/10'}`}>
                  {id.charAt(0).toUpperCase() + id.slice(1).replace('configuracion', 'Ajustes')}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsAlertsOpen(true)} className="relative p-2"><Bell className="h-5 w-5" />{dineroEnLaCalle.cantidad > 0 && <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center border border-blue-600 font-bold">{dineroEnLaCalle.cantidad}</span>}</button>
            <Button onClick={handleLogout} variant="ghost" size="sm" className="text-white hover:bg-red-500">Salir</Button>
          </div>
        </nav>

        <main className="flex-1 p-6 max-w-[1400px] mx-auto w-full">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={
              <div className="space-y-6 animate-in fade-in duration-500">
                <Dashboard statistics={statisticsSummaryData} upcomingPolicies={polizasProximasAVencer} isLoadingStats={isLoadingStatisticsSummary} isLoadingUpcoming={isLoadingPolizasProximasAVencer} currencySymbol={currencySymbol} lossRatio={lossRatioData} />
                <div className="mt-8"><DashboardCharts polizas={polizas} reclamaciones={reclamaciones} empresas={empresasAseguradoras} /></div>
              </div>
            } />
            <Route path="/clientes" element={<ClientesPage apiBaseUrl={API_BASE_URL} clientes={clientes} totalClients={totalClients} isLoadingClients={isLoadingClients} fetchClientsData={fetchClientsData} handleClientDelete={handleClientDelete} handleClienteSearch={handleClienteSearch} handleClientePageChange={handleClientePageChange} clienteCurrentPage={clienteCurrentPage} clienteSearchTerm={clienteSearchTerm} clienteEmailFilter={clienteEmailFilter} itemsPerPage={CLIENTES_PER_PAGE} />} />
            <Route path="/polizas" element={<PolizasPage apiBaseUrl={API_BASE_URL} polizas={polizas} totalPolizas={totalPolizas} isLoadingPolicies={isLoadingPolicies} fetchPoliciesData={fetchPoliciesData} handlePolizaDelete={handlePolizaDelete} handlePolizaSearch={handlePolizaSearch} handlePolizaPageChange={handlePolizaPageChange} polizaCurrentPage={polizaCurrentPage} polizaSearchTerm={polizaSearchTerm} polizaTipoFilter={polizaTipoFilter} polizaEstadoFilter={polizaEstadoFilter} polizaClienteIdFilter={polizaClienteIdFilter} polizaFechaInicioFilter={polizaFechaInicioFilter} polizaFechaFinFilter={polizaFechaFinFilter} itemsPerPage={POLIZAS_PER_PAGE} clientes={clientes} empresasAseguradoras={empresasAseguradoras} asesores={asesores} currencySymbol={currencySymbol} />} />
            <Route path="/comisiones" element={<ComisionesPage apiBaseUrl={API_BASE_URL} comisiones={comisiones} polizas={polizas} asesores={asesores} currencySymbol={currencySymbol} />} />
            <Route path="/configuracion" element={<ConfiguracionPage selectedLanguage={selectedLanguage} currencySymbol={currencySymbol} dateFormat={dateFormat} selectedCountry={selectedCountry} licenseKey={licenseKey} isLicenseValid={isLicenseValid} setSelectedLanguage={setSelectedLanguage} setCurrencySymbol={setCurrencySymbol} setDateFormat={setDateFormat} setSelectedCountry={setSelectedCountry} setLicenseKey={setLicenseKey} saveSettings={saveSettings} LANGUAGE_OPTIONS={LANGUAGE_OPTIONS} CURRENCY_SYMBOL_OPTIONS={CURRENCY_SYMBOL_OPTIONS} DATE_FORMAT_OPTIONS={DATE_FORMAT_OPTIONS} COUNTRY_OPTIONS={COUNTRY_OPTIONS} MASTER_LICENSE_KEY={MASTER_LICENSE_KEY} />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>

        <div className="fixed bottom-8 right-8 z-40">
          <Button onClick={() => setIsQuickMenuOpen(!isQuickMenuOpen)} className={`h-16 w-16 rounded-full shadow-2xl transition-all ${isQuickMenuOpen ? 'rotate-45 bg-red-500' : 'bg-blue-600 shadow-blue-200'}`}><Plus className="h-8 w-8 text-white" /></Button>
          {isQuickMenuOpen && (
            <div className="absolute bottom-20 right-0 space-y-3">
              <button onClick={() => handleOpenQuickAdd('cliente')} className="bg-white px-5 py-3 rounded-full shadow-xl border font-bold text-sm text-slate-700 flex items-center gap-2 transition-transform hover:scale-105"><UserPlus size={16} className="text-blue-600"/> Nuevo Cliente</button>
              <button onClick={() => handleOpenQuickAdd('siniestro')} className="bg-white px-5 py-3 rounded-full shadow-xl border font-bold text-sm text-slate-700 flex items-center gap-2 transition-transform hover:scale-105"><AlertCircle size={16} className="text-red-600"/> Nuevo Siniestro</button>
            </div>
          )}
        </div>

        {quickAddModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden p-6 relative animate-in zoom-in-95 duration-200">
              <button onClick={handleCloseQuickAdd} className="absolute top-4 right-4 p-2 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"><X size={20}/></button>
              <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2"><Zap className="text-amber-500" /> {quickAddModal === 'cliente' ? 'Registro Exprés' : 'Reporte Rápido'}</h2>
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