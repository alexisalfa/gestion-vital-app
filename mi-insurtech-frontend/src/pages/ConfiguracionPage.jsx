// src/pages/ConfiguracionPage.jsx
import React from 'react';
import SettingsPage from '../components/SettingsPage';
import { useTranslation } from 'react-i18next'; // 🚀 Inyectado

function ConfiguracionPage({
  selectedLanguage, currencySymbol, dateFormat, selectedCountry, licenseKey,
  isLicenseValid, setSelectedLanguage, setCurrencySymbol, setDateFormat,
  setSelectedCountry, setLicenseKey, saveSettings, LANGUAGE_OPTIONS,
  CURRENCY_SYMBOL_OPTIONS, DATE_FORMAT_OPTIONS, COUNTRY_OPTIONS, MASTER_LICENSE_KEY
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-2xl font-black text-white tracking-tight drop-shadow-md">
        {t('configuracion.pageTitle')}
      </h2>
      
      <SettingsPage
        selectedLanguage={selectedLanguage} 
        currencySymbol={currencySymbol} 
        dateFormat={dateFormat}
        selectedCountry={selectedCountry} 
        licenseKey={licenseKey} 
        isLicenseValid={isLicenseValid} 
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