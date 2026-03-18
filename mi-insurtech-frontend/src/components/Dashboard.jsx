// src/components/Dashboard.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, ShieldCheck, AlertCircle, Clock, Building2, Activity,
  PieChart as PieChartIcon, BarChart3, TrendingDown, CalendarDays, MessageCircle
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area
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

  // --- RELOJ DINÁMICO ---
  useEffect(() => {
    if (isLoadingStats) { setTimeLeft("Cargando..."); return; }
    if (!statistics || Object.keys(statistics).length === 0) { setTimeLeft("EXPIRADO"); return; }
    const esTrial = statistics?.plan_tipo === "TRIAL_24H" || statistics?.es_prueba === true;
    if (!esTrial || !statistics?.fecha_vencimiento) { setTimeLeft("LICENCIA ACTIVA"); return; }

    const timer = setInterval(() => {
      const distance = new Date(statistics.fecha_vencimiento).getTime() - new Date().getTime();
      if (distance <= 0) { clearInterval(timer); setTimeLeft("EXPIRADO"); return; }
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(timer);
  }, [statistics, isLoadingStats]);

  // --- RECONSTRUCCIÓN DE LOS 3 GRÁFICOS ORIGINALES ---
  
  // 1. Gráfico de Dona (Estado de Pólizas)
  const pieData = useMemo(() => [
    { name: 'Activas', value: statistics?.polizas_activas || 85, color: '#34d399' }, 
    { name: 'Inactivas', value: statistics?.polizas_inactivas || 5, color: '#cbd5e1' }, 
    { name: 'Vencidas', value: statistics?.polizas_vencidas || 10, color: '#fda4af' } 
  ], [statistics]);
  const hasPieData = statistics?.polizas_activas > 0;

  // 2. Gráfico de Barras Horizontal (Top Aseguradoras)
  const barData = useMemo(() => {
    if (statistics?.top_aseguradoras && statistics.top_aseguradoras.length > 0) return statistics.top_aseguradoras;
    return [
      { name: 'Seguros Caracas', total: 45 },
      { name: 'Mercantil', total: 30 },
      { name: 'Mapfre', total: 25 },
      { name: 'Banesco', total: 15 },
      { name: 'Zuma', total: 5 }
    ];
  }, [statistics]);
  const hasBarData = statistics?.top_aseguradoras && statistics.top_aseguradoras.length > 0;

  // 3. Gráfico de Área (Siniestralidad: Monto vs Casos)
  const areaData = useMemo(() => {
    if (statistics?.siniestros_mensuales && statistics.siniestros_mensuales.length > 0) return statistics.siniestros_mensuales;
    return [
      { mes: 'Oct 25', monto: 2000, casos: 2 }, { mes: 'Nov 25', monto: 4000, casos: 4 },
      { mes: 'Dic 25', monto: 3000, casos: 3 }, { mes: 'Ene 26', monto: 8000, casos: 8 },
      { mes: 'Feb 26', monto: 3500, casos: 3 }, { mes: 'Mar 26', monto: 6000, casos: 6 }
    ];
  }, [statistics]);
  const hasAreaData = statistics?.siniestros_mensuales && statistics.siniestros_mensuales.length > 0;

  const getRatioColor = (ratio) => {
    if (ratio < 30) return 'text-emerald-600 bg-emerald-500';
    if (ratio < 60) return 'text-orange-600 bg-orange-500';
    return 'text-rose-600 bg-rose-500';
  };

  const handleWhatsAppRenovacion = (poliza) => {
    const telefono = poliza.cliente?.telefono || poliza.telefono_cliente || ""; 
    const nombre = poliza.cliente?.nombre ? `${poliza.cliente.nombre} ${poliza.cliente.apellido || ''}` : "Estimado Cliente";
    if (!telefono) { alert("El cliente no tiene un teléfono registrado."); return; }
    const tlfLimpio = telefono.replace(/\D/g, '');
    const fechaFin = new Date(poliza.fecha_fin).toLocaleDateString('es-ES');
    const mensaje = `Hola ${nombre.trim()}, soy tu asesor de Gestión Vital 🛡️. Te recuerdo que tu póliza Nro: *${poliza.numero_poliza}* vence el *${fechaFin}*. ¿Deseas que te apoye gestionando la renovación?`;
    window.open(`https://wa.me/${tlfLimpio}?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* BANNER LICENCIA */}
      <div className={`rounded-xl p-4 text-white shadow-lg flex items-center justify-between border-b-4 transition-colors duration-500 ${
        timeLeft === "LICENCIA ACTIVA" ? "bg-gradient-to-r from-blue-700 to-indigo-900 border-indigo-950" : timeLeft === "EXPIRADO" ? "bg-black border-gray-800" : "bg-gradient-to-r from-orange-500 to-red-600 border-red-700"
      }`}>
        <div className="flex items-center gap-3">
          <Clock className={`h-6 w-6 ${timeLeft !== "EXPIRADO" && timeLeft !== "LICENCIA ACTIVA" ? "animate-pulse" : ""}`} />
          <div>
            <p className="text-sm font-bold uppercase tracking-tight">{statistics?.plan_tipo === "TRIAL_24H" || statistics?.es_prueba ? "Licencia de Prueba" : "Licencia Profesional"}</p>
            <p className="text-xs opacity-90 italic">{timeLeft === "EXPIRADO" ? "Acceso restringido. Contacte a soporte." : "Tiempo restante para la activación total."}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-mono font-bold">{timeLeft}</p>
          <p className="text-[10px] uppercase font-bold tracking-widest">Estado del Servicio</p>
        </div>
      </div>

      {/* 5 KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-blue-500 shadow-sm transition-all hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between pb-2 text-gray-500 uppercase"><CardTitle className="text-xs font-bold">Clientes</CardTitle><Users size={20} className="text-blue-500" /></CardHeader>
          <CardContent><div className="text-2xl font-bold text-gray-800">{statistics?.total_clientes_activos || 0}</div></CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-500 shadow-sm transition-all hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between pb-2 text-gray-500 uppercase"><CardTitle className="text-xs font-bold">Pólizas & Ganancia</CardTitle><ShieldCheck size={20} className="text-emerald-500" /></CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-gray-700 mb-2">{statistics?.total_polizas_activas || 0} <span className="text-sm font-normal text-gray-400">registradas</span></div>
            <div className="flex flex-col space-y-1 mt-1">
              <span className="text-sm text-emerald-600 font-extrabold uppercase tracking-wide">Primas: <span className="text-lg ml-1">{formatMoney(statistics?.total_primas || 0, currencySymbol, currentLanguage)}</span></span>
              <span className="text-sm text-indigo-600 font-extrabold uppercase tracking-wide">Comisión: <span className="text-lg ml-1">{formatMoney(statistics?.total_comisiones || 0, currencySymbol, currentLanguage)}</span></span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500 shadow-sm transition-all hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between pb-2 text-gray-500 uppercase"><CardTitle className="text-xs font-bold">Siniestros</CardTitle><AlertCircle size={20} className="text-red-500" /></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{statistics?.total_reclamaciones_pendientes || 0}</div>
            <p className="text-[10px] text-red-400 italic font-medium uppercase tracking-tighter">Trámite pendiente</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-indigo-500 shadow-sm transition-all hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between pb-2 text-gray-500 uppercase"><CardTitle className="text-xs font-bold">Red Operativa</CardTitle><Building2 size={20} className="text-indigo-500" /></CardHeader>
          <CardContent>
            <div className="flex flex-col text-sm font-bold space-y-1">
              <span className="text-gray-700">{statistics?.total_asesores_activos || 0} <span className="font-normal text-gray-500">Asesores</span></span>
              <span className="text-indigo-700">{statistics?.total_empresas_activas || 0} <span className="font-normal text-indigo-400">Aseguradoras</span></span>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-rose-500 shadow-sm transition-all hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between pb-2 text-gray-500 uppercase"><CardTitle className="text-xs font-bold">Siniestralidad</CardTitle><Activity size={20} className="text-rose-500" /></CardHeader>
          <CardContent>
            <div className={`text-2xl font-black ${getRatioColor(lossRatio.ratio).split(' ')[0]}`}>{lossRatio.ratio}%</div>
            <div className="mt-2 space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase"><span>Pagado:</span><span className="text-rose-600">{formatMoney(lossRatio.totalSiniestros, currencySymbol, currentLanguage)}</span></div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden"><div className={`h-full rounded-full transition-all duration-1000 ${getRatioColor(lossRatio.ratio).split(' ')[1]}`} style={{ width: `${Math.min(lossRatio.ratio, 100)}%` }}></div></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RECONSTRUCCIÓN: GRÁFICOS SUPERIORES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* GRÁFICO 1: ESTADO DE PÓLIZAS (DONA) */}
        <Card className="shadow-md border-none p-4 h-[350px] relative">
          <h4 className="text-sm font-bold mb-4 flex items-center gap-2"><PieChartIcon size={16} className="text-indigo-600"/> Estado de Pólizas</h4>
          <div className={`w-full h-full pb-10 transition-opacity duration-300 ${!hasPieData ? 'opacity-30' : 'opacity-100'}`}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {!hasPieData && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-gray-800 text-amber-400 text-sm font-bold rounded-full px-5 py-2.5 shadow-xl flex items-center gap-2">✨ Simulación de lo que esperas</div>
            </div>
          )}
        </Card>

        {/* GRÁFICO 2: TOP ASEGURADORAS (BARRAS HORIZONTALES) */}
        <Card className="shadow-md border-none p-4 h-[350px] relative">
          <h4 className="text-sm font-bold mb-4 flex items-center gap-2"><BarChart3 size={16} className="text-blue-600"/> Distribución por Aseguradora</h4>
          <div className={`w-full h-full pb-10 transition-opacity duration-300 ${!hasBarData ? 'opacity-30' : 'opacity-100'}`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={barData}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={110} axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <Tooltip cursor={{fill: '#f3f4f6'}} />
                <Bar dataKey="total" fill="#818cf8" radius={[0, 4, 4, 0]} barSize={25} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {!hasBarData && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-gray-800 text-amber-400 text-sm font-bold rounded-full px-5 py-2.5 shadow-xl flex items-center gap-2">✨ Simulación de lo que esperas</div>
            </div>
          )}
        </Card>
      </div>

      {/* RECONSTRUCCIÓN: GRÁFICO INFERIOR (ÁREA DE SINIESTRALIDAD) */}
      <Card className="shadow-md border-none p-6 relative">
        <h4 className="text-md font-bold mb-6 flex items-center gap-2"><TrendingDown size={18} className="text-rose-600"/> Siniestralidad: Reportes vs Montos Pagados</h4>
        <div className={`w-full h-[300px] transition-opacity duration-300 ${!hasAreaData ? 'opacity-30' : 'opacity-100'}`}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={areaData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMonto" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fca5a5" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#fca5a5" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorCasos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#cbd5e1" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#cbd5e1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
              <YAxis yAxisId="left" orientation="left" stroke="#cbd5e1" axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" stroke="#fca5a5" axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
              <Area yAxisId="right" type="monotone" dataKey="monto" name="Monto Pagado" stroke="#fca5a5" fillOpacity={1} fill="url(#colorMonto)" />
              <Area yAxisId="left" type="monotone" dataKey="casos" name="N° de Casos" stroke="#cbd5e1" fillOpacity={1} fill="url(#colorCasos)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        {!hasAreaData && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-gray-800 text-amber-400 text-sm font-bold rounded-full px-5 py-2.5 shadow-xl flex items-center gap-2">✨ Simulación de lo que esperas</div>
          </div>
        )}
      </Card>

      {/* AGENDA DE RENOVACIONES (NUEVO) */}
      <Card className="border-t-4 border-t-amber-500 shadow-md">
        <CardHeader className="bg-amber-50 border-b border-amber-100 pb-4">
          <CardTitle className="text-lg font-bold text-amber-900 flex items-center gap-2"><CalendarDays className="h-5 w-5 text-amber-600" /> Agenda de Renovaciones Próximas (30 Días)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {upcomingPolicies.length === 0 ? (
            <div className="p-8 text-center text-gray-500 font-medium bg-white">No tienes pólizas por vencer en los próximos 30 días. ¡Todo al día!</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse bg-white">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-4 font-bold text-gray-600 uppercase">Póliza / Tipo</th>
                    <th className="p-4 font-bold text-gray-600 uppercase">Vencimiento</th>
                    <th className="p-4 font-bold text-gray-600 uppercase">Prima a Renovar</th>
                    <th className="p-4 font-bold text-gray-600 uppercase text-right">Acción Comercial</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {upcomingPolicies.map((poliza) => {
                    const diffDays = Math.ceil((new Date(poliza.fecha_fin) - new Date()) / (1000 * 60 * 60 * 24));
                    return (
                      <tr key={poliza.id} className="hover:bg-amber-50/30 transition-colors">
                        <td className="p-4"><div className="font-bold text-indigo-700">{poliza.numero_poliza}</div><div className="text-xs text-gray-500">{poliza.tipo_poliza}</div></td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${diffDays <= 7 ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-amber-100 text-amber-700'}`}>{diffDays > 0 ? `En ${diffDays} días` : 'HOY'}</span>
                            <span className="text-gray-600 font-medium">({new Date(poliza.fecha_fin).toLocaleDateString('es-ES')})</span>
                          </div>
                        </td>
                        <td className="p-4 font-bold text-gray-800">{formatMoney(poliza.prima, currencySymbol, currentLanguage)}</td>
                        <td className="p-4 text-right">
                          <Button onClick={() => handleWhatsAppRenovacion(poliza)} size="sm" className="bg-[#25D366] hover:bg-[#1da851] text-white shadow-sm font-bold"><MessageCircle className="h-4 w-4 mr-2" /> Cobrar</Button>
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