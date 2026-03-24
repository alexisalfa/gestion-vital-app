// src/hooks/useComisiones.js
import { useState, useCallback } from 'react';
import { useToast } from '@/lib/use-toast';
import fetchWrapper from '../utils/fetchWrapper'; // 🔥 INJERTO: Motor centralizado

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

  // 🚀 FETCH REFACTORIZADO Y LIMPIO
  const fetchCommissionsData = useCallback(async (offset, limit, asesor_id_filter, estatus_pago_filter, fecha_inicio_filter, fecha_fin_filter) => {
    setIsLoadingComisiones(true);
    try {
      const queryParams = new URLSearchParams({ offset: offset.toString(), limit: limit.toString() });
      if (asesor_id_filter) queryParams.append('id_asesor', asesor_id_filter);
      if (estatus_pago_filter) queryParams.append('estatus_pago', estatus_pago_filter);
      if (fecha_inicio_filter) queryParams.append('fecha_inicio', fecha_inicio_filter);
      if (fecha_fin_filter) queryParams.append('fecha_fin', fecha_fin_filter);

      // Usamos el wrapper central
      const data = await fetchWrapper(`${apiBaseUrl}/comisiones/?${queryParams.toString()}`);
      
      const comisionesList = Array.isArray(data) ? data : (data.items || []);
      
      // Enriquecimiento de datos intacto
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
      // Adaptación para extraer el total_count del JSON o de la longitud
      setTotalComisiones(data.total_count !== undefined ? data.total_count : (data.total !== undefined ? data.total : comisionesEnriquecidas.length));
    } catch (error) {
      if (error.message === "Token_Expirado" || error.message === "No_Token") {
        handleLogout();
        return;
      }
      console.error("ERROR: fetchCommissionsData", error.message);
    } finally {
      setIsLoadingComisiones(false);
    }
  }, [apiBaseUrl, handleLogout, polizas, asesores]);

  // 🚀 DELETE REFACTORIZADO Y AMORTIGUADO
  const handleDeleteComision = useCallback(async (id, onComplete) => {
    try {
      await fetchWrapper(`${apiBaseUrl}/comisiones/${id}`, { method: 'DELETE' });
      
      toast({ title: "Éxito", description: "Comisión eliminada correctamente", variant: "success" });
      if (onComplete) onComplete();
    } catch (error) {
      if (error.message === "Token_Expirado" || error.message === "No_Token") {
        handleLogout();
        return;
      }
      
      // 🛡️ MÁGIA UX: Intercepción inteligente para Comisiones
      toast({ 
        title: "❌ Acción Bloqueada", 
        description: "No se puede eliminar esta comisión. Verifique si ya se encuentra liquidada, pagada o vinculada a un cierre de mes.", 
        variant: "destructive" 
      });
    }
  }, [apiBaseUrl, handleLogout, toast]);

  return { 
    comisiones, totalComisiones, isLoadingComisiones, comisionAsesorIdFilter, 
    comisionEstadoPagoFilter, comisionFechaInicioFilter, comisionFechaFinFilter, 
    comisionCurrentPage, setComisionAsesorIdFilter, setComisionEstadoPagoFilter, 
    setComisionFechaInicioFilter, setComisionFechaFinFilter, setComisionCurrentPage, 
    fetchCommissionsData, handleDeleteComision 
  };
};