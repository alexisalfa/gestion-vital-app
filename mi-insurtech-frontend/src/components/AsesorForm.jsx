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
    <Card className="mb-8 border-none shadow-xl rounded-xl overflow-hidden">
      {/* Cabecera Esmeralda Premium */}
      <div className={`p-6 ${editingAsesor ? 'bg-gradient-to-r from-amber-500 to-orange-600' : 'bg-gradient-to-r from-teal-600 to-emerald-700'} text-white flex justify-between items-center`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{editingAsesor ? 'Editando Asesor' : 'Registrar Nuevo Asesor'}</h2>
            <p className="text-emerald-100 text-sm opacity-90">
              {editingAsesor ? `Modificando datos de ${asesor.nombre}` : 'Añade un intermediario a tu fuerza de ventas.'}
            </p>
          </div>
        </div>
        {editingAsesor && (
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full" onClick={() => setEditingAsesor(null)}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <CardContent className="p-6 bg-white">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="space-y-2 relative">
            <Label className="text-gray-600 font-semibold">Nombres</Label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input name="nombre" value={asesor.nombre} onChange={handleChange} required className="pl-10 bg-gray-50 focus:bg-white" />
            </div>
          </div>
          <div className="space-y-2 relative">
            <Label className="text-gray-600 font-semibold">Apellidos</Label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input name="apellido" value={asesor.apellido} onChange={handleChange} required className="pl-10 bg-gray-50 focus:bg-white" />
            </div>
          </div>
          <div className="space-y-2 relative">
            <Label className="text-gray-600 font-semibold">Cédula</Label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input name="cedula" value={asesor.cedula} onChange={handleChange} required className="pl-10 bg-gray-50 focus:bg-white uppercase" />
            </div>
          </div>
          <div className="space-y-2 relative">
            <Label className="text-gray-600 font-semibold">Teléfono</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input name="telefono" type="tel" value={asesor.telefono} onChange={handleChange} required className="pl-10 bg-gray-50 focus:bg-white" />
            </div>
          </div>
          <div className="space-y-2 relative">
            <Label className="text-gray-600 font-semibold">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input name="email" type="email" value={asesor.email} onChange={handleChange} required className="pl-10 bg-gray-50 focus:bg-white lowercase" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-gray-600 font-semibold flex items-center gap-2"><Building className="h-4 w-4 text-gray-400"/> Empresa Aseguradora Vinculada</Label>
            {/* AQUÍ ESTÁ LA CORRECCIÓN DEL SELECTOR */}
            <HeadlessSafeSelect
              id="empresa_aseguradora_id"
              label="Empresa Aseguradora"
              value={asesor.empresa_aseguradora_id}
              onChange={(value) => handleSelectChange('empresa_aseguradora_id', value)}
              options={empresasAseguradoras.map(emp => ({ ...emp, nombre: emp.nombre || 'Sin nombre' }))}
              placeholder="Selecciona una empresa"
              loading={isLoadingCompanies}
              className="bg-gray-50"
            />
          </div>

          <div className="md:col-span-2 flex justify-end space-x-4 mt-4 pt-4 border-t border-gray-100">
            {editingAsesor && <Button type="button" variant="outline" onClick={() => setEditingAsesor(null)}>Cancelar</Button>}
            <Button type="submit" disabled={isSubmitting || isLoadingCompanies} className={`shadow-lg text-white font-bold ${editingAsesor ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
              {isSubmitting ? 'Procesando...' : <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> {editingAsesor ? 'Guardar Cambios' : 'Registrar Asesor'}</span>}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default AsesorForm;