// src/components/ClienteImport.jsx
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/lib/use-toast';
import { UploadCloud, FileSpreadsheet, Loader2, Download, Info } from 'lucide-react'; // Corregido: Info con Mayúscula

function ClienteImport({ apiBaseUrl, onImportComplete }) {
  const { toast } = useToast();
  const [file, setFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);

  // --- FUNCIÓN PARA DESCARGAR LA PLANTILLA MODELO ---
  const descargarPlantilla = () => {
    // Definimos los encabezados exactos que el backend espera
    const headers = ["nombre", "apellido", "identificacion", "email", "telefono", "direccion"].join(",");
    
    // Fila de ejemplo con datos realistas
    const ejemplo = ["Juan", "Perez", "V12345678", "juan.perez@email.com", "04121234567", "Valencia, Carabobo"].join(",");
    
    // Añadimos el BOM (\ufeff) para que Excel reconozca los acentos automáticamente
    const csvContent = "\ufeff" + headers + "\n" + ejemplo;
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "modelo_importar_clientes.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({ title: "Plantilla descargada", description: "Completa los datos en el archivo y súbelo." });
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
      const response = await fetch(`${apiBaseUrl}/clientes/importar`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (response.ok) {
        toast({ title: "Importación Exitosa", description: "Los clientes se cargaron correctamente.", variant: "success" });
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (onImportComplete) onImportComplete();
      } else {
        const err = await response.json();
        throw new Error(err.detail || "Error al procesar el archivo CSV");
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
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-indigo-600" />
          <h3 className="text-lg font-bold text-indigo-900">Carga Masiva</h3>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={descargarPlantilla}
          className="bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-100 font-semibold shadow-sm"
        >
          <Download className="h-4 w-4 mr-2" /> Descargar Modelo
        </Button>
      </div>

      <CardContent className="p-6">
        <div className="mb-6 flex items-start gap-3 p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
          <Info className="h-5 w-5 text-blue-500 mt-0.5" />
          <p className="text-sm text-blue-800">
            Descarga el modelo, rellena los datos de tus clientes y sube el archivo. 
            Recuerda que la <b>identificación</b> no puede estar repetida.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
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
            className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all active:scale-95"
          >
            {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />} 
            Subir Archivo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default ClienteImport;