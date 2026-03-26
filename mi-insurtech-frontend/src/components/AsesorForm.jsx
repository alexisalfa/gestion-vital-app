// src/components/AsesorForm.jsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/lib/use-toast';
import { HeadlessSafeSelect } from './HeadlessSafeSelect';
import { UserCheck, User, Mail, Phone, CreditCard, Building, CheckCircle2, X } from 'lucide-react';

const sanitizeValue = (value) => {
  if (value === null || value === undefined || value === 0 || value === '') return '';
  return String(value);
};

function AsesorForm({ onAsesorSaved, editingAsesor, setEditingAsesor, apiBaseUrl, empresasAseguradoras = [], isLoadingCompanies }) {
  const { toast } = useToast();

  const initialAsesorState = { nombre: '', apellido: '', email: '', telefono: '', cedula: '', empresa_aseguradora_id: '' };
  const [asesor, setAsesor] = useState(initialAsesorState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingAsesor) {
      setAsesor({ ...editingAsesor, empresa_aseguradora_id: sanitizeValue(editingAsesor.empresa_aseguradora_id) });
    } else {
      setAsesor(initialAsesorState);
    }
  }, [editingAsesor]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAsesor(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setAsesor(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const token = localStorage.getItem('access_token');

    const dataToSend = {
      ...asesor,
      empresa_aseguradora_id: asesor.empresa_aseguradora_id === '' ? null : parseInt(asesor.empresa_aseguradora_id, 10),
    };

    try {
      const method = editingAsesor ? 'PUT' : 'POST';
      const url = editingAsesor ? `${apiBaseUrl}/asesores/${editingAsesor.id}` : `${apiBaseUrl}/asesores`;

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) throw new Error("Error al guardar el asesor.");

      setAsesor(initialAsesorState);
      onAsesorSaved();
      toast({ title: "Éxito", description: `Perfil de asesor ${editingAsesor ? 'actualizado' : 'creado'}.`, variant: "success" });
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mb-8 bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-2xl overflow-hidden transition-all duration-300">
      {/* Cabecera Esmeralda Premium / Ciberpunk */}
      <div className={`p-6 ${editingAsesor ? 'bg-gradient-to-r from-amber-500/20 to-orange-600/20 border-b border-amber-500/30' : 'bg-gradient-to-r from-emerald-500/20 to-teal-600/20 border-b border-emerald-500/30'} flex justify-between items-center`}>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl backdrop-blur-md border ${editingAsesor ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'}`}>
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white drop-shadow-md">{editingAsesor ? 'Editando Asesor' : 'Registrar Nuevo Asesor'}</h2>
            <p className="text-slate-300 text-sm font-medium mt-0.5">
              {editingAsesor ? `Modificando datos de ${asesor.nombre}` : 'Añade un intermediario a tu fuerza de ventas.'}
            </p>
          </div>
        </div>
        {editingAsesor && (
          <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-colors" onClick={() => setEditingAsesor(null)}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          
          <div className="space-y-2 relative">
            <Label className="text-slate-300 font-bold text-xs uppercase tracking-wider">Nombres</Label>
            <div className="relative group">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
              <Input name="nombre" value={asesor.nombre} onChange={handleChange} required className="pl-10 text-white bg-black/20 border-white/10 focus:bg-black/40 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 placeholder:text-slate-600 transition-all" />
            </div>
          </div>
          
          <div className="space-y-2 relative">
            <Label className="text-slate-300 font-bold text-xs uppercase tracking-wider">Apellidos</Label>
            <div className="relative group">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
              <Input name="apellido" value={asesor.apellido} onChange={handleChange} required className="pl-10 text-white bg-black/20 border-white/10 focus:bg-black/40 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 placeholder:text-slate-600 transition-all" />
            </div>
          </div>
          
          <div className="space-y-2 relative">
            <Label className="text-slate-300 font-bold text-xs uppercase tracking-wider">Cédula</Label>
            <div className="relative group">
              <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
              <Input name="cedula" value={asesor.cedula} onChange={handleChange} required className="pl-10 uppercase text-white bg-black/20 border-white/10 focus:bg-black/40 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 placeholder:text-slate-600 transition-all" />
            </div>
          </div>
          
          <div className="space-y-2 relative">
            <Label className="text-slate-300 font-bold text-xs uppercase tracking-wider">Teléfono</Label>
            <div className="relative group">
              <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
              <Input name="telefono" type="tel" value={asesor.telefono} onChange={handleChange} required className="pl-10 text-white bg-black/20 border-white/10 focus:bg-black/40 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 placeholder:text-slate-600 transition-all" />
            </div>
          </div>
          
          <div className="space-y-2 relative">
            <Label className="text-slate-300 font-bold text-xs uppercase tracking-wider">Email</Label>
            <div className="relative group">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
              <Input name="email" type="email" value={asesor.email} onChange={handleChange} required className="pl-10 lowercase text-white bg-black/20 border-white/10 focus:bg-black/40 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 placeholder:text-slate-600 transition-all" />
            </div>
          </div>
          
          <div className="space-y-2 relative group">
            <Label className="text-slate-300 font-bold text-xs uppercase tracking-wider flex items-center gap-2 mb-2">
              <Building className="h-4 w-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors"/> 
              Empresa Aseguradora Vinculada
            </Label>
            <div className="[&_button]:!bg-black/20 [&_button]:!border-white/10 [&_button]:!text-white hover:[&_button]:!border-emerald-400 focus:[&_button]:!ring-emerald-400 [&_div[role='listbox']]:!bg-slate-800 [&_div[role='listbox']]:!border-white/10 [&_li]:!text-slate-200 hover:[&_li]:!bg-emerald-500/20 hover:[&_li]:!text-emerald-300">
              <HeadlessSafeSelect
                id="empresa_aseguradora_id"
                label="Empresa Aseguradora"
                value={asesor.empresa_aseguradora_id}
                onChange={(value) => handleSelectChange('empresa_aseguradora_id', value)}
                options={empresasAseguradoras.map(emp => ({ ...emp, nombre: emp.nombre || 'Sin nombre' }))}
                placeholder="Selecciona una empresa"
                loading={isLoadingCompanies}
              />
            </div>
          </div>

          <div className="md:col-span-2 flex justify-end space-x-4 mt-4 pt-6 border-t border-white/10">
            {editingAsesor && (
              <Button type="button" variant="outline" className="text-slate-300 border-white/20 bg-transparent hover:bg-white/10 hover:text-white transition-all" onClick={() => setEditingAsesor(null)}>
                Cancelar
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting || isLoadingCompanies} className={`shadow-lg font-black tracking-wide border transition-all ${editingAsesor ? 'bg-amber-600/80 hover:bg-amber-500 border-amber-500/50 text-white shadow-[0_0_15px_rgba(217,119,6,0.5)]' : 'bg-emerald-600/80 hover:bg-emerald-500 border-emerald-500/50 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]'}`}>
              {isSubmitting ? 'Procesando...' : <span className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5" /> {editingAsesor ? 'Guardar Cambios' : 'Registrar Asesor'}</span>}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default AsesorForm;