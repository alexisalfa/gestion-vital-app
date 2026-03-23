// src/components/PolizaList.jsx
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { HeadlessSafeSelect } from './HeadlessSafeSelect';
// INJERTO: Añadimos Calendar a los íconos
import { PencilIcon, Trash2Icon, Loader2, Shield, Search, FileDown, FileText, Banknote, MessageCircle, Eye, Calendar } from 'lucide-react';
import { useConfirmation } from './ConfirmationContext'; 
import Pagination from './Pagination'; 
import { useToast } from '@/lib/use-toast'; 

import PagoManualModal from './PagoManualModal';
import ClientProfile360 from './ClientProfile360';

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

  // Generador de Iniciales para el Avatar
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

  const handleSearchSubmit = (e) => { e.preventDefault(); onSearch(searchTerm, tipoFilter, estadoFilter, clienteIdFilter, fechaInicioFilter, fechaFinFilter); };
  
  const handleClearFilters = () => {
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

  return (
    <>
      <Card className="mt-6 shadow-lg border-none rounded-xl overflow-hidden bg-white">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4 border-b border-slate-100 pb-4">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Shield className="h-6 w-6 text-indigo-600" /> Cartera de Pólizas
              <span className="bg-indigo-50 text-indigo-700 text-xs py-1 px-3 rounded-full ml-2 border border-indigo-100 font-bold">{totalItems} Contratos</span>
            </h3>
            <div className="flex gap-2 w-full lg:w-auto">
              <Button onClick={handleExportCsv} variant="outline" className="flex-1 lg:flex-none border-green-200 text-green-700 hover:bg-green-50 font-bold" disabled={isExporting || polizas.length === 0}><FileDown className="h-4 w-4 mr-2" /> CSV</Button>
              <Button onClick={handleExportPdf} variant="outline" className="flex-1 lg:flex-none border-red-200 text-red-700 hover:bg-red-50 font-bold" disabled={isExporting || polizas.length === 0}><FileText className="h-4 w-4 mr-2" /> PDF</Button>
            </div>
          </div>

          {/* Filtros */}
          <form onSubmit={handleSearchSubmit} className="mb-6 bg-slate-50 p-5 rounded-xl border border-slate-100 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1"><Label className="text-xs font-bold text-slate-500 uppercase">N° Póliza</Label><Input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar..." className="bg-white" /></div>
              <div className="space-y-1"><Label className="text-xs font-bold text-slate-500 uppercase">Tipo</Label><Input value={tipoFilter} onChange={e => setTipoFilter(e.target.value)} placeholder="Ej. Salud" className="bg-white" /></div>
              <div className="space-y-1"><Label className="text-xs font-bold text-slate-500 uppercase">Estado</Label><HeadlessSafeSelect id="filtro-estado" value={estadoFilter} onChange={setEstadoFilter} options={estadoOptions} className="bg-white"/></div>
              <div className="space-y-1"><Label className="text-xs font-bold text-slate-500 uppercase">Cliente</Label><HeadlessSafeSelect id="filtro-cliente" value={clienteIdFilter} onChange={setClienteIdFilter} options={clienteOptions} className="bg-white"/></div>
            </div>
            <div className="flex flex-col md:flex-row gap-4 items-end pt-2">
              <div className="space-y-1 flex-1"><Label className="text-xs font-bold text-slate-500 uppercase">Vencimiento Desde</Label><Input type="date" value={fechaInicioFilter} onChange={e => setFechaInicioFilter(e.target.value)} className="bg-white"/></div>
              <div className="space-y-1 flex-1"><Label className="text-xs font-bold text-slate-500 uppercase">Vencimiento Hasta</Label><Input type="date" value={fechaFinFilter} onChange={e => setFechaFinFilter(e.target.value)} className="bg-white"/></div>
              <div className="flex gap-2 w-full md:w-auto">
                <Button type="submit" className="flex-1 md:flex-none bg-slate-800 hover:bg-slate-900 text-white font-bold"><Search className="h-4 w-4 mr-2"/> Filtrar</Button>
                <Button type="button" variant="outline" onClick={handleClearFilters}>Limpiar</Button>
              </div>
            </div>
          </form>

          {polizas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
              <div className="bg-white p-4 rounded-full shadow-sm border border-slate-100 mb-4"><Shield className="h-10 w-10 text-slate-300" /></div>
              <h3 className="text-lg font-bold text-slate-700">Cartera vacía</h3>
              <p className="text-sm text-slate-500 text-center mt-1">No se encontraron pólizas con los filtros actuales.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Contrato / Cliente</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo & Aseguradora</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Valores</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Prima & Vencimiento</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {polizas.map((poliza) => {
                    const nombreCliente = getClienteNombre(poliza);
                    
                    // Colores de los "LEDs" de estatus
                    const isActiva = poliza.estado === 'Activa';
                    const isVencida = poliza.estado === 'Vencida';
                    const isPendiente = poliza.estado === 'Pendiente';

                    return (
                      <tr key={poliza.id} className="hover:bg-slate-50/80 transition-colors">
                        
                        {/* 1. CONTRATO / CLIENTE (Con Avatar) */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                              {getInitials(nombreCliente)}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800">{nombreCliente}</p>
                              <p className="text-xs text-slate-500 font-medium">Pol: <span className="text-indigo-600 font-bold">{poliza.numero_poliza}</span></p>
                            </div>
                          </div>
                        </td>

                        {/* 2. TIPO & ASEGURADORA */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm font-bold text-slate-700">{poliza.tipo_poliza}</p>
                          <p className="text-xs text-slate-500">{getEmpresaNombre(poliza)}</p>
                        </td>
                        
                        {/* 3. VALORES EN CAJITAS GRISES */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100 text-xs">
                              <span className="text-slate-500 font-semibold mr-3">Cobertura:</span>
                              <span className="font-black text-emerald-600">{poliza.suma_asegurada != null ? `${currencySymbol} ${formatCurrency(poliza.suma_asegurada)}` : 'N/A'}</span>
                            </div>
                            <div className="flex items-center justify-between bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100 text-xs">
                              <span className="text-slate-500 font-semibold mr-3">Deducible:</span>
                              <span className="font-black text-rose-500">{poliza.deducible != null ? `${currencySymbol} ${formatCurrency(poliza.deducible)}` : 'N/A'}</span>
                            </div>
                          </div>
                        </td>

                        {/* 4. PRIMA & VENCIMIENTO */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm font-black text-slate-900">{poliza.prima != null ? `${currencySymbol} ${formatCurrency(poliza.prima)}` : 'N/A'}</p>
                          <p className={`text-xs flex items-center gap-1 mt-1 font-medium ${isVencida ? 'text-rose-600' : 'text-slate-500'}`}>
                            <Calendar className="h-3.5 w-3.5"/> Vence: {formatDisplayDate(poliza.fecha_fin)}
                          </p>
                        </td>

                        {/* 5. ESTADO (Con puntito LED) */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1.5 inline-flex items-center gap-2 text-xs font-bold rounded-full border 
                            ${isActiva ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                              isVencida ? 'bg-rose-50 text-rose-700 border-rose-200' : 
                              isPendiente ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                              'bg-slate-50 text-slate-700 border-slate-200'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isActiva ? 'bg-emerald-500' : isVencida ? 'bg-rose-500' : isPendiente ? 'bg-amber-500' : 'bg-slate-500'}`}></span>
                            {poliza.estado}
                          </span>
                        </td>

                        {/* 6. ACCIONES */}
                        <td className="px-6 py-4 whitespace-nowrap text-right space-x-1">
                          <Button variant="ghost" size="icon" onClick={() => setSelectedClient360(poliza.cliente_id)} className="text-purple-600 hover:bg-purple-100 rounded-full" title="Ver Expediente CRM 360">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleWhatsAppClick(poliza)} className="text-emerald-500 hover:bg-emerald-100 rounded-full" title="Contactar por WhatsApp">
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                          {!isActiva && (
                            <Button variant="ghost" size="icon" onClick={() => handleOpenPagoModal(poliza)} className="text-indigo-600 hover:bg-indigo-100 rounded-full" title="Registrar Pago">
                              <Banknote className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => onEditPoliza(poliza)} className="text-blue-600 hover:bg-blue-100 rounded-full" title="Editar Póliza"><PencilIcon className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => confirm({ title: "Borrar", onConfirm: () => onDeletePoliza(poliza.id) })} className="text-rose-500 hover:bg-rose-100 rounded-full" title="Eliminar Póliza"><Trash2Icon className="h-4 w-4" /></Button>
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

export default PolizaList;