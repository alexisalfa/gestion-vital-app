// src/components/SettingsPage.jsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { HeadlessSafeSelect } from './HeadlessSafeSelect'; 
import { CheckCircle, XCircle, ShieldCheck, CreditCard, AlertTriangle, CheckCircle2, Smartphone, Landmark, Send, CalendarDays, Lock, KeyRound, Settings2, Download } from 'lucide-react';
import { useToast } from '@/lib/use-toast';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js"; 
import jsPDF from 'jspdf';

function SettingsPage({
  selectedLanguage, currencySymbol, dateFormat, selectedCountry, licenseKey,
  isLicenseValid, setSelectedLanguage, setCurrencySymbol, setDateFormat,
  setSelectedCountry, setLicenseKey, onSaveSettings, languageOptions,
  currencyOptions, dateFormatOptions, countryOptions, masterLicenseKey, 
}) {
  const { toast } = useToast();
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);
  const apiBaseUrl = 'https://gestion-vital-app.onrender.com/api/v1';

  // Estados locales para el formulario
  const [localSelectedLanguage, setLocalSelectedLanguage] = useState(selectedLanguage);
  const [localCurrencySymbol, setLocalCurrencySymbol] = useState(currencySymbol);
  const [localDateFormat, setLocalDateFormat] = useState(dateFormat);
  const [localSelectedCountry, setLocalSelectedCountry] = useState(selectedCountry);
  const [localLicenseKey, setLocalLicenseKey] = useState(licenseKey);

  // Pago Local
  const [showLocalPaymentForm, setShowLocalPaymentForm] = useState(false);
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [emittingBank, setEmittingBank] = useState('');
  const [isSubmittingLocal, setIsSubmittingLocal] = useState(false);

  // Panel Admin
  const [globalPrice, setGlobalPrice] = useState(99.00);
  const [globalRate, setGlobalRate] = useState(36.25);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [tempPrice, setTempPrice] = useState(99.00);
  const [tempRate, setTempRate] = useState(36.25);
  const [localPaymentsList, setLocalPaymentsList] = useState([]);

  const venezuelanBanks = [
    { id: '0105', nombre: 'Mercantil' }, { id: '0102', nombre: 'Venezuela' },
    { id: '0108', nombre: 'Provincial' }, { id: '0134', nombre: 'Banesco' },
    { id: '0172', nombre: 'Bancaribe' }, { id: '0163', nombre: 'Tesoro' },
    { id: '0191', nombre: 'BNC' }, { id: 'zelle', nombre: 'Zelle' }
  ];

  // Sincronización de parámetros globales (Solo Tasa y Precio)
  useEffect(() => { 
    const fetchData = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/parametros-globales`);
        if (response.ok) {
          const data = await response.json();
          setGlobalRate(data.tasa_bcv);
          setGlobalPrice(data.precio_licencia);
          setTempRate(data.tasa_bcv);
          setTempPrice(data.precio_licencia);
        }
      } catch (e) { console.error("Error cargando parámetros:", e); }
    };
    fetchData();
  }, []);

  // Sincronización de estados locales cuando cambian las props
  useEffect(() => {
    setLocalSelectedLanguage(selectedLanguage);
    setLocalCurrencySymbol(currencySymbol);
    setLocalDateFormat(dateFormat);
    setLocalSelectedCountry(selectedCountry);
    setLocalLicenseKey(licenseKey);
  }, [selectedLanguage, currencySymbol, dateFormat, selectedCountry, licenseKey]);

  const handleDownloadReceipt = () => {
    const doc = new jsPDF();
    const userData = localStorage.getItem('user');
    let usuarioRecibo = "Cliente Registrado";
    try { if(userData) usuarioRecibo = JSON.parse(userData).email || "Cliente"; } catch(e){}
    const fechaActual = new Date().toLocaleDateString('es-VE');

    doc.setFont("helvetica", "bold");
    doc.setFillColor(63, 81, 181); 
    doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text("GESTIÓN VITAL", 20, 25);
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(16);
    doc.text("RECIBO DE PAGO DIGITAL", 20, 60);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Usuario: ${usuarioRecibo}`, 120, 70);
    doc.text(`Fecha: ${fechaActual}`, 120, 75);
    doc.line(20, 90, 190, 90);
    doc.text("Licencia Gestión Vital PRO (Suscripción 1 Año)", 20, 115);
    doc.text(`$${globalPrice.toFixed(2)} USD`, 160, 115);
    doc.save(`Recibo_GV_${fechaActual}.pdf`);
  };

  const handleUpgradeToPro = async () => {
    setIsLoadingPayment(true);
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`${apiBaseUrl}/payments/create-checkout-session`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data.url) window.location.href = data.url;
    } catch (e) {
      toast({ title: "Error", description: "No se pudo iniciar el pago.", variant: "destructive" });
      setIsLoadingPayment(false);
    }
  };

  const handleLocalPaymentSubmit = async () => {
    setIsSubmittingLocal(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${apiBaseUrl}/pagos-locales/reportar`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referencia: paymentReference,
          fecha_pago: paymentDate,
          banco_emisor: emittingBank || 'Zelle',
          monto_bs: globalPrice * globalRate
        })
      });
      if (response.ok) {
        setShowLocalPaymentForm(false);
        toast({ title: "Reporte Enviado", description: "Validaremos tu pago a la brevedad.", variant: "success" });
      }
    } catch (e) { toast({ title: "Error", variant: "destructive" }); }
    finally { setIsSubmittingLocal(false); }
  };

  const handleSave = () => onSaveSettings(localSelectedLanguage, localCurrencySymbol, localDateFormat, localSelectedCountry, localLicenseKey);

  const effectivelyValid = isLicenseValid;
  const LicenseStatusIcon = effectivelyValid ? CheckCircle : XCircle;
  const licenseStatusColor = effectivelyValid ? 'text-green-500' : 'text-red-500';
  const licenseStatusText = effectivelyValid ? 'Licencia Válida (PRO)' : 'Periodo de Prueba';

  return (
    <div className="flex flex-col items-center p-4 space-y-6">
      
      {/* SECCIÓN DE LICENCIA */}
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
                  ? "Cuentas con acceso ilimitado a todas las herramientas del sistema." 
                  : "Tu cuenta está en evaluación. Actualiza a PRO para evitar interrupciones."}
              </p>
              {effectivelyValid && (
                <Button onClick={handleDownloadReceipt} variant="outline" className="mt-4 bg-white border-indigo-200 text-indigo-700">
                  <Download className="mr-2 h-4 w-4" /> Descargar Comprobante
                </Button>
              )}
            </div>

            {!effectivelyValid && (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 w-full md:w-auto">
                <p className="text-2xl font-black text-center text-gray-800 mb-4">${globalPrice.toFixed(2)} <span className="text-sm font-normal text-gray-400">/ año</span></p>
                <Button onClick={handleUpgradeToPro} disabled={isLoadingPayment} className="w-full bg-indigo-600 font-bold mb-3">
                  Pagar con Tarjeta
                </Button>
                <Button onClick={() => setShowLocalPaymentForm(!showLocalPaymentForm)} variant="outline" className="w-full border-slate-300 font-bold">
                  Pago Móvil / Zelle
                </Button>
              </div>
            )}
          </div>

          {showLocalPaymentForm && !effectivelyValid && (
            <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4 animate-in slide-in-from-top-2">
               <div className="bg-indigo-600 p-3 rounded-lg text-center">
                  <p className="text-xs text-indigo-100">Monto en Bolívares (Tasa: {globalRate})</p>
                  <p className="text-xl font-bold text-white">Bs. {(globalPrice * globalRate).toLocaleString('es-VE')}</p>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Referencia</Label>
                    <Input value={paymentReference} onChange={e => setPaymentReference(e.target.value)} placeholder="123456" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Fecha</Label>
                    <Input type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} />
                  </div>
               </div>
               <HeadlessSafeSelect label="Banco Emisor" value={emittingBank} onChange={setEmittingBank} options={venezuelanBanks} />
               <Button onClick={handleLocalPaymentSubmit} disabled={isSubmittingLocal} className="w-full bg-emerald-600 font-bold">
                 {isSubmittingLocal ? "Validando..." : "Enviar Reporte"}
               </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CONFIGURACIÓN GENERAL CON LABELS BLINDADOS */}
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Configuración General</CardTitle>
          <CardDescription>Ajusta visualización e idioma del sistema.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <HeadlessSafeSelect label="Idioma de la Interfaz" value={localSelectedLanguage} onChange={setLocalSelectedLanguage} options={languageOptions} />
          <HeadlessSafeSelect label="Símbolo de Moneda" value={localCurrencySymbol} onChange={setLocalCurrencySymbol} options={[{id: '$', nombre: 'Dólar ($)'}, {id: 'Bs', nombre: 'Bolívar (Bs)'}, {id: '€', nombre: 'Euro (€)'}]} />
          <HeadlessSafeSelect label="Formato de Fecha" value={localDateFormat} onChange={setLocalDateFormat} options={dateFormatOptions} />
          <HeadlessSafeSelect label="País y Región" value={localSelectedCountry} onChange={setLocalSelectedCountry} options={countryOptions} />
          
          <div className="pt-4 border-t">
            <Label className="mb-2 block">Clave de Licencia Manual</Label>
            <Input value={localLicenseKey} onChange={e => setLocalLicenseKey(e.target.value)} />
            <div className={`flex items-center mt-2 text-sm ${licenseStatusColor}`}><LicenseStatusIcon size={16} className="mr-2" />{licenseStatusText}</div>
          </div>
          <div className="flex justify-end pt-4"><Button onClick={handleSave} className="bg-blue-600 font-bold">Guardar Cambios</Button></div>
        </CardContent>
      </Card>

      {/* ÁREA ADMIN CEO */}
      <div className="w-full max-w-2xl flex flex-col items-center mt-8 border-t border-dashed border-gray-200 pt-8">
        <button onClick={() => setShowAdminPanel(!showAdminPanel)} className="text-gray-300 hover:text-gray-400"><Lock size={16} /></button>
        {showAdminPanel && (
          <Card className="w-full mt-4 bg-slate-900 border-none p-5 text-white">
            {!isAdminAuthenticated ? (
              <div className="flex gap-2">
                <Input type="password" value={adminPasswordInput} onChange={e => setAdminPasswordInput(e.target.value)} placeholder="Clave Maestra" className="bg-slate-800 border-slate-700" />
                <Button onClick={() => adminPasswordInput === 'ocolrotcod' ? setIsAdminAuthenticated(true) : toast({title: "Denegado", variant: "destructive"})} className="bg-emerald-600">Desbloquear</Button>
              </div>
            ) : (
              <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div><Label className="text-xs text-slate-400">Costo (USD)</Label><Input value={tempPrice} onChange={e => setTempPrice(e.target.value)} className="bg-slate-800" /></div>
                    <div><Label className="text-xs text-slate-400">Tasa (Bs)</Label><Input value={tempRate} onChange={e => setTempRate(e.target.value)} className="bg-slate-800" /></div>
                 </div>
                 <Button onClick={async () => {
                    const token = localStorage.getItem('access_token');
                    await fetch(`${apiBaseUrl}/parametros-globales`, {
                      method: 'PUT', headers: {'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json'},
                      body: JSON.stringify({tasa_bcv: parseFloat(tempRate), precio_licencia: parseFloat(tempPrice)})
                    });
                    toast({title: "Global Actualizado"});
                 }} className="w-full bg-blue-600">Aplicar Globalmente</Button>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}

export default SettingsPage;