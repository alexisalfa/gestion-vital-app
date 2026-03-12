import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, Zap, Clock, PartyPopper } from 'lucide-react';

const Configuracion = ({ userConfig }) => {
  const [loading, setLoading] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  // Detectar si venimos de un pago exitoso al cargar el componente
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      setShowSuccessAlert(true);
      // Limpiar la URL para que no aparezca el mensaje si el usuario recarga
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Ocultar la alerta automáticamente después de 8 segundos
      setTimeout(() => setShowSuccessAlert(false), 8000);
    }
  }, []);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/payments/create-checkout-session', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al conectar con Stripe");
    } finally {
      setLoading(false);
    }
  };

  const isPro = userConfig?.plan_tipo === 'PRO_ANNUAL';

  return (
    <div className="p-6 bg-gray-50 min-h-screen relative">
      
      {/* ALERTA FLOTANTE DE ÉXITO */}
      {showSuccessAlert && (
        <div className="fixed top-5 right-5 z-50 animate-bounce">
          <div className="bg-green-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-4 border-2 border-green-400">
            <div className="bg-white p-2 rounded-full">
              <PartyPopper className="text-green-600" size={24} />
            </div>
            <div>
              <p className="font-bold text-lg">¡Pago Confirmado!</p>
              <p className="text-sm opacity-90">Tu cuenta ahora es Insurtech PRO. ¡Disfrútala!</p>
            </div>
            <button onClick={() => setShowSuccessAlert(false)} className="ml-4 hover:scale-110">✕</button>
          </div>
        </div>
      )}

      <h2 className="text-2xl font-bold mb-6 text-gray-800">Configuración de Cuenta</h2>

      {/* CARD DE SUSCRIPCIÓN */}
      <div className="max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className={`p-1 ${isPro ? 'bg-green-500' : 'bg-indigo-600'}`}></div>
        
        <div className="p-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Plan Actual</p>
              <h3 className="text-3xl font-extrabold text-gray-900 mt-1">
                {isPro ? 'Insurtech PRO' : 'Prueba Gratuita'}
              </h3>
            </div>
            <div className={`p-2 rounded-lg ${isPro ? 'bg-green-100' : 'bg-indigo-100'}`}>
              {isPro ? <Zap className="text-green-600" /> : <Clock className="text-indigo-600" />}
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center text-gray-600 text-sm">
              <CheckCircle size={16} className="mr-2 text-green-500" />
              <span>Acceso ilimitado a aseguradoras</span>
            </div>
            <div className="flex items-center text-gray-600 text-sm">
              <CheckCircle size={16} className="mr-2 text-green-500" />
              <span>Soporte técnico prioritario</span>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <div className="flex justify-between text-sm mb-6">
              <span className="text-gray-500">Estado:</span>
              <span className={`font-bold ${isPro ? 'text-green-600' : 'text-indigo-600'}`}>
                {isPro ? 'Activo hasta ' + new Date(userConfig?.fecha_vencimiento).toLocaleDateString() : 'Pendiente de activar'}
              </span>
            </div>

            {!isPro ? (
              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-4 rounded-xl transition-all flex items-center justify-center shadow-lg shadow-indigo-200 active:scale-95"
              >
                <CreditCard className="mr-2" size={20} />
                {loading ? 'Preparando pasarela...' : 'Mejorar a PRO ($99)'}
              </button>
            ) : (
              <div className="w-full bg-green-50 text-green-700 font-bold py-4 px-4 rounded-xl border border-green-200 flex items-center justify-center">
                <CheckCircle className="mr-2" size={20} />
                Licencia PRO Activada
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configuracion;