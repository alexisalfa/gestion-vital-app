// src/components/ClientForm.jsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/lib/use-toast';
import { UserPlus, User, Mail, Phone, MapPin, CreditCard, Calendar, CheckCircle2, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Función auxiliar para formatear fechas a "YYYY-MM-DD"
const formatDateToInput = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return ''; 
  return date.toISOString().split('T')[0];
};

// Función auxiliar para parsear fechas de "YYYY-MM-DD" a ISO
const parseDateFromInput = (dateString) => {
  if (!dateString) return null;
  return new Date(`${dateString}T00:00:00Z`).toISOString(); 
};

function ClientForm({ onClientSaved, editingClient, setEditingClient, apiBaseUrl }) {
  const { toast } = useToast();
  // 🚀 Inyectamos el traductor
  const { t } = useTranslation();

  const initialFormData = {
    nombre: '',
    apellido: '',
    cedula: '',
    email: '',
    telefono: '',
    fecha_nacimiento: '',
    direccion: '',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingClient) {
      setFormData({
        nombre: editingClient.nombre || '',
        apellido: editingClient.apellido || '',
        cedula: editingClient.identificacion || editingClient.cedula || '', 
        email: editingClient.email || '',
        telefono: editingClient.telefono || '',
        fecha_nacimiento: formatDateToInput(editingClient.fecha_nacimiento),
        direccion: editingClient.direccion || '',
      });
    } else {
      setFormData(initialFormData); 
    }
    setErrors({});
  }, [editingClient]);

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
    if (!formData.nombre.trim()) newErrors.nombre = t('clientes.errNames');
    if (!formData.apellido.trim()) newErrors.apellido = t('clientes.errSurnames');
    if (!formData.cedula.trim()) {
      newErrors.cedula = t('clientes.errIdReq');
    } else if (!/^[0-9A-Z]{5,15}$/i.test(formData.cedula)) {
      newErrors.cedula = t('clientes.errIdFormat');
    }
    if (!formData.email.trim()) {
      newErrors.email = t('clientes.errEmailReq');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('clientes.errEmailFormat');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: t('clientes.toastMissingData'),
        description: t('clientes.toastCheckFields'),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const token = localStorage.getItem('access_token');

    const dataToSend = {
      nombre: formData.nombre,
      apellido: formData.apellido,
      identificacion: formData.cedula,
      email: formData.email,
      telefono: formData.telefono,
      direccion: formData.direccion,
      fecha_nacimiento: parseDateFromInput(formData.fecha_nacimiento),
    };

    const url = editingClient
      ? `${apiBaseUrl}/clientes/${editingClient.id}`
      : `${apiBaseUrl}/clientes`;
    const method = editingClient ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        toast({
          title: editingClient ? t('clientes.toastUpdated') : t('clientes.toastRegistered'),
          description: `El perfil de ${formData.nombre} ${t('clientes.toastSuccessDesc')}`,
          variant: "success",
        });

        if (onClientSaved) onClientSaved();
        
        if (!editingClient) setFormData(initialFormData);
        else setEditingClient(null);
        
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al guardar.');
      }
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mb-8 bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-2xl overflow-hidden transition-all duration-300">
      
      <div className={`p-6 ${editingClient ? 'bg-gradient-to-r from-amber-500/20 to-orange-600/20 border-b border-amber-500/30' : 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border-b border-cyan-500/30'} flex justify-between items-center`}>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl backdrop-blur-md border ${editingClient ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400'}`}>
            {editingClient ? <User className="h-6 w-6" /> : <UserPlus className="h-6 w-6" />}
          </div>
          <div>
            <h2 className="text-xl font-black text-white drop-shadow-md">{editingClient ? t('clientes.formTitleEdit') : t('clientes.formTitleNew')}</h2>
            <p className="text-slate-300 text-sm font-medium mt-0.5">
              {editingClient ? `${t('clientes.formDescEdit')} ${formData.nombre} ${formData.apellido}` : t('clientes.formDescNew')}
            </p>
          </div>
        </div>
        {editingClient && (
          <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-colors" onClick={() => setEditingClient(null)}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          
          {/* Nombres */}
          <div className="space-y-2 relative">
            <Label htmlFor="nombre" className="text-slate-300 font-bold text-xs uppercase tracking-wider">{t('clientes.names')} <span className="text-red-400">*</span></Label>
            <div className="relative group">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
              <Input id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} className={`pl-10 text-white bg-black/20 border-white/10 focus:bg-black/40 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 placeholder:text-slate-600 transition-all ${errors.nombre ? 'border-red-500 ring-1 ring-red-500' : ''}`} placeholder="Ej. Arturo" />
            </div>
            {errors.nombre && <p className="text-xs text-red-400 font-bold">{errors.nombre}</p>}
          </div>

          {/* Apellidos */}
          <div className="space-y-2 relative">
            <Label htmlFor="apellido" className="text-slate-300 font-bold text-xs uppercase tracking-wider">{t('clientes.surnames')} <span className="text-red-400">*</span></Label>
            <div className="relative group">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
              <Input id="apellido" name="apellido" value={formData.apellido} onChange={handleChange} className={`pl-10 text-white bg-black/20 border-white/10 focus:bg-black/40 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 placeholder:text-slate-600 transition-all ${errors.apellido ? 'border-red-500 ring-1 ring-red-500' : ''}`} placeholder="Ej. Mendoza" />
            </div>
            {errors.apellido && <p className="text-xs text-red-400 font-bold">{errors.apellido}</p>}
          </div>

          {/* Documento de Identidad */}
          <div className="space-y-2 relative">
            <Label htmlFor="cedula" className="text-slate-300 font-bold text-xs uppercase tracking-wider">{t('clientes.idDocument')} <span className="text-red-400">*</span></Label>
            <div className="relative group">
              <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
              <Input id="cedula" name="cedula" value={formData.cedula} onChange={handleChange} placeholder="Ej. V-12345678" className={`pl-10 uppercase text-white bg-black/20 border-white/10 focus:bg-black/40 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 placeholder:text-slate-600 transition-all ${errors.cedula ? 'border-red-500 ring-1 ring-red-500' : ''}`} />
            </div>
            {errors.cedula && <p className="text-xs text-red-400 font-bold">{errors.cedula}</p>}
          </div>

          {/* Fecha de Nacimiento */}
          <div className="space-y-2 relative">
            <Label htmlFor="fecha_nacimiento" className="text-slate-300 font-bold text-xs uppercase tracking-wider">{t('clientes.birthDate')} <span className="text-red-400">*</span></Label>
            <div className="relative group">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
              <Input id="fecha_nacimiento" name="fecha_nacimiento" type="date" value={formData.fecha_nacimiento} onChange={handleChange} required className="pl-10 text-white bg-black/20 border-white/10 focus:bg-black/40 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all [&::-webkit-calendar-picker-indicator]:invert" />
            </div>
          </div>

          {/* Correo Electrónico */}
          <div className="space-y-2 relative">
            <Label htmlFor="email" className="text-slate-300 font-bold text-xs uppercase tracking-wider">{t('clientes.email')} <span className="text-red-400">*</span></Label>
            <div className="relative group">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="correo@ejemplo.com" className={`pl-10 lowercase text-white bg-black/20 border-white/10 focus:bg-black/40 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 placeholder:text-slate-600 transition-all ${errors.email ? 'border-red-500 ring-1 ring-red-500' : ''}`} />
            </div>
            {errors.email && <p className="text-xs text-red-400 font-bold">{errors.email}</p>}
          </div>

          {/* Teléfono */}
          <div className="space-y-2 relative">
            <Label htmlFor="telefono" className="text-slate-300 font-bold text-xs uppercase tracking-wider">{t('clientes.phone')}</Label>
            <div className="relative group">
              <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
              <Input id="telefono" name="telefono" type="tel" value={formData.telefono} onChange={handleChange} placeholder="+58 414 1234567" className="pl-10 text-white bg-black/20 border-white/10 focus:bg-black/40 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 placeholder:text-slate-600 transition-all" />
            </div>
          </div>

          {/* Dirección */}
          <div className="space-y-2 md:col-span-2 relative">
            <Label htmlFor="direccion" className="text-slate-300 font-bold text-xs uppercase tracking-wider">{t('clientes.address')}</Label>
            <div className="relative group">
              <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
              <Input id="direccion" name="direccion" value={formData.direccion} onChange={handleChange} placeholder="Avenida, Calle, Edificio..." className="pl-10 text-white bg-black/20 border-white/10 focus:bg-black/40 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 placeholder:text-slate-600 transition-all" />
            </div>
          </div>

          {/* BOTONES */}
          <div className="md:col-span-2 flex justify-end space-x-4 mt-4 pt-6 border-t border-white/10">
            {editingClient && (
              <Button type="button" variant="outline" className="text-slate-300 border-white/20 bg-transparent hover:bg-white/10 hover:text-white transition-all" onClick={() => setEditingClient(null)}>
                {t('clientes.cancel')}
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting} className={`shadow-lg font-black tracking-wide border ${editingClient ? 'bg-amber-600/80 hover:bg-amber-500 border-amber-500/50 text-white shadow-[0_0_15px_rgba(217,119,6,0.5)]' : 'bg-cyan-600/80 hover:bg-cyan-500 border-cyan-500/50 text-white shadow-[0_0_15px_rgba(8,145,178,0.5)]'} transition-all`}>
              {isSubmitting ? t('clientes.processing') : (
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  {editingClient ? t('clientes.saveChanges') : t('clientes.registerClient')}
                </span>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default ClientForm;