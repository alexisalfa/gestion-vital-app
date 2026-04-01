// src/components/AuthPage.jsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Globe2 } from 'lucide-react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import GoogleAuthButton from './GoogleAuthButton';
import { useTranslation } from 'react-i18next'; 

// 🚀 1. IMPORTAMOS TODOS LOS VIDEOS QUE QUIERA
import video1 from '../assets/video/nexus-hero.mp4';
import video2 from '../assets/video/nexus-hero2.mp4';
// Puede agregar video3, video4...

// 🚀 2. CREAMOS LA LISTA DE REPRODUCCIÓN (PLAYLIST)
const CAROUSEL_VIDEOS = [video1, video2];

function AuthPage({ onLoginSuccess, apiBaseUrl }) {
  const { t } = useTranslation(); 
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  
  // 🚀 3. EL CEREBRO DEL CARRUSEL
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  useEffect(() => {
    // Cambia de video automáticamente cada 10 segundos (10000 milisegundos)
    if (CAROUSEL_VIDEOS.length > 1) {
      const interval = setInterval(() => {
        setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % CAROUSEL_VIDEOS.length);
      }, 10000); 
      return () => clearInterval(interval); 
    }
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
    <div className="relative min-h-screen w-full overflow-hidden bg-black font-sans md:grid md:grid-cols-2">
      
      {/* ========================================================== */}
      {/* 🚀 LADO 1 (IZQUIERDO): El Carrusel de Videos Animados */}
      {/* ========================================================== */}
      <div className="relative hidden md:block h-screen overflow-hidden group bg-black">
        
        {/* Renderizamos todos los videos pero solo mostramos el activo */}
        {CAROUSEL_VIDEOS.map((vid, index) => (
          <video 
            key={index}
            autoPlay 
            loop 
            muted 
            playsInline 
            className={`absolute inset-0 w-full h-full object-cover z-0 transition-all duration-[2000ms] ease-in-out group-hover:scale-105 ${
              index === currentVideoIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
            }`}
          >
            <source src={vid} type="video/mp4" />
          </video>
        ))}
        
        {/* Sutil gradiente sobre el video para enmarcarlo */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 z-10 pointer-events-none" />
        
        {/* Texto flotante corporativo */}
        <div className="absolute bottom-10 left-10 z-20 animate-in fade-in duration-1000 delay-500">
           <h3 className="text-3xl font-black text-white tracking-tight drop-shadow-lg">VitalNexus Core</h3>
           <p className="text-slate-200 text-sm max-w-sm mt-1">El centro de conexiones multi-tenant de alto rendimiento.</p>
           
           {/* Indicadores visuales del carrusel (Puntitos) */}
           <div className="flex gap-2 mt-4">
             {CAROUSEL_VIDEOS.map((_, idx) => (
               <div 
                 key={idx} 
                 className={`h-1.5 rounded-full transition-all duration-500 ${
                   idx === currentVideoIndex ? 'w-8 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]' : 'w-2 bg-white/30'
                 }`}
               />
             ))}
           </div>
        </div>
      </div>

      {/* =========================================================== */}
      {/* 🔐 LADO 2 (DERECHO): La Bóveda de Accesso (Login/Register) */}
      {/* =========================================================== */}
      <div className="relative z-20 flex flex-col items-center justify-center p-6 sm:p-10 min-h-screen bg-black shadow-[-20px_0_50px_-10px_rgba(0,0,0,0.8)]">
        
        <div className="w-full max-w-lg animate-in zoom-in-95 duration-700">
          
          <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 p-8 sm:p-12 rounded-3xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.7)] hover:border-cyan-500/20 transition-colors duration-300">
            
            <div className="text-center mb-10 flex flex-col items-center gap-3">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold tracking-widest uppercase mb-2 backdrop-blur-md shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                <Globe2 className="h-4 w-4" /> La Siguiente Generación SaaS
              </span>
              
              <h1 className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 tracking-tight drop-shadow-2xl">
                vital<span className="text-cyan-400">.</span>nexus
              </h1>
              
              <p className="text-slate-300 text-sm font-medium mt-1">
                {showRegisterForm ? t('auth.subtitleRegister') : t('auth.subtitleLogin')}
              </p>
            </div>

            <div className="mb-6 hover:scale-105 transition-transform">
               <GoogleAuthButton onLoginSuccess={handleGoogleSuccess} />
            </div>

            <div className="relative flex items-center mb-6">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-bold tracking-widest uppercase">{t('auth.orEmail')}</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 shadow-inner mb-6">
              {showRegisterForm ? (
                <RegisterForm apiBaseUrl={apiBaseUrl} onRegisterSuccess={() => setShowRegisterForm(false)} />
              ) : (
                <LoginForm onLoginSuccess={onLoginSuccess} apiBaseUrl={apiBaseUrl} />
              )}
            </div>

            <div className="text-center pt-2 border-t border-white/10 mt-6">
              <p className="text-slate-300 text-sm font-medium">
                {showRegisterForm ? t('auth.alreadyAccount') : t('auth.noAccount')}
                <Button variant="link" onClick={() => setShowRegisterForm(!showRegisterForm)} className="ml-2 text-cyan-400 hover:text-cyan-300 font-black p-0 text-sm transition-colors">
                  {showRegisterForm ? t('auth.loginHere') : t('auth.registerNow')}
                </Button>
              </p>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}

export default AuthPage;