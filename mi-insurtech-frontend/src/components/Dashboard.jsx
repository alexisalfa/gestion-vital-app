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
  Activity
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';

// Importamos nuestra nueva herramienta de formato de dinero
import { formatMoney } from '../utils/formatters';
// Importamos el motor de idiomas para saber qué formato usar (comas o puntos)
import { useTranslation } from 'react-i18next';

const Dashboard = ({ 
  statistics, 
  upcomingPolicies = [], 
  currencySymbol = '$',
  lossRatio = { ratio: 0, totalSiniestros: 0 } // RECIBIMOS EL DATO SIN BORRAR NADA
}) => {
  const [timeLeft, setTimeLeft] = useState("Cargando...");
  
  // Obtenemos el idioma actual del sistema (por defecto 'es')
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language || 'es';

  // --- LÓGICA DEL RELOJ DINÁMICO ---
  useEffect(() => {
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
  }, [statistics]);

  // --- DATOS DINÁMICOS PARA GRÁFICOS ---
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

  // Variables para validar si hay datos para mostrar en los gráficos
  const hasPieData = (statistics?.total_primas > 0 || statistics?.total_reclamaciones_pendientes > 0);

  // Función para determinar el color de la tarjeta nueva
  const getRatioColor = (ratio) => {
    if (ratio < 30) return 'text-emerald-600 bg-emerald-500';
    if (ratio < 60) return 'text-orange-600 bg-orange-500';
    return 'text-rose-600 bg-rose-500';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* BANNER DE LICENCIA DINÁMICO */}
      <div className={`rounded-xl p-4 text-white shadow-lg flex items-center justify-between border-b-4 ${
        timeLeft === "EXPIRADO" ? "bg-black border-gray-800" : "bg-gradient-to-r from-orange-500 to-red-600 border-red-700"
      }`}>
        <div className="flex items-center gap-3">
          <Clock className={`h-6 w-6 ${timeLeft !== "EXPIRADO" && timeLeft !== "LICENCIA ACTIVA" ? "animate-pulse" : ""}`} />
          <div>
            <p className="text-sm font-bold uppercase tracking-tight">
              {statistics?.plan_tipo === "TRIAL_24H" || statistics?.es_prueba ? "Licencia de Prueba" : "Licencia Profesional"}
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

      {/* TARJETAS DE INDICADORES (KPIs) - AHORA CON 5 COLUMNAS PARA NO BORRAR NADA */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        
        {/* 1. Clientes (INTACTO) */}
        <Card className="border-l-4 border-l-blue-500 shadow-sm transition-all hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between pb-2 text-gray-500 uppercase">
            <CardTitle className="text-xs font-bold">Clientes</CardTitle>
            <Users size={20} className="text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">{statistics?.total_clientes_activos || 0}</div>
          </CardContent>
        </Card>

        {/* 2. Pólizas & Ganancia (INTACTO) */}
        <Card className="border-l-4 border-l-emerald-500 shadow-sm transition-all hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between pb-2 text-gray-500 uppercase">
            <CardTitle className="text-xs font-bold">Pólizas & Ganancia</CardTitle>
            <ShieldCheck size={20} className="text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-gray-700 mb-2">{statistics?.total_polizas_activas || 0} <span className="text-sm font-normal text-gray-400">registradas</span></div>
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

        {/* 3. Siniestros (INTACTO) */}
        <Card className="border-l-4 border-l-red-500 shadow-sm transition-all hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between pb-2 text-gray-500 uppercase">
            <CardTitle className="text-xs font-bold">Siniestros</CardTitle>
            <AlertCircle size={20} className="text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{statistics?.total_reclamaciones_pendientes || 0}</div>
            <p className="text-[10px] text-red-400 italic font-medium uppercase tracking-tighter">Trámite pendiente</p>
          </CardContent>
        </Card>

        {/* 4. Red Operativa (INTACTO - RECUPERADO) */}
        <Card className="border-l-4 border-l-indigo-500 shadow-sm transition-all hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between pb-2 text-gray-500 uppercase">
            <CardTitle className="text-xs font-bold">Red Operativa</CardTitle>
            <Building2 size={20} className="text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col text-sm font-bold space-y-1">
              <span className="text-gray-700">{statistics?.total_asesores_activos || 0} <span className="font-normal text-gray-500">Asesores</span></span>
              <span className="text-indigo-700">{statistics?.total_empresas_activas || 0} <span className="font-normal text-indigo-400">Aseguradoras</span></span>
            </div>
          </CardContent>
        </Card>

        {/* 5. NUEVA: Ratio de Siniestralidad (AGREGADA COMO EXTRA) */}
        <Card className="border-l-4 border-l-rose-500 shadow-sm transition-all hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between pb-2 text-gray-500 uppercase">
            <CardTitle className="text-xs font-bold">Siniestralidad</CardTitle>
            <Activity size={20} className="text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-black ${getRatioColor(lossRatio.ratio).split(' ')[0]}`}>
              {lossRatio.ratio}%
            </div>
            <div className="mt-2 space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase">
                    <span>Pagado:</span>
                    <span className="text-rose-600">{formatMoney(lossRatio.totalSiniestros, currencySymbol, currentLanguage)}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div 
                        className={`h-full rounded-full transition-all duration-1000 ${getRatioColor(lossRatio.ratio).split(' ')[1]}`} 
                        style={{ width: `${Math.min(lossRatio.ratio, 100)}%` }}
                    ></div>
                </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* GRÁFICOS (INTACTOS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Gráfico Circular con Estado Vacío */}
        <Card className="shadow-md border-none p-4 h-[350px]">
          <h4 className="text-sm font-bold mb-4 flex items-center gap-2"><PieChartIcon size={16} className="text-indigo-600"/> Ratio Primas vs Siniestros</h4>
          
          {hasPieData ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                {/* APLICANDO FORMATMONEY AL TOOLTIP DEL GRÁFICO */}
                <Tooltip formatter={(value) => formatMoney(value, currencySymbol, currentLanguage)} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 pb-10">
              <PieChartIcon size={48} className="mb-3 opacity-20" />
              <p className="text-sm font-medium">Sin datos suficientes</p>
              <p className="text-[10px] text-gray-400">Registra pólizas para visualizar</p>
            </div>
          )}
        </Card>

        <Card className="shadow-md border-none p-4 h-[350px]">
          <h4 className="text-sm font-bold mb-4 flex items-center gap-2"><BarChart3 size={16} className="text-blue-600"/> Distribución Operativa</h4>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip cursor={{fill: '#f3f4f6'}} />
              <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;