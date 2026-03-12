// src/components/AsesorList.jsx
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { PencilIcon, Trash2Icon, Loader2, Search, FileDown, FileText, Mail, Phone, UserCheck } from 'lucide-react';
import { useConfirmation } from './ConfirmationContext'; 
import Pagination from './Pagination'; 

function AsesorList({
  asesores = [], onEditAsesor, onDeleteAsesor, currentPage, itemsPerPage, totalItems, onPageChange, searchTerm, setSearchTerm, onSearch, onExport, onExportPdf, empresasAseguradoras = []
}) {
  const { confirm } = useConfirmation();
  const [isExporting, setIsExporting] = useState(false);

  // Mapeo de nombre de empresa para visualización
  const getEmpresaNombre = (asesor) => {
    if (asesor.empresa_aseguradora?.nombre) return asesor.empresa_aseguradora.nombre;
    if (asesor.empresa_aseguradora_id && empresasAseguradoras.length > 0) {
      const encontrada = empresasAseguradoras.find(e => Number(e.id) === Number(asesor.empresa_aseguradora_id));
      if (encontrada) return encontrada.nombre;
    }
    return 'Independiente';
  };

  const getInitials = (nombre, apellido) => `${nombre?.charAt(0) || ''}${apellido?.charAt(0) || ''}`.toUpperCase();

  const asesorCsvHeaders = useMemo(() => [
    { key: 'id', label: 'ID' }, { key: 'nombre', label: 'Nombre' }, { key: 'apellido', label: 'Apellido' },
    { key: 'cedula', label: 'Cédula' }, { key: 'telefono', label: 'Teléfono' }, { key: 'email', label: 'Email' }, { key: 'empresa_nombre', label: 'Aseguradora' },
  ], []);

  const handleExportCsv = () => {
    setIsExporting(true);
    onExport(asesores.map(a => ({ ...a, empresa_nombre: getEmpresaNombre(a) })), 'fuerza_de_ventas', asesorCsvHeaders);
    setIsExporting(false);
  };

  const handleExportPdf = () => {
    setIsExporting(true);
    onExportPdf(asesores.map(a => ({ ...a, empresa_nombre: getEmpresaNombre(a) })), 'fuerza_de_ventas', asesorCsvHeaders, 'Directorio de Asesores');
    setIsExporting(false);
  };

  const totalPages = Math.ceil((totalItems || 0) / (itemsPerPage || 1));

  return (
    <Card className="mt-6 shadow-lg border-none rounded-xl overflow-hidden bg-white">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-6 gap-4">
          <div className="w-full lg:w-2/3">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <UserCheck className="h-6 w-6 text-emerald-600" /> Fuerza de Ventas
              <span className="bg-emerald-100 text-emerald-800 text-xs py-1 px-3 rounded-full ml-2">{totalItems} Asesores</span>
            </h3>
            <form onSubmit={(e) => { e.preventDefault(); onSearch(searchTerm); }} className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar por Nombre o Cédula..." className="pl-9 bg-gray-50 focus:bg-white border-slate-200" />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-slate-800 hover:bg-slate-900 text-white shadow-sm">Buscar</Button>
                <Button type="button" variant="outline" onClick={() => { setSearchTerm(''); onSearch(''); }} className="border-slate-200 text-slate-600">Limpiar</Button>
              </div>
            </form>
          </div>
          <div className="flex gap-2 w-full lg:w-auto">
            <Button onClick={handleExportCsv} variant="outline" className="flex-1 md:flex-none border-green-200 text-green-700 hover:bg-green-50 shadow-sm" disabled={isExporting || asesores.length === 0}>
              {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4 mr-2" />} CSV
            </Button>
            <Button onClick={handleExportPdf} variant="outline" className="flex-1 md:flex-none border-red-200 text-red-700 hover:bg-red-50 shadow-sm" disabled={isExporting || asesores.length === 0}>
              {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />} PDF
            </Button>
          </div>
        </div>

        {asesores.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <div className="bg-white p-4 rounded-full shadow-sm border border-slate-100 mb-4"><UserCheck className="h-10 w-10 text-slate-300" /></div>
            <h3 className="text-lg font-bold text-slate-800">Ningún asesor registrado</h3>
            <p className="text-sm text-slate-500 max-w-sm text-center">Agrega asesores manualmente o utiliza la carga masiva para poblar tu directorio.</p>
          </div>
        ) : (
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto w-full"> {/* CONTENEDOR DE SCROLL CORREGIDO */}
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Asesor</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Cédula</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Teléfono</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Aseguradora</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {asesores.map((asesor) => (
                    <tr key={asesor.id} className="hover:bg-emerald-50/40 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm border border-emerald-200">
                            {getInitials(asesor.nombre, asesor.apellido)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-bold text-slate-800">{asesor.nombre} {asesor.apellido}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-700">
                        {asesor.cedula || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        <div className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-slate-400"/> {asesor.telefono || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        <div className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-slate-400"/> {asesor.email || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-md bg-blue-50 text-blue-700 border border-blue-100 uppercase">
                          {getEmpresaNombre(asesor)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => onEditAsesor(asesor)} className="text-blue-600 hover:bg-blue-100 rounded-full transition-all active:scale-90" title="Editar Asesor"><PencilIcon className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => confirm({ title: "¿Eliminar Asesor?", message: `Esta acción borrará a ${asesor.nombre} permanentemente.`, onConfirm: () => onDeleteAsesor(asesor.id) })} className="text-rose-500 hover:bg-rose-100 rounded-full transition-all active:scale-90" title="Borrar Asesor"><Trash2Icon className="h-4 w-4" /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8 flex justify-center border-t border-slate-100 pt-6">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AsesorList;