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
  CheckCircle2 // 🛠️ ¡AQUÍ ESTABA EL CULPABLE DEL ERROR!
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

  // --- 🦾 EXTRAER IDENTIDAD DEL USUARIO ---
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
      
      {/* 🏆 BANNER DE LICENCIA 🏆 */}
      <div className={`rounded-2xl p-5 text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center justify-between border-b-4 transition-all duration-500 ${
        timeLeft === "LICENCIA ACTIVA" 
          ? "bg-gradient-to-r from-blue-700 via-indigo-800 to-indigo-950 border-indigo-500" 
          : timeLeft === "EXPIRADO" 
            ? "bg-black border-gray-800" 
            : "bg-gradient-to-r from-orange-500 to-red-600 border-red-700"
      }`}>
        <div className="flex items-center gap-4">
          <div className="bg-white/10 p-3 rounded-full backdrop-blur-sm border border-white/20">
            <Clock className={`h-6 w-6 text-white ${timeLeft !== "EXPIRADO" && timeLeft !== "LICENCIA ACTIVA" ? "animate-pulse text-red-200" : ""}`} />
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              {statistics?.plan_tipo === "TRIAL_24H" || statistics?.es_prueba ? "Licencia de Prueba" : "Licencia Profesional"}
              <span className="text-indigo-300">|</span> 
              <span className="text-emerald-300 normal-case tracking-normal text-base font-black">¡Hola, {userName} 👋!</span>
            </p>
            <p className="text-xs text-indigo-200 font-medium mt-0.5">
              {timeLeft === "EXPIRADO" ? "Acceso restringido. Contacte a soporte." : "Plataforma operativa y blindada."}
            </p>
          </div>
        </div>
        <div className="text-right bg-black/20 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10">
          <p className="text-2xl font-mono font-black tracking-tight">{timeLeft}</p>
          <p className="text-[10px] uppercase font-bold tracking-widest text-indigo-200 mt-1">Estado de Red</p>
        </div>
      </div>

      {/* 📊 TARJETAS DE INDICADORES (KPIs) - NIVEL ENTERPRISE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        
        <Card className="!bg-white/40 !backdrop-blur-xl border !border-white/60 border-l-4 border-l-blue-500 !shadow-lg hover:!shadow-2xl hover:-translate-y-1 transition-all duration-300 rounded-2xl group">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest">Clientes</CardTitle>
            <div className="bg-blue-500/10 p-2.5 rounded-xl border border-blue-500/20 group-hover:scale-110 transition-transform duration-300">
              <Users size={20} className="text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-800 tracking-tight">{statistics?.total_clientes_activos || 0}</div>
          </CardContent>
        </Card>

        <Card className="!bg-white/40 !backdrop-blur-xl border !border-white/60 border-l-4 border-l-emerald-500 !shadow-lg hover:!shadow-2xl hover:-translate-y-1 transition-all duration-300 rounded-2xl group">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest">Pólizas</CardTitle>
            <div className="bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 group-hover:scale-110 transition-transform duration-300">
              <ShieldCheck size={20} className="text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-800 mb-2">{statistics?.total_polizas_activas || 0} <span className="text-xs font-bold text-slate-500 tracking-wide uppercase ml-1">Activas</span></div>
            <div className="flex flex-col space-y-1 mt-2 bg-white/30 p-2 rounded-lg border border-white/50">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Primas:</span>
                <span className="text-sm font-black text-emerald-700">{formatMoney(statistics?.total_primas || 0, currencySymbol, currentLanguage)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Comisión:</span>
                <span className="text-sm font-black text-indigo-700">{formatMoney(statistics?.total_comisiones || 0, currencySymbol, currentLanguage)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="!bg-white/40 !backdrop-blur-xl border !border-white/60 border-l-4 border-l-red-500 !shadow-lg hover:!shadow-2xl hover:-translate-y-1 transition-all duration-300 rounded-2xl group">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest">Siniestros</CardTitle>
            <div className="bg-red-500/10 p-2.5 rounded-xl border border-red-500/20 group-hover:scale-110 transition-transform duration-300">
              <AlertCircle size={20} className="text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-red-600 tracking-tight">{statistics?.total_reclamaciones_pendientes || 0}</div>
            <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider mt-1 bg-red-50 inline-block px-2 py-1 rounded-md border border-red-100">Casos Pendientes</p>
          </CardContent>
        </Card>

        <Card className="!bg-white/40 !backdrop-blur-xl border !border-white/60 border-l-4 border-l-indigo-500 !shadow-lg hover:!shadow-2xl hover:-translate-y-1 transition-all duration-300 rounded-2xl group">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest">Red</CardTitle>
            <div className="bg-indigo-500/10 p-2.5 rounded-xl border border-indigo-500/20 group-hover:scale-110 transition-transform duration-300">
              <Building2 size={20} className="text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between bg-white/30 p-2 rounded-lg border border-white/50">
                <span className="text-sm font-black text-slate-800">{statistics?.total_asesores_activos || 0}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Asesores</span>
              </div>
              <div className="flex items-center justify-between bg-white/30 p-2 rounded-lg border border-white/50">
                <span className="text-sm font-black text-indigo-800">{statistics?.total_empresas_activas || 0}</span>
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">Compañías</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="!bg-white/40 !backdrop-blur-xl border !border-white/60 border-l-4 border-l-rose-500 !shadow-lg hover:!shadow-2xl hover:-translate-y-1 transition-all duration-300 rounded-2xl group">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-widest">Ratio</CardTitle>
            <div className="bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20 group-hover:scale-110 transition-transform duration-300">
              <Activity size={20} className="text-rose-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-black tracking-tight ${getRatioColor(lossRatio.ratio).split(' ')[0]}`}>
              {lossRatio.ratio}%
            </div>
            <div className="mt-2 bg-white/30 p-2 rounded-lg border border-white/50 space-y-2">
                <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <span>Pagos:</span>
                    <span className="text-rose-700">{formatMoney(lossRatio.totalSiniestros, currencySymbol, currentLanguage)}</span>
                </div>
                <div className="w-full bg-slate-200/50 rounded-full h-1.5 overflow-hidden border border-white/30">
                    <div 
                        className={`h-full rounded-full transition-all duration-1000 ${getRatioColor(lossRatio.ratio).split(' ')[1]}`} 
                        style={{ width: `${Math.min(lossRatio.ratio, 100)}%` }}
                    ></div>
                </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* 📈 GRÁFICOS CON CRISTAL ESMERILADO (GLASSMORPHISM) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <Card className="!bg-white/30 !backdrop-blur-xl border !border-white/50 !shadow-xl p-5 h-[360px] relative rounded-2xl hover:!shadow-2xl transition-shadow duration-300">
          <h4 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-6 flex items-center gap-3">
            <div className="bg-indigo-500/10 p-2 rounded-lg"><PieChartIcon size={16} className="text-indigo-600"/></div>
            Balance Primas vs Siniestros
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
                  stroke="rgba(255,255,255,0.5)"
                  strokeWidth={2}
                >
                  {(hasPieData ? pieData : [{ color: '#10b981' }, { color: '#ef4444' }]).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                {hasPieData && <Tooltip formatter={(value) => formatMoney(value, currencySymbol, currentLanguage)} contentStyle={{borderRadius: '12px', border: '1px solid rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)'}}/>}
                {hasPieData && <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '12px', fontWeight: 'bold', color: '#475569'}} />}
              </PieChart>
            </ResponsiveContainer>
          </div>

          {!hasPieData && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-slate-800/80 backdrop-blur-md text-amber-400 text-sm font-bold rounded-full px-6 py-3 shadow-xl flex items-center gap-2 border border-white/10">
                ✨ Simulación de Escenario
              </div>
            </div>
          )}
        </Card>

        <Card className="!bg-white/30 !backdrop-blur-xl border !border-white/50 !shadow-xl p-5 h-[360px] relative rounded-2xl hover:!shadow-2xl transition-shadow duration-300">
          <h4 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-6 flex items-center gap-3">
            <div className="bg-blue-500/10 p-2 rounded-lg"><BarChart3 size={16} className="text-blue-600"/></div>
            Capacidad Operativa
          </h4>
          
          <div className={`w-full h-full pb-14 transition-opacity duration-300 ${!hasBarData ? 'opacity-30' : 'opacity-100'}`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hasBarData ? barData : [
                { name: 'Clientes', total: 4 },
                { name: 'Pólizas', total: 2 },
                { name: 'Asesores', total: 3 },
                { name: 'Empresas', total: 1 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 'bold'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 'bold'}} dx={-10} />
                {hasBarData && <Tooltip cursor={{fill: 'rgba(255,255,255,0.4)'}} contentStyle={{borderRadius: '12px', border: '1px solid rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)'}}/>}
                <Bar dataKey="total" fill="#3b82f6" radius={[6, 6, 6, 6]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {!hasBarData && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-slate-800/80 backdrop-blur-md text-amber-400 text-sm font-bold rounded-full px-6 py-3 shadow-xl flex items-center gap-2 border border-white/10">
                ✨ Simulación de Escenario
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* 📅 TABLA DE AGENDA - CRISTAL TOTAL */}
      <Card className="!bg-white/40 !backdrop-blur-xl border !border-white/50 border-t-4 border-t-amber-500 !shadow-xl rounded-2xl overflow-hidden">
        <CardHeader className="bg-amber-500/10 border-b border-white/40 pb-5">
          <CardTitle className="text-lg font-black text-amber-900 flex items-center gap-3">
            <div className="bg-amber-500/20 p-2 rounded-lg border border-amber-500/30"><CalendarDays className="h-6 w-6 text-amber-700" /></div>
            Agenda Estratégica de Renovaciones (30 Días)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {upcomingPolicies.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-bold tracking-wide uppercase bg-transparent">
              <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-3 opacity-50" />
              Tu cartera está al día. No hay vencimientos próximos.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse bg-transparent">
                <thead className="bg-white/30 border-b border-white/40">
                  <tr>
                    <th className="p-5 font-black text-slate-600 uppercase tracking-widest text-[10px]">Póliza / Contrato</th>
                    <th className="p-5 font-black text-slate-600 uppercase tracking-widest text-[10px]">Plazo de Vencimiento</th>
                    <th className="p-5 font-black text-slate-600 uppercase tracking-widest text-[10px]">Prima a Renovar</th>
                    <th className="p-5 font-black text-slate-600 uppercase tracking-widest text-[10px] text-right">Ejecución</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/40">
                  {upcomingPolicies.map((poliza) => {
                    const hoy = new Date();
                    const fechaFin = new Date(poliza.fecha_fin);
                    const diffTime = fechaFin - hoy;
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    const esUrgente = diffDays <= 7;

                    return (
                      <tr key={poliza.id} className="hover:bg-amber-500/10 transition-colors duration-200">
                        <td className="p-5">
                          <div className="font-black text-indigo-900 text-base">{poliza.numero_poliza}</div>
                          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">{poliza.tipo_poliza}</div>
                        </td>
                        <td className="p-5">
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1.5 rounded-lg text-xs font-black tracking-wider uppercase border ${esUrgente ? 'bg-red-500/20 text-red-800 border-red-500/30 animate-pulse shadow-sm' : 'bg-amber-500/20 text-amber-800 border-amber-500/30'}`}>
                              {diffDays > 0 ? `Quedan ${diffDays} días` : 'VENCE HOY'}
                            </span>
                            <span className="text-slate-600 font-bold text-xs">
                              ({fechaFin.toLocaleDateString('es-ES')})
                            </span>
                          </div>
                        </td>
                        <td className="p-5 font-black text-slate-800 text-base">
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