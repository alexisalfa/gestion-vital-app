// src/components/AsesorProfile360.jsx
import React, { useState, useEffect } from 'react';
import { X, UserCheck, Phone, Mail, Shield, DollarSign, Activity, CreditCard } from 'lucide-react';

export default function AsesorProfile360({ asesorId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const apiBaseUrl = 'https://gestion-vital-app.onrender.com/api/v1';

  useEffect(() => {
    if (!asesorId) return;
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${apiBaseUrl}/asesores/${asesorId}/360`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) setData(await response.json());
      } catch (error) {
        console.error("Error cargando el perfil 360 del asesor:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [asesorId]);

  if (!asesorId) return null;

  const polizas = data?.polizas || [];
  const comisiones = data?.comisiones || [];
  
  const polizasActivas = polizas.filter(p => p.estado.toLowerCase() === 'activa');
  const comisionesPagadas = comisiones.filter(c => c.estatus_pago?.toLowerCase() === 'pagada');
  
  const totalComisiones = comisionesPagadas.reduce((acc, c) => acc + (c.monto_final || 0), 0);
  const valorCarteraAportada = polizasActivas.reduce((acc, p) => acc + (p.prima || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* HEADER CORPORATIVO */}
        <div className="relative bg-gradient-to-r from-teal-700 to-emerald-800 p-6 flex items-start justify-between flex-shrink-0">
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
          
          {loading ? (
            <div className="flex items-center text-white gap-3 animate-pulse">
              <div className="w-16 h-16 bg-white/20 rounded-full"></div>
              <div className="h-5 w-48 bg-white/20 rounded"></div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 text-white w-full">
              <div className="w-20 h-20 rounded-full border-4 border-white/20 shadow-lg flex items-center justify-center text-3xl font-black bg-emerald-600 uppercase">
                {data?.asesor?.nombre?.charAt(0)}{data?.asesor?.apellido?.charAt(0)}
              </div>
              <div className="text-center md:text-left flex-1">
                <h2 className="text-2xl font-bold">{data?.asesor?.nombre} {data?.asesor?.apellido}</h2>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2 text-emerald-100 text-sm">
                  <span className="flex items-center gap-1 font-mono bg-white/10 px-2 py-1 rounded border border-white/10"><CreditCard className="w-3.5 h-3.5"/> {data?.asesor?.cedula}</span>
                  <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5"/> {data?.asesor?.telefono || 'N/A'}</span>
                  <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5"/> {data?.asesor?.email || 'N/A'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MÉTRICAS DE RENDIMIENTO */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {loading ? (
            <div className="flex justify-center items-center h-40 text-slate-400 gap-2"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div> Calculando rendimiento...</div>
          ) : (
            <div className="space-y-6">
              <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2 flex items-center gap-2"><Activity className="w-5 h-5 text-emerald-600"/> Rendimiento Comercial del Asesor</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="p-4 bg-emerald-100 text-emerald-600 rounded-xl"><DollarSign className="w-8 h-8"/></div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Comisiones Pagadas</p>
                    <p className="text-3xl font-black text-slate-800">${totalComisiones.toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
                    <p className="text-xs font-semibold text-emerald-600 mt-1">En {comisionesPagadas.length} liquidaciones</p>
                  </div>
                </div>
                
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="p-4 bg-blue-100 text-blue-600 rounded-xl"><Shield className="w-8 h-8"/></div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Pólizas Vendidas</p>
                    <p className="text-3xl font-black text-slate-800">{polizas.length}</p>
                    <p className="text-xs font-semibold text-blue-600 mt-1">{polizasActivas.length} Activas actualmente</p>
                  </div>
                </div>
              </div>

              {/* DATO EXTRA */}
              <div className="bg-emerald-50/50 rounded-xl border border-emerald-100 p-4 shadow-sm text-center">
                <p className="text-sm font-semibold text-emerald-800">
                  Este asesor ha aportado un volumen de primas activas de <span className="font-black text-lg">${valorCarteraAportada.toLocaleString('en-US', {minimumFractionDigits: 2})}</span> a la agencia.
                </p>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}