// src/components/AuthPage.jsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import GoogleAuthButton from './GoogleAuthButton';

// 🖼️ 1. IMPORTACIÓN DE SU COLECCIÓN DE IMÁGENES PREMIUM (SOLO LAS ESPECTACULARES)
import img1 from '../assets/imagen1.jpg'; 
import img2 from '../assets/imagen2.jpg';
import img3 from '../assets/imagen4.jpg'; 
import img4 from '../assets/imagen5.jpg';
import img5 from '../assets/imagen6.jpg';
import img6 from '../assets/imagen7.jpg';
// 🗑️ La imagen vieja y 'chimba' ha sido eliminada de la existencia.

// 2. LISTA DEL CARRUSEL (Ahora solo 6 imágenes Nivel DIOS)
const CAROUSEL_IMAGES = [img1, img2, img3, img4, img5, img6];

function AuthPage({ onLoginSuccess, apiBaseUrl }) {
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  // 🤖 3. EL MOTOR DEL CARRUSEL (Cambia cada 3 segundos)
  useEffect(() => {
    // Si no hay imágenes (seguridad), no iniciamos el reloj
    if (CAROUSEL_IMAGES.length === 0) return;

    const interval = setInterval(() => {
      setCurrentImgIndex((prevIndex) => (prevIndex + 1) % CAROUSEL_IMAGES.length);
    }, 3000); 
    return () => clearInterval(interval); 
  }, []);

  const handleGoogleSuccess = async (tokenResponse) => {
    try {
      const response = await fetch(`${apiBaseUrl}/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: tokenResponse.access_token }),
      });

      if (!response.ok) throw new Error('Error al validar con el servidor.');

      const data = await response.json();
      
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('token_type', data.token_type);
      
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      onLoginSuccess();
    } catch (error) {
      console.error("Error en Google Login:", error);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans relative overflow-hidden">
      
      {/* Luces de Neón de Fondo para toda la página (Efecto Ciberpunk) */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-indigo-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-blue-100/30 rounded-full blur-3xl"></div>
      </div>

      {/* --- PANEL IZQUIERDO (EL CARRUSEL CINEMATOGRÁFICO - NIVEL DIOS) --- */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center bg-slate-950 z-10 shadow-[20px_0_60px_-15px_rgba(0,0,0,0.5)]">
        
        {/* Renderizado dinámico de las imágenes con fundido */}
        {CAROUSEL_IMAGES.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`Gestión Vital Premium ${index + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
              index === currentImgIndex ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}

        {/* Overlay de Cristal Oscuro y Degradado */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-indigo-950/70 to-slate-950/95 backdrop-blur-[1px]"></div>
        
        {/* Efectos de Luces Neón Internas */}
        <div className="absolute top-[-10%] left-[-10%] w-[32rem] h-[32rem] bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[32rem] h-[32rem] bg-blue-500/15 rounded-full blur-3xl pointer-events-none"></div>
        
        {/* --- TEXTOS FLOTANTES EN LA PARTE INFERIOR --- */}
        <div className="relative z-10 p-12 w-full h-full flex flex-col items-center justify-end pb-24">
          <div className="bg-slate-950/50 backdrop-blur-xl border border-white/10 p-10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] max-w-lg text-center animate-in fade-in slide-in-from-bottom-5 duration-1000">
              <h1 className="text-4xl font-black mb-6 tracking-tight flex items-center justify-center gap-3 text-white">
                 <ShieldAlert className="h-9 w-9 text-indigo-400" /> Gestión Vital
              </h1>
              <p className="text-slate-200 text-lg leading-relaxed font-semibold">
                El ecosistema Insurtech blindado para automatizar tu agencia, proteger tu cartera y multiplicar tus comisiones.
              </p>
          </div>
        </div>
      </div>

      {/* --- PANEL DERECHO (FORMULARIOS Y GOOGLE) --- */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center p-6 sm:p-12 lg:p-20 bg-white shadow-[-20px_0_40px_-15px_rgba(0,0,0,0.1)] relative z-20 transition-all duration-500">
        <div className="max-w-md w-full mx-auto space-y-8">

          <div className="text-center lg:text-left animate-in fade-in slide-in-from-top-5 duration-700">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">
              {showRegisterForm ? "Crea tu Cuenta" : "Bienvenido de nuevo"}
            </h2>
            <p className="text-slate-500 mt-2 font-semibold">
              {showRegisterForm ? "Comienza a gestionar tu agencia hoy mismo." : "Ingresa tus credenciales para acceder a tu bóveda."}
            </p>
          </div>

          <GoogleAuthButton onLoginSuccess={handleGoogleSuccess} />

          <div className="relative flex items-center">
            <div className="flex-grow border-t border-slate-200 opacity-60"></div>
            <span className="flex-shrink-0 mx-4 text-slate-400 text-sm font-semibold">O ingresa con tu correo</span>
            <div className="flex-grow border-t border-slate-200 opacity-60"></div>
          </div>

          <div className="bg-white rounded-xl">
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