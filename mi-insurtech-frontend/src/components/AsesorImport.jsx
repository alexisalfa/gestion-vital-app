// src/components/AsesorImport.jsx
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/lib/use-toast';
import { UploadCloud, FileSpreadsheet, Loader2, Download, Info } from 'lucide-react';

function AsesorImport({ apiBaseUrl, onImportComplete }) {
  const { toast } = useToast();
  const [file, setFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);

  // --- FUNCIÓN PARA DESCARGAR LA PLANTILLA MODELO ---
  const descargarPlantilla = () => {
    // Encabezados requeridos por tu backend según las instrucciones anteriores
    const headers = ["nombre", "apellido", "cedula", "email", "telefono", "empresa_aseguradora_id"].join(",");
    
    // Fila de ejemplo clara para el usuario
    const ejemplo = ["Eduardo", "Cañas", "V87654321", "eduardo.canas@email.com", "0424-9998877", "1"].join(",");
    
    const csvContent = "\ufeff" + headers + "\n" + ejemplo;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "modelo_importar_asesores.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({ title: "Plantilla descargada", description: "Completa los datos de tus asesores y súbelos." });
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
      const response = await fetch(`${apiBaseUrl}/asesores/import/csv`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        toast({ title: "Importación Exitosa", description: "La red de asesores ha sido actualizada.", variant: "success" });
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (onImportComplete) onImportComplete();
      } else {
        const err = await response.json();
        throw new Error(err.detail || "Error procesando el archivo CSV");
      }
    } catch (error) {
      toast({ title: "Atención con la Importación", description: error.message, variant: "destructive" });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card className="mb-8 border-none shadow-lg rounded-xl overflow-hidden bg-white">
      <div className="bg-emerald-50 border-b border-emerald-100 p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
          <h3 className="text-lg font-bold text-emerald-900">Gestión de Fuerza de Ventas</h3>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={descargarPlantilla}
          className="bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-100 font-semibold shadow-sm"
        >
          <Download className="h-4 w-4 mr-2" /> Descargar Modelo
        </Button>
      </div>

      <CardContent className="p-6">
        <div className="mb-6 flex items-start gap-3 p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
          <Info className="h-5 w-5 text-blue-500 mt-0.5" />
          <p className="text-sm text-blue-800">
            Utiliza el modelo oficial para registrar nuevos asesores. La <b>cédula</b> es el campo de identidad; si ya existe, el registro se omitirá para evitar duplicados.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-end bg-slate-50/30 p-4 rounded-lg border border-slate-100">
          <div className="flex-1 w-full space-y-2">
            <label className="text-sm font-medium text-slate-700">Archivo CSV de Asesores</label>
            <Input type="file" accept=".csv" onChange={handleFileChange} ref={fileInputRef} className="bg-white border-slate-200" />
          </div>
          <Button 
            onClick={handleImportSubmit} 
            disabled={isImporting || !file} 
            className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md transition-all active:scale-95"
          >
            {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />} 
            Iniciar Carga
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default AsesorImport;