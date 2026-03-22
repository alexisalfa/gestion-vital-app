// src/pages/ConfiguracionPage.jsx
import React from 'react';
import SettingsPage from '../components/SettingsPage';

/**
 * ConfiguracionPage - El Orquestador
 * Responsabilidad: Recibir la gestión del Líder (App.jsx / useConfiguracion) 
 * y delegar la renderización a la UI (SettingsPage.jsx).
 */
function ConfiguracionPage({
  selectedLanguage,
  currencySymbol,
  dateFormat,
  selectedCountry,
  licenseKey,
  isLicenseValid, // Verdad absoluta proveniente del Cerebrito
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
  MASTER_LICENSE_KEY
}) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
        Preferencias del Sistema
      </h2>
      
      <SettingsPage
        selectedLanguage={selectedLanguage} 
        currencySymbol={currencySymbol} 
        dateFormat={dateFormat}
        selectedCountry={selectedCountry} 
        licenseKey={licenseKey} 
        isLicenseValid={isLicenseValid} // Pasamos la validación sin parpadeos
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