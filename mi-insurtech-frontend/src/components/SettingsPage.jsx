// src/components/SettingsPage.jsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { HeadlessSafeSelect } from './HeadlessSafeSelect'; 
import { CheckCircle, XCircle, ShieldCheck, CreditCard, AlertTriangle, CheckCircle2, Smartphone, Landmark, Send, CalendarDays, Lock, KeyRound, Settings2, Download, PartyPopper } from 'lucide-react';
import { useToast } from '@/lib/use-toast';
import { useTranslation } from 'react-i18next'; // 🚀 Inyectado
import jsPDF from 'jspdf';

function SettingsPage({
  selectedLanguage, currencySymbol, dateFormat, selectedCountry, licenseKey,
  isLicenseValid, setSelectedLanguage, setCurrencySymbol, setDateFormat,
  setSelectedCountry, setLicenseKey, onSaveSettings, languageOptions,
  currencyOptions, dateFormatOptions, countryOptions, masterLicenseKey, 
}) {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);
  const apiBaseUrl = 'https://gestion-vital-app.onrender.com/api/v1';

  const [localSelectedLanguage, setLocalSelectedLanguage] = useState(selectedLanguage);
  const [localCurrencySymbol, setLocalCurrencySymbol] = useState(currencySymbol);
  const [localDateFormat, setLocalDateFormat] = useState(dateFormat);
  const [localSelectedCountry, setLocalSelectedCountry] = useState(selectedCountry);
  const [localLicenseKey, setLocalLicenseKey] = useState(licenseKey);

  const [showLocalPaymentForm, setShowLocalPaymentForm] = useState(false);
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [emittingBank, setEmittingBank] = useState('');
  const [isSubmittingLocal, setIsSubmittingLocal] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  const [globalPrice, setGlobalPrice] = useState(99.00);
  const [globalRate, setGlobalRate] = useState(36.25);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [tempPrice, setTempPrice] = useState(99.00);
  const [tempRate, setTempRate] = useState(36.25);

  const venezuelanBanks = [
    { id: '0105', nombre: 'Mercantil' }, { id: '0102', nombre: 'Venezuela' },
    { id: '0108', nombre: 'Provincial' }, { id: '0134', nombre: 'Banesco' },
    { id: '0172', nombre: 'Bancaribe' }, { id: '0163', nombre: 'Tesoro' },
    { id: '0191', nombre: 'BNC' }, { id: 'zelle', nombre: 'Zelle' }
  ];

  useEffect(() => { 
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      setShowSuccessAlert(true);
      window.history.replaceState({}, document.title, window.location.pathname);
      setTimeout(() => setShowSuccessAlert(false), 8000);
    }

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
  const licenseStatusColor = effectivelyValid ? 'text-emerald-400' : 'text-orange-400';
  const licenseStatusText = effectivelyValid ? t('configuracion.validLicenseText') : t('configuracion.trialLicenseText');

  const selectStylesClass = "[&_button]:!bg-black/20 [&_button]:!border-white/10 [&_button]:!text-white hover:[&_button]:!border-indigo-400 focus:[&_button]:!ring-indigo-400 [&_div[role='listbox']]:!bg-slate-800 [&_div[role='listbox']]:!border-white/10 [&_li]:!text-slate-200 hover:[&_li]:!bg-indigo-500/20 hover:[&_li]:!text-indigo-300 [&_select]:!bg-slate-900 [&_select]:!text-white [&_option]:!bg-slate-800 [&_option]:!text-white";

  return (
    <div className="flex flex-col w-full space-y-6 relative">
      
      {showSuccessAlert && (
        <div className="fixed top-5 right-5 z-[100] animate-bounce">
          <div className="bg-slate-900/90 backdrop-blur-xl text-white px-6 py-4 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.4)] flex items-center space-x-4 border border-emerald-500/50">
            <div className="bg-emerald-500/20 p-2 rounded-full border border-emerald-500/40">
              <PartyPopper className="text-emerald-400" size={24} />
            </div>
            <div>
              <p className="font-black text-lg text-emerald-400 drop-shadow-md">{t('configuracion.paymentConfirmed')}</p>
              <p className="text-sm font-medium text-slate-200">{t('configuracion.proWelcome')}</p>
            </div>
            <button onClick={() => setShowSuccessAlert(false)} className="ml-4 text-slate-400 hover:text-white hover:scale-110 transition-all">✕</button>
          </div>
        </div>
      )}

      <Card className="w-full bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-2xl overflow-hidden transition-all duration-300">
        <div className="bg-gradient-to-r from-indigo-500/20 to-purple-600/20 border-b border-indigo-500/30 p-5">
          <h3 className="text-white text-lg font-black flex items-center gap-3 drop-shadow-md">
            <div className="p-2 rounded-lg bg-indigo-500/20 border border-indigo-500/40 backdrop-blur-md">
              <ShieldCheck className="h-5 w-5 text-indigo-400" />
            </div>
            {t('configuracion.licenseState')}
          </h3>
        </div>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2">
                {effectivelyValid ? (
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs px-3 py-1.5 rounded-full font-black tracking-wide flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" /> {t('configuracion.activePro')}
                  </span>
                ) : (
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs px-3 py-1.5 rounded-full font-black tracking-wide flex items-center gap-1.5 animate-pulse">
                    <AlertTriangle className="h-3.5 w-3.5" /> {t('configuracion.trialPeriod')}
                  </span>
                )}
              </div>
              <p className="text-slate-300 text-sm font-medium">
                {effectivelyValid ? t('configuracion.proDescription') : t('configuracion.trialDescription')}
              </p>
              {effectivelyValid && (
                <Button onClick={handleDownloadReceipt} variant="outline" className="mt-4 bg-transparent border border-indigo-400/50 text-indigo-300 hover:bg-indigo-500/20 hover:text-white font-bold transition-all">
                  <Download className="mr-2 h-4 w-4" /> {t('configuracion.downloadReceipt')}
                </Button>
              )}
            </div>

            {!effectivelyValid && (
              <div className="bg-black/20 p-5 rounded-xl border border-white/10 w-full md:w-auto backdrop-blur-md">
                <p className="text-3xl font-black text-center text-white mb-4 drop-shadow-md">
                  ${globalPrice.toFixed(2)} <span className="text-sm font-bold text-slate-500">{t('configuracion.perYear')}</span>
                </p>
                <Button onClick={handleUpgradeToPro} disabled={isLoadingPayment} className="w-full bg-indigo-600/80 hover:bg-indigo-500 border border-indigo-500/50 text-white font-black tracking-wide shadow-[0_0_15px_rgba(79,70,229,0.5)] mb-3 transition-all active:scale-95">
                  {t('configuracion.payCard')}
                </Button>
                <Button onClick={() => setShowLocalPaymentForm(!showLocalPaymentForm)} variant="outline" className="w-full bg-transparent border border-white/20 text-slate-300 hover:bg-white/10 hover:text-white font-bold transition-all">
                  {t('configuracion.payZelle')}
                </Button>
              </div>
            )}
          </div>

          {showLocalPaymentForm && !effectivelyValid && (
            <div className="mt-6 p-5 bg-black/20 rounded-xl border border-white/10 space-y-4 animate-in slide-in-from-top-2 backdrop-blur-md">
               <div className="bg-indigo-500/20 border border-indigo-500/30 p-4 rounded-xl text-center">
                  <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-1">{t('configuracion.amountBs')} {globalRate})</p>
                  <p className="text-2xl font-black text-white drop-shadow-md">Bs. {(globalPrice * globalRate).toLocaleString('es-VE')}</p>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1 relative">
                    <Label className="text-slate-300 font-bold text-xs uppercase tracking-wider">{t('configuracion.paymentRef')}</Label>
                    <Input value={paymentReference} onChange={e => setPaymentReference(e.target.value)} placeholder="Ej. 123456" className="bg-black/40 border-white/10 text-white focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 placeholder:text-slate-600" />
                  </div>
                  <div className="space-y-1 relative">
                    <Label className="text-slate-300 font-bold text-xs uppercase tracking-wider">{t('configuracion.depositDate')}</Label>
                    <Input type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} className="bg-black/40 border-white/10 text-white focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 [&::-webkit-calendar-picker-indicator]:invert" />
                  </div>
               </div>
               <div className="space-y-1 relative">
                 <Label className="text-slate-300 font-bold text-xs uppercase tracking-wider">{t('configuracion.issuingBank')}</Label>
                 <div className={selectStylesClass}>
                   <HeadlessSafeSelect value={emittingBank} onChange={setEmittingBank} options={venezuelanBanks} />
                 </div>
               </div>
               <Button onClick={handleLocalPaymentSubmit} disabled={isSubmittingLocal} className="w-full bg-emerald-600/80 hover:bg-emerald-500 border border-emerald-500/50 text-white font-black shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all">
                 {isSubmittingLocal ? t('configuracion.validatingTx') : t('configuracion.sendReport')}
               </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="w-full bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-2xl overflow-hidden">
        <div className="border-b border-white/10 p-6 bg-white/5">
          <h2 className="text-xl font-black text-white drop-shadow-md">{t('configuracion.generalConfig')}</h2>
          <p className="text-slate-400 text-sm mt-1">{t('configuracion.generalConfigDesc')}</p>
        </div>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label className="text-slate-300 font-bold text-xs uppercase tracking-wider">{t('configuracion.uiLanguage')}</Label>
            <div className={selectStylesClass}>
              <HeadlessSafeSelect value={localSelectedLanguage} onChange={setLocalSelectedLanguage} options={languageOptions} />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-slate-300 font-bold text-xs uppercase tracking-wider">{t('configuracion.masterCurrency')}</Label>
            <div className={selectStylesClass}>
              <HeadlessSafeSelect value={localCurrencySymbol} onChange={setLocalCurrencySymbol} options={[{id: '$', nombre: 'Dólar ($)'}, {id: 'Bs', nombre: 'Bolívar (Bs)'}, {id: '€', nombre: 'Euro (€)'}]} />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-slate-300 font-bold text-xs uppercase tracking-wider">{t('configuracion.dateFormat')}</Label>
            <div className={selectStylesClass}>
              <HeadlessSafeSelect value={localDateFormat} onChange={setLocalDateFormat} options={dateFormatOptions} />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-slate-300 font-bold text-xs uppercase tracking-wider">{t('configuracion.countryRegion')}</Label>
            <div className={selectStylesClass}>
              <HeadlessSafeSelect value={localSelectedCountry} onChange={setLocalSelectedCountry} options={countryOptions} />
            </div>
          </div>
          
          <div className="pt-6 border-t border-white/10">
            <Label className="text-slate-300 font-bold text-xs uppercase tracking-wider mb-2 block">{t('configuracion.manualLicenseKey')}</Label>
            <Input value={localLicenseKey} onChange={e => setLocalLicenseKey(e.target.value)} className="bg-black/20 border-white/10 text-white focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 placeholder:text-slate-600" />
            <div className={`flex items-center mt-3 text-sm font-bold tracking-wide ${licenseStatusColor}`}>
              <LicenseStatusIcon size={16} className="mr-2" /> {licenseStatusText}
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} className="bg-indigo-600/80 hover:bg-indigo-500 border border-indigo-500/50 text-white font-black shadow-[0_0_15px_rgba(79,70,229,0.5)] px-8">
              {t('configuracion.savePreferences')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="w-full flex flex-col items-center mt-4 border-t border-dashed border-white/10 pt-8 pb-10">
        <button onClick={() => setShowAdminPanel(!showAdminPanel)} className="text-slate-600 hover:text-indigo-400 transition-colors p-2">
          <Lock size={18} />
        </button>
        {showAdminPanel && (
          <Card className="w-full max-w-md mt-4 bg-slate-900/80 backdrop-blur-xl border border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.15)] rounded-2xl overflow-hidden p-6 text-white animate-in zoom-in-95">
            <div className="flex items-center gap-2 mb-4 text-rose-400">
              <KeyRound size={18} /> <h3 className="font-black tracking-wide">{t('configuracion.restrictedAccess')}</h3>
            </div>
            {!isAdminAuthenticated ? (
              <div className="flex gap-3">
                <Input type="password" value={adminPasswordInput} onChange={e => setAdminPasswordInput(e.target.value)} placeholder={t('configuracion.authCode')} className="bg-black/40 border-white/10 focus:border-rose-400 focus:ring-1 focus:ring-rose-400 text-white" />
                <Button onClick={() => adminPasswordInput === 'ocolrotcod' ? setIsAdminAuthenticated(true) : toast({title: "Acceso Denegado", variant: "destructive"})} className="bg-rose-600/80 hover:bg-rose-500 border border-rose-500/50 font-bold">
                  {t('configuracion.enter')}
                </Button>
              </div>
            ) : (
              <div className="space-y-5 animate-in fade-in">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-slate-400 uppercase">{t('configuracion.baseCost')}</Label>
                      <Input value={tempPrice} onChange={e => setTempPrice(e.target.value)} className="bg-black/40 border-white/10 focus:border-indigo-400 text-white font-black" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-slate-400 uppercase">{t('configuracion.exchangeRate')}</Label>
                      <Input value={tempRate} onChange={e => setTempRate(e.target.value)} className="bg-black/40 border-white/10 focus:border-indigo-400 text-white font-black" />
                    </div>
                 </div>
                 <Button onClick={async () => {
                    const token = localStorage.getItem('access_token');
                    await fetch(`${apiBaseUrl}/parametros-globales`, {
                      method: 'PUT', headers: {'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json'},
                      body: JSON.stringify({tasa_bcv: parseFloat(tempRate), precio_licencia: parseFloat(tempPrice)})
                    });
                    toast({title: "Parámetros Globales Actualizados", variant: "success"});
                 }} className="w-full bg-indigo-600/80 hover:bg-indigo-500 border border-indigo-500/50 text-white font-black shadow-[0_0_15px_rgba(79,70,229,0.5)]">
                   {t('configuracion.forceUpdate')}
                 </Button>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}

export default SettingsPage;