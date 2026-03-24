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
    <div className="min-h-screen bg-[#f8fafc] bg-gradient-to-br from-indigo-100/40 via-white to-blue-100/40 flex flex-col font-sans transition-colors duration-500">
      
      {/* 🔵 NAVEGACIÓN MAESTRA */}
      <nav className="bg-blue-700/80 backdrop-blur-md text-white shadow-lg sticky top-0 z-50 border-b border-white/10 transition-all duration-300">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-1 text-indigo-100 hover:text-white transition-colors duration-200">
              <Menu className="h-6 w-6" />
            </button>
            <Link to="/dashboard" className="flex items-center gap-2 cursor-pointer">
              <div className="bg-white text-indigo-600 p-1.5 rounded-lg hidden sm:block shadow-md"><ShieldAlert className="h-5 w-5" /></div>
              <span className="text-xl font-bold tracking-tight">Gestión Vital</span>
            </Link>
          </div>

          <div className="hidden lg:flex items-center gap-1 overflow-x-auto">
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
                key={tab.id} to={`/${tab.id}`}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap ${currentPath === tab.id ? 'bg-white/20 text-white shadow-inner' : 'text-indigo-100 hover:bg-white/10 hover:text-white'}`}
              >
                {tab.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <button onClick={() => setIsAlertsOpen(true)} className="relative p-2 text-indigo-100 hover:text-white transition-colors duration-200">
              <Bell className="h-5 w-5" />
              {totalAlerts > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center border border-blue-600 text-white animate-pulse">
                  {totalAlerts}
                </span>
              )}
            </button>
            <Button onClick={handleLogout} variant="ghost" size="sm" className="text-indigo-100 hover:text-white hover:bg-white/10 hidden sm:flex transition-colors duration-200">
              Salir
            </Button>
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>

      {/* 🔔 PANEL DE ALERTAS - Asistente Inteligente Completado */}
      {isAlertsOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsAlertsOpen(false)}></div>
          <div className="relative w-full max-w-sm bg-white/90 backdrop-blur-2xl shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 rounded-l-2xl border-l border-white/30">
            
            <div className="p-4 border-b flex justify-between items-center bg-white/50 backdrop-blur-md">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-600" /> Asistente Inteligente
              </h3>
              <button onClick={() => setIsAlertsOpen(false)} className="text-slate-400 hover:bg-slate-200 p-1 rounded-md transition-colors duration-200"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              
              {/* ALERTA 1: PÓLIZAS PENDIENTES (¡Esta era la que le causaba los 2 números en la campana!) */}
              {polizasPendientesDashboard > 0 ? (
                <div className="bg-sky-100 border border-sky-200 p-4 rounded-xl shadow-sm">
                  <div className="flex items-center gap-2 text-sky-700 font-black text-[10px] uppercase mb-1">
                    <ShieldAlert className="h-3.5 w-3.5" /> Pólizas Pendientes
                  </div>
                  <p className="text-sm text-slate-700">
                    Tienes <span className="font-bold">{polizasPendientesDashboard}</span> pólizas en estado "Pendiente".
                  </p>
                  <Button variant="link" onClick={() => { navigate('/polizas'); setIsAlertsOpen(false); }} className="text-sky-700 p-0 h-auto font-bold mt-2 text-xs">
                    Revisar pólizas →
                  </Button>
                </div>
              ) : null}

              {/* ALERTA 2: SINIESTROS PENDIENTES */}
              {statisticsSummaryData?.total_reclamaciones_pendientes > 0 ? (
                <div className="bg-rose-100 border border-rose-200 p-4 rounded-xl shadow-sm">
                  <div className="flex items-center gap-2 text-rose-700 font-black text-[10px] uppercase mb-1">
                    <AlertTriangle className="h-3.5 w-3.5" /> Siniestros Pendientes
                  </div>
                  <p className="text-sm text-slate-700">
                    Tienes <span className="font-bold">{statisticsSummaryData.total_reclamaciones_pendientes}</span> reclamos esperando revisión.
                  </p>
                  <Button variant="link" onClick={() => { navigate('/reclamaciones'); setIsAlertsOpen(false); }} className="text-rose-700 p-0 h-auto font-bold mt-2 text-xs">
                    Ir a siniestros →
                  </Button>
                </div>
              ) : null}

              {/* ALERTA 3: COMISIONES */}
              {dineroEnLaCalle && dineroEnLaCalle.cantidad > 0 ? (
                <div className="bg-amber-100 border border-amber-200 p-4 rounded-xl shadow-sm">
                  <div className="flex items-center gap-2 text-amber-700 font-black text-[10px] uppercase mb-1">
                    <DollarSign className="h-3.5 w-3.5" /> Pagos Pendientes
                  </div>
                  <p className="text-sm text-slate-700">
                    Tienes <span className="font-bold">{dineroEnLaCalle.cantidad}</span> liquidaciones por cobrar: <span className="font-bold">{currencySymbol} {dineroEnLaCalle.total.toFixed(2)}</span>.
                  </p>
                  <Button variant="link" onClick={() => { navigate('/comisiones'); setIsAlertsOpen(false); }} className="text-amber-700 p-0 h-auto font-bold mt-2 text-xs">
                    Ir a liquidaciones →
                  </Button>
                </div>
              ) : null}

              {/* ALERTA 4: VENCIMIENTOS */}
              {polizasProximasAVencer && polizasProximasAVencer.length > 0 ? (
                <div className="bg-indigo-100 border border-indigo-200 p-4 rounded-xl shadow-sm">
                  <div className="flex items-center gap-2 text-indigo-700 font-black text-[10px] uppercase mb-2">
                    <Zap className="h-3.5 w-3.5" /> Próximos Vencimientos
                  </div>
                  <div className="space-y-3">
                    {polizasProximasAVencer.slice(0, 5).map((poliza) => (
                      <div key={poliza.id} className="border-l-2 border-indigo-500 pl-3">
                        <p className="text-xs font-bold text-slate-800">Pol: {poliza.numero_poliza}</p>
                        <div className="flex gap-4 mt-1">
                          <button onClick={() => handleWhatsAppNotificacion(poliza)} className="text-emerald-600 hover:scale-110 transition-transform"><MessageCircle size={16}/></button>
                          <button onClick={() => handleEmailNotificacion(poliza.id)} className="text-blue-600 hover:scale-110 transition-transform"><Mail size={16}/></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* ESTADO VACÍO (Si las 4 condiciones anteriores son 0) */}
              {totalAlerts === 0 && (
                <div className="flex flex-col items-center justify-center h-full py-20 opacity-40">
                  <CheckCircle2 className="h-12 w-12 text-slate-300 mb-2" />
                  <p className="text-sm font-bold text-slate-400 text-center">Sin alertas nuevas.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainLayout;