// src/components/ComisionImport.jsx
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/lib/use-toast';
import { UploadCloud, FileSpreadsheet, Loader2, Info, Download } from 'lucide-react';

function ComisionImport({ apiBaseUrl, onImportComplete }) {
  const { toast } = useToast();
  const [file, setFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);

  // --- FUNCIÓN PARA DESCARGAR LA PLANTILLA MODELO ---
  const descargarPlantilla = () => {
    // Encabezados exactos que espera la base de datos
    const headers = ["id_asesor", "id_poliza", "tipo_comision", "valor_comision", "monto_base", "monto_final", "fecha_generacion", "estatus_pago"].join(",");
    
    // Fila de ejemplo con datos coherentes
    const ejemplo = ["1", "10", "porcentaje", "10", "1500.00", "150.00", "2026-03-10", "pendiente"].join(",");
    
    // Añadimos el BOM (\ufeff) para Excel
    const csvContent = "\ufeff" + headers + "\n" + ejemplo;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "modelo_importar_comisiones.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({ title: "Plantilla descargada", description: "Completa los datos de las liquidaciones y súbelos." });
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
        toast({ title: "Importación Exitosa", description: "Comisiones cargadas correctamente.", variant: "success" });
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (onImportComplete) onImportComplete();
      } else {
        const err = await response.json();
        throw new Error(err.detail || "Error en el formato del CSV");
      }
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card className="mb-8 border-none shadow-lg rounded-xl overflow-hidden bg-white">
      <div className="bg-blue-50 border-b border-blue-100 p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-bold text-blue-900">Importación de Liquidaciones</h3>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={descargarPlantilla}
          className="bg-white border-blue-200 text-blue-700 hover:bg-blue-100 font-semibold shadow-sm"
        >
          <Download className="h-4 w-4 mr-2" /> Descargar Modelo
        </Button>
      </div>

      <CardContent className="p-6">
        <div className="mb-6 flex items-start gap-3 p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg">
          <Info className="h-5 w-5 text-indigo-500 mt-0.5" />
          <div className="text-sm text-indigo-900">
            <p className="font-semibold mb-1">Antes de subir:</p>
            <p>Verifica que los <b>IDs de Asesor y Póliza</b> ya existan en el sistema. El formato de fecha debe ser AAAA-MM-DD.</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-end bg-slate-50/30 p-4 rounded-lg border border-slate-100">
          <div className="flex-1 w-full space-y-2">
            <label className="text-sm font-medium text-slate-700">Archivo CSV de Comisiones</label>
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
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md transition-all active:scale-95"
          >
            {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />} 
            Subir Liquidaciones
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default ComisionImport;