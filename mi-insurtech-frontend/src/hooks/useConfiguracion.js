import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/lib/use-toast';

export const useConfiguracion = (MASTER_LICENSE_KEY, i18n) => {
  const { toast } = useToast();

  const [selectedLanguage, setSelectedLanguage] = useState(localStorage.getItem('selectedLanguage') || 'es');
  const [currencySymbol, setCurrencySymbol] = useState(localStorage.getItem('currencySymbol') || '$');
  const [dateFormat, setDateFormat] = useState(localStorage.getItem('dateFormat') || 'DD/MM/YYYY');
  const [selectedCountry, setSelectedCountry] = useState(localStorage.getItem('selectedCountry') || 'VE');
  const [licenseKey, setLicenseKey] = useState(localStorage.getItem('licenseKey') || '');
  const [isLicenseValid, setIsLicenseValid] = useState(false);

  // Validar licencia al iniciar
  useEffect(() => {
    const savedLicenseKey = localStorage.getItem('licenseKey');
    setIsLicenseValid(savedLicenseKey === MASTER_LICENSE_KEY);
  }, [MASTER_LICENSE_KEY]);

  // Cambiar idioma automáticamente
  useEffect(() => {
    if (selectedLanguage && i18n) { 
      i18n.changeLanguage(selectedLanguage);
    }
  }, [selectedLanguage, i18n]);

  const saveSettings = useCallback((newLanguage, newCurrencySymbol, newDateFormat, newSelectedCountry, newLicenseKey) => {
    localStorage.setItem('selectedLanguage', newLanguage);
    localStorage.setItem('currencySymbol', newCurrencySymbol);
    localStorage.setItem('dateFormat', newDateFormat);
    localStorage.setItem('selectedCountry', newSelectedCountry);
    localStorage.setItem('licenseKey', newLicenseKey);

    setSelectedLanguage(newLanguage);
    setCurrencySymbol(newCurrencySymbol);
    setDateFormat(newDateFormat);
    setSelectedCountry(newSelectedCountry);
    setLicenseKey(newLicenseKey);

    const isValid = newLicenseKey === MASTER_LICENSE_KEY;
    setIsLicenseValid(isValid);

    toast({ title: "Configuración Guardada", description: "Los ajustes han sido guardados exitosamente.", variant: "success" });

    if (!isValid) {
      toast({ title: "Licencia Inválida", description: "La clave de licencia ingresada no es válida.", variant: "destructive" });
    }
  }, [toast, MASTER_LICENSE_KEY]);

  return {
    selectedLanguage, currencySymbol, dateFormat, selectedCountry, licenseKey, isLicenseValid,
    setSelectedLanguage, setCurrencySymbol, setDateFormat, setSelectedCountry, setLicenseKey, saveSettings
  };
};