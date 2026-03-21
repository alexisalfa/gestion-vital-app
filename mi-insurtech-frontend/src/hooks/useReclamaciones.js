import { useState, useCallback } from 'react';
import { useToast } from '@/lib/use-toast';

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

  const fetchClaimsData = useCallback(async (offset = 0, limit = 10, searchTerm = '', estadoFilter = '', polizaIdFilter = '', fechaInicio = '', fechaFin = '') => {
    const token = localStorage.getItem('access_token');
    if (!token) { setIsLoadingReclamaciones(false); return; }
    setIsLoadingReclamaciones(true);
    try {
      const queryParams = new URLSearchParams({ offset: offset.toString(), limit: limit.toString() });
      if (searchTerm) queryParams.append('search_term', searchTerm);
      if (estadoFilter) queryParams.append('estado_filter', estadoFilter);
      if (polizaIdFilter) queryParams.append('poliza_id_filter', polizaIdFilter);
      if (fechaInicio) queryParams.append('fecha_reclamacion_inicio_filter', fechaInicio);
      if (fechaFin) queryParams.append('fecha_reclamacion_fin_filter', fechaFin);

      const response = await fetch(`${apiBaseUrl}/reclamaciones/?${queryParams.toString()}`, {
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
  }, [apiBaseUrl, handleLogout]);

  const handleReclamacionDelete = useCallback(async (id, onComplete) => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`${apiBaseUrl}/reclamaciones/${id}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        if (response.status === 401) { handleLogout(); return; }
        throw new Error(`Error ${response.status}`);
      }
      toast({ title: "Siniestro Eliminado", description: "El registro ha sido eliminado.", variant: "success" });
      if (onComplete) onComplete();
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }, [apiBaseUrl, handleLogout, toast]);

  const handleReclamacionSearch = (searchTerm, estadoFilter, clienteIdFilter, polizaIdFilter, fechaInicio, fechaFin) => {
    setReclamacionSearchTerm(searchTerm); setReclamacionEstadoFilter(estadoFilter); setReclamacionClienteIdFilter(clienteIdFilter);
    setReclamacionPolizaIdFilter(polizaIdFilter); setReclamacionFechaReclamacionInicioFilter(fechaInicio); setReclamacionFechaReclamacionFinFilter(fechaFin);
    setReclamacionCurrentPage(1);
  };
  const handleReclamacionPageChange = (page) => setReclamacionCurrentPage(page);

  return { reclamaciones, totalReclamaciones, isLoadingReclamaciones, reclamacionSearchTerm, reclamacionEstadoFilter, reclamacionClienteIdFilter, reclamacionPolizaIdFilter, reclamacionFechaReclamacionInicioFilter, reclamacionFechaReclamacionFinFilter, reclamacionCurrentPage, setReclamacionSearchTerm, setReclamacionEstadoFilter, setReclamacionClienteIdFilter, setReclamacionPolizaIdFilter, setReclamacionFechaReclamacionInicioFilter, setReclamacionFechaReclamacionFinFilter, fetchClaimsData, handleReclamacionDelete, handleReclamacionSearch, handleReclamacionPageChange };
};