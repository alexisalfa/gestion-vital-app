// src/components/AuthPage.jsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import GoogleAuthButton from './GoogleAuthButton';
import loginIllustration from '../assets/login-illustration.png'; 

function AuthPage({ onLoginSuccess, apiBaseUrl }) {
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  // Esta función recibe el token temporal de Google y lo envía a tu Backend en Python
  const handleGoogleSuccess = async (tokenResponse) => {
    try {
      const response = await fetch(`${apiBaseUrl}/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: tokenResponse.access_token }),
      });

      if (!response.ok) {
        throw new Error('Error al validar con el servidor.');
      }

      const data = await response.json();
      
      // Guardamos la llave de la bóveda
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('token_type', data.token_type);
      
      // 🦾 NUEVO: Guardamos el perfil del usuario completo para el Dashboard
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      // Le avisamos a App.jsx que abra las puertas
      onLoginSuccess();
      
    } catch (error) {
      console.error("Error en Google Login:", error);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      
      {/* --- PANEL IZQUIERDO (LA ILUSTRACIÓN) --- */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-700 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-700 to-indigo-900"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[32rem] h-[32rem] bg-white opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[32rem] h-[32rem] bg-indigo-400 opacity-20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 p-12 w-full h-full flex flex-col items-center justify-center">
          <div className="w-[85%] max-w-lg mb-8 animate-in fade-in slide-in-from-bottom-5 duration-500 relative">
              <img 
                  src={loginIllustration} 
                  alt="Gestión Vital Protección SaaS" 
                  className="w-full h-auto drop-shadow-2xl relative z-10" 
              />
          </div>

          <div className="text-white p-6 max-w-lg text-center flex flex-col items-center mt-[-30px]">
              <h1 className="text-4xl font-black mb-6 tracking-tight flex items-center gap-3">
                 <ShieldAlert className="h-9 w-9 text-blue-100" /> Gestión Vital
              </h1>
              <p className="text-blue-100 text-lg leading-relaxed font-semibold">
                El ecosistema Insurtech blindado para automatizar tu agencia, proteger tu cartera y multiplicar tus comisiones.
              </p>
          </div>
        </div>
      </div>

      {/* --- PANEL DERECHO (FORMULARIOS Y GOOGLE) --- */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-6 sm:p-12 lg:p-20 bg-white shadow-[-20px_0_40px_-15px_rgba(0,0,0,0.1)] relative z-20">
        <div className="max-w-md w-full mx-auto space-y-8">

          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">
              {showRegisterForm ? "Crea tu Cuenta" : "Bienvenido de nuevo"}
            </h2>
            <p className="text-slate-500 mt-2 font-semibold">
              {showRegisterForm ? "Comienza a gestionar tu agencia hoy mismo." : "Ingresa tus credenciales para acceder a tu bóveda."}
            </p>
          </div>

          {/* --- BOTÓN OFICIAL DE LOGIN CON GOOGLE --- */}
          <GoogleAuthButton onLoginSuccess={handleGoogleSuccess} />
          {/* ----------------------------------------- */}

          <div className="relative flex items-center">
            <div className="flex-grow border-t border-slate-200 opacity-60"></div>
            <span className="flex-shrink-0 mx-4 text-slate-400 text-sm font-semibold">O ingresa con tu correo</span>
            <div className="flex-grow border-t border-slate-200 opacity-60"></div>
          </div>

          <div className="bg-white">
            {showRegisterForm ? (
              <RegisterForm apiBaseUrl={apiBaseUrl} onRegisterSuccess={() => setShowRegisterForm(false)} />
            ) : (
              <LoginForm onLoginSuccess={onLoginSuccess} apiBaseUrl={apiBaseUrl} />
            )}
          </div>

          <div className="text-center pt-2">
            <p className="text-slate-600 text-sm font-semibold">
              {showRegisterForm ? '¿Ya tienes una cuenta?' : '¿No tienes una cuenta?'}
              <Button variant="link" onClick={() => setShowRegisterForm(!showRegisterForm)} className="ml-2 text-indigo-600 hover:text-indigo-800 font-black p-0 text-sm">
                {showRegisterForm ? 'Inicia Sesión aquí' : 'Regístrate ahora'}
              </Button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default AuthPage;