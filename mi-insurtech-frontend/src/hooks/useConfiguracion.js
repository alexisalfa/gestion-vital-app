// src/hooks/useConfiguracion.js
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/lib/use-toast';
import fetchWrapper from '../utils/fetchWrapper'; // 🔥 INJERTO: Nuestro motor central

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
      try {
        // Usamos el wrapper: más limpio y centralizado
        const stats = await fetchWrapper(`${API_BASE_URL}/statistics/summary`);
        
        // Si Python dice que el plan es PRO, el Cerebrito lo acepta como verdad absoluta
        const esProEnBackend = stats.es_prueba === false || stats.plan_tipo === 'PRO_ANNUAL';
        
        if (esProEnBackend) {
          setIsLicenseValid(true);
        }
      } catch (error) {
        // El error muere aquí silenciosamente sin molestar al usuario
        console.error("Cerebrito: No pude contactar con el cuartel general.", error.message);
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

    // 🧠 CIRUGÍA DEL CEREBRITO: 
    // Comparamos la clave del formulario.
    const esClaveValida = newLicenseKey === MASTER_LICENSE_KEY;
    
    // El escudo: Si ya estaba activa (estadoAnterior === true) por el backend, 
    // no dejamos que un cambio en la configuración lo baje a false.
    setIsLicenseValid((estadoAnterior) => estadoAnterior || esClaveValida);

    toast({ title: "Configuración Guardada", variant: "success" });
  }, [toast, MASTER_LICENSE_KEY]);

  return {
    selectedLanguage, currencySymbol, dateFormat, selectedCountry, licenseKey, isLicenseValid,
    setSelectedLanguage, setCurrencySymbol, setDateFormat, setSelectedCountry, setLicenseKey, saveSettings
  };
};