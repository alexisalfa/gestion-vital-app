// src/components/Dashboard.jsx
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
  MessageCircle,
  CheckCircle2
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

  // --- LÓGICA DEL RELOJ DINÁMICO (Intacta) ---
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

  // --- 🦾 EXTRAER IDENTIDAD DEL USUARIO (Intacta) ---
  const getUserDisplayName = () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        if (user.full_name && user.full_name !== "Usuario Nuevo") {
          return user.full_name.split(' ')[0]; 
        }
        if (user.email) return user.email.split('@')[0].toUpperCase();
      }
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

  // --- LÓGICA DE COLORES DE RATIO (Adaptada para fondo oscuro) ---
  const getRatioColor = (ratio) => {
    if (ratio < 30) return 'text-emerald-400 bg-emerald-500/20';
    if (ratio < 60) return 'text-orange-400 bg-orange-500/20';
    return 'text-rose-400 bg-rose-500/20';
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
      <div className={`rounded-2xl p-5 text-white shadow-[0_8px_30px_rgb(0,0,0,0.3)] flex items-center justify-between border border-white/5 border-b-4 transition-all duration-500 ${
        timeLeft === "LICENCIA ACTIVA" 
          ? "bg-gradient-to-r from-blue-700 via-indigo-900 to-slate-900 border-indigo-950" 
          : timeLeft === "EXPIRADO" 
            ? "bg-black border-gray-800" 
            : "bg-gradient-to-r from-orange-500 to-red-600 border-red-700"
      }`}>
        <div className="flex items-center gap-4">
          <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/20">
            <Clock className={`h-6 w-6 text-white ${timeLeft !== "EXPIRADO" && timeLeft !== "LICENCIA ACTIVA" ? "animate-pulse" : ""}`} />
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-tight flex items-center gap-2">
              {statistics?.plan_tipo === "TRIAL_24H" || statistics?.es_prueba ? "Licencia de Prueba" : "Licencia Profesional"}
              <span className="text-blue-200">|</span> 
              <span className="text-emerald-400 normal-case tracking-normal font-black text-base">¡Hola, {userName} 👋!</span>
            </p>
            <p className="text-xs text-indigo-200 font-medium">
              {timeLeft === "EXPIRADO" ? "Acceso restringido. Contacte a soporte." : "Tiempo restante para la activación total."}
            </p>
          </div>
        </div>
        <div className="text-right bg-black/20 p-3 rounded-xl backdrop-blur-sm border border-white/10">
          <p className="text-2xl font-mono font-black">{timeLeft}</p>
          <p className="text-[10px] uppercase font-bold tracking-widest text-indigo-300">Estado del Servicio</p>
        </div>
      </div>

      {/* 📊 TARJETAS DE INDICADORES (KPIs) - CRISTAL ENTERPRISE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        
        <Card className="bg-slate-900/40 backdrop-blur-xl !border !border-white/10 border-l-4 border-l-blue-500 !shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] transition-all duration-300 ease-in-out hover:scale-[1.03] hover:!-translate-y-1 hover:!border-white/20 group rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest">Clientes</CardTitle>
            <div className="bg-blue-500/15 p-2.5 rounded-xl border border-blue-500/20 group-hover:scale-110 transition-transform">
              <Users size={20} className="text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-white tracking-tight drop-shadow-md">{statistics?.total_clientes_activos || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 backdrop-blur-xl !border !border-white/10 border-l-4 border-l-emerald-500 !shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] transition-all duration-300 ease-in-out hover:scale-[1.03] hover:!-translate-y-1 hover:!border-white/20 group rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pólizas & Ganancia</CardTitle>
            <div className="bg-emerald-500/15 p-2.5 rounded-xl border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <ShieldCheck size={20} className="text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-white mb-2 drop-shadow-md">{statistics?.total_polizas_activas || 0} <span className="text-sm font-normal text-slate-400 tracking-normal ml-1">registradas</span></div>
            <div className="flex flex-col space-y-1 mt-1 bg-white/5 p-2.5 rounded-lg border border-white/10">
              <span className="text-sm text-emerald-400 font-extrabold uppercase tracking-wide">
                Primas: <span className="text-lg ml-1 text-white">{formatMoney(statistics?.total_primas || 0, currencySymbol, currentLanguage)}</span>
              </span>
              <span className="text-sm text-indigo-400 font-extrabold uppercase tracking-wide">
                Comisión: <span className="text-lg ml-1 text-white">{formatMoney(statistics?.total_comisiones || 0, currencySymbol, currentLanguage)}</span>
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 backdrop-blur-xl !border !border-white/10 border-l-4 border-l-red-500 !shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] transition-all duration-300 ease-in-out hover:scale-[1.03] hover:!-translate-y-1 hover:!border-white/20 group rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest">Siniestros</CardTitle>
            <div className="bg-red-500/15 p-2.5 rounded-xl border border-red-500/20 group-hover:scale-110 transition-transform">
              <AlertCircle size={20} className="text-red-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-red-400 tracking-tight drop-shadow-md">{statistics?.total_reclamaciones_pendientes || 0}</div>
            <p className="text-[10px] text-red-300 italic font-medium uppercase tracking-tighter mt-1">Trámite pendiente</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 backdrop-blur-xl !border !border-white/10 border-l-4 border-l-indigo-500 !shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] transition-all duration-300 ease-in-out hover:scale-[1.03] hover:!-translate-y-1 hover:!border-white/20 group rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest">Red Operativa</CardTitle>
            <div className="bg-indigo-500/15 p-2.5 rounded-xl border border-indigo-500/20 group-hover:scale-110 transition-transform">
              <Building2 size={20} className="text-indigo-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col text-sm font-bold space-y-1.5">
              <span className="text-white bg-white/5 p-2 rounded-lg border border-white/10 flex justify-between">{statistics?.total_asesores_activos || 0} <span className="font-normal text-slate-400 tracking-normal text-xs mt-1">Asesores</span></span>
              <span className="text-indigo-300 bg-white/5 p-2 rounded-lg border border-white/10 flex justify-between">{statistics?.total_empresas_activas || 0} <span className="font-normal text-indigo-400 tracking-normal text-xs mt-1">Aseguradoras</span></span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 backdrop-blur-xl !border !border-white/10 border-l-4 border-l-rose-500 !shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] transition-all duration-300 ease-in-out hover:scale-[1.03] hover:!-translate-y-1 hover:!border-white/20 group rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest">Siniestralidad</CardTitle>
            <div className="bg-rose-500/15 p-2.5 rounded-xl border border-rose-500/20 group-hover:scale-110 transition-transform">
              <Activity size={20} className="text-rose-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-black drop-shadow-md ${getRatioColor(lossRatio.ratio).split(' ')[0]}`}>
              {lossRatio.ratio}%
            </div>
            <div className="mt-2 space-y-2 bg-white/5 p-2.5 rounded-lg border border-white/10">
                <div className="flex justify-between text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                    <span>Pagado:</span>
                    <span className="text-rose-400">{formatMoney(lossRatio.totalSiniestros, currencySymbol, currentLanguage)}</span>
                </div>
                <div className="w-full bg-slate-800/60 rounded-full h-1.5 overflow-hidden border border-white/5 shadow-inner">
                    <div 
                        className={`h-full rounded-full transition-all duration-1000 ${getRatioColor(lossRatio.ratio).split(' ')[1]}`} 
                        style={{ width: `${Math.min(lossRatio.ratio, 100)}%` }}
                    ></div>
                </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* 📈 GRÁFICOS - Cristal Puro con Títulos Adaptados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <Card className="bg-slate-900/40 backdrop-blur-xl !border !border-white/10 !shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-2xl p-5 h-[360px] relative transition-all duration-300 ease-in-out hover:!border-white/20">
          <h4 className="text-sm font-black mb-6 flex items-center gap-2.5 text-slate-100 uppercase tracking-widest">
            <div className="bg-indigo-500/15 p-2 rounded-lg border border-indigo-500/20"><PieChartIcon size={16} className="text-indigo-400"/></div> Ratio Primas vs Siniestros
          </h4>
          
          <div className={`w-full h-full pb-14 transition-opacity duration-300 ${!hasPieData ? 'opacity-30' : 'opacity-100'}`}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={hasPieData ? pieData : [{ name: 'Primas Activas', value: 50, color: '#10b981' }, { name: 'Reclamaciones', value: 50, color: '#ef4444' }]} 
                  innerRadius={65} 
                  outerRadius={90} 
                  paddingAngle={5} 
                  dataKey="value"
                  stroke="rgba(0,0,0,0.2)"
                  strokeWidth={2}
                >
                  {(hasPieData ? pieData : [{ color: '#10b981' }, { color: '#ef4444' }]).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                {hasPieData && <Tooltip formatter={(value) => formatMoney(value, currencySymbol, currentLanguage)} contentStyle={{backgroundColor: 'rgba(10, 15, 28, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px'}} itemStyle={{color: '#fff', fontSize: '12px'}} labelStyle={{color: '#aaa'}}/>}
                {hasPieData && <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{color: '#cbd5e1', fontSize: '12px', fontWeight: 'bold'}}/>}
              </PieChart>
            </ResponsiveContainer>
          </div>

          {!hasPieData && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-slate-800 text-amber-400 text-sm font-bold rounded-full px-6 py-3 shadow-xl flex items-center gap-2 border border-white/5 backdrop-blur-sm">
                ✨ Simulación de lo que esperas
              </div>
            </div>
          )}
        </Card>

        <Card className="bg-slate-900/40 backdrop-blur-xl !border !border-white/10 !shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-2xl p-5 h-[360px] relative transition-all duration-300 ease-in-out hover:!border-white/20">
          <h4 className="text-sm font-black mb-6 flex items-center gap-2.5 text-slate-100 uppercase tracking-widest">
            <div className="bg-blue-500/15 p-2 rounded-lg border border-blue-500/20"><BarChart3 size={16} className="text-blue-400"/></div> Distribución Operativa
          </h4>
          
          <div className={`w-full h-full pb-14 transition-opacity duration-300 ${!hasBarData ? 'opacity-30' : 'opacity-100'}`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hasBarData ? barData : [
                { name: 'Clientes', total: 4 },
                { name: 'Pólizas', total: 2 },
                { name: 'Asesores', total: 3 },
                { name: 'Empresas', total: 1 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'bold'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'bold'}} dx={-10} />
                {hasBarData && <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: 'rgba(10, 15, 28, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px'}} itemStyle={{color: '#fff', fontSize: '12px'}} labelStyle={{color: '#aaa'}} />}
                <Bar dataKey="total" fill="#3b82f6" radius={[6, 6, 6, 6]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {!hasBarData && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-slate-800 text-amber-400 text-sm font-bold rounded-full px-6 py-3 shadow-xl flex items-center gap-2 border border-white/5 backdrop-blur-sm">
                ✨ Simulación de lo que esperas
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* 📅 TABLA DE AGENDA - Cristal Total con Bordes Iluminados */}
      <Card className="!bg-slate-900/30 backdrop-blur-xl !border !border-white/10 !border-t-4 border-t-amber-500 !shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-2xl overflow-hidden transition-all duration-300 ease-in-out hover:!border-white/20">
        <CardHeader className="bg-amber-500/10 border-b border-white/10 pb-5">
          <CardTitle className="text-lg font-black text-amber-200 flex items-center gap-3">
            <div className="bg-amber-500/15 p-2 rounded-xl border border-amber-500/20"><CalendarDays className="h-6 w-6 text-amber-400" /></div>
            Agenda Estratégica de Renovaciones Próximas (30 Días)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {upcomingPolicies.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-bold uppercase tracking-wider bg-transparent">
              <CheckCircle2 size={30} className="mx-auto mb-4 text-emerald-500 opacity-60" />
              No tienes pólizas por vencer en los próximos 30 días. ¡Todo al día!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse bg-transparent">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="p-5 font-black text-slate-300 uppercase tracking-widest text-[10px]">Póliza / Contrato</th>
                    <th className="p-5 font-black text-slate-300 uppercase tracking-widest text-[10px]">Plazo de Vencimiento</th>
                    <th className="p-5 font-black text-slate-300 uppercase tracking-widest text-[10px]">Prima a Renovar</th>
                    <th className="p-5 font-black text-slate-300 uppercase tracking-widest text-[10px] text-right">Ejecución</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {upcomingPolicies.map((poliza) => {
                    const hoy = new Date();
                    const fechaFin = new Date(poliza.fecha_fin);
                    const diffTime = fechaFin - hoy;
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    const esUrgente = diffDays <= 7;

                    return (
                      <tr key={poliza.id} className="hover:bg-amber-500/10 transition-colors duration-200">
                        <td className="p-5">
                          <div className="font-black text-indigo-200 text-base">{poliza.numero_poliza}</div>
                          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{poliza.tipo_poliza}</div>
                        </td>
                        <td className="p-5">
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1.5 rounded-lg text-xs font-black tracking-wider uppercase border ${esUrgente ? 'bg-red-500/20 text-red-200 border-red-500/30 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.4)]' : 'bg-amber-500/20 text-amber-200 border-amber-500/30'}`}>
                              {diffDays > 0 ? `Quedan ${diffDays} días` : 'VENCE HOY'}
                            </span>
                            <span className="text-slate-500 font-bold text-xs">
                              ({fechaFin.toLocaleDateString('es-ES')})
                            </span>
                          </div>
                        </td>
                        <td className="p-5 font-black text-white text-base">
                          {formatMoney(poliza.prima, currencySymbol, currentLanguage)}
                        </td>
                        <td className="p-5 text-right">
                          <Button 
                            onClick={() => handleWhatsAppRenovacion(poliza)}
                            size="sm"
                            className="bg-[#25D366] hover:bg-[#1ea952] text-white shadow-lg font-bold rounded-xl px-4 py-5 transition-transform hover:-translate-y-0.5"
                          >
                            <MessageCircle className="h-5 w-5 mr-2" />
                            Gestionar WA
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
};

export default Dashboard;