// src/components/ReclamacionForm.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/lib/use-toast';
import { HeadlessSafeSelect } from './HeadlessSafeSelect';
import { AlertCircle, Calendar, DollarSign, FileText, User, ShieldCheck, CheckCircle2, X } from 'lucide-react';

const formatDateToInput = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};

function ReclamacionForm({ onReclamacionSaved, editingReclamacion, setEditingReclamacion, apiBaseUrl, polizas = [], clientes = [], isLoadingPolicies, isLoadingClients }) {
  const { toast } = useToast();

  const initialReclamacionState = { descripcion: '', fecha_siniestro: '', fecha_reclamacion: '', monto_reclamado: '', monto_aprobado: '0', estado_reclamacion: 'Pendiente', poliza_id: '', cliente_id: '' };
  const [reclamacion, setReclamacion] = useState(initialReclamacionState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingReclamacion) {
      setReclamacion({
        ...editingReclamacion,
        fecha_siniestro: formatDateToInput(editingReclamacion.fecha_siniestro),
        fecha_reclamacion: formatDateToInput(editingReclamacion.fecha_reclamacion),
        poliza_id: editingReclamacion.poliza_id?.toString() || '',
        cliente_id: editingReclamacion.cliente_id?.toString() || '',
      });
    } else {
      setReclamacion(initialReclamacionState);
    }
  }, [editingReclamacion]);

  const handleChange = (e) => setReclamacion((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSelectChange = (name, value) => {
    setReclamacion((prev) => (name === 'cliente_id' ? { ...prev, [name]: value, poliza_id: '' } : { ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formattedData = {
      ...reclamacion,
      monto_reclamado: parseFloat(reclamacion.monto_reclamado),
      monto_aprobado: parseFloat(reclamacion.monto_aprobado || 0),
      fecha_siniestro: reclamacion.fecha_siniestro || null,
      fecha_reclamacion: reclamacion.fecha_reclamacion || null,
      poliza_id: parseInt(reclamacion.poliza_id, 10),
      cliente_id: parseInt(reclamacion.cliente_id, 10),
    };

    try {
      const token = localStorage.getItem('access_token');
      const method = editingReclamacion ? 'PUT' : 'POST';
      const url = editingReclamacion ? `${apiBaseUrl}/reclamaciones/${editingReclamacion.id}` : `${apiBaseUrl}/reclamaciones/`;

      const response = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) throw new Error('Error al procesar la reclamación');

      toast({ title: "Éxito", description: "Reclamación guardada correctamente.", variant: "success" });
      onReclamacionSaved();
      setReclamacion(initialReclamacionState);
      setEditingReclamacion(null);
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const polizasDelCliente = useMemo(() => {
    if (!reclamacion.cliente_id) return [];
    return polizas.filter(p => p.cliente_id.toString() === reclamacion.cliente_id).map(p => ({ id: p.id, nombre: `N° ${p.numero_poliza} - ${p.tipo_poliza}` }));
  }, [polizas, reclamacion.cliente_id]);

  const clienteOptions = useMemo(() => clientes.map(c => ({ id: c.id, nombre: `${c.nombre} ${c.apellido} (${c.identificacion})` })), [clientes]);

  // Estilos del selector para adaptarlos al modo oscuro
  const selectStylesClass = "[&_button]:!bg-black/20 [&_button]:!border-white/10 [&_button]:!text-white hover:[&_button]:!border-red-400 focus:[&_button]:!ring-red-400 [&_div[role='listbox']]:!bg-slate-800 [&_div[role='listbox']]:!border-white/10 [&_li]:!text-slate-200 hover:[&_li]:!bg-red-500/20 hover:[&_li]:!text-red-300";

  return (
    <Card className="mb-8 bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-2xl overflow-hidden transition-all duration-300">
      
      {/* Cabecera Ciberpunk Roja */}
      <div className={`p-6 ${editingReclamacion ? 'bg-gradient-to-r from-amber-500/20 to-orange-600/20 border-b border-amber-500/30' : 'bg-gradient-to-r from-red-600/20 to-rose-700/20 border-b border-red-500/30'} flex justify-between items-center`}>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl backdrop-blur-md border ${editingReclamacion ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'bg-red-500/20 border-red-500/40 text-red-400'}`}>
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white drop-shadow-md">{editingReclamacion ? 'Editando Siniestro' : 'Reportar Nuevo Siniestro'}</h2>
            <p className="text-slate-300 text-sm font-medium mt-0.5">Gestión de emergencias, reclamaciones y pagos.</p>
          </div>
        </div>
        {editingReclamacion && <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-colors" onClick={() => setEditingReclamacion(null)}><X className="h-5 w-5" /></Button>}
      </div>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
          
          <div className="md:col-span-2 lg:col-span-3 space-y-2 relative">
            <Label className="text-slate-300 font-bold text-xs uppercase tracking-wider">Descripción Detallada del Evento</Label>
            <div className="relative group">
              <FileText className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 group-focus-within:text-red-400 transition-colors" />
              <Input name="descripcion" value={reclamacion.descripcion} onChange={handleChange} required placeholder="Ej: Choque simple en Av. Principal..." className="pl-10 text-white bg-black/20 border-white/10 focus:bg-black/40 focus:border-red-400 focus:ring-1 focus:ring-red-400 placeholder:text-slate-600 transition-all" />
            </div>
          </div>

          <div className="space-y-2 relative">
            <Label className="text-slate-300 font-bold text-xs uppercase tracking-wider">Fecha del Siniestro</Label>
            <div className="relative group">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 group-focus-within:text-red-400 transition-colors" />
              <Input name="fecha_siniestro" type="date" value={reclamacion.fecha_siniestro} onChange={handleChange} required className="pl-10 text-white bg-black/20 border-white/10 focus:bg-black/40 focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-all [&::-webkit-calendar-picker-indicator]:invert" />
            </div>
          </div>

          <div className="space-y-2 relative">
            <Label className="text-slate-300 font-bold text-xs uppercase tracking-wider">Fecha de Reporte</Label>
            <div className="relative group">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 group-focus-within:text-red-400 transition-colors" />
              <Input name="fecha_reclamacion" type="date" value={reclamacion.fecha_reclamacion} onChange={handleChange} required className="pl-10 text-white bg-black/20 border-white/10 focus:bg-black/40 focus:border-red-400 focus:ring-1 focus:ring-red-400 transition-all [&::-webkit-calendar-picker-indicator]:invert" />
            </div>
          </div>

          <div className="space-y-2 relative">
            <Label className="text-rose-400 font-bold text-xs uppercase tracking-wider">Monto Reclamado</Label>
            <div className="relative group">
              <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-rose-500" />
              <Input name="monto_reclamado" type="number" step="0.01" value={reclamacion.monto_reclamado} onChange={handleChange} required placeholder="0.00" className="pl-10 bg-rose-500/10 font-bold text-rose-400 border-rose-500/30 focus:border-rose-400 focus:ring-1 focus:ring-rose-400 transition-all placeholder:text-rose-700/50" />
            </div>
          </div>

          <div className="space-y-2 relative group">
            <Label className="text-slate-300 font-bold text-xs uppercase tracking-wider flex items-center gap-2 mb-2"><User className="h-4 w-4 text-slate-500 group-focus-within:text-red-400 transition-colors"/> Cliente Afectado</Label>
            <div className={selectStylesClass}>
              <HeadlessSafeSelect label="Seleccione Cliente" value={reclamacion.cliente_id} onChange={(v) => handleSelectChange('cliente_id', v)} options={clienteOptions} loading={isLoadingClients} />
            </div>
          </div>

          <div className="space-y-2 relative group">
            <Label className="text-slate-300 font-bold text-xs uppercase tracking-wider flex items-center gap-2 mb-2"><ShieldCheck className="h-4 w-4 text-slate-500 group-focus-within:text-red-400 transition-colors"/> Póliza Vinculada</Label>
            <div className={selectStylesClass}>
              <HeadlessSafeSelect label="Seleccione Póliza" value={reclamacion.poliza_id} onChange={(v) => handleSelectChange('poliza_id', v)} options={polizasDelCliente} loading={isLoadingPolicies} disabled={!reclamacion.cliente_id} />
            </div>
          </div>

          <div className="space-y-2 relative group">
            <Label className="text-slate-300 font-bold text-xs uppercase tracking-wider flex items-center gap-2 mb-2"><AlertCircle className="h-4 w-4 text-slate-500 group-focus-within:text-red-400 transition-colors"/> Estado Trámite</Label>
            <div className={selectStylesClass}>
              <HeadlessSafeSelect value={reclamacion.estado_reclamacion} onChange={(v) => handleSelectChange('estado_reclamacion', v)} options={[{id: 'Pendiente', nombre: 'Pendiente'}, {id: 'En Proceso', nombre: 'En Proceso'}, {id: 'Pagada', nombre: 'Pagada'}, {id: 'Rechazada', nombre: 'Rechazada'}]} />
            </div>
          </div>

          <div className="md:col-span-2 lg:col-span-3 flex justify-end space-x-4 mt-4 pt-6 border-t border-white/10">
            {editingReclamacion && <Button type="button" variant="outline" className="text-slate-300 border-white/20 bg-transparent hover:bg-white/10 hover:text-white transition-all" onClick={() => setEditingReclamacion(null)}>Descartar Cambios</Button>}
            <Button type="submit" disabled={isSubmitting} className={`shadow-lg font-black tracking-wide border transition-all active:scale-95 ${editingReclamacion ? 'bg-amber-600/80 hover:bg-amber-500 border-amber-500/50 text-white shadow-[0_0_15px_rgba(217,119,6,0.5)]' : 'bg-red-600/80 hover:bg-red-500 border-red-500/50 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]'}`}>
              {isSubmitting ? 'Guardando...' : <span className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5"/> {editingReclamacion ? 'Actualizar Siniestro' : 'Registrar Siniestro'}</span>}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
export default ReclamacionForm;