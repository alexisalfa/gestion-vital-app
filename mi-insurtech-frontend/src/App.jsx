// src/App.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate, Link } from 'react-router-dom'; // <-- FASE 4
import { useGlobal } from './context/GlobalContext'; // <-- FASE 3

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
import { saveAs } from 'file-saver';
import { ShieldAlert, Bell, X, AlertCircle, CheckCircle2, Plus, UserPlus, Zap, MessageCircle, DollarSign, Mail, Menu, Settings2, ShieldCheck } from 'lucide-react';
import DashboardCharts from './components/DashboardCharts';
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

const LANGUAGE_OPTIONS = [{ id: 'es', nombre: 'Español' }, { id: 'en', nombre: 'English' }];
const DATE_FORMAT_OPTIONS = [{ id: 'DD/MM/YYYY', nombre: 'DD/MM/YYYY' }, { id: 'MM/DD/YYYY', nombre: 'MM/DD/YYYY' }, { id: 'YYYY-MM-DD', nombre: 'YYYY-MM-DD' }];
const CURRENCY_SYMBOL_OPTIONS = [{ id: '$', nombre: '$ (Dólar)' }, { id: 'Bs', nombre: 'Bs (Bolívar Soberano)' }, { id: '€', nombre: '€ (Euro)' }, { id: 'S/', nombre: 'S/ (Sol Peruano)' }, { id: 'COP', nombre: 'COP (Peso Colombiano)' }];
const COUNTRY_OPTIONS = [{ id: 'VE', nombre: 'Venezuela' }, { id: 'CO', nombre: 'Colombia' }, { id: 'PE', nombre: 'Perú' }, { id: 'US', nombre: 'Estados Unidos' }, { id: 'ES', nombre: 'España' }, { id: 'MX', nombre: 'México' }, { id: 'AR', nombre: 'Argentina' }, { id: 'CL', nombre: 'Chile' }, { id: 'EC', nombre: 'Ecuador' }, { id: 'PA', nombre: 'Panamá' }];

function App() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  
  // FASE 4: Herramientas de Navegación
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname.replace('/', '') || 'dashboard';

  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('access_token'));
  
  const [editingClient, setEditingClient] = useState(null);
  const [editingPoliza, setEditingPoliza] = useState(null);
  const [editingReclamacion, setEditingReclamacion] = useState(null);
  const [editingEmpresaAseguradora, setEditingEmpresaAseguradora] = useState(null);
  const [editingAsesor, setEditingAsesor] = useState(null);
  const [editingComision, setEditingComision] = useState(null); 
  
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [quickAddModal, setQuickAddModal] = useState(null); 

  const handleCloseQuickAdd = () => { setQuickAddModal(null); setIsQuickMenuOpen(false); };

  const [statisticsSummaryData, setStatisticsSummaryData] = useState(null);
  const [isLoadingStatisticsSummary, setIsLoadingStatisticsSummary] = useState(true);
  const [polizasProximasAVencer, setPolizasProximasAVencer] = useState([]);
  const [polizasPendientesDashboard, setPolizasPendientesDashboard] = useState(0);
  const [isLoadingPolizasProximasAVencer, setIsLoadingPolizasProximasAVencer] = useState(true);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('access_token');
    setIsAuthenticated(false);
    navigate('/');
    toast({ title: "Sesión Cerrada", description: "Has cerrado tu sesión exitosamente.", variant: "info" });
  }, [toast, navigate]);

  const handleLoginSuccess = useCallback(() => {
    setIsAuthenticated(true);
    navigate('/dashboard');
    toast({ title: "Inicio de Sesión Exitoso", description: "¡Bienvenido de nuevo!", variant: "success" });
  }, [toast, navigate]);

  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      const requestUrl = args[0] || ""; 
      if (response.status === 401 && typeof requestUrl === 'string' && !requestUrl.includes('/login') && !requestUrl.includes('/token')) {
        localStorage.removeItem('access_token');
        window.location.href = "/"; 
      }
      return response;
    };
    return () => { window.fetch = originalFetch; };
  }, []);

  // FASE 3: Consumimos la Nube Global
  const { API_BASE_URL, MASTER_LICENSE_KEY } = useGlobal();

  // 🧠 ACTIVACIÓN DEL CEREBRITO: Él toma el mando de la configuración
  const {
    selectedLanguage, currencySymbol, dateFormat, selectedCountry, licenseKey, isLicenseValid,
    setSelectedLanguage, setCurrencySymbol, setDateFormat, setSelectedCountry, setLicenseKey, saveSettings
  } = useConfiguracion(MASTER_LICENSE_KEY, i18n, API_BASE_URL);

  const { clientes, totalClients, isLoadingClients, clienteSearchTerm, clienteEmailFilter, clienteCurrentPage, setClienteSearchTerm, setClienteEmailFilter, fetchClientsData, handleClientDelete, handleClienteSearch, handleClientePageChange } = useClientes(API_BASE_URL, handleLogout);
  const { polizas, totalPolizas, isLoadingPolicies, polizaSearchTerm, polizaTipoFilter, polizaEstadoFilter, polizaClienteIdFilter, polizaFechaInicioFilter, polizaFechaFinFilter, polizaCurrentPage, setPolizaSearchTerm, setPolizaTipoFilter, setPolizaEstadoFilter, setPolizaClienteIdFilter, setPolizaFechaInicioFilter, setPolizaFechaFinFilter, fetchPoliciesData, handlePolizaDelete, handlePolizaSearch, handlePolizaPageChange } = usePolizas(API_BASE_URL, handleLogout);
  const { reclamaciones, totalReclamaciones, isLoadingReclamaciones, reclamacionSearchTerm, reclamacionEstadoFilter, reclamacionClienteIdFilter, reclamacionPolizaIdFilter, reclamacionFechaReclamacionInicioFilter, reclamacionFechaReclamacionFinFilter, reclamacionCurrentPage, setReclamacionSearchTerm, setReclamacionEstadoFilter, setReclamacionClienteIdFilter, setReclamacionPolizaIdFilter, setReclamacionFechaReclamacionInicioFilter, setReclamacionFechaReclamacionFinFilter, fetchClaimsData, handleReclamacionDelete, handleReclamacionSearch, handleReclamacionPageChange } = useReclamaciones(API_BASE_URL, handleLogout);
  const { empresasAseguradoras, totalEmpresasAseguradoras, isLoadingCompanies, empresaAseguradoraSearchTerm, empresaAseguradoraCurrentPage, setEmpresaAseguradoraSearchTerm, fetchInsuranceCompaniesData, handleEmpresaAseguradoraDelete, handleEmpresaAseguradoraSearch, handleEmpresaAseguradoraPageChange } = useEmpresas(API_BASE_URL, handleLogout);
  const { asesores, totalAsesores, isLoadingAdvisors, asesorSearchTerm, asesorCurrentPage, setAsesorSearchTerm, fetchAdvisorsData, handleAsesorDelete, handleAsesorSearch, handleAsesorPageChange } = useAsesores(API_BASE_URL, handleLogout);
  const { comisiones, totalComisiones, isLoadingComisiones, comisionAsesorIdFilter, comisionEstadoPagoFilter, comisionFechaInicioFilter, comisionFechaFinFilter, comisionCurrentPage, setComisionAsesorIdFilter, setComisionEstadoPagoFilter, setComisionFechaInicioFilter, setComisionFechaFinFilter, setComisionCurrentPage, fetchCommissionsData, handleDeleteComision } = useComisiones(API_BASE_URL, handleLogout, polizas, asesores);

  const fetchPolizasPendientesDashboard = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/polizas?estado_filter=Pendiente&limit=999`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) {
        const data = await response.json();
        const items = Array.isArray(data) ? data : (data.items || []);
        setPolizasPendientesDashboard(items.filter(p => p.estado === 'Pendiente').length);
      }
    } catch (error) { console.error("Error al buscar pólizas pendientes:", error); }
  }, [API_BASE_URL]);

  const fetchStatisticsSummaryData = useCallback(async () => {
    setIsLoadingStatisticsSummary(true);
    const token = localStorage.getItem('access_token');
    if (!token) { setIsLoadingStatisticsSummary(false); return; }
    try {
      const response = await fetch(`${API_BASE_URL}/statistics/summary`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!response.ok) { if (response.status === 401) { handleLogout(); return; } throw new Error(`Error ${response.status}`); }
      setStatisticsSummaryData(await response.json());
    } catch (error) { setStatisticsSummaryData(null); } 
    finally { setIsLoadingStatisticsSummary(false); }
  }, [handleLogout, API_BASE_URL]);

  const fetchUpcomingPoliciesData = useCallback(async (days = 30) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    setIsLoadingPolizasProximasAVencer(true);
    try {
      const response = await fetch(`${API_BASE_URL}/proximas_a_vencer?days_out=${days}`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (response.status === 401) { handleLogout(); return; }
      if (!response.ok) throw new Error(`Error ${response.status}`);
      const data = await response.json();
      setPolizasProximasAVencer(Array.isArray(data) ? data : []);
    } catch (error) { console.error(error.message); } 
    finally { setIsLoadingPolizasProximasAVencer(false); }
  }, [handleLogout, API_BASE_URL]);

  const lossRatioData = useMemo(() => {
    const totalPrimas = statisticsSummaryData?.total_primas || 0;
    const totalSiniestros = reclamaciones.filter(r => r.estado_reclamacion === 'Pagada').reduce((acc, curr) => acc + (parseFloat(curr.monto_aprobado) || 0), 0);
    return { ratio: totalPrimas > 0 ? ((totalSiniestros / totalPrimas) * 100).toFixed(2) : 0, totalSiniestros };
  }, [statisticsSummaryData, reclamaciones]);

  const dineroEnLaCalle = useMemo(() => {
    // 🦾 BLINDAJE: Agregamos ?. y una validación extra para evitar el error toLowerCase
    const pendientes = comisiones.filter(c => 
      c && c.estatus_pago && String(c.estatus_pago).toLowerCase() === 'pendiente'
    );
    const total = pendientes.reduce((sum, c) => sum + (parseFloat(c.monto_final) || 0), 0);
    return { cantidad: pendientes.length, total };
  }, [comisiones]);

  const totalAlerts = (polizasProximasAVencer?.length || 0) + (statisticsSummaryData?.total_reclamaciones_pendientes || 0) + (dineroEnLaCalle.cantidad > 0 ? 1 : 0) + (polizasPendientesDashboard > 0 ? 1 : 0);

  const getDateFormatOptions = (format) => {
    switch (format) {
      case 'MM/DD/YYYY': return { month: '2-digit', day: '2-digit', year: 'numeric' };
      case 'YYYY-MM-DD': return { year: 'numeric', month: '2-digit', day: '2-digit' };
      default: return { day: '2-digit', month: '2-digit', year: 'numeric' };
    }
  };

  // Efecto Sincronizador adaptado a RUTAS
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchStatisticsSummaryData();
    fetchPolizasPendientesDashboard();

    if (currentPath === 'dashboard') {
      fetchUpcomingPoliciesData();
    } else if (currentPath === 'clientes') {
      fetchClientsData((clienteCurrentPage - 1) * CLIENTES_PER_PAGE, CLIENTES_PER_PAGE, clienteSearchTerm, clienteEmailFilter);
    } else if (currentPath === 'polizas') {
      fetchClientsData(0, 9999, '', ''); fetchInsuranceCompaniesData(0, 9999, ''); fetchAdvisorsData(0, 9999, '');
      fetchPoliciesData((polizaCurrentPage - 1) * POLIZAS_PER_PAGE, POLIZAS_PER_PAGE, polizaSearchTerm, polizaTipoFilter, polizaEstadoFilter, polizaClienteIdFilter, polizaFechaInicioFilter, polizaFechaFinFilter);
    } else if (currentPath === 'reclamaciones') {
      fetchPoliciesData(0, 9999, '', '', '', '', '', ''); fetchClientsData(0, 9999, '', '');
      fetchClaimsData((reclamacionCurrentPage - 1) * RECLAMACIONES_PER_PAGE, RECLAMACIONES_PER_PAGE, reclamacionSearchTerm, reclamacionEstadoFilter, reclamacionPolizaIdFilter, reclamacionFechaReclamacionInicioFilter, reclamacionFechaReclamacionFinFilter);
    } else if (currentPath === 'empresas-aseguradoras') {
      fetchInsuranceCompaniesData((empresaAseguradoraCurrentPage - 1) * EMPRESAS_ASEGURADORAS_PER_PAGE, EMPRESAS_ASEGURADORAS_PER_PAGE, empresaAseguradoraSearchTerm);
    } else if (currentPath === 'asesores') {
      fetchInsuranceCompaniesData(0, 9999, ''); fetchAdvisorsData((asesorCurrentPage - 1) * ASESORES_PER_PAGE, ASESORES_PER_PAGE, asesorSearchTerm);
    } else if (currentPath === 'comisiones') {
      fetchAdvisorsData(0, 9999, ''); fetchPoliciesData(0, 9999, '', '', '', '', '', '');
      fetchCommissionsData((comisionCurrentPage - 1) * COMISIONES_PER_PAGE, COMISIONES_PER_PAGE, comisionAsesorIdFilter, comisionEstadoPagoFilter, comisionFechaInicioFilter, comisionFechaFinFilter);
    }
  }, [
    isAuthenticated, 
    currentPath, 
    clienteCurrentPage, 
    polizaCurrentPage, 
    reclamacionCurrentPage, 
    empresaAseguradoraCurrentPage, 
    asesorCurrentPage, 
    comisionCurrentPage
  ]);

  const handleClientSaved = useCallback(() => {
    setEditingClient(null); fetchClientsData((clienteCurrentPage - 1) * CLIENTES_PER_PAGE, CLIENTES_PER_PAGE, clienteSearchTerm, clienteEmailFilter); fetchStatisticsSummaryData();
  }, [clienteCurrentPage, clienteSearchTerm, clienteEmailFilter, fetchClientsData, fetchStatisticsSummaryData]);

  const handlePolizaSaved = useCallback(() => {
    setEditingPoliza(null); fetchPoliciesData((polizaCurrentPage - 1) * POLIZAS_PER_PAGE, POLIZAS_PER_PAGE, polizaSearchTerm, polizaTipoFilter, polizaEstadoFilter, polizaClienteIdFilter, polizaFechaInicioFilter, polizaFechaFinFilter); fetchStatisticsSummaryData(); fetchUpcomingPoliciesData(); fetchPolizasPendientesDashboard();
  }, [polizaCurrentPage, polizaSearchTerm, polizaTipoFilter, polizaEstadoFilter, polizaClienteIdFilter, polizaFechaInicioFilter, polizaFechaFinFilter, fetchPoliciesData, fetchStatisticsSummaryData, fetchUpcomingPoliciesData, fetchPolizasPendientesDashboard]);

  const handleReclamacionSaved = useCallback(() => {
    setEditingReclamacion(null); fetchClaimsData((reclamacionCurrentPage - 1) * RECLAMACIONES_PER_PAGE, RECLAMACIONES_PER_PAGE, reclamacionSearchTerm, reclamacionEstadoFilter, reclamacionPolizaIdFilter, reclamacionFechaReclamacionInicioFilter, reclamacionFechaReclamacionFinFilter); fetchStatisticsSummaryData();
  }, [reclamacionCurrentPage, reclamacionSearchTerm, reclamacionEstadoFilter, reclamacionPolizaIdFilter, reclamacionFechaReclamacionInicioFilter, reclamacionFechaReclamacionFinFilter, fetchClaimsData, fetchStatisticsSummaryData]);

  const handleEmpresaAseguradoraSaved = useCallback(async () => {
    setEditingEmpresaAseguradora(null); await fetchInsuranceCompaniesData((empresaAseguradoraCurrentPage - 1) * EMPRESAS_ASEGURADORAS_PER_PAGE, EMPRESAS_ASEGURADORAS_PER_PAGE, empresaAseguradoraSearchTerm); await fetchStatisticsSummaryData(); toast({ title: "Operación Exitosa", description: "La empresa ha sido procesada." });
  }, [empresaAseguradoraCurrentPage, empresaAseguradoraSearchTerm, fetchInsuranceCompaniesData, fetchStatisticsSummaryData, toast]);

  const handleAsesorSaved = useCallback(async () => {
    setEditingAsesor(null); await fetchAdvisorsData((asesorCurrentPage - 1) * ASESORES_PER_PAGE, ASESORES_PER_PAGE, asesorSearchTerm); await fetchStatisticsSummaryData(); toast({ title: "Asesor Guardado", description: "Los datos del asesor se han actualizado." });
  }, [asesorCurrentPage, asesorSearchTerm, fetchAdvisorsData, fetchStatisticsSummaryData, toast]);

  const handleEditComision = useCallback((comision) => { setEditingComision(comision); window.scrollTo({ top: 0, behavior: 'smooth' }); }, []);
  
  const handleComisionSaved = useCallback(() => {
    setEditingComision(null); fetchCommissionsData((comisionCurrentPage - 1) * COMISIONES_PER_PAGE, COMISIONES_PER_PAGE, comisionAsesorIdFilter, comisionEstadoPagoFilter, comisionFechaInicioFilter, comisionFechaFinFilter); fetchStatisticsSummaryData();
  }, [comisionCurrentPage, comisionAsesorIdFilter, comisionEstadoPagoFilter, comisionFechaInicioFilter, comisionFechaFinFilter, fetchCommissionsData, fetchStatisticsSummaryData]);

  const handleWhatsAppNotificacion = (poliza) => {
    const cliente = clientes.find(c => String(c.id) === String(poliza.cliente_id));
    const nombreCliente = cliente ? `${cliente.nombre} ${cliente.apellido || ''}`.trim() : 'Estimado Cliente';
    const telefono = cliente?.telefono ? cliente.telefono.replace(/\D/g, '') : '';
    if (!telefono) { toast({ title: "Atención", description: "Este cliente no tiene un teléfono registrado.", variant: "destructive" }); return; }
    const fechaVencimiento = new Date(poliza.fecha_fin).toLocaleDateString('es-ES', getDateFormatOptions(dateFormat));
    const mensaje = `Hola ${nombreCliente}, soy tu asesor de Gestión Vital 🛡️. Te escribo para recordarte que tu póliza Nro: *${poliza.numero_poliza}* está próxima a vencer el *${fechaVencimiento}*. ¿Te ayudo con la renovación para que sigas protegido?`;
    window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  const handleEmailNotificacion = async (polizaId) => {
    const token = localStorage.getItem('access_token');
    try {
      toast({ title: "Enviando...", description: "Preparando y enviando el correo al cliente.", variant: "info" });
      const response = await fetch(`${API_BASE_URL}/polizas/${polizaId}/recordatorio`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) {
        toast({ title: "¡Correo Enviado! ✉️", description: (await response.json()).message, variant: "success" });
      } else {
        toast({ title: "Error al enviar", description: (await response.json()).detail || "No se pudo enviar el correo.", variant: "destructive" });
      }
    } catch (error) { toast({ title: "Error de conexión", description: "Fallo al conectar con el servidor.", variant: "destructive" }); }
  };

  const exportToCsv = useCallback((data, filename, headers) => {
    if (!data || data.length === 0) return;
    const csvHeaders = headers.map(h => h.label).join(',');
    const getNestedValue = (obj, path) => path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined) ? acc[part] : null, obj);
    const csvRows = data.map(row => headers.map(header => {
        let value = getNestedValue(row, header.key);
        if (header.type === 'date' && value) { value = new Date(value).toLocaleDateString(selectedLanguage === 'en' ? 'en-US' : 'es-ES', getDateFormatOptions(dateFormat)); }
        return `"${String(value || '').replace(/"/g, '""')}"`;
      }).join(','));
    saveAs(new Blob([[csvHeaders, ...csvRows].join('\n')], { type: 'text/csv;charset=utf-8;' }), `${filename}.csv`);
  }, [dateFormat, selectedLanguage, getDateFormatOptions]);

  const exportToPdf = useCallback((data, filename, headers, title) => {
    if (!data || data.length === 0) return;
    const doc = new jsPDF(); doc.setFontSize(18); doc.text(title, 14, 22);
    const tableColumn = headers.map(h => h.label);
    const tableRows = data.map(item => headers.map(header => {
        let value = header.key.split('.').reduce((o, i) => (o ? o[i] : ''), item);
        if (header.type === 'date' && value) { value = new Date(value).toLocaleDateString(selectedLanguage === 'en' ? 'en-US' : 'es-ES', getDateFormatOptions(dateFormat)); }
        return String(value || '');
      }));
    doc.autoTable({ head: [tableColumn], body: tableRows, startY: 30, styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' }, headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' }, alternateRowStyles: { fillColor: [245, 245, 245] }, tableWidth: 'auto', margin: { left: 10, right: 10 } });
    doc.save(`${filename}.pdf`);
  }, [dateFormat, selectedLanguage, getDateFormatOptions]);


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
        
        <nav className="bg-blue-600 text-white shadow-md sticky top-0 z-50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-1 text-indigo-100 hover:text-white"><Menu className="h-6 w-6" /></button>
              <Link to="/dashboard" className="flex items-center gap-2 cursor-pointer">
                <div className="bg-white text-indigo-600 p-1.5 rounded-lg hidden sm:block"><ShieldAlert className="h-5 w-5" /></div>
                <span className="text-xl font-bold tracking-tight">Gestión Vital</span>
              </Link>
            </div>
            
            <div className="hidden lg:flex items-center gap-1 overflow-x-auto">
            {[
              { id: 'dashboard', label: t('menu.dashboard', 'Dashboard') }, { id: 'clientes', label: t('menu.clientes', 'Clientes') },
              { id: 'empresas-aseguradoras', label: t('menu.aseguradoras', 'Aseguradoras') }, { id: 'asesores', label: t('menu.asesores', 'Asesores') },
              { id: 'polizas', label: t('menu.polizas', 'Pólizas') }, { id: 'reclamaciones', label: t('menu.reclamaciones', 'Reclamaciones') },
              { id: 'comisiones', label: t('menu.comisiones', 'Comisiones') }, { id: 'configuracion', label: t('menu.configuracion', 'Ajustes') },
            ].map((tab) => (
                <Link
                  key={tab.id} to={`/${tab.id}`}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap
                    ${currentPath === tab.id ? 'bg-white/20 text-white shadow-inner' : 'text-indigo-100 hover:bg-white/10 hover:text-white'}`}
                >
                  {tab.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <button onClick={() => setIsAlertsOpen(true)} className="relative p-2 text-indigo-100 hover:text-white transition-colors">
                <Bell className="h-5 w-5" />
                {totalAlerts > 0 && (<span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center border border-blue-600 text-white animate-pulse">{totalAlerts}</span>)}
              </button>
              <Button onClick={handleLogout} variant="ghost" size="sm" className="text-indigo-100 hover:text-white hover:bg-white/10 hidden sm:flex">Salir</Button>
            </div>
          </div>

          {isMobileMenuOpen && (
            <div className="lg:hidden bg-blue-700 border-t border-blue-500 animate-in slide-in-from-top-2 duration-200">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col">
                {[
                  { id: 'dashboard', label: 'Dashboard' }, { id: 'clientes', label: 'Clientes' }, { id: 'empresas-aseguradoras', label: 'Aseguradoras' },
                  { id: 'asesores', label: 'Asesores' }, { id: 'polizas', label: 'Pólizas' }, { id: 'reclamaciones', label: 'Siniestros' },
                  { id: 'comisiones', label: 'Comisiones' }, { id: 'configuracion', label: 'Configuración' },
                ].map((tab) => (
                  <Link
                    key={tab.id} to={`/${tab.id}`} onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-3 py-3 rounded-md text-base font-bold text-left w-full
                      ${currentPath === tab.id ? 'bg-blue-800 text-white' : 'text-blue-100 hover:bg-blue-600 hover:text-white'}`}
                  >
                    {tab.label}
                  </Link>
                ))}
                <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="block mt-4 px-3 py-3 rounded-md text-base font-bold text-left w-full text-red-200 hover:bg-red-600 hover:text-white border border-red-400/30">Cerrar Sesión</button>
              </div>
            </div>
          )}
        </nav>

        <main className="flex-1 w-full max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            <Route path="/dashboard" element={
              <div className="space-y-6 animate-in fade-in duration-500">
                <Dashboard statistics={statisticsSummaryData} upcomingPolicies={polizasProximasAVencer} empresasAseguradoras={empresasAseguradoras} isLoadingStats={isLoadingStatisticsSummary} isLoadingUpcoming={isLoadingPolizasProximasAVencer} currencySymbol={currencySymbol} dateFormat={dateFormat} getDateFormatOptions={getDateFormatOptions} lossRatio={lossRatioData} />
                <div className="mt-8"><DashboardCharts polizas={polizas} reclamaciones={reclamaciones} empresas={empresasAseguradoras} /></div>
              </div>
            } />
            
            <Route path="/clientes" element={
              <ClientesPage apiBaseUrl={API_BASE_URL} clientes={clientes} editingClient={editingClient} setEditingClient={setEditingClient} onClientSaved={handleClientSaved} onClientImported={handleClientSaved} handleClientDelete={(id) => handleClientDelete(id, handleClientSaved)} clienteSearchTerm={clienteSearchTerm} clienteEmailFilter={clienteEmailFilter} setClienteSearchTerm={setClienteSearchTerm} setClienteEmailFilter={setClienteEmailFilter} handleClienteSearch={handleClienteSearch} clienteCurrentPage={clienteCurrentPage} totalClients={totalClients} handleClientePageChange={handleClientePageChange} exportToCsv={exportToCsv} exportToPdf={exportToPdf} dateFormat={dateFormat} getDateFormatOptions={getDateFormatOptions} itemsPerPage={CLIENTES_PER_PAGE} />
            } />

            <Route path="/polizas" element={
              <PolizasPage apiBaseUrl={API_BASE_URL} polizas={polizas} editingPoliza={editingPoliza} setEditingPoliza={setEditingPoliza} handlePolizaSaved={handlePolizaSaved} handlePolizaDelete={(id) => handlePolizaDelete(id, handlePolizaSaved)} polizaSearchTerm={polizaSearchTerm} polizaTipoFilter={polizaTipoFilter} polizaEstadoFilter={polizaEstadoFilter} polizaClienteIdFilter={polizaClienteIdFilter} polizaFechaInicioFilter={polizaFechaInicioFilter} polizaFechaFinFilter={polizaFechaFinFilter} setPolizaSearchTerm={setPolizaSearchTerm} setPolizaTipoFilter={setPolizaTipoFilter} setPolizaEstadoFilter={setPolizaEstadoFilter} setPolizaClienteIdFilter={setPolizaClienteIdFilter} setPolizaFechaInicioFilter={setPolizaFechaInicioFilter} setPolizaFechaFinFilter={setPolizaFechaFinFilter} handlePolizaSearch={handlePolizaSearch} polizaCurrentPage={polizaCurrentPage} handlePolizaPageChange={handlePolizaPageChange} itemsPerPage={POLIZAS_PER_PAGE} totalPolizas={totalPolizas} exportToCsv={exportToCsv} exportToPdf={exportToPdf} clientes={clientes} empresasAseguradoras={empresasAseguradoras} asesores={asesores} isLoadingClients={isLoadingClients} isLoadingCompanies={isLoadingCompanies} isLoadingAdvisors={isLoadingAdvisors} currencySymbol={currencySymbol} dateFormat={dateFormat} getDateFormatOptions={getDateFormatOptions} />
            } />

            <Route path="/reclamaciones" element={
              <ReclamacionesPage apiBaseUrl={API_BASE_URL} reclamaciones={reclamaciones} editingReclamacion={editingReclamacion} setEditingReclamacion={setEditingReclamacion} handleReclamacionSaved={handleReclamacionSaved} handleReclamacionDelete={(id) => handleReclamacionDelete(id, handleReclamacionSaved)} fetchClaimsData={fetchClaimsData} reclamacionSearchTerm={reclamacionSearchTerm} reclamacionEstadoFilter={reclamacionEstadoFilter} reclamacionClienteIdFilter={reclamacionClienteIdFilter} reclamacionPolizaIdFilter={reclamacionPolizaIdFilter} reclamacionFechaReclamacionInicioFilter={reclamacionFechaReclamacionInicioFilter} reclamacionFechaReclamacionFinFilter={reclamacionFechaReclamacionFinFilter} setReclamacionSearchTerm={setReclamacionSearchTerm} setReclamacionEstadoFilter={setReclamacionEstadoFilter} setReclamacionClienteIdFilter={setReclamacionClienteIdFilter} setReclamacionPolizaIdFilter={setReclamacionPolizaIdFilter} setReclamacionFechaReclamacionInicioFilter={setReclamacionFechaReclamacionInicioFilter} setReclamacionFechaReclamacionFinFilter={setReclamacionFechaReclamacionFinFilter} handleReclamacionSearch={handleReclamacionSearch} reclamacionCurrentPage={reclamacionCurrentPage} itemsPerPage={RECLAMACIONES_PER_PAGE} totalReclamaciones={totalReclamaciones} handleReclamacionPageChange={handleReclamacionPageChange} exportToCsv={exportToCsv} exportToPdf={exportToPdf} clientes={clientes} polizas={polizas} isLoadingPolicies={isLoadingPolicies} isLoadingClients={isLoadingClients} isLoadingReclamaciones={isLoadingReclamaciones} currencySymbol={currencySymbol} dateFormat={dateFormat} getDateFormatOptions={getDateFormatOptions} />
            } />

            <Route path="/empresas-aseguradoras" element={
              <EmpresasAseguradorasPage apiBaseUrl={API_BASE_URL} empresas={empresasAseguradoras} editingEmpresaAseguradora={editingEmpresaAseguradora} setEditingEmpresaAseguradora={setEditingEmpresaAseguradora} handleEmpresaAseguradoraSaved={handleEmpresaAseguradoraSaved} handleEmpresaAseguradoraDelete={(id) => handleEmpresaAseguradoraDelete(id, handleEmpresaAseguradoraSaved)} empresaAseguradoraCurrentPage={empresaAseguradoraCurrentPage} itemsPerPage={EMPRESAS_ASEGURADORAS_PER_PAGE} totalEmpresasAseguradoras={totalEmpresasAseguradoras} handleEmpresaAseguradoraPageChange={handleEmpresaAseguradoraPageChange} empresaAseguradoraSearchTerm={empresaAseguradoraSearchTerm} setEmpresaAseguradoraSearchTerm={setEmpresaAseguradoraSearchTerm} handleEmpresaAseguradoraSearch={handleEmpresaAseguradoraSearch} exportToCsv={exportToCsv} exportToPdf={exportToPdf} dateFormat={dateFormat} getDateFormatOptions={getDateFormatOptions} />
            } />

            <Route path="/asesores" element={
              <AsesoresPage apiBaseUrl={API_BASE_URL} asesores={asesores} editingAsesor={editingAsesor} setEditingAsesor={setEditingAsesor} handleAsesorSaved={handleAsesorSaved} handleAsesorDelete={(id) => handleAsesorDelete(id, handleAsesorSaved)} asesorCurrentPage={asesorCurrentPage} itemsPerPage={ASESORES_PER_PAGE} totalAsesores={totalAsesores} handleAsesorPageChange={handleAsesorPageChange} asesorSearchTerm={asesorSearchTerm} setAsesorSearchTerm={setAsesorSearchTerm} handleAsesorSearch={handleAsesorSearch} exportToCsv={exportToCsv} exportToPdf={exportToPdf} empresasAseguradoras={empresasAseguradoras} isLoadingCompanies={isLoadingCompanies} dateFormat={dateFormat} getDateFormatOptions={getDateFormatOptions} />
            } />

            <Route path="/comisiones" element={
              <ComisionesPage apiBaseUrl={API_BASE_URL} comisiones={comisiones} asesores={asesores} polizas={polizas} editingComision={editingComision} setEditingComision={setEditingComision} handleComisionSaved={handleComisionSaved} handleEditComision={handleEditComision} handleDeleteComision={(id) => handleDeleteComision(id, handleComisionSaved)} isLoadingAdvisors={isLoadingAdvisors} isLoadingPolicies={isLoadingPolicies} comisionCurrentPage={comisionCurrentPage} setComisionCurrentPage={setComisionCurrentPage} itemsPerPage={COMISIONES_PER_PAGE} totalComisiones={totalComisiones} setComisionAsesorIdFilter={setComisionAsesorIdFilter} setComisionEstadoPagoFilter={setComisionEstadoPagoFilter} setComisionFechaInicioFilter={setComisionFechaInicioFilter} setComisionFechaFinFilter={setComisionFechaFinFilter} dateFormat={dateFormat} getDateFormatOptions={getDateFormatOptions} />
            } />

            <Route path="/configuracion" element={
              <ConfiguracionPage selectedLanguage={selectedLanguage} currencySymbol={currencySymbol} dateFormat={dateFormat} selectedCountry={selectedCountry} licenseKey={licenseKey} isLicenseValid={isLicenseValid} setSelectedLanguage={setSelectedLanguage} setCurrencySymbol={setCurrencySymbol} setDateFormat={setDateFormat} setSelectedCountry={setSelectedCountry} setLicenseKey={setLicenseKey} saveSettings={saveSettings} LANGUAGE_OPTIONS={LANGUAGE_OPTIONS} CURRENCY_SYMBOL_OPTIONS={CURRENCY_SYMBOL_OPTIONS} DATE_FORMAT_OPTIONS={DATE_FORMAT_OPTIONS} COUNTRY_OPTIONS={COUNTRY_OPTIONS} MASTER_LICENSE_KEY={MASTER_LICENSE_KEY} />
            
            } />
            
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
        
        <Toaster />
        
        {isAlertsOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsAlertsOpen(false)}></div>
            <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
              <div className="p-4 border-b flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-800 flex items-center gap-2"><Bell className="h-5 w-5 text-blue-600"/> Asistente Inteligente</h3>
                <button onClick={() => setIsAlertsOpen(false)} className="text-slate-400 hover:bg-slate-200 p-1 rounded-md transition-colors"><X size={20}/></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {totalAlerts === 0 ? (
                  <div className="text-center text-slate-500 mt-10">
                    <CheckCircle2 className="h-12 w-12 mx-auto text-emerald-400 mb-3 opacity-50"/><p className="font-semibold text-lg text-emerald-600">¡Todo al día!</p><p className="text-sm">No tienes tareas urgentes pendientes.</p>
                  </div>
                ) : (
                  <>
                    {statisticsSummaryData?.total_reclamaciones_pendientes > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
                         <h4 className="font-bold text-red-800 flex items-center gap-2 mb-2"><AlertCircle className="h-4 w-4"/> Siniestros en Trámite</h4>
                         <p className="text-sm text-red-700 mb-3">Tienes <b>{statisticsSummaryData.total_reclamaciones_pendientes}</b> siniestros esperando resolución.</p>
                         <Button variant="outline" size="sm" className="w-full bg-white text-red-600 border-red-200 hover:bg-red-100 font-bold" onClick={() => { navigate('/reclamaciones'); setIsAlertsOpen(false); }}>Gestionar Siniestros</Button>
                      </div>
                    )}
                    {polizasPendientesDashboard > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 shadow-sm">
                         <h4 className="font-bold text-blue-800 flex items-center gap-2 mb-2"><DollarSign className="h-4 w-4"/> Primas Pendientes (Cobranza)</h4>
                         <p className="text-sm text-blue-700 mb-3">Tienes <b>{polizasPendientesDashboard}</b> póliza(s) emitida(s) esperando el pago.</p>
                         <Button variant="outline" size="sm" className="w-full bg-white text-blue-700 border-blue-200 hover:bg-blue-100 font-bold" onClick={() => { navigate('/polizas'); setIsAlertsOpen(false); }}>Ir a Pólizas</Button>
                      </div>
                    )}
                    {dineroEnLaCalle.total > 0 && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 shadow-sm">
                        <h4 className="font-bold text-emerald-800 flex items-center gap-2 mb-2"><DollarSign className="h-4 w-4"/> Dinero en la Calle</h4>
                        <p className="text-sm text-emerald-700 mb-3">Tienes <b>{currencySymbol}{dineroEnLaCalle.total.toLocaleString('en-US', {minimumFractionDigits: 2})}</b> pendientes por cobrar.</p>
                        <Button variant="outline" size="sm" className="w-full bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-100 font-bold" onClick={() => { navigate('/comisiones'); setIsAlertsOpen(false); }}>Ir a Cobranza</Button>
                      </div>
                    )}
                    {polizasProximasAVencer?.length > 0 && (
                      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 shadow-sm">
                        <h4 className="font-bold text-orange-800 flex items-center gap-2 mb-3"><ShieldAlert className="h-4 w-4"/> Por Vencer ({polizasProximasAVencer.length})</h4>
                        <ul className="space-y-2">
                          {polizasProximasAVencer.map(p => (
                            <li key={p.id} className="text-sm bg-white p-3 rounded-lg border border-orange-100 shadow-sm flex flex-col justify-between group hover:border-orange-400 transition-all">
                              <div className="flex justify-between items-start mb-1"><span className="font-black text-slate-800">{p.numero_poliza}</span><span className="text-[10px] bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full font-bold animate-pulse">Renovar</span></div>
                              <p className="text-xs text-slate-500 mb-2">Vence: {String(p.fecha_fin).split('T')[0]}</p>
                              <div className="flex items-center gap-1 mt-1 pt-2 border-t border-slate-50">
                                <Button variant="ghost" size="sm" className="h-7 flex-1 text-[10px] text-orange-600 hover:text-orange-800 hover:bg-orange-50 justify-center px-0" onClick={() => { navigate('/polizas'); setIsAlertsOpen(false); }}>Detalles</Button>
                                <Button variant="outline" size="sm" className="h-7 flex-1 text-[10px] bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 shadow-sm px-0" onClick={() => handleEmailNotificacion(p.id)}><Mail className="h-3 w-3 mr-1" /> Correo</Button>
                                <Button variant="outline" size="sm" className="h-7 flex-1 text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 shadow-sm px-0" onClick={() => handleWhatsAppNotificacion(p)}><MessageCircle className="h-3 w-3 mr-1" /> Chat</Button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* BOTÓN FLOTANTE (QUICK ADD) */}
        <div className="fixed bottom-8 right-8 z-[90] flex flex-col items-end gap-3">
          {isQuickMenuOpen && (
            <div className="flex flex-col gap-3 animate-in slide-in-from-bottom-5 duration-200 origin-bottom">
              <button onClick={() => { setQuickAddModal('siniestro'); setIsQuickMenuOpen(false); }} className="flex items-center gap-3 bg-white px-5 py-3 rounded-full shadow-2xl hover:bg-red-50 border border-slate-100 font-bold text-sm text-slate-700 transition-transform hover:scale-105">
                <span className="bg-red-100 p-2 rounded-full text-red-600"><AlertCircle size={18}/></span> Reportar Siniestro
              </button>
              <button onClick={() => { setQuickAddModal('cliente'); setIsQuickMenuOpen(false); }} className="flex items-center gap-3 bg-white px-5 py-3 rounded-full shadow-2xl hover:bg-blue-50 border border-slate-100 font-bold text-sm text-slate-700 transition-transform hover:scale-105">
                <span className="bg-blue-100 p-2 rounded-full text-blue-600"><UserPlus size={18}/></span> Nuevo Cliente
              </button>
            </div>
          )}
          <button onClick={() => setIsQuickMenuOpen(!isQuickMenuOpen)} className={`h-16 w-16 rounded-full shadow-[0_10px_25px_rgba(37,99,235,0.5)] flex items-center justify-center text-white transition-all duration-300 transform ${isQuickMenuOpen ? 'bg-slate-800 rotate-45 scale-110' : 'bg-blue-600 hover:bg-blue-500 hover:scale-110'}`}><Plus size={32} /></button>
        </div>

        {quickAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={handleCloseQuickAdd}></div>
            <div className="relative bg-slate-100 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
              <div className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm z-10">
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <Zap className="text-amber-500 h-6 w-6" /> {quickAddModal === 'cliente' ? 'Registro Exprés de Cliente' : 'Atención Rápida de Siniestro'}
                </h2>
                <button onClick={handleCloseQuickAdd} className="bg-slate-100 hover:bg-red-100 text-slate-500 hover:text-red-600 p-2 rounded-full transition-colors"><X size={20}/></button>
              </div>
              <div className="overflow-y-auto custom-scrollbar p-6">
                {quickAddModal === 'cliente' && (<ClientForm apiBaseUrl={API_BASE_URL} editingClient={null} setEditingClient={() => {}} onClientSaved={() => { handleClientSaved(); fetchClientsData(0, 9999, '', ''); handleCloseQuickAdd(); toast({ title: "¡Magia!", description: "Cliente guardado.", variant: "success" }); }} />)}
                {quickAddModal === 'siniestro' && (<ReclamacionForm apiBaseUrl={API_BASE_URL} clientes={clientes} polizas={polizas} isLoadingPolicies={isLoadingPolicies} isLoadingClients={isLoadingClients} editingReclamacion={null} setEditingReclamacion={() => {}} onReclamacionSaved={() => { handleReclamacionSaved(); handleCloseQuickAdd(); toast({ title: "¡Emergencia atendida!", description: "El siniestro fue registrado.", variant: "success" }); }} />)}
              </div>
            </div>
          </div>
        )}
      </div>
    </ConfirmationProvider>
  );
}

export default App;