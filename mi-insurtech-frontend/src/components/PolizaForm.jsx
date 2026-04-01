// src/components/PolizaForm.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/lib/use-toast';
import { HeadlessSafeSelect } from './HeadlessSafeSelect';
import { Shield, FileText, Tag, Calendar, DollarSign, Activity, CheckCircle2, X, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const formatDateToInput = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};

function PolizaForm({ onPolizaSaved, editingPoliza, setEditingPoliza, apiBaseUrl, clientes = [], empresasAseguradoras = [], asesores = [], isLoadingClients, isLoadingCompanies, isLoadingAdvisors }) {
  const { toast } = useToast();
  const { t } = useTranslation();

  const initialPolizaState = { numero_poliza: '', tipo_poliza: '', fecha_inicio: '', fecha_fin: '', prima: '', suma_asegurada: '', deducible: '', estado: 'Activa', cliente_id: '', empresa_aseguradora_id: '', asesor_id: '' };
  const [poliza, setPoliza] = useState(initialPolizaState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingPoliza) {
      setPoliza({
        ...editingPoliza,
        fecha_inicio: formatDateToInput(editingPoliza.fecha_inicio),
        fecha_fin: formatDateToInput(editingPoliza.fecha_fin),
        empresa_aseguradora_id: editingPoliza.empresa_aseguradora_id || editingPoliza.empresa_id || '',
      });
    } else {
      setPoliza(initialPolizaState);
    }
  }, [editingPoliza]);

  const handleChange = (e) => setPoliza((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSelectChange = (name, value) => setPoliza((prev) => ({ ...prev, [name]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formattedPoliza = {
      numero_poliza: poliza.numero_poliza.toUpperCase().trim(),
      tipo_poliza: poliza.tipo_poliza,
      estado: poliza.estado,
      prima: poliza.prima ? parseFloat(poliza.prima) : null,
      suma_asegurada: poliza.suma_asegurada ? parseFloat(poliza.suma_asegurada) : 0,
      deducible: poliza.deducible ? parseFloat(poliza.deducible) : 0,
      fecha_inicio: poliza.fecha_inicio || null,
      fecha_fin: poliza.fecha_fin || null,
      cliente_id: poliza.cliente_id ? parseInt(poliza.cliente_id, 10) : null,
      empresa_id: poliza.empresa_aseguradora_id ? parseInt(poliza.empresa_aseguradora_id, 10) : null,
      asesor_id: poliza.asesor_id ? parseInt(poliza.asesor_id, 10) : null,
    };

    try {
      const token = localStorage.getItem('access_token');
      const method = editingPoliza ? 'PUT' : 'POST';
      const url = editingPoliza ? `${apiBaseUrl}/polizas/${editingPoliza.id}` : `${apiBaseUrl}/polizas`;

      const response = await fetch(url, {
        method, 
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, 
        body: JSON.stringify(formattedPoliza),
      });

      if (!response.ok) {
        const errorData = await response.json();
        let errorMessage = "Ocurrió un error al procesar la póliza.";

        const detailStr = JSON.stringify(errorData.detail || "");
        if (detailStr.includes("UniqueViolation") || detailStr.includes("already exists") || detailStr.includes("duplicada")) {
          errorMessage = `El número de póliza "${poliza.numero_poliza}" ya está registrado. Por favor, asigne un número diferente.`;
        } else if (errorData.detail && Array.isArray(errorData.detail)) {
          errorMessage = errorData.detail.map(err => `${err.loc[err.loc.length - 1]}: ${err.msg}`).join(' | ');
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        }
        throw new Error(errorMessage);
      }

      toast({ 
        title: t('polizas.toastSuccess'), 
        description: editingPoliza ? t('polizas.toastUpdated') : t('polizas.toastIssued'), 
        variant: "success" 
      });
      
      onPolizaSaved();
      setPoliza(initialPolizaState);
      setEditingPoliza(null);

    } catch (error) {
      toast({ 
        title: t('polizas.toastValidation'), 
        description: error.message, 
        variant: "warning" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const tipoPolizaOptions = [
    { id: 'Salud / HCM', nombre: 'Salud / HCM' },
    { id: 'Vida', nombre: 'Vida' },
    { id: 'Automotriz', nombre: 'Automotriz' },
    { id: 'Patrimonial / Incendio', nombre: 'Patrimonial / Incendio' },
    { id: 'Fianzas', nombre: 'Fianzas' },
    { id: 'Responsabilidad Civil', nombre: 'Responsabilidad Civil' },
    { id: 'Otros', nombre: 'Otros' }
  ];

  const clienteOptions = useMemo(() => clientes.map(c => ({ id: c.id, nombre: `${c.nombre} ${c.apellido || ''}`.trim() })), [clientes]);
  const empresaOptions = useMemo(() => empresasAseguradoras.map(e => ({ id: e.id, nombre: e.nombre })), [empresasAseguradoras]);
  const asesorOptions = useMemo(() => asesores.map(a => ({ id: a.id, nombre: `${a.nombre} ${a.apellido || ''}`.trim() })), [asesores]);

  const selectStylesClass = "[&_button]:!bg-black/20 [&_button]:!border-white/10 [&_button]:!text-white hover:[&_button]:!border-indigo-400 focus:[&_button]:!ring-indigo-400 [&_div[role='listbox']]:!bg-slate-800 [&_div[role='listbox']]:!border-white/10 [&_li]:!text-slate-200 hover:[&_li]:!bg-indigo-500/20 hover:[&_li]:!text-indigo-300";

  return (
    <Card className="mb-8 bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-2xl overflow-hidden transition-all duration-300">
      <div className={`p-6 ${editingPoliza ? 'bg-gradient-to-r from-amber-500/20 to-orange-600/20 border-b border-amber-500/30' : 'bg-gradient-to-r from-indigo-600/20 to-violet-700/20 border-b border-indigo-500/30'} flex justify-between items-center`}>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl backdrop-blur-md border ${editingPoliza ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400'}`}><Shield className="h-6 w-6" /></div>
          <div>
            <h2 className="text-xl font-black text-white drop-shadow-md">{editingPoliza ? t('polizas.formTitleEdit') : t('polizas.formTitleNew')}</h2>
            <p className="text-slate-300 text-sm font-medium mt-0.5">{editingPoliza ? `${t('polizas.formDescEdit')} ${poliza.numero_poliza}` : t('polizas.formDescNew')}</p>
          </div>
        </div>
        {editingPoliza && <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-colors" onClick={() => setEditingPoliza(null)}><X className="h-5 w-5" /></Button>}
      </div>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
          <div className="space-y-2 relative">
            <Label className="text-slate-300 font-bold text-xs uppercase tracking-wider">{t('polizas.policyNumber')}</Label>
            <div className="relative group">
              <FileText className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <Input name="numero_poliza" value={poliza.numero_poliza} onChange={handleChange} required placeholder="EJ: POL-100" className="pl-10 text-white bg-black/20 border-white/10 focus:bg-black/40 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 placeholder:text-slate-600 uppercase transition-all" />
            </div>
          </div>
          
          <div className="space-y-2 relative group">
            <Label className="text-slate-300 font-bold text-xs uppercase tracking-wider flex items-center gap-2 mb-2"><Tag className="h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors"/> {t('polizas.policyType')}</Label>
            <div className={selectStylesClass}>
              <HeadlessSafeSelect id="tipo_poliza" label="Tipo" value={poliza.tipo_poliza} onChange={(v) => handleSelectChange('tipo_poliza', v)} options={tipoPolizaOptions} />
            </div>
          </div>

          <div className="space-y-2 relative">
            <Label className="text-slate-300 font-bold text-xs uppercase tracking-wider">{t('polizas.annualPremium')}</Label>
            <div className="relative group">
              <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <Input name="prima" type="number" step="0.01" value={poliza.prima} onChange={handleChange} required placeholder="0.00" className="pl-10 text-white bg-black/20 border-white/10 focus:bg-black/40 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 placeholder:text-slate-600 transition-all" />
            </div>
          </div>

          <div className="space-y-2 relative">
            <Label className="text-emerald-400 font-bold text-xs uppercase tracking-wider">{t('polizas.insuredSum')}</Label>
            <div className="relative group">
              <Shield className="absolute left-3 top-2.5 h-4 w-4 text-emerald-500" />
              <Input name="suma_asegurada" type="number" step="0.01" value={poliza.suma_asegurada} onChange={handleChange} placeholder="0.00" className="pl-10 bg-emerald-500/10 font-bold text-emerald-400 border-emerald-500/30 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all placeholder:text-emerald-700/50" />
            </div>
          </div>
          
          <div className="space-y-2 relative">
            <Label className="text-rose-400 font-bold text-xs uppercase tracking-wider">{t('polizas.deductible')}</Label>
            <div className="relative group">
              <AlertCircle className="absolute left-3 top-2.5 h-4 w-4 text-rose-500" />
              <Input name="deducible" type="number" step="0.01" value={poliza.deducible} onChange={handleChange} placeholder="0.00" className="pl-10 bg-rose-500/10 font-bold text-rose-400 border-rose-500/30 focus:border-rose-400 focus:ring-1 focus:ring-rose-400 transition-all placeholder:text-rose-700/50" />
            </div>
          </div>
          
          <div className="space-y-2 relative">
            <Label className="text-slate-300 font-bold text-xs uppercase tracking-wider">{t('polizas.startDate')}</Label>
            <div className="relative group">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <Input name="fecha_inicio" type="date" value={poliza.fecha_inicio} onChange={handleChange} required className="pl-10 text-white bg-black/20 border-white/10 focus:bg-black/40 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all [&::-webkit-calendar-picker-indicator]:invert" />
            </div>
          </div>
          
          <div className="space-y-2 relative">
            <Label className="text-slate-300 font-bold text-xs uppercase tracking-wider">{t('polizas.expirationDate')}</Label>
            <div className="relative group">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <Input name="fecha_fin" type="date" value={poliza.fecha_fin} onChange={handleChange} required className="pl-10 text-white bg-black/20 border-white/10 focus:bg-black/40 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all [&::-webkit-calendar-picker-indicator]:invert" />
            </div>
          </div>
          
          <div className="space-y-2 relative group">
            <Label className="text-slate-300 font-bold text-xs uppercase tracking-wider flex items-center gap-2 mb-2"><Activity className="h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors"/> {t('polizas.status')}</Label>
            <div className={selectStylesClass}>
              <HeadlessSafeSelect id="estado" label="Estado" value={poliza.estado} onChange={(v) => handleSelectChange('estado', v)} options={[{id: 'Activa', nombre: t('polizas.statusActive')}, {id: 'Inactiva', nombre: t('polizas.statusInactive')}, {id: 'Vencida', nombre: t('polizas.statusExpired')}, {id: 'Pendiente', nombre: t('polizas.statusPending')}]} />
            </div>
          </div>

          <div className="space-y-2 relative group">
            <Label className="text-slate-300 font-bold text-xs uppercase tracking-wider mb-2 block">{t('polizas.insuranceHolder')}</Label>
            <div className={selectStylesClass}>
              <HeadlessSafeSelect id="cliente_id" label="Cliente" value={poliza.cliente_id} onChange={(v) => handleSelectChange('cliente_id', v)} options={clienteOptions} loading={isLoadingClients} />
            </div>
          </div>
          
          <div className="space-y-2 relative group">
            <Label className="text-slate-300 font-bold text-xs uppercase tracking-wider mb-2 block">{t('polizas.insuranceCompany')}</Label>
            <div className={selectStylesClass}>
              <HeadlessSafeSelect id="empresa_aseguradora_id" label="Empresa" value={poliza.empresa_aseguradora_id} onChange={(v) => handleSelectChange('empresa_aseguradora_id', v)} options={empresaOptions} loading={isLoadingCompanies} />
            </div>
          </div>
          
          <div className="space-y-2 relative group">
            <Label className="text-slate-300 font-bold text-xs uppercase tracking-wider mb-2 block">{t('polizas.responsibleAdvisor')}</Label>
            <div className={selectStylesClass}>
              <HeadlessSafeSelect id="asesor_id" label="Asesor" value={poliza.asesor_id} onChange={(v) => handleSelectChange('asesor_id', v)} options={asesorOptions} loading={isLoadingAdvisors} />
            </div>
          </div>

          <div className="md:col-span-2 lg:col-span-3 flex justify-end space-x-4 mt-4 pt-6 border-t border-white/10">
            {editingPoliza && <Button type="button" variant="outline" className="text-slate-300 border-white/20 bg-transparent hover:bg-white/10 hover:text-white transition-all" onClick={() => setEditingPoliza(null)}>{t('polizas.discardChanges')}</Button>}
            <Button type="submit" disabled={isSubmitting} className={`shadow-lg font-black tracking-wide border transition-all active:scale-95 ${editingPoliza ? 'bg-amber-600/80 hover:bg-amber-500 border-amber-500/50 text-white shadow-[0_0_15px_rgba(217,119,6,0.5)]' : 'bg-indigo-600/80 hover:bg-indigo-500 border-indigo-500/50 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]'}`}>
              {isSubmitting ? t('polizas.processing') : <span className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5" /> {editingPoliza ? t('polizas.saveChanges') : t('polizas.issuePolicy')}</span>}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default PolizaForm;