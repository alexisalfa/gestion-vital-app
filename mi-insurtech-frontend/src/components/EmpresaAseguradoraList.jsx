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
  onExport, onExportPdf, onEdit, onDelete // <-- Nombres estándar corregidos
}) {
  const [isExporting, setIsExporting] = useState(false);
  const { confirm } = useConfirmation(); 
  
  const [selectedAseguradora360, setSelectedAseguradora360] = useState(null);

  const aseguradoraHeaders = [
    { key: 'nombre', label: 'Razón Social' },
    { key: 'rif', label: 'RIF / NIT' },
    { key: 'telefono', label: 'Teléfono' },
    { key: 'email_contacto', label: 'Correo Electrónico' }
  ];

  const handleExportCsv = () => {
    setIsExporting(true);
    onExport(empresas, 'aseguradoras', aseguradoraHeaders);
    setIsExporting(false);
  };

  const handleExportPdf = () => {
    setIsExporting(true);
    onExportPdf(empresas, 'aseguradoras', aseguradoraHeaders, 'Directorio de Aseguradoras');
    setIsExporting(false);
  };

  const totalPages = Math.ceil((totalItems || 0) / (itemsPerPage || 1));

  return (
    <>
      <Card className="shadow-xl border-none rounded-xl overflow-hidden bg-white">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Building2 className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Red de Aseguradoras</h3>
                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  {totalItems} Empresas registradas
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleExportCsv} disabled={isExporting || empresas.length === 0} variant="outline" size="sm" className="border-green-200 text-green-700 hover:bg-green-50">
                <FileDown className="h-4 w-4 mr-2" /> CSV
              </Button>
              <Button onClick={handleExportPdf} disabled={isExporting || empresas.length === 0} variant="outline" size="sm" className="border-red-200 text-red-700 hover:bg-red-50">
                <FileText className="h-4 w-4 mr-2" /> PDF
              </Button>
            </div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); onSearch(searchTerm); }} className="flex gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar por Razón Social o RIF..." className="pl-10 bg-slate-50 border-slate-200" />
            </div>
            <Button type="submit" className="bg-slate-800 hover:bg-slate-900 text-white px-6">Buscar</Button>
            <Button type="button" variant="outline" onClick={() => onSearch('')} className="border-slate-200">Limpiar</Button>
          </form>

          <div className="border rounded-xl overflow-hidden">
            <div className="overflow-x-auto w-full"> 
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Empresa</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">RIF</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Teléfono Master</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Email Contacto</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {empresas.map((empresa) => (
                    <tr key={empresa.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-700 font-bold border border-indigo-100">
                            {empresa.nombre.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="text-sm font-bold text-slate-800">{empresa.nombre}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                          <Fingerprint className="h-3 w-3" /> {empresa.rif}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-slate-400" /> {empresa.telefono || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-slate-400" /> {empresa.email_contacto || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right space-x-1">
                        
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setSelectedAseguradora360(empresa.id)} 
                          className="text-indigo-600 hover:bg-indigo-100 rounded-full"
                          title="Ver Balance 360°"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        {/* Botones de Editar y Eliminar SIEMPRE visibles */}
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
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex justify-center border-t pt-6">
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* MODAL 360 RENDERIZADO */}
      {selectedAseguradora360 && (
        <AseguradoraProfile360 
          empresaId={selectedAseguradora360} 
          onClose={() => setSelectedAseguradora360(null)} 
        />
      )}
    </>
  );
}

export default EmpresaAseguradoraList;