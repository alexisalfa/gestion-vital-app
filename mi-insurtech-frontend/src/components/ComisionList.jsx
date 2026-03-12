// src/components/ComisionList.jsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HeadlessSafeSelect } from './HeadlessSafeSelect';
import { Trash2Icon, PencilIcon, FileDown, FileText, Search, Banknote } from 'lucide-react';
import { useConfirmation } from './ConfirmationContext'; 
import { useToast } from '@/lib/use-toast'; // Importamos toast para los mensajes
import Pagination from './Pagination'; 

function ComisionList({
  comisiones = [], 
  asesores = [], 
  polizas = [], 
  onEditComision, 
  onDeleteComision, 
  onSearch, 
  onPagoExitoso, // <--- NUEVO: Cable para recargar la tabla desde App.jsx
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
  apiBaseUrl = 'http://localhost:8000/api/v1', // URL Base
}) {
  const { confirm } = useConfirmation();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  // --- NUEVA FUNCIÓN: PAGO RÁPIDO ---
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
        toast({ 
          title: "Pago Registrado", 
          description: "La comisión ha sido liquidada exitosamente.", 
          variant: "success" 
        });
        
        // Magia automática: Avisamos a App.jsx que recargue los datos
        if (onPagoExitoso) {
          onPagoExitoso();
        }
      } else {
        const errorData = await response.json();
        toast({ 
          title: "Error", 
          description: errorData.detail || "Hubo un problema al procesar el pago.", 
          variant: "destructive" 
        });
      }
    } catch (error) {
      toast({ title: "Error de conexión", description: error.message, variant: "destructive" });
    }
  };

  // --- FORMATEO DE DATOS ---
  const formatDisplayDate = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('es-ES', getDateFormatOptions(dateFormat));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    }).format(amount || 0);
  };

  // --- MANEJADORES DE FILTROS ---
  const handleSearchClick = (e) => {
    if (e) e.preventDefault();
    onSearch(asesorIdFilter, estadoPagoFilter, fechaInicioFilter, fechaFinFilter);
  };

  const handleClearFilters = () => {
    setAsesorIdFilter('');
    setEstadoPagoFilter('');
    setFechaInicioFilter('');
    setFechaFinFilter('');
    onSearch('', '', '', '');
  };

  // --- EXPORTACIÓN ---
  const handleExportCsv = () => {
    setIsExporting(true);
    const headers = [
      { key: 'asesor_nombre', label: 'Asesor' }, 
      { key: 'poliza_numero', label: 'Póliza' },
      { key: 'monto_final', label: 'Comisión' }, 
      { key: 'fecha_generacion', label: 'Fecha' }, 
      { key: 'estatus_pago', label: 'Estado' }
    ];
    const data = comisiones.map(c => ({
      ...c,
      asesor_nombre: asesores.find(a => String(a.id) === String(c.id_asesor))?.nombre || 'N/A',
      poliza_numero: polizas.find(p => String(p.id) === String(c.id_poliza))?.numero_poliza || 'N/A'
    }));
    onExport(data, 'reporte_comisiones', headers);
    setIsExporting(false);
  };

  const totalPages = Math.ceil((totalItems || 0) / (itemsPerPage || 1));

  return (
    <Card className="mt-6 shadow-lg border-none rounded-xl overflow-hidden">
      <CardContent className="p-6">
        {/* Cabecera con botones de exportación */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4 border-b pb-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Banknote className="h-6 w-6 text-blue-600" /> Registro de Liquidaciones
          </h3>
          <div className="flex gap-2">
            <Button onClick={handleExportCsv} variant="outline" className="border-green-200 text-green-700 hover:bg-green-50">
              <FileDown className="h-4 w-4 mr-2" /> CSV
            </Button>
            <Button onClick={() => onExportPdf(comisiones, 'comisiones', [], 'Comisiones')} variant="outline" className="border-red-200 text-red-700 hover:bg-red-50">
              <FileText className="h-4 w-4 mr-2" /> PDF
            </Button>
          </div>
        </div>

        {/* Panel de Filtros */}
        <form onSubmit={handleSearchClick} className="mb-6 bg-slate-50 p-4 rounded-xl border space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-gray-500 uppercase">Asesor</Label>
              <HeadlessSafeSelect 
                value={asesorIdFilter} 
                onChange={setAsesorIdFilter} 
                options={[{id: '', nombre: 'Todos'}, ...asesores.map(a => ({id: a.id, nombre: a.nombre}))]} 
                className="bg-white" 
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold text-gray-500 uppercase">Estado</Label>
              <HeadlessSafeSelect 
                value={estadoPagoFilter} 
                onChange={setEstadoPagoFilter} 
                options={[{id: '', nombre: 'Todos'}, {id: 'pendiente', nombre: 'Pendiente'}, {id: 'pagado', nombre: 'Pagado'}]} 
                className="bg-white" 
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold text-gray-500 uppercase">Desde</Label>
              <Input type="date" value={fechaInicioFilter} onChange={e => setFechaInicioFilter(e.target.value)} className="bg-white" />
            </div>
            <div className="flex items-end gap-2">
              <Button type="submit" className="flex-1 bg-slate-800 text-white font-bold">
                <Search className="h-4 w-4 mr-2"/> Filtrar
              </Button>
              <Button type="button" variant="outline" onClick={handleClearFilters}>Limpiar</Button>
            </div>
          </div>
        </form>

        {/* Tabla de Resultados */}
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Asesor</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Póliza</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Monto Final</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Fecha</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">Estado Pago</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {comisiones.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800">
                    {asesores.find(a => String(a.id) === String(c.id_asesor))?.nombre || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 font-bold">
                    {polizas.find(p => String(p.id) === String(c.id_poliza))?.numero_poliza || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-slate-900">
                    {currencySymbol} {formatCurrency(c.monto_final)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {formatDisplayDate(c.fecha_generacion)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                      c.estatus_pago === 'pendiente' ? 'bg-amber-100 text-amber-700' : 
                      c.estatus_pago === 'pagado' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {c.estatus_pago ? c.estatus_pago.toUpperCase() : 'PENDIENTE'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right space-x-1">
                    
                    {/* BOTÓN DE PAGO RÁPIDO */}
                    {c.estatus_pago?.toLowerCase() === 'pendiente' && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => confirm({ 
                          title: "Confirmar Pago", 
                          message: "¿Confirmas que ya transferiste esta comisión al asesor?",
                          onConfirm: () => handlePagoRapidoComision(c.id) 
                        })} 
                        className="text-emerald-600 hover:bg-emerald-100 rounded-full"
                        title="Registrar pago rápido"
                      >
                        <Banknote className="h-5 w-5" />
                      </Button>
                    )}

                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onEditComision(c)} 
                      className="text-blue-600 hover:bg-blue-100 rounded-full"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => confirm({ title: "Eliminar Comisión", onConfirm: () => onDeleteComision(c.id) })} 
                      className="text-rose-500 hover:bg-rose-100 rounded-full"
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
             <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ComisionList;