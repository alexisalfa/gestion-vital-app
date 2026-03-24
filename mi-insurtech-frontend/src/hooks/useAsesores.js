// src/hooks/useAsesores.js
import { useState, useCallback } from 'react';
import { useToast } from '@/lib/use-toast';
import fetchWrapper from '../utils/fetchWrapper'; // 🔥 INJERTO: Motor central

export const useAsesores = (apiBaseUrl, handleLogout) => {
  const { toast } = useToast();
  const [asesores, setAsesores] = useState([]);
  const [totalAsesores, setTotalAsesores] = useState(0);
  const [isLoadingAdvisors, setIsLoadingAdvisors] = useState(true);
  
  const [asesorSearchTerm, setAsesorSearchTerm] = useState('');
  const [asesorCurrentPage, setAsesorCurrentPage] = useState(1);

  // 🚀 FETCH REFACTORIZADO
  const fetchAdvisorsData = useCallback(async (offset, limit, searchTerm = '') => {
    setIsLoadingAdvisors(true);
    try {
      const queryParams = new URLSearchParams({ offset, limit });
      if (searchTerm) queryParams.append('search_term', searchTerm);

      // Usamos el wrapper en 1 sola línea
      const data = await fetchWrapper(`${apiBaseUrl}/asesores?${queryParams.toString()}`);
      
      let listaAsesores = Array.isArray(data) ? data : (data.items || []);
      const validAdvisors = listaAsesores.filter(a => a && a.id !== undefined);
      
      setAsesores(validAdvisors); 
      setTotalAsesores(data.total_count || validAdvisors.length);
    } catch (error) {
      if (error.message === "Token_Expirado" || error.message === "No_Token") {
        handleLogout();
        return;
      }
      console.error("ERROR: fetchAdvisorsData", error.message);
    } finally {
      setIsLoadingAdvisors(false);
    }
  }, [apiBaseUrl, handleLogout]);

  // 🚀 DELETE REFACTORIZADO Y AMORTIGUADO
  const handleAsesorDelete = useCallback(async (id, onComplete) => {
    try {
      await fetchWrapper(`${apiBaseUrl}/asesores/${id}`, { method: 'DELETE' });
      
      toast({ title: "Asesor Eliminado", description: "El asesor ha sido eliminado.", variant: "success" });
      if (onComplete) onComplete();
    } catch (error) {
      if (error.message === "Token_Expirado" || error.message === "No_Token") {
        handleLogout();
        return;
      }
      
      // 🛡️ MÁGIA UX: Mensaje inteligente para proteger la Base de Datos
      toast({ 
        title: "❌ Acción Bloqueada", 
        description: "No se puede eliminar este asesor porque tiene pólizas o comisiones registradas a su nombre. Elimínelas o reasígnelas primero.", 
        variant: "destructive" 
      });
    }
  }, [apiBaseUrl, handleLogout, toast]);

  const handleAsesorSearch = (searchTerm) => {
    setAsesorSearchTerm(searchTerm); setAsesorCurrentPage(1);
  };
  
  const handleAsesorPageChange = (page) => setAsesorCurrentPage(page);

  return { 
    asesores, totalAsesores, isLoadingAdvisors, asesorSearchTerm, asesorCurrentPage, 
    setAsesorSearchTerm, fetchAdvisorsData, handleAsesorDelete, handleAsesorSearch, handleAsesorPageChange 
  };
};