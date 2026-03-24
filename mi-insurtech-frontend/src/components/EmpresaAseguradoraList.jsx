// src/components/EmpresaAseguradoraList.jsx
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Building2, Search, FileDown, FileText, Mail, Phone, Fingerprint, Eye, Edit2, Trash2 } from 'lucide-react';
import Pagination from './Pagination'; 
import AseguradoraProfile360 from './AseguradoraProfile360';
import { useConfirmation } from './ConfirmationContext'; 

function EmpresaAseguradoraList({ 
  empresas = [], onSearch, searchTerm, setSearchTerm, 
  currentPage, itemsPerPage, totalItems, onPageChange,
  onExport, onExportPdf, onEdit, onDelete 
}) {
  const [isExporting, setIsExporting] = useState(false);
  const { confirm } = useConfirmation(); 
  const [selectedAseguradora360, setSelectedAseguradora360] = useState(null);

  const aseguradoraHeaders = [
    { key: 'nombre', label: 'Razón Social' }, { key: 'rif', label: 'RIF / NIT' },
    { key: 'telefono', label: 'Teléfono' }, { key: 'email_contacto', label: 'Correo Electrónico' }
  ];

  const handleExportCsv = () => { setIsExporting(true); onExport(empresas, 'aseguradoras', aseguradoraHeaders); setIsExporting(false); };
  const handleExportPdf = () => { setIsExporting(true); onExportPdf(empresas, 'aseguradoras', aseguradoraHeaders, 'Directorio de Aseguradoras'); setIsExporting(false); };

  const totalPages = Math.ceil((totalItems || 0) / (itemsPerPage || 1));

  return (
    <>
      <Card className="shadow-lg border-none rounded-xl overflow-hidden bg-white mt-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-indigo-600" />
              <h3 className="text-xl font-bold text-slate-800">Red de Aseguradoras</h3>
              <span className="bg-indigo-50 text-indigo-700 text-xs py-1 px-3 rounded-full ml-2 border border-indigo-100 font-bold">
                {totalItems} Registradas
              </span>
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <Button onClick={handleExportCsv} disabled={isExporting || empresas.length === 0} variant="outline" className="flex-1 md:flex-none border-green-200 text-green-700 hover:bg-green-50 font-bold">
                <FileDown className="h-4 w-4 mr-2" /> CSV
              </Button>
              <Button onClick={handleExportPdf} disabled={isExporting || empresas.length === 0} variant="outline" className="flex-1 md:flex-none border-red-200 text-red-700 hover:bg-red-50 font-bold">
                <FileText className="h-4 w-4 mr-2" /> PDF
              </Button>
            </div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); onSearch(searchTerm); }} className="flex gap-2 mb-6 bg-slate-50 p-5 rounded-xl border border-slate-100">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar por Razón Social o RIF..." className="pl-10 bg-white border-slate-200" />
            </div>
            <Button type="submit" className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-6 shadow-sm">Buscar</Button>
            <Button type="button" variant="outline" onClick={() => onSearch('')} className="border-slate-200">Limpiar</Button>
          </form>

          {empresas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
              <div className="bg-white p-4 rounded-full shadow-sm border border-slate-100 mb-4"><Building2 className="h-10 w-10 text-slate-300" /></div>
              <h3 className="text-lg font-bold text-slate-700">Ninguna empresa registrada</h3>
              <p className="text-sm text-slate-500 text-center mt-1">Agrega aseguradoras manualmente o utiliza la carga masiva.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Empresa & RIF</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Contacto Operativo</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {empresas.map((empresa) => (
                    <tr key={empresa.id} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* 1. EMPRESA & RIF */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-700 font-bold border border-indigo-100 shadow-sm">
                            {empresa.nombre.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="text-sm font-bold text-slate-800 block">{empresa.nombre}</span>
                            <span className="inline-flex items-center gap-1 mt-1 text-xs font-semibold text-slate-500">
                              <Fingerprint className="h-3 w-3" /> {empresa.rif}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2. CONTACTO (Cajitas Grises) */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100 text-xs text-slate-600 font-medium w-fit">
                            <Phone className="h-3.5 w-3.5 mr-2 text-slate-400" /> {empresa.telefono || 'N/A'}
                          </div>
                          <div className="flex items-center bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100 text-xs text-slate-600 font-medium w-fit">
                            <Mail className="h-3.5 w-3.5 mr-2 text-slate-400" /> {empresa.email_contacto || 'N/A'}
                          </div>
                        </div>
                      </td>

                      {/* 3. ACCIONES */}
                      <td className="px-6 py-4 whitespace-nowrap text-right space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => setSelectedAseguradora360(empresa.id)} className="text-purple-600 hover:bg-purple-100 rounded-full" title="Ver Balance 360°">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => onEdit && onEdit(empresa)} className="text-blue-600 hover:bg-blue-100 rounded-full" title="Editar">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => confirm({ title: "Eliminar Aseguradora", message: "¿Estás seguro de eliminar esta empresa?", onConfirm: () => onDelete && onDelete(empresa.id) })} className="text-rose-500 hover:bg-rose-100 rounded-full" title="Eliminar">
                          <Trash2 className="h-4 w-4" />
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

      {selectedAseguradora360 && (
        <AseguradoraProfile360 empresaId={selectedAseguradora360} onClose={() => setSelectedAseguradora360(null)} />
      )}
    </>
  );
}

export default EmpresaAseguradoraList;