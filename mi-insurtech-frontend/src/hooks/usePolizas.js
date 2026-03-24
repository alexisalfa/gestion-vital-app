// src/hooks/usePolizas.js
import { useState, useCallback } from 'react';
import { useToast } from '@/lib/use-toast';
import fetchWrapper from '../utils/fetchWrapper'; // 🔥 INJERTO: Motor centralizado

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

  // 🚀 FETCH REFACTORIZADO Y LIMPIO
  const fetchPoliciesData = useCallback(async (offset = 0, limit = 10, searchTerm = '', tipoFilter = '', estadoFilter = '', clienteIdFilter = '', fechaInicioFilter = '', fechaFinFilter = '') => {
    setIsLoadingPolicies(true);
    try {
      const params = new URLSearchParams({ offset: offset.toString(), limit: limit.toString() });
      if (searchTerm) params.append('search_term', searchTerm);
      if (tipoFilter) params.append('tipo_filter', tipoFilter);
      if (estadoFilter) params.append('estado_filter', estadoFilter);
      if (clienteIdFilter) params.append('cliente_id_filter', clienteIdFilter);
      if (fechaInicioFilter) params.append('fecha_inicio_filter', fechaInicioFilter);
      if (fechaFinFilter) params.append('fecha_fin_filter', fechaFinFilter);

      // Usamos el wrapper en 1 sola línea
      const data = await fetchWrapper(`${apiBaseUrl}/polizas?${params.toString()}`);
      
      const items = Array.isArray(data) ? data : (data.items || []);
      setPolizas(items);
      setTotalPolizas(data.total_count !== undefined ? data.total_count : items.length);
    } catch (error) {
      if (error.message === "Token_Expirado" || error.message === "No_Token") {
        handleLogout();
        return;
      }
      console.error("Error en fetchPoliciesData:", error.message);
    } finally {
      setIsLoadingPolicies(false);
    }
  }, [apiBaseUrl, handleLogout]);

  // 🚀 DELETE REFACTORIZADO Y AMORTIGUADO
  const handlePolizaDelete = useCallback(async (id, onComplete) => {
    try {
      await fetchWrapper(`${apiBaseUrl}/polizas/${id}`, { method: 'DELETE' });
      
      toast({ title: "Póliza Eliminada", description: "La póliza ha sido eliminada.", variant: "success" });
      if (onComplete) onComplete();
    } catch (error) {
      if (error.message === "Token_Expirado" || error.message === "No_Token") {
        handleLogout();
        return;
      }
      
      // 🛡️ MÁGIA UX: Intercepción inteligente para Pólizas
      toast({ 
        title: "❌ Acción Bloqueada", 
        description: "No se puede eliminar esta póliza porque tiene Siniestros o Comisiones asociadas. Elimine esos registros primero.", 
        variant: "destructive" 
      });
    }
  }, [apiBaseUrl, handleLogout, toast]);

  const handlePolizaSearch = (searchTerm, tipoFilter, estadoFilter, clienteIdFilter, fechaInicioFilter, fechaFinFilter) => {
    setPolizaSearchTerm(searchTerm); setPolizaTipoFilter(tipoFilter); setPolizaEstadoFilter(estadoFilter);
    setPolizaClienteIdFilter(clienteIdFilter); setPolizaFechaInicioFilter(fechaInicioFilter); setPolizaFechaFinFilter(fechaFinFilter);
    setPolizaCurrentPage(1);
  };
  
  const handlePolizaPageChange = (page) => setPolizaCurrentPage(page);

  return { 
    polizas, totalPolizas, isLoadingPolicies, polizaSearchTerm, polizaTipoFilter, polizaEstadoFilter, 
    polizaClienteIdFilter, polizaFechaInicioFilter, polizaFechaFinFilter, polizaCurrentPage, 
    setPolizaSearchTerm, setPolizaTipoFilter, setPolizaEstadoFilter, setPolizaClienteIdFilter, 
    setPolizaFechaInicioFilter, setPolizaFechaFinFilter, fetchPoliciesData, handlePolizaDelete, 
    handlePolizaSearch, handlePolizaPageChange 
  };
};