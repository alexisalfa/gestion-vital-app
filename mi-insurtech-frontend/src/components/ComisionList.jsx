// src/components/ComisionList.jsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HeadlessSafeSelect } from './HeadlessSafeSelect';
import { Trash2Icon, PencilIcon, FileDown, FileText, Search, Banknote, Eye, Calendar, UserCheck } from 'lucide-react';
import { useConfirmation } from './ConfirmationContext'; 
import { useToast } from '@/lib/use-toast'; 
import Pagination from './Pagination'; 
import ClientProfile360 from './ClientProfile360';

function ComisionList({
  comisiones = [], 
  asesores = [], 
  polizas = [], 
  onEditComision, 
  onDeleteComision, 
  onSearch, 
  onPagoExitoso,
  currentPage, 
  itemsPerPage, 
  totalItems, 
  onPageChange,
  currencySymbol = '$', 
  dateFormat, 
  getDateFormatOptions, 
  onExport, 
  onExportPdf,
  asesorIdFilter, 
  estadoPagoFilter, 
  fechaInicioFilter, 
  fechaFinFilter, 
  setAsesorIdFilter, 
  setEstadoPagoFilter, 
  setFechaInicioFilter, 
  setFechaFinFilter,
  apiBaseUrl = 'https://gestion-vital-app.onrender.com/api/v1',
}) {
  const { confirm } = useConfirmation();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [selectedClient360, setSelectedClient360] = useState(null);

  const getClienteIdFromComision = (idPoliza) => {
    const poliza = polizas.find(p => String(p.id) === String(idPoliza));
    return poliza ? poliza.cliente_id : null;
  };

  const handlePagoRapidoComision = async (id) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${apiBaseUrl}/comisiones/${id}/pagar`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast({ title: "Pago Registrado", description: "La comisión ha sido liquidada exitosamente.", variant: "success" });
        if (onPagoExitoso) onPagoExitoso();
      } else {
        const errorData = await response.json();
        toast({ title: "Error", description: errorData.detail || "Hubo un problema al procesar el pago.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error de conexión", description: error.message, variant: "destructive" });
    }
  };

  const formatDisplayDate = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('es-ES', getDateFormatOptions(dateFormat));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount || 0);
  };

  // Generador de Iniciales para el Avatar del Asesor
  const getInitials = (name) => {
    if (!name || name === 'N/A') return 'A';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleSearchClick = (e) => {
    if (e) e.preventDefault();
    onSearch(asesorIdFilter, estadoPagoFilter, fechaInicioFilter, fechaFinFilter);
  };

  const handleClearFilters = () => {
    setAsesorIdFilter(''); setEstadoPagoFilter(''); setFechaInicioFilter(''); setFechaFinFilter('');
    onSearch('', '', '', '');
  };

  const comisionHeaders = [
    { key: 'asesor_nombre', label: 'Asesor' }, { key: 'poliza_numero', label: 'Póliza' },
    { key: 'monto_final', label: 'Comisión' }, { key: 'fecha_generacion', label: 'Fecha' }, { key: 'estatus_pago', label: 'Estado' }
  ];

  const getExportData = () => {
    return comisiones.map(c => ({
      ...c,
      asesor_nombre: asesores.find(a => String(a.id) === String(c.id_asesor))?.nombre || 'N/A',
      poliza_numero: polizas.find(p => String(p.id) === String(c.id_poliza))?.numero_poliza || 'N/A'
    }));
  };

  const handleExportCsv = () => { setIsExporting(true); onExport(getExportData(), 'reporte_comisiones', comisionHeaders); setIsExporting(false); };
  const handleExportPdf = () => { setIsExporting(true); onExportPdf(getExportData(), 'reporte_comisiones', comisionHeaders, 'Reporte de Comisiones'); setIsExporting(false); };

  const totalPages = Math.ceil((totalItems || 0) / (itemsPerPage || 1));

  // Estilos Ciberpunk para los selectores de filtros
  const filterSelectStylesClass = "[&_button]:!bg-black/40 [&_button]:!border-white/10 [&_button]:!text-white hover:[&_button]:!border-amber-400 focus:[&_button]:!ring-amber-400 [&_div[role='listbox']]:!bg-slate-800 [&_div[role='listbox']]:!border-white/10 [&_li]:!text-slate-200 hover:[&_li]:!bg-amber-500/20 hover:[&_li]:!text-amber-300 h-10";

  return (
    <>
      <Card className="mt-6 bg-slate-900/40 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] border border-white/10 relative">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4 border-b border-white/10 pb-4">
            <h3 className="text-xl font-black text-white flex items-center gap-3 drop-shadow-md">
              <div className="bg-amber-500/20 p-2 rounded-lg border border-amber-500/30">
                <Banknote className="h-5 w-5 text-amber-400" />
              </div>
              Registro de Liquidaciones
              <span className="bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs py-1 px-3 rounded-full ml-2 font-bold">{totalItems} Pagos</span>
            </h3>
            <div className="flex gap-3 w-full lg:w-auto">
              <Button onClick={handleExportCsv} variant="outline" className="flex-1 lg:flex-none border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 hover:text-emerald-300 hover:border-emerald-500/50 transition-all h-10 font-bold" disabled={isExporting || comisiones.length === 0}><FileDown className="h-4 w-4 mr-2" /> CSV</Button>
              <Button onClick={handleExportPdf} variant="outline" className="flex-1 lg:flex-none border-rose-500/30 text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/50 transition-all h-10 font-bold" disabled={isExporting || comisiones.length === 0}><FileText className="h-4 w-4 mr-2" /> PDF</Button>
            </div>
          </div>

          <form onSubmit={handleSearchClick} className="mb-6 bg-black/20 p-5 rounded-xl border border-white/10 backdrop-blur-md space-y-4 z-20 relative">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Asesor</Label>
                <div className={filterSelectStylesClass}>
                  <HeadlessSafeSelect value={asesorIdFilter} onChange={setAsesorIdFilter} options={[{id: '', nombre: 'Todos'}, ...asesores.map(a => ({id: a.id, nombre: a.nombre}))]} />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Estado</Label>
                <div className={filterSelectStylesClass}>
                  <HeadlessSafeSelect value={estadoPagoFilter} onChange={setEstadoPagoFilter} options={[{id: '', nombre: 'Todos'}, {id: 'pendiente', nombre: 'Pendiente'}, {id: 'pagado', nombre: 'Pagado'}]} />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Desde</Label>
                <Input type="date" value={fechaInicioFilter} onChange={e => setFechaInicioFilter(e.target.value)} className="bg-black/40 text-white border-white/10 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all h-10 [&::-webkit-calendar-picker-indicator]:invert" />
              </div>
              <div className="flex items-end gap-3">
                <Button type="submit" className="flex-1 bg-amber-600/80 hover:bg-amber-500 text-white border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.3)] h-10 px-6 font-bold"><Search className="h-4 w-4 mr-2"/> Filtrar</Button>
                <Button type="button" variant="outline" onClick={handleClearFilters} className="text-slate-300 border-white/20 bg-transparent hover:bg-white/10 hover:text-white h-10">Limpiar</Button>
              </div>
            </div>
          </form>

          {comisiones.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed border-white/10 rounded-2xl bg-black/20">
              <div className="bg-white/5 p-4 rounded-full border border-white/10 mb-4"><Banknote className="h-10 w-10 text-slate-500" /></div>
              <h3 className="text-lg font-bold text-white">No hay liquidaciones</h3>
              <p className="text-sm text-slate-400 text-center mt-2 leading-relaxed">Genera una nueva comisión o ajusta los filtros de búsqueda.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-white/10 shadow-inner">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-slate-900/50 backdrop-blur-sm">
                  <tr>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Asesor & Estado</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Póliza & Fecha</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Liquidación</th>
                    <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-transparent divide-y divide-white/5">
                  {comisiones.map((c) => {
                    const clienteIdAsociado = getClienteIdFromComision(c.id_poliza);
                    const nombreAsesor = asesores.find(a => String(a.id) === String(c.id_asesor))?.nombre || 'N/A';
                    const numeroPoliza = polizas.find(p => String(p.id) === String(c.id_poliza))?.numero_poliza || 'N/A';
                    const isPagado = c.estatus_pago?.toLowerCase() === 'pagado';
                    const isPendiente = c.estatus_pago?.toLowerCase() === 'pendiente';

                    return (
                      <tr key={c.id} className="hover:bg-white/5 transition-colors duration-200 group">
                        
                        {/* 1. ASESOR & ESTADO */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 font-black text-sm border border-indigo-500/30 shadow-inner">
                              {getInitials(nombreAsesor)}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors flex items-center gap-1">
                                {nombreAsesor} <UserCheck className="h-3.5 w-3.5 text-indigo-400"/>
                              </p>
                              <div className="mt-1">
                                <span className={`px-2 py-0.5 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider rounded-full border 
                                  ${isPagado ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 
                                    isPendiente ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-slate-500/20 text-slate-300 border-slate-500/30'}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full shadow-[0_0_5px_rgba(255,255,255,0.5)] ${isPagado ? 'bg-emerald-400' : isPendiente ? 'bg-amber-400' : 'bg-slate-400'}`}></span>
                                  {c.estatus_pago ? c.estatus_pago : 'PENDIENTE'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. PÓLIZA & FECHA */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm font-black text-amber-400">Pol: {numeroPoliza}</p>
                          <p className="text-xs flex items-center gap-1.5 mt-1 text-slate-400 font-bold">
                            <Calendar className="h-3.5 w-3.5"/> Generada: {formatDisplayDate(c.fecha_generacion)}
                          </p>
                        </td>

                        {/* 3. LIQUIDACIÓN */}
                        <td className="px-6 py-4 whitespace-nowrap">
                           <div className="inline-flex items-center bg-white/5 px-2.5 py-1.5 rounded-md border border-white/10 text-sm">
                              <span className="text-slate-400 font-bold mr-2">A Pagar:</span>
                              <span className="font-black text-emerald-400 drop-shadow-md">{currencySymbol} {formatCurrency(c.monto_final)}</span>
                           </div>
                        </td>

                        {/* 4. ACCIONES */}
                        <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                          {clienteIdAsociado && (
                            <Button variant="ghost" size="icon" onClick={() => setSelectedClient360(clienteIdAsociado)} className="text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-full transition-colors" title="Ver Expediente CRM 360 del Cliente">
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          {isPendiente && (
                            <Button variant="ghost" size="icon" onClick={() => confirm({ title: "Confirmar Pago", message: "¿Confirmas que ya transferiste esta comisión al asesor?", onConfirm: () => handlePagoRapidoComision(c.id) })} className="text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-full transition-colors" title="Registrar pago rápido">
                              <Banknote className="h-5 w-5" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => onEditComision(c)} className="text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-full transition-colors" title="Editar"><PencilIcon className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => confirm({ title: "Eliminar", onConfirm: () => onDeleteComision(c.id) })} className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-full transition-colors" title="Borrar"><Trash2Icon className="h-4 w-4" /></Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
               <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
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

// 🛡️ ESCUDO MEMO NIVEL DIOS (Triple validación cruzada)
export default React.memo(ComisionList, (prev, next) => {
  return (
    prev.comisiones === next.comisiones &&
    prev.totalItems === next.totalItems &&
    prev.currentPage === next.currentPage &&
    prev.asesores === next.asesores &&
    prev.polizas === next.polizas &&
    prev.asesorIdFilter === next.asesorIdFilter &&
    prev.estadoPagoFilter === next.estadoPagoFilter &&
    prev.fechaInicioFilter === next.fechaInicioFilter
  );
});