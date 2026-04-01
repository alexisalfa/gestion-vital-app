// src/components/ComisionForm.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/lib/use-toast';
import { HeadlessSafeSelect } from './HeadlessSafeSelect';
import { Calculator, User, Shield, Percent, DollarSign, Calendar, CheckCircle2, X, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next'; // 🚀 Traductor Inyectado

const formatDateToInput = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
};

function ComisionForm({ onComisionSaved, editingComision, setEditingComision, apiBaseUrl, asesores = [], isLoadingAdvisors, polizas = [], isLoadingPolicies, comisiones = [] }) {
  const { toast } = useToast();
  const { t } = useTranslation();
  const initialComisionState = { id_asesor: '', id_poliza: '', tipo_comision: 'porcentaje', valor_comision: '', monto_base: '', monto_final: '', fecha_generacion: formatDateToInput(new Date().toISOString()), fecha_pago: '', estatus_pago: 'pendiente', observaciones: '' };

  const [comision, setComision] = useState(initialComisionState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingComision) {
      setComision({
        ...editingComision,
        fecha_generacion: formatDateToInput(editingComision.fecha_generacion),
        fecha_pago: editingComision.fecha_pago ? formatDateToInput(editingComision.fecha_pago) : '',
        id_asesor: editingComision.id_asesor?.toString() || '',
        id_poliza: editingComision.id_poliza?.toString() || '',
      });
    } else {
      setComision(initialComisionState);
    }
  }, [editingComision]);

  const handleChange = (e) => setComision((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleSelectChange = (name, value) => setComision((prev) => ({ ...prev, [name]: value }));

  const montoFinalCalculado = useMemo(() => {
    if (comision.tipo_comision === 'fijo') return comision.valor_comision;
    if (comision.tipo_comision === 'porcentaje' && comision.monto_base && comision.valor_comision) {
      return (parseFloat(comision.monto_base) * (parseFloat(comision.valor_comision) / 100)).toFixed(2);
    }
    return '0.00';
  }, [comision.tipo_comision, comision.valor_comision, comision.monto_base]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formattedData = {
      ...comision,
      id_asesor: parseInt(comision.id_asesor, 10),
      id_poliza: parseInt(comision.id_poliza, 10),
      valor_comision: parseFloat(comision.valor_comision),
      monto_base: comision.monto_base ? parseFloat(comision.monto_base) : 0,
      monto_final: parseFloat(montoFinalCalculado),
      fecha_generacion: comision.fecha_generacion || null,
      fecha_pago: comision.fecha_pago || null,
    };

    try {
      const token = localStorage.getItem('access_token');
      const method = editingComision ? 'PUT' : 'POST';
      const url = editingComision ? `${apiBaseUrl}/comisiones/${editingComision.id}` : `${apiBaseUrl}/comisiones`;

      const response = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) throw new Error(t('comisiones.toastError'));

      toast({ title: t('comisiones.toastSuccess'), description: t('comisiones.toastSavedSuccess'), variant: "success" });
      onComisionSaved();
      setComision(initialComisionState);
      setEditingComision(null);
    } catch (error) {
      toast({ title: t('comisiones.toastError'), description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const asesorOptions = useMemo(() => asesores.map(a => ({ id: a.id, nombre: `${a.nombre} ${a.apellido || ''}` })), [asesores]);
  
  const polizaOptions = useMemo(() => {
    const idPolizaEditando = editingComision ? String(editingComision.id_poliza) : null;
    return polizas
      .filter(p => {
        const yaTieneComision = comisiones.some(c => String(c.id_poliza) === String(p.id));
        return !yaTieneComision || String(p.id) === idPolizaEditando;
      })
      .map(p => ({ id: p.id, nombre: `${t('comisiones.policy')} ${p.numero_poliza}` }));
  }, [polizas, comisiones, editingComision, t]);

  const selectStylesClass = "[&_button]:!bg-black/20 [&_button]:!border-white/10 [&_button]:!text-white hover:[&_button]:!border-amber-400 focus:[&_button]:!ring-amber-400 [&_div[role='listbox']]:!bg-slate-800 [&_div[role='listbox']]:!border-white/10 [&_li]:!text-slate-200 hover:[&_li]:!bg-amber-500/20 hover:[&_li]:!text-amber-300";

  return (
    <Card className="mb-8 bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-2xl overflow-hidden transition-all duration-300">
      
      <div className={`p-6 ${editingComision ? 'bg-gradient-to-r from-blue-600/20 to-indigo-700/20 border-b border-blue-500/30' : 'bg-gradient-to-r from-amber-600/20 to-yellow-600/20 border-b border-amber-500/30'} flex justify-between items-center`}>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl backdrop-blur-md border ${editingComision ? 'bg-blue-500/20 border-blue-500/40 text-blue-400' : 'bg-amber-500/20 border-amber-500/40 text-amber-400'}`}>
            <Calculator className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white drop-shadow-md">{editingComision ? t('comisiones.formTitleEdit') : t('comisiones.formTitleNew')}</h2>
            <p className="text-slate-300 text-sm font-medium mt-0.5">{t('comisiones.formDesc')}</p>
          </div>
        </div>
        {editingComision && <Button variant="ghost" size="icon" className="text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-colors" onClick={() => setEditingComision(null)}><X className="h-5 w-5" /></Button>}
      </div>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
          
          <div className="space-y-2 relative group">
            <Label className="text-slate-300 font-bold text-xs uppercase tracking-wider flex items-center gap-2 mb-2"><User className="h-4 w-4 text-slate-500 group-focus-within:text-amber-400 transition-colors"/> {t('comisiones.advisor')}</Label>
            <div className={selectStylesClass}>
              <HeadlessSafeSelect label={t('comisiones.selectAdvisor')} value={comision.id_asesor} onChange={(v) => handleSelectChange('id_asesor', v)} options={asesorOptions} loading={isLoadingAdvisors} />
            </div>
          </div>

          <div className="space-y-2 relative group">
            <Label className="text-slate-300 font-bold text-xs uppercase tracking-wider flex items-center gap-2 mb-2"><Shield className="h-4 w-4 text-slate-500 group-focus-within:text-amber-400 transition-colors"/> {t('comisiones.sourcePolicy')}</Label>
            <div className={selectStylesClass}>
              <HeadlessSafeSelect label={t('comisiones.selectPolicy')} value={comision.id_poliza} onChange={(v) => handleSelectChange('id_poliza', v)} options={polizaOptions} loading={isLoadingPolicies} />
            </div>
          </div>

          <div className="space-y-2 relative group">
            <Label className="text-slate-300 font-bold text-xs uppercase tracking-wider flex items-center gap-2 mb-2"><Percent className="h-4 w-4 text-slate-500 group-focus-within:text-amber-400 transition-colors"/> {t('comisiones.scheme')}</Label>
            <div className={selectStylesClass}>
              <HeadlessSafeSelect value={comision.tipo_comision} onChange={(v) => handleSelectChange('tipo_comision', v)} options={[{id: 'porcentaje', nombre: t('comisiones.percentage')}, {id: 'fijo', nombre: t('comisiones.fixedAmount')}]} />
            </div>
          </div>

          <div className="space-y-2 relative">
            <Label className="text-slate-300 font-bold text-xs uppercase tracking-wider">{t('comisiones.value')} ({comision.tipo_comision === 'porcentaje' ? '%' : '$'})</Label>
            <div className="relative group">
              <Percent className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 group-focus-within:text-amber-400 transition-colors" />
              <Input name="valor_comision" type="number" step="0.01" value={comision.valor_comision} onChange={handleChange} required className="pl-10 text-white bg-black/20 border-white/10 focus:bg-black/40 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 font-bold transition-all" />
            </div>
          </div>

          {comision.tipo_comision === 'porcentaje' && (
            <div className="space-y-2 relative">
              <Label className="text-slate-300 font-bold text-xs uppercase tracking-wider">{t('comisiones.baseAmount')}</Label>
              <div className="relative group">
                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 group-focus-within:text-amber-400 transition-colors" />
                <Input name="monto_base" type="number" step="0.01" value={comision.monto_base} onChange={handleChange} required className="pl-10 text-white bg-black/20 border-white/10 focus:bg-black/40 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all" />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-emerald-400 font-bold text-xs uppercase tracking-wider flex items-center gap-2"><DollarSign className="h-4 w-4"/> {t('comisiones.totalToPay')}</Label>
            <div className="h-10 px-4 flex items-center bg-emerald-500/10 border border-emerald-500/30 rounded-md font-black text-emerald-400 shadow-inner">
              $ {montoFinalCalculado}
            </div>
          </div>

          <div className="space-y-2 relative">
            <Label className="text-slate-300 font-bold text-xs uppercase tracking-wider">{t('comisiones.generationDate')}</Label>
            <div className="relative group">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 group-focus-within:text-amber-400 transition-colors" />
              <Input name="fecha_generacion" type="date" value={comision.fecha_generacion} onChange={handleChange} required className="pl-10 text-white bg-black/20 border-white/10 focus:bg-black/40 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all [&::-webkit-calendar-picker-indicator]:invert" />
            </div>
          </div>

          <div className="space-y-2 relative group">
            <Label className="text-slate-300 font-bold text-xs uppercase tracking-wider flex items-center gap-2 mb-2"><CheckCircle2 className="h-4 w-4 text-slate-500 group-focus-within:text-amber-400 transition-colors"/> {t('comisiones.status')}</Label>
            <div className={selectStylesClass}>
              <HeadlessSafeSelect value={comision.estatus_pago} onChange={(v) => handleSelectChange('estatus_pago', v)} options={[{id: 'pendiente', nombre: t('comisiones.statusPending')}, {id: 'pagado', nombre: t('comisiones.statusPaid')}, {id: 'anulado', nombre: t('comisiones.statusCancelled')}]} />
            </div>
          </div>

          <div className="md:col-span-2 lg:col-span-3 space-y-2 relative">
            <Label className="text-slate-300 font-bold text-xs uppercase tracking-wider">{t('comisiones.observations')}</Label>
            <div className="relative group">
              <Info className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 group-focus-within:text-amber-400 transition-colors" />
              <Input name="observaciones" value={comision.observaciones} onChange={handleChange} placeholder={t('comisiones.observationsPlaceholder')} className="pl-10 text-white bg-black/20 border-white/10 focus:bg-black/40 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all" />
            </div>
          </div>

          <div className="md:col-span-2 lg:col-span-3 flex justify-end space-x-4 mt-4 pt-6 border-t border-white/10">
            {editingComision && <Button type="button" variant="outline" className="text-slate-300 border-white/20 bg-transparent hover:bg-white/10 hover:text-white transition-all" onClick={() => setEditingComision(null)}>{t('comisiones.discardChanges')}</Button>}
            <Button type="submit" disabled={isSubmitting} className={`shadow-lg font-black tracking-wide border transition-all active:scale-95 ${editingComision ? 'bg-blue-600/80 hover:bg-blue-500 border-blue-500/50 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-amber-600/80 hover:bg-amber-500 border-amber-500/50 text-white shadow-[0_0_15px_rgba(245,158,11,0.5)]'}`}>
              {isSubmitting ? t('comisiones.processing') : <span className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5"/> {editingComision ? t('comisiones.updateCommission') : t('comisiones.generatePayment')}</span>}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
export default ComisionForm;