// src/components/AsesorList.jsx
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { PencilIcon, Trash2Icon, Loader2, Search, FileDown, FileText, Mail, Phone, UserCheck, Eye, Fingerprint } from 'lucide-react';
import { useConfirmation } from './ConfirmationContext'; 
import Pagination from './Pagination'; 
import AsesorProfile360 from './AsesorProfile360';

function AsesorList({
  asesores = [], onEditAsesor, onDeleteAsesor, currentPage, itemsPerPage, totalItems, onPageChange, searchTerm, setSearchTerm, onSearch, onExport, onExportPdf, empresasAseguradoras = []
}) {
  const { confirm } = useConfirmation();
  const [isExporting, setIsExporting] = useState(false);
  const [selectedAsesor360, setSelectedAsesor360] = useState(null);

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

  const handleExportCsv = () => { setIsExporting(true); onExport(asesores.map(a => ({ ...a, empresa_nombre: getEmpresaNombre(a) })), 'fuerza_de_ventas', asesorCsvHeaders); setIsExporting(false); };
  const handleExportPdf = () => { setIsExporting(true); onExportPdf(asesores.map(a => ({ ...a, empresa_nombre: getEmpresaNombre(a) })), 'fuerza_de_ventas', asesorCsvHeaders, 'Directorio de Asesores'); setIsExporting(false); };

  const totalPages = Math.ceil((totalItems || 0) / (itemsPerPage || 1));

  return (
    <>
      <Card className="mt-6 shadow-lg border-none rounded-xl overflow-hidden bg-white">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4 border-b border-slate-100 pb-4">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <UserCheck className="h-6 w-6 text-emerald-600" /> Fuerza de Ventas
              <span className="bg-emerald-50 text-emerald-700 text-xs py-1 px-3 rounded-full ml-2 border border-emerald-100 font-bold">{totalItems} Asesores</span>
            </h3>
            <div className="flex gap-2 w-full lg:w-auto">
              <Button onClick={handleExportCsv} variant="outline" className="flex-1 lg:flex-none border-green-200 text-green-700 hover:bg-green-50 font-bold" disabled={isExporting || asesores.length === 0}>
                {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4 mr-2" />} CSV
              </Button>
              <Button onClick={handleExportPdf} variant="outline" className="flex-1 lg:flex-none border-red-200 text-red-700 hover:bg-red-50 font-bold" disabled={isExporting || asesores.length === 0}>
                {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />} PDF
              </Button>
            </div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); onSearch(searchTerm); }} className="mb-6 bg-slate-50 p-5 rounded-xl border border-slate-100 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar por Nombre o Cédula..." className="pl-10 bg-white border-slate-200" />
            </div>
            <Button type="submit" className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-6 shadow-sm">Buscar</Button>
            <Button type="button" variant="outline" onClick={() => { setSearchTerm(''); onSearch(''); }} className="border-slate-200">Limpiar</Button>
          </form>

          {asesores.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
              <div className="bg-white p-4 rounded-full shadow-sm border border-slate-100 mb-4"><UserCheck className="h-10 w-10 text-slate-300" /></div>
              <h3 className="text-lg font-bold text-slate-700">Ningún asesor registrado</h3>
              <p className="text-sm text-slate-500 text-center mt-1">Agrega asesores o utiliza la carga masiva para poblar tu directorio.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Asesor & Identidad</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Contacto</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Aseguradora</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {asesores.map((asesor) => (
                    <tr key={asesor.id} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* 1. ASESOR & IDENTIDAD */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm border border-emerald-200">
                            {getInitials(asesor.nombre, asesor.apellido)}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-800">{asesor.nombre} {asesor.apellido}</div>
                            <div className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                              <Fingerprint className="h-3 w-3 text-slate-400"/> {asesor.cedula || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. CONTACTO (Cajitas Grises) */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100 text-xs text-slate-600 font-medium">
                            <Phone className="h-3.5 w-3.5 mr-2 text-slate-400"/> {asesor.telefono || 'N/A'}
                          </div>
                          <div className="flex items-center bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100 text-xs text-slate-600 font-medium">
                            <Mail className="h-3.5 w-3.5 mr-2 text-slate-400"/> {asesor.email || 'N/A'}
                          </div>
                        </div>
                      </td>

                      {/* 3. ASEGURADORA */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1.5 inline-flex text-xs font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-100 uppercase">
                          {getEmpresaNombre(asesor)}
                        </span>
                      </td>

                      {/* 4. ACCIONES */}
                      <td className="px-6 py-4 whitespace-nowrap text-right space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => setSelectedAsesor360(asesor.id)} className="text-emerald-600 hover:bg-emerald-100 rounded-full transition-all" title="Ver Rendimiento Comercial">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => onEditAsesor(asesor)} className="text-blue-600 hover:bg-blue-100 rounded-full transition-all" title="Editar Asesor">
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => confirm({ title: "¿Eliminar Asesor?", message: `Esta acción borrará a ${asesor.nombre} permanentemente.`, onConfirm: () => onDeleteAsesor(asesor.id) })} className="text-rose-500 hover:bg-rose-100 rounded-full transition-all" title="Borrar Asesor">
                          <Trash2Icon className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
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

      {selectedAsesor360 && (
        <AsesorProfile360 asesorId={selectedAsesor360} onClose={() => setSelectedAsesor360(null)} />
      )}
    </>
  );
}

export default AsesorList;