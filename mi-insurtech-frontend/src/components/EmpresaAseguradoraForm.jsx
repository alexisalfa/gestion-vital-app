// src/components/EmpresaAseguradoraForm.jsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/lib/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Hash, Mail, Phone, MapPin, CheckCircle2, X } from 'lucide-react';

function EmpresaAseguradoraForm({ onEmpresaAseguradoraSaved, editingEmpresaAseguradora, setEditingEmpresaAseguradora, apiBaseUrl }) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nombre: '',
    rif: '',
    direccion: '',
    telefono: '',
    email_contacto: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingEmpresaAseguradora) {
      setFormData({
        nombre: editingEmpresaAseguradora.nombre || '',
        rif: editingEmpresaAseguradora.rif || '',
        direccion: editingEmpresaAseguradora.direccion || '',
        telefono: editingEmpresaAseguradora.telefono || '',
        email_contacto: editingEmpresaAseguradora.email_contacto || '',
      });
    } else {
      setFormData({ nombre: '', rif: '', direccion: '', telefono: '', email_contacto: '' });
    }
    setErrors({});
  }, [editingEmpresaAseguradora]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre de la empresa es obligatorio.';
    if (!formData.rif.trim()) newErrors.rif = 'El RIF es obligatorio.';
    if (formData.email_contacto && !/\S+@\S+\.\S+/.test(formData.email_contacto)) {
      newErrors.email_contacto = 'Formato de email inválido.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({ title: "Datos incompletos", description: "Revisa los campos en rojo.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      toast({ title: "Error de Autenticación", description: "No autorizado.", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    const method = editingEmpresaAseguradora ? 'PUT' : 'POST';
    const url = editingEmpresaAseguradora
      ? `${apiBaseUrl}/empresas-aseguradoras/${editingEmpresaAseguradora.id}`
      : `${apiBaseUrl}/empresas-aseguradoras/`;

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al guardar la empresa aseguradora.');
      }

      toast({
        title: editingEmpresaAseguradora ? "Empresa Actualizada" : "Empresa Registrada",
        description: `Los datos de ${formData.nombre} han sido guardados con éxito.`,
        variant: "success",
      });

      onEmpresaAseguradoraSaved(!!editingEmpresaAseguradora);

      setFormData({ nombre: '', rif: '', direccion: '', telefono: '', email_contacto: '' });
      setEditingEmpresaAseguradora(null); 

    } catch (error) {
      console.error('Error al guardar empresa:', error);
      toast({ title: "Error al Guardar", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mb-8 bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-2xl overflow-hidden transition-all duration-300">
      
      {/* Cabecera Corporativa Ciberpunk */}
      <div className={`p-6 ${editingEmpresaAseguradora ? 'bg-gradient-to-r from-amber-500/20 to-orange-600/20 border-b border-amber-500/30' : 'bg-gradient-to-r from-indigo-500/20 to-purple-600/20 border-b border-indigo-500/30'} flex justify-between items-center`}>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl backdrop-blur-md border ${editingEmpresaAseguradora ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400'}`}>
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white drop-shadow-md">{editingEmpresaAseguradora ? 'Editando Perfil Corporativo' : 'Registrar Nueva Aseguradora'}</h2>
            <p className="text-slate-300 text-sm font-medium mt-0.5">
              {editingEmpresaAseguradora ? `Modificando los datos de ${formData.nombre}` : 'Añade una nueva compañía de seguros a tu red operativa.'}
            </p>
          </div>
        </div>
        {editingEmpresaAseguradora && (
          <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-colors" onClick={() => setEditingEmpresaAseguradora(null)}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          
          <div className="space-y-2 relative">
            <Label htmlFor="nombre" className="text-slate-300 font-bold text-xs uppercase tracking-wider">Razón Social <span className="text-red-400">*</span></Label>
            <div className="relative group">
              <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <Input id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} className={`pl-10 text-white bg-black/20 border-white/10 focus:bg-black/40 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 placeholder:text-slate-600 transition-all ${errors.nombre ? 'border-red-500 ring-1 ring-red-500' : ''}`} placeholder="Ej. Seguros Caracas C.A." />
            </div>
            {errors.nombre && <p className="text-xs text-red-400 font-bold">{errors.nombre}</p>}
          </div>

          <div className="space-y-2 relative">
            <Label htmlFor="rif" className="text-slate-300 font-bold text-xs uppercase tracking-wider">RIF corporativo <span className="text-red-400">*</span></Label>
            <div className="relative group">
              <Hash className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <Input id="rif" name="rif" value={formData.rif} onChange={handleChange} placeholder="Ej. J-12345678-9" className={`pl-10 uppercase text-white bg-black/20 border-white/10 focus:bg-black/40 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 placeholder:text-slate-600 transition-all ${errors.rif ? 'border-red-500 ring-1 ring-red-500' : ''}`} />
            </div>
            {errors.rif && <p className="text-xs text-red-400 font-bold">{errors.rif}</p>}
          </div>

          <div className="space-y-2 relative">
            <Label htmlFor="email_contacto" className="text-slate-300 font-bold text-xs uppercase tracking-wider">Correo Institucional</Label>
            <div className="relative group">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <Input id="email_contacto" name="email_contacto" type="email" value={formData.email_contacto} onChange={handleChange} placeholder="contacto@aseguradora.com" className={`pl-10 lowercase text-white bg-black/20 border-white/10 focus:bg-black/40 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 placeholder:text-slate-600 transition-all ${errors.email_contacto ? 'border-red-500 ring-1 ring-red-500' : ''}`} />
            </div>
            {errors.email_contacto && <p className="text-xs text-red-400 font-bold">{errors.email_contacto}</p>}
          </div>

          <div className="space-y-2 relative">
            <Label htmlFor="telefono" className="text-slate-300 font-bold text-xs uppercase tracking-wider">Teléfono Master</Label>
            <div className="relative group">
              <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <Input id="telefono" name="telefono" type="tel" value={formData.telefono} onChange={handleChange} placeholder="Ej. +58 212 1234567" className="pl-10 text-white bg-black/20 border-white/10 focus:bg-black/40 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 placeholder:text-slate-600 transition-all" />
            </div>
          </div>

          <div className="space-y-2 md:col-span-2 relative">
            <Label htmlFor="direccion" className="text-slate-300 font-bold text-xs uppercase tracking-wider">Dirección Sede Principal</Label>
            <div className="relative group">
              <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <Input id="direccion" name="direccion" value={formData.direccion} onChange={handleChange} placeholder="Avenida, Calle, Edificio corporativo..." className="pl-10 text-white bg-black/20 border-white/10 focus:bg-black/40 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 placeholder:text-slate-600 transition-all" />
            </div>
          </div>

          <div className="md:col-span-2 flex justify-end space-x-4 mt-4 pt-6 border-t border-white/10">
            {editingEmpresaAseguradora && (
              <Button type="button" variant="outline" className="text-slate-300 border-white/20 bg-transparent hover:bg-white/10 hover:text-white transition-all" onClick={() => setEditingEmpresaAseguradora(null)}>
                Cancelar
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting} className={`shadow-lg font-black tracking-wide border transition-all ${editingEmpresaAseguradora ? 'bg-amber-600/80 hover:bg-amber-500 border-amber-500/50 text-white shadow-[0_0_15px_rgba(217,119,6,0.5)]' : 'bg-indigo-600/80 hover:bg-indigo-500 border-indigo-500/50 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]'}`}>
              {isSubmitting ? 'Procesando...' : (
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  {editingEmpresaAseguradora ? 'Guardar Cambios' : 'Registrar Empresa'}
                </span>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default EmpresaAseguradoraForm;