// src/App.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import ClientForm from './components/ClientForm';
import ClientList from './components/ClientList';
import PolizaForm from './components/PolizaForm';
import PolizaImport from './components/PolizaImport';
import PolizaList from './components/PolizaList';
import ReclamacionForm from './components/ReclamacionForm';
import ReclamacionImport from './components/ReclamacionImport';
import ReclamacionList from './components/ReclamacionList';
import EmpresaAseguradoraForm from './components/EmpresaAseguradoraForm';
import EmpresaAseguradoraImport from './components/EmpresaAseguradoraImport';
import EmpresaAseguradoraList from './components/EmpresaAseguradoraList';
import AsesorForm from './components/AsesorForm';
import AsesorImport from './components/AsesorImport';
import AsesorList from './components/AsesorList';
import Dashboard from './components/Dashboard';
import SettingsPage from './components/SettingsPage';
import ComisionList from './components/ComisionList';
import ComisionImport from './components/ComisionImport';
import ComisionForm from './components/ComisionForm'; 
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/lib/use-toast';
import { ConfirmationProvider } from './components/ConfirmationContext';
import { saveAs } from 'file-saver';
import { ChevronRight, ShieldAlert, Bell, X, AlertCircle, CheckCircle2, Plus, UserPlus, Zap, MessageCircle, DollarSign } from 'lucide-react';
import DashboardCharts from './components/DashboardCharts';
import ClienteImport from './components/ClienteImport';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Constantes
const CLIENTES_PER_PAGE = 10;
const POLIZAS_PER_PAGE = 10;
const RECLAMACIONES_PER_PAGE = 10;
const EMPRESAS_ASEGURADORAS_PER_PAGE = 10;
const ASESORES_PER_PAGE = 10;
const COMISIONES_PER_PAGE = 10;
const API_BASE_URL = 'https://gestion-vital-app.onrender.com/api/v1';

// Opciones de configuración
const LANGUAGE_OPTIONS = [
  { id: 'es', nombre: 'Español' },
  { id: 'en', nombre: 'English' },
];

const DATE_FORMAT_OPTIONS = [
  { id: 'DD/MM/YYYY', nombre: 'DD/MM/YYYY' },
  { id: 'MM/DD/YYYY', nombre: 'MM/DD/YYYY' },
  { id: 'YYYY-MM-DD', nombre: 'YYYY-MM-DD' },
];

const CURRENCY_SYMBOL_OPTIONS = [
  { id: '$', nombre: '$ (Dólar)' },
  { id: 'Bs', nombre: 'Bs (Bolívar Soberano)' },
  { id: '€', nombre: '€ (Euro)' },
  { id: 'S/', nombre: 'S/ (Sol Peruano)' },
  { id: 'COP', nombre: 'COP (Peso Colombiano)' },
];

const COUNTRY_OPTIONS = [
  { id: 'VE', nombre: 'Venezuela' },
  { id: 'CO', nombre: 'Colombia' },
  { id: 'PE', nombre: 'Perú' },
  { id: 'US', nombre: 'Estados Unidos' },
  { id: 'ES', nombre: 'España' },
  { id: 'MX', nombre: 'México' },
  { id: 'AR', nombre: 'Argentina' },
  { id: 'CL', nombre: 'Chile' },
  { id: 'EC', nombre: 'Ecuador' },
  { id: 'PA', nombre: 'Panamá' },
];

const MASTER_LICENSE_KEY = 'LICENCIA-VITAL-2025';

function App() {
  const { t, i18n } = useTranslation();

  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('access_token'));
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editingClient, setEditingClient] = useState(null);
  const [editingPoliza, setEditingPoliza] = useState(null);
  const [editingReclamacion, setEditingReclamacion] = useState(null);
  const [editingEmpresaAseguradora, setEditingEmpresaAseguradora] = useState(null);
  const [editingAsesor, setEditingAsesor] = useState(null);
  const [editingComision, setEditingComision] = useState(null); 
  const [apiBaseUrl] = useState('https://gestion-vital-app.onrender.com/api/v1');
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isQuickMenuOpen, setIsQuickMenuOpen] = useState(false);
  const [quickAddModal, setQuickAddModal] = useState(null); 

  const handleCloseQuickAdd = () => {
    setQuickAddModal(null);
    setIsQuickMenuOpen(false);
  };

  const [clientes, setClientes] = useState([]);
  const [polizas, setPolizas] = useState([]);
  const [reclamaciones, setReclamaciones] = useState([]);
  const [empresasAseguradoras, setEmpresasAseguradoras] = useState([]);
  const [asesores, setAsesores] = useState([]);
  const [comisiones, setComisiones] = useState([]);

  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  const [isLoadingAdvisors, setIsLoadingAdvisors] = useState(true);
  const [isLoadingPolicies, setIsLoadingPolicies] = useState(true);
  const [isLoadingReclamaciones, setIsLoadingReclamaciones] = useState(true);
  const [isLoadingComisiones, setIsLoadingComisiones] = useState(true);

  const [statisticsSummaryData, setStatisticsSummaryData] = useState(null);
  const [isLoadingStatisticsSummary, setIsLoadingStatisticsSummary] = useState(true);
  const [polizasProximasAVencer, setPolizasProximasAVencer] = useState([]);
  const [isLoadingPolizasProximasAVencer, setIsLoadingPolizasProximasAVencer] = useState(true);

  const [totalClients, setTotalClients] = useState(0);
  const [totalPolizas, setTotalPolizas] = useState(0);
  const [totalReclamaciones, setTotalReclamaciones] = useState(0);
  const [totalEmpresasAseguradoras, setTotalEmpresasAseguradoras] = useState(0);
  const [totalAsesores, setTotalAsesores] = useState(0);
  const [totalComisiones, setTotalComisiones] = useState(0);

  const { toast } = useToast();
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  // --- 🚀 INJERTO: EL GUARDIA GLOBAL (EXPULSOR AUTOMÁTICO) ---
  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      const requestUrl = args[0] || ""; 
      
      // Si el servidor dice "No Autorizado" y NO es un intento de Login...
      if (response.status === 401 && typeof requestUrl === 'string' && !requestUrl.includes('/login') && !requestUrl.includes('/token')) {
        console.warn("Pase VIP vencido. Limpiando memoria y expulsando...");
        localStorage.removeItem('access_token');
        window.location.href = "/"; // Recarga la página y limpia toda la memoria congelada
      }
      return response;
    };
    return () => {
      window.fetch = originalFetch;
    };
  }, []);
  // -----------------------------------------------------------

  const [clienteSearchTerm, setClienteSearchTerm] = useState('');
  const [clienteEmailFilter, setClienteEmailFilter] = useState('');
  const [clienteCurrentPage, setClienteCurrentPage] = useState(1);

  const [polizaSearchTerm, setPolizaSearchTerm] = useState('');
  const [polizaTipoFilter, setPolizaTipoFilter] = useState('');
  const [polizaEstadoFilter, setPolizaEstadoFilter] = useState('');
  const [polizaClienteIdFilter, setPolizaClienteIdFilter] = useState('');
  const [polizaFechaInicioFilter, setPolizaFechaInicioFilter] = useState('');
  const [polizaFechaFinFilter, setPolizaFechaFinFilter] = useState('');
  const [polizaCurrentPage, setPolizaCurrentPage] = useState(1);

  const [reclamacionSearchTerm, setReclamacionSearchTerm] = useState('');
  const [reclamacionEstadoFilter, setReclamacionEstadoFilter] = useState('');
  const [reclamacionClienteIdFilter, setReclamacionClienteIdFilter] = useState('');
  const [reclamacionPolizaIdFilter, setReclamacionPolizaIdFilter] = useState('');
  const [reclamacionFechaReclamacionInicioFilter, setReclamacionFechaReclamacionInicioFilter] = useState('');
  const [reclamacionFechaReclamacionFinFilter, setReclamacionFechaReclamacionFinFilter] = useState('');
  const [fechaReclamacionInicioFilter, setFechaReclamacionInicioFilter] = useState('');
  const [fechaReclamacionFinFilter, setFechaReclamacionFinFilter] = useState('');
  const [reclamacionCurrentPage, setReclamacionCurrentPage] = useState(1);

  const [empresaAseguradoraSearchTerm, setEmpresaAseguradoraSearchTerm] = useState('');
  const [empresaAseguradoraCurrentPage, setEmpresaAseguradoraCurrentPage] = useState(1);

  const [asesorSearchTerm, setAsesorSearchTerm] = useState('');
  const [asesorCurrentPage, setAsesorCurrentPage] = useState(1);

  const [comisionAsesorIdFilter, setComisionAsesorIdFilter] = useState('');
  const [comisionEstadoPagoFilter, setComisionEstadoPagoFilter] = useState('');
  const [comisionFechaInicioFilter, setComisionFechaInicioFilter] = useState('');
  const [comisionFechaFinFilter, setComisionFechaFinFilter] = useState('');
  const [comisionCurrentPage, setComisionCurrentPage] = useState(1);

  const [selectedLanguage, setSelectedLanguage] = useState(localStorage.getItem('selectedLanguage') || 'es');
  const [currencySymbol, setCurrencySymbol] = useState(localStorage.getItem('currencySymbol') || '$');
  const [dateFormat, setDateFormat] = useState(localStorage.getItem('dateFormat') || 'DD/MM/YYYY');
  const [selectedCountry, setSelectedCountry] = useState(localStorage.getItem('selectedCountry') || 'VE');
  const [licenseKey, setLicenseKey] = useState(localStorage.getItem('licenseKey') || '');
  const [isLicenseValid, setIsLicenseValid] = useState(false);

  const lossRatioData = useMemo(() => {
    const totalPrimas = statisticsSummaryData?.total_primas || 0;
    const totalSiniestros = reclamaciones
      .filter(r => r.estado_reclamacion === 'Pagada')
      .reduce((acc, curr) => acc + (parseFloat(curr.monto_aprobado) || 0), 0);
    return { 
      ratio: totalPrimas > 0 ? ((totalSiniestros / totalPrimas) * 100).toFixed(2) : 0, 
      totalSiniestros 
    };
  }, [statisticsSummaryData, reclamaciones]);

  const dineroEnLaCalle = useMemo(() => {
    const pendientes = comisiones.filter(c => c.estatus_pago?.toLowerCase() === 'pendiente');
    const total = pendientes.reduce((sum, c) => sum + (parseFloat(c.monto_final) || 0), 0);
    return { cantidad: pendientes.length, total };
  }, [comisiones]);

  const totalAlerts = (polizasProximasAVencer?.length || 0) + 
                      (statisticsSummaryData?.total_reclamaciones_pendientes || 0) + 
                      (dineroEnLaCalle.cantidad > 0 ? 1 : 0);

  useEffect(() => {
    const savedLicenseKey = localStorage.getItem('licenseKey');
    setIsLicenseValid(savedLicenseKey === MASTER_LICENSE_KEY);
  }, []); 

  useEffect(() => {
    if (selectedLanguage && i18n) { 
      i18n.changeLanguage(selectedLanguage);
    }
  }, [selectedLanguage, i18n]);

  const saveSettings = useCallback((newLanguage, newCurrencySymbol, newDateFormat, newSelectedCountry, newLicenseKey) => {
    localStorage.setItem('selectedLanguage', newLanguage);
    localStorage.setItem('currencySymbol', newCurrencySymbol);
    localStorage.setItem('dateFormat', newDateFormat);
    localStorage.setItem('selectedCountry', newSelectedCountry);
    localStorage.setItem('licenseKey', newLicenseKey);

    setSelectedLanguage(newLanguage);
    setCurrencySymbol(newCurrencySymbol);
    setDateFormat(newDateFormat);
    setSelectedCountry(newSelectedCountry);
    setLicenseKey(newLicenseKey);

    const isValid = newLicenseKey === MASTER_LICENSE_KEY;
    setIsLicenseValid(isValid);

    toast({ title: "Configuración Guardada", description: "Los ajustes han sido guardados exitosamente.", variant: "success" });

    if (!isValid) {
      toast({ title: "Licencia Inválida", description: "La clave de licencia ingresada no es válida.", variant: "destructive" });
    }
  }, [toast]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('access_token');
    setIsAuthenticated(false);
    setActiveTab('login');
    setShowRegisterForm(false);
    toast({ title: "Sesión Cerrada", description: "Has cerrado tu sesión exitosamente.", variant: "info" });
  }, [toast]);

  const handleLoginSuccess = useCallback(() => {
    setIsAuthenticated(true);
    setActiveTab('dashboard');
    toast({ title: "Inicio de Sesión Exitoso", description: "¡Bienvenido de nuevo!", variant: "success" });
  }, [toast]);

  const fetchClientsData = useCallback(async (offset, limit, searchTerm, emailFilter) => {
    const token = localStorage.getItem('access_token');
    if (!token) { setIsLoadingClients(false); return; }
    setIsLoadingClients(true);
    try {
      const queryParams = new URLSearchParams({ offset, limit });
      if (searchTerm) queryParams.append('search_term', searchTerm);
      if (emailFilter) queryParams.append('email_filter', emailFilter);

      const response = await fetch(`${API_BASE_URL}/clientes/?${queryParams.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        if (response.status === 401) { handleLogout(); return; }
        throw new Error(`Error ${response.status}`);
      }
      const data = await response.json();
      const rawItems = Array.isArray(data.items) ? data.items : (Array.isArray(data) ? data : []);
      const validClients = rawItems.filter(c => c && c.id !== undefined && c.id !== null);
      
      setClientes(validClients);
      setTotalClients(data.total_count || validClients.length);
    } catch (error) {
      console.error("ERROR: fetchClientsData:", error);
    } finally {
        setIsLoadingClients(false);
    }
  }, [handleLogout]);

  const fetchPoliciesData = useCallback(async (offset = 0, limit = 10, searchTerm = '', tipoFilter = '', estadoFilter = '', clienteIdFilter = '', fechaInicioFilter = '', fechaFinFilter = '') => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    setIsLoadingPolicies(true);
    try {
      const params = new URLSearchParams({ offset: offset.toString(), limit: limit.toString() });
      if (searchTerm) params.append('search_term', searchTerm);
      if (tipoFilter) params.append('tipo_filter', tipoFilter);
      if (estadoFilter) params.append('estado_filter', estadoFilter);
      if (clienteIdFilter) params.append('cliente_id_filter', clienteIdFilter);
      if (fechaInicioFilter) params.append('fecha_inicio_filter', fechaInicioFilter);
      if (fechaFinFilter) params.append('fecha_fin_filter', fechaFinFilter);

      const response = await fetch(`${API_BASE_URL}/polizas?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        if (response.status === 401) { handleLogout(); return; }
        throw new Error(`Error ${response.status}`);
      }
      const data = await response.json();
      const items = Array.isArray(data) ? data : (data.items || []);
      setPolizas(items);
      setTotalPolizas(data.total_count !== undefined ? data.total_count : items.length);
    } catch (error) {
      console.error("Error en fetchPoliciesData:", error);
    } finally {
      setIsLoadingPolicies(false);
    }
  }, [handleLogout]);

  const fetchClaimsData = useCallback(async (offset = 0, limit = 10, searchTerm = '', estadoFilter = '', polizaIdFilter = '') => {
    const token = localStorage.getItem('access_token');
    if (!token) { setIsLoadingReclamaciones(false); return; }
    setIsLoadingReclamaciones(true);
    try {
      const queryParams = new URLSearchParams({ offset: offset.toString(), limit: limit.toString() });
      if (searchTerm) queryParams.append('search_term', searchTerm);
      if (estadoFilter) queryParams.append('estado_filter', estadoFilter);
      if (polizaIdFilter) queryParams.append('poliza_id_filter', polizaIdFilter);
      if (fechaReclamacionInicioFilter) queryParams.append('fecha_reclamacion_inicio_filter', fechaReclamacionInicioFilter);
      if (fechaReclamacionFinFilter) queryParams.append('fecha_reclamacion_fin_filter', fechaReclamacionFinFilter);

      const response = await fetch(`${API_BASE_URL}/reclamaciones/?${queryParams.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        if (response.status === 401) { handleLogout(); return; }
        throw new Error(`Error ${response.status}`);
      }
      const data = await response.json();
      const items = Array.isArray(data) ? data : (data.items || []);
      setReclamaciones(items.filter(r => r && r.id));
      setTotalReclamaciones(data.total_count !== undefined ? data.total_count : items.length);
    } catch (error) {
      console.error("Error al cargar reclamaciones:", error);
    } finally {
        setIsLoadingReclamaciones(false);
    }
  }, [handleLogout, fechaReclamacionInicioFilter, fechaReclamacionFinFilter]);
  
  const fetchInsuranceCompaniesData = useCallback(async (offset, limit, searchTerm = '') => {
    const token = localStorage.getItem('access_token');
    if (!token) { setIsLoadingCompanies(false); return; }
    setIsLoadingCompanies(true);
    try {
      const queryParams = new URLSearchParams({ offset, limit });
      if (searchTerm) queryParams.append('search', searchTerm);
      
      const response = await fetch(`${API_BASE_URL}/empresas-aseguradoras?${queryParams.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        if (response.status === 401) { handleLogout(); return; }
        throw new Error(`Error ${response.status}`);
      }
      const data = await response.json();
      const items = Array.isArray(data.items) ? data.items : (Array.isArray(data) ? data : []);
      setEmpresasAseguradoras(items.filter(c => c && c.id !== undefined));
      setTotalEmpresasAseguradoras(data.total !== undefined ? data.total : items.length);
    } catch (error) {
      console.error("ERROR: fetchInsuranceCompaniesData", error);
    } finally {
        setIsLoadingCompanies(false);
    }
  }, [handleLogout]);

  const fetchAdvisorsData = useCallback(async (offset, limit, searchTerm = '') => {
    const token = localStorage.getItem('access_token');
    if (!token) { setIsLoadingAdvisors(false); return; }
    setIsLoadingAdvisors(true);
    try {
      const queryParams = new URLSearchParams({ offset, limit });
      if (searchTerm) queryParams.append('search_term', searchTerm);

      const response = await fetch(`${API_BASE_URL}/asesores?${queryParams.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        if (response.status === 401) { handleLogout(); return; }
        throw new Error(`Error HTTP: ${response.status}`);
      }
      const data = await response.json();
      let listaAsesores = Array.isArray(data) ? data : (data.items || []);
      const validAdvisors = listaAsesores.filter(a => a && a.id !== undefined);
      
      setAsesores(validAdvisors); 
      setTotalAsesores(data.total_count || validAdvisors.length);
    } catch (error) {
      console.error("ERROR: fetchAdvisorsData", error);
    } finally {
      setIsLoadingAdvisors(false);
    }
  }, [handleLogout]);

  const fetchCommissionsData = useCallback(async (offset, limit, asesor_id_filter, estatus_pago_filter, fecha_inicio_filter, fecha_fin_filter) => {
    const token = localStorage.getItem('access_token');
    if (!token) { setIsLoadingComisiones(false); return; }
    setIsLoadingComisiones(true);
    try {
      const queryParams = new URLSearchParams({ offset: offset.toString(), limit: limit.toString() });
      if (asesor_id_filter) queryParams.append('id_asesor', asesor_id_filter);
      if (estatus_pago_filter) queryParams.append('estatus_pago', estatus_pago_filter);
      if (fecha_inicio_filter) queryParams.append('fecha_inicio', fecha_inicio_filter);
      if (fecha_fin_filter) queryParams.append('fecha_fin', fecha_fin_filter);

      const response = await fetch(`${API_BASE_URL}/comisiones/?${queryParams.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        if (response.status === 401) { handleLogout(); return; }
        throw new Error(`Error en la respuesta: ${response.status}`);
      }
      const data = await response.json();
      const comisionesList = Array.isArray(data) ? data : (data.items || []);
      
      const comisionesEnriquecidas = comisionesList.map(com => {
        const poliza = polizas.find(p => p.id === com.id_poliza);
        const asesor = asesores.find(a => a.id === com.id_asesor);
        return {
          ...com,
          numero_poliza: poliza ? poliza.numero_poliza : 'N/A',
          nombre_asesor: asesor ? asesor.nombre : 'N/A'
        };
      });

      setComisiones(comisionesEnriquecidas); 
      setTotalComisiones(parseInt(response.headers.get('X-Total-Count') || '0', 10)); 
    } catch (error) {
      console.error("ERROR: fetchCommissionsData", error);
    } finally {
      setIsLoadingComisiones(false);
    }
  }, [handleLogout, polizas, asesores]);

  // 🚨 GUILLOTINA EN APP.JSX: Modificación para borrar la data si el servidor da error (403)
  const fetchStatisticsSummaryData = useCallback(async () => {
    setIsLoadingStatisticsSummary(true);
    const token = localStorage.getItem('access_token');
    if (!token) { setIsLoadingStatisticsSummary(false); return; }
    try {
      const response = await fetch(`${API_BASE_URL}/statistics/summary`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        if (response.status === 401) { handleLogout(); return; }
        throw new Error(`Error ${response.status}`);
      }
      const data = await response.json();
      setStatisticsSummaryData(data);
    } catch (error) {
      console.error("ERROR: fetchStatisticsSummaryData", error);
      // 🚨 Limpiamos la data vieja para que el Dashboard no se confunda
      setStatisticsSummaryData(null); 
    } finally {
      setIsLoadingStatisticsSummary(false);
    }
  }, [handleLogout]);

  const fetchUpcomingPoliciesData = useCallback(async (days = 30) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    setIsLoadingPolizasProximasAVencer(true);
    try {
      const response = await fetch(`${API_BASE_URL}/proximas_a_vencer?days_out=${days}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.status === 401) { handleLogout(); return; }
      if (!response.ok) throw new Error(`Error ${response.status}`);
      const data = await response.json();
      setPolizasProximasAVencer(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("ERROR en fetchUpcomingPoliciesData:", error.message);
    } finally {
      setIsLoadingPolizasProximasAVencer(false);
    }
  }, [handleLogout]);

  useEffect(() => {
    if (!isAuthenticated) return;

    fetchStatisticsSummaryData();

    if (activeTab === 'dashboard') {
      fetchUpcomingPoliciesData();
    } 
    else if (activeTab === 'clientes') {
      fetchClientsData((clienteCurrentPage - 1) * CLIENTES_PER_PAGE, CLIENTES_PER_PAGE, clienteSearchTerm, clienteEmailFilter);
    } 
    else if (activeTab === 'polizas') {
      fetchClientsData(0, 9999, '', ''); 
      fetchInsuranceCompaniesData(0, 9999, '');
      fetchAdvisorsData(0, 9999, '');
      fetchPoliciesData((polizaCurrentPage - 1) * POLIZAS_PER_PAGE, POLIZAS_PER_PAGE, polizaSearchTerm, polizaTipoFilter, polizaEstadoFilter, polizaClienteIdFilter, polizaFechaInicioFilter, polizaFechaFinFilter);
    } 
    else if (activeTab === 'reclamaciones') {
      fetchPoliciesData(0, 9999, '', '', '', '', '', '');
      fetchClientsData(0, 9999, '', '');
      fetchClaimsData((reclamacionCurrentPage - 1) * RECLAMACIONES_PER_PAGE, RECLAMACIONES_PER_PAGE, reclamacionSearchTerm, reclamacionEstadoFilter, reclamacionPolizaIdFilter, reclamacionFechaReclamacionInicioFilter, reclamacionFechaReclamacionFinFilter);
    } 
    else if (activeTab === 'empresas-aseguradoras') {
      fetchInsuranceCompaniesData((empresaAseguradoraCurrentPage - 1) * EMPRESAS_ASEGURADORAS_PER_PAGE, EMPRESAS_ASEGURADORAS_PER_PAGE, empresaAseguradoraSearchTerm);
    } 
    else if (activeTab === 'asesores') {
      fetchInsuranceCompaniesData(0, 9999, '');
      fetchAdvisorsData((asesorCurrentPage - 1) * ASESORES_PER_PAGE, ASESORES_PER_PAGE, asesorSearchTerm);
    } 
    else if (activeTab === 'comisiones') {
      fetchAdvisorsData(0, 9999, '');
      fetchPoliciesData(0, 9999, '', '', '', '', '', '');
      fetchCommissionsData((comisionCurrentPage - 1) * COMISIONES_PER_PAGE, COMISIONES_PER_PAGE, comisionAsesorIdFilter, comisionEstadoPagoFilter, comisionFechaInicioFilter, comisionFechaFinFilter);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isAuthenticated, activeTab, 
    clienteCurrentPage, clienteSearchTerm, clienteEmailFilter,
    polizaCurrentPage, polizaSearchTerm, polizaTipoFilter, polizaEstadoFilter, polizaClienteIdFilter, polizaFechaInicioFilter, polizaFechaFinFilter,
    reclamacionCurrentPage, reclamacionSearchTerm, reclamacionEstadoFilter, reclamacionPolizaIdFilter, reclamacionFechaReclamacionInicioFilter, reclamacionFechaReclamacionFinFilter,
    empresaAseguradoraCurrentPage, empresaAseguradoraSearchTerm,
    asesorCurrentPage, asesorSearchTerm,
    comisionCurrentPage, comisionAsesorIdFilter, comisionEstadoPagoFilter, comisionFechaInicioFilter, comisionFechaFinFilter
  ]);

  const handleClientePageChange = (page) => setClienteCurrentPage(page);
  const handleClienteSearch = (searchTerm, emailFilter) => {
    setClienteSearchTerm(searchTerm);
    setClienteEmailFilter(emailFilter);
    setClienteCurrentPage(1);
  };
  const handleClientSaved = useCallback(() => {
    setEditingClient(null);
    fetchClientsData((clienteCurrentPage - 1) * CLIENTES_PER_PAGE, CLIENTES_PER_PAGE, clienteSearchTerm, clienteEmailFilter);
    fetchStatisticsSummaryData();
  }, [clienteCurrentPage, clienteSearchTerm, clienteEmailFilter, fetchClientsData, fetchStatisticsSummaryData]);

  const handleClientDelete = useCallback(async (id) => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`${API_BASE_URL}/clientes/${id}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        if (response.status === 401) { handleLogout(); return; }
        throw new Error(`Error ${response.status}`);
      }
      toast({ title: "Cliente Eliminado", description: "El cliente ha sido eliminado.", variant: "success" });
      fetchClientsData((clienteCurrentPage - 1) * CLIENTES_PER_PAGE, CLIENTES_PER_PAGE, clienteSearchTerm, clienteEmailFilter);
      fetchStatisticsSummaryData();
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }, [clienteCurrentPage, clienteSearchTerm, clienteEmailFilter, fetchClientsData, fetchStatisticsSummaryData, toast, handleLogout]);

  const handlePolizaPageChange = (page) => setPolizaCurrentPage(page);
  const handlePolizaSearch = (searchTerm, tipoFilter, estadoFilter, clienteIdFilter, fechaInicioFilter, fechaFinFilter) => {
    setPolizaSearchTerm(searchTerm); setPolizaTipoFilter(tipoFilter); setPolizaEstadoFilter(estadoFilter);
    setPolizaClienteIdFilter(clienteIdFilter); setPolizaFechaInicioFilter(fechaInicioFilter); setPolizaFechaFinFilter(fechaFinFilter);
    setPolizaCurrentPage(1);
  };
  const handlePolizaSaved = useCallback(() => {
    setEditingPoliza(null);
    fetchPoliciesData((polizaCurrentPage - 1) * POLIZAS_PER_PAGE, POLIZAS_PER_PAGE, polizaSearchTerm, polizaTipoFilter, polizaEstadoFilter, polizaClienteIdFilter, polizaFechaInicioFilter, polizaFechaFinFilter);
    fetchStatisticsSummaryData(); fetchUpcomingPoliciesData();
  }, [polizaCurrentPage, polizaSearchTerm, polizaTipoFilter, polizaEstadoFilter, polizaClienteIdFilter, polizaFechaInicioFilter, polizaFechaFinFilter, fetchPoliciesData, fetchStatisticsSummaryData, fetchUpcomingPoliciesData]);

  const handlePolizaDelete = useCallback(async (id) => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`${API_BASE_URL}/polizas/${id}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        if (response.status === 401) { handleLogout(); return; }
        throw new Error(`Error ${response.status}`);
      }
      toast({ title: "Póliza Eliminada", description: "La póliza ha sido eliminada.", variant: "success" });
      fetchPoliciesData((polizaCurrentPage - 1) * POLIZAS_PER_PAGE, POLIZAS_PER_PAGE, polizaSearchTerm, polizaTipoFilter, polizaEstadoFilter, polizaClienteIdFilter, polizaFechaInicioFilter, polizaFechaFinFilter);
      fetchStatisticsSummaryData(); fetchUpcomingPoliciesData();
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }, [polizaCurrentPage, polizaSearchTerm, polizaTipoFilter, polizaEstadoFilter, polizaClienteIdFilter, polizaFechaInicioFilter, polizaFechaFinFilter, fetchPoliciesData, fetchStatisticsSummaryData, fetchUpcomingPoliciesData, toast, handleLogout]);

  const handleReclamacionPageChange = (page) => setReclamacionCurrentPage(page);
  const handleReclamacionSearch = (searchTerm, estadoFilter, clienteIdFilter, polizaIdFilter, fechaReclamacionInicioFilter, fechaReclamacionFinFilter) => {
    setReclamacionSearchTerm(searchTerm); setReclamacionEstadoFilter(estadoFilter); setReclamacionClienteIdFilter(clienteIdFilter);
    setReclamacionPolizaIdFilter(polizaIdFilter); setReclamacionFechaReclamacionInicioFilter(fechaReclamacionInicioFilter); setReclamacionFechaReclamacionFinFilter(fechaReclamacionFinFilter);
    setReclamacionCurrentPage(1);
  };
  const handleReclamacionSaved = useCallback(() => {
    setEditingReclamacion(null);
    fetchClaimsData((reclamacionCurrentPage - 1) * RECLAMACIONES_PER_PAGE, RECLAMACIONES_PER_PAGE, reclamacionSearchTerm, reclamacionEstadoFilter, reclamacionPolizaIdFilter, reclamacionFechaReclamacionInicioFilter, reclamacionFechaReclamacionFinFilter);
    fetchStatisticsSummaryData();
  }, [reclamacionCurrentPage, reclamacionSearchTerm, reclamacionEstadoFilter, reclamacionPolizaIdFilter, reclamacionFechaReclamacionInicioFilter, reclamacionFechaReclamacionFinFilter, fetchClaimsData, fetchStatisticsSummaryData]);

  const handleReclamacionDelete = useCallback(async (id) => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`${API_BASE_URL}/reclamaciones/${id}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        if (response.status === 401) { handleLogout(); return; }
        throw new Error(`Error ${response.status}`);
      }
      toast({ title: "Reclamación Eliminada", description: "La reclamación ha sido eliminada.", "variant": "success" });
      fetchClaimsData((reclamacionCurrentPage - 1) * RECLAMACIONES_PER_PAGE, RECLAMACIONES_PER_PAGE, reclamacionSearchTerm, reclamacionEstadoFilter, reclamacionPolizaIdFilter, reclamacionFechaReclamacionInicioFilter, reclamacionFechaReclamacionFinFilter);
      fetchStatisticsSummaryData();
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }, [reclamacionCurrentPage, reclamacionSearchTerm, reclamacionEstadoFilter, reclamacionPolizaIdFilter, reclamacionFechaReclamacionInicioFilter, reclamacionFechaReclamacionFinFilter, fetchClaimsData, fetchStatisticsSummaryData, toast, handleLogout]);

  const handleEmpresaAseguradoraPageChange = (page) => setEmpresaAseguradoraCurrentPage(page);
  const handleEmpresaAseguradoraSearch = (searchTerm) => {
    setEmpresaAseguradoraSearchTerm(searchTerm); setEmpresaAseguradoraCurrentPage(1);
  };
  const handleEmpresaAseguradoraSaved = useCallback(async () => {
    setEditingEmpresaAseguradora(null);
    await fetchInsuranceCompaniesData((empresaAseguradoraCurrentPage - 1) * EMPRESAS_ASEGURADORAS_PER_PAGE, EMPRESAS_ASEGURADORAS_PER_PAGE, empresaAseguradoraSearchTerm);
    await fetchStatisticsSummaryData();
    toast({ title: "Operación Exitosa", description: "La empresa ha sido procesada." });
  }, [empresaAseguradoraCurrentPage, empresaAseguradoraSearchTerm, fetchInsuranceCompaniesData, fetchStatisticsSummaryData, toast]);

  const handleEmpresaAseguradoraDelete = useCallback(async (id) => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`${API_BASE_URL}/empresas-aseguradoras/${id}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        if (response.status === 401) { handleLogout(); return; }
        throw new Error(`Error ${response.status}`);
      }
      toast({ title: "Empresa Eliminada", description: "La empresa ha sido eliminada.", variant: "success" });
      fetchInsuranceCompaniesData((empresaAseguradoraCurrentPage - 1) * EMPRESAS_ASEGURADORAS_PER_PAGE, EMPRESAS_ASEGURADORAS_PER_PAGE, empresaAseguradoraSearchTerm);
      fetchStatisticsSummaryData();
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }, [empresaAseguradoraCurrentPage, empresaAseguradoraSearchTerm, fetchInsuranceCompaniesData, fetchStatisticsSummaryData, toast, handleLogout]);

  const handleAsesorPageChange = (page) => setAsesorCurrentPage(page);
  const handleAsesorSearch = (searchTerm) => {
    setAsesorSearchTerm(searchTerm); setAsesorCurrentPage(1);
  };
  const handleAsesorSaved = useCallback(async () => {
    setEditingAsesor(null);
    await fetchAdvisorsData((asesorCurrentPage - 1) * ASESORES_PER_PAGE, ASESORES_PER_PAGE, asesorSearchTerm);
    await fetchStatisticsSummaryData();
    toast({ title: "Asesor Guardado", description: "Los datos del asesor se han actualizado." });
  }, [asesorCurrentPage, asesorSearchTerm, fetchAdvisorsData, fetchStatisticsSummaryData, toast]);
  
  const handleAsesorDelete = useCallback(async (id) => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`${API_BASE_URL}/asesores/${id}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        if (response.status === 401) { handleLogout(); return; }
        throw new Error(`Error HTTP: ${response.status}`);
      }
      toast({ title: "Asesor Eliminado", description: "El asesor ha sido eliminado.", variant: "success" });
      fetchAdvisorsData((asesorCurrentPage - 1) * ASESORES_PER_PAGE, ASESORES_PER_PAGE, asesorSearchTerm);
      fetchStatisticsSummaryData();
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }, [asesorCurrentPage, asesorSearchTerm, fetchAdvisorsData, fetchStatisticsSummaryData, toast, handleLogout]);

  const handleEditComision = useCallback((comision) => {
    setEditingComision(comision);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  
  const handleComisionSaved = useCallback(() => {
    setEditingComision(null);
    fetchCommissionsData((comisionCurrentPage - 1) * COMISIONES_PER_PAGE, COMISIONES_PER_PAGE, comisionAsesorIdFilter, comisionEstadoPagoFilter, comisionFechaInicioFilter, comisionFechaFinFilter);
    fetchStatisticsSummaryData();
  }, [comisionCurrentPage, comisionAsesorIdFilter, comisionEstadoPagoFilter, comisionFechaInicioFilter, comisionFechaFinFilter, fetchCommissionsData, fetchStatisticsSummaryData]);

  const handleDeleteComision = useCallback(async (id) => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`${API_BASE_URL}/comisiones/${id}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        toast({ title: "Éxito", description: "Comisión eliminada correctamente" });
        fetchCommissionsData((comisionCurrentPage - 1) * COMISIONES_PER_PAGE, COMISIONES_PER_PAGE, comisionAsesorIdFilter, comisionEstadoPagoFilter, comisionFechaInicioFilter, comisionFechaFinFilter);
      }
    } catch (error) {
      toast({ title: "Error", description: "No se pudo eliminar", variant: "destructive" });
    }
  }, [fetchCommissionsData, comisionCurrentPage, comisionAsesorIdFilter, comisionEstadoPagoFilter, comisionFechaInicioFilter, comisionFechaFinFilter, toast]);

  const handleWhatsAppNotificacion = (poliza) => {
    const cliente = clientes.find(c => String(c.id) === String(poliza.cliente_id));
    const nombreCliente = cliente ? `${cliente.nombre} ${cliente.apellido || ''}`.trim() : 'Estimado Cliente';
    
    const telefono = cliente?.telefono ? cliente.telefono.replace(/\D/g, '') : '';

    if (!telefono) {
      toast({ title: "Atención", description: "Este cliente no tiene un teléfono registrado.", variant: "destructive" });
      return;
    }

    const fechaVencimiento = new Date(poliza.fecha_fin).toLocaleDateString('es-ES', getDateFormatOptions(dateFormat));
    
    const mensaje = `Hola ${nombreCliente}, soy tu asesor de Gestión Vital 🛡️. Te escribo para recordarte que tu póliza Nro: *${poliza.numero_poliza}* está próxima a vencer el *${fechaVencimiento}*. ¿Te ayudo con la renovación para que sigas protegido?`;

    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  const getDateFormatOptions = useCallback((format) => {
    switch (format) {
      case 'DD/MM/YYYY': return { day: '2-digit', month: '2-digit', year: 'numeric' };
      case 'MM/DD/YYYY': return { month: '2-digit', day: '2-digit', year: 'numeric' };
      case 'YYYY-MM-DD': return { year: 'numeric', month: '2-digit', day: '2-digit' };
      default: return { day: '2-digit', month: '2-digit', year: 'numeric' };
    }
  }, []);

  const exportToCsv = useCallback((data, filename, headers) => {
    if (!data || data.length === 0) return;
    const csvHeaders = headers.map(h => h.label).join(',');
    const getNestedValue = (obj, path) => path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined) ? acc[part] : null, obj);
    const csvRows = data.map(row => headers.map(header => {
        let value = getNestedValue(row, header.key);
        if (header.type === 'date' && value) {
            value = new Date(value).toLocaleDateString(selectedLanguage === 'en' ? 'en-US' : 'es-ES', getDateFormatOptions(dateFormat));
        }
        return `"${String(value || '').replace(/"/g, '""')}"`;
      }).join(','));
    const csvContent = [csvHeaders, ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${filename}.csv`);
  }, [dateFormat, selectedLanguage, getDateFormatOptions]);

  const exportToPdf = useCallback((data, filename, headers, title) => {
    if (!data || data.length === 0) return;
    const doc = new jsPDF();
    doc.setFontSize(18); doc.text(title, 14, 22);
    const tableColumn = headers.map(h => h.label);
    const tableRows = data.map(item => headers.map(header => {
        let value = header.key.split('.').reduce((o, i) => (o ? o[i] : ''), item);
        if (header.type === 'date' && value) {
          value = new Date(value).toLocaleDateString(selectedLanguage === 'en' ? 'en-US' : 'es-ES', getDateFormatOptions(dateFormat));
        }
        return String(value || '');
      }));
    doc.autoTable({
        head: [tableColumn], body: tableRows, startY: 30,
        styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
        headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        tableWidth: 'auto', margin: { left: 10, right: 10 },
    });
    doc.save(`${filename}.pdf`);
  }, [dateFormat, selectedLanguage, getDateFormatOptions]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
          <h2 className="text-2xl font-bold text-center mb-6 text-slate-800">
            {showRegisterForm ? "Gestión Vital - Regístrate" : "Gestión Vital - Inicia Sesión"}
          </h2>
          {showRegisterForm ? (
            <RegisterForm apiBaseUrl={API_BASE_URL} onRegisterSuccess={() => setShowRegisterForm(false)} />
          ) : (
            <LoginForm onLoginSuccess={handleLoginSuccess} apiBaseUrl={API_BASE_URL} />
          )}
          <div className="text-center mt-6">
            <p className="text-slate-600 text-sm">
              {showRegisterForm ? '¿Ya tienes una cuenta?' : '¿No tienes una cuenta?'}
              <Button variant="link" onClick={() => setShowRegisterForm(!showRegisterForm)} className="ml-2 text-indigo-600 font-bold p-0">
                {showRegisterForm ? 'Inicia Sesión' : 'Regístrate'}
              </Button>
            </p>
          </div>
        </div>
        <Toaster />
      </div>
    );
  }

  return (
    <ConfirmationProvider>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        
        <nav className="bg-blue-600 text-white shadow-md sticky top-0 z-50">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
              <div className="bg-white text-indigo-600 p-1.5 rounded-lg">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight hidden sm:block">Gestión Vital</span>
            </div>
            
            <div className="hidden lg:flex items-center gap-1 overflow-x-auto">
            {[
              { id: 'dashboard', label: t('menu.dashboard', 'Dashboard') },
              { id: 'clientes', label: t('menu.clientes', 'Clientes') },
              { id: 'empresas-aseguradoras', label: t('menu.aseguradoras', 'Aseguradoras') },
              { id: 'asesores', label: t('menu.asesores', 'Asesores') },
              { id: 'polizas', label: t('menu.polizas', 'Pólizas') },
              { id: 'reclamaciones', label: t('menu.reclamaciones', 'Reclamaciones') },
              { id: 'comisiones', label: t('menu.comisiones', 'Comisiones') },
              { id: 'configuracion', label: t('menu.configuracion', 'Ajustes') },
            ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap
                    ${activeTab === tab.id 
                      ? 'bg-white/20 text-white shadow-inner' 
                      : 'text-indigo-100 hover:bg-white/10 hover:text-white'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              
              <button 
                onClick={() => setIsAlertsOpen(true)} 
                className="relative p-2 text-indigo-100 hover:text-white transition-colors"
                title="Centro de Alertas"
              >
                <Bell className="h-5 w-5" />
                {totalAlerts > 0 && (
                  <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center border border-blue-600 text-white animate-pulse">
                    {totalAlerts}
                  </span>
                )}
              </button>
              
              <Button onClick={handleLogout} variant="ghost" size="sm" className="text-indigo-100 hover:text-white hover:bg-white/10 hidden sm:flex">
                Salir
              </Button>
            </div>
          </div>
        </nav>

        <main className="flex-1 w-full max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8">
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <Dashboard
                statistics={statisticsSummaryData}
                upcomingPolicies={polizasProximasAVencer}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                empresasAseguradoras={empresasAseguradoras}
                isLoadingStats={isLoadingStatisticsSummary} 
                isLoadingUpcoming={isLoadingPolizasProximasAVencer}
                currencySymbol={currencySymbol}
                dateFormat={dateFormat}
                getDateFormatOptions={getDateFormatOptions}
                lossRatio={lossRatioData}
              />
              <div className="mt-8">
                <DashboardCharts 
                  polizas={polizas} 
                  reclamaciones={reclamaciones} 
                  empresas={empresasAseguradoras} 
                />
              </div>
            </div>
          )}

          {activeTab === 'clientes' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Directorio de Clientes</h2>
              </div>
              <ClientForm apiBaseUrl={API_BASE_URL} editingClient={editingClient} setEditingClient={setEditingClient} onClientSaved={() => fetchClientsData((clienteCurrentPage - 1) * CLIENTES_PER_PAGE, CLIENTES_PER_PAGE, clienteSearchTerm, clienteEmailFilter)} />
              <ClienteImport apiBaseUrl={API_BASE_URL} onImportComplete={() => handleClientSaved()} />
              <ClientList
                clients={clientes} onEditClient={setEditingClient} onDeleteClient={handleClientDelete}
                searchTerm={clienteSearchTerm} emailFilter={clienteEmailFilter}
                setSearchTerm={setClienteSearchTerm} setEmailFilter={setClienteEmailFilter}
                onSearch={handleClienteSearch} currentPage={clienteCurrentPage} itemsPerPage={CLIENTES_PER_PAGE}
                totalItems={totalClients} onPageChange={handleClientePageChange}
                onExport={exportToCsv} onExportPdf={exportToPdf} dateFormat={dateFormat} getDateFormatOptions={getDateFormatOptions}
              />
            </div>
          )}

          {activeTab === 'polizas' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Gestión de Pólizas</h2>
              <PolizaForm onPolizaSaved={handlePolizaSaved} editingPoliza={editingPoliza} setEditingPoliza={setEditingPoliza} apiBaseUrl={API_BASE_URL} clientes={clientes} empresasAseguradoras={empresasAseguradoras} asesores={asesores} isLoadingClients={isLoadingClients} isLoadingCompanies={isLoadingCompanies} isLoadingAdvisors={isLoadingAdvisors} />
              <PolizaImport apiBaseUrl={API_BASE_URL} onImportComplete={handlePolizaSaved} />
              <PolizaList
                polizas={polizas} onEditPoliza={setEditingPoliza} onDeletePoliza={handlePolizaDelete}
                searchTerm={polizaSearchTerm} tipoFilter={polizaTipoFilter} estadoFilter={polizaEstadoFilter}
                clienteIdFilter={polizaClienteIdFilter} fechaInicioFilter={polizaFechaInicioFilter} fechaFinFilter={polizaFechaFinFilter}
                setSearchTerm={setPolizaSearchTerm} setTipoFilter={setPolizaTipoFilter} setEstadoFilter={setPolizaEstadoFilter}
                setClienteIdFilter={setPolizaClienteIdFilter} setFechaInicioFilter={setPolizaFechaInicioFilter} setFechaFinFilter={setPolizaFechaFinFilter}
                onSearch={handlePolizaSearch} currentPage={polizaCurrentPage} itemsPerPage={POLIZAS_PER_PAGE}
                totalItems={totalPolizas} onPageChange={handlePolizaPageChange} apiBaseUrl={API_BASE_URL}
                onExport={exportToCsv} onExportPdf={exportToPdf} clients={clientes} empresasAseguradoras={empresasAseguradoras}
                currencySymbol={currencySymbol} dateFormat={dateFormat} getDateFormatOptions={getDateFormatOptions}
              />
            </div>
          )}

          {activeTab === 'reclamaciones' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Control de Siniestros</h2>
              <ReclamacionForm onReclamacionSaved={handleReclamacionSaved} editingReclamacion={editingReclamacion} setEditingReclamacion={setEditingReclamacion} apiBaseUrl={API_BASE_URL} polizas={polizas} clientes={clientes} isLoadingPolicies={isLoadingPolicies} isLoadingClients={isLoadingClients} />
              <ReclamacionImport apiBaseUrl={API_BASE_URL} onImportComplete={fetchClaimsData} />
              <ReclamacionList
                reclamaciones={reclamaciones} onEditReclamacion={setEditingReclamacion} onDeleteReclamacion={handleReclamacionDelete}
                searchTerm={reclamacionSearchTerm} estadoFilter={reclamacionEstadoFilter} clienteIdFilter={reclamacionClienteIdFilter} polizaIdFilter={reclamacionPolizaIdFilter}
                fechaReclamacionInicioFilter={reclamacionFechaReclamacionInicioFilter} fechaReclamacionFinFilter={reclamacionFechaReclamacionFinFilter}
                setSearchTerm={setReclamacionSearchTerm} setEstadoFilter={setReclamacionEstadoFilter} setClienteIdFilter={setReclamacionClienteIdFilter} setPolizaIdFilter={setReclamacionPolizaIdFilter}
                setFechaReclamacionInicioFilter={setReclamacionFechaReclamacionInicioFilter} setFechaReclamacionFinFilter={setReclamacionFechaReclamacionFinFilter}
                onSearch={handleReclamacionSearch} currentPage={reclamacionCurrentPage} itemsPerPage={RECLAMACIONES_PER_PAGE} totalItems={totalReclamaciones}
                onPageChange={handleReclamacionPageChange} apiBaseUrl={API_BASE_URL} onExport={exportToCsv} onExportPdf={exportToPdf}
                clients={clientes} polizas={polizas} isLoadingPolicies={isLoadingPolicies} isLoadingClients={isLoadingClients} isLoadingReclamaciones={isLoadingReclamaciones}
                currencySymbol={currencySymbol} dateFormat={dateFormat} getDateFormatOptions={getDateFormatOptions}
                onReclamacionUpdated={handleReclamacionSaved}
              />
            </div>
          )}

          {activeTab === 'empresas-aseguradoras' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Red de Aseguradoras</h2>
              <EmpresaAseguradoraForm onEmpresaAseguradoraSaved={handleEmpresaAseguradoraSaved} editingEmpresaAseguradora={editingEmpresaAseguradora} setEditingEmpresaAseguradora={setEditingEmpresaAseguradora} apiBaseUrl={API_BASE_URL} />
              <EmpresaAseguradoraImport apiBaseUrl={API_BASE_URL} onImportComplete={handleEmpresaAseguradoraSaved} />
              <EmpresaAseguradoraList
                empresas={empresasAseguradoras} onEditEmpresaAseguradora={setEditingEmpresaAseguradora} onDeleteEmpresaAseguradora={handleEmpresaAseguradoraDelete}
                currentPage={empresaAseguradoraCurrentPage} itemsPerPage={EMPRESAS_ASEGURADORAS_PER_PAGE} totalItems={totalEmpresasAseguradoras}
                onPageChange={handleEmpresaAseguradoraPageChange} searchTerm={empresaAseguradoraSearchTerm} setSearchTerm={setEmpresaAseguradoraSearchTerm}
                onSearch={handleEmpresaAseguradoraSearch} onExport={exportToCsv} onExportPdf={exportToPdf} dateFormat={dateFormat} getDateFormatOptions={getDateFormatOptions}
              />
            </div>
          )}

          {activeTab === 'asesores' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Fuerza de Ventas</h2>
              <AsesorForm onAsesorSaved={handleAsesorSaved} editingAsesor={editingAsesor} setEditingAsesor={setEditingAsesor} apiBaseUrl={API_BASE_URL} empresasAseguradoras={empresasAseguradoras} isLoadingCompanies={isLoadingCompanies} />
              <AsesorImport apiBaseUrl={API_BASE_URL} onImportComplete={handleAsesorSaved} />
              <AsesorList
                asesores={asesores} onEditAsesor={setEditingAsesor} onDeleteAsesor={handleAsesorDelete}
                currentPage={asesorCurrentPage} itemsPerPage={ASESORES_PER_PAGE} totalItems={totalAsesores}
                onPageChange={handleAsesorPageChange} searchTerm={asesorSearchTerm} setSearchTerm={setAsesorSearchTerm}
                onSearch={handleAsesorSearch} onExport={exportToCsv} onExportPdf={exportToPdf} empresasAseguradoras={empresasAseguradoras} 
                dateFormat={dateFormat} getDateFormatOptions={getDateFormatOptions}
              />
            </div>
          )}

          {activeTab === 'comisiones' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Liquidación de Comisiones</h2>
              <ComisionForm onComisionSaved={handleComisionSaved} editingComision={editingComision} setEditingComision={setEditingComision} apiBaseUrl={API_BASE_URL} asesores={asesores} polizas={polizas} isLoadingAdvisors={isLoadingAdvisors} isLoadingPolicies={isLoadingPolicies} />
              <ComisionImport apiBaseUrl={API_BASE_URL} onImportComplete={handleComisionSaved} />
              <ComisionList
                key={`list-sync-${asesores.length}-${polizas.length}-${comisiones.length}`}
                comisiones={comisiones} asesores={asesores} polizas={polizas} getDateFormatOptions={getDateFormatOptions}
                dateFormat={dateFormat} totalComisiones={totalComisiones} onEditComision={handleEditComision} onDeleteComision={handleDeleteComision}
                currentPage={comisionCurrentPage} setCurrentPage={setComisionCurrentPage} itemsPerPage={COMISIONES_PER_PAGE}
                setAsesorIdFilter={setComisionAsesorIdFilter} setEstadoPagoFilter={setComisionEstadoPagoFilter} setFechaInicioFilter={setComisionFechaInicioFilter} setFechaFinFilter={setComisionFechaFinFilter}
                onPagoExitoso={handleComisionSaved}
              />
            </div>
          )}

          {activeTab === 'configuracion' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Preferencias del Sistema</h2>
              <SettingsPage
                selectedLanguage={selectedLanguage} currencySymbol={currencySymbol} dateFormat={dateFormat}
                selectedCountry={selectedCountry} licenseKey={licenseKey} isLicenseValid={isLicenseValid}
                setSelectedLanguage={setSelectedLanguage} setCurrencySymbol={setCurrencySymbol} setDateFormat={setDateFormat}
                setSelectedCountry={setSelectedCountry} setLicenseKey={setLicenseKey} onSaveSettings={saveSettings}
                languageOptions={LANGUAGE_OPTIONS} currencyOptions={CURRENCY_SYMBOL_OPTIONS} dateFormatOptions={DATE_FORMAT_OPTIONS}
                countryOptions={COUNTRY_OPTIONS} masterLicenseKey={MASTER_LICENSE_KEY}
              />
            </div>
          )}
        </main>
        
        <Toaster />
        
        {isAlertsOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsAlertsOpen(false)}></div>
            
            <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
              <div className="p-4 border-b flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <Bell className="h-5 w-5 text-blue-600"/> Asistente Inteligente
                </h3>
                <button onClick={() => setIsAlertsOpen(false)} className="text-slate-400 hover:bg-slate-200 p-1 rounded-md transition-colors"><X size={20}/></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {totalAlerts === 0 ? (
                  <div className="text-center text-slate-500 mt-10">
                    <CheckCircle2 className="h-12 w-12 mx-auto text-emerald-400 mb-3 opacity-50"/>
                    <p className="font-semibold text-lg text-emerald-600">¡Todo al día!</p>
                    <p className="text-sm">No tienes tareas urgentes pendientes.</p>
                  </div>
                ) : (
                  <>
                    {statisticsSummaryData?.total_reclamaciones_pendientes > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
                         <h4 className="font-bold text-red-800 flex items-center gap-2 mb-2">
                           <AlertCircle className="h-4 w-4"/> Siniestros en Trámite
                         </h4>
                         <p className="text-sm text-red-700 mb-3">
                           Tienes <b>{statisticsSummaryData.total_reclamaciones_pendientes}</b> siniestros esperando resolución. ¡Tus clientes esperan respuestas!
                         </p>
                         <Button variant="outline" size="sm" className="w-full bg-white text-red-600 border-red-200 hover:bg-red-100 font-bold" onClick={() => { setActiveTab('reclamaciones'); setIsAlertsOpen(false); }}>
                           Gestionar Siniestros
                         </Button>
                      </div>
                    )}

                    {dineroEnLaCalle.total > 0 && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 shadow-sm">
                        <h4 className="font-bold text-emerald-800 flex items-center gap-2 mb-2">
                          <DollarSign className="h-4 w-4"/> Dinero en la Calle
                        </h4>
                        <p className="text-sm text-emerald-700 mb-3">
                          Tienes <b>{currencySymbol}{dineroEnLaCalle.total.toLocaleString('en-US', {minimumFractionDigits: 2})}</b> pendientes por cobrar en comisiones ({dineroEnLaCalle.cantidad} registros visibles).
                        </p>
                        <Button variant="outline" size="sm" className="w-full bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-100 font-bold" onClick={() => { setActiveTab('comisiones'); setIsAlertsOpen(false); }}>
                          Ir a Cobranza
                        </Button>
                      </div>
                    )}

                    {polizasProximasAVencer?.length > 0 && (
                      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 shadow-sm">
                        <h4 className="font-bold text-orange-800 flex items-center gap-2 mb-3">
                          <ShieldAlert className="h-4 w-4"/> Por Vencer ({polizasProximasAVencer.length})
                        </h4>
                        <ul className="space-y-2">
                          {polizasProximasAVencer.map(p => (
                            <li key={p.id} className="text-sm bg-white p-3 rounded-lg border border-orange-100 shadow-sm flex flex-col justify-between group hover:border-orange-400 transition-all">
                              <div className="flex justify-between items-start mb-1">
                                <span className="font-black text-slate-800">{p.numero_poliza}</span>
                                <span className="text-[10px] bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full font-bold animate-pulse">Renovar</span>
                              </div>
                              <p className="text-xs text-slate-500 mb-2">Vence: {String(p.fecha_fin).split('T')[0]}</p>
                              
                              <div className="flex items-center gap-2 mt-1 pt-2 border-t border-slate-50">
                                <Button variant="ghost" size="sm" className="h-7 flex-1 text-xs text-orange-600 hover:text-orange-800 hover:bg-orange-50 justify-center px-0" onClick={() => { setActiveTab('polizas'); setIsAlertsOpen(false); }}>
                                  Ver detalles
                                </Button>
                                <Button variant="outline" size="sm" className="h-7 flex-1 text-xs bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-800 shadow-sm" onClick={() => handleWhatsAppNotificacion(p)}>
                                  <MessageCircle className="h-3 w-3 mr-1" /> Avisar
                                </Button>
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
        
        <div className="fixed bottom-8 right-8 z-[90] flex flex-col items-end gap-3">
          
          {isQuickMenuOpen && (
            <div className="flex flex-col gap-3 animate-in slide-in-from-bottom-5 duration-200 origin-bottom">
              <button 
                onClick={() => { setQuickAddModal('siniestro'); setIsQuickMenuOpen(false); }}
                className="flex items-center gap-3 bg-white px-5 py-3 rounded-full shadow-2xl hover:bg-red-50 border border-slate-100 font-bold text-sm text-slate-700 transition-transform hover:scale-105"
              >
                <span className="bg-red-100 p-2 rounded-full text-red-600"><AlertCircle size={18}/></span>
                Reportar Siniestro
              </button>
              
              <button 
                onClick={() => { setQuickAddModal('cliente'); setIsQuickMenuOpen(false); }}
                className="flex items-center gap-3 bg-white px-5 py-3 rounded-full shadow-2xl hover:bg-blue-50 border border-slate-100 font-bold text-sm text-slate-700 transition-transform hover:scale-105"
              >
                <span className="bg-blue-100 p-2 rounded-full text-blue-600"><UserPlus size={18}/></span>
                Nuevo Cliente
              </button>
            </div>
          )}

          <button
            onClick={() => setIsQuickMenuOpen(!isQuickMenuOpen)}
            className={`h-16 w-16 rounded-full shadow-[0_10px_25px_rgba(37,99,235,0.5)] flex items-center justify-center text-white transition-all duration-300 transform ${
              isQuickMenuOpen ? 'bg-slate-800 rotate-45 scale-110' : 'bg-blue-600 hover:bg-blue-500 hover:scale-110'
            }`}
          >
            <Plus size={32} />
          </button>
        </div>

        {quickAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={handleCloseQuickAdd}></div>
            
            <div className="relative bg-slate-100 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
              
              <div className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm z-10">
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <Zap className="text-amber-500 h-6 w-6" /> 
                  {quickAddModal === 'cliente' ? 'Registro Exprés de Cliente' : 'Atención Rápida de Siniestro'}
                </h2>
                <button onClick={handleCloseQuickAdd} className="bg-slate-100 hover:bg-red-100 text-slate-500 hover:text-red-600 p-2 rounded-full transition-colors">
                  <X size={20}/>
                </button>
              </div>

              <div className="overflow-y-auto custom-scrollbar p-6">
                {quickAddModal === 'cliente' && (
                  <ClientForm 
                    apiBaseUrl={API_BASE_URL} 
                    editingClient={null} 
                    setEditingClient={() => {}} 
                    onClientSaved={() => {
                      handleClientSaved();
                      fetchClientsData(0, 9999, '', ''); 
                      handleCloseQuickAdd();
                      toast({ title: "¡Magia!", description: "Cliente guardado y listo en tu menú desplegable.", variant: "success" });
                    }} 
                  />
                )}
                
                {quickAddModal === 'siniestro' && (
                  <ReclamacionForm 
                    apiBaseUrl={API_BASE_URL} 
                    clientes={clientes} 
                    polizas={polizas} 
                    isLoadingPolicies={isLoadingPolicies} 
                    isLoadingClients={isLoadingClients}
                    editingReclamacion={null} 
                    setEditingReclamacion={() => {}} 
                    onReclamacionSaved={() => {
                      handleReclamacionSaved();
                      handleCloseQuickAdd();
                      toast({ title: "¡Emergencia atendida!", description: "El siniestro fue registrado exitosamente.", variant: "success" });
                    }} 
                  />
                )}
              </div>

            </div>
          </div>
        )}
        </div>
    </ConfirmationProvider>
  );
}

export default App;