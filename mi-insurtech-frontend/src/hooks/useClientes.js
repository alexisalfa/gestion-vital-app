// src/hooks/useClientes.js
import { useState, useCallback } from 'react';
import { useToast } from '@/lib/use-toast';

export const useClientes = (apiBaseUrl, handleLogout) => {
  const { toast } = useToast();

  // 1. Los Estados (Variables)
  const [clientes, setClientes] = useState([]);
  const [totalClients, setTotalClients] = useState(0);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [clienteSearchTerm, setClienteSearchTerm] = useState('');
  const [clienteEmailFilter, setClienteEmailFilter] = useState('');
  const [clienteCurrentPage, setClienteCurrentPage] = useState(1);

  // 2. La función de Buscar al Backend
  const fetchClientsData = useCallback(async (offset, limit, searchTerm, emailFilter) => {
    const token = localStorage.getItem('access_token');
    if (!token) { setIsLoadingClients(false); return; }
    setIsLoadingClients(true);
    try {
      const queryParams = new URLSearchParams({ offset, limit });
      if (searchTerm) queryParams.append('search_term', searchTerm);
      if (emailFilter) queryParams.append('email_filter', emailFilter);

      const response = await fetch(`${apiBaseUrl}/clientes/?${queryParams.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        if (response.status === 401) { handleLogout(); return; }
        throw new Error(`Error ${response.status}`);
      }
      const data = await response.json();
      const rawItems = Array.isArray(data.items) ? data.items : (Array.isArray(data) ? data : []);
      const validClients = rawItems.filter(c => c && c.id !== undefined && c.id !== null);
      
      setClientes(validClients);
      setTotalClients(data.total_count || validClients.length);
    } catch (error) {
      console.error("ERROR: fetchClientsData:", error);
    } finally {
      setIsLoadingClients(false);
    }
  }, [apiBaseUrl, handleLogout]);

  // 3. La función de Borrar
  const handleClientDelete = useCallback(async (id, onComplete) => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`${apiBaseUrl}/clientes/${id}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        if (response.status === 401) { handleLogout(); return; }
        throw new Error(`Error ${response.status}`);
      }
      toast({ title: "Cliente Eliminado", description: "El cliente ha sido eliminado.", variant: "success" });
      if (onComplete) onComplete(); // Ejecutamos la recarga de datos después de borrar
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }, [apiBaseUrl, handleLogout, toast]);

  // 4. Utilidades de Filtro y Paginación
  const handleClienteSearch = (searchTerm, emailFilter) => {
    setClienteSearchTerm(searchTerm);
    setClienteEmailFilter(emailFilter);
    setClienteCurrentPage(1);
  };

  const handleClientePageChange = (page) => setClienteCurrentPage(page);

  // 5. Entregamos todo el paquete listo para usar
  return {
    clientes,
    totalClients,
    isLoadingClients,
    clienteSearchTerm,
    clienteEmailFilter,
    clienteCurrentPage,
    setClienteSearchTerm,
    setClienteEmailFilter,
    fetchClientsData,
    handleClientDelete,
    handleClienteSearch,
    handleClientePageChange
  };
};