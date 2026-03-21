import { useState, useCallback } from 'react';
import { useToast } from '@/lib/use-toast';

export const useEmpresas = (apiBaseUrl, handleLogout) => {
  const { toast } = useToast();
  const [empresasAseguradoras, setEmpresasAseguradoras] = useState([]);
  const [totalEmpresasAseguradoras, setTotalEmpresasAseguradoras] = useState(0);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  
  const [empresaAseguradoraSearchTerm, setEmpresaAseguradoraSearchTerm] = useState('');
  const [empresaAseguradoraCurrentPage, setEmpresaAseguradoraCurrentPage] = useState(1);

  const fetchInsuranceCompaniesData = useCallback(async (offset, limit, searchTerm = '') => {
    const token = localStorage.getItem('access_token');
    if (!token) { setIsLoadingCompanies(false); return; }
    setIsLoadingCompanies(true);
    try {
      const queryParams = new URLSearchParams({ offset, limit });
      if (searchTerm) queryParams.append('search', searchTerm);
      
      const response = await fetch(`${apiBaseUrl}/empresas-aseguradoras?${queryParams.toString()}`, {
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
  }, [apiBaseUrl, handleLogout]);

  const handleEmpresaAseguradoraDelete = useCallback(async (id, onComplete) => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`${apiBaseUrl}/empresas-aseguradoras/${id}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        if (response.status === 401) { handleLogout(); return; }
        throw new Error(`Error ${response.status}`);
      }
      toast({ title: "Empresa Eliminada", description: "La empresa ha sido eliminada.", variant: "success" });
      if (onComplete) onComplete();
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }, [apiBaseUrl, handleLogout, toast]);

  const handleEmpresaAseguradoraSearch = (searchTerm) => {
    setEmpresaAseguradoraSearchTerm(searchTerm); setEmpresaAseguradoraCurrentPage(1);
  };
  const handleEmpresaAseguradoraPageChange = (page) => setEmpresaAseguradoraCurrentPage(page);

  return { empresasAseguradoras, totalEmpresasAseguradoras, isLoadingCompanies, empresaAseguradoraSearchTerm, empresaAseguradoraCurrentPage, setEmpresaAseguradoraSearchTerm, fetchInsuranceCompaniesData, handleEmpresaAseguradoraDelete, handleEmpresaAseguradoraSearch, handleEmpresaAseguradoraPageChange };
};