// src/components/Configuracion.jsx
import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, Zap, Clock, PartyPopper } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // 🚀 Inyectado

const Configuracion = ({ userConfig }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      setShowSuccessAlert(true);
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(() => setShowSuccessAlert(false), 8000);
    }
  }, []);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://gestion-vital-app.onrender.com/api/v1/payments/create-checkout-session', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al conectar con Stripe");
    } finally {
      setLoading(false);
    }
  };

  const isPro = userConfig?.plan_tipo === 'PRO_ANNUAL';

  return (
    <div className="p-6 relative"> 
      
      {showSuccessAlert && (
        <div className="fixed top-5 right-5 z-[100] animate-bounce">
          <div className="bg-slate-900/90 backdrop-blur-xl text-white px-6 py-4 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.4)] flex items-center space-x-4 border border-emerald-500/50">
            <div className="bg-emerald-500/20 p-2 rounded-full border border-emerald-500/40">
              <PartyPopper className="text-emerald-400" size={24} />
            </div>
            <div>
              <p className="font-black text-lg text-emerald-400 drop-shadow-md">{t('configuracion.paymentConfirmed')}</p>
              <p className="text-sm font-medium text-slate-200">{t('configuracion.proWelcome')}</p>
            </div>
            <button onClick={() => setShowSuccessAlert(false)} className="ml-4 text-slate-400 hover:text-white hover:scale-110 transition-all">✕</button>
          </div>
        </div>
      )}

      <h2 className="text-2xl font-black mb-6 text-white drop-shadow-md">{t('configuracion.subBilling')}</h2>

      <div className="max-w-md bg-slate-900/40 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] overflow-hidden border border-white/10 transition-all duration-300 hover:border-white/20">
        <div className={`p-1 ${isPro ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-indigo-500 to-purple-600'}`}></div>
        
        <div className="p-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{t('configuracion.currentPlan')}</p>
              <h3 className="text-3xl font-black text-white mt-1 drop-shadow-md">
                {isPro ? t('configuracion.planPro') : t('configuracion.planTrial')}
              </h3>
            </div>
            <div className={`p-3 rounded-xl border backdrop-blur-md ${isPro ? 'bg-emerald-500/20 border-emerald-500/40' : 'bg-indigo-500/20 border-indigo-500/40'}`}>
              {isPro ? <Zap className="text-emerald-400 h-6 w-6" /> : <Clock className="text-indigo-400 h-6 w-6" />}
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center text-slate-300 text-sm font-medium">
              <CheckCircle size={18} className="mr-3 text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.8)]" />
              <span>{t('configuracion.feat1')}</span>
            </div>
            <div className="flex items-center text-slate-300 text-sm font-medium">
              <CheckCircle size={18} className="mr-3 text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.8)]" />
              <span>{t('configuracion.feat2')}</span>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6">
            <div className="flex justify-between items-center text-sm mb-6">
              <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">{t('configuracion.status')}</span>
              <span className={`font-black px-3 py-1 rounded-full border ${isPro ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}`}>
                {isPro ? `${t('configuracion.activeUntil')} ` + new Date(userConfig?.fecha_vencimiento).toLocaleDateString() : t('configuracion.pendingActivation')}
              </span>
            </div>

            {!isPro ? (
              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full bg-indigo-600/80 hover:bg-indigo-500 text-white font-black py-4 px-4 rounded-xl transition-all flex items-center justify-center border border-indigo-500/50 shadow-[0_0_20px_rgba(79,70,229,0.4)] active:scale-95 disabled:opacity-50 disabled:shadow-none"
              >
                <CreditCard className="mr-3" size={20} />
                {loading ? t('configuracion.preparingGateway') : `${t('configuracion.upgradeBtn')} ($99)`}
              </button>
            ) : (
              <div className="w-full bg-emerald-500/10 text-emerald-400 font-black py-4 px-4 rounded-xl border border-emerald-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                <CheckCircle className="mr-2" size={20} />
                {t('configuracion.proActivated')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configuracion;