// src/components/PolizaImport.jsx
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/lib/use-toast';
import { UploadCloud, FileSpreadsheet, Loader2, Download, Info } from 'lucide-react';

function PolizaImport({ apiBaseUrl, onImportComplete }) {
  const { toast } = useToast();
  const [file, setFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);

  const descargarPlantilla = () => {
    const headers = ["numero_poliza", "tipo_poliza", "fecha_inicio", "fecha_fin", "prima", "estado", "cliente_id", "empresa_aseguradora_id", "asesor_id"].join(",");
    const ejemplo = ["POL-10020", "Salud / HCM", "2026-03-10", "2027-03-10", "1250.50", "Activa", "1", "2", "3"].join(",");
    const csvContent = "\ufeff" + headers + "\n" + ejemplo;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "modelo_importar_polizas.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportSubmit = async () => {
    if (!file) return;
    setIsImporting(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await fetch(`${apiBaseUrl}/polizas/importar`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` },
        body: formData,
      });
      if (response.ok) {
        toast({ title: "Éxito", description: "Pólizas cargadas correctamente.", variant: "success" });
        setFile(null);
        if (onImportComplete) onImportComplete();
      } else {
        const err = await response.json();
        throw new Error(err.detail || "Error al procesar CSV");
      }
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card className="mb-8 border-none shadow-lg rounded-xl overflow-hidden bg-white">
      <div className="bg-indigo-50 border-b border-indigo-100 p-4 flex justify-between items-center">
        <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2"><FileSpreadsheet className="h-5 w-5 text-indigo-600" /> Carga Masiva de Pólizas</h3>
        <Button variant="outline" size="sm" onClick={descargarPlantilla} className="bg-white border-indigo-200 text-indigo-700 font-semibold"><Download className="h-4 w-4 mr-2" /> Modelo CSV</Button>
      </div>
      <CardContent className="p-6">
        <div className="mb-4 bg-blue-50/50 p-3 rounded-lg flex gap-3 text-xs text-blue-800 border border-blue-100">
          <Info className="h-4 w-4" />
          <p>Asegúrate de que los <b>IDs de cliente, aseguradora y asesor</b> ya existan en el sistema antes de subir.</p>
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <Input type="file" accept=".csv" onChange={(e) => setFile(e.target.files[0])} className="bg-white" />
          <Button onClick={handleImportSubmit} disabled={isImporting || !file} className="bg-indigo-600 text-white font-bold">{isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />} Subir Pólizas</Button>
        </div>
      </CardContent>
    </Card>
  );
}
export default PolizaImport;