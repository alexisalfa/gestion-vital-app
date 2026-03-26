// src/components/AsesorList.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { PencilIcon, Trash2Icon, Loader2, Search, FileDown, FileText, Mail, Phone, UserCheck, Eye, Fingerprint } from 'lucide-react';
import { useConfirmation } from './ConfirmationContext'; 
import Pagination from './Pagination'; 
import AsesorProfile360 from './AsesorProfile360';
import useDebounce from '../hooks/useDebounce'; 

function AsesorList({
  asesores = [], onEditAsesor, onDeleteAsesor, currentPage, itemsPerPage, totalItems, onPageChange, searchTerm, setSearchTerm, onSearch, onExport, onExportPdf, empresasAseguradoras = []
}) {
  const { confirm } = useConfirmation();
  const [isExporting, setIsExporting] = useState(false);
  const [selectedAsesor360, setSelectedAsesor360] = useState(null);

  // --- 🚀 MOTOR DE BÚSQUEDA EN TIEMPO REAL ---
  const [localSearch, setLocalSearch] = useState(searchTerm || '');
  const debouncedSearch = useDebounce(localSearch, 500);

  useEffect(() => {
    if (debouncedSearch !== searchTerm) {
      onSearch(debouncedSearch);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    setLocalSearch(searchTerm || '');
  }, [searchTerm]);
  // ------------------------------------------

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
      <Card className="mt-6 bg-slate-900/40 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] border border-white/10 relative">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4 border-b border-white/10 pb-4">
            <h3 className="text-xl font-black text-white flex items-center gap-3 drop-shadow-md">
              <div className="bg-emerald-500/20 p-2 rounded-lg border border-emerald-500/30">
                <UserCheck className="h-5 w-5 text-emerald-400" />
              </div>
              Fuerza de Ventas
              <span className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs py-1 px-3 rounded-full ml-2 font-bold">{totalItems} Asesores</span>
            </h3>
            <div className="flex gap-3 w-full lg:w-auto">
              <Button onClick={handleExportCsv} variant="outline" className="flex-1 lg:flex-none border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 hover:text-emerald-300 hover:border-emerald-500/50 transition-all h-10 font-bold" disabled={isExporting || asesores.length === 0}>
                {isExporting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileDown className="h-4 w-4 mr-2" />} CSV
              </Button>
              <Button onClick={handleExportPdf} variant="outline" className="flex-1 lg:flex-none border-rose-500/30 text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/50 transition-all h-10 font-bold" disabled={isExporting || asesores.length === 0}>
                {isExporting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileText className="h-4 w-4 mr-2" />} PDF
              </Button>
            </div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); onSearch(localSearch); }} className="mb-6 flex gap-3 relative z-20">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input 
                value={localSearch} 
                onChange={(e) => setLocalSearch(e.target.value)} 
                placeholder="Buscar por Nombre o Cédula..." 
                autoComplete="off"
                className="pl-9 bg-black/20 focus:bg-black/40 border-white/10 text-white placeholder:text-slate-500 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all h-10" 
              />
            </div>
            <Button type="submit" className="bg-emerald-600/80 hover:bg-emerald-500 text-white border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)] h-10 px-6 font-bold">Buscar</Button>
            <Button type="button" variant="outline" onClick={() => { setLocalSearch(''); onSearch(''); }} className="text-slate-300 border-white/20 bg-transparent hover:bg-white/10 hover:text-white h-10">Limpiar</Button>
          </form>

          {asesores.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed border-white/10 rounded-2xl bg-black/20">
              <div className="bg-white/5 p-4 rounded-full border border-white/10 mb-4"><UserCheck className="h-10 w-10 text-slate-500" /></div>
              <h3 className="text-lg font-bold text-white">Ningún asesor registrado</h3>
              <p className="text-sm text-slate-400 text-center mt-2">Agrega asesores o utiliza la carga masiva para poblar tu directorio.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-white/10 shadow-inner">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-slate-900/50 backdrop-blur-sm">
                  <tr>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Asesor & Identidad</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Contacto</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Aseguradora</th>
                    <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-transparent divide-y divide-white/5">
                  {asesores.map((asesor) => (
                    <tr key={asesor.id} className="hover:bg-white/5 transition-colors duration-200 group">
                      
                      {/* 1. ASESOR & IDENTIDAD */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-black text-sm border border-emerald-500/30 shadow-inner">
                            {getInitials(asesor.nombre, asesor.apellido)}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{asesor.nombre} {asesor.apellido}</div>
                            <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mt-1">
                              <Fingerprint className="h-3 w-3 text-slate-500"/> {asesor.cedula || 'N/A'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. CONTACTO */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center bg-white/5 px-2.5 py-1 rounded-md border border-white/10 text-[11px] font-bold text-slate-300 tracking-wide">
                            <Phone className="h-3.5 w-3.5 mr-2 text-slate-500"/> {asesor.telefono || 'N/A'}
                          </div>
                          <div className="flex items-center bg-white/5 px-2.5 py-1 rounded-md border border-white/10 text-[11px] font-bold text-slate-300 tracking-wide">
                            <Mail className="h-3.5 w-3.5 mr-2 text-slate-500"/> {asesor.email || 'N/A'}
                          </div>
                        </div>
                      </td>

                      {/* 3. ASEGURADORA */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1.5 inline-flex text-[11px] font-black uppercase tracking-wider rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          {getEmpresaNombre(asesor)}
                        </span>
                      </td>

                      {/* 4. ACCIONES */}
                      <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => setSelectedAsesor360(asesor.id)} className="text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-full transition-colors" title="Ver Rendimiento Comercial">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => onEditAsesor(asesor)} className="text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-full transition-colors" title="Editar Asesor">
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => confirm({ title: "¿Eliminar Asesor?", message: `Esta acción borrará a ${asesor.nombre} permanentemente.`, onConfirm: () => onDeleteAsesor(asesor.id) })} className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-full transition-colors" title="Borrar Asesor">
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

// 🛡️ ESCUDO MEMO NIVEL DIOS
export default React.memo(AsesorList, (prev, next) => {
  return (
    prev.asesores === next.asesores &&
    prev.totalItems === next.totalItems &&
    prev.currentPage === next.currentPage &&
    prev.empresasAseguradoras === next.empresasAseguradoras
  );
});