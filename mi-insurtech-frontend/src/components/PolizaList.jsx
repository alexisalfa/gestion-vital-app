// src/components/PolizaList.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { HeadlessSafeSelect } from './HeadlessSafeSelect';
import { PencilIcon, Trash2Icon, Loader2, Shield, Search, FileDown, FileText, Banknote, MessageCircle, Eye, Calendar } from 'lucide-react';
import { useConfirmation } from './ConfirmationContext'; 
import Pagination from './Pagination'; 
import { useToast } from '@/lib/use-toast'; 

import PagoManualModal from './PagoManualModal';
import ClientProfile360 from './ClientProfile360';
import useDebounce from '../hooks/useDebounce'; 

function PolizaList({
  polizas = [], onEditPoliza, onDeletePoliza, searchTerm, tipoFilter, estadoFilter, clienteIdFilter, fechaInicioFilter, fechaFinFilter,
  setSearchTerm, setTipoFilter, setEstadoFilter, setClienteIdFilter, setFechaInicioFilter, setFechaFinFilter,
  onSearch, currentPage, itemsPerPage, totalItems, onPageChange, onExport, onExportPdf,
  clients = [], empresasAseguradoras = [], currencySymbol = '$', dateFormat, getDateFormatOptions,
  apiBaseUrl 
}) {
  const { confirm } = useConfirmation();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const [isPagoModalOpen, setIsPagoModalOpen] = useState(false);
  const [polizaToPay, setPolizaToPay] = useState(null);
  const [selectedClient360, setSelectedClient360] = useState(null);

  // --- 🚀 MOTOR DE BÚSQUEDA EN TIEMPO REAL ---
  const [localSearch, setLocalSearch] = useState(searchTerm || '');
  const debouncedSearch = useDebounce(localSearch, 500);

  useEffect(() => {
    if (debouncedSearch !== searchTerm) {
      setSearchTerm(debouncedSearch); 
      onSearch(debouncedSearch, tipoFilter, estadoFilter, clienteIdFilter, fechaInicioFilter, fechaFinFilter);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    setLocalSearch(searchTerm || '');
  }, [searchTerm]);
  // ------------------------------------------

  const formatDisplayDate = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('es-ES', getDateFormatOptions(dateFormat));
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === 0) return '0.00';
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  };

  const getClienteObj = (poliza) => {
      if (poliza.cliente) return poliza.cliente;
      if (poliza.cliente_id && clients.length > 0) {
        return clients.find(x => x.id === poliza.cliente_id);
      }
      return null;
  }

  const getClienteNombre = (poliza) => {
    const cliente = getClienteObj(poliza);
    if (cliente && cliente.nombre) return `${cliente.nombre} ${cliente.apellido || ''}`.trim();
    return 'N/A';
  };

  const getInitials = (name) => {
    if (!name || name === 'N/A') return 'P';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getEmpresaNombre = (poliza) => {
    if (poliza.empresa_aseguradora?.nombre) return poliza.empresa_aseguradora.nombre;
    const idBuscado = poliza.empresa_aseguradora_id || poliza.empresa_id;
    if (idBuscado && empresasAseguradoras) {
      const arr = Array.isArray(empresasAseguradoras) ? empresasAseguradoras : (empresasAseguradoras.items || []);
      const encontrada = arr.find(e => Number(e.id) === Number(idBuscado));
      if (encontrada) return encontrada.nombre;
    }
    return 'N/A';
  };

  const handleWhatsAppClick = (poliza) => {
    const cliente = getClienteObj(poliza);
    const nombreCliente = cliente ? `${cliente.nombre} ${cliente.apellido || ''}`.trim() : 'Estimado Cliente';
    const telefono = cliente?.telefono ? cliente.telefono.replace(/\D/g, '') : '';

    if (!telefono) {
      toast({ title: "Teléfono no encontrado", description: `El cliente no tiene teléfono registrado.`, variant: "destructive" });
      return;
    }

    const fechaVencimiento = new Date(poliza.fecha_fin).toLocaleDateString('es-ES', getDateFormatOptions(dateFormat));
    const isVencida = poliza.estado === 'Vencida';
    
    let mensaje = isVencida 
      ? `Hola ${nombreCliente}, soy tu asesor de Gestión Vital 🛡️. Me comunico porque tu póliza Nro: *${poliza.numero_poliza}* se encuentra vencida desde el *${fechaVencimiento}*. ¿Deseas que te apoye gestionando la renovación?`
      : `Hola ${nombreCliente}, te saluda tu asesor de Gestión Vital 🛡️. Te escribo en relación a tu póliza Nro: *${poliza.numero_poliza}*. ¿En qué te puedo ayudar hoy?`;

    window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  const clienteOptions = useMemo(() => [{ id: '', nombre: 'Todos los Clientes' }, ...clients.map(c => ({ id: c.id, nombre: `${c.nombre} ${c.apellido || ''}`.trim() }))], [clients]);
  const estadoOptions = [{ id: '', nombre: 'Todos' }, { id: 'Activa', nombre: 'Activa' }, { id: 'Inactiva', nombre: 'Inactiva' }, { id: 'Vencida', nombre: 'Vencida' }, { id: 'Pendiente', nombre: 'Pendiente de Pago' }];

  const handleSearchSubmit = (e) => { 
    e.preventDefault(); 
    onSearch(localSearch, tipoFilter, estadoFilter, clienteIdFilter, fechaInicioFilter, fechaFinFilter); 
  };
  
  const handleClearFilters = () => {
    setLocalSearch(''); 
    setSearchTerm(''); setTipoFilter(''); setEstadoFilter(''); setClienteIdFilter(''); setFechaInicioFilter(''); setFechaFinFilter('');
    onSearch('', '', '', '', '', '');
  };

  const polizaCsvHeaders = useMemo(() => [
    { key: 'numero_poliza', label: 'N° Póliza' }, { key: 'tipo_poliza', label: 'Tipo' }, { key: 'cliente_nombre', label: 'Cliente' },
    { key: 'empresa_nombre', label: 'Aseguradora' }, { key: 'fecha_fin', label: 'Vencimiento', type: 'date' }, 
    { key: 'suma_asegurada', label: 'Suma Aseg.' }, { key: 'deducible', label: 'Deducible' }, { key: 'prima', label: 'Prima' }, { key: 'estado', label: 'Estado' }
  ], []);

  const handleExportCsv = () => { setIsExporting(true); onExport(polizas.map(p => ({ ...p, cliente_nombre: getClienteNombre(p), empresa_nombre: getEmpresaNombre(p) })), 'cartera_polizas', polizaCsvHeaders); setIsExporting(false); };
  const handleExportPdf = () => { setIsExporting(true); onExportPdf(polizas.map(p => ({ ...p, cliente_nombre: getClienteNombre(p), empresa_nombre: getEmpresaNombre(p) })), 'cartera_polizas', polizaCsvHeaders, 'Reporte de Pólizas'); setIsExporting(false); };

  const handleOpenPagoModal = (poliza) => { setPolizaToPay(poliza); setIsPagoModalOpen(true); };

  const handleConfirmPago = async (datosPago) => {
    const token = localStorage.getItem('access_token');
    const payload = { poliza_id: polizaToPay.id, monto: datosPago.monto, metodo_pago: datosPago.metodo_pago, referencia: datosPago.referencia, fecha_pago: datosPago.fecha_pago, notas: datosPago.notas };
    try {
      const response = await fetch(`${apiBaseUrl}/pagos/`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!response.ok) throw new Error("Error en el servidor al registrar el pago.");
      setIsPagoModalOpen(false); setPolizaToPay(null);
      toast({ title: "Pago Registrado", description: `Se procesó el pago de ${currencySymbol} ${datosPago.monto} correctamente.`, variant: "success" });
      setTimeout(() => { onSearch('', '', '', '', '', ''); }, 300);
    } catch (error) { alert(`Hubo un error al procesar el pago: ${error.message}`); }
  };

  const totalPages = Math.ceil((totalItems || 0) / (itemsPerPage || 1));
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  // Constante para estilos de los selectores Headless en los filtros
  const filterSelectStylesClass = "[&_button]:!bg-black/40 [&_button]:!border-white/10 [&_button]:!text-white hover:[&_button]:!border-indigo-400 focus:[&_button]:!ring-indigo-400 [&_div[role='listbox']]:!bg-slate-800 [&_div[role='listbox']]:!border-white/10 [&_li]:!text-slate-200 hover:[&_li]:!bg-indigo-500/20 hover:[&_li]:!text-indigo-300 h-10";

  return (
    <>
      <Card className="mt-6 bg-slate-900/40 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] border border-white/10 relative">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4 border-b border-white/10 pb-4">
            <h3 className="text-xl font-black text-white flex items-center gap-3 drop-shadow-md">
              <div className="bg-indigo-500/20 p-2 rounded-lg border border-indigo-500/30">
                <Shield className="h-5 w-5 text-indigo-400" />
              </div>
              Cartera de Pólizas
              <span className="bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs py-1 px-3 rounded-full ml-2 font-bold">{totalItems} Contratos</span>
            </h3>
            <div className="flex gap-3 w-full lg:w-auto">
              <Button onClick={handleExportCsv} variant="outline" className="flex-1 lg:flex-none border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 hover:text-emerald-300 hover:border-emerald-500/50 transition-all h-10 font-bold" disabled={isExporting || polizas.length === 0}><FileDown className="h-4 w-4 mr-2" /> CSV</Button>
              <Button onClick={handleExportPdf} variant="outline" className="flex-1 lg:flex-none border-rose-500/30 text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/50 transition-all h-10 font-bold" disabled={isExporting || polizas.length === 0}><FileText className="h-4 w-4 mr-2" /> PDF</Button>
            </div>
          </div>

          {/* Filtros Ciberpunk */}
          <form onSubmit={handleSearchSubmit} className="mb-6 bg-black/20 p-5 rounded-xl border border-white/10 backdrop-blur-md space-y-4 z-20 relative">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">N° Póliza / Cliente</Label>
                <Input 
                  value={localSearch} 
                  onChange={e => setLocalSearch(e.target.value)} 
                  placeholder="Buscar..." 
                  autoComplete="off"
                  className="bg-black/40 text-white border-white/10 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 placeholder:text-slate-600 transition-all h-10" 
                />
              </div>
              <div className="space-y-1"><Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tipo</Label><Input value={tipoFilter} onChange={e => setTipoFilter(e.target.value)} placeholder="Ej. Salud" className="bg-black/40 text-white border-white/10 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 placeholder:text-slate-600 transition-all h-10" /></div>
              <div className="space-y-1"><Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Estado</Label><div className={filterSelectStylesClass}><HeadlessSafeSelect id="filtro-estado" value={estadoFilter} onChange={setEstadoFilter} options={estadoOptions} /></div></div>
              <div className="space-y-1"><Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cliente</Label><div className={filterSelectStylesClass}><HeadlessSafeSelect id="filtro-cliente" value={clienteIdFilter} onChange={setClienteIdFilter} options={clienteOptions} /></div></div>
            </div>
            <div className="flex flex-col md:flex-row gap-4 items-end pt-2">
              <div className="space-y-1 flex-1"><Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Vencimiento Desde</Label><Input type="date" value={fechaInicioFilter} onChange={e => setFechaInicioFilter(e.target.value)} className="bg-black/40 text-white border-white/10 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all h-10 [&::-webkit-calendar-picker-indicator]:invert"/></div>
              <div className="space-y-1 flex-1"><Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Vencimiento Hasta</Label><Input type="date" value={fechaFinFilter} onChange={e => setFechaFinFilter(e.target.value)} className="bg-black/40 text-white border-white/10 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all h-10 [&::-webkit-calendar-picker-indicator]:invert"/></div>
              <div className="flex gap-3 w-full md:w-auto">
                <Button type="submit" className="flex-1 md:flex-none bg-indigo-600/80 hover:bg-indigo-500 text-white border border-indigo-500/50 shadow-[0_0_10px_rgba(79,70,229,0.3)] h-10 px-6 font-bold"><Search className="h-4 w-4 mr-2"/> Filtrar</Button>
                <Button type="button" variant="outline" onClick={handleClearFilters} className="text-slate-300 border-white/20 bg-transparent hover:bg-white/10 hover:text-white h-10">Limpiar</Button>
              </div>
            </div>
          </form>

          {polizas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed border-white/10 rounded-2xl bg-black/20">
              <div className="bg-white/5 p-4 rounded-full border border-white/10 mb-4"><Shield className="h-10 w-10 text-slate-500" /></div>
              <h3 className="text-lg font-bold text-white">Cartera vacía</h3>
              <p className="text-sm text-slate-400 text-center mt-2 leading-relaxed">No se encontraron pólizas con los filtros actuales.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-white/10 shadow-inner">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-slate-900/50 backdrop-blur-sm">
                  <tr>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Contrato / Cliente</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo & Aseguradora</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Valores</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Prima & Vencimiento</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                    <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-transparent divide-y divide-white/5">
                  {polizas.map((poliza) => {
                    const nombreCliente = getClienteNombre(poliza);
                    
                    const isActiva = poliza.estado === 'Activa';
                    const isVencida = poliza.estado === 'Vencida';
                    const isPendiente = poliza.estado === 'Pendiente';

                    return (
                      <tr key={poliza.id} className="hover:bg-white/5 transition-colors duration-200 group">
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 font-black text-sm border border-indigo-500/30 shadow-inner">
                              {getInitials(nombreCliente)}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{nombreCliente}</p>
                              <p className="text-xs text-slate-400 font-medium">Pol: <span className="text-indigo-400 font-bold">{poliza.numero_poliza}</span></p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm font-bold text-slate-300">{poliza.tipo_poliza}</p>
                          <p className="text-xs text-slate-500">{getEmpresaNombre(poliza)}</p>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between bg-white/5 px-2.5 py-1 rounded-md border border-white/10 text-[11px] tracking-wide">
                              <span className="text-slate-400 font-bold mr-3">Cobertura:</span>
                              <span className="font-black text-emerald-400">{poliza.suma_asegurada != null ? `${currencySymbol} ${formatCurrency(poliza.suma_asegurada)}` : 'N/A'}</span>
                            </div>
                            <div className="flex items-center justify-between bg-white/5 px-2.5 py-1 rounded-md border border-white/10 text-[11px] tracking-wide">
                              <span className="text-slate-400 font-bold mr-3">Deducible:</span>
                              <span className="font-black text-rose-400">{poliza.deducible != null ? `${currencySymbol} ${formatCurrency(poliza.deducible)}` : 'N/A'}</span>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm font-black text-white drop-shadow-md">{poliza.prima != null ? `${currencySymbol} ${formatCurrency(poliza.prima)}` : 'N/A'}</p>
                          <p className={`text-xs flex items-center gap-1.5 mt-1 font-bold ${isVencida ? 'text-rose-400' : 'text-slate-400'}`}>
                            <Calendar className="h-3.5 w-3.5"/> Vence: {formatDisplayDate(poliza.fecha_fin)}
                          </p>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1.5 inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-wider rounded-full border 
                            ${isActiva ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 
                              isVencida ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 
                              isPendiente ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 
                              'bg-white/10 text-slate-300 border-white/20'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full shadow-[0_0_5px_rgba(255,255,255,0.5)] ${isActiva ? 'bg-emerald-400' : isVencida ? 'bg-rose-400' : isPendiente ? 'bg-amber-400' : 'bg-slate-400'}`}></span>
                            {poliza.estado}
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => setSelectedClient360(poliza.cliente_id)} className="text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-full transition-colors" title="Ver Expediente CRM 360">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleWhatsAppClick(poliza)} className="text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-full transition-colors" title="Contactar por WhatsApp">
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                          {!isActiva && (
                            <Button variant="ghost" size="icon" onClick={() => handleOpenPagoModal(poliza)} className="text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-full transition-colors" title="Registrar Pago">
                              <Banknote className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => onEditPoliza(poliza)} className="text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-full transition-colors" title="Editar Póliza"><PencilIcon className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => confirm({ title: "Borrar", onConfirm: () => onDeletePoliza(poliza.id) })} className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-full transition-colors" title="Eliminar Póliza"><Trash2Icon className="h-4 w-4" /></Button>
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

      <PagoManualModal 
        isOpen={isPagoModalOpen} onClose={() => setIsPagoModalOpen(false)} onConfirm={handleConfirmPago}
        titulo="Registrar Pago del Cliente" montoSugerido={polizaToPay?.prima || 0} currencySymbol={currencySymbol}
      />

      {selectedClient360 && (
        <ClientProfile360 clientId={selectedClient360} onClose={() => setSelectedClient360(null)} />
      )}
    </>
  );
}

// 🛡️ ESCUDO MEMO NIVEL DIOS (Múltiple validación de props)
export default React.memo(PolizaList, (prev, next) => {
  return (
    prev.polizas === next.polizas &&
    prev.totalItems === next.totalItems &&
    prev.currentPage === next.currentPage &&
    prev.clients === next.clients &&
    prev.empresasAseguradoras === next.empresasAseguradoras &&
    prev.estadoFilter === next.estadoFilter &&
    prev.tipoFilter === next.tipoFilter
  );
});