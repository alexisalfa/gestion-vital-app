// src/components/EmpresaAseguradoraImport.jsx
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/lib/use-toast';
import { UploadCloud, FileSpreadsheet, Loader2, Download, Info } from 'lucide-react';

function EmpresaAseguradoraImport({ apiBaseUrl, onImportComplete }) {
  const { toast } = useToast();
  const [file, setFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);

  // --- FUNCIÓN PARA DESCARGAR LA PLANTILLA MODELO ---
  const descargarPlantilla = () => {
    // Encabezados exactos que espera el backend según tus instrucciones
    const headers = ["nombre", "rif", "direccion", "telefono", "email_contacto"].join(",");
    
    // Fila de ejemplo con datos realistas de una aseguradora
    const ejemplo = ["Seguros Caracas", "J-00000000-1", "Av. Francisco de Miranda, Caracas", "0212-5551234", "contacto@seguroscaracas.com"].join(",");
    
    // Añadimos el BOM (\ufeff) para compatibilidad total con Excel
    const csvContent = "\ufeff" + headers + "\n" + ejemplo;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "modelo_importar_aseguradoras.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({ title: "Plantilla descargada", description: "Completa el directorio de aseguradoras y súbelo." });
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
      // Usamos la URL que ya tenías configurada
      const response = await fetch(`${apiBaseUrl}/empresas-aseguradoras/import/csv`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        toast({ 
          title: "Importación Exitosa", 
          description: "El directorio de aseguradoras ha sido actualizado.", 
          variant: "success" 
        });
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (onImportComplete) onImportComplete();
      } else {
        const err = await response.json();
        throw new Error(err.detail || "Error procesando el archivo CSV");
      }
    } catch (error) {
      toast({ 
        title: "Atención con la Importación", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card className="mb-8 border-none shadow-lg rounded-xl overflow-hidden bg-white">
      <div className="bg-slate-50 border-b border-slate-100 p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-indigo-600" />
          <h3 className="text-lg font-bold text-slate-800">Carga de Aseguradoras</h3>
        </div>
        
        {/* BOTÓN DE DESCARGA DE MODELO */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={descargarPlantilla}
          className="bg-white border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold shadow-sm transition-all"
        >
          <Download className="h-4 w-4 mr-2" /> Descargar Modelo CSV
        </Button>
      </div>

      <CardContent className="p-6">
        <div className="mb-6 flex items-start gap-3 p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
          <Info className="h-5 w-5 text-blue-500 mt-0.5" />
          <p className="text-sm text-blue-800">
            Utiliza el modelo oficial para evitar errores de formato. El <span className="font-bold">RIF</span> es obligatorio; si ya existe en el sistema, la aseguradora será omitida para evitar duplicados.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-end bg-slate-50/30 p-4 rounded-lg border border-slate-100">
          <div className="flex-1 w-full space-y-2">
            <label className="text-sm font-medium text-slate-700">Archivo CSV seleccionado</label>
            <Input 
              type="file" 
              accept=".csv" 
              onChange={handleFileChange} 
              ref={fileInputRef} 
              className="bg-white border-slate-200 cursor-pointer" 
            />
          </div>
          <Button 
            onClick={handleImportSubmit} 
            disabled={isImporting || !file} 
            className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md transition-all active:scale-95"
          >
            {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />} 
            Iniciar Carga
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default EmpresaAseguradoraImport;