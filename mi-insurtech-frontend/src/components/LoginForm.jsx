// src/components/LoginForm.jsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// 🚀 AQUÍ ESTÁ LA CORRECCIÓN: Apuntando a la carpeta lib
import { useToast } from '@/lib/use-toast'; 
import { Loader2, Mail, Lock } from 'lucide-react';

function LoginForm({ onLoginSuccess, apiBaseUrl }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    try {
      const response = await fetch(`${apiBaseUrl}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Credenciales incorrectas.');
      }

      const data = await response.json();
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('token_type', data.token_type);
      
      toast({
        title: "Inicio de Sesión Exitoso",
        description: "¡Bienvenido a la Bóveda de Gestión Vital!",
        variant: "success", 
      });

      onLoginSuccess();
    } catch (error) {
      toast({ title: "Error de Acceso", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="login-username" className="text-slate-300 font-bold text-sm">Correo Electrónico</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
          <Input
            id="login-username"
            type="email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={isSubmitting}
            placeholder="ejemplo@agencia.com"
            className="pl-10 py-6 bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all shadow-inner"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="login-password" className="text-slate-300 font-bold text-sm">Contraseña</Label>
          <a href="#" className="text-sm font-bold text-cyan-400 hover:text-cyan-300 transition-colors">¿Olvidaste tu contraseña?</a>
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
          <Input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isSubmitting}
            placeholder="••••••••"
            className="pl-10 py-6 bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all shadow-inner"
          />
        </div>
      </div>
      
      <Button 
        type="submit" 
        className="w-full py-6 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-lg shadow-[0_0_15px_rgba(8,145,178,0.4)] hover:shadow-[0_0_25px_rgba(8,145,178,0.6)] transition-all transform hover:-translate-y-0.5 border border-cyan-400/50" 
        disabled={isSubmitting}
      >
        {isSubmitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Accediendo...</> : 'Ingresar a la Bóveda'}
      </Button>
    </form>
  );
}

export default LoginForm;