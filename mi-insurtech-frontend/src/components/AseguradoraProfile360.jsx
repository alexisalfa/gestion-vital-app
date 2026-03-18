// src/components/AseguradoraProfile360.jsx
import React, { useState, useEffect } from 'react';
import { X, Building2, Phone, Mail, MapPin, Shield, DollarSign, Activity } from 'lucide-react';

export default function AseguradoraProfile360({ empresaId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const apiBaseUrl = 'https://gestion-vital-app.onrender.com/api/v1';

  useEffect(() => {
    if (!empresaId) return;
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${apiBaseUrl}/empresas-aseguradoras/${empresaId}/360`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) setData(await response.json());
      } catch (error) {
        console.error("Error cargando el balance de la aseguradora:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [empresaId]);

  if (!empresaId) return null;

  const polizas = data?.polizas || [];
  const polizasActivas = polizas.filter(p => p.estado.toLowerCase() === 'activa');
  const valorCarteraTotal = polizasActivas.reduce((acc, p) => acc + (p.prima || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* HEADER DEL MODAL CORPORATIVO */}
        <div className="relative bg-gradient-to-r from-slate-800 to-indigo-950 p-6 flex items-start justify-between flex-shrink-0">
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
              <div className="w-20 h-20 rounded-2xl border-4 border-white/20 shadow-lg flex items-center justify-center text-3xl font-black bg-indigo-600">
                <Building2 className="w-10 h-10 text-white" />
              </div>
              <div className="text-center md:text-left flex-1">
                <h2 className="text-2xl font-bold">{data?.empresa?.nombre}</h2>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2 text-indigo-100 text-sm">
                  <span className="flex items-center gap-1 font-mono font-bold bg-white/10 px-2 py-1 rounded border border-white/10">{data?.empresa?.rif}</span>
                  <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5"/> {data?.empresa?.telefono || 'N/A'}</span>
                  <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5"/> {data?.empresa?.email_contacto || 'N/A'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CONTENIDO (MÉTRICAS DE NEGOCIO) */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {loading ? (
            <div className="flex justify-center items-center h-40 text-slate-400 gap-2"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div> Extrayendo balances...</div>
          ) : (
            <div className="space-y-6">
              
              {/* TARJETAS DE MÉTRICAS */}
              <h3 className="font-bold text-slate-800 border-b border-slate-200 pb-2 flex items-center gap-2"><Activity className="w-5 h-5 text-indigo-600"/> Balance de Negocios de la Agencia</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="p-4 bg-emerald-100 text-emerald-600 rounded-xl"><DollarSign className="w-8 h-8"/></div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Volumen de Primas (Activas)</p>
                    <p className="text-3xl font-black text-slate-800">${valorCarteraTotal.toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
                  </div>
                </div>
                
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="p-4 bg-indigo-100 text-indigo-600 rounded-xl"><Shield className="w-8 h-8"/></div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Pólizas Emitidas</p>
                    <p className="text-3xl font-black text-slate-800">{polizas.length}</p>
                    <p className="text-xs font-semibold text-emerald-600 mt-1">{polizasActivas.length} Activas actualmente</p>
                  </div>
                </div>
              </div>

              {/* DIRECCIÓN */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <div className="flex gap-3 items-start">
                  <MapPin className="w-5 h-5 text-slate-400 mt-0.5"/>
                  <div>
                    <span className="block font-bold text-slate-700 mb-1">Sede Corporativa</span>
                    <span className="text-slate-600 text-sm leading-relaxed">{data?.empresa?.direccion || 'Dirección no registrada en el sistema.'}</span>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}