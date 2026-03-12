// src/components/ReclamacionList.jsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HeadlessSafeSelect } from './HeadlessSafeSelect';
import { PencilIcon, Trash2Icon, ClipboardList, Search, FileDown, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { useConfirmation } from './ConfirmationContext'; 
import { useToast } from '@/lib/use-toast';
import Pagination from './Pagination'; 

function ReclamacionList({
  reclamaciones = [], onEditReclamacion, onDeleteReclamacion, searchTerm, estadoFilter, clienteIdFilter, polizaIdFilter,
  fechaReclamacionInicioFilter, fechaReclamacionFinFilter, setSearchTerm, setEstadoFilter, setClienteIdFilter, setPolizaIdFilter,
  setFechaReclamacionInicioFilter, setFechaReclamacionFinFilter, onSearch, onReclamacionUpdated, currentPage, itemsPerPage, totalItems, onPageChange,
  onExport, onExportPdf, clients = [], polizas = [], currencySymbol = '$', dateFormat, getDateFormatOptions, apiBaseUrl = 'https://gestion-vital-app.onrender.com/api/v1'
}) {
  const { confirm } = useConfirmation();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  // --- 🚀 NUEVO: MANEJADOR DE CAMBIO DE ESTADO RÁPIDO ---
  const handleQuickStatusUpdate = async (id, nuevoEstado) => {
    let montoAprobado = 0;

    if (nuevoEstado === 'Pagada') {
      const input = window.prompt("Ingrese el monto aprobado por la aseguradora:", "0.00");
      if (input === null) return; // Cancelado por usuario
      montoAprobado = parseFloat(input) || 0;
    } else {
      if (!window.confirm("¿Seguro que desea marcar este siniestro como RECHAZADO?")) return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${apiBaseUrl}/reclamaciones/${id}/estado`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          estado_reclamacion: nuevoEstado,
          monto_aprobado: montoAprobado
        })
      });

      if (response.ok) {
        toast({ 
          title: "Siniestro Actualizado", 
          description: `Estado cambiado a ${nuevoEstado} exitosamente.`, 
          variant: "success" 
        });
        // Refrescamos la tabla
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

  return (
    <Card className="mt-6 shadow-lg border-none rounded-xl overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4 border-b pb-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-red-600" /> Control de Siniestros
            <span className="bg-red-100 text-red-800 text-xs py-1 px-3 rounded-full">{totalItems} Registros</span>
          </h3>
          <div className="flex gap-2 w-full lg:w-auto">
            <Button onClick={handleExportCsv} variant="outline" className="flex-1 lg:flex-none border-green-200 text-green-700 hover:bg-green-50"><FileDown className="h-4 w-4 mr-2" /> CSV</Button>
            <Button onClick={() => onExportPdf(reclamaciones, 'siniestros', [], 'Siniestros')} variant="outline" className="flex-1 lg:flex-none border-red-200 text-red-700 hover:bg-red-50"><FileText className="h-4 w-4 mr-2" /> PDF</Button>
          </div>
        </div>

        <form onSubmit={(e) => {e.preventDefault(); onSearch(searchTerm, estadoFilter, clienteIdFilter, polizaIdFilter, fechaReclamacionInicioFilter, fechaReclamacionFinFilter)}} className="mb-6 bg-gray-50 p-4 rounded-xl border space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1"><Label className="text-xs font-bold text-gray-500 uppercase">Descripción</Label><Input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Ej: Choque..." className="bg-white" /></div>
            <div className="space-y-1"><Label className="text-xs font-bold text-gray-500 uppercase">Estado</Label><HeadlessSafeSelect value={estadoFilter} onChange={setEstadoFilter} options={[{id: '', nombre: 'Todos'}, {id: 'Pendiente', nombre: 'Pendiente'}, {id: 'Pagada', nombre: 'Pagada'}, {id: 'Rechazada', nombre: 'Rechazada'}]} className="bg-white" /></div>
            <div className="flex items-end gap-2">
              <Button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold"><Search className="h-4 w-4 mr-2"/> Filtrar</Button>
              <Button type="button" variant="outline" onClick={() => onSearch('', '', '', '', '', '')}>Limpiar</Button>
            </div>
          </div>
        </form>

        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">N° Póliza</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Cliente</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Fecha Reporte</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Monto Reclamado</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {reclamaciones.map((r) => (
                <tr key={r.id} className="hover:bg-red-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-indigo-700">{getPolizaNumero(r)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">{getClienteNombre(r)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDisplayDate(r.fecha_reclamacion)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600">
                    {currencySymbol} {Number(r.monto_reclamado).toLocaleString('en-US', {minimumFractionDigits: 2})}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                      r.estado_reclamacion === 'Pendiente' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                      r.estado_reclamacion === 'Pagada' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                      'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {r.estado_reclamacion}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right space-x-1">
                    {/* ACCIONES RÁPIDAS: Solo visibles si está Pendiente */}
                    {r.estado_reclamacion === 'Pendiente' && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleQuickStatusUpdate(r.id, 'Pagada')} 
                          className="text-emerald-600 hover:bg-emerald-100 rounded-full"
                          title="Aprobar Pago"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleQuickStatusUpdate(r.id, 'Rechazada')} 
                          className="text-orange-600 hover:bg-orange-100 rounded-full"
                          title="Rechazar Siniestro"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    
                    <Button variant="ghost" size="icon" onClick={() => onEditReclamacion(r)} className="text-blue-600 hover:bg-blue-100 rounded-full"><PencilIcon className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => confirm({ title: "Borrar Siniestro", onConfirm: () => onDeleteReclamacion(r.id) })} className="text-rose-500 hover:bg-rose-100 rounded-full"><Trash2Icon className="h-4 w-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {Math.ceil(totalItems / itemsPerPage) > 1 && (
          <div className="mt-6 flex justify-center">
             <Pagination currentPage={currentPage} totalPages={Math.ceil(totalItems / itemsPerPage)} onPageChange={onPageChange} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
export default ReclamacionList;