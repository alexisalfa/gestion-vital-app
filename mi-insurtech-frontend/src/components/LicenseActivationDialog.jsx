import React, { useState } from 'react';

const LicenseActivationDialog = ({ token, API_URL }) => {
  const [loading, setLoading] = useState(false);

  const handleActivate = async () => {
    setLoading(true);
    try {
      // CORRECCIÓN: La URL debe incluir /api/v1/ y el endpoint correcto
      const response = await fetch(`${API_URL}/api/v1/license/activate-full`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert("¡Licencia Activada con Éxito!");
        window.location.reload(); 
      } else {
        alert("Error al activar la licencia");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded shadow">
      <h3>Estado de Licencia</h3>
      <button 
        onClick={handleActivate} 
        disabled={loading}
        className="bg-blue-500 text-white p-2 rounded"
      >
        {loading ? "Activando..." : "Adquirir Licencia Full"}
      </button>
    </div>
  );
};

export default LicenseActivationDialog;