// src/components/ReclamacionList.jsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HeadlessSafeSelect } from './HeadlessSafeSelect';
import { PencilIcon, Trash2Icon, ClipboardList, Search, FileDown, FileText, CheckCircle2, XCircle, Eye, Calendar, AlertTriangle } from 'lucide-react';
import { useConfirmation } from './ConfirmationContext'; 
import { useToast } from '@/lib/use-toast';
import Pagination from './Pagination'; 
import ClientProfile360 from './ClientProfile360';
import useDebounce from '../hooks/useDebounce'; 

function ReclamacionList({
  reclamaciones = [], onEditReclamacion, onDeleteReclamacion, searchTerm, estadoFilter, clienteIdFilter, polizaIdFilter,
  fechaReclamacionInicioFilter, fechaReclamacionFinFilter, setSearchTerm, setEstadoFilter, setClienteIdFilter, setPolizaIdFilter,
  setFechaReclamacionInicioFilter, setFechaReclamacionFinFilter, onSearch, onReclamacionUpdated, currentPage, itemsPerPage, totalItems, onPageChange,
  onExport, onExportPdf, clients = [], polizas = [], currencySymbol = '$', dateFormat, getDateFormatOptions, apiBaseUrl = 'https://gestion-vital-app.onrender.com/api/v1'
}) {
  const { confirm } = useConfirmation();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const [selectedClient360, setSelectedClient360] = useState(null);

  // --- 🚀 MOTOR DE BÚSQUEDA EN TIEMPO REAL ---
  const [localSearch, setLocalSearch] = useState(searchTerm || '');
  const debouncedSearch = useDebounce(localSearch, 500);

  useEffect(() => {
    if (debouncedSearch !== searchTerm) {
      setSearchTerm(debouncedSearch);
      onSearch(debouncedSearch, estadoFilter, clienteIdFilter, polizaIdFilter, fechaReclamacionInicioFilter, fechaReclamacionFinFilter);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    setLocalSearch(searchTerm || '');
  }, [searchTerm]);
  // ------------------------------------------

  const handleQuickStatusUpdate = async (id, nuevoEstado) => {
    let montoAprobado = 0;

    if (nuevoEstado === 'Pagada') {
      const input = window.prompt("Ingrese el monto aprobado por la aseguradora:", "0.00");
      if (input === null) return; 
      montoAprobado = parseFloat(input) || 0;
    } else {
      if (!window.confirm("¿Seguro que desea marcar este siniestro como RECHAZADO?")) return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${apiBaseUrl}/reclamaciones/${id}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ estado_reclamacion: nuevoEstado, monto_aprobado: montoAprobado })
      });

      if (response.ok) {
        toast({ title: "Siniestro Actualizado", description: `Estado cambiado a ${nuevoEstado} exitosamente.`, variant: "success" });
        if (onReclamacionUpdated) onReclamacionUpdated();
      } else {
        throw new Error("Error al actualizar el estado");
      }
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const getClienteNombre = (reclamacion) => {
    if (reclamacion.cliente?.nombre) return `${reclamacion.cliente.nombre} ${reclamacion.cliente.apellido || ''}`.trim();
    const c = clients.find(x => Number(x.id) === Number(reclamacion.cliente_id));
    return c ? `${c.nombre} ${c.apellido || ''}`.trim() : 'N/A';
  };

  const getPolizaNumero = (reclamacion) => {
    if (reclamacion.poliza?.numero_poliza) return reclamacion.poliza.numero_poliza;
    const p = polizas.find(x => Number(x.id) === Number(reclamacion.poliza_id));
    return p ? p.numero_poliza : 'N/A';
  };

  const formatDisplayDate = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('es-ES', getDateFormatOptions(dateFormat));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount || 0);
  };

  const getInitials = (name) => {
    if (!name || name === 'N/A') return 'R';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleExportCsv = () => {
    setIsExporting(true);
    const headers = [
      { key: 'poliza_numero', label: 'N° Póliza' }, { key: 'cliente_nombre', label: 'Cliente' },
      { key: 'fecha_reclamacion', label: 'Fecha', type: 'date' }, { key: 'monto_reclamado', label: 'Monto Reclamado' },
      { key: 'estado_reclamacion', label: 'Estado' }
    ];
    onExport(reclamaciones.map(r => ({ ...r, poliza_numero: getPolizaNumero(r), cliente_nombre: getClienteNombre(r) })), 'reporte_siniestros', headers);
    setIsExporting(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(localSearch, estadoFilter, clienteIdFilter, polizaIdFilter, fechaReclamacionInicioFilter, fechaReclamacionFinFilter);
  };

  const handleClearFilters = () => {
    setLocalSearch('');
    setSearchTerm('');
    setEstadoFilter('');
    setClienteIdFilter('');
    setPolizaIdFilter('');
    setFechaReclamacionInicioFilter('');
    setFechaReclamacionFinFilter('');
    onSearch('', '', '', '', '', '');
  };

  const filterSelectStylesClass = "[&_button]:!bg-black/40 [&_button]:!border-white/10 [&_button]:!text-white hover:[&_button]:!border-red-400 focus:[&_button]:!ring-red-400 [&_div[role='listbox']]:!bg-slate-800 [&_div[role='listbox']]:!border-white/10 [&_li]:!text-slate-200 hover:[&_li]:!bg-red-500/20 hover:[&_li]:!text-red-300 h-10";

  return (
    <>
      <Card className="mt-6 bg-slate-900/40 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] border border-white/10 relative">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4 border-b border-white/10 pb-4">
            <h3 className="text-xl font-black text-white flex items-center gap-3 drop-shadow-md">
              <div className="bg-red-500/20 p-2 rounded-lg border border-red-500/30">
                <ClipboardList className="h-5 w-5 text-red-400" />
              </div>
              Control de Siniestros
              <span className="bg-red-500/20 border border-red-500/30 text-red-300 text-xs py-1 px-3 rounded-full ml-2 font-bold">{totalItems} Registros</span>
            </h3>
            <div className="flex gap-3 w-full lg:w-auto">
              <Button onClick={handleExportCsv} variant="outline" className="flex-1 lg:flex-none border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 hover:text-emerald-300 hover:border-emerald-500/50 transition-all h-10 font-bold" disabled={isExporting || reclamaciones.length === 0}><FileDown className="h-4 w-4 mr-2" /> CSV</Button>
              <Button onClick={() => onExportPdf(reclamaciones, 'siniestros', [], 'Siniestros')} variant="outline" className="flex-1 lg:flex-none border-rose-500/30 text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/50 transition-all h-10 font-bold" disabled={isExporting || reclamaciones.length === 0}><FileText className="h-4 w-4 mr-2" /> PDF</Button>
            </div>
          </div>

          <form onSubmit={handleSearchSubmit} className="mb-6 bg-black/20 p-5 rounded-xl border border-white/10 backdrop-blur-md space-y-4 z-20 relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Descripción</Label>
                <Input 
                  value={localSearch} 
                  onChange={e => setLocalSearch(e.target.value)} 
                  placeholder="Ej: Choque..." 
                  autoComplete="off"
                  className="bg-black/40 text-white border-white/10 focus:border-red-400 focus:ring-1 focus:ring-red-400 placeholder:text-slate-600 transition-all h-10" 
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Estado</Label>
                <div className={filterSelectStylesClass}>
                  <HeadlessSafeSelect value={estadoFilter} onChange={setEstadoFilter} options={[{id: '', nombre: 'Todos'}, {id: 'Pendiente', nombre: 'Pendiente'}, {id: 'En Proceso', nombre: 'En Proceso'}, {id: 'Pagada', nombre: 'Pagada'}, {id: 'Rechazada', nombre: 'Rechazada'}]} />
                </div>
              </div>
              <div className="flex items-end gap-3">
                <Button type="submit" className="flex-1 bg-red-600/80 hover:bg-red-500 text-white border border-red-500/50 shadow-[0_0_10px_rgba(220,38,38,0.3)] h-10 px-6 font-bold"><Search className="h-4 w-4 mr-2"/> Filtrar</Button>
                <Button type="button" variant="outline" onClick={handleClearFilters} className="text-slate-300 border-white/20 bg-transparent hover:bg-white/10 hover:text-white h-10">Limpiar</Button>
              </div>
            </div>
          </form>

          {reclamaciones.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed border-white/10 rounded-2xl bg-black/20">
              <div className="bg-white/5 p-4 rounded-full border border-white/10 mb-4"><ClipboardList className="h-10 w-10 text-slate-500" /></div>
              <h3 className="text-lg font-bold text-white">Sin siniestros registrados</h3>
              <p className="text-sm text-slate-400 text-center mt-2 leading-relaxed">Reporta un nuevo siniestro o ajusta los filtros de búsqueda.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-white/10 shadow-inner">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-slate-900/50 backdrop-blur-sm">
                  <tr>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente & Siniestro</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Póliza & Fecha</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Monto Reclamado</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                    <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-transparent divide-y divide-white/5">
                  {reclamaciones.map((r) => {
                    const nombreCliente = getClienteNombre(r);
                    const numeroPoliza = getPolizaNumero(r);
                    const isPagada = r.estado_reclamacion === 'Pagada';
                    const isPendiente = r.estado_reclamacion === 'Pendiente';
                    const isRechazada = r.estado_reclamacion === 'Rechazada';
                    const isEnProceso = r.estado_reclamacion === 'En Proceso';

                    return (
                      <tr key={r.id} className="hover:bg-white/5 transition-colors duration-200 group">
                        
                        {/* 1. CLIENTE & SINIESTRO (Con Avatar Neón) */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-300 font-black text-sm border border-red-500/30 shadow-inner">
                              {getInitials(nombreCliente)}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{nombreCliente}</p>
                              <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mt-1">
                                <AlertTriangle className="h-3 w-3 text-red-500"/> Siniestro ID: {r.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* 2. PÓLIZA & FECHA */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm font-black text-red-400">Pol: {numeroPoliza}</p>
                          <p className="text-xs flex items-center gap-1.5 mt-1 text-slate-400 font-bold">
                            <Calendar className="h-3.5 w-3.5"/> {formatDisplayDate(r.fecha_reclamacion)}
                          </p>
                        </td>

                        {/* 3. MONTO */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="inline-flex items-center bg-white/5 px-2.5 py-1.5 rounded-md border border-white/10 text-sm">
                            <span className="text-slate-400 font-bold mr-2">Reclamo:</span>
                            <span className="font-black text-rose-400">{currencySymbol} {formatCurrency(r.monto_reclamado)}</span>
                          </div>
                        </td>

                        {/* 4. ESTADO (Con LED Dinámico) */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-3 py-1.5 inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-wider rounded-full border 
                            ${isPagada ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 
                              isPendiente ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 
                              isRechazada ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 
                              isEnProceso ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                              'bg-white/10 text-slate-300 border-white/20'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full shadow-[0_0_5px_rgba(255,255,255,0.5)] ${isPagada ? 'bg-emerald-400' : isPendiente ? 'bg-amber-400' : isRechazada ? 'bg-rose-400' : isEnProceso ? 'bg-blue-400' : 'bg-slate-400'}`}></span>
                            {r.estado_reclamacion}
                          </span>
                        </td>

                        {/* 5. ACCIONES */}
                        <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                          
                          <Button variant="ghost" size="icon" onClick={() => setSelectedClient360(r.cliente_id)} className="text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-full transition-colors" title="Ver Expediente CRM 360">
                            <Eye className="h-4 w-4" />
                          </Button>

                          {(isPendiente || isEnProceso) && (
                            <>
                              <Button variant="ghost" size="icon" onClick={() => handleQuickStatusUpdate(r.id, 'Pagada')} className="text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-full transition-colors" title="Aprobar Pago">
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleQuickStatusUpdate(r.id, 'Rechazada')} className="text-slate-400 hover:text-orange-400 hover:bg-orange-500/10 rounded-full transition-colors" title="Rechazar Siniestro">
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          
                          <Button variant="ghost" size="icon" onClick={() => onEditReclamacion(r)} className="text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-full transition-colors" title="Editar"><PencilIcon className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => confirm({ title: "Borrar Siniestro", onConfirm: () => onDeleteReclamacion(r.id) })} className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-full transition-colors" title="Eliminar"><Trash2Icon className="h-4 w-4" /></Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {Math.ceil(totalItems / itemsPerPage) > 1 && (
            <div className="mt-6 flex justify-center">
               <Pagination currentPage={currentPage} totalPages={Math.ceil(totalItems / itemsPerPage)} onPageChange={onPageChange} />
            </div>
          )}
        </CardContent>
      </Card>

      {selectedClient360 && (
        <ClientProfile360 clientId={selectedClient360} onClose={() => setSelectedClient360(null)} />
      )}
    </>
  );
}

// 🛡️ ESCUDO MEMO NIVEL DIOS
export default React.memo(ReclamacionList, (prev, next) => {
  return (
    prev.reclamaciones === next.reclamaciones &&
    prev.totalItems === next.totalItems &&
    prev.currentPage === next.currentPage &&
    prev.clients === next.clients &&
    prev.polizas === next.polizas &&
    prev.estadoFilter === next.estadoFilter
  );
});