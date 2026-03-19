// src/components/ComisionForm.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/lib/use-toast';
import { HeadlessSafeSelect } from './HeadlessSafeSelect';
import { Calculator, User, Shield, Percent, DollarSign, Calendar, CheckCircle2, X, Info } from 'lucide-react';

const formatDateToInput = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
};

// 🚀 AÑADIDO: Recibe 'comisiones = []' en los props
function ComisionForm({ onComisionSaved, editingComision, setEditingComision, apiBaseUrl, asesores = [], isLoadingAdvisors, polizas = [], isLoadingPolicies, comisiones = [] }) {
  const { toast } = useToast();
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

  // Cálculo automático del monto final si es porcentaje
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

      if (!response.ok) throw new Error('Error al guardar la comisión');

      toast({ title: "Éxito", description: "Comisión registrada correctamente.", variant: "success" });
      onComisionSaved();
      setComision(initialComisionState);
      setEditingComision(null);
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const asesorOptions = useMemo(() => asesores.map(a => ({ id: a.id, nombre: `${a.nombre} ${a.apellido || ''}` })), [asesores]);
  
  // --- 🚀 FILTRO DE PREVENCIÓN DE DOBLE PAGO ---
  const polizaOptions = useMemo(() => {
    const idPolizaEditando = editingComision ? String(editingComision.id_poliza) : null;

    return polizas
      .filter(p => {
        const yaTieneComision = comisiones.some(c => String(c.id_poliza) === String(p.id));
        return !yaTieneComision || String(p.id) === idPolizaEditando;
      })
      .map(p => ({ id: p.id, nombre: `Póliza: ${p.numero_poliza}` }));
  }, [polizas, comisiones, editingComision]);
  // --------------------------------------------------------

  return (
    <Card className="mb-8 border-none shadow-xl rounded-xl overflow-hidden">
      <div className={`p-6 ${editingComision ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : 'bg-gradient-to-r from-slate-800 to-slate-900'} text-white flex justify-between items-center`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md"><Calculator className="h-6 w-6" /></div>
          <div>
            <h2 className="text-xl font-bold">{editingComision ? 'Editar Liquidación' : 'Nueva Liquidación de Comisión'}</h2>
            <p className="text-slate-300 text-sm">Cálculo y control de pagos a asesores.</p>
          </div>
        </div>
        {editingComision && <Button variant="ghost" size="icon" onClick={() => setEditingComision(null)}><X className="h-5 w-5" /></Button>}
      </div>

      <CardContent className="p-6 bg-white">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label className="text-gray-600 font-semibold flex items-center gap-2"><User className="h-4 w-4"/> Asesor</Label>
            <HeadlessSafeSelect label="Seleccione Asesor" value={comision.id_asesor} onChange={(v) => handleSelectChange('id_asesor', v)} options={asesorOptions} loading={isLoadingAdvisors} className="bg-gray-50" />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-600 font-semibold flex items-center gap-2"><Shield className="h-4 w-4"/> Póliza Origen</Label>
            <HeadlessSafeSelect label="Seleccione Póliza" value={comision.id_poliza} onChange={(v) => handleSelectChange('id_poliza', v)} options={polizaOptions} loading={isLoadingPolicies} className="bg-gray-50" />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-600 font-semibold flex items-center gap-2"><Percent className="h-4 w-4"/> Esquema</Label>
            <HeadlessSafeSelect value={comision.tipo_comision} onChange={(v) => handleSelectChange('tipo_comision', v)} options={[{id: 'porcentaje', nombre: 'Porcentaje (%)'}, {id: 'fijo', nombre: 'Monto Fijo'}]} className="bg-gray-50" />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-600 font-semibold">Valor ({comision.tipo_comision === 'porcentaje' ? '%' : '$'})</Label>
            <Input name="valor_comision" type="number" step="0.01" value={comision.valor_comision} onChange={handleChange} required className="bg-gray-50 font-bold" />
          </div>

          {comision.tipo_comision === 'porcentaje' && (
            <div className="space-y-2">
              <Label className="text-gray-600 font-semibold">Monto Base (Prima)</Label>
              <Input name="monto_base" type="number" step="0.01" value={comision.monto_base} onChange={handleChange} required className="bg-gray-50" />
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-gray-600 font-semibold flex items-center gap-2"><DollarSign className="h-4 w-4 text-emerald-600"/> Total a Pagar</Label>
            <div className="h-10 px-3 flex items-center bg-emerald-50 border border-emerald-100 rounded-md font-black text-emerald-700">
              {montoFinalCalculado}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-600 font-semibold flex items-center gap-2"><Calendar className="h-4 w-4"/> F. Generación</Label>
            <Input name="fecha_generacion" type="date" value={comision.fecha_generacion} onChange={handleChange} required className="bg-gray-50" />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-600 font-semibold flex items-center gap-2"><CheckCircle2 className="h-4 w-4"/> Estatus</Label>
            <HeadlessSafeSelect value={comision.estatus_pago} onChange={(v) => handleSelectChange('estatus_pago', v)} options={[{id: 'pendiente', nombre: 'Pendiente'}, {id: 'pagado', nombre: 'Pagado'}, {id: 'anulado', nombre: 'Anulado'}]} className="bg-gray-50" />
          </div>

          <div className="md:col-span-2 lg:col-span-3 space-y-2">
            <Label className="text-gray-600 font-semibold flex items-center gap-2"><Info className="h-4 w-4"/> Observaciones</Label>
            <Input name="observaciones" value={comision.observaciones} onChange={handleChange} placeholder="Notas internas..." className="bg-gray-50" />
          </div>

          <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-4 pt-4 border-t">
            <Button type="submit" disabled={isSubmitting} className="bg-slate-900 hover:bg-black text-white font-bold shadow-lg">
              {isSubmitting ? 'Procesando...' : <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4"/> {editingComision ? 'Actualizar Comisión' : 'Generar Pago'}</span>}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
export default ComisionForm;