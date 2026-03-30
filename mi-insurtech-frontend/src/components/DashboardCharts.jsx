// src/components/DashboardCharts.jsx
import React, { useMemo, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  PieChart, Pie, Cell, 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { Activity, ShieldAlert, Building2, Sparkles, Info, Lightbulb } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// 🤖 SISTEMA DE FLOTACIÓN ANTIBLOQUEO (PORTAL FIX)
const TooltipEstrategico = ({ titulo, explicacion, tipMotivador, textoCeo }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const iconRef = useRef(null);

  const handleMouseEnter = () => {
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      setCoords({
        x: rect.left + rect.width / 2, 
        y: rect.top - 10 
      });
      setIsVisible(true);
    }
  };

  return (
    <>
      <div 
        ref={iconRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsVisible(false)}
        className="inline-flex items-center ml-2 cursor-help z-10"
      >
        <Info className="h-4 w-4 text-indigo-400 hover:text-indigo-300 transition-colors" />
      </div>

      {isVisible && (
        <div 
          className="p-4 bg-slate-900/95 backdrop-blur-xl border border-indigo-500/30 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] animate-in fade-in zoom-in-95 duration-200 pointer-events-none text-left"
          style={{
            position: 'fixed',
            zIndex: 99999, 
            width: '288px', 
            left: `${coords.x}px`,
            top: `${coords.y}px`,
            transform: 'translate(-50%, -100%)', 
          }}
        >
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900/95"></div>
          
          <p className="font-black text-white text-sm mb-1">{titulo}</p>
          <p className="text-xs text-slate-300 mb-3 leading-relaxed">{explicacion}</p>
          
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2.5">
            <p className="font-bold text-emerald-400 text-xs flex items-center gap-1.5 mb-1">
              <Lightbulb className="h-3.5 w-3.5" /> {textoCeo}
            </p>
            <p className="text-xs text-emerald-200/90 leading-relaxed italic">
              "{tipMotivador}"
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default function DashboardCharts({ polizas = [], reclamaciones = [], empresas = [] }) {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language || 'es';
  
  // --- DATOS SIMULADOS (MOCK DATA) ---
  const mockSaludCartera = [
    { name: t('dashboardCharts.active'), value: 85, color: '#10b981' },
    { name: t('dashboardCharts.expired'), value: 10, color: '#f43f5e' },
    { name: t('dashboardCharts.inactive'), value: 5, color: '#94a3b8' }
  ];

  const mockAseguradoras = [
    { nombre: 'Seguros Caracas', cantidad: 45 },
    { nombre: 'Mercantil', cantidad: 30 },
    { nombre: 'Mapfre', cantidad: 20 },
    { nombre: 'Banesco', cantidad: 15 },
    { nombre: 'Zuma', cantidad: 5 }
  ];

  const mockSiniestros = [
    { mes: 'Oct 25', volumen: 2, montoPagado: 1500 },
    { mes: 'Nov 25', volumen: 5, montoPagado: 4200 },
    { mes: 'Dic 25', volumen: 3, montoPagado: 2100 }
  ];

  // --- CÁLCULOS REALES ---
  const dataSaludCartera = useMemo(() => {
    let activas = 0, vencidas = 0, inactivas = 0;
    polizas.forEach(p => {
      const estado = p.estado?.toLowerCase();
      if (estado === 'activa') activas++;
      else if (estado === 'vencida') vencidas++;
      else inactivas++;
    });
    return [
      { name: t('dashboardCharts.active'), value: activas, color: '#10b981' },
      { name: t('dashboardCharts.expired'), value: vencidas, color: '#f43f5e' },
      { name: t('dashboardCharts.inactive'), value: inactivas, color: '#94a3b8' }
    ].filter(d => d.value > 0);
  }, [polizas, t]);

  const dataAseguradoras = useMemo(() => {
    const conteo = {};
    polizas.forEach(p => {
      const empresa = empresas.find(e => String(e.id) === String(p.empresa_aseguradora_id || p.empresa_id));
      const nombre = empresa ? empresa.nombre : t('dashboardCharts.other');
      conteo[nombre] = (conteo[nombre] || 0) + 1;
    });
    return Object.keys(conteo)
      .map(key => ({ nombre: key, cantidad: conteo[key] }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);
  }, [polizas, empresas, t]);

  const dataSiniestros = useMemo(() => {
    const meses = {};
    reclamaciones.forEach(r => {
      if (!r.fecha_reclamacion) return;
      const fecha = new Date(r.fecha_reclamacion);
      if (isNaN(fecha.getTime())) return;
      
      // Magia: Extrae el nombre del mes automáticamente en el idioma actual (Inglés, Alemán, Chino, etc)
      let mesName = new Intl.DateTimeFormat(currentLanguage === 'zh' ? 'zh-CN' : currentLanguage, { month: 'short' }).format(fecha);
      mesName = mesName.charAt(0).toUpperCase() + mesName.slice(1);
      
      const mes = `${mesName} ${fecha.getFullYear().toString().slice(-2)}`;
      
      if (!meses[mes]) meses[mes] = { mes, volumen: 0, montoPagado: 0 };
      
      meses[mes].volumen += 1;
      if (r.estado_reclamacion?.toLowerCase() === 'pagada') {
         meses[mes].montoPagado += Number(r.monto_aprobado || r.monto_reclamado || 0);
      }
    });
    return Object.values(meses);
  }, [reclamaciones, currentLanguage]);

  // --- LÓGICA DE CONDICIÓN (REAL VS SIMULADO) ---
  const isPolizasVacio = polizas.length === 0;
  const isSiniestrosVacio = reclamaciones.length === 0;

  const displaySalud = isPolizasVacio ? mockSaludCartera : dataSaludCartera;
  const displayAseguradoras = isPolizasVacio ? mockAseguradoras : dataAseguradoras;
  const displaySiniestros = isSiniestrosVacio ? mockSiniestros : dataSiniestros;

  const formatCurrency = (value) => new Intl.NumberFormat(currentLanguage === 'zh' ? 'zh-CN' : currentLanguage === 'de' ? 'de-DE' : currentLanguage === 'fr' ? 'fr-FR' : 'en-US', { style: 'currency', currency: 'USD' }).format(value);

  // Componente Reutilizable para la Etiqueta Flotante
  const SimulationBadge = () => (
    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
      <div className="bg-slate-800/90 text-amber-400 text-sm font-bold rounded-full px-6 py-3 shadow-xl flex items-center gap-2 border border-white/10 backdrop-blur-md transform -translate-y-4 transition-all">
        <Sparkles className="h-5 w-5 text-amber-400" />
        {t('dashboardCharts.simulation')}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 relative z-0">
      
      {/* GRÁFICO 1: Salud de la Cartera */}
      <Card className="bg-slate-900/40 backdrop-blur-xl !border !border-white/10 !shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-2xl relative overflow-visible transition-all duration-300 ease-in-out hover:!border-white/20">
        <CardHeader className="pb-4 pt-5 px-6">
          <CardTitle className="text-sm font-black text-slate-100 uppercase tracking-widest flex items-center gap-2.5">
            <div className="bg-emerald-500/15 p-2 rounded-lg border border-emerald-500/20">
              <Activity className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="flex items-center">
              {t('dashboardCharts.portfolioHealth')}
              <TooltipEstrategico 
                textoCeo={t('dashboardCharts.ceoVision')}
                titulo={t('dashboardCharts.retentionIndex')}
                explicacion={t('dashboardCharts.retentionDesc')}
                tipMotivador={t('dashboardCharts.retentionTip')}
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="h-80 relative px-6 pb-6">
          {isPolizasVacio && <SimulationBadge />}
          <div className={`h-full w-full transition-opacity duration-500 ${isPolizasVacio ? 'opacity-30 grayscale-[30%]' : 'opacity-100'}`}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={displaySalud} 
                  cx="50%" cy="50%" 
                  innerRadius={60} 
                  outerRadius={100} 
                  paddingAngle={5} 
                  dataKey="value" 
                  stroke="rgba(0,0,0,0.2)"
                  strokeWidth={2}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {displaySalud.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <RechartsTooltip contentStyle={{backgroundColor: 'rgba(10, 15, 28, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px'}} itemStyle={{color: '#fff', fontSize: '12px'}} labelStyle={{color: '#aaa'}} />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{color: '#cbd5e1', fontSize: '12px', fontWeight: 'bold'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* GRÁFICO 2: Distribución por Aseguradora */}
      <Card className="bg-slate-900/40 backdrop-blur-xl !border !border-white/10 !shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-2xl relative overflow-visible transition-all duration-300 ease-in-out hover:!border-white/20">
        <CardHeader className="pb-4 pt-5 px-6">
          <CardTitle className="text-sm font-black text-slate-100 uppercase tracking-widest flex items-center gap-2.5">
            <div className="bg-indigo-500/15 p-2 rounded-lg border border-indigo-500/20">
              <Building2 className="h-4 w-4 text-indigo-400" />
            </div>
            <div className="flex items-center">
              {t('dashboardCharts.topInsurers')}
              <TooltipEstrategico 
                textoCeo={t('dashboardCharts.ceoVision')}
                titulo={t('dashboardCharts.riskConcentration')}
                explicacion={t('dashboardCharts.riskDesc')}
                tipMotivador={t('dashboardCharts.riskTip')}
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="h-80 relative px-6 pb-6">
          {isPolizasVacio && <SimulationBadge />}
          <div className={`h-full w-full transition-opacity duration-500 ${isPolizasVacio ? 'opacity-30 grayscale-[30%]' : 'opacity-100'}`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={displayAseguradoras} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                <YAxis dataKey="nombre" type="category" width={100} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                <RechartsTooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: 'rgba(10, 15, 28, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px'}} itemStyle={{color: '#fff', fontSize: '12px'}} labelStyle={{color: '#aaa'}} />
                <Bar dataKey="cantidad" fill="#6366f1" radius={[0, 4, 4, 0]} name={t('dashboardCharts.policies')} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* GRÁFICO 3: Siniestralidad */}
      <Card className="bg-slate-900/40 backdrop-blur-xl !border !border-white/10 !shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-2xl lg:col-span-2 relative overflow-visible transition-all duration-300 ease-in-out hover:!border-white/20">
        <CardHeader className="pb-4 pt-5 px-6">
          <CardTitle className="text-sm font-black text-slate-100 uppercase tracking-widest flex items-center gap-2.5">
            <div className="bg-red-500/15 p-2 rounded-lg border border-red-500/20">
              <ShieldAlert className="h-4 w-4 text-red-400" />
            </div>
            <div className="flex items-center">
              {t('dashboardCharts.lossRatioIndex')}
              <TooltipEstrategico 
                textoCeo={t('dashboardCharts.ceoVision')}
                titulo={t('dashboardCharts.lossRatioBalance')}
                explicacion={t('dashboardCharts.lossRatioDesc')}
                tipMotivador={t('dashboardCharts.lossRatioTip')}
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="h-80 relative px-6 pb-6">
          {isSiniestrosVacio && <SimulationBadge />}
          <div className={`h-full w-full transition-opacity duration-500 ${isSiniestrosVacio ? 'opacity-30 grayscale-[30%]' : 'opacity-100'}`}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={displaySiniestros} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMonto" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="mes" tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'bold'}} axisLine={false} tickLine={false} dy={10} />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" tick={{fill: '#8884d8', fontSize: 12, fontWeight: 'bold'}} axisLine={false} tickLine={false} dx={-10} />
                <YAxis yAxisId="right" orientation="right" stroke="#ef4444" tickFormatter={(val) => val} tick={{fill: '#ef4444', fontSize: 12, fontWeight: 'bold'}} axisLine={false} tickLine={false} dx={10} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <RechartsTooltip formatter={(value, name) => name === t('dashboardCharts.amountPaid') ? formatCurrency(value) : value} contentStyle={{backgroundColor: 'rgba(10, 15, 28, 0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px'}} itemStyle={{color: '#fff', fontSize: '12px'}} labelStyle={{color: '#aaa'}} />
                <Legend wrapperStyle={{color: '#cbd5e1', fontSize: '12px', fontWeight: 'bold'}} />
                <Area yAxisId="left" type="monotone" dataKey="volumen" stroke="#8884d8" fill="#8884d8" name={t('dashboardCharts.casesNumber')} />
                <Area yAxisId="right" type="monotone" dataKey="montoPagado" stroke="#ef4444" fillOpacity={1} fill="url(#colorMonto)" name={t('dashboardCharts.amountPaid')} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}