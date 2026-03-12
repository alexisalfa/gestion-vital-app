// src/components/LoginForm.jsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/lib/use-toast';


/**
 * Componente de formulario de inicio de sesión.
 *
 * @param {object} props - Las propiedades del componente.
 * @param {function} props.onLoginSuccess - Callback que se ejecuta al iniciar sesión exitosamente.
 * @param {string} props.apiBaseUrl - La URL base de la API.
 */
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
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error al iniciar sesión.');
      }

      const data = await response.json();
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('token_type', data.token_type);
      onLoginSuccess();
    } catch (error) {
      console.error('Error de inicio de sesión:', error);
      toast({
        title: "Error de Inicio de Sesión",
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
        <Label htmlFor="login-username" className="text-white">Usuario</Label> {/* Texto blanco */}
        <Input
          id="login-username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          disabled={isSubmitting}
          placeholder="Ingresa tu usuario"
          className="placeholder:text-gray-300 text-gray-900" // Ajuste de placeholder y texto del input
        />
      </div>
      <div>
        <Label htmlFor="login-password" className="text-white">Contraseña</Label> {/* Texto blanco */}
        <Input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isSubmitting}
          placeholder="Ingresa tu contraseña"
          className="placeholder:text-gray-300 text-gray-900" // Ajuste de placeholder y texto del input
        />
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
      </Button>
    </form>
  );
}

export default LoginForm;
