// src/components/DashboardCharts.jsx
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  PieChart, Pie, Cell, 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { Activity, ShieldAlert, Building2, Sparkles } from 'lucide-react';

export default function DashboardCharts({ polizas = [], reclamaciones = [], empresas = [] }) {
  
  // --- DATOS SIMULADOS (MOCK DATA) ---
  const mockSaludCartera = [
    { name: 'Activas', value: 85, color: '#10b981' },
    { name: 'Vencidas', value: 10, color: '#f43f5e' },
    { name: 'Inactivas', value: 5, color: '#94a3b8' }
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
    { mes: 'Dic 25', volumen: 3, montoPagado: 2100 },
    { mes: 'Ene 26', volumen: 8, montoPagado: 7500 },
    { mes: 'Feb 26', volumen: 4, montoPagado: 3200 },
    { mes: 'Mar 26', volumen: 6, montoPagado: 5800 }
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
      { name: 'Activas', value: activas, color: '#10b981' },
      { name: 'Vencidas', value: vencidas, color: '#f43f5e' },
      { name: 'Inactivas', value: inactivas, color: '#94a3b8' }
    ].filter(d => d.value > 0);
  }, [polizas]);

  const dataAseguradoras = useMemo(() => {
    const conteo = {};
    polizas.forEach(p => {
      const empresa = empresas.find(e => String(e.id) === String(p.empresa_aseguradora_id || p.empresa_id));
      const nombre = empresa ? empresa.nombre : 'Otra';
      conteo[nombre] = (conteo[nombre] || 0) + 1;
    });
    return Object.keys(conteo)
      .map(key => ({ nombre: key, cantidad: conteo[key] }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);
  }, [polizas, empresas]);

  const dataSiniestros = useMemo(() => {
    const meses = {};
    const nombresMeses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    reclamaciones.forEach(r => {
      if (!r.fecha_reclamacion) return;
      const fecha = new Date(r.fecha_reclamacion);
      if (isNaN(fecha.getTime())) return;
      const mes = `${nombresMeses[fecha.getMonth()]} ${fecha.getFullYear().toString().slice(-2)}`;
      
      if (!meses[mes]) meses[mes] = { mes, volumen: 0, montoPagado: 0 };
      
      meses[mes].volumen += 1;
      if (r.estado_reclamacion?.toLowerCase() === 'pagada') {
         meses[mes].montoPagado += Number(r.monto_aprobado || r.monto_reclamado || 0);
      }
    });
    return Object.values(meses);
  }, [reclamaciones]);

  // --- LÓGICA DE CONDICIÓN (REAL VS SIMULADO) ---
  const isPolizasVacio = polizas.length === 0;
  const isSiniestrosVacio = reclamaciones.length === 0;

  const displaySalud = isPolizasVacio ? mockSaludCartera : dataSaludCartera;
  const displayAseguradoras = isPolizasVacio ? mockAseguradoras : dataAseguradoras;
  const displaySiniestros = isSiniestrosVacio ? mockSiniestros : dataSiniestros;

  // Formateador de moneda para tooltips
  const formatCurrency = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  // Componente Reutilizable para la Etiqueta Flotante
  const SimulationBadge = () => (
    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
      <div className="bg-slate-900/85 backdrop-blur-sm text-white px-6 py-3 rounded-full font-bold shadow-2xl border border-slate-700/50 flex items-center gap-2 transform -translate-y-4 transition-all">
        <Sparkles className="h-5 w-5 text-amber-400" />
        Simulación de lo que esperas
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      
      {/* GRÁFICO 1: Salud de la Cartera */}
      <Card className="shadow-lg border-none rounded-xl relative overflow-hidden">
        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-600" />
            Salud de la Cartera (Pólizas)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 h-80 relative">
          {isPolizasVacio && <SimulationBadge />}
          <div className={`h-full w-full transition-opacity duration-500 ${isPolizasVacio ? 'opacity-30 grayscale-[30%]' : 'opacity-100'}`}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={displaySalud} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {displaySalud.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <RechartsTooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* GRÁFICO 2: Distribución por Aseguradora */}
      <Card className="shadow-lg border-none rounded-xl relative overflow-hidden">
        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-indigo-600" />
            Top 5 Aseguradoras (Volumen)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 h-80 relative">
          {isPolizasVacio && <SimulationBadge />}
          <div className={`h-full w-full transition-opacity duration-500 ${isPolizasVacio ? 'opacity-30 grayscale-[30%]' : 'opacity-100'}`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={displayAseguradoras} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="nombre" type="category" width={100} tick={{fontSize: 12}} />
                <RechartsTooltip />
                <Bar dataKey="cantidad" fill="#6366f1" radius={[0, 4, 4, 0]} name="Pólizas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* GRÁFICO 3: Siniestralidad (Ancho completo) */}
      <Card className="shadow-lg border-none rounded-xl lg:col-span-2 relative overflow-hidden">
        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
          <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-red-600" />
            Siniestralidad: Reportes vs Montos Pagados
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 h-80 relative">
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
                <XAxis dataKey="mes" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#ef4444" tickFormatter={(val) => `$${val}`} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <RechartsTooltip formatter={(value, name) => name === 'Monto Pagado' ? formatCurrency(value) : value} />
                <Legend />
                <Area yAxisId="left" type="monotone" dataKey="volumen" stroke="#8884d8" fill="#8884d8" name="N° de Casos" />
                <Area yAxisId="right" type="monotone" dataKey="montoPagado" stroke="#ef4444" fillOpacity={1} fill="url(#colorMonto)" name="Monto Pagado" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}