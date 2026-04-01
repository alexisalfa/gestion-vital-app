// src/components/ComisionImport.jsx
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/lib/use-toast';
import { UploadCloud, FileSpreadsheet, Loader2, Info, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // 🚀 Traductor Inyectado

function ComisionImport({ apiBaseUrl, onImportComplete }) {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [file, setFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);

  const descargarPlantilla = () => {
    const headers = ["id_asesor", "id_poliza", "tipo_comision", "valor_comision", "monto_base", "monto_final", "fecha_generacion", "estatus_pago"].join(",");
    const ejemplo = ["1", "10", "porcentaje", "10", "1500.00", "150.00", "2026-03-10", "pendiente"].join(",");
    const csvContent = "\ufeff" + headers + "\n" + ejemplo;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "modelo_importar_comisiones.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: t('comisiones.toastTemplateTitle'), description: t('comisiones.toastTemplateDesc') });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleImportSubmit = async () => {
    if (!file) return;
    setIsImporting(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch(`${apiBaseUrl}/comisiones/importar`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` },
        body: formData,
      });

      if (response.ok) {
        toast({ title: t('comisiones.toastImportSuccess'), description: t('comisiones.toastImportSuccessDesc'), variant: "success" });
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (onImportComplete) onImportComplete();
      } else {
        const err = await response.json();
        throw new Error(err.detail || t('comisiones.toastImportError'));
      }
    } catch (error) {
      toast({ title: t('comisiones.toastError'), description: error.message, variant: "destructive" });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card className="mb-8 bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-2xl overflow-hidden transition-all duration-300">
      <div className="bg-gradient-to-r from-amber-600/20 to-yellow-600/20 border-b border-amber-500/30 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-lg font-black text-white flex items-center gap-3 drop-shadow-md">
          <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 backdrop-blur-md">
            <FileSpreadsheet className="h-5 w-5 text-amber-400" />
          </div>
          {t('comisiones.importTitle')}
        </h3>
        <Button variant="outline" size="sm" onClick={descargarPlantilla} className="bg-transparent border-amber-400/50 text-amber-300 hover:bg-amber-500/20 hover:text-white font-bold shadow-sm transition-all w-full sm:w-auto">
          <Download className="h-4 w-4 mr-2" /> {t('comisiones.downloadModel')}
        </Button>
      </div>

      <CardContent className="p-6">
        <div className="mb-6 flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-200 backdrop-blur-sm">
          <Info className="h-5 w-5 mt-0.5 flex-shrink-0 text-amber-400" />
          <div className="text-sm">
            <p>{t('comisiones.importInfo1')} <b className="text-white">{t('comisiones.importInfoBold')}</b> {t('comisiones.importInfo2')} <b className="text-white">{t('comisiones.importInfoFormat')}</b>.</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full space-y-2">
            <label className="text-slate-300 font-bold text-xs uppercase tracking-wider">{t('comisiones.selectFile')}</label>
            <Input type="file" accept=".csv" onChange={handleFileChange} ref={fileInputRef} className="text-white bg-black/20 border-white/10 file:bg-white/10 file:text-white file:border-0 file:rounded-md file:mr-4 file:px-4 file:py-2 hover:file:bg-white/20 transition-all focus:border-amber-400 focus:ring-1 focus:ring-amber-400 cursor-pointer h-12 pt-2" />
          </div>
          <Button onClick={handleImportSubmit} disabled={isImporting || !file} className="w-full md:w-auto h-12 px-6 bg-amber-600/80 hover:bg-amber-500 text-white font-black tracking-wide border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.5)] transition-all active:scale-95 disabled:opacity-50 disabled:shadow-none">
            {isImporting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <UploadCloud className="mr-2 h-5 w-5" />} {t('comisiones.startUpload')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default ComisionImport;