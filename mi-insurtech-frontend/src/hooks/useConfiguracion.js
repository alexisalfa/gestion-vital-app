import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/lib/use-toast';

export const useConfiguracion = (MASTER_LICENSE_KEY, i18n, API_BASE_URL) => {
  const { toast } = useToast();

  const [selectedLanguage, setSelectedLanguage] = useState(localStorage.getItem('selectedLanguage') || 'es');
  const [currencySymbol, setCurrencySymbol] = useState(localStorage.getItem('currencySymbol') || '$');
  const [dateFormat, setDateFormat] = useState(localStorage.getItem('dateFormat') || 'DD/MM/YYYY');
  const [selectedCountry, setSelectedCountry] = useState(localStorage.getItem('selectedCountry') || 'VE');
  const [licenseKey, setLicenseKey] = useState(localStorage.getItem('licenseKey') || '');
  
  // 1. Verdad Inicial (Local): Evita el parpadeo
  const [isLicenseValid, setIsLicenseValid] = useState(localStorage.getItem('licenseKey') === MASTER_LICENSE_KEY);

  // 🦾 2. Verdad Profunda (Backend): Autonomía del Cerebrito
  useEffect(() => {
    const verificarEstatusReal = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      try {
        const response = await fetch(`${API_BASE_URL}/statistics/summary`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const stats = await response.json();
          // Si Python dice que el plan es PRO, el Cerebrito lo acepta como verdad absoluta
          const esProEnBackend = stats.es_prueba === false || stats.plan_tipo === 'PRO_ANNUAL';
          
          if (esProEnBackend) {
            setIsLicenseValid(true);
          }
        }
      } catch (error) {
        console.error("Cerebrito: No pude contactar con el cuartel general.", error);
      }
    };

    verificarEstatusReal();
  }, [API_BASE_URL]); // Solo se ejecuta una vez al cargar el sistema

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

    toast({ title: "Configuración Guardada", variant: "success" });
  }, [toast, MASTER_LICENSE_KEY]);

  return {
    selectedLanguage, currencySymbol, dateFormat, selectedCountry, licenseKey, isLicenseValid,
    setSelectedLanguage, setCurrencySymbol, setDateFormat, setSelectedCountry, setLicenseKey, saveSettings
  };
};