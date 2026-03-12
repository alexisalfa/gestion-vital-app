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

  return (
    <Card className="mb-8 border-none shadow-xl rounded-xl overflow-hidden">
      <div className={`p-6 ${editingReclamacion ? 'bg-gradient-to-r from-orange-500 to-red-600' : 'bg-gradient-to-r from-red-600 to-rose-700'} text-white flex justify-between items-center`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm"><AlertCircle className="h-6 w-6" /></div>
          <div>
            <h2 className="text-xl font-bold">{editingReclamacion ? 'Editando Siniestro' : 'Reportar Nuevo Siniestro'}</h2>
            <p className="text-red-100 text-sm opacity-90">Gestión de reclamaciones y pagos.</p>
          </div>
        </div>
        {editingReclamacion && <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full" onClick={() => setEditingReclamacion(null)}><X className="h-5 w-5" /></Button>}
      </div>

      <CardContent className="p-6 bg-white">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="md:col-span-2 lg:col-span-3 space-y-2">
            <Label className="text-gray-600 font-semibold flex items-center gap-2"><FileText className="h-4 w-4"/> Descripción Detallada del Evento</Label>
            <Input name="descripcion" value={reclamacion.descripcion} onChange={handleChange} required placeholder="Ej: Choque simple en Av. Principal..." className="bg-gray-50" />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-600 font-semibold flex items-center gap-2"><Calendar className="h-4 w-4"/> Fecha del Siniestro</Label>
            <Input name="fecha_siniestro" type="date" value={reclamacion.fecha_siniestro} onChange={handleChange} required className="bg-gray-50" />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-600 font-semibold flex items-center gap-2"><Calendar className="h-4 w-4"/> Fecha de Reporte</Label>
            <Input name="fecha_reclamacion" type="date" value={reclamacion.fecha_reclamacion} onChange={handleChange} required className="bg-gray-50" />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-600 font-semibold flex items-center gap-2"><DollarSign className="h-4 w-4"/> Monto Reclamado</Label>
            <Input name="monto_reclamado" type="number" step="0.01" value={reclamacion.monto_reclamado} onChange={handleChange} required placeholder="0.00" className="bg-gray-50 font-bold text-red-600" />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-600 font-semibold flex items-center gap-2"><User className="h-4 w-4"/> Cliente Afectado</Label>
            <HeadlessSafeSelect label="Seleccione Cliente" value={reclamacion.cliente_id} onChange={(v) => handleSelectChange('cliente_id', v)} options={clienteOptions} loading={isLoadingClients} className="bg-gray-50" />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-600 font-semibold flex items-center gap-2"><ShieldCheck className="h-4 w-4"/> Póliza Vinculada</Label>
            <HeadlessSafeSelect label="Seleccione Póliza" value={reclamacion.poliza_id} onChange={(v) => handleSelectChange('poliza_id', v)} options={polizasDelCliente} loading={isLoadingPolicies} disabled={!reclamacion.cliente_id} className="bg-gray-50" />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-600 font-semibold flex items-center gap-2"><AlertCircle className="h-4 w-4"/> Estado Trámite</Label>
            <HeadlessSafeSelect value={reclamacion.estado_reclamacion} onChange={(v) => handleSelectChange('estado_reclamacion', v)} options={[{id: 'Pendiente', nombre: 'Pendiente'}, {id: 'En Proceso', nombre: 'En Proceso'}, {id: 'Pagada', nombre: 'Pagada'}, {id: 'Rechazada', nombre: 'Rechazada'}]} className="bg-gray-50" />
          </div>

          <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-4 pt-4 border-t">
            <Button type="submit" disabled={isSubmitting} className="bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg">
              {isSubmitting ? 'Guardando...' : <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4"/> {editingReclamacion ? 'Actualizar Siniestro' : 'Registrar Siniestro'}</span>}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
export default ReclamacionForm;