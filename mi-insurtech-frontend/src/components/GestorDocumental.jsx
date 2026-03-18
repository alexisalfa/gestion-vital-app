// src/components/GestorDocumental.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/lib/use-toast';
import { UploadCloud, Loader2, FileText, ExternalLink, FileIcon, ShieldAlert } from 'lucide-react';
import { HeadlessSafeSelect } from './HeadlessSafeSelect';

export default function GestorDocumental({ clienteId, polizaId, apiBaseUrl = 'https://gestion-vital-app.onrender.com/api/v1' }) {
  const { toast } = useToast();
  const [documentos, setDocumentos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Estados del formulario
  const [file, setFile] = useState(null);
  const [nombreDoc, setNombreDoc] = useState('');
  const [tipoDoc, setTipoDoc] = useState('poliza');
  const fileInputRef = useRef(null);

  // Cargar documentos al iniciar
  useEffect(() => {
    if (clienteId) {
      fetchDocumentos();
    }
  }, [clienteId]);

  const fetchDocumentos = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${apiBaseUrl}/documentos/cliente/${clienteId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setDocumentos(data);
      }
    } catch (error) {
      console.error("Error cargando documentos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !nombreDoc) {
      toast({ title: "Datos incompletos", description: "Agrega un archivo y un nombre.", variant: "warning" });
      return;
    }

    setIsUploading(true);
    const token = localStorage.getItem('access_token');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('nombre', nombreDoc);
    formData.append('tipo', tipoDoc);
    if (clienteId) formData.append('cliente_id', clienteId);
    if (polizaId) formData.append('poliza_id', polizaId);

    try {
      const response = await fetch(`${apiBaseUrl}/documentos/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        toast({ title: "Archivo Subido", description: "El documento se guardó en la nube exitosamente.", variant: "success" });
        setFile(null);
        setNombreDoc('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchDocumentos(); // Recargar la lista
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error al subir el archivo");
      }
    } catch (error) {
      toast({ title: "Error de carga", description: error.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (tipo) => {
    switch (tipo) {
      case 'poliza': return <ShieldAlert className="h-5 w-5 text-indigo-500" />;
      case 'identidad': return <FileText className="h-5 w-5 text-emerald-500" />;
      default: return <FileIcon className="h-5 w-5 text-slate-500" />;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-100 p-4">
        <h3 className="font-bold text-slate-800 flex items-center gap-2">
          <UploadCloud className="h-5 w-5 text-indigo-600" />
          Gestor Documental (Cloud)
        </h3>
      </div>

      <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ZONA DE SUBIDA */}
        <div className="lg:col-span-1 bg-slate-50 p-4 rounded-xl border border-slate-200 border-dashed">
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Nombre del Archivo</label>
              <Input value={nombreDoc} onChange={e => setNombreDoc(e.target.value)} placeholder="Ej: Carnet de Circulación" className="bg-white" required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Categoría</label>
              <HeadlessSafeSelect 
                value={tipoDoc} 
                onChange={setTipoDoc} 
                options={[{id: 'poliza', nombre: 'Póliza / Cuadro'}, {id: 'identidad', nombre: 'Documento de Identidad'}, {id: 'recibo', nombre: 'Recibo de Pago'}, {id: 'otro', nombre: 'Otro'}]}
                className="bg-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Archivo (PDF, JPG, PNG)</label>
              <Input type="file" onChange={e => setFile(e.target.files[0])} ref={fileInputRef} className="bg-white text-sm cursor-pointer" required />
            </div>
            <Button type="submit" disabled={isUploading || !file} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UploadCloud className="h-4 w-4 mr-2" />}
              {isUploading ? 'Subiendo a la nube...' : 'Subir Documento'}
            </Button>
          </form>
        </div>

        {/* LISTADO DE ARCHIVOS */}
        <div className="lg:col-span-2">
          <h4 className="text-sm font-bold text-slate-600 mb-3 uppercase tracking-wider">Archivos Vinculados</h4>
          {isLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-indigo-600" /></div>
          ) : documentos.length === 0 ? (
            <div className="text-center p-8 bg-slate-50 rounded-xl border border-slate-100">
              <FileIcon className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500 font-medium">No hay documentos en el expediente de este cliente.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {documentos.map(doc => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:border-indigo-300 hover:shadow-sm transition-all group">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-indigo-50 transition-colors">
                      {getFileIcon(doc.tipo)}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-slate-700 truncate" title={doc.nombre}>{doc.nombre}</p>
                      <p className="text-xs text-slate-400 capitalize">{doc.tipo} • {new Date(doc.fecha_subida).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-indigo-600 hover:bg-indigo-100 rounded-full flex-shrink-0" onClick={() => window.open(doc.url_archivo, '_blank')}>
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}