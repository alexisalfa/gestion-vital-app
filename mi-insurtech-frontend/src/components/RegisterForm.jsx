// src/components/RegisterForm.jsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/lib/use-toast';

function RegisterForm({ apiBaseUrl, onRegisterSuccess }) {
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Se asegura de que la petición vaya a /api/v1/register
      const response = await fetch(`${apiBaseUrl}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username, password }), // CAMBIO: email por username
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al registrar usuario.');
      }

      toast({
        title: "Registro Exitoso",
        description: "Usuario registrado con éxito.",
        variant: "success",
      });

      if (onRegisterSuccess) onRegisterSuccess();
    } catch (error) {
      toast({
        title: "Error de Registro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="register-username" className="text-white">Correo Electrónico</Label>
        <Input
          id="register-username"
          type="email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          placeholder="ejemplo@correo.com"
          className="text-gray-900"
        />
      </div>
      <div>
        <Label htmlFor="register-password" className="text-white">Contraseña</Label>
        <Input
          id="register-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Mínimo 8 caracteres"
          className="text-gray-900"
        />
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Registrando...' : 'Registrarse'}
      </Button>
    </form>
  );
}

export default RegisterForm;