// src/components/SettingsPage.jsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { HeadlessSafeSelect } from './HeadlessSafeSelect'; 
import { CheckCircle, XCircle, ShieldCheck, CreditCard, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/lib/use-toast';

function SettingsPage({
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
  onSaveSettings,
  languageOptions,
  currencyOptions,
  dateFormatOptions,
  countryOptions,
  masterLicenseKey, 
}) {
  const { toast } = useToast();
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);
  
  // NUEVO: Estado para saber si el backend nos confirma que ya pagó
  const [isProFromBackend, setIsProFromBackend] = useState(false);
  const apiBaseUrl = 'http://localhost:8000/api/v1';

  // Estados locales para los valores del formulario
  const [localSelectedLanguage, setLocalSelectedLanguage] = useState(selectedLanguage);
  const [localCurrencySymbol, setLocalCurrencySymbol] = useState(currencySymbol);
  const [localDateFormat, setLocalDateFormat] = useState(dateFormat);
  const [localSelectedCountry, setLocalSelectedCountry] = useState(selectedCountry);
  const [localLicenseKey, setLocalLicenseKey] = useState(licenseKey);

  // 1. NUEVO: Función para verificar el estado real en la Base de Datos
  const checkRealProStatus = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${apiBaseUrl}/statistics/summary`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        // Si el backend dice que ya no es prueba o es PRO_ANNUAL, activamos el estado
        if (data.es_prueba === false || data.plan_tipo === 'PRO_ANNUAL') {
          setIsProFromBackend(true);
        }
      }
    } catch (error) {
      console.error("Error verificando estatus PRO en BD:", error);
    }
  };

  // Ejecutamos la verificación apenas el componente se monta
  useEffect(() => {
    checkRealProStatus();
  }, []);

  // 2. Detector de Pago Exitoso o Cancelado desde Stripe
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get("payment") === "success") {
      toast({
        title: "¡Pago Exitoso! 🎉",
        description: "Tu licencia PRO ha sido activada. Disfruta de Gestión Vital sin límites.",
        variant: "success",
        duration: 8000,
      });
      // Limpiamos la URL para que no vuelva a saltar si recarga
      window.history.replaceState(null, '', window.location.pathname);

      // NUEVO: Le damos 1.5 segundos al Webhook para que guarde en la BD, 
      // y luego forzamos una recarga silenciosa de los datos para encender el panel verde
      setTimeout(() => {
        checkRealProStatus();
      }, 1500);
    }

    if (query.get("payment") === "cancel") {
      toast({
        title: "Pago Cancelado",
        description: "El proceso de pago fue interrumpido. Tu cuenta sigue en modo de prueba.",
        variant: "destructive",
      });
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [toast]);

  // Sincronizar estados locales con props
  useEffect(() => {
    setLocalSelectedLanguage(selectedLanguage);
    setLocalCurrencySymbol(currencySymbol);
    setLocalDateFormat(dateFormat);
    setLocalSelectedCountry(selectedCountry);
    setLocalLicenseKey(licenseKey);
  }, [selectedLanguage, currencySymbol, dateFormat, selectedCountry, licenseKey]);

  // Función para disparar el checkout de Stripe
  const handleUpgradeToPro = async () => {
    setIsLoadingPayment(true);
    const token = localStorage.getItem('access_token');
    
    try {
      const response = await fetch(`${apiBaseUrl}/payments/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error("No se pudo conectar con la pasarela de pago.");
      }

      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error iniciando pago:", error);
      toast({
        title: "Error de conexión",
        description: "Hubo un problema al iniciar el pago. Intenta de nuevo.",
        variant: "destructive"
      });
      setIsLoadingPayment(false);
    }
  };

  const handleSave = () => {
    onSaveSettings(localSelectedLanguage, localCurrencySymbol, localDateFormat, localSelectedCountry, localLicenseKey);
  };

  // NUEVO: La licencia será válida si el Frontend tiene la llave maestra O si el Backend dice que es PRO
  const effectivelyValid = isLicenseValid || isProFromBackend;
  
  const LicenseStatusIcon = effectivelyValid ? CheckCircle : XCircle;
  const licenseStatusColor = effectivelyValid ? 'text-green-500' : 'text-red-500';
  const licenseStatusText = effectivelyValid ? 'Licencia Válida (PRO)' : 'Periodo de Prueba';

  return (
    <div className="flex flex-col items-center p-4 space-y-6">
      
      {/* PANEL DE STRIPE (Licencia PRO) */}
      <Card className="w-full max-w-2xl border-2 border-indigo-100 shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-700 p-4">
          <h3 className="text-white text-lg font-bold flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Estado de tu Licencia
          </h3>
        </div>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                {effectivelyValid ? (
                  <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> ACTIVA (PRO)
                  </span>
                ) : (
                  <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> PERIODO DE PRUEBA
                  </span>
                )}
              </div>
              <p className="text-gray-600 text-sm">
                {effectivelyValid 
                  ? "Cuentas con acceso ilimitado a todas las herramientas operativas y financieras del sistema." 
                  : "Tu cuenta se encuentra en un periodo de evaluación. Para evitar interrupciones, actualiza a la versión PRO."}
              </p>
            </div>

            {!effectivelyValid && (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center min-w-[280px]">
                <p className="text-2xl font-black text-gray-800 mb-1">$99.00 <span className="text-sm font-normal text-gray-500">/ año</span></p>
                <Button 
                  onClick={handleUpgradeToPro} 
                  disabled={isLoadingPayment}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg transition-transform hover:scale-105"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  {isLoadingPayment ? "Conectando..." : "Mejorar a PRO"}
                </Button>
                <p className="text-[10px] text-gray-400 mt-2 text-center">Pagos seguros procesados por Stripe®</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* PANEL DE CONFIGURACIÓN REGIONAL */}
      <Card className="w-full max-w-2xl shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">Configuración General</CardTitle>
          <CardDescription className="text-gray-600">
            Ajusta las preferencias de visualización y tu clave manual.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Configuración de Idioma */}
          <div>
            <Label htmlFor="language-select" className="mb-2 block text-sm font-medium text-gray-700">
              Idioma de la Interfaz
            </Label>
            <HeadlessSafeSelect
              id="language-select"
              value={localSelectedLanguage}
              onChange={setLocalSelectedLanguage}
              options={languageOptions}
              placeholder="Selecciona un idioma"
              className="w-full"
            />
          </div>

          {/* Configuración de Moneda */}
          <div>
            <Label htmlFor="currency-select" className="mb-2 block text-sm font-medium text-gray-700">
              Símbolo de Moneda
            </Label>
            <HeadlessSafeSelect
              id="currency-select"
              value={localCurrencySymbol}
              onChange={setLocalCurrencySymbol}
              options={currencyOptions}
              placeholder="Selecciona un símbolo de moneda"
              className="w-full"
            />
          </div>

          {/* Configuración de Formato de Fecha */}
          <div>
            <Label htmlFor="date-format-select" className="mb-2 block text-sm font-medium text-gray-700">
              Formato de Fecha
            </Label>
            <HeadlessSafeSelect
              id="date-format-select"
              value={localDateFormat}
              onChange={setLocalDateFormat}
              options={dateFormatOptions}
              placeholder="Selecciona un formato de fecha"
              className="w-full"
            />
          </div>

          {/* Configuración de País */}
          <div>
            <Label htmlFor="country-select" className="mb-2 block text-sm font-medium text-gray-700">
              País y Región
            </Label>
            <HeadlessSafeSelect
              id="country-select"
              value={localSelectedCountry}
              onChange={setLocalSelectedCountry}
              options={countryOptions}
              placeholder="Selecciona tu país"
              className="w-full"
            />
          </div>

          {/* Configuración de Licencia Manual */}
          <div className="pt-4 border-t border-gray-100">
            <Label htmlFor="license-key" className="mb-2 block text-sm font-medium text-gray-700">
              Clave de Licencia (Manual)
            </Label>
            <Input
              id="license-key"
              name="license-key"
              type="text"
              value={localLicenseKey}
              onChange={(e) => setLocalLicenseKey(e.target.value)}
              placeholder="Introduce tu clave de licencia manual"
              className="w-full"
            />
            <div className={`flex items-center mt-2 text-sm ${licenseStatusColor}`}>
              <LicenseStatusIcon size={16} className="mr-2" />
              <span>{licenseStatusText}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Si compraste vía Stripe, el sistema se activa automáticamente. Usa esto solo para claves maestras.
            </p>
          </div>

          {/* Botón Guardar */}
          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
              Guardar Configuración
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SettingsPage;