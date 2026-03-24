// src/hooks/useClientes.js
import { useState, useCallback } from 'react';
import { useToast } from '@/lib/use-toast';
import fetchWrapper from '../utils/fetchWrapper'; // 🔥 INJERTO: Nuestro nuevo motor central

export const useClientes = (apiBaseUrl, handleLogout) => {
  const { toast } = useToast();

  const [clientes, setClientes] = useState([]);
  const [totalClients, setTotalClients] = useState(0);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [clienteSearchTerm, setClienteSearchTerm] = useState('');
  const [clienteEmailFilter, setClienteEmailFilter] = useState('');
  const [clienteCurrentPage, setClienteCurrentPage] = useState(1);

  // 🚀 FETCH REFACTORIZADO Y LIMPIO
  const fetchClientsData = useCallback(async (offset, limit, searchTerm, emailFilter) => {
    setIsLoadingClients(true);
    try {
      const queryParams = new URLSearchParams({ offset, limit });
      if (searchTerm) queryParams.append('search_term', searchTerm);
      if (emailFilter) queryParams.append('email_filter', emailFilter);

      // Usamos el wrapper en 1 sola línea, él se encarga de los tokens y errores
      const data = await fetchWrapper(`${apiBaseUrl}/clientes/?${queryParams.toString()}`);
      
      const rawItems = Array.isArray(data.items) ? data.items : (Array.isArray(data) ? data : []);
      const validClients = rawItems.filter(c => c && c.id !== undefined && c.id !== null);
      
      setClientes(validClients);
      setTotalClients(data.total_count || validClients.length);
    } catch (error) {
      // Si el wrapper grita que el token murió, cerramos sesión
      if (error.message === "Token_Expirado" || error.message === "No_Token") {
        handleLogout();
        return;
      }
      console.error("ERROR: fetchClientsData:", error.message);
    } finally {
      setIsLoadingClients(false);
    }
  }, [apiBaseUrl, handleLogout]);

  // 🚀 DELETE REFACTORIZADO Y LIMPIO
  const handleClientDelete = useCallback(async (id, onComplete) => {
    try {
      // Usamos el wrapper indicando que es método DELETE
      await fetchWrapper(`${apiBaseUrl}/clientes/${id}`, { method: 'DELETE' });
      
      toast({ title: "Cliente Eliminado", description: "El cliente ha sido eliminado.", variant: "success" });
      if (onComplete) onComplete(); 
    } catch (error) {
      if (error.message === "Token_Expirado" || error.message === "No_Token") {
        handleLogout();
        return;
      }
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }, [apiBaseUrl, handleLogout, toast]);

  // Utilidades de Filtro y Paginación intactas
  const handleClienteSearch = (searchTerm, emailFilter) => {
    setClienteSearchTerm(searchTerm);
    setClienteEmailFilter(emailFilter);
    setClienteCurrentPage(1);
  };

  const handleClientePageChange = (page) => setClienteCurrentPage(page);

  return {
    clientes, totalClients, isLoadingClients, clienteSearchTerm, clienteEmailFilter, clienteCurrentPage,
    setClienteSearchTerm, setClienteEmailFilter, fetchClientsData, handleClientDelete, handleClienteSearch, handleClientePageChange
  };
};