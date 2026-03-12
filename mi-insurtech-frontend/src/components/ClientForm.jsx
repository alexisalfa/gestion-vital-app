// src/components/ClientForm.jsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/lib/use-toast';
import { UserPlus, User, Mail, Phone, MapPin, CreditCard, Calendar, CheckCircle2, X } from 'lucide-react';

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
        cedula: editingClient.identificacion || editingClient.cedula || '', // Manejo seguro
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
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio.';
    if (!formData.apellido.trim()) newErrors.apellido = 'El apellido es obligatorio.';
    if (!formData.cedula.trim()) {
      newErrors.cedula = 'La cédula es obligatoria.';
    } else if (!/^[0-9A-Z]{5,15}$/i.test(formData.cedula)) {
      newErrors.cedula = 'Formato no válido (5-15 caracteres).';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Formato de email inválido.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Faltan datos",
        description: "Por favor revisa los campos en rojo.",
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
          title: editingClient ? "Cliente Actualizado" : "Cliente Registrado",
          description: `El perfil de ${formData.nombre} ha sido guardado con éxito.`,
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
    <Card className="mb-8 border-none shadow-xl rounded-xl overflow-hidden">
      {/* Cabecera Premium */}
      <div className={`p-6 ${editingClient ? 'bg-gradient-to-r from-amber-500 to-orange-600' : 'bg-gradient-to-r from-blue-600 to-indigo-700'} text-white flex justify-between items-center`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            {editingClient ? <User className="h-6 w-6" /> : <UserPlus className="h-6 w-6" />}
          </div>
          <div>
            <h2 className="text-xl font-bold">{editingClient ? 'Editando Perfil del Cliente' : 'Registrar Nuevo Cliente'}</h2>
            <p className="text-blue-100 text-sm opacity-90">
              {editingClient ? `Modificando los datos de ${formData.nombre} ${formData.apellido}` : 'Completa los datos para añadirlo a tu cartera.'}
            </p>
          </div>
        </div>
        {editingClient && (
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full" onClick={() => setEditingClient(null)}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      <CardContent className="p-6 bg-white">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          
          <div className="space-y-2 relative">
            <Label htmlFor="nombre" className="text-gray-600 font-semibold">Nombres <span className="text-red-500">*</span></Label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} className={`pl-10 ${errors.nombre ? 'border-red-500 ring-1 ring-red-500' : 'bg-gray-50 focus:bg-white'}`} placeholder="Ej. Arturo" />
            </div>
            {errors.nombre && <p className="text-xs text-red-600 font-medium">{errors.nombre}</p>}
          </div>

          <div className="space-y-2 relative">
            <Label htmlFor="apellido" className="text-gray-600 font-semibold">Apellidos <span className="text-red-500">*</span></Label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input id="apellido" name="apellido" value={formData.apellido} onChange={handleChange} className={`pl-10 ${errors.apellido ? 'border-red-500 ring-1 ring-red-500' : 'bg-gray-50 focus:bg-white'}`} placeholder="Ej. Mendoza" />
            </div>
            {errors.apellido && <p className="text-xs text-red-600 font-medium">{errors.apellido}</p>}
          </div>

          <div className="space-y-2 relative">
            <Label htmlFor="cedula" className="text-gray-600 font-semibold">Documento de Identidad <span className="text-red-500">*</span></Label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input id="cedula" name="cedula" value={formData.cedula} onChange={handleChange} placeholder="Ej. V-12345678" className={`pl-10 uppercase ${errors.cedula ? 'border-red-500 ring-1 ring-red-500' : 'bg-gray-50 focus:bg-white'}`} />
            </div>
            {errors.cedula && <p className="text-xs text-red-600 font-medium">{errors.cedula}</p>}
          </div>

          <div className="space-y-2 relative">
            <Label htmlFor="fecha_nacimiento" className="text-gray-600 font-semibold">Fecha de Nacimiento <span className="text-red-500">*</span></Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input id="fecha_nacimiento" name="fecha_nacimiento" type="date" value={formData.fecha_nacimiento} onChange={handleChange} required className="pl-10 bg-gray-50 focus:bg-white" />
            </div>
          </div>

          <div className="space-y-2 relative">
            <Label htmlFor="email" className="text-gray-600 font-semibold">Correo Electrónico <span className="text-red-500">*</span></Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="correo@ejemplo.com" className={`pl-10 lowercase ${errors.email ? 'border-red-500 ring-1 ring-red-500' : 'bg-gray-50 focus:bg-white'}`} />
            </div>
            {errors.email && <p className="text-xs text-red-600 font-medium">{errors.email}</p>}
          </div>

          <div className="space-y-2 relative">
            <Label htmlFor="telefono" className="text-gray-600 font-semibold">Teléfono de Contacto</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input id="telefono" name="telefono" type="tel" value={formData.telefono} onChange={handleChange} placeholder="+58 414 1234567" className="pl-10 bg-gray-50 focus:bg-white" />
            </div>
          </div>

          <div className="space-y-2 md:col-span-2 relative">
            <Label htmlFor="direccion" className="text-gray-600 font-semibold">Dirección Física</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input id="direccion" name="direccion" value={formData.direccion} onChange={handleChange} placeholder="Avenida, Calle, Edificio..." className="pl-10 bg-gray-50 focus:bg-white" />
            </div>
          </div>

          <div className="md:col-span-2 flex justify-end space-x-4 mt-4 pt-4 border-t border-gray-100">
            {editingClient && (
              <Button type="button" variant="outline" className="text-gray-600" onClick={() => setEditingClient(null)}>
                Cancelar
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting} className={`shadow-lg text-white font-bold ${editingClient ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
              {isSubmitting ? 'Procesando...' : (
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  {editingClient ? 'Guardar Cambios' : 'Registrar Cliente'}
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