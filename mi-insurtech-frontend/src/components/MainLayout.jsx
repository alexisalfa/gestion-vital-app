import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  Bell, 
  Menu, 
  X, 
  CheckCircle2, 
  DollarSign, 
  Zap, 
  MessageCircle, 
  Mail,
  AlertTriangle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const MainLayout = ({
  children,
  currentPath,
  t,
  handleLogout,
  totalAlerts,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  isAlertsOpen,
  setIsAlertsOpen,
  statisticsSummaryData, 
  polizasPendientesDashboard, 
  dineroEnLaCalle,
  currencySymbol,
  polizasProximasAVencer,
  handleEmailNotificacion,
  handleWhatsAppNotificacion,
  navigate
}) => {
  return (
    <div 
      className="min-h-screen relative overflow-hidden font-sans selection:bg-indigo-500/30 bg-[#0A0F1C] bg-cover bg-center bg-fixed bg-no-repeat"
      style={{ 
        backgroundImage: "url('/colibri_insurtech.png')" 
      }}
    >
      <div className="absolute inset-0 bg-[#0A0F1C]/85 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col min-h-screen">
        
        <nav className="bg-slate-900/40 backdrop-blur-2xl text-slate-200 sticky top-0 z-50 border-b border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <div className="w-full px-4 sm:px-8 h-[72px] flex items-center justify-between gap-6">
            
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-1 text-slate-400 hover:text-white transition-colors duration-200"
              >
                <Menu className="h-6 w-6" />
              </button>
              <Link to="/dashboard" className="flex items-center gap-2 cursor-pointer group">
                <div className="bg-gradient-to-br from-cyan-500 to-teal-600 text-white p-1.5 rounded-lg hidden sm:block shadow-[0_0_15px_rgba(45,212,191,0.5)]">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <span className="text-xl font-black tracking-tight text-white drop-shadow-md whitespace-nowrap">Gestión Vital</span>
              </Link>
            </div>

            <div className="hidden lg:flex items-center justify-start xl:justify-center gap-1.5 flex-1 overflow-x-auto pb-2 pt-2 px-2 
              [&::-webkit-scrollbar]:h-1.5 
              [&::-webkit-scrollbar-track]:bg-white/5 [&::-webkit-scrollbar-track]:rounded-full 
              [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/30 transition-all">
              {[
                { id: 'dashboard', label: t('menu.dashboard', 'Dashboard') },
                { id: 'clientes', label: t('menu.clientes', 'Clientes') },
                { id: 'empresas-aseguradoras', label: t('menu.aseguradoras', 'Aseguradoras') },
                { id: 'asesores', label: t('menu.asesores', 'Asesores') },
                { id: 'polizas', label: t('menu.polizas', 'Pólizas') },
                { id: 'reclamaciones', label: t('menu.reclamaciones', 'Reclamaciones') },
                { id: 'comisiones', label: t('menu.comisiones', 'Comisiones') },
                { id: 'configuracion', label: t('menu.configuracion', 'Ajustes') },
              ].map((tab) => (
                <Link
                  key={tab.id}
                  to={`/${tab.id}`}
                  className={`px-3 py-1.5 rounded-lg text-sm font-extrabold transition-all duration-300 whitespace-nowrap border border-transparent
                    ${currentPath === tab.id 
                      ? 'bg-white/10 text-white !border-white/15 shadow-[0_0_20px_rgba(255,255,255,0.05)]' 
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-100 hover:!border-white/5'}`}
                >
                  {tab.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <button
                onClick={() => setIsAlertsOpen(true)}
                className="relative p-2 text-slate-400 hover:text-white transition-colors duration-200"
              >
                <Bell className="h-5 w-5" />
                {totalAlerts > 0 && (
                  <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-[10px] font-black flex items-center justify-center border border-slate-950 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.8)]">
                    {totalAlerts}
                  </span>
                )}
              </button>
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white hover:bg-red-500/20 hover:border hover:border-red-500/30 hidden sm:flex transition-all duration-300 rounded-lg"
              >
                Salir
              </Button>
            </div>
          </div>
        </nav>

        <main className="flex-1 w-full max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>

        {isAlertsOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <div
              className="fixed inset-0 bg-[#0A0F1C]/70 backdrop-blur-sm transition-opacity"
              onClick={() => setIsAlertsOpen(false)}
            ></div>
            <div className="relative w-full max-w-sm bg-slate-900/70 backdrop-blur-3xl shadow-[-30px_0_60px_rgba(0,0,0,0.7)] flex flex-col animate-in slide-in-from-right duration-300 rounded-l-2xl border-l border-white/10">
              
              <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h3 className="font-black text-white flex items-center gap-2">
                  <Bell className="h-5 w-5 text-cyan-400" /> Asistente Inteligente
                </h3>
                <button
                  onClick={() => setIsAlertsOpen(false)}
                  className="text-slate-400 hover:bg-white/10 hover:text-white p-1.5 rounded-lg transition-colors duration-200"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                
                {polizasPendientesDashboard > 0 ? (
                  <div className="bg-cyan-500/10 border border-cyan-500/30 p-4 rounded-xl shadow-[0_4px_30px_rgba(6,182,212,0.15)]">
                    <div className="flex items-center gap-2 text-cyan-300 font-black text-[10px] uppercase mb-1 tracking-widest">
                      <ShieldAlert className="h-3.5 w-3.5" /> Pólizas Pendientes
                    </div>
                    <p className="text-sm text-slate-100">
                      Tienes <span className="font-black text-white">{polizasPendientesDashboard}</span> pólizas en estado "Pendiente".
                    </p>
                    <Button variant="link" onClick={() => { navigate('/polizas'); setIsAlertsOpen(false); }} className="text-cyan-300 hover:text-white p-0 h-auto font-bold mt-2 text-xs">
                      Revisar pólizas →
                    </Button>
                  </div>
                ) : null}

                {statisticsSummaryData?.total_reclamaciones_pendientes > 0 ? (
                  <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl shadow-[0_4px_30px_rgba(244,63,94,0.15)]">
                    <div className="flex items-center gap-2 text-rose-300 font-black text-[10px] uppercase mb-1 tracking-widest">
                      <AlertTriangle className="h-3.5 w-3.5" /> Siniestros Pendientes
                    </div>
                    <p className="text-sm text-slate-100">
                      Tienes <span className="font-black text-white">{statisticsSummaryData.total_reclamaciones_pendientes}</span> reclamos esperando revisión.
                    </p>
                    <Button variant="link" onClick={() => { navigate('/reclamaciones'); setIsAlertsOpen(false); }} className="text-rose-300 hover:text-white p-0 h-auto font-bold mt-2 text-xs">
                      Ir a siniestros →
                    </Button>
                  </div>
                ) : null}

                {dineroEnLaCalle && dineroEnLaCalle.cantidad > 0 ? (
                  <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl shadow-[0_4px_30px_rgba(245,158,11,0.15)]">
                    <div className="flex items-center gap-2 text-amber-300 font-black text-[10px] uppercase mb-1 tracking-widest">
                      <DollarSign className="h-3.5 w-3.5" /> Pagos Pendientes
                    </div>
                    <p className="text-sm text-slate-100">
                      Tienes <span className="font-black text-white">{dineroEnLaCalle.cantidad}</span> liquidaciones por cobrar: <span className="font-black text-emerald-300">{currencySymbol} {dineroEnLaCalle.total.toFixed(2)}</span>.
                    </p>
                    <Button variant="link" onClick={() => { navigate('/comisiones'); setIsAlertsOpen(false); }} className="text-amber-300 hover:text-white p-0 h-auto font-bold mt-2 text-xs">
                      Ir a liquidaciones →
                    </Button>
                  </div>
                ) : null}

                {polizasProximasAVencer && polizasProximasAVencer.length > 0 ? (
                  <div className="bg-white/5 border border-white/10 p-4 rounded-xl shadow-[0_4px_30px_rgba(255,255,255,0.03)]">
                    <div className="flex items-center gap-2 text-slate-300 font-black text-[10px] uppercase mb-3 tracking-widest">
                      <Zap className="h-3.5 w-3.5 text-amber-300" /> Próximos Vencimientos
                    </div>
                    <div className="space-y-3">
                      {polizasProximasAVencer.slice(0, 5).map((poliza) => (
                        <div key={poliza.id} className="border-l-2 border-cyan-500 pl-3 py-1 bg-white/5 rounded-r-lg">
                          <p className="text-xs font-extrabold text-white tracking-wide">Pol: {poliza.numero_poliza}</p>
                          <div className="flex gap-4 mt-2">
                            <button onClick={() => handleWhatsAppNotificacion(poliza)} className="text-emerald-400 hover:text-emerald-200 hover:scale-110 transition-transform"><MessageCircle size={16}/></button>
                            <button onClick={() => handleEmailNotificacion(poliza.id)} className="text-cyan-400 hover:text-cyan-200 hover:scale-110 transition-transform"><Mail size={16}/></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {totalAlerts === 0 && (
                  <div className="flex flex-col items-center justify-center h-full py-20 opacity-30">
                    <CheckCircle2 className="h-12 w-12 text-slate-400 mb-2" />
                    <p className="text-sm font-bold text-slate-400 text-center tracking-wide">Sin alertas nuevas.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainLayout;