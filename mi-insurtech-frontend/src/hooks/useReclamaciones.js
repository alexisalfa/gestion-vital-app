// src/hooks/useReclamaciones.js
import { useState, useCallback } from 'react';
import { useToast } from '@/lib/use-toast';
import fetchWrapper from '../utils/fetchWrapper'; // 🔥 INJERTO: Motor centralizado

export const useReclamaciones = (apiBaseUrl, handleLogout) => {
  const { toast } = useToast();
  const [reclamaciones, setReclamaciones] = useState([]);
  const [totalReclamaciones, setTotalReclamaciones] = useState(0);
  const [isLoadingReclamaciones, setIsLoadingReclamaciones] = useState(true);

  const [reclamacionSearchTerm, setReclamacionSearchTerm] = useState('');
  const [reclamacionEstadoFilter, setReclamacionEstadoFilter] = useState('');
  const [reclamacionClienteIdFilter, setReclamacionClienteIdFilter] = useState('');
  const [reclamacionPolizaIdFilter, setReclamacionPolizaIdFilter] = useState('');
  const [reclamacionFechaReclamacionInicioFilter, setReclamacionFechaReclamacionInicioFilter] = useState('');
  const [reclamacionFechaReclamacionFinFilter, setReclamacionFechaReclamacionFinFilter] = useState('');
  const [reclamacionCurrentPage, setReclamacionCurrentPage] = useState(1);

  // 🚀 FETCH REFACTORIZADO Y LIMPIO
  const fetchClaimsData = useCallback(async (offset = 0, limit = 10, searchTerm = '', estadoFilter = '', polizaIdFilter = '', fechaInicio = '', fechaFin = '') => {
    setIsLoadingReclamaciones(true);
    try {
      const queryParams = new URLSearchParams({ offset: offset.toString(), limit: limit.toString() });
      if (searchTerm) queryParams.append('search_term', searchTerm);
      if (estadoFilter) queryParams.append('estado_filter', estadoFilter);
      if (polizaIdFilter) queryParams.append('poliza_id_filter', polizaIdFilter);
      if (fechaInicio) queryParams.append('fecha_reclamacion_inicio_filter', fechaInicio);
      if (fechaFin) queryParams.append('fecha_reclamacion_fin_filter', fechaFin);

      // Usamos el wrapper central
      const data = await fetchWrapper(`${apiBaseUrl}/reclamaciones/?${queryParams.toString()}`);
      
      const items = Array.isArray(data) ? data : (data.items || []);
      setReclamaciones(items.filter(r => r && r.id));
      setTotalReclamaciones(data.total_count !== undefined ? data.total_count : items.length);
    } catch (error) {
      if (error.message === "Token_Expirado" || error.message === "No_Token") {
        handleLogout();
        return;
      }
      console.error("Error al cargar reclamaciones:", error.message);
    } finally {
      setIsLoadingReclamaciones(false);
    }
  }, [apiBaseUrl, handleLogout]);

  // 🚀 DELETE REFACTORIZADO Y AMORTIGUADO
  const handleReclamacionDelete = useCallback(async (id, onComplete) => {
    try {
      await fetchWrapper(`${apiBaseUrl}/reclamaciones/${id}`, { method: 'DELETE' });
      
      toast({ title: "Siniestro Eliminado", description: "El registro ha sido eliminado.", variant: "success" });
      if (onComplete) onComplete();
    } catch (error) {
      if (error.message === "Token_Expirado" || error.message === "No_Token") {
        handleLogout();
        return;
      }
      
      // 🛡️ MÁGIA UX: Intercepción inteligente para Siniestros
      toast({ 
        title: "❌ Acción Bloqueada", 
        description: "No se puede eliminar este siniestro. Es posible que tenga documentos legales o pagos emitidos asociados.", 
        variant: "destructive" 
      });
    }
  }, [apiBaseUrl, handleLogout, toast]);

  const handleReclamacionSearch = (searchTerm, estadoFilter, clienteIdFilter, polizaIdFilter, fechaInicio, fechaFin) => {
    setReclamacionSearchTerm(searchTerm); 
    setReclamacionEstadoFilter(estadoFilter); 
    setReclamacionClienteIdFilter(clienteIdFilter);
    setReclamacionPolizaIdFilter(polizaIdFilter); 
    setReclamacionFechaReclamacionInicioFilter(fechaInicio); 
    setReclamacionFechaReclamacionFinFilter(fechaFin);
    setReclamacionCurrentPage(1);
  };
  
  const handleReclamacionPageChange = (page) => setReclamacionCurrentPage(page);

  return { 
    reclamaciones, totalReclamaciones, isLoadingReclamaciones, reclamacionSearchTerm, 
    reclamacionEstadoFilter, reclamacionClienteIdFilter, reclamacionPolizaIdFilter, 
    reclamacionFechaReclamacionInicioFilter, reclamacionFechaReclamacionFinFilter, 
    reclamacionCurrentPage, setReclamacionSearchTerm, setReclamacionEstadoFilter, 
    setReclamacionClienteIdFilter, setReclamacionPolizaIdFilter, 
    setReclamacionFechaReclamacionInicioFilter, setReclamacionFechaReclamacionFinFilter, 
    fetchClaimsData, handleReclamacionDelete, handleReclamacionSearch, 
    handleReclamacionPageChange 
  };
};