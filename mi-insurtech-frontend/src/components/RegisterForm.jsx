// src/components/RegisterForm.jsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/lib/use-toast';
import { Loader2, Mail, Lock, UserPlus } from 'lucide-react';

function RegisterForm({ apiBaseUrl, onRegisterSuccess }) {
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiBaseUrl}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al registrar usuario.');
      }

      toast({ title: "¡Bienvenido a bordo! 🚀", description: "Tu cuenta ha sido creada exitosamente.", variant: "success" });
      if (onRegisterSuccess) onRegisterSuccess();
    } catch (error) {
      toast({ title: "Error de Registro", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="register-username" className="text-slate-700 font-bold text-sm">Correo Electrónico Profesional</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <Input
            id="register-username"
            type="email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="tu@agencia.com"
            className="pl-10 py-6 bg-slate-50 border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="register-password" className="text-slate-700 font-bold text-sm">Crea una Contraseña Segura</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <Input
            id="register-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Mínimo 8 caracteres"
            className="pl-10 py-6 bg-slate-50 border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
      </div>
      
      <Button 
        type="submit" 
        className="w-full py-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5" 
        disabled={isSubmitting}
      >
        {isSubmitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Creando cuenta...</> : <><UserPlus className="mr-2 h-5 w-5"/> Registrarme Ahora</>}
      </Button>
    </form>
  );
}

export default RegisterForm;