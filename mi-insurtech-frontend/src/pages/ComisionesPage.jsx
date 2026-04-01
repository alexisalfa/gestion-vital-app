// src/pages/ComisionesPage.jsx
import React from 'react';
import ComisionForm from '../components/ComisionForm';
import ComisionImport from '../components/ComisionImport';
import ComisionList from '../components/ComisionList';
import { useTranslation } from 'react-i18next'; // 🚀 Traductor Inyectado

function ComisionesPage(props) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-2xl font-black text-white tracking-tight drop-shadow-md">{t('comisiones.pageTitle')}</h2>
      
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
        key={`list-sync-${props.asesores?.length || 0}-${props.polizas?.length || 0}`}
        comisiones={props.comisiones} 
        asesores={props.asesores} 
        polizas={props.polizas} 
        getDateFormatOptions={props.getDateFormatOptions}
        dateFormat={props.dateFormat} 
        
        totalItems={props.totalComisiones} 
        onPageChange={props.setComisionCurrentPage} 
        onExport={props.exportToCsv} 
        onExportPdf={props.exportToPdf} 
        onSearch={() => {}} 
        
        onEditComision={props.handleEditComision} 
        onDeleteComision={props.handleDeleteComision}
        onPagoExitoso={props.handleComisionSaved}
        currentPage={props.comisionCurrentPage} 
        itemsPerPage={props.itemsPerPage}
        
        asesorIdFilter={props.comisionAsesorIdFilter} 
        estadoPagoFilter={props.comisionEstadoPagoFilter} 
        fechaInicioFilter={props.comisionFechaInicioFilter} 
        fechaFinFilter={props.comisionFechaFinFilter}
        
        setAsesorIdFilter={props.setComisionAsesorIdFilter} 
        setEstadoPagoFilter={props.setComisionEstadoPagoFilter} 
        setFechaInicioFilter={props.setComisionFechaInicioFilter} 
        setFechaFinFilter={props.setComisionFechaFinFilter}
        
        currencySymbol={props.currencySymbol}
      />
    </div>
  );
}

export default ComisionesPage;