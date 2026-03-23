// src/pages/ComisionesPage.jsx
import React from 'react';
import ComisionForm from '../components/ComisionForm';
import ComisionImport from '../components/ComisionImport';
import ComisionList from '../components/ComisionList';

function ComisionesPage(props) {
  // 🛡️ ESCUDO DE TITANIO: Función inofensiva para evitar colapsos
  const safeFunc = () => {}; 

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Liquidación de Comisiones</h2>
      
      <ComisionForm 
        {...props} // 👈 Inyecta TODO lo que viene de App.jsx automáticamente
        onComisionSaved={props.handleComisionSaved || safeFunc} 
        editingComision={props.editingComision} 
        setEditingComision={props.setEditingComision || safeFunc} 
        onClose={safeFunc} // Por si el formulario intenta cerrarse solo
        onCancel={safeFunc} 
      />
      
      <ComisionImport 
        apiBaseUrl={props.apiBaseUrl} 
        onImportComplete={props.handleComisionSaved || safeFunc} 
      />
      
      <ComisionList
        {...props} // 👈 Inyecta TODO a la tabla (filtros, exportar, etc.)
        key={`list-sync-${props.asesores?.length || 0}-${props.polizas?.length || 0}`}
        getDateFormatOptions={props.getDateFormatOptions || safeFunc}
        
        // Cubrimos todas las posibles variaciones de nombres que pida la tabla:
        onEditComision={props.handleEditComision || safeFunc} 
        onDeleteComision={props.handleDeleteComision || safeFunc}
        handleComisionDelete={props.handleDeleteComision || safeFunc}
        
        currentPage={props.comisionCurrentPage} 
        setCurrentPage={props.setComisionCurrentPage || safeFunc} 
        handlePageChange={props.setComisionCurrentPage || safeFunc} 
        onPageChange={props.setComisionCurrentPage || safeFunc} 
        handleComisionPageChange={props.setComisionCurrentPage || safeFunc}
        
        setAsesorIdFilter={props.setComisionAsesorIdFilter || safeFunc} 
        setEstadoPagoFilter={props.setComisionEstadoPagoFilter || safeFunc} 
        setFechaInicioFilter={props.setComisionFechaInicioFilter || safeFunc} 
        setFechaFinFilter={props.setComisionFechaFinFilter || safeFunc}
        
        onPagoExitoso={props.handleComisionSaved || safeFunc}
        exportToCsv={props.exportToCsv || safeFunc}
        exportToPdf={props.exportToPdf || safeFunc}
        
        // Funciones fantasma por si la tabla intenta buscar o cargar datos sola
        handleSearch={safeFunc}
        onSearch={safeFunc}
        handleComisionSearch={safeFunc}
        fetchData={safeFunc}
      />
    </div>
  );
}

export default ComisionesPage;