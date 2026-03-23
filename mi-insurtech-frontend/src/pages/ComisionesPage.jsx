// src/pages/ComisionesPage.jsx
import React from 'react';
import ComisionForm from '../components/ComisionForm';
import ComisionImport from '../components/ComisionImport';
import ComisionList from '../components/ComisionList';

function ComisionesPage(props) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Liquidación de Comisiones</h2>
      
      <ComisionForm 
        onComisionSaved={props.handleComisionSaved} 
        editingComision={props.editingComision} 
        setEditingComision={props.setEditingComision} 
        apiBaseUrl={props.apiBaseUrl} 
        asesores={props.asesores} 
        polizas={props.polizas} 
        comisiones={props.comisiones}  
        isLoadingAdvisors={props.isLoadingAdvisors} 
        isLoadingPolicies={props.isLoadingPolicies} 
      />
      
      <ComisionImport 
        apiBaseUrl={props.apiBaseUrl} 
        onImportComplete={props.handleComisionSaved} 
      />
      
      <ComisionList
        key={`list-sync-${props.asesores?.length}-${props.polizas?.length}-${props.comisiones?.length}`}
        comisiones={props.comisiones} 
        asesores={props.asesores} 
        polizas={props.polizas} 
        getDateFormatOptions={props.getDateFormatOptions}
        dateFormat={props.dateFormat} 
        totalComisiones={props.totalComisiones} 
        onEditComision={props.handleEditComision} 
        onDeleteComision={props.handleDeleteComision}
        currentPage={props.comisionCurrentPage} 
        setCurrentPage={props.setComisionCurrentPage} 
        handlePageChange={props.setComisionCurrentPage} // 👈 DOBLE BLINDAJE POR SI ACASO
        itemsPerPage={props.itemsPerPage}
        setAsesorIdFilter={props.setComisionAsesorIdFilter} 
        setEstadoPagoFilter={props.setComisionEstadoPagoFilter} 
        setFechaInicioFilter={props.setComisionFechaInicioFilter} 
        setFechaFinFilter={props.setComisionFechaFinFilter}
        onPagoExitoso={props.handleComisionSaved}
        exportToCsv={props.exportToCsv}
        exportToPdf={props.exportToPdf}
        currencySymbol={props.currencySymbol}
      />
    </div>
  );
}

export default ComisionesPage;