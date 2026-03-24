// src/hooks/useEmpresas.js
import { useState, useCallback } from 'react';
import { useToast } from '@/lib/use-toast';
import fetchWrapper from '../utils/fetchWrapper'; // 🔥 INJERTO: Motor centralizado

export const useEmpresas = (apiBaseUrl, handleLogout) => {
  const { toast } = useToast();
  const [empresasAseguradoras, setEmpresasAseguradoras] = useState([]);
  const [totalEmpresasAseguradoras, setTotalEmpresasAseguradoras] = useState(0);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  
  const [empresaAseguradoraSearchTerm, setEmpresaAseguradoraSearchTerm] = useState('');
  const [empresaAseguradoraCurrentPage, setEmpresaAseguradoraCurrentPage] = useState(1);

  // 🚀 FETCH REFACTORIZADO Y LIMPIO
  const fetchInsuranceCompaniesData = useCallback(async (offset, limit, searchTerm = '') => {
    setIsLoadingCompanies(true);
    try {
      const queryParams = new URLSearchParams({ offset, limit });
      // Mantenemos el parámetro 'search' original para no romper el backend
      if (searchTerm) queryParams.append('search', searchTerm);
      
      const data = await fetchWrapper(`${apiBaseUrl}/empresas-aseguradoras?${queryParams.toString()}`);
      
      const items = Array.isArray(data.items) ? data.items : (Array.isArray(data) ? data : []);
      setEmpresasAseguradoras(items.filter(c => c && c.id !== undefined));
      setTotalEmpresasAseguradoras(data.total !== undefined ? data.total : items.length);
    } catch (error) {
      if (error.message === "Token_Expirado" || error.message === "No_Token") {
        handleLogout();
        return;
      }
      console.error("ERROR: fetchInsuranceCompaniesData", error.message);
    } finally {
      setIsLoadingCompanies(false);
    }
  }, [apiBaseUrl, handleLogout]);

  // 🚀 DELETE REFACTORIZADO Y AMORTIGUADO
  const handleEmpresaAseguradoraDelete = useCallback(async (id, onComplete) => {
    try {
      await fetchWrapper(`${apiBaseUrl}/empresas-aseguradoras/${id}`, { method: 'DELETE' });
      
      toast({ title: "Empresa Eliminada", description: "La empresa ha sido eliminada.", variant: "success" });
      if (onComplete) onComplete();
    } catch (error) {
      if (error.message === "Token_Expirado" || error.message === "No_Token") {
        handleLogout();
        return;
      }
      
      // 🛡️ MÁGIA UX: Intercepción inteligente para Aseguradoras
      toast({ 
        title: "❌ Acción Bloqueada", 
        description: "No se puede eliminar esta aseguradora porque tiene Pólizas o Asesores vinculados. Reasígnelos primero.", 
        variant: "destructive" 
      });
    }
  }, [apiBaseUrl, handleLogout, toast]);

  const handleEmpresaAseguradoraSearch = (searchTerm) => {
    setEmpresaAseguradoraSearchTerm(searchTerm); 
    setEmpresaAseguradoraCurrentPage(1);
  };
  
  const handleEmpresaAseguradoraPageChange = (page) => setEmpresaAseguradoraCurrentPage(page);

  return { 
    empresasAseguradoras, totalEmpresasAseguradoras, isLoadingCompanies, 
    empresaAseguradoraSearchTerm, empresaAseguradoraCurrentPage, 
    setEmpresaAseguradoraSearchTerm, fetchInsuranceCompaniesData, 
    handleEmpresaAseguradoraDelete, handleEmpresaAseguradoraSearch, 
    handleEmpresaAseguradoraPageChange 
  };
};