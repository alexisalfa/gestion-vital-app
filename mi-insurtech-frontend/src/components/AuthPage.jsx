// src/components/AuthPage.jsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';
import { useToast } from '@/lib/use-toast';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

// Importa tu ilustración
import loginIllustration from '../assets/login-illustration.png'; 

function AuthPage({ onLoginSuccess, apiBaseUrl }) {
  // Manejamos el cambio entre Login y Registro de forma local aquí
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const { toast } = useToast();

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

          {/* BOTÓN DE GOOGLE */}
          <button 
            type="button"
            className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-700 px-4 py-3.5 rounded-xl font-black hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm group transform hover:-translate-y-0.5"
            onClick={() => toast({ title: "Próximamente", description: "La integración con Google estará activa en la siguiente fase.", variant: "info" })}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continuar con Google
          </button>

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