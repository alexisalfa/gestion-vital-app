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
import useDebounce from '../hooks/useDebounce'; // 🔥 INJERTO: Motor de búsqueda rápida

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  return (
    <>
      <Card className="mt-6 shadow-lg border-none rounded-xl overflow-hidden bg-white">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4 border-b border-slate-100 pb-4">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <ClipboardList className="h-6 w-6 text-red-600" /> Control de Siniestros
              <span className="bg-red-50 text-red-700 text-xs py-1 px-3 rounded-full ml-2 border border-red-100 font-bold">{totalItems} Registros</span>
            </h3>
            <div className="flex gap-2 w-full lg:w-auto">
              <Button onClick={handleExportCsv} variant="outline" className="flex-1 lg:flex-none border-green-200 text-green-700 hover:bg-green-50 font-bold" disabled={isExporting || reclamaciones.length === 0}><FileDown className="h-4 w-4 mr-2" /> CSV</Button>
              <Button onClick={() => onExportPdf(reclamaciones, 'siniestros', [], 'Siniestros')} variant="outline" className="flex-1 lg:flex-none border-red-200 text-red-700 hover:bg-red-50 font-bold" disabled={isExporting || reclamaciones.length === 0}><FileText className="h-4 w-4 mr-2" /> PDF</Button>
            </div>
          </div>

          <form onSubmit={handleSearchSubmit} className="mb-6 bg-slate-50 p-5 rounded-xl border border-slate-100 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-500 uppercase">Descripción</Label>
                <Input 
                  value={localSearch} 
                  onChange={e => setLocalSearch(e.target.value)} 
                  placeholder="Ej: Choque..." 
                  autoComplete="off"
                  className="bg-white" 
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-500 uppercase">Estado</Label>
                <HeadlessSafeSelect value={estadoFilter} onChange={setEstadoFilter} options={[{id: '', nombre: 'Todos'}, {id: 'Pendiente', nombre: 'Pendiente'}, {id: 'Pagada', nombre: 'Pagada'}, {id: 'Rechazada', nombre: 'Rechazada'}]} className="bg-white" />
              </div>
              <div className="flex items-end gap-2">
                <Button type="submit" className="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-bold"><Search className="h-4 w-4 mr-2"/> Filtrar</Button>
                <Button type="button" variant="outline" onClick={handleClearFilters}>Limpiar</Button>
              </div>
            </div>
          </form>

          {reclamaciones.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
              <div className="bg-white p-4 rounded-full shadow-sm border border-slate-100 mb-4"><ClipboardList className="h-10 w-10 text-slate-300" /></div>
              <h3 className="text-lg font-bold text-slate-700">Sin siniestros registrados</h3>
              <p className="text-sm text-slate-500 text-center mt-1">Reporta un nuevo siniestro o ajusta los filtros de búsqueda.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Cliente & Siniestro</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Póliza & Fecha</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Monto Reclamado</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {reclamaciones.map((r) => {
                    const nombreCliente = getClienteNombre(r);
                    const numeroPoliza = getPolizaNumero(r);
                    const isPagada = r.estado_reclamacion === 'Pagada';
                    const isPendiente = r.estado_reclamacion === 'Pendiente';

                    return (
                      <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                        
                        {/* 1. CLIENTE & SINIESTRO (Con Avatar) */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-bold border border-red-200">
                              {getInitials(nombreCliente)}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800">{nombreCliente}</p>
                              <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                                <AlertTriangle className="h-3 w-3 text-red-500"/> Siniestro ID: {r.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* 2. PÓLIZA & FECHA */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm font-black text-indigo-600">Pol: {numeroPoliza}</p>
                          <p className="text-xs flex items-center gap-1 mt-1 text-slate-500 font-medium">
                            <Calendar className="h-3.5 w-3.5"/> {formatDisplayDate(r.fecha_reclamacion)}
                          </p>
                        </td>

                        {/* 3. MONTO (Cajita Gris) */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="inline-flex items-center bg-slate-50 px-3 py-1.5 rounded-md border border-slate-100 text-sm">
                            <span className="text-slate-500 font-bold mr-2">Reclamo:</span>
                            <span className="font-black text-red-600">{currencySymbol} {formatCurrency(r.monto_reclamado)}</span>
                          </div>
                        </td>

                        {/* 4. ESTADO (Con LED) */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-3 py-1.5 inline-flex items-center gap-2 text-xs font-bold rounded-full border 
                            ${isPagada ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                              isPendiente ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                              'bg-rose-50 text-rose-700 border-rose-200'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isPagada ? 'bg-emerald-500' : isPendiente ? 'bg-amber-500' : 'bg-rose-500'}`}></span>
                            {r.estado_reclamacion}
                          </span>
                        </td>

                        {/* 5. ACCIONES */}
                        <td className="px-6 py-4 whitespace-nowrap text-right space-x-1">
                          
                          <Button variant="ghost" size="icon" onClick={() => setSelectedClient360(r.cliente_id)} className="text-purple-600 hover:bg-purple-100 rounded-full" title="Ver Expediente CRM 360">
                            <Eye className="h-4 w-4" />
                          </Button>

                          {isPendiente && (
                            <>
                              <Button variant="ghost" size="icon" onClick={() => handleQuickStatusUpdate(r.id, 'Pagada')} className="text-emerald-600 hover:bg-emerald-100 rounded-full" title="Aprobar Pago">
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleQuickStatusUpdate(r.id, 'Rechazada')} className="text-orange-600 hover:bg-orange-100 rounded-full" title="Rechazar Siniestro">
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          
                          <Button variant="ghost" size="icon" onClick={() => onEditReclamacion(r)} className="text-blue-600 hover:bg-blue-100 rounded-full"><PencilIcon className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => confirm({ title: "Borrar Siniestro", onConfirm: () => onDeleteReclamacion(r.id) })} className="text-rose-500 hover:bg-rose-100 rounded-full"><Trash2Icon className="h-4 w-4" /></Button>
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