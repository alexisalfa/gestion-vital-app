// src/components/PolizaList.jsx
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { HeadlessSafeSelect } from './HeadlessSafeSelect';
import { PencilIcon, Trash2Icon, Loader2, Shield, Search, FileDown, FileText, Banknote, MessageCircle } from 'lucide-react';
import { useConfirmation } from './ConfirmationContext'; 
import Pagination from './Pagination'; 
import { useToast } from '@/lib/use-toast'; // Importamos el toast para mensajes de error

// IMPORTAMOS NUESTRA VENTANA FLOTANTE DE PAGOS
import PagoManualModal from './PagoManualModal';

function PolizaList({
  polizas = [], onEditPoliza, onDeletePoliza, searchTerm, tipoFilter, estadoFilter, clienteIdFilter, fechaInicioFilter, fechaFinFilter,
  setSearchTerm, setTipoFilter, setEstadoFilter, setClienteIdFilter, setFechaInicioFilter, setFechaFinFilter,
  onSearch, currentPage, itemsPerPage, totalItems, onPageChange, onExport, onExportPdf,
  clients = [], empresasAseguradoras = [], currencySymbol = '$', dateFormat, getDateFormatOptions,
  apiBaseUrl // IMPORTANTE: Agregamos apiBaseUrl para poder hacer la petición al backend
}) {
  const { confirm } = useConfirmation();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  // --- ESTADOS PARA EL MODAL DE PAGOS ---
  const [isPagoModalOpen, setIsPagoModalOpen] = useState(false);
  const [polizaToPay, setPolizaToPay] = useState(null);

  const formatDisplayDate = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('es-ES', getDateFormatOptions(dateFormat));
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  };

  const getClienteObj = (poliza) => {
      // Función auxiliar para obtener el objeto cliente completo
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

  // --- 📱 NUEVO: ENVIAR WHATSAPP DESDE LA TABLA ---
  const handleWhatsAppClick = (poliza) => {
    const cliente = getClienteObj(poliza);
    const nombreCliente = cliente ? `${cliente.nombre} ${cliente.apellido || ''}`.trim() : 'Estimado Cliente';
    
    // Limpiamos el teléfono (solo números)
    const telefono = cliente?.telefono ? cliente.telefono.replace(/\D/g, '') : '';

    if (!telefono) {
      toast({ 
          title: "Teléfono no encontrado", 
          description: `El cliente ${nombreCliente} no tiene un número de teléfono registrado en su perfil.`, 
          variant: "destructive" 
      });
      return;
    }

    const fechaVencimiento = new Date(poliza.fecha_fin).toLocaleDateString('es-ES', getDateFormatOptions(dateFormat));
    const isVencida = poliza.estado === 'Vencida';
    
    // El mensaje cambia ligeramente si ya está vencida o si es solo un contacto general
    let mensaje = "";
    if(isVencida){
        mensaje = `Hola ${nombreCliente}, soy tu asesor de Gestión Vital 🛡️. Me comunico porque tu póliza Nro: *${poliza.numero_poliza}* se encuentra vencida desde el *${fechaVencimiento}*. ¿Deseas que te apoye gestionando la renovación para recuperar tu cobertura?`;
    } else {
        mensaje = `Hola ${nombreCliente}, te saluda tu asesor de Gestión Vital 🛡️. Te escribo en relación a tu póliza Nro: *${poliza.numero_poliza}*. ¿En qué te puedo ayudar hoy?`;
    }

    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  const clienteOptions = useMemo(() => [
    { id: '', nombre: 'Todos los Clientes' },
    ...clients.map(c => ({ id: c.id, nombre: `${c.nombre} ${c.apellido || ''}`.trim() }))
  ], [clients]);

  const estadoOptions = [{ id: '', nombre: 'Todos' }, { id: 'Activa', nombre: 'Activa' }, { id: 'Inactiva', nombre: 'Inactiva' }, { id: 'Vencida', nombre: 'Vencida' }, { id: 'Pendiente', nombre: 'Pendiente' }];

  const handleSearchSubmit = (e) => { e.preventDefault(); onSearch(searchTerm, tipoFilter, estadoFilter, clienteIdFilter, fechaInicioFilter, fechaFinFilter); };
  
  const handleClearFilters = () => {
    setSearchTerm(''); setTipoFilter(''); setEstadoFilter(''); setClienteIdFilter(''); setFechaInicioFilter(''); setFechaFinFilter('');
    onSearch('', '', '', '', '', '');
  };

  const polizaCsvHeaders = useMemo(() => [
    { key: 'numero_poliza', label: 'N° Póliza' }, { key: 'tipo_poliza', label: 'Tipo' }, { key: 'cliente_nombre', label: 'Cliente' },
    { key: 'empresa_nombre', label: 'Aseguradora' }, { key: 'fecha_fin', label: 'Vencimiento', type: 'date' }, { key: 'prima', label: 'Prima' }, { key: 'estado', label: 'Estado' }
  ], []);

  const handleExportCsv = () => {
    setIsExporting(true);
    onExport(polizas.map(p => ({ ...p, cliente_nombre: getClienteNombre(p), empresa_nombre: getEmpresaNombre(p) })), 'cartera_polizas', polizaCsvHeaders);
    setIsExporting(false);
  };

  const handleExportPdf = () => {
    setIsExporting(true);
    onExportPdf(polizas.map(p => ({ ...p, cliente_nombre: getClienteNombre(p), empresa_nombre: getEmpresaNombre(p) })), 'cartera_polizas', polizaCsvHeaders, 'Reporte de Pólizas');
    setIsExporting(false);
  };

  // --- LÓGICA DE APERTURA ---
  const handleOpenPagoModal = (poliza) => {
    setPolizaToPay(poliza);
    setIsPagoModalOpen(true);
  };

  // --- 🚀 CONEXIÓN REAL AL BACKEND PARA PAGOS ---
  const handleConfirmPago = async (datosPago) => {
    const token = localStorage.getItem('access_token');
    
    // Armamos el paquete exactamente como lo esperaría una API
    const payload = {
      poliza_id: polizaToPay.id,
      monto: datosPago.monto,
      metodo_pago: datosPago.metodo_pago,
      referencia: datosPago.referencia,
      fecha_pago: datosPago.fecha_pago,
      notas: datosPago.notas
    };

    try {
      // Hacemos la petición POST al servidor (Asegúrate de tener esta ruta en FastAPI)
      const response = await fetch(`${apiBaseUrl}/pagos/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Error en el servidor al registrar el pago.");
      }

      // Si todo sale bien:
      setIsPagoModalOpen(false);
      setPolizaToPay(null);
      alert(`¡Pago de ${currencySymbol} ${datosPago.monto} registrado exitosamente!`);
      
      // Recargamos la tabla para que la póliza aparezca ahora como "Activa"
      onSearch(searchTerm, tipoFilter, estadoFilter, clienteIdFilter, fechaInicioFilter, fechaFinFilter);

    } catch (error) {
      console.error("Error registrando pago:", error);
      alert(`Hubo un error al procesar el pago: ${error.message}`);
    }
  };

  const totalPages = Math.ceil((totalItems || 0) / (itemsPerPage || 1));
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <>
      <Card className="mt-6 shadow-lg border-none rounded-xl overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4 border-b border-gray-100 pb-4">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Shield className="h-6 w-6 text-indigo-600" /> Cartera de Pólizas
              <span className="bg-indigo-100 text-indigo-800 text-xs py-1 px-3 rounded-full ml-2">{totalItems} Contratos</span>
            </h3>
            <div className="flex gap-2 w-full lg:w-auto">
              <Button onClick={handleExportCsv} variant="outline" className="flex-1 lg:flex-none border-green-200 text-green-700 hover:bg-green-50" disabled={isExporting || polizas.length === 0}><FileDown className="h-4 w-4 mr-2" /> CSV</Button>
              <Button onClick={handleExportPdf} variant="outline" className="flex-1 lg:flex-none border-red-200 text-red-700 hover:bg-red-50" disabled={isExporting || polizas.length === 0}><FileText className="h-4 w-4 mr-2" /> PDF</Button>
            </div>
          </div>

          {/* Panel de Filtros */}
          <form onSubmit={handleSearchSubmit} className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1"><Label className="text-xs font-bold text-gray-500 uppercase">N° Póliza</Label><Input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar..." className="bg-white" /></div>
              <div className="space-y-1"><Label className="text-xs font-bold text-gray-500 uppercase">Tipo</Label><Input value={tipoFilter} onChange={e => setTipoFilter(e.target.value)} placeholder="Ej. Salud" className="bg-white" /></div>
              <div className="space-y-1"><Label className="text-xs font-bold text-gray-500 uppercase">Estado</Label><HeadlessSafeSelect id="filtro-estado" value={estadoFilter} onChange={setEstadoFilter} options={estadoOptions} className="bg-white"/></div>
              <div className="space-y-1"><Label className="text-xs font-bold text-gray-500 uppercase">Cliente</Label><HeadlessSafeSelect id="filtro-cliente" value={clienteIdFilter} onChange={setClienteIdFilter} options={clienteOptions} className="bg-white"/></div>
            </div>
            <div className="flex flex-col md:flex-row gap-4 items-end pt-2">
              <div className="space-y-1 flex-1"><Label className="text-xs font-bold text-gray-500 uppercase">Vencimiento Desde</Label><Input type="date" value={fechaInicioFilter} onChange={e => setFechaInicioFilter(e.target.value)} className="bg-white"/></div>
              <div className="space-y-1 flex-1"><Label className="text-xs font-bold text-gray-500 uppercase">Vencimiento Hasta</Label><Input type="date" value={fechaFinFilter} onChange={e => setFechaFinFilter(e.target.value)} className="bg-white"/></div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white"><Search className="h-4 w-4 mr-2"/> Filtrar</Button>
                <Button type="button" variant="outline" onClick={handleClearFilters}>Limpiar</Button>
              </div>
            </div>
          </form>

          {polizas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
              <div className="bg-white p-4 rounded-full shadow-sm border border-gray-100 mb-4"><Shield className="h-10 w-10 text-gray-400" /></div>
              <h3 className="text-lg font-bold text-gray-800">Cartera vacía</h3>
              <p className="text-sm text-gray-500 text-center mt-1">No se encontraron pólizas. Emite un nuevo contrato o ajusta los filtros de búsqueda.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50/80">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">N° Póliza</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Cliente</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Aseguradora</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Vencimiento</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Prima</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {polizas.map((poliza) => (
                    <tr key={poliza.id} className="hover:bg-indigo-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-indigo-900">{poliza.numero_poliza}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{poliza.tipo_poliza}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">{getClienteNombre(poliza)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{getEmpresaNombre(poliza)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDisplayDate(poliza.fecha_fin)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-600">
                        {poliza.prima != null ? `${currencySymbol} ${formatCurrency(poliza.prima)}` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${poliza.estado === 'Activa' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : poliza.estado === 'Vencida' ? 'bg-rose-50 text-rose-700 border-rose-200' : poliza.estado === 'Pendiente' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-gray-100 text-gray-700 border-gray-300'}`}>
                          {poliza.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right space-x-1">
                        
                        {/* 📱 NUEVO BOTÓN DE WHATSAPP (Aparece para todas las pólizas) */}
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleWhatsAppClick(poliza)} 
                          className="text-emerald-500 hover:bg-emerald-100 rounded-full"
                          title="Contactar por WhatsApp"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>

                        {/* NUEVO BOTÓN DE PAGAR (Solo se muestra si la póliza NO está activa) */}
                        {poliza.estado !== 'Activa' && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleOpenPagoModal(poliza)} 
                            className="text-indigo-600 hover:bg-indigo-100 rounded-full"
                            title="Registrar Pago"
                          >
                            <Banknote className="h-4 w-4" />
                          </Button>
                        )}

                        <Button variant="ghost" size="icon" onClick={() => onEditPoliza(poliza)} className="text-blue-600 hover:bg-blue-100 rounded-full" title="Editar Póliza"><PencilIcon className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => confirm({ title: "Borrar", onConfirm: () => onDeletePoliza(poliza.id) })} className="text-rose-500 hover:bg-rose-100 rounded-full" title="Eliminar Póliza"><Trash2Icon className="h-4 w-4" /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <nav className="flex justify-center mt-6">
              <ul className="flex items-center space-x-1 bg-gray-50 p-1 rounded-lg border border-gray-200 shadow-sm">
                <li><Button variant="ghost" className="h-8 px-3 text-gray-600" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>Anterior</Button></li>
                {pages.map(page => (
                  <li key={page}><Button variant={currentPage === page ? "default" : "ghost"} className={`h-8 w-8 p-0 ${currentPage === page ? "bg-indigo-600 text-white shadow" : ""}`} onClick={() => onPageChange(page)}>{page}</Button></li>
                ))}
                <li><Button variant="ghost" className="h-8 px-3 text-gray-600" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>Siguiente</Button></li>
              </ul>
            </nav>
          )}
        </CardContent>
      </Card>

      {/* RENDERIZAMOS LA VENTANA EMERGENTE AL FINAL */}
      <PagoManualModal 
        isOpen={isPagoModalOpen}
        onClose={() => setIsPagoModalOpen(false)}
        onConfirm={handleConfirmPago}
        titulo="Registrar Pago del Cliente"
        montoSugerido={polizaToPay?.prima || 0}
        currencySymbol={currencySymbol}
      />
    </>
  );
}

export default PolizaList;