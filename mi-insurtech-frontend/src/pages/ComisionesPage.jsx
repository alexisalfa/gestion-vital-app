// src/pages/ComisionesPage.jsx
import React from 'react';
import ComisionForm from '../components/ComisionForm';
import ComisionImport from '../components/ComisionImport';
import ComisionList from '../components/ComisionList';

function ComisionesPage({
  apiBaseUrl,
  comisiones,
  asesores,
  polizas,
  editingComision,
  setEditingComision,
  handleComisionSaved,
  handleEditComision,
  handleDeleteComision,
  isLoadingAdvisors,
  isLoadingPolicies,
  comisionCurrentPage,
  setComisionCurrentPage,
  itemsPerPage,
  totalComisiones,
  setComisionAsesorIdFilter,
  setComisionEstadoPagoFilter,
  setComisionFechaInicioFilter,
  setComisionFechaFinFilter,
  dateFormat,
  getDateFormatOptions
}) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Liquidación de Comisiones</h2>
      
      <ComisionForm 
        onComisionSaved={handleComisionSaved} 
        editingComision={editingComision} 
        setEditingComision={setEditingComision} 
        apiBaseUrl={apiBaseUrl} 
        asesores={asesores} 
        polizas={polizas} 
        comisiones={comisiones}  
        isLoadingAdvisors={isLoadingAdvisors} 
        isLoadingPolicies={isLoadingPolicies} 
      />
      
      <ComisionImport 
        apiBaseUrl={apiBaseUrl} 
        onImportComplete={handleComisionSaved} 
      />
      
      <ComisionList
        key={`list-sync-${asesores.length}-${polizas.length}-${comisiones.length}`}
        comisiones={comisiones} 
        asesores={asesores} 
        polizas={polizas} 
        getDateFormatOptions={getDateFormatOptions}
        dateFormat={dateFormat} 
        totalComisiones={totalComisiones} 
        onEditComision={handleEditComision} 
        onDeleteComision={handleDeleteComision}
        currentPage={comisionCurrentPage} 
        setCurrentPage={setComisionCurrentPage} 
        itemsPerPage={itemsPerPage}
        setAsesorIdFilter={setComisionAsesorIdFilter} 
        setEstadoPagoFilter={setComisionEstadoPagoFilter} 
        setFechaInicioFilter={setComisionFechaInicioFilter} 
        setFechaFinFilter={setComisionFechaFinFilter}
        onPagoExitoso={handleComisionSaved}
      />
    </div>
  );
}

export default ComisionesPage;