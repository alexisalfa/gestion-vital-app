// src/components/ReclamacionImport.jsx
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/lib/use-toast';
import { UploadCloud, FileSpreadsheet, Loader2, Info, Download } from 'lucide-react';

function ReclamacionImport({ apiBaseUrl, onImportComplete }) {
  const { toast } = useToast();
  const [file, setFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);

  const descargarPlantilla = () => {
    const headers = ["descripcion", "fecha_siniestro", "fecha_reclamacion", "monto_reclamado", "estado_reclamacion", "poliza_id", "cliente_id"].join(",");
    const ejemplo = ["Choque simple en estacionamiento", "2026-03-01", "2026-03-05", "450.00", "Pendiente", "1", "1"].join(",");
    const csvContent = "\ufeff" + headers + "\n" + ejemplo;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "modelo_importar_reclamaciones.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({ title: "Plantilla descargada", description: "Completa los datos de los siniestros y súbelos." });
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
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${apiBaseUrl}/reclamaciones/importar`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        toast({ title: "Éxito", description: "Reclamaciones importadas correctamente.", variant: "success" });
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (onImportComplete) onImportComplete();
      } else {
        const err = await response.json();
        throw new Error(err.detail || "Error al procesar el archivo");
      }
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card className="mb-8 bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-2xl overflow-hidden transition-all duration-300">
      <div className="bg-gradient-to-r from-red-600/20 to-rose-700/20 border-b border-red-500/30 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-lg font-black text-white flex items-center gap-3 drop-shadow-md">
          <div className="p-2.5 rounded-xl bg-red-500/20 border border-red-500/40 backdrop-blur-md">
            <FileSpreadsheet className="h-5 w-5 text-red-400" />
          </div>
          Importación de Siniestros
        </h3>
        <Button variant="outline" size="sm" onClick={descargarPlantilla} className="bg-transparent border-red-400/50 text-red-300 hover:bg-red-500/20 hover:text-white font-bold shadow-sm transition-all w-full sm:w-auto">
          <Download className="h-4 w-4 mr-2" /> Descargar Modelo
        </Button>
      </div>

      <CardContent className="p-6">
        
        {/* LA CAJITA DE INSTRUCCIONES EN TONOS ROJOS */}
        <div className="mb-6 flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-200 backdrop-blur-sm">
          <Info className="h-5 w-5 mt-0.5 flex-shrink-0 text-red-400" />
          <div className="text-sm">
            <p>Descarga el modelo, rellena los datos de los siniestros y sube el archivo CSV. Verifica que los <b className="text-white">IDs de Póliza y Cliente</b> ya existan en el sistema. Las fechas deben seguir el formato <b className="text-white">AAAA-MM-DD</b>.</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full space-y-2">
            <label className="text-slate-300 font-bold text-xs uppercase tracking-wider">Seleccionar archivo CSV</label>
            <Input type="file" accept=".csv" onChange={handleFileChange} ref={fileInputRef} className="text-white bg-black/20 border-white/10 file:bg-white/10 file:text-white file:border-0 file:rounded-md file:mr-4 file:px-4 file:py-2 hover:file:bg-white/20 transition-all focus:border-red-400 focus:ring-1 focus:ring-red-400 cursor-pointer h-12 pt-2" />
          </div>
          <Button onClick={handleImportSubmit} disabled={isImporting || !file} className="w-full md:w-auto h-12 px-6 bg-red-600/80 hover:bg-red-500 text-white font-black tracking-wide border border-red-500/50 shadow-[0_0_15px_rgba(220,38,38,0.5)] transition-all active:scale-95 disabled:opacity-50 disabled:shadow-none">
            {isImporting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <UploadCloud className="mr-2 h-5 w-5" />} Subir Siniestros
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default ReclamacionImport;