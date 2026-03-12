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

  // --- FUNCIÓN PARA DESCARGAR LA PLANTILLA MODELO ---
  const descargarPlantilla = () => {
    // Encabezados requeridos por el backend
    const headers = ["descripcion", "fecha_siniestro", "fecha_reclamacion", "monto_reclamado", "estado_reclamacion", "poliza_id", "cliente_id"].join(",");
    
    // Fila de ejemplo con datos realistas
    const ejemplo = ["Choque simple en estacionamiento", "2026-03-01", "2026-03-05", "450.00", "Pendiente", "1", "1"].join(",");
    
    // BOM para compatibilidad con Excel (UTF-8)
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
    <Card className="mb-8 border-none shadow-lg rounded-xl overflow-hidden bg-white">
      <div className="bg-red-50 border-b border-red-100 p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-red-600" />
          <h3 className="text-lg font-bold text-red-900">Importación de Siniestros</h3>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={descargarPlantilla}
          className="bg-white border-red-200 text-red-700 hover:bg-red-100 font-semibold shadow-sm"
        >
          <Download className="h-4 w-4 mr-2" /> Descargar Modelo
        </Button>
      </div>

      <CardContent className="p-6">
        <div className="mb-6 flex items-start gap-3 p-3 bg-amber-50/50 border border-amber-100 rounded-lg">
          <Info className="h-5 w-5 text-amber-600 mt-0.5" />
          <div className="text-sm text-amber-900">
            <p className="font-semibold mb-1">Antes de subir:</p>
            <p>Verifica que los <b>IDs de Póliza y Cliente</b> ya existan en el sistema. Las fechas deben seguir el formato AAAA-MM-DD.</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-end bg-slate-50/30 p-4 rounded-lg border border-slate-100">
          <div className="flex-1 w-full space-y-2">
            <label className="text-sm font-medium text-slate-700">Archivo CSV de Reclamaciones</label>
            <Input 
              type="file" 
              accept=".csv" 
              onChange={handleFileChange} 
              ref={fileInputRef} 
              className="bg-white border-slate-200" 
            />
          </div>
          <Button 
            onClick={handleImportSubmit} 
            disabled={isImporting || !file} 
            className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white font-bold shadow-md transition-all active:scale-95"
          >
            {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />} 
            Subir Siniestros
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default ReclamacionImport;