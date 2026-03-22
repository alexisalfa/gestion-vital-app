// src/pages/ConfiguracionPage.jsx
import React, { useState, useEffect } from 'react';
import SettingsPage from '../components/SettingsPage';
import { Loader2, ShieldCheck } from 'lucide-react'; 
import { useGlobal } from '../context/GlobalContext';

function ConfiguracionPage({
  selectedLanguage,
  currencySymbol,
  dateFormat,
  selectedCountry,
  licenseKey,
  setSelectedLanguage,
  setCurrencySymbol,
  setDateFormat,
  setSelectedCountry,
  setLicenseKey,
  saveSettings,
  LANGUAGE_OPTIONS,
  CURRENCY_SYMBOL_OPTIONS,
  DATE_FORMAT_OPTIONS,
  COUNTRY_OPTIONS,
  MASTER_LICENSE_KEY,
}) {
  const { API_BASE_URL } = useGlobal();
  const [isVerifying, setIsVerifying] = useState(true);
  const [backendLicenseValid, setBackendLicenseValid] = useState(false);

  // 🦾 INJERTO ROBUSTO Y AUTÓNOMO: Verificamos directamente con Python
  useEffect(() => {
    let isMounted = true;

    const verificarLicenciaReal = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          if (isMounted) {
            setBackendLicenseValid(false);
            setIsVerifying(false);
          }
          return;
        }

        const response = await fetch(`${API_BASE_URL}/statistics/summary`, { 
          headers: { 'Authorization': `Bearer ${token}` } 
        });

        if (response.ok) {
          const stats = await response.json();
          const now = new Date().getTime();
          const deadline = new Date(stats.fecha_vencimiento).getTime();
          
          // Es válida si Python dice que está activa Y no ha expirado
          if (isMounted) {
            setBackendLicenseValid(stats.licencia_activa && (deadline > now));
          }
        } else {
          if (isMounted) setBackendLicenseValid(false);
        }
      } catch (error) {
        console.error("Error validando bóveda:", error);
        if (isMounted) setBackendLicenseValid(false);
      } finally {
        if (isMounted) setIsVerifying(false);
      }
    };

    verificarLicenciaReal();

    return () => {
      isMounted = false; // Cleanup para evitar fugas de memoria
    };
  }, [API_BASE_URL]);

  // --- UX NIVEL ENTERPRISE: PANTALLA DE VALIDACIÓN ---
  if (isVerifying) { 
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center space-y-5 animate-in fade-in duration-500">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-200 rounded-full blur-2xl animate-pulse"></div>
          <div className="bg-white p-4 rounded-full shadow-2xl relative z-10 border border-slate-100">
            <ShieldCheck className="h-12 w-12 text-blue-600 animate-pulse" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-xl font-black text-slate-800 tracking-tight">Validando Bóveda Segura</h3>
          <p className="text-sm font-semibold text-slate-500 flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-indigo-500" /> Sincronizando con el servidor...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Preferencias del Sistema</h2>
      
      <SettingsPage
        selectedLanguage={selectedLanguage} 
        currencySymbol={currencySymbol} 
        dateFormat={dateFormat}
        selectedCountry={selectedCountry} 
        licenseKey={licenseKey} 
        // ⚠️ Pasamos el resultado de la validación real
        isLicenseValid={backendLicenseValid} 
        setSelectedLanguage={setSelectedLanguage} 
        setCurrencySymbol={setCurrencySymbol} 
        setDateFormat={setDateFormat}
        setSelectedCountry={setSelectedCountry} 
        setLicenseKey={setLicenseKey} 
        onSaveSettings={saveSettings}
        languageOptions={LANGUAGE_OPTIONS} 
        currencyOptions={CURRENCY_SYMBOL_OPTIONS} 
        dateFormatOptions={DATE_FORMAT_OPTIONS}
        countryOptions={COUNTRY_OPTIONS} 
        masterLicenseKey={MASTER_LICENSE_KEY}
      />
    </div>
  );
}

export default ConfiguracionPage;