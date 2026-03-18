// src/components/ClientProfile360.jsx
import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, MapPin, Calendar, Shield, AlertTriangle, CheckCircle2, DollarSign, Activity, FileText, CreditCard } from 'lucide-react';
import GestorDocumental from './GestorDocumental';

export default function ClientProfile360({ clientId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('resumen'); // 'resumen', 'polizas', 'siniestros'
  const apiBaseUrl = 'https://gestion-vital-app.onrender.com/api/v1';

  useEffect(() => {
    if (!clientId) return;
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${apiBaseUrl}/clientes/${clientId}/360`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          setData(await response.json());
        }
      } catch (error) {
        console.error("Error cargando el expediente 360:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [clientId]);

  if (!clientId) return null;

  const totalPrimas = data?.polizas?.reduce((acc, p) => p.estado.toLowerCase() === 'activa' ? acc + p.prima : acc, 0) || 0;
  const totalReclamado = data?.reclamaciones?.reduce((acc, r) => acc + r.monto_reclamado, 0) || 0;
  
  // Generador de color de Avatar
  const getAvatarColor = (nombre) => {
    const colors = ['bg-blue-600', 'bg-emerald-600', 'bg-purple-600', 'bg-amber-600', 'bg-rose-600'];
    return colors[nombre ? nombre.charCodeAt(0) % colors.length : 0];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* HEADER DEL MODAL */}
        <div className="relative bg-gradient-to-r from-indigo-900 to-blue-800 p-6 flex items-start justify-between flex-shrink-0">
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
          
          {loading ? (
            <div className="flex items-center text-white gap-3 animate-pulse">
              <div className="w-16 h-16 bg-white/20 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-5 w-48 bg-white/20 rounded"></div>
                <div className="h-3 w-32 bg-white/20 rounded"></div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 text-white w-full">
              <div className={`w-20 h-20 rounded-full border-4 border-white/20 shadow-lg flex items-center justify-center text-2xl font-black ${getAvatarColor(data?.cliente?.nombre)}`}>
                {data?.cliente?.nombre?.charAt(0)}{data?.cliente?.apellido?.charAt(0)}
              </div>
              <div className="text-center md:text-left flex-1">
                <h2 className="text-2xl font-bold">{data?.cliente?.nombre} {data?.cliente?.apellido}</h2>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2 text-indigo-100 text-sm">
                  <span className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded border border-white/10"><CreditCard className="w-3 h-3"/> {data?.cliente?.identificacion}</span>
                  <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5"/> {data?.cliente?.telefono || 'Sin teléfono'}</span>
                  <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5"/> {data?.cliente?.email}</span>
                </div>
              </div>
              
              <div className="hidden md:flex flex-col items-end justify-center bg-white/10 p-3 rounded-xl border border-white/20">
                <span className="text-xs text-indigo-200 uppercase font-bold tracking-wider">Valor del Cliente (LTV)</span>
                <span className="text-2xl font-black text-emerald-400">${totalPrimas.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
              </div>
            </div>
          )}
        </div>

        {/* NAVEGACIÓN DE PESTAÑAS */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 flex-shrink-0">
          <button onClick={() => setActiveTab('resumen')} className={`px-4 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'resumen' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            <Activity className="w-4 h-4"/> Resumen General
          </button>
          <button onClick={() => setActiveTab('polizas')} className={`px-4 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'polizas' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            <Shield className="w-4 h-4"/> Pólizas ({data?.polizas?.length || 0})
          </button>
          <button onClick={() => setActiveTab('siniestros')} className={`px-4 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'siniestros' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
            <AlertTriangle className="w-4 h-4"/> Siniestros ({data?.reclamaciones?.length || 0})
          </button>
        </div>

        {/* CONTENIDO SCROLLABLE */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {loading ? (
            <div className="flex justify-center items-center h-40 text-slate-400 gap-2"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div> Cargando expediente...</div>
          ) : (
            <>
              {/* PESTAÑA: RESUMEN */}
              {activeTab === 'resumen' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                      <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg"><DollarSign className="w-6 h-6"/></div>
                      <div>
                        <p className="text-xs text-slate-500 font-bold uppercase">Primas Activas</p>
                        <p className="text-xl font-black text-slate-800">${totalPrimas.toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                      <div className="p-3 bg-blue-100 text-blue-600 rounded-lg"><Shield className="w-6 h-6"/></div>
                      <div>
                        <p className="text-xs text-slate-500 font-bold uppercase">Total Pólizas</p>
                        <p className="text-xl font-black text-slate-800">{data?.polizas?.length || 0}</p>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                      <div className="p-3 bg-rose-100 text-rose-600 rounded-lg"><AlertTriangle className="w-6 h-6"/></div>
                      <div>
                        <p className="text-xs text-slate-500 font-bold uppercase">Monto Reclamado</p>
                        <p className="text-xl font-black text-slate-800">${totalReclamado.toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Datos Personales y Ubicación</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 text-sm">
                      <div className="flex gap-2 items-start"><MapPin className="w-4 h-4 text-slate-400 mt-0.5"/><div className="flex-1"><span className="block font-semibold text-slate-700">Dirección</span><span className="text-slate-600">{data?.cliente?.direccion || 'No registrada'}</span></div></div>
                      <div className="flex gap-2 items-start"><Calendar className="w-4 h-4 text-slate-400 mt-0.5"/><div className="flex-1"><span className="block font-semibold text-slate-700">Fecha de Nacimiento</span><span className="text-slate-600">{data?.cliente?.fecha_nacimiento ? new Date(data.cliente.fecha_nacimiento).toLocaleDateString() : 'No registrada'}</span></div></div>
                    </div>
                  </div>

                  {/* SECCIÓN DEL GESTOR DOCUMENTAL INYECTADA */}
                  <div className="mt-6">
                    <GestorDocumental clienteId={clientId} />
                  </div>

                </div>
              )}

              {/* PESTAÑA: PÓLIZAS */}
              {activeTab === 'polizas' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                  {data?.polizas?.length === 0 ? (
                    <div className="text-center py-10 text-slate-500"><Shield className="w-12 h-12 mx-auto text-slate-300 mb-3"/> Este cliente aún no tiene pólizas registradas.</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {data.polizas.map(p => (
                        <div key={p.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                          <div className={`absolute top-0 left-0 w-1 h-full ${p.estado.toLowerCase() === 'activa' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{p.tipo_poliza}</span>
                              <h4 className="font-black text-slate-800 text-lg leading-tight">#{p.numero_poliza}</h4>
                            </div>
                            <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${p.estado.toLowerCase() === 'activa' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{p.estado}</span>
                          </div>
                          <p className="text-2xl font-black text-slate-800 mb-3">${p.prima.toLocaleString('en-US', {minimumFractionDigits: 2})} <span className="text-xs font-normal text-slate-500">Prima</span></p>
                          <div className="flex justify-between text-xs text-slate-500 border-t border-slate-100 pt-2">
                            <span><strong>Inicio:</strong> {new Date(p.fecha_inicio).toLocaleDateString()}</span>
                            <span><strong>Vence:</strong> {new Date(p.fecha_fin).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* PESTAÑA: SINIESTROS */}
              {activeTab === 'siniestros' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                  {data?.reclamaciones?.length === 0 ? (
                    <div className="text-center py-10 text-slate-500"><AlertTriangle className="w-12 h-12 mx-auto text-slate-300 mb-3"/> Historial limpio. No hay siniestros reportados.</div>
                  ) : (
                    <div className="space-y-3">
                      {data.reclamaciones.map(r => (
                        <div key={r.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">Siniestro #{r.id}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${r.estado_reclamacion.toLowerCase() === 'aprobado' ? 'bg-emerald-100 text-emerald-700' : r.estado_reclamacion.toLowerCase() === 'pendiente' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>{r.estado_reclamacion}</span>
                            </div>
                            <p className="font-semibold text-slate-800 text-sm">{r.descripcion}</p>
                            <p className="text-xs text-slate-500 mt-1"><Calendar className="w-3 h-3 inline mr-1"/> Ocurrido el: {new Date(r.fecha_siniestro).toLocaleDateString()}</p>
                          </div>
                          <div className="text-left md:text-right bg-slate-50 p-3 rounded-lg border border-slate-100 min-w-[150px]">
                            <p className="text-xs text-slate-500 font-semibold uppercase">Reclamado</p>
                            <p className="text-lg font-black text-rose-600">${r.monto_reclamado.toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
                            {r.monto_aprobado > 0 && <p className="text-xs font-bold text-emerald-600 mt-1">Aprobado: ${r.monto_aprobado.toLocaleString('en-US')}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}