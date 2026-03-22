// src/pages/ConfiguracionPage.jsx
import React, { useState, useEffect } from 'react';
import SettingsPage from '../components/SettingsPage';
import { Loader2, ShieldCheck } from 'lucide-react'; 
import { useGlobal } from '../context/GlobalContext';

function ConfiguracionPage(props) {
  const { API_BASE_URL } = useGlobal();
  const [isVerifying, setIsVerifying] = useState(true);
  const [backendLicenseValid, setBackendLicenseValid] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const verificarLicenciaReal = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          if (isMounted) { setBackendLicenseValid(false); setIsVerifying(false); }
          return;
        }

        const response = await fetch(`${API_BASE_URL}/statistics/summary`, { 
          headers: { 'Authorization': `Bearer ${token}` } 
        });

        if (response.ok) {
          const stats = await response.json();
          // 🦾 LÓGICA ROBUSTA: Es PRO si no es prueba O si el plan es anual
          const esPro = stats.es_prueba === false || stats.plan_tipo === 'PRO_ANNUAL';
          if (isMounted) setBackendLicenseValid(esPro);
        } else {
          if (isMounted) setBackendLicenseValid(false);
        }
      } catch (error) {
        console.error("Error en validación:", error);
        if (isMounted) setBackendLicenseValid(false);
      } finally {
        if (isMounted) setIsVerifying(false);
      }
    };

    verificarLicenciaReal();
    return () => { isMounted = false; };
  }, [API_BASE_URL]);

  if (isVerifying) { 
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center space-y-5 animate-in fade-in duration-500">
        <div className="bg-white p-4 rounded-full shadow-2xl relative z-10 border border-slate-100">
          <ShieldCheck className="h-12 w-12 text-blue-600 animate-pulse" />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-black text-slate-800">Validando Bóveda</h3>
          <p className="text-sm font-semibold text-slate-500">Sincronizando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-slate-800">Preferencias del Sistema</h2>
      <SettingsPage {...props} isLicenseValid={backendLicenseValid} />
    </div>
  );
}

export default ConfiguracionPage;