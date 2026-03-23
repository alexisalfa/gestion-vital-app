// src/pages/ComisionesPage.jsx
import React from 'react';
import ComisionForm from '../components/ComisionForm';
import ComisionImport from '../components/ComisionImport';
import ComisionList from '../components/ComisionList';

function ComisionesPage(props) {
  // 🛡️ BLINDAJE DE TITANIO: Si una función no llega, usamos esta en su lugar para no colapsar.
  const safeFunc = () => {};

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Liquidación de Comisiones</h2>
      
      <ComisionForm 
        onComisionSaved={props.handleComisionSaved || safeFunc} 
        editingComision={props.editingComision} 
        setEditingComision={props.setEditingComision || safeFunc} 
        apiBaseUrl={props.apiBaseUrl} 
        asesores={props.asesores} 
        polizas={props.polizas} 
        comisiones={props.comisiones}  
        isLoadingAdvisors={props.isLoadingAdvisors} 
        isLoadingPolicies={props.isLoadingPolicies} 
        onClose={safeFunc}
        onCancel={safeFunc}
      />
      
      <ComisionImport 
        apiBaseUrl={props.apiBaseUrl} 
        onImportComplete={props.handleComisionSaved || safeFunc} 
      />
      
      <ComisionList
        key={`list-sync-${props.asesores?.length || 0}-${props.polizas?.length || 0}-${props.comisiones?.length || 0}`}
        comisiones={props.comisiones} 
        asesores={props.asesores} 
        polizas={props.polizas} 
        getDateFormatOptions={props.getDateFormatOptions || safeFunc}
        dateFormat={props.dateFormat} 
        totalComisiones={props.totalComisiones} 
        
        // Controles de Paginación y Acción
        onEditComision={props.handleEditComision || safeFunc} 
        onDeleteComision={props.handleDeleteComision || safeFunc}
        currentPage={props.comisionCurrentPage} 
        setCurrentPage={props.setComisionCurrentPage || safeFunc} 
        handlePageChange={props.setComisionCurrentPage || safeFunc} 
        onPageChange={props.setComisionCurrentPage || safeFunc} 
        itemsPerPage={props.itemsPerPage}
        
        // Filtros - Setters
        setAsesorIdFilter={props.setComisionAsesorIdFilter || safeFunc} 
        setEstadoPagoFilter={props.setComisionEstadoPagoFilter || safeFunc} 
        setFechaInicioFilter={props.setComisionFechaInicioFilter || safeFunc} 
        setFechaFinFilter={props.setComisionFechaFinFilter || safeFunc}
        onAsesorIdFilterChange={props.setComisionAsesorIdFilter || safeFunc} 
        onEstadoPagoFilterChange={props.setComisionEstadoPagoFilter || safeFunc} 
        
        // Filtros - Valores
        asesorIdFilter={props.comisionAsesorIdFilter}
        estadoPagoFilter={props.comisionEstadoPagoFilter}
        fechaInicioFilter={props.comisionFechaInicioFilter}
        fechaFinFilter={props.comisionFechaFinFilter}

        // Exportación y Red
        onPagoExitoso={props.handleComisionSaved || safeFunc}
        exportToCsv={props.exportToCsv || safeFunc}
        exportToPdf={props.exportToPdf || safeFunc}
        currencySymbol={props.currencySymbol}
        fetchCommissionsData={props.fetchCommissionsData || safeFunc}
        fetchData={props.fetchCommissionsData || safeFunc}
        
        // Buscadores Fantasma (Por si la tabla los pide al cargar)
        onSearch={safeFunc}
        handleSearch={safeFunc}
        searchTerm=""
        isLoading={props.isLoadingComisiones}
      />
    </div>
  );
}

export default ComisionesPage;