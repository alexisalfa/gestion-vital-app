// src/components/EmpresaAseguradoraList.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Building2, Search, FileDown, FileText, Mail, Phone, Fingerprint, Eye, Edit2, Trash2 } from 'lucide-react';
import Pagination from './Pagination'; 
import AseguradoraProfile360 from './AseguradoraProfile360';
import { useConfirmation } from './ConfirmationContext'; 
import useDebounce from '../hooks/useDebounce';
import { useTranslation } from 'react-i18next';

function EmpresaAseguradoraList({ 
  empresas = [], onSearch, searchTerm, setSearchTerm, 
  currentPage, itemsPerPage, totalItems, onPageChange,
  onExport, onExportPdf, onEdit, onDelete 
}) {
  const [isExporting, setIsExporting] = useState(false);
  const { confirm } = useConfirmation(); 
  const { t } = useTranslation();
  const [selectedAseguradora360, setSelectedAseguradora360] = useState(null);

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

  const aseguradoraHeaders = [
    { key: 'nombre', label: t('aseguradoras.companyName') }, 
    { key: 'rif', label: t('aseguradoras.idDocument') },
    { key: 'telefono', label: t('aseguradoras.phone') }, 
    { key: 'email_contacto', label: t('aseguradoras.email') }
  ];

  const handleExportCsv = () => { setIsExporting(true); onExport(empresas, 'aseguradoras', aseguradoraHeaders); setIsExporting(false); };
  const handleExportPdf = () => { setIsExporting(true); onExportPdf(empresas, 'aseguradoras', aseguradoraHeaders, t('aseguradoras.exportPdfTitle')); setIsExporting(false); };

  const totalPages = Math.ceil((totalItems || 0) / (itemsPerPage || 1));

  return (
    <>
      <Card className="mt-6 bg-slate-900/40 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] border border-white/10 relative">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-500/20 p-2 rounded-lg border border-indigo-500/30">
                <Building2 className="h-5 w-5 text-indigo-400" />
              </div>
              <h3 className="text-xl font-black text-white drop-shadow-md">{t('aseguradoras.listTitle')}</h3>
              <span className="bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs py-1 px-3 rounded-full ml-2 font-bold">
                {totalItems} {t('aseguradoras.registeredAmount')}
              </span>
            </div>

            <div className="flex gap-3 w-full lg:w-auto">
              <Button onClick={handleExportCsv} disabled={isExporting || empresas.length === 0} variant="outline" className="flex-1 lg:flex-none border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 hover:text-emerald-300 hover:border-emerald-500/50 transition-all h-10 font-bold">
                <FileDown className="h-4 w-4 mr-2" /> CSV
              </Button>
              <Button onClick={handleExportPdf} disabled={isExporting || empresas.length === 0} variant="outline" className="flex-1 lg:flex-none border-rose-500/30 text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/50 transition-all h-10 font-bold">
                <FileText className="h-4 w-4 mr-2" /> PDF
              </Button>
            </div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); onSearch(localSearch); }} className="mb-6 flex gap-3 relative z-20">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input 
                value={localSearch} 
                onChange={(e) => setLocalSearch(e.target.value)} 
                placeholder={t('aseguradoras.searchPlaceholder')} 
                autoComplete="off"
                className="pl-9 bg-black/20 focus:bg-black/40 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all h-10" 
              />
            </div>
            <Button type="submit" className="bg-indigo-600/80 hover:bg-indigo-500 text-white border border-indigo-500/50 shadow-[0_0_10px_rgba(79,70,229,0.3)] h-10 px-6 font-bold">{t('aseguradoras.btnSearch')}</Button>
            <Button type="button" variant="outline" onClick={() => { setLocalSearch(''); onSearch(''); }} className="text-slate-300 border-white/20 bg-transparent hover:bg-white/10 hover:text-white h-10">{t('aseguradoras.btnClear')}</Button>
          </form>

          {empresas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed border-white/10 rounded-2xl bg-black/20">
              <div className="bg-white/5 p-4 rounded-full border border-white/10 mb-4"><Building2 className="h-10 w-10 text-slate-500" /></div>
              <h3 className="text-lg font-bold text-white">{t('aseguradoras.emptyTitle')}</h3>
              <p className="text-sm text-slate-400 text-center mt-2 leading-relaxed">{t('aseguradoras.emptyDesc')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-white/10 shadow-inner">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-slate-900/50 backdrop-blur-sm">
                  <tr>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('aseguradoras.thCompanyRif')}</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('aseguradoras.thContact')}</th>
                    <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('aseguradoras.thActions')}</th>
                  </tr>
                </thead>
                <tbody className="bg-transparent divide-y divide-white/5">
                  {empresas.map((empresa) => (
                    <tr key={empresa.id} className="hover:bg-white/5 transition-colors duration-200 group">
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-300 font-black text-sm border border-indigo-500/30 shadow-inner">
                            {empresa.nombre.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors block">{empresa.nombre}</span>
                            <span className="inline-flex items-center gap-1.5 mt-1 text-xs font-semibold text-slate-400">
                              <Fingerprint className="h-3 w-3 text-slate-500" /> {empresa.rif}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center bg-white/5 px-2.5 py-1 rounded-md border border-white/10 text-[11px] font-bold text-slate-300 tracking-wide w-fit">
                            <Phone className="h-3.5 w-3.5 mr-2 text-slate-500" /> {empresa.telefono || 'N/A'}
                          </div>
                          <div className="flex items-center bg-white/5 px-2.5 py-1 rounded-md border border-white/10 text-[11px] font-bold text-slate-300 tracking-wide w-fit">
                            <Mail className="h-3.5 w-3.5 mr-2 text-slate-500" /> {empresa.email_contacto || 'N/A'}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => setSelectedAseguradora360(empresa.id)} className="text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-full transition-colors" title={t('aseguradoras.btnView360')}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => onEdit && onEdit(empresa)} className="text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-full transition-colors" title={t('aseguradoras.btnEdit')}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => confirm({ title: t('aseguradoras.confirmDeleteTitle'), message: t('aseguradoras.confirmDeleteMsg'), onConfirm: () => onDelete && onDelete(empresa.id) })} className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-full transition-colors" title={t('aseguradoras.btnDelete')}>
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

export default React.memo(EmpresaAseguradoraList, (prev, next) => {
  return (
    prev.empresas === next.empresas &&
    prev.totalItems === next.totalItems &&
    prev.currentPage === next.currentPage
  );
});