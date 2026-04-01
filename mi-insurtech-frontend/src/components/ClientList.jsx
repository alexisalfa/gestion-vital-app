// src/components/ClientList.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/lib/use-toast';
import { Input } from '@/components/ui/input';
import { useConfirmation } from './ConfirmationContext'; 
import { Loader2, Search, FileDown, FileText, Edit2, Trash2, Users, Mail, Phone, Eye, AlertTriangle, CheckCircle2 } from 'lucide-react'; 
import ClientProfile360 from './ClientProfile360';
import useDebounce from '../hooks/useDebounce'; 
import { useTranslation } from 'react-i18next'; // 🚀 Importamos traductor

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
  const { t } = useTranslation(); // 🚀 Iniciamos gancho de traducción
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isExporting, setIsExporting] = useState(false); 
  const [selectedClient360, setSelectedClient360] = useState(null);

  const [localSearch, setLocalSearch] = useState(searchTerm || '');
  const debouncedSearch = useDebounce(localSearch, 500);

  useEffect(() => {
    if (debouncedSearch !== searchTerm) {
      onSearch(debouncedSearch, emailFilter);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    setLocalSearch(searchTerm || '');
  }, [searchTerm]);

  const getInitials = (nombre, apellido) => {
    return `${nombre?.charAt(0) || ''}${apellido?.charAt(0) || ''}`.toUpperCase();
  };

  const getAvatarColor = (nombre) => {
    const colors = [
      'bg-blue-500/20 text-blue-300 border border-blue-500/30', 
      'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30', 
      'bg-purple-500/20 text-purple-300 border border-purple-500/30', 
      'bg-amber-500/20 text-amber-300 border border-amber-500/30', 
      'bg-rose-500/20 text-rose-300 border border-rose-500/30'
    ];
    const index = nombre ? nombre.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  const getCrmStatus = (dias) => {
    if (dias === null || dias === undefined) return { label: t('clientes.crmNoPolicies'), style: 'bg-white/5 text-slate-400 border-white/10', icon: null };
    if (dias < 0) return { label: t('clientes.crmExpired'), style: 'bg-rose-500/20 text-rose-300 border-rose-500/30', icon: <AlertTriangle className="w-3 h-3 mr-1"/> };
    if (dias <= 30) return { label: t('clientes.crmRenewSoon'), style: 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.3)]', icon: <AlertTriangle className="w-3 h-3 mr-1"/> };
    return { label: t('clientes.crmUpToDate'), style: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: <CheckCircle2 className="w-3 h-3 mr-1"/> };
  };

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
      title: t('clientes.deleteConfirmTitle'),
      message: `${t('clientes.deleteConfirmMsg1')}${client.nombre} ${client.apellido}${t('clientes.deleteConfirmMsg2')}`,
      onConfirm: () => onDeleteClient(client.id),
    });
  };

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
    <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] border border-white/10 mt-6 p-6 relative">
      
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-6 gap-5 relative">
        <div className="w-full lg:w-2/3">
          <h3 className="text-xl font-black text-white mb-4 flex items-center gap-3 drop-shadow-md">
            <div className="bg-indigo-500/20 p-2 rounded-lg border border-indigo-500/30">
              <Users className="h-5 w-5 text-indigo-400" />
            </div>
            {t('clientes.listTitle')}
            <span className="bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs py-1 px-3 rounded-full ml-2 font-bold">{totalItems} {t('clientes.records')}</span>
          </h3>
          
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3 relative z-20"> 
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder={t('clientes.searchPlaceholder')}
                autoComplete="off" 
                className="pl-9 bg-black/20 focus:bg-black/40 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all h-10"
                onFocus={() => { if (localSearch.length >= 2 && suggestions.length > 0) setShowSuggestions(true); }}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              />
              {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute z-30 w-full bg-slate-800 border border-white/10 rounded-xl shadow-2xl mt-2 max-h-48 overflow-y-auto custom-scrollbar backdrop-blur-xl">
                  {suggestions.map((s) => (
                    <li 
                      key={s.id} 
                      className="px-4 py-3 cursor-pointer hover:bg-indigo-500/20 text-sm border-b border-white/5 last:border-0 text-slate-200 hover:text-white transition-colors" 
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
            
            <div className="flex gap-2">
              <Button type="submit" className="bg-indigo-600/80 hover:bg-indigo-500 text-white border border-indigo-500/50 shadow-[0_0_10px_rgba(79,70,229,0.3)] h-10 px-6 font-bold">
                {t('clientes.filter')}
              </Button>
              <Button type="button" variant="outline" className="text-slate-300 border-white/20 bg-transparent hover:bg-white/10 hover:text-white h-10" onClick={handleClearFilters}>
                {t('clientes.clear')}
              </Button>
            </div>
          </form>
        </div>

        <div className="flex gap-3 w-full lg:w-auto relative">
          <Button 
            onClick={handleExportCsv} 
            variant="outline" 
            className="flex-1 lg:flex-none border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 hover:text-emerald-300 hover:border-emerald-500/50 hover:shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all h-10 font-bold" 
            disabled={isExporting || clients.length === 0}
          >
            {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
            CSV
          </Button>
          <Button 
            onClick={handleExportPdf} 
            variant="outline" 
            className="flex-1 lg:flex-none border-rose-500/30 text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/50 hover:shadow-[0_0_10px_rgba(244,63,94,0.3)] transition-all h-10 font-bold" 
            disabled={isExporting || clients.length === 0}
          >
            {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
            PDF
          </Button>
        </div>
      </div>

      {clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed border-white/10 rounded-2xl bg-black/20">
          <div className="bg-white/5 p-4 rounded-full border border-white/10 mb-4">
            <Users className="h-10 w-10 text-slate-500" />
          </div>
          <h3 className="text-lg font-bold text-white">{t('clientes.emptyTitle')}</h3>
          <p className="text-sm text-slate-400 max-w-sm text-center mt-2 leading-relaxed">
            {t('clientes.emptyDesc')}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10 shadow-inner">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-slate-900/50 backdrop-blur-sm">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('clientes.thProfile')}</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('clientes.thContact')}</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-indigo-400 uppercase tracking-widest">{t('clientes.thPortfolio')}</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('clientes.thCrmStatus')}</th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('clientes.thActions')}</th>
              </tr>
            </thead>
            <tbody className="bg-transparent divide-y divide-white/5">
              {clients.map((client) => {
                const crmStatus = getCrmStatus(client.dias_proxima_renovacion);
                return (
                  <tr key={client.id} className="hover:bg-white/5 transition-colors duration-200 group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center font-black text-sm shadow-inner ${getAvatarColor(client.nombre)}`}>
                          {getInitials(client.nombre, client.apellido)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">
                            {client.nombre} {client.apellido}
                          </div>
                          <div className="text-xs text-slate-400 flex items-center mt-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 shadow-[0_0_5px_rgba(16,185,129,0.8)]"></span>
                            {t('clientes.statusActive')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap space-y-1.5">
                      <div className="text-[11px] font-bold text-slate-300 bg-white/5 px-2 py-1 rounded inline-block border border-white/10 tracking-wide">
                        {client.identificacion || client.cedula || 'N/A'}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                        <Phone className="h-3 w-3 text-slate-500"/> {client.telefono || 'N/A'}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                        <Mail className="h-3 w-3 text-slate-500"/> {client.email || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-white drop-shadow-md">
                          ${(client.valor_cartera || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}
                        </span>
                        <span className="text-xs font-medium text-slate-500 mt-0.5">
                          {client.polizas_activas || 0} {t('clientes.policiesWord')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-[11px] leading-5 font-black uppercase tracking-wider rounded-full border flex items-center w-max ${crmStatus.style}`}>
                        {crmStatus.icon} {crmStatus.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setSelectedClient360(client.id)} 
                        className="text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-full transition-colors" 
                        title={t('clientes.btnViewProfile')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => onEditClient(client)} 
                        className="text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-full transition-colors" 
                        title={t('clientes.btnEdit')}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDeleteClick(client)} 
                        className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-full transition-colors" 
                        title={t('clientes.btnDelete')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <nav className="flex justify-center mt-6">
          <ul className="flex items-center space-x-1 bg-black/20 p-1.5 rounded-xl border border-white/10 shadow-sm backdrop-blur-sm">
            <li>
              <Button 
                variant="ghost" 
                className="h-8 px-4 text-slate-400 hover:bg-white/10 hover:text-white font-bold transition-colors disabled:opacity-30 disabled:hover:bg-transparent" 
                onClick={() => onPageChange(currentPage - 1)} 
                disabled={currentPage === 1}
              >
                {t('clientes.btnPrev')}
              </Button>
            </li>
            {pages.map(page => (
              <li key={page}>
                <Button 
                  variant={currentPage === page ? "default" : "ghost"} 
                  className={`h-8 w-8 p-0 font-bold transition-all ${currentPage === page ? "bg-indigo-600 border border-indigo-500/50 text-white shadow-[0_0_10px_rgba(79,70,229,0.5)]" : "text-slate-400 hover:bg-white/10 hover:text-white"}`} 
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </Button>
              </li>
            ))}
            <li>
              <Button 
                variant="ghost" 
                className="h-8 px-4 text-slate-400 hover:bg-white/10 hover:text-white font-bold transition-colors disabled:opacity-30 disabled:hover:bg-transparent" 
                onClick={() => onPageChange(currentPage + 1)} 
                disabled={currentPage === totalPages}
              >
                {t('clientes.btnNext')}
              </Button>
            </li>
          </ul>
        </nav>
      )}

      {selectedClient360 && (
        <ClientProfile360 
          clientId={selectedClient360} 
          onClose={() => setSelectedClient360(null)} 
        />
      )}

    </div>
  );
}

export default React.memo(ClientList, (prev, next) => {
  return (
    prev.clients === next.clients &&
    prev.totalItems === next.totalItems &&
    prev.currentPage === next.currentPage
  );
});