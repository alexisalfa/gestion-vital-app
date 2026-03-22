// src/hooks/useConfiguracion.js
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/lib/use-toast';

/**
 * useConfiguracion - El "Cerebrito" del Sistema
 * Responsabilidad: Liderar la gestión de preferencias globales y 
 * verdad absoluta de la licencia local para evitar parpadeos en la UI.
 */
export const useConfiguracion = (MASTER_LICENSE_KEY, i18n) => {
  const { toast } = useToast();

  // 1. CARGA DE ESTADOS INICIALES (Lectura directa de disco para evitar delay)
  const [selectedLanguage, setSelectedLanguage] = useState(localStorage.getItem('selectedLanguage') || 'es');
  const [currencySymbol, setCurrencySymbol] = useState(localStorage.getItem('currencySymbol') || '$');
  const [dateFormat, setDateFormat] = useState(localStorage.getItem('dateFormat') || 'DD/MM/YYYY');
  const [selectedCountry, setSelectedCountry] = useState(localStorage.getItem('selectedCountry') || 'VE');
  const [licenseKey, setLicenseKey] = useState(localStorage.getItem('licenseKey') || '');

  // 🦾 LIDERAZGO TÉCNICO: Validamos la licencia ANTES del primer renderizado
  // Si la llave en disco coincide con la maestra, la licencia es válida desde el segundo cero.
  const [isLicenseValid, setIsLicenseValid] = useState(
    localStorage.getItem('licenseKey') === MASTER_LICENSE_KEY
  );

  // 2. SINCRONIZACIÓN DE IDIOMA
  useEffect(() => {
    if (selectedLanguage && i18n) { 
      i18n.changeLanguage(selectedLanguage);
    }
  }, [selectedLanguage, i18n]);

  /**
   * saveSettings - Única compuerta para persistir cambios
   */
  const saveSettings = useCallback((newLanguage, newCurrencySymbol, newDateFormat, newSelectedCountry, newLicenseKey) => {
    // Persistencia en Disco Duro (LocalStorage)
    localStorage.setItem('selectedLanguage', newLanguage);
    localStorage.setItem('currencySymbol', newCurrencySymbol);
    localStorage.setItem('dateFormat', newDateFormat);
    localStorage.setItem('selectedCountry', newSelectedCountry);
    localStorage.setItem('licenseKey', newLicenseKey);

    // Actualización de Estado en Memoria
    setSelectedLanguage(newLanguage);
    setCurrencySymbol(newCurrencySymbol);
    setDateFormat(newDateFormat);
    setSelectedCountry(newSelectedCountry);
    setLicenseKey(newLicenseKey);

    // Re-validación de Licencia tras el guardado
    const isValid = newLicenseKey === MASTER_LICENSE_KEY;
    setIsLicenseValid(isValid);

    // Notificaciones de Sistema
    toast({ 
      title: "Configuración Guardada", 
      description: "Los ajustes han sido sincronizados exitosamente.", 
      variant: "success" 
    });

    if (!isValid && newLicenseKey !== "") {
      toast({ 
        title: "Licencia Inválida", 
        description: "La clave ingresada no coincide con el protocolo de seguridad.", 
        variant: "destructive" 
      });
    }
  }, [toast, MASTER_LICENSE_KEY]);

  // 3. EXPOSICIÓN DE LA GESTIÓN AL LÍDER (App.jsx)
  return {
    selectedLanguage, 
    currencySymbol, 
    dateFormat, 
    selectedCountry, 
    licenseKey, 
    isLicenseValid,
    setSelectedLanguage, 
    setCurrencySymbol, 
    setDateFormat, 
    setSelectedCountry, 
    setLicenseKey, 
    saveSettings
  };
};