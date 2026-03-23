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
    <Card className="mb-8 shadow-sm border-slate-200 rounded-xl bg-white">
      <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 gap-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-indigo-600" /> Carga Masiva de Liquidaciones
        </h3>
        <Button variant="outline" size="sm" onClick={descargarPlantilla} className="text-indigo-600 border-indigo-200 hover:bg-indigo-50 font-semibold w-full sm:w-auto">
          <Download className="h-4 w-4 mr-2" /> Descargar Modelo
        </Button>
      </div>

      <CardContent className="p-6">
        
        {/* LA CAJITA AZUL DE INSTRUCCIONES */}
        <div className="mb-6 flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl text-blue-700">
          <Info className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p>Descarga el modelo, rellena los datos de las comisiones y sube el archivo CSV. Verifica que los <b>IDs de Asesor y Póliza</b> ya existan en el sistema. El formato de fecha debe ser <b>AAAA-MM-DD</b>.</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full space-y-2">
            <label className="text-sm font-semibold text-slate-700">Seleccionar archivo</label>
            <Input type="file" accept=".csv" onChange={handleFileChange} ref={fileInputRef} className="bg-white border-slate-200" />
          </div>
          <Button onClick={handleImportSubmit} disabled={isImporting || !file} className="w-full md:w-auto bg-indigo-500 hover:bg-indigo-600 text-white font-bold transition-all shadow-md">
            {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />} Subir Archivo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default ComisionImport;