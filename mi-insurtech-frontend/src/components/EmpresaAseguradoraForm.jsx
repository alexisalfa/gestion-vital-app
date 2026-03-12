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
    <Card className="mb-8 border-none shadow-xl rounded-xl overflow-hidden">
      {/* Cabecera Corporativa Premium */}
      <div className={`p-6 ${editingEmpresaAseguradora ? 'bg-gradient-to-r from-amber-500 to-orange-600' : 'bg-gradient-to-r from-slate-700 to-slate-900'} text-white flex justify-between items-center`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{editingEmpresaAseguradora ? 'Editando Perfil Corporativo' : 'Registrar Nueva Aseguradora'}</h2>
            <p className="text-slate-200 text-sm opacity-90">
              {editingEmpresaAseguradora ? `Modificando los datos de ${formData.nombre}` : 'Añade una nueva compañía de seguros a tu red operativa.'}
            </p>
          </div>
        </div>
        {editingEmpresaAseguradora && (
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full" onClick={() => setEditingEmpresaAseguradora(null)}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <CardContent className="p-6 bg-white">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          
          <div className="space-y-2 relative">
            <Label htmlFor="nombre" className="text-gray-600 font-semibold">Razón Social <span className="text-red-500">*</span></Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} className={`pl-10 ${errors.nombre ? 'border-red-500 ring-1 ring-red-500' : 'bg-gray-50 focus:bg-white'}`} placeholder="Ej. Seguros Caracas C.A." />
            </div>
            {errors.nombre && <p className="text-xs text-red-600 font-medium">{errors.nombre}</p>}
          </div>

          <div className="space-y-2 relative">
            <Label htmlFor="rif" className="text-gray-600 font-semibold">RIF corporativo <span className="text-red-500">*</span></Label>
            <div className="relative">
              <Hash className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input id="rif" name="rif" value={formData.rif} onChange={handleChange} placeholder="Ej. J-12345678-9" className={`pl-10 uppercase ${errors.rif ? 'border-red-500 ring-1 ring-red-500' : 'bg-gray-50 focus:bg-white'}`} />
            </div>
            {errors.rif && <p className="text-xs text-red-600 font-medium">{errors.rif}</p>}
          </div>

          <div className="space-y-2 relative">
            <Label htmlFor="email_contacto" className="text-gray-600 font-semibold">Correo de Contacto Institucional</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input id="email_contacto" name="email_contacto" type="email" value={formData.email_contacto} onChange={handleChange} placeholder="contacto@aseguradora.com" className={`pl-10 lowercase ${errors.email_contacto ? 'border-red-500 ring-1 ring-red-500' : 'bg-gray-50 focus:bg-white'}`} />
            </div>
            {errors.email_contacto && <p className="text-xs text-red-600 font-medium">{errors.email_contacto}</p>}
          </div>

          <div className="space-y-2 relative">
            <Label htmlFor="telefono" className="text-gray-600 font-semibold">Teléfono Master</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input id="telefono" name="telefono" type="tel" value={formData.telefono} onChange={handleChange} placeholder="Ej. +58 212 1234567" className="pl-10 bg-gray-50 focus:bg-white" />
            </div>
          </div>

          <div className="space-y-2 md:col-span-2 relative">
            <Label htmlFor="direccion" className="text-gray-600 font-semibold">Dirección Sede Principal</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input id="direccion" name="direccion" value={formData.direccion} onChange={handleChange} placeholder="Avenida, Calle, Edificio corporativo..." className="pl-10 bg-gray-50 focus:bg-white" />
            </div>
          </div>

          <div className="md:col-span-2 flex justify-end space-x-4 mt-4 pt-4 border-t border-gray-100">
            {editingEmpresaAseguradora && (
              <Button type="button" variant="outline" className="text-gray-600" onClick={() => setEditingEmpresaAseguradora(null)}>
                Cancelar
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting} className={`shadow-lg text-white font-bold ${editingEmpresaAseguradora ? 'bg-amber-600 hover:bg-amber-700' : 'bg-slate-800 hover:bg-slate-900'}`}>
              {isSubmitting ? 'Procesando...' : (
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
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