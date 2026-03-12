// src/pages/EmpresasAseguradorasPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/lib/use-toast';
import EmpresaAseguradoraForm from '@/components/EmpresaAseguradoraForm';
import EmpresaAseguradoraList from '@/components/EmpresaAseguradoraList';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

function EmpresasAseguradorasPage({ token }) {
  const { toast } = useToast();
  const [empresas, setEmpresas] = useState([]);
  const [editingEmpresa, setEditingEmpresa] = useState(null);

  const fetchEmpresas = useCallback(async () => {
    // DIAGNÓSTICO 1: Ver si la función arranca
    console.log("intentando ejecutar fetchEmpresas...");
    console.log("Token actual:", token ? "Recibido (OK)" : "VACÍO (ERROR)");

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/empresas-aseguradoras`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      console.log("Estatus de respuesta:", response.status);

      if (!response.ok) throw new Error('Error en el servidor');

      const data = await response.json();
      
      // DIAGNÓSTICO 2: Ver qué llegó
      console.log("DATOS LLEGANDO A LA PÁGINA:", data);
      
      if (Array.isArray(data)) {
        setEmpresas(data);
      } else if (data && data.items) {
        setEmpresas(data.items);
      } else {
        setEmpresas([]);
      }

    } catch (error) {
      console.error('ERROR CRÍTICO EN FETCH:', error);
    }
  }, [token]); // Quitamos dependencias extra para probar

  useEffect(() => {
    // Forzamos la ejecución
    fetchEmpresas();
  }, [fetchEmpresas, token]); // Aseguramos que si el token cambia, se ejecute

  // ... resto de funciones (handleSaved, handleDelete) igual que antes
  const handleSaved = () => { fetchEmpresas(); setEditingEmpresa(null); };
  const handleDelete = async (id) => { /* tu lógica de delete */ };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold text-center text-gray-800">
        Gestión de Empresas Aseguradoras
      </h1>
      
      {/* Alerta visual de token */}
      {!token && (
        <div className="bg-red-100 text-red-700 p-2 text-center rounded">
          ⚠️ Atención: No hay token de autenticación. La carga fallará.
        </div>
      )}

      <EmpresaAseguradoraForm
        onEmpresaAseguradoraSaved={handleSaved}
        editingEmpresaAseguradora={editingEmpresa}
        setEditingEmpresaAseguradora={setEditingEmpresa}
        apiBaseUrl={API_BASE_URL}
        token={token}
      />

      <EmpresaAseguradoraList
        empresas={empresas}
        onEditEmpresaAseguradora={setEditingEmpresa}
        onDeleteEmpresaAseguradora={handleDelete}
      />
    </div>
  );
}

export default EmpresasAseguradorasPage;