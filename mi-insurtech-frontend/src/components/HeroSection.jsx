import React from 'react';
import { Shield, Activity, Building2, ArrowRight, Globe2, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function HeroSection() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black font-sans">
      
      {/* 1. LA CAPA BASE: El Video de la Cúpula Futurista (Carga Local) */}
      <video 
        autoPlay 
        loop 
        muted 
        playsInline 
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      >
        {/* 🚀 Apuntando a la carpeta public/assets/video de su proyecto */}
        <source src="/assets/video/nexus-hero.mp4" type="video/mp4" />
        Tu navegador no soporta la etiqueta de video.
      </video>

      {/* 2. EL FILTRO: Cristal Oscurecido (Glassmorphism) para legibilidad */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/80 via-black/50 to-black/90 z-10 backdrop-blur-[2px]"></div>

      {/* 3. LA CAPA FRONTAL: El Mensaje del Holding */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen px-6 text-center max-w-6xl mx-auto">
        
        {/* Etiqueta Superior */}
        <div className="animate-in slide-in-from-top-10 fade-in duration-1000 delay-150">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-cyan-400 text-sm font-bold tracking-widest uppercase mb-6 backdrop-blur-md shadow-[0_0_15px_rgba(34,211,238,0.2)]">
            <Globe2 className="h-4 w-4" /> La Siguiente Generación SaaS
          </span>
        </div>

        {/* Título Principal */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 tracking-tight drop-shadow-2xl mb-6 animate-in zoom-in-95 fade-in duration-1000 delay-300">
          vital<span className="text-cyan-400">.</span>nexus
        </h1>

        {/* Subtítulo */}
        <p className="text-lg md:text-2xl text-slate-300 max-w-3xl font-medium leading-relaxed mb-12 animate-in slide-in-from-bottom-10 fade-in duration-1000 delay-500">
          El motor tecnológico centralizado que impulsa operaciones de alto rendimiento. 
          Una sola arquitectura, <span className="text-white font-bold">múltiples industrias</span>.
        </p>

        {/* Botones de Acción (CTAs) */}
        <div className="flex flex-col sm:flex-row gap-5 mb-20 animate-in fade-in duration-1000 delay-700">
          <button 
            onClick={() => navigate('/login')} 
            className="px-8 py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-lg flex items-center justify-center gap-3 transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(34,211,238,0.5)]"
          >
            Iniciar Sesión <ArrowRight className="h-5 w-5" />
          </button>
          <button className="px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-lg border border-white/20 backdrop-blur-md flex items-center justify-center gap-3 transition-all">
            Conocer la Arquitectura
          </button>
        </div>

        {/* Ecosistema de Subdominios (Tarjetas Glassmorphism) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full animate-in slide-in-from-bottom-20 fade-in duration-1000 delay-1000">
          
          {/* Card: Seguros */}
          <div className="bg-white/5 border border-white/10 hover:border-cyan-500/50 p-6 rounded-2xl backdrop-blur-xl text-left transition-all hover:-translate-y-2 group cursor-pointer shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] hover:shadow-[0_0_20px_rgba(34,211,238,0.2)]">
            <div className="bg-cyan-500/20 p-3 rounded-xl w-fit mb-4 group-hover:bg-cyan-500/30 transition-colors">
              <Shield className="h-6 w-6 text-cyan-400" />
            </div>
            <h3 className="text-white font-black text-xl mb-2">Nexus Insurance</h3>
            <p className="text-slate-400 text-sm font-medium">Gestión de carteras, pólizas y comisiones para agencias de seguros de alto nivel.</p>
            <div className="mt-4 text-cyan-400 text-xs font-bold tracking-widest uppercase">seguros.vital.nexus</div>
          </div>

          {/* Card: Salud */}
          <div className="bg-white/5 border border-white/10 hover:border-emerald-500/50 p-6 rounded-2xl backdrop-blur-xl text-left transition-all hover:-translate-y-2 group cursor-pointer shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <div className="bg-emerald-500/20 p-3 rounded-xl w-fit mb-4 group-hover:bg-emerald-500/30 transition-colors">
              <Activity className="h-6 w-6 text-emerald-400" />
            </div>
            <h3 className="text-white font-black text-xl mb-2">Nexus Medical</h3>
            <p className="text-slate-400 text-sm font-medium">Control de pacientes, citas y liquidaciones para clínicas y centros de salud.</p>
            <div className="mt-4 text-emerald-400 text-xs font-bold tracking-widest uppercase">medica.vital.nexus</div>
          </div>

          {/* Card: PropTech */}
          <div className="bg-white/5 border border-white/10 hover:border-amber-500/50 p-6 rounded-2xl backdrop-blur-xl text-left transition-all hover:-translate-y-2 group cursor-pointer shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <div className="bg-amber-500/20 p-3 rounded-xl w-fit mb-4 group-hover:bg-amber-500/30 transition-colors">
              <Building2 className="h-6 w-6 text-amber-400" />
            </div>
            <h3 className="text-white font-black text-xl mb-2">Nexus Realty</h3>
            <p className="text-slate-400 text-sm font-medium">Administración de propiedades, contratos y cobranzas inmobiliarias.</p>
            <div className="mt-4 text-amber-400 text-xs font-bold tracking-widest uppercase">inmuebles.vital.nexus</div>
          </div>

        </div>

      </div>

      {/* Flecha inferior para invitar a hacer scroll */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
        <ChevronDown className="h-8 w-8 text-white/50" />
      </div>

    </div>
  );
}

export default HeroSection;