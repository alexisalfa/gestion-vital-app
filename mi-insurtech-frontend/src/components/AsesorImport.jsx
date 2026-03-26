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
    const headers = ["nombre", "apellido", "cedula", "email", "telefono", "empresa_aseguradora_id"].join(",");
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
    <Card className="mb-8 bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-2xl overflow-hidden transition-all duration-300">
      
      {/* Cabecera Ciberpunk Esmeralda */}
      <div className="bg-gradient-to-r from-emerald-500/20 to-teal-600/20 border-b border-emerald-500/30 p-5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 backdrop-blur-md">
            <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
          </div>
          <h3 className="text-lg font-black text-white drop-shadow-md tracking-wide">Gestión de Fuerza de Ventas</h3>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={descargarPlantilla}
          className="bg-transparent border-emerald-400/50 text-emerald-300 hover:bg-emerald-500/20 hover:text-white font-bold shadow-sm transition-all"
        >
          <Download className="h-4 w-4 mr-2" /> Descargar Modelo
        </Button>
      </div>

      <CardContent className="p-6">
        <div className="mb-6 flex items-start gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl backdrop-blur-sm">
          <Info className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-emerald-200">
            Utiliza el modelo oficial para registrar nuevos asesores. La <b className="text-white">cédula</b> es el campo de identidad; si ya existe, el registro se omitirá para evitar duplicados.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full space-y-2">
            <label className="text-slate-300 font-bold text-xs uppercase tracking-wider">Archivo CSV de Asesores</label>
            <Input 
              type="file" 
              accept=".csv" 
              onChange={handleFileChange} 
              ref={fileInputRef} 
              className="text-white bg-black/20 border-white/10 file:bg-white/10 file:text-white file:border-0 file:rounded-md file:mr-4 file:px-4 file:py-2 hover:file:bg-white/20 transition-all focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 cursor-pointer h-12 pt-2" 
            />
          </div>
          <Button 
            onClick={handleImportSubmit} 
            disabled={isImporting || !file} 
            className="w-full md:w-auto h-12 px-6 bg-emerald-600/80 hover:bg-emerald-500 text-white font-black tracking-wide border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all active:scale-95 disabled:opacity-50 disabled:shadow-none"
          >
            {isImporting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <UploadCloud className="mr-2 h-5 w-5" />} 
            Iniciar Carga
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default AsesorImport;