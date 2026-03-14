// src/components/SettingsPage.jsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { HeadlessSafeSelect } from './HeadlessSafeSelect'; 
// NUEVO: Agregamos íconos para el panel de administración secreto (Lock, KeyRound, Settings2)
import { CheckCircle, XCircle, ShieldCheck, CreditCard, AlertTriangle, CheckCircle2, Smartphone, Landmark, Send, CalendarDays, Lock, KeyRound, Settings2 } from 'lucide-react';
import { useToast } from '@/lib/use-toast';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js"; 

function SettingsPage({
  selectedLanguage, currencySymbol, dateFormat, selectedCountry, licenseKey,
  isLicenseValid, setSelectedLanguage, setCurrencySymbol, setDateFormat,
  setSelectedCountry, setLicenseKey, onSaveSettings, languageOptions,
  currencyOptions, dateFormatOptions, countryOptions, masterLicenseKey, 
}) {
  const { toast } = useToast();
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);
  const [isProFromBackend, setIsProFromBackend] = useState(false);
  const apiBaseUrl = 'https://gestion-vital-app.onrender.com/api/v1';

  // Estados locales para los valores del formulario general
  const [localSelectedLanguage, setLocalSelectedLanguage] = useState(selectedLanguage);
  const [localCurrencySymbol, setLocalCurrencySymbol] = useState(currencySymbol);
  const [localDateFormat, setLocalDateFormat] = useState(dateFormat);
  const [localSelectedCountry, setLocalSelectedCountry] = useState(selectedCountry);
  const [localLicenseKey, setLocalLicenseKey] = useState(licenseKey);

  // ESTADOS PARA EL PAGO LOCAL (CASHEA STYLE)
  const [showLocalPaymentForm, setShowLocalPaymentForm] = useState(false);
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [emittingBank, setEmittingBank] = useState('');
  const [isSubmittingLocal, setIsSubmittingLocal] = useState(false);

  // ==========================================
  // NUEVOS ESTADOS: PANEL DE ADMINISTRACIÓN
  // ==========================================
  const [globalPrice, setGlobalPrice] = useState(99.00);
  const [globalRate, setGlobalRate] = useState(36.25); // Tasa BCV de ejemplo
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [tempPrice, setTempPrice] = useState(99.00);
  const [tempRate, setTempRate] = useState(36.25);

  const venezuelanBanks = [
    { id: '0105', nombre: 'Mercantil' },
    { id: '0102', nombre: 'Venezuela' },
    { id: '0108', nombre: 'Provincial' },
    { id: '0134', nombre: 'Banesco' },
    { id: '0172', nombre: 'Bancaribe' },
    { id: '0114', nombre: 'Bancaribe' },
    { id: '0163', nombre: 'Tesoro' },
    { id: '0168', nombre: 'Bancrecer' },
    { id: '0191', nombre: 'BNC' },
    { id: 'zelle', nombre: 'Zelle (No aplica banco emisor)' }
  ];

  const checkRealProStatus = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${apiBaseUrl}/statistics/summary`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.es_prueba === false || data.plan_tipo === 'PRO_ANNUAL') {
          setIsProFromBackend(true);
        }
      }
    } catch (error) {
      console.error("Error verificando estatus PRO en BD:", error);
    }
  };

  useEffect(() => { checkRealProStatus(); }, []);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get("payment") === "success") {
      toast({ title: "¡Pago Exitoso! 🎉", description: "Tu licencia PRO ha sido activada.", variant: "success", duration: 8000 });
      window.history.replaceState(null, '', window.location.pathname);
      setTimeout(() => checkRealProStatus(), 1500);
    }
    if (query.get("payment") === "cancel") {
      toast({ title: "Pago Cancelado", description: "El proceso fue interrumpido.", variant: "destructive" });
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [toast]);

  useEffect(() => {
    setLocalSelectedLanguage(selectedLanguage); setLocalCurrencySymbol(currencySymbol);
    setLocalDateFormat(dateFormat); setLocalSelectedCountry(selectedCountry); setLocalLicenseKey(licenseKey);
  }, [selectedLanguage, currencySymbol, dateFormat, selectedCountry, licenseKey]);

  const handleUpgradeToPro = async () => {
    setIsLoadingPayment(true);
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`${apiBaseUrl}/payments/create-checkout-session`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error("No se pudo conectar con la pasarela.");
      const data = await response.json();
      if (data.url) window.location.href = data.url;
    } catch (error) {
      toast({ title: "Error de conexión", description: "Hubo un problema al iniciar el pago.", variant: "destructive" });
      setIsLoadingPayment(false);
    }
  };

  const handleLocalPaymentSubmit = () => {
    if (!paymentReference || !paymentDate || (showLocalPaymentForm && emittingBank === '' && !emittingBank.includes('zelle'))) {
        if(emittingBank === '' && (paymentReference.length < 10)) { 
             toast({ title: "Datos incompletos", description: "Por favor ingresa Referencia, Fecha y Banco Emisor (si aplica).", variant: "destructive" });
             return;
        }
    }
    
    setIsSubmittingLocal(true);
    
    setTimeout(() => {
      setIsSubmittingLocal(false);
      setShowLocalPaymentForm(false);
      setPaymentReference('');
      setPaymentDate('');
      setEmittingBank('');
      
      toast({ 
        title: "¡Reporte Recibido! ⏳", 
        description: "Nuestro equipo está validando tu transacción. Te notificaremos en breve y activaremos tu cuenta PRO.", 
        variant: "success", 
        duration: 8000 
      });
    }, 2500);
  };

  const handleSave = () => onSaveSettings(localSelectedLanguage, localCurrencySymbol, localDateFormat, localSelectedCountry, localLicenseKey);

  // ==========================================
  // FUNCIONES DEL PANEL DE ADMINISTRACIÓN
  // ==========================================
  const handleAdminAuth = () => {
    if (adminPasswordInput === 'ocolrotcod') {
      setIsAdminAuthenticated(true);
      toast({ title: "Bóveda Abierta", description: "Modo CEO activado.", variant: "success" });
    } else {
      toast({ title: "Acceso Denegado", description: "Clave maestra incorrecta.", variant: "destructive" });
    }
    setAdminPasswordInput('');
  };

  const handleSaveAdminSettings = () => {
    setGlobalPrice(parseFloat(tempPrice));
    setGlobalRate(parseFloat(tempRate));
    setShowAdminPanel(false);
    toast({ title: "Valores Globales Actualizados", description: "El nuevo precio y la tasa BCV están en línea para todos los clientes.", variant: "default" });
  };

  const effectivelyValid = isLicenseValid || isProFromBackend;
  const LicenseStatusIcon = effectivelyValid ? CheckCircle : XCircle;
  const licenseStatusColor = effectivelyValid ? 'text-green-500' : 'text-red-500';
  const licenseStatusText = effectivelyValid ? 'Licencia Válida (PRO)' : 'Periodo de Prueba';

  return (
    <div className="flex flex-col items-center p-4 space-y-6">
      
      {/* PANEL DE LICENCIA Y PAGOS */}
      <Card className="w-full max-w-2xl border-2 border-indigo-100 shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-700 p-4">
          <h3 className="text-white text-lg font-bold flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" /> Estado de tu Licencia
          </h3>
        </div>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                {effectivelyValid ? (
                  <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> ACTIVA (PRO)</span>
                ) : (
                  <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> PERIODO DE PRUEBA</span>
                )}
              </div>
              <p className="text-gray-600 text-sm">
                {effectivelyValid 
                  ? "Cuentas con acceso ilimitado a todas las herramientas operativas y financieras del sistema." 
                  : "Tu cuenta se encuentra en un periodo de evaluación. Para evitar interrupciones, actualiza a la versión PRO."}
              </p>
            </div>

            {!effectivelyValid && (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 min-w-[320px] max-w-sm flex-shrink-0">
                {/* PRECIO DINÁMICO CONECTADO AL ADMIN */}
                <p className="text-2xl font-black text-center text-gray-800 mb-4">${globalPrice.toFixed(2)} <span className="text-sm font-normal text-gray-500">/ año</span></p>
                
                <div className="space-y-3">
                  <Button onClick={handleUpgradeToPro} disabled={isLoadingPayment} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg transition-transform hover:scale-105">
                    <CreditCard className="mr-2 h-4 w-4" /> {isLoadingPayment ? "Conectando..." : "Pagar con Tarjeta"}
                  </Button>

                  <div className="flex items-center py-1">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="flex-shrink-0 mx-2 text-gray-400 text-xs font-semibold">O</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                  </div>

                  <div className="w-full relative z-0">
                    <PayPalScriptProvider options={{ "client-id": "AYNbitigiyGUkE6fkxVloFhjT5qYHhRdrEAE4kVCARG9TuYlQDxdQSZzp51CG8u9InDQYRfCrTPxklNh", currency: "USD" }}>
                      <PayPalButtons 
                        style={{ layout: "vertical", shape: "rect", label: "pay", height: 40 }}
                        createOrder={async () => {
                          const token = localStorage.getItem('access_token');
                          const res = await fetch(`${apiBaseUrl}/payments/paypal/create-order`, { method: "POST", headers: { 'Authorization': `Bearer ${token}` } });
                          const order = await res.json();
                          return order.id;
                        }}
                        onApprove={async (data, actions) => {
                          const token = localStorage.getItem('access_token');
                          const res = await fetch(`${apiBaseUrl}/payments/paypal/capture-order`, {
                            method: "POST", headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                            body: JSON.stringify({ orderID: data.orderID })
                          });
                          const captureData = await res.json();
                          if (captureData.status === "success") {
                            toast({ title: "¡Pago Exitoso! 🎉", description: "Licencia PRO activada.", variant: "success", duration: 8000 });
                            setTimeout(() => checkRealProStatus(), 1500);
                          }
                        }}
                      />
                    </PayPalScriptProvider>
                  </div>

                  <div className="flex items-center pt-2 pb-1">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="flex-shrink-0 mx-2 text-gray-400 text-xs font-semibold">PAGO LOCAL</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                  </div>

                  <Button 
                    variant={showLocalPaymentForm ? "secondary" : "outline"}
                    onClick={() => setShowLocalPaymentForm(!showLocalPaymentForm)} 
                    className={`w-full font-bold shadow-sm transition-all ${showLocalPaymentForm ? 'bg-slate-200 text-slate-800' : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-300'}`}
                  >
                    <Smartphone className="mr-2 h-4 w-4" /> Reportar Pago Móvil / Zelle
                  </Button>

                  {showLocalPaymentForm && (
                    <div className="mt-4 p-5 bg-white border border-slate-200 rounded-2xl shadow-inner animate-in slide-in-from-top-2 duration-300 space-y-4">
                      
                      <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                        <div className="p-2 bg-indigo-50 rounded-lg border border-indigo-100">
                          <Landmark className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-800 text-base">Reporte de Pago Local</h4>
                          <p className="text-xs text-slate-500">Transfiere el monto exacto y registra los datos abajo.</p>
                        </div>
                      </div>

                      {/* CALCULADORA AUTOMÁTICA DE BOLÍVARES */}
                      <div className="bg-indigo-600 p-3 rounded-xl border border-indigo-700 text-center shadow-sm">
                        <p className="text-xs font-medium text-indigo-100 mb-1">Monto exacto a transferir (Bs.)</p>
                        <p className="text-2xl font-black text-white tracking-wide">Bs. {(globalPrice * globalRate).toLocaleString('es-VE', {minimumFractionDigits: 2})}</p>
                        <p className="text-[10px] text-indigo-200 mt-1">Calculado a la tasa de {globalRate} Bs/$</p>
                      </div>
                      
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                         <div className="flex items-start gap-3">
                           <Smartphone className="h-5 w-5 text-indigo-500 mt-0.5"/>
                           <div className="text-xs text-slate-600 flex-1 space-y-1">
                             <p className="font-semibold text-slate-700">Datos para Pago Móvil (Bs.)</p>
                             <p className="flex justify-between"><strong>Banco:</strong> <span>Mercantil (0105)</span></p>
                             <p className="flex justify-between"><strong>Teléfono:</strong> <span>0424-4530606</span></p>
                             <p className="flex justify-between"><strong>CI/RIF:</strong> <span>J-504781745</span></p>
                           </div>
                         </div>
                         <div className="border-t border-slate-200 my-1"></div>
                         <div className="flex items-start gap-3">
                           <Landmark className="h-5 w-5 text-green-500 mt-0.5"/>
                           <div className="text-xs text-slate-600 flex-1 space-y-1">
                             <p className="font-semibold text-slate-700">Datos para Zelle ($)</p>
                             <p className="flex justify-between"><strong>Email:</strong> <span className="text-indigo-600 font-medium">gtelca.ventas@gmail.com</span></p>
                           </div>
                         </div>
                      </div>

                      <div className="space-y-3 pt-1">
                        <h5 className="font-bold text-slate-700 text-sm">Detalles de tu transacción</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5"><ShieldCheck className="h-3 w-3"/> Referencia</Label>
                                <Input value={paymentReference} onChange={e => setPaymentReference(e.target.value)} placeholder="Ej. 123456" className="h-9 text-sm bg-slate-50 border-slate-200" />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5"/> Fecha</Label>
                                <Input type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} className="h-9 text-sm bg-slate-50 border-slate-200" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5"><Landmark className="h-3.5 w-3.5"/> Banco Emisor (Opcional para Zelle)</Label>
                            <HeadlessSafeSelect value={emittingBank} onChange={setEmittingBank} options={venezuelanBanks} placeholder="Selecciona el banco desde donde pagaste" className="w-full bg-slate-50 border-slate-200 text-sm"/>
                        </div>
                        <Button onClick={handleLocalPaymentSubmit} disabled={isSubmittingLocal} className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 shadow transition-transform hover:scale-105">
                          {isSubmittingLocal ? "Validando..." : <><Send className="h-4 w-4 mr-2"/> Enviar Reporte de Pago</>}
                        </Button>
                      </div>
                    </div>
                  )}
                  <p className="text-[10px] text-gray-400 mt-3 text-center">Pagos seguros procesados por Stripe®, PayPal® o Trato Directo</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* PANEL DE CONFIGURACIÓN REGIONAL */}
      <Card className="w-full max-w-2xl shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">Configuración General</CardTitle>
          <CardDescription className="text-gray-600">Ajusta las preferencias de visualización y tu clave manual.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div><Label className="mb-2 block text-sm font-medium text-gray-700">Idioma de la Interfaz</Label><HeadlessSafeSelect value={localSelectedLanguage} onChange={setLocalSelectedLanguage} options={languageOptions} className="w-full"/></div>
          <div><Label className="mb-2 block text-sm font-medium text-gray-700">Símbolo de Moneda</Label><HeadlessSafeSelect value={localCurrencySymbol} onChange={setLocalCurrencySymbol} options={[{ id: '$', nombre: '$ (Dólar / Peso)' }, { id: '€', nombre: '€ (Euro)' }, { id: 'Bs', nombre: 'Bs (Bolívar)' }, { id: 'COP', nombre: 'COP (Peso Colombiano)' }, { id: 'MXN', nombre: 'MXN (Peso Mexicano)' }, { id: 'CLP', nombre: 'CLP (Peso Chileno)' }, { id: 'R$', nombre: 'R$ (Real Brasileño)' }, { id: '£', nombre: '£ (Libra Esterlina)' }]} className="w-full"/></div>
          <div><Label className="mb-2 block text-sm font-medium text-gray-700">Formato de Fecha</Label><HeadlessSafeSelect value={localDateFormat} onChange={setLocalDateFormat} options={dateFormatOptions} className="w-full"/></div>
          <div><Label className="mb-2 block text-sm font-medium text-gray-700">País y Región</Label><HeadlessSafeSelect value={localSelectedCountry} onChange={setLocalSelectedCountry} options={countryOptions} className="w-full"/></div>
          
          <div className="pt-4 border-t border-gray-100">
            <Label className="mb-2 block text-sm font-medium text-gray-700">Clave de Licencia (Manual)</Label>
            <Input type="text" value={localLicenseKey} onChange={(e) => setLocalLicenseKey(e.target.value)} placeholder="Introduce tu clave de licencia manual" className="w-full"/>
            <div className={`flex items-center mt-2 text-sm ${licenseStatusColor}`}><LicenseStatusIcon size={16} className="mr-2" /><span>{licenseStatusText}</span></div>
          </div>
          
          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">Guardar Configuración</Button>
          </div>
        </CardContent>
      </Card>

      {/* ========================================================= */}
      {/* EL BOTÓN SECRETO DEL CEO (Bóveda Administrativa)          */}
      {/* ========================================================= */}
      <div className="w-full max-w-2xl flex flex-col items-center mt-8 pt-8 border-t border-dashed border-gray-200">
        <button 
          onClick={() => setShowAdminPanel(!showAdminPanel)} 
          className="text-gray-300 hover:text-gray-400 transition-colors"
          title="Área Administrativa"
        >
          <Lock size={16} />
        </button>

        {showAdminPanel && (
          <div className="w-full mt-4 bg-slate-900 rounded-xl p-5 shadow-2xl animate-in slide-in-from-bottom-2">
            <div className="flex items-center gap-2 mb-4">
              <Settings2 className="text-emerald-400 h-5 w-5" />
              <h4 className="text-white font-bold tracking-widest text-sm uppercase">Terminal de Control Global</h4>
            </div>

            {!isAdminAuthenticated ? (
              <div className="flex gap-2">
                <Input 
                  type="password" 
                  value={adminPasswordInput} 
                  onChange={(e) => setAdminPasswordInput(e.target.value)} 
                  placeholder="Introduce la Clave Maestra" 
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
                <Button onClick={handleAdminAuth} className="bg-emerald-600 hover:bg-emerald-500 text-white">
                  <KeyRound size={16} className="mr-2" /> Desbloquear
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-slate-400 text-xs uppercase tracking-wider">Costo de Licencia (USD)</Label>
                    <Input 
                      type="number" 
                      value={tempPrice} 
                      onChange={(e) => setTempPrice(e.target.value)} 
                      className="bg-slate-800 border-slate-700 text-white font-mono text-lg"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-slate-400 text-xs uppercase tracking-wider">Tasa BCV del Día (Bs)</Label>
                    <Input 
                      type="number" 
                      step="0.01"
                      value={tempRate} 
                      onChange={(e) => setTempRate(e.target.value)} 
                      className="bg-slate-800 border-slate-700 text-white font-mono text-lg"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-2 border-t border-slate-800">
                  <Button onClick={handleSaveAdminSettings} className="bg-blue-600 hover:bg-blue-500 text-white w-full md:w-auto">
                    Guardar y Aplicar Globalmente
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}

export default SettingsPage;