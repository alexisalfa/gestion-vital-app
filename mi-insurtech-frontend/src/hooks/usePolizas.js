import { useState, useCallback } from 'react';
import { useToast } from '@/lib/use-toast';

export const usePolizas = (apiBaseUrl, handleLogout) => {
  const { toast } = useToast();
  const [polizas, setPolizas] = useState([]);
  const [totalPolizas, setTotalPolizas] = useState(0);
  const [isLoadingPolicies, setIsLoadingPolicies] = useState(true);
  
  const [polizaSearchTerm, setPolizaSearchTerm] = useState('');
  const [polizaTipoFilter, setPolizaTipoFilter] = useState('');
  const [polizaEstadoFilter, setPolizaEstadoFilter] = useState('');
  const [polizaClienteIdFilter, setPolizaClienteIdFilter] = useState('');
  const [polizaFechaInicioFilter, setPolizaFechaInicioFilter] = useState('');
  const [polizaFechaFinFilter, setPolizaFechaFinFilter] = useState('');
  const [polizaCurrentPage, setPolizaCurrentPage] = useState(1);

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

      const response = await fetch(`${apiBaseUrl}/polizas?${params.toString()}`, {
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
  }, [apiBaseUrl, handleLogout]);

  const handlePolizaDelete = useCallback(async (id, onComplete) => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`${apiBaseUrl}/polizas/${id}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        if (response.status === 401) { handleLogout(); return; }
        throw new Error(`Error ${response.status}`);
      }
      toast({ title: "Póliza Eliminada", description: "La póliza ha sido eliminada.", variant: "success" });
      if (onComplete) onComplete();
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }, [apiBaseUrl, handleLogout, toast]);

  const handlePolizaSearch = (searchTerm, tipoFilter, estadoFilter, clienteIdFilter, fechaInicioFilter, fechaFinFilter) => {
    setPolizaSearchTerm(searchTerm); setPolizaTipoFilter(tipoFilter); setPolizaEstadoFilter(estadoFilter);
    setPolizaClienteIdFilter(clienteIdFilter); setPolizaFechaInicioFilter(fechaInicioFilter); setPolizaFechaFinFilter(fechaFinFilter);
    setPolizaCurrentPage(1);
  };
  const handlePolizaPageChange = (page) => setPolizaCurrentPage(page);

  return { polizas, totalPolizas, isLoadingPolicies, polizaSearchTerm, polizaTipoFilter, polizaEstadoFilter, polizaClienteIdFilter, polizaFechaInicioFilter, polizaFechaFinFilter, polizaCurrentPage, setPolizaSearchTerm, setPolizaTipoFilter, setPolizaEstadoFilter, setPolizaClienteIdFilter, setPolizaFechaInicioFilter, setPolizaFechaFinFilter, fetchPoliciesData, handlePolizaDelete, handlePolizaSearch, handlePolizaPageChange };
};