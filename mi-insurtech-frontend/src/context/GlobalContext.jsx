// src/context/GlobalContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from '@/lib/use-toast';
import { useTranslation } from 'react-i18next';

// 1. Creamos la "Nube" vacía
const GlobalContext = createContext();

// 2. Creamos el Proveedor (El motor que mantiene los datos vivos)
export const GlobalProvider = ({ children }) => {
  const { toast } = useToast();
  const { i18n } = useTranslation();

  // Constantes estáticas
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://gestion-vital-app.onrender.com/api/v1';
  const MASTER_LICENSE_KEY = 'LICENCIA-VITAL-2025';

  // Variables de configuración globales
  const [selectedLanguage, setSelectedLanguage] = useState(localStorage.getItem('selectedLanguage') || 'es');
  const [currencySymbol, setCurrencySymbol] = useState(localStorage.getItem('currencySymbol') || '$');
  const [dateFormat, setDateFormat] = useState(localStorage.getItem('dateFormat') || 'DD/MM/YYYY');
  const [selectedCountry, setSelectedCountry] = useState(localStorage.getItem('selectedCountry') || 'VE');
  const [licenseKey, setLicenseKey] = useState(localStorage.getItem('licenseKey') || '');
  const [isLicenseValid, setIsLicenseValid] = useState(false);

  // Funciones de validación
  useEffect(() => {
    setIsLicenseValid(localStorage.getItem('licenseKey') === MASTER_LICENSE_KEY);
  }, []);

  useEffect(() => {
    if (selectedLanguage && i18n) i18n.changeLanguage(selectedLanguage);
  }, [selectedLanguage, i18n]);

  const saveSettings = useCallback((newLanguage, newCurrency, newDate, newCountry, newLicense) => {
    localStorage.setItem('selectedLanguage', newLanguage);
    localStorage.setItem('currencySymbol', newCurrency);
    localStorage.setItem('dateFormat', newDate);
    localStorage.setItem('selectedCountry', newCountry);
    localStorage.setItem('licenseKey', newLicense);

    setSelectedLanguage(newLanguage);
    setCurrencySymbol(newCurrency);
    setDateFormat(newDate);
    setSelectedCountry(newCountry);
    setLicenseKey(newLicense);

    const isValid = newLicense === MASTER_LICENSE_KEY;
    setIsLicenseValid(isValid);

    toast({ title: "Configuración Guardada", description: "Ajustes guardados exitosamente.", variant: "success" });
    if (!isValid) toast({ title: "Licencia Inválida", description: "Clave de licencia incorrecta.", variant: "destructive" });
  }, [toast]);

  // Herramienta global para formatear fechas en cualquier componente
  const getDateFormatOptions = useCallback(() => {
    switch (dateFormat) {
      case 'DD/MM/YYYY': return { day: '2-digit', month: '2-digit', year: 'numeric' };
      case 'MM/DD/YYYY': return { month: '2-digit', day: '2-digit', year: 'numeric' };
      case 'YYYY-MM-DD': return { year: 'numeric', month: '2-digit', day: '2-digit' };
      default: return { day: '2-digit', month: '2-digit', year: 'numeric' };
    }
  }, [dateFormat]);

  // 3. Exponemos la nube a la aplicación
  return (
    <GlobalContext.Provider value={{
      API_BASE_URL,
      MASTER_LICENSE_KEY,
      selectedLanguage, currencySymbol, dateFormat, selectedCountry, licenseKey, isLicenseValid,
      setSelectedLanguage, setCurrencySymbol, setDateFormat, setSelectedCountry, setLicenseKey,
      saveSettings, getDateFormatOptions
    }}>
      {children}
    </GlobalContext.Provider>
  );
};

// 4. Hook para consumir la nube fácilmente
export const useGlobal = () => useContext(GlobalContext);