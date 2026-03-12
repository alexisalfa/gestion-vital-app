// src/components/PagoManualModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Wallet, CheckCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PagoManualModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  titulo = "Registrar Pago Manual",
  montoSugerido = 0,
  currencySymbol = "$"
}) => {
  const [metodoPago, setMetodoPago] = useState('Transferencia');
  const [referencia, setReferencia] = useState('');
  const [fechaPago, setFechaPago] = useState(new Date().toISOString().split('T')[0]);
  const [monto, setMonto] = useState(montoSugerido);
  const [notas, setNotas] = useState('');

  // Si el modal se abre con un nuevo monto sugerido, lo actualizamos
  useEffect(() => {
    if (isOpen) {
      setMonto(montoSugerido);
      setMetodoPago('Transferencia');
      setReferencia('');
      setNotas('');
      setFechaPago(new Date().toISOString().split('T')[0]);
    }
  }, [isOpen, montoSugerido]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Empaquetamos los datos y los enviamos al componente padre
    const datosPago = {
      metodo_pago: metodoPago,
      referencia: referencia,
      fecha_pago: fechaPago,
      monto: parseFloat(monto),
      notas: notas
    };
    onConfirm(datosPago);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        
        {/* Cabecera del Modal */}
        <div className="bg-indigo-600 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            <h3 className="font-bold text-lg">{titulo}</h3>
          </div>
          <button onClick={onClose} className="text-indigo-200 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cuerpo del Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Método y Fecha */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase">Método de Pago</label>
              <select 
                value={metodoPago} 
                onChange={(e) => setMetodoPago(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                <option value="Transferencia">Transferencia Bancaria</option>
                <option value="Pago Movil">Pago Móvil</option>
                <option value="Zelle">Zelle</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase">Fecha de Pago</label>
              <input 
                type="date" 
                required
                value={fechaPago}
                onChange={(e) => setFechaPago(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
          </div>

          {/* Monto y Referencia */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase">Monto ({currencySymbol})</label>
              <input 
                type="number" 
                step="0.01"
                required
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-700 text-lg"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase">N° Referencia</label>
              <input 
                type="text" 
                placeholder="Ej. 12345678"
                required={metodoPago !== 'Efectivo'} // Requerido a menos que sea efectivo
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 text-sm placeholder:text-slate-300"
              />
            </div>
          </div>

          {/* Notas Adicionales */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 uppercase flex items-center gap-1">
              <FileText className="h-3 w-3" /> Notas / Observaciones
            </label>
            <textarea 
              rows="2"
              placeholder="Detalles adicionales del pago..."
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
            ></textarea>
          </div>

          {/* Botones de Acción */}
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose} className="text-slate-600">
              Cancelar
            </Button>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2">
              <CheckCircle className="h-4 w-4" /> Registrar Pago
            </Button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default PagoManualModal;