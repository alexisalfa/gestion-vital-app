// src/components/PolizaForm.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/lib/use-toast';
import { HeadlessSafeSelect } from './HeadlessSafeSelect';
import { Shield, FileText, Tag, Calendar, DollarSign, Activity, CheckCircle2, X, AlertCircle } from 'lucide-react';

const formatDateToInput = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};

function PolizaForm({ onPolizaSaved, editingPoliza, setEditingPoliza, apiBaseUrl, clientes = [], empresasAseguradoras = [], asesores = [], isLoadingClients, isLoadingCompanies, isLoadingAdvisors }) {
  const { toast } = useToast();

  const initialPolizaState = { numero_poliza: '', tipo_poliza: '', fecha_inicio: '', fecha_fin: '', prima: '', suma_asegurada: '', deducible: '', estado: 'Activa', cliente_id: '', empresa_aseguradora_id: '', asesor_id: '' };
  const [poliza, setPoliza] = useState(initialPolizaState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingPoliza) {
      setPoliza({
        ...editingPoliza,
        fecha_inicio: formatDateToInput(editingPoliza.fecha_inicio),
        fecha_fin: formatDateToInput(editingPoliza.fecha_fin),
        empresa_aseguradora_id: editingPoliza.empresa_aseguradora_id || editingPoliza.empresa_id || '',
      });
    } else {
      setPoliza(initialPolizaState);
    }
  }, [editingPoliza]);

  const handleChange = (e) => setPoliza((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSelectChange = (name, value) => setPoliza((prev) => ({ ...prev, [name]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formattedPoliza = {
      numero_poliza: poliza.numero_poliza.toUpperCase().trim(),
      tipo_poliza: poliza.tipo_poliza,
      estado: poliza.estado,
      prima: poliza.prima ? parseFloat(poliza.prima) : null,
      suma_asegurada: poliza.suma_asegurada ? parseFloat(poliza.suma_asegurada) : 0,
      deducible: poliza.deducible ? parseFloat(poliza.deducible) : 0,
      fecha_inicio: poliza.fecha_inicio || null,
      fecha_fin: poliza.fecha_fin || null,
      cliente_id: poliza.cliente_id ? parseInt(poliza.cliente_id, 10) : null,
      empresa_id: poliza.empresa_aseguradora_id ? parseInt(poliza.empresa_aseguradora_id, 10) : null,
      asesor_id: poliza.asesor_id ? parseInt(poliza.asesor_id, 10) : null,
    };

    try {
      const token = localStorage.getItem('access_token');
      const method = editingPoliza ? 'PUT' : 'POST';
      const url = editingPoliza ? `${apiBaseUrl}/polizas/${editingPoliza.id}` : `${apiBaseUrl}/polizas`;

      const response = await fetch(url, {
        method, 
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, 
        body: JSON.stringify(formattedPoliza),
      });

      if (!response.ok) {
        const errorData = await response.json();
        let errorMessage = "Ocurrió un error al procesar la póliza.";

        const detailStr = JSON.stringify(errorData.detail || "");
        if (detailStr.includes("UniqueViolation") || detailStr.includes("already exists") || detailStr.includes("duplicada")) {
          errorMessage = `El número de póliza "${poliza.numero_poliza}" ya está registrado. Por favor, asigne un número diferente.`;
        } else if (errorData.detail && Array.isArray(errorData.detail)) {
          errorMessage = errorData.detail.map(err => `${err.loc[err.loc.length - 1]}: ${err.msg}`).join(' | ');
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        }
        throw new Error(errorMessage);
      }

      toast({ 
        title: "¡Éxito!", 
        description: `Póliza ${editingPoliza ? 'actualizada' : 'emitida'} correctamente.`, 
        variant: "success" 
      });
      
      onPolizaSaved();
      setPoliza(initialPolizaState);
      setEditingPoliza(null);

    } catch (error) {
      toast({ 
        title: "Validación de Registro", 
        description: error.message, 
        variant: "warning" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const tipoPolizaOptions = [
    { id: 'Salud / HCM', nombre: 'Salud / HCM' },
    { id: 'Vida', nombre: 'Vida' },
    { id: 'Automotriz', nombre: 'Automotriz' },
    { id: 'Patrimonial / Incendio', nombre: 'Patrimonial / Incendio' },
    { id: 'Fianzas', nombre: 'Fianzas' },
    { id: 'Responsabilidad Civil', nombre: 'Responsabilidad Civil' },
    { id: 'Otros', nombre: 'Otros' }
  ];

  const clienteOptions = useMemo(() => clientes.map(c => ({ id: c.id, nombre: `${c.nombre} ${c.apellido || ''}`.trim() })), [clientes]);
  const empresaOptions = useMemo(() => empresasAseguradoras.map(e => ({ id: e.id, nombre: e.nombre })), [empresasAseguradoras]);
  const asesorOptions = useMemo(() => asesores.map(a => ({ id: a.id, nombre: `${a.nombre} ${a.apellido || ''}`.trim() })), [asesores]);

  return (
    <Card className="mb-8 border-none shadow-xl rounded-xl overflow-hidden">
      <div className={`p-6 ${editingPoliza ? 'bg-gradient-to-r from-amber-500 to-orange-600' : 'bg-gradient-to-r from-indigo-600 to-violet-700'} text-white flex justify-between items-center`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm"><Shield className="h-6 w-6" /></div>
          <div>
            <h2 className="text-xl font-bold">{editingPoliza ? 'Editando Póliza' : 'Emitir Nueva Póliza'}</h2>
            <p className="text-indigo-100 text-sm opacity-90">{editingPoliza ? `Modificando ${poliza.numero_poliza}` : 'Complete los datos para el nuevo contrato.'}</p>
          </div>
        </div>
        {editingPoliza && <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full" onClick={() => setEditingPoliza(null)}><X className="h-5 w-5" /></Button>}
      </div>

      <CardContent className="p-6 bg-white">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6">
          <div className="space-y-2 relative">
            <Label className="text-gray-600 font-semibold">N° de Póliza</Label>
            <div className="relative">
              <FileText className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input name="numero_poliza" value={poliza.numero_poliza} onChange={handleChange} required placeholder="EJ: POL-100" className="pl-10 bg-gray-50 uppercase" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-gray-600 font-semibold flex items-center gap-2"><Tag className="h-4 w-4 text-gray-400"/> Tipo de Póliza</Label>
            <HeadlessSafeSelect id="tipo_poliza" label="Tipo" value={poliza.tipo_poliza} onChange={(v) => handleSelectChange('tipo_poliza', v)} options={tipoPolizaOptions} className="bg-gray-50" />
          </div>

          <div className="space-y-2 relative">
            <Label className="text-gray-600 font-semibold">Prima Anual</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input name="prima" type="number" step="0.01" value={poliza.prima} onChange={handleChange} required placeholder="0.00" className="pl-10 bg-gray-50" />
            </div>
          </div>

          {/* INJERTO DE COBERTURA FINANCIERA */}
          <div className="space-y-2 relative">
            <Label className="text-emerald-700 font-bold">Suma Asegurada</Label>
            <div className="relative">
              <Shield className="absolute left-3 top-2.5 h-4 w-4 text-emerald-500" />
              <Input name="suma_asegurada" type="number" step="0.01" value={poliza.suma_asegurada} onChange={handleChange} placeholder="0.00" className="pl-10 bg-emerald-50/50 font-bold text-emerald-700 border-emerald-200 focus:ring-emerald-500" />
            </div>
          </div>
          
          <div className="space-y-2 relative">
            <Label className="text-rose-700 font-bold">Deducible</Label>
            <div className="relative">
              <AlertCircle className="absolute left-3 top-2.5 h-4 w-4 text-rose-500" />
              <Input name="deducible" type="number" step="0.01" value={poliza.deducible} onChange={handleChange} placeholder="0.00" className="pl-10 bg-rose-50/50 font-bold text-rose-700 border-rose-200 focus:ring-rose-500" />
            </div>
          </div>
          {/* FIN INJERTO */}
          
          <div className="space-y-2 relative">
            <Label className="text-gray-600 font-semibold">Fecha Inicio</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input name="fecha_inicio" type="date" value={poliza.fecha_inicio} onChange={handleChange} required className="pl-10 bg-gray-50" />
            </div>
          </div>
          
          <div className="space-y-2 relative">
            <Label className="text-gray-600 font-semibold">Vencimiento</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input name="fecha_fin" type="date" value={poliza.fecha_fin} onChange={handleChange} required className="pl-10 bg-gray-50" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-gray-600 font-semibold flex items-center gap-2"><Activity className="h-4 w-4 text-gray-400"/> Estado</Label>
            <HeadlessSafeSelect id="estado" label="Estado" value={poliza.estado} onChange={(v) => handleSelectChange('estado', v)} options={[{id: 'Activa', nombre: 'Activa'}, {id: 'Inactiva', nombre: 'Inactiva'}, {id: 'Vencida', nombre: 'Vencida'}, {id: 'Pendiente', nombre: 'Pendiente de Pago'}]} className="bg-gray-50" />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-600 font-semibold">Titular del Seguro</Label>
            <HeadlessSafeSelect id="cliente_id" label="Cliente" value={poliza.cliente_id} onChange={(v) => handleSelectChange('cliente_id', v)} options={clienteOptions} loading={isLoadingClients} className="bg-gray-50" />
          </div>
          
          <div className="space-y-2">
            <Label className="text-gray-600 font-semibold">Compañía Aseguradora</Label>
            <HeadlessSafeSelect id="empresa_aseguradora_id" label="Empresa" value={poliza.empresa_aseguradora_id} onChange={(v) => handleSelectChange('empresa_aseguradora_id', v)} options={empresaOptions} loading={isLoadingCompanies} className="bg-gray-50" />
          </div>
          
          <div className="space-y-2">
            <Label className="text-gray-600 font-semibold">Asesor Responsable</Label>
            <HeadlessSafeSelect id="asesor_id" label="Asesor" value={poliza.asesor_id} onChange={(v) => handleSelectChange('asesor_id', v)} options={asesorOptions} loading={isLoadingAdvisors} className="bg-gray-50" />
          </div>

          <div className="md:col-span-2 lg:col-span-3 flex justify-end space-x-4 mt-4 pt-4 border-t border-gray-100">
            {editingPoliza && <Button type="button" variant="outline" onClick={() => setEditingPoliza(null)}>Descartar Cambios</Button>}
            <Button type="submit" disabled={isSubmitting} className={`shadow-lg text-white font-bold transition-all active:scale-95 ${editingPoliza ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
              {isSubmitting ? 'Guardando...' : <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> {editingPoliza ? 'Actualizar Contrato' : 'Emitir Póliza'}</span>}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default PolizaForm;