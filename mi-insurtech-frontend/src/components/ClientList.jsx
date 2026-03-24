// src/components/ClientList.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/lib/use-toast';
import { Input } from '@/components/ui/input';
import { useConfirmation } from './ConfirmationContext'; 
import { Loader2, Search, FileDown, FileText, Edit2, Trash2, Users, Mail, Phone, Eye, AlertTriangle, CheckCircle2 } from 'lucide-react'; 
import ClientProfile360 from './ClientProfile360';
import useDebounce from '../hooks/useDebounce'; // 🔥 MOTOR: Búsqueda sin colapsos

function ClientList({
  clients = [],
  onEditClient,
  onDeleteClient,
  searchTerm,
  emailFilter,
  setSearchTerm,
  setEmailFilter,
  onSearch,
  currentPage,
  itemsPerPage,
  totalItems,
  onPageChange,
  onExport, 
  onExportPdf, 
  dateFormat, 
  getDateFormatOptions 
}) {
  const { toast } = useToast();
  const { confirm } = useConfirmation(); 
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isExporting, setIsExporting] = useState(false); 
  const [selectedClient360, setSelectedClient360] = useState(null);

  // --- MOTOR DE BÚSQUEDA EN TIEMPO REAL ---
  const [localSearch, setLocalSearch] = useState(searchTerm || '');
  const debouncedSearch = useDebounce(localSearch, 500);

  // Dispara la búsqueda automáticamente cuando el usuario hace una pausa
  useEffect(() => {
    if (debouncedSearch !== searchTerm) {
      onSearch(debouncedSearch, emailFilter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // Sincroniza el input si el filtro se limpia desde afuera
  useEffect(() => {
    setLocalSearch(searchTerm || '');
  }, [searchTerm]);

  // --- GENERADOR DE AVATARES ---
  const getInitials = (nombre, apellido) => {
    return `${nombre?.charAt(0) || ''}${apellido?.charAt(0) || ''}`.toUpperCase();
  };

  const getAvatarColor = (nombre) => {
    const colors = ['bg-blue-100 text-blue-700', 'bg-emerald-100 text-emerald-700', 'bg-purple-100 text-purple-700', 'bg-amber-100 text-amber-700', 'bg-rose-100 text-rose-700'];
    const index = nombre ? nombre.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  // --- SEMÁFORO CRM INTELIGENTE ---
  const getCrmStatus = (dias) => {
    if (dias === null || dias === undefined) return { label: 'Sin Pólizas', style: 'bg-slate-100 text-slate-600 border-slate-200', icon: null };
    if (dias < 0) return { label: 'Vencida', style: 'bg-rose-100 text-rose-700 border-rose-200', icon: <AlertTriangle className="w-3 h-3 mr-1"/> };
    if (dias <= 30) return { label: '¡Renovar Pronto!', style: 'bg-amber-100 text-amber-700 border-amber-300 animate-pulse shadow-sm', icon: <AlertTriangle className="w-3 h-3 mr-1"/> };
    return { label: 'Al día', style: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <CheckCircle2 className="w-3 h-3 mr-1"/> };
  };

  // --- SUGERENCIAS DEL BUSCADOR ---
  useEffect(() => {
    if (localSearch.length >= 2 && clients.length > 0) {
      const filteredSuggestions = clients
        .filter(client =>
          client.nombre.toLowerCase().includes(localSearch.toLowerCase()) ||
          client.apellido.toLowerCase().includes(localSearch.toLowerCase()) ||
          (client.identificacion && client.identificacion.toLowerCase().includes(localSearch.toLowerCase())) ||
          client.email.toLowerCase().includes(localSearch.toLowerCase())
        )
        .map(client => ({
          id: client.id,
          name: `${client.nombre} ${client.apellido} (${client.identificacion || 'N/A'})`,
        }))
        .slice(0, 5); 
      
      setSuggestions(filteredSuggestions);
      setShowSuggestions(filteredSuggestions.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [localSearch, clients]); 

  // --- MANEJADORES DE ACCIÓN ---
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(localSearch, emailFilter); 
    setShowSuggestions(false); 
  };

  const handleClearFilters = () => {
    setLocalSearch('');
    onSearch('', ''); 
    setShowSuggestions(false); 
  };

  const handleDeleteClick = (client) => {
    confirm({
      title: "⚠️ ¿Eliminar Cliente Definitivamente?",
      message: `¿Quiere borrar a ${client.nombre} ${client.apellido}? Perderá todo su historial.\n\nIMPORTANTE: Si quiere eliminarlo, por favor elimine primero sus pólizas asociadas.`,
      onConfirm: () => onDeleteClient(client.id),
    });
  };

  // --- EXPORTACIONES ---
  const clientCsvHeaders = useMemo(() => [
    { key: 'id', label: 'ID Cliente' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'apellido', label: 'Apellido' },
    { key: 'email', label: 'Email' },
    { key: 'telefono', label: 'Teléfono' },
    { key: 'identificacion', label: 'Cédula' }, 
    { key: 'fecha_nacimiento', label: 'Fecha Nacimiento', type: 'date' }, 
  ], []);

  const clientPdfHeaders = useMemo(() => [
    { label: 'Nombre', key: 'nombre' },
    { label: 'Apellido', key: 'apellido' },
    { label: 'Email', key: 'email' },
    { label: 'Cédula', key: 'identificacion' }, 
    { label: 'Teléfono', key: 'telefono' },
  ], []);

  const handleExportCsv = () => {
    setIsExporting(true);
    onExport(clients, 'directorio_clientes', clientCsvHeaders);
    setIsExporting(false);
  };

  const handleExportPdf = () => {
    setIsExporting(true);
    onExportPdf(clients, 'directorio_clientes', clientPdfHeaders, 'Directorio Oficial de Clientes');
    setIsExporting(false);
  };

  const totalPages = Math.ceil((totalItems || 0) / (itemsPerPage || 1));
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mt-6 relative">
      
      {/* 🔍 Cabecera de Lista y Filtros */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-6 gap-4 relative">
        <div className="w-full lg:w-2/3">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2 relative">
            <Users className="h-6 w-6 text-indigo-600 relative" />
            Directorio CRM 360°
            <span className="bg-indigo-100 text-indigo-700 text-xs py-1 px-3 rounded-full ml-2 relative">{totalItems} Registros</span>
          </h3>
          
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3 relative"> 
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 relative" />
              <Input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Buscar por nombre o cédula..."
                autoComplete="off" 
                className="pl-9 bg-gray-50 focus:bg-white border-gray-200 relative"
                onFocus={() => { if (localSearch.length >= 2 && suggestions.length > 0) setShowSuggestions(true); }}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              />
              {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-xl mt-1 max-h-48 overflow-y-auto relative">
                  {suggestions.map((s) => (
                    <li 
                      key={s.id} 
                      className="px-4 py-3 cursor-pointer hover:bg-indigo-50 text-sm border-b border-gray-50 last:border-0 relative" 
                      onMouseDown={() => { 
                        setLocalSearch(s.name); 
                        onSearch(s.name, emailFilter); 
                        setShowSuggestions(false); 
                      }}
                    >
                      {s.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <div className="flex gap-2 relative">
              <Button type="submit" className="bg-gray-800 hover:bg-gray-900 text-white shadow-md relative">
                Filtrar
              </Button>
              <Button type="button" variant="outline" className="text-gray-600 border-gray-300 hover:bg-gray-100 relative" onClick={handleClearFilters}>
                Limpiar
              </Button>
            </div>
          </form>
        </div>

        {/* 📉 Botones de Exportación Premium */}
        <div className="flex gap-2 w-full lg:w-auto relative">
          <Button 
            onClick={handleExportCsv} 
            variant="outline" 
            className="flex-1 lg:flex-none border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800 relative" 
            disabled={isExporting || clients.length === 0}
          >
            {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin relative" /> : <FileDown className="mr-2 h-4 w-4 relative" />}
            CSV
          </Button>
          <Button 
            onClick={handleExportPdf} 
            variant="outline" 
            className="flex-1 lg:flex-none border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 relative" 
            disabled={isExporting || clients.length === 0}
          >
            {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin relative" /> : <FileText className="mr-2 h-4 w-4 relative" />}
            PDF
          </Button>
        </div>
      </div>

      {/* 📊 Tabla Premium o Empty State */}
      {clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50 relative">
          <div className="bg-white p-4 rounded-full shadow-sm border border-gray-100 mb-4 relative">
            <Users className="h-10 w-10 text-gray-400 relative" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 relative">Directorio vacío</h3>
          <p className="text-sm text-gray-500 max-w-sm text-center mt-1 relative">
            Parece que aún no tienes clientes registrados o la búsqueda no arrojó resultados. Comienza creando un nuevo perfil arriba.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm relative">
          <table className="min-w-full divide-y divide-gray-200 relative">
            <thead className="bg-gray-50/80 relative">
              <tr className="relative">
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider relative">Perfil del Cliente</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider relative">Contacto</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-indigo-600 uppercase tracking-wider relative">Cartera (USD)</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider relative">Estatus CRM</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider relative">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100 relative">
              {clients.map((client) => {
                const crmStatus = getCrmStatus(client.dias_proxima_renovacion);
                return (
                  <tr key={client.id} className="hover:bg-slate-50/80 transition-colors group relative">
                    <td className="px-6 py-4 whitespace-nowrap relative">
                      <div className="flex items-center relative">
                        <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${getAvatarColor(client.nombre)} relative`}>
                          {getInitials(client.nombre, client.apellido)}
                        </div>
                        <div className="ml-4 relative">
                          <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors relative">
                            {client.nombre} {client.apellido}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center mt-0.5 relative">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5 relative"></span>
                            Activo
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap space-y-1 relative">
                      <div className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded inline-block border border-slate-200 relative">
                        {client.identificacion || client.cedula || 'N/A'}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 relative">
                        <Phone className="h-3.5 w-3.5 text-slate-400 relative"/> {client.telefono || 'N/A'}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 relative">
                        <Mail className="h-3.5 w-3.5 text-slate-400 relative"/> {client.email || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap relative">
                      <div className="flex flex-col relative">
                        <span className="text-sm font-black text-slate-800 relative">
                          ${(client.valor_cartera || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}
                        </span>
                        <span className="text-xs font-medium text-slate-500 relative">
                          {client.polizas_activas || 0} Póliza(s)
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap relative">
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full border flex items-center w-max ${crmStatus.style} relative`}>
                        {crmStatus.icon} {crmStatus.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-1 relative">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setSelectedClient360(client.id)} 
                        className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 rounded-full relative" 
                        title="Ver Perfil 360"
                      >
                        <Eye className="h-4 w-4 relative" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => onEditClient(client)} 
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full relative" 
                        title="Editar"
                      >
                        <Edit2 className="h-4 w-4 relative" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDeleteClick(client)} 
                        className="text-rose-500 hover:text-rose-700 hover:bg-rose-100 rounded-full relative" 
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4 relative" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* 📄 Paginación */}
      {totalPages > 1 && (
        <nav className="flex justify-center mt-6 relative">
          <ul className="flex items-center space-x-1 bg-gray-50 p-1 rounded-lg border border-gray-200 shadow-sm relative">
            <li>
              <Button 
                variant="ghost" 
                className="h-8 px-3 text-gray-600 hover:bg-white relative" 
                onClick={() => onPageChange(currentPage - 1)} 
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
            </li>
            {pages.map(page => (
              <li key={page}>
                <Button 
                  variant={currentPage === page ? "default" : "ghost"} 
                  className={`h-8 w-8 p-0 relative ${currentPage === page ? "bg-indigo-600 text-white shadow" : "text-gray-600 hover:bg-white"}`} 
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </Button>
              </li>
            ))}
            <li>
              <Button 
                variant="ghost" 
                className="h-8 px-3 text-gray-600 hover:bg-white relative" 
                onClick={() => onPageChange(currentPage + 1)} 
                disabled={currentPage === totalPages}
              >
                Siguiente
              </Button>
            </li>
          </ul>
        </nav>
      )}

      {/* 🔮 Modal 360 */}
      {selectedClient360 && (
        <ClientProfile360 
          clientId={selectedClient360} 
          onClose={() => setSelectedClient360(null)} 
        />
      )}

    </div>
  );
}

// 🛡️ ESCUDO MEMO NIVEL DIOS (Cortesía de la auditoría técnica)
export default React.memo(ClientList, (prev, next) => {
  return (
    prev.clients === next.clients &&
    prev.totalItems === next.totalItems &&
    prev.currentPage === next.currentPage
  );
});