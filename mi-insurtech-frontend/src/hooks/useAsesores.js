import { useState, useCallback } from 'react';
import { useToast } from '@/lib/use-toast';

export const useAsesores = (apiBaseUrl, handleLogout) => {
  const { toast } = useToast();
  const [asesores, setAsesores] = useState([]);
  const [totalAsesores, setTotalAsesores] = useState(0);
  const [isLoadingAdvisors, setIsLoadingAdvisors] = useState(true);
  
  const [asesorSearchTerm, setAsesorSearchTerm] = useState('');
  const [asesorCurrentPage, setAsesorCurrentPage] = useState(1);

  const fetchAdvisorsData = useCallback(async (offset, limit, searchTerm = '') => {
    const token = localStorage.getItem('access_token');
    if (!token) { setIsLoadingAdvisors(false); return; }
    setIsLoadingAdvisors(true);
    try {
      const queryParams = new URLSearchParams({ offset, limit });
      if (searchTerm) queryParams.append('search_term', searchTerm);

      const response = await fetch(`${apiBaseUrl}/asesores?${queryParams.toString()}`, {
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
  }, [apiBaseUrl, handleLogout]);

  const handleAsesorDelete = useCallback(async (id, onComplete) => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`${apiBaseUrl}/asesores/${id}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        if (response.status === 401) { handleLogout(); return; }
        throw new Error(`Error HTTP: ${response.status}`);
      }
      toast({ title: "Asesor Eliminado", description: "El asesor ha sido eliminado.", variant: "success" });
      if (onComplete) onComplete();
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }, [apiBaseUrl, handleLogout, toast]);

  const handleAsesorSearch = (searchTerm) => {
    setAsesorSearchTerm(searchTerm); setAsesorCurrentPage(1);
  };
  const handleAsesorPageChange = (page) => setAsesorCurrentPage(page);

  return { asesores, totalAsesores, isLoadingAdvisors, asesorSearchTerm, asesorCurrentPage, setAsesorSearchTerm, fetchAdvisorsData, handleAsesorDelete, handleAsesorSearch, handleAsesorPageChange };
};