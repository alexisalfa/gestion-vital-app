import { useState, useCallback } from 'react';
import { useToast } from '@/lib/use-toast';

export const useComisiones = (apiBaseUrl, handleLogout, polizas, asesores) => {
  const { toast } = useToast();
  const [comisiones, setComisiones] = useState([]);
  const [totalComisiones, setTotalComisiones] = useState(0);
  const [isLoadingComisiones, setIsLoadingComisiones] = useState(true);

  const [comisionAsesorIdFilter, setComisionAsesorIdFilter] = useState('');
  const [comisionEstadoPagoFilter, setComisionEstadoPagoFilter] = useState('');
  const [comisionFechaInicioFilter, setComisionFechaInicioFilter] = useState('');
  const [comisionFechaFinFilter, setComisionFechaFinFilter] = useState('');
  const [comisionCurrentPage, setComisionCurrentPage] = useState(1);

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

      const response = await fetch(`${apiBaseUrl}/comisiones/?${queryParams.toString()}`, {
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
  }, [apiBaseUrl, handleLogout, polizas, asesores]);

  const handleDeleteComision = useCallback(async (id, onComplete) => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`${apiBaseUrl}/comisiones/${id}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        toast({ title: "Éxito", description: "Comisión eliminada correctamente", variant: "success" });
        if (onComplete) onComplete();
      } else {
        throw new Error('Error al eliminar');
      }
    } catch (error) {
      toast({ title: "Error", description: "No se pudo eliminar la comisión", variant: "destructive" });
    }
  }, [apiBaseUrl, toast]);

  return { comisiones, totalComisiones, isLoadingComisiones, comisionAsesorIdFilter, comisionEstadoPagoFilter, comisionFechaInicioFilter, comisionFechaFinFilter, comisionCurrentPage, setComisionAsesorIdFilter, setComisionEstadoPagoFilter, setComisionFechaInicioFilter, setComisionFechaFinFilter, setComisionCurrentPage, fetchCommissionsData, handleDeleteComision };
};