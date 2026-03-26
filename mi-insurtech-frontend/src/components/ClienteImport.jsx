// src/components/ClienteImport.jsx
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/lib/use-toast';
import { UploadCloud, FileSpreadsheet, Loader2, Download, Info } from 'lucide-react'; 

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
    // CRISTAL: Tarjeta principal
    <Card className="mb-8 bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-2xl overflow-hidden transition-all duration-300">
      
      {/* Cabecera Ciberpunk */}
      <div className="bg-gradient-to-r from-indigo-500/20 to-purple-600/20 border-b border-indigo-500/30 p-5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/40 backdrop-blur-md">
            <FileSpreadsheet className="h-5 w-5 text-indigo-400" />
          </div>
          <h3 className="text-lg font-black text-white drop-shadow-md tracking-wide">Carga Masiva</h3>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={descargarPlantilla}
          className="bg-transparent border-indigo-400/50 text-indigo-300 hover:bg-indigo-500/20 hover:text-white font-bold shadow-sm transition-all"
        >
          <Download className="h-4 w-4 mr-2" /> Descargar Modelo
        </Button>
      </div>

      <CardContent className="p-6">
        {/* Banner de Información */}
        <div className="mb-6 flex items-start gap-3 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl backdrop-blur-sm">
          <Info className="h-5 w-5 text-indigo-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-indigo-200">
            Descarga el modelo, rellena los datos de tus clientes y sube el archivo. 
            Recuerda que la <b className="text-white">identificación</b> no puede estar repetida.
          </p>
        </div>

        {/* Input de Archivo y Botón */}
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full relative group">
            <Input 
              type="file" 
              accept=".csv" 
              onChange={handleFileChange} 
              ref={fileInputRef} 
              className="text-white bg-black/20 border-white/10 file:bg-white/10 file:text-white file:border-0 file:rounded-md file:mr-4 file:px-4 file:py-2 hover:file:bg-white/20 transition-all focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 cursor-pointer h-12 pt-2" 
            />
          </div>
          <Button 
            onClick={handleImportSubmit} 
            disabled={isImporting || !file} 
            className="w-full md:w-auto h-12 px-6 bg-indigo-600/80 hover:bg-indigo-500 text-white font-black tracking-wide border border-indigo-500/50 shadow-[0_0_15px_rgba(79,70,229,0.5)] transition-all active:scale-95 disabled:opacity-50 disabled:shadow-none"
          >
            {isImporting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <UploadCloud className="mr-2 h-5 w-5" />} 
            Subir Archivo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default ClienteImport;