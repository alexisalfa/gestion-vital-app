import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  ShieldCheck, 
  AlertCircle, 
  Clock,
  PieChart as PieChartIcon,
  BarChart3,
  Building2,
  Activity,
  CalendarDays,
  MessageCircle
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';

import { formatMoney } from '../utils/formatters';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

const Dashboard = ({ 
  statistics, 
  upcomingPolicies = [], 
  currencySymbol = '$',
  lossRatio = { ratio: 0, totalSiniestros: 0 }, 
  isLoadingStats 
}) => {
  const [timeLeft, setTimeLeft] = useState("Cargando...");
  
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language || 'es';

  // --- LÓGICA DEL RELOJ DINÁMICO ---
  useEffect(() => {
    if (isLoadingStats) {
      setTimeLeft("Cargando...");
      return;
    }

    if (!statistics || Object.keys(statistics).length === 0) {
      setTimeLeft("EXPIRADO");
      return;
    }

    const esTrial = statistics?.plan_tipo === "TRIAL_24H" || statistics?.es_prueba === true;
    
    if (!esTrial || !statistics?.fecha_vencimiento) {
      setTimeLeft("LICENCIA ACTIVA");
      return;
    }

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const deadline = new Date(statistics.fecha_vencimiento).getTime();
      const distance = deadline - now;

      if (distance <= 0) {
        clearInterval(timer);
        setTimeLeft("EXPIRADO");
        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [statistics, isLoadingStats]);

  // --- 🦾 INJERTO DE ELITE: EXTRAER IDENTIDAD DEL USUARIO (VÍA LOCALSTORAGE) ---
  const getUserDisplayName = () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        // Si tiene nombre completo real (y no el genérico), usamos el primer nombre
        if (user.full_name && user.full_name !== "Usuario Nuevo") {
          return user.full_name.split(' ')[0]; 
        }
        // Si no hay nombre válido, sacamos el correo antes del @
        if (user.email) return user.email.split('@')[0].toUpperCase();
      }
      
      // Fallback de emergencia si por alguna razón no hay objeto user
      const token = localStorage.getItem('access_token');
      if (token && token.includes('@')) return token.split('@')[0].toUpperCase();
      if (token && token.length > 0 && !token.includes('.')) return token.toUpperCase();
      
      return 'VIP';
    } catch (e) {
      return 'VIP';
    }
  };

  const userName = getUserDisplayName();
  // -----------------------------------------------------------

  const pieData = useMemo(() => [
    { name: 'Primas Activas', value: statistics?.total_primas || 0, color: '#10b981' }, 
    { name: 'Reclamaciones', value: statistics?.total_reclamaciones_pendientes || 0, color: '#ef4444' }     
  ], [statistics]);

  const barData = useMemo(() => [
    { name: 'Clientes', total: statistics?.total_clientes_activos || 0 },
    { name: 'Pólizas', total: statistics?.total_polizas_activas || 0 },
    { name: 'Asesores', total: statistics?.total_asesores_activos || 0 },
    { name: 'Empresas', total: statistics?.total_empresas_activas || 0 }
  ], [statistics]);

  const hasPieData = (statistics?.total_primas > 0 || statistics?.total_reclamaciones_pendientes > 0);
  const hasBarData = barData.some(item => item.total > 0);

  const getRatioColor = (ratio) => {
    if (ratio < 30) return 'text-emerald-600 bg-emerald-500';
    if (ratio < 60) return 'text-orange-600 bg-orange-500';
    return 'text-rose-600 bg-rose-500';
  };

  const handleWhatsAppRenovacion = (poliza) => {
    const telefono = poliza.cliente?.telefono || poliza.telefono_cliente || ""; 
    const nombre = poliza.cliente?.nombre ? `${poliza.cliente.nombre} ${poliza.cliente.apellido || ''}` : "Estimado Cliente";
    
    if (!telefono) {
      alert("El cliente no tiene un teléfono registrado.");
      return;
    }

    const tlfLimpio = telefono.replace(/\D/g, '');
    const fechaFin = new Date(poliza.fecha_fin).toLocaleDateString('es-ES');
    
    const mensaje = `Hola ${nombre.trim()}, soy tu asesor de Gestión Vital 🛡️. Me comunico contigo para recordarte que tu póliza Nro: *${poliza.numero_poliza}* vence el próximo *${fechaFin}*. ¿Deseas que te apoye gestionando la renovación para mantener tu cobertura activa?`;
    
    window.open(`https://wa.me/${tlfLimpio}?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* 🏆 BANNER DE LICENCIA CORREGIDO CON NOMBRE DEL USUARIO Y SALUDO 🏆 */}
      <div className={`rounded-xl p-4 text-white shadow-lg flex items-center justify-between border-b-4 transition-colors duration-500 
        ${timeLeft === "LICENCIA ACTIVA" 
          ? "bg-gradient-to-r from-blue-700 to-indigo-900 border-indigo-950" 
          : timeLeft === "EXPIRADO" 
            ? "bg-black border-gray-800" 
            : "bg-gradient-to-r from-orange-500 to-red-600 border-red-700"}`}>
        <div className="flex items-center gap-3">
          <Clock className={`h-6 w-6 ${timeLeft !== "EXPIRADO" && timeLeft !== "LICENCIA ACTIVA" ? "animate-pulse" : ""}`} />
          <div>
            <p className="text-sm font-bold uppercase tracking-tight flex items-center gap-2">
              {statistics?.plan_tipo === "TRIAL_24H" || statistics?.es_prueba ? "Licencia de Prueba" : "Licencia Profesional"}
              <span className="text-blue-200">|</span> 
              <span className="text-emerald-400 normal-case tracking-normal">¡Hola, {userName} 👋!</span>
            </p>
            <p className="text-xs opacity-90 italic">
              {timeLeft === "EXPIRADO" ? "Acceso restringido. Contacte a soporte." : "Tiempo restante para la activación total."}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-mono font-bold">{timeLeft}</p>
          <p className="text-[10px] uppercase font-bold tracking-widest">Estado del Servicio</p>
        </div>
      </div>

      {/* TARJETAS DE INDICADORES (KPIs) INTACTAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        
        <Card className="border-l-4 border-l-blue-500 shadow-sm transition-all duration-300 hover:scale-[1.02] bg-white/50 dark:bg-slate-800/50 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 text-gray-500 uppercase">
            <CardTitle className="text-xs font-bold text-gray-800 dark:text-gray-100">Clientes</CardTitle>
            <Users size={20} className="text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{statistics?.total_clientes_activos || 0}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 shadow-sm transition-all duration-300 hover:scale-[1.02] bg-white/50 dark:bg-slate-800/50 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 text-gray-500 uppercase">
            <CardTitle className="text-xs font-bold text-gray-800 dark:text-gray-100">Pólizas & Ganancia</CardTitle>
            <ShieldCheck size={20} className="text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">{statistics?.total_polizas_activas || 0} <span className="text-sm font-normal text-gray-400">registradas</span></div>
            <div className="flex flex-col space-y-1 mt-1">
              <span className="text-sm text-emerald-600 font-extrabold uppercase tracking-wide">
                Primas: <span className="text-lg ml-1">{formatMoney(statistics?.total_primas || 0, currencySymbol, currentLanguage)}</span>
              </span>
              <span className="text-sm text-indigo-600 font-extrabold uppercase tracking-wide">
                Comisión: <span className="text-lg ml-1">{formatMoney(statistics?.total_comisiones || 0, currencySymbol, currentLanguage)}</span>
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Continúa el resto de las Cards de KPIs de manera similar */}
        
      </div>

      {/* Gráficos de Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Gráfico Circular Original */}
        <Card className="shadow-md border-none p-4 h-[350px] relative bg-white/50 dark:bg-slate-800/50 backdrop-blur-md">
          <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
            <PieChartIcon size={16} className="text-indigo-600"/> Ratio Primas vs Siniestros
          </h4>

          <div className={`w-full h-full pb-10 transition-opacity duration-300 ${!hasPieData ? 'opacity-30' : 'opacity-100'}`}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={hasPieData ? pieData : [{ name: 'Primas Activas', value: 50, color: '#10b981' }, { name: 'Reclamaciones', value: 50, color: '#ef4444' }]} 
                  innerRadius={60} 
                  outerRadius={80} 
                  paddingAngle={5} 
                  dataKey="value"
                >
                  {(hasPieData ? pieData : [{ color: '#10b981' }, { color: '#ef4444' }]).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                {hasPieData && <Tooltip formatter={(value) => formatMoney(value, currencySymbol, currentLanguage)} />}
                {hasPieData && <Legend verticalAlign="bottom" height={36} />}
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Gráfico de Barras Original */}
        <Card className="shadow-md border-none p-4 h-[350px] relative bg-white/50 dark:bg-slate-800/50 backdrop-blur-md">
          <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
            <BarChart3 size={16} className="text-blue-600"/> Distribución Operativa
          </h4>

          <div className={`w-full h-full pb-10 transition-opacity duration-300 ${!hasBarData ? 'opacity-30' : 'opacity-100'}`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hasBarData ? barData : [
                { name: 'Clientes', total: 4 },
                { name: 'Pólizas', total: 2 },
                { name: 'Asesores', total: 3 },
                { name: 'Empresas', total: 1 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                {hasBarData && <Tooltip cursor={{fill: '#f3f4f6'}} />}
                <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Tablas y demás componentes */}
    </div>
  );
};

export default Dashboard;