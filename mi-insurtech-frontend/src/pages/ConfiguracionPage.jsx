// src/pages/ConfiguracionPage.jsx
import React, { useState, useEffect } from 'react';
import SettingsPage from '../components/SettingsPage';
import { Loader2, ShieldCheck } from 'lucide-react'; 

function ConfiguracionPage({
  selectedLanguage,
  currencySymbol,
  dateFormat,
  selectedCountry,
  licenseKey,
  isLicenseValid, // Lo recibimos, pero lo ignoraremos por seguridad
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

  // --- 🦾 INJERTO ROBUSTO: DATOS REALES DEL BACKEND ---
  statistics,       
  isLoadingStats    
}) {
  const [isVerifying, setIsVerifying] = useState(true);
  const [backendLicenseValid, setBackendLicenseValid] = useState(false);

  useEffect(() => {
    // 1. Si la API de Python todavía está cargando, bloqueamos la pantalla
    if (isLoadingStats) {
      setIsVerifying(true);
      return;
    }

    // 2. Cuando Python responde, verificamos la verdad absoluta
    if (statistics) {
      const now = new Date().getTime();
      const deadline = new Date(statistics.fecha_vencimiento).getTime();
      
      // La licencia es válida SÓLO si el backend dice que está activa Y no ha expirado
      const isValid = statistics.licencia_activa && (deadline > now);
      setBackendLicenseValid(isValid);
    } else {
      setBackendLicenseValid(false);
    }
    
    // 3. Liberamos la pantalla
    setIsVerifying(false);
  }, [statistics, isLoadingStats]);

  // --- UX NIVEL ENTERPRISE: PANTALLA DE VALIDACIÓN ---
  // Mientras verifica, no mostramos ni la configuración ni la pasarela de pago
  if (isVerifying || isLoadingStats === undefined) { 
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
        // ⚠️ AQUÍ ESTÁ LA MAGIA: Pasamos la validación REAL de Python, no la del disco duro
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