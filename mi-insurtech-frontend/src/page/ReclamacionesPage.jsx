// src/pages/ReclamacionesPage.jsx
import React from 'react';
import ReclamacionForm from '../components/ReclamacionForm';
import ReclamacionImport from '../components/ReclamacionImport';
import ReclamacionList from '../components/ReclamacionList';

function ReclamacionesPage({
  apiBaseUrl,
  reclamaciones,
  editingReclamacion,
  setEditingReclamacion,
  handleReclamacionSaved,
  handleReclamacionDelete,
  fetchClaimsData,
  reclamacionSearchTerm,
  reclamacionEstadoFilter,
  reclamacionClienteIdFilter,
  reclamacionPolizaIdFilter,
  reclamacionFechaReclamacionInicioFilter,
  reclamacionFechaReclamacionFinFilter,
  setReclamacionSearchTerm,
  setReclamacionEstadoFilter,
  setReclamacionClienteIdFilter,
  setReclamacionPolizaIdFilter,
  setReclamacionFechaReclamacionInicioFilter,
  setReclamacionFechaReclamacionFinFilter,
  handleReclamacionSearch,
  reclamacionCurrentPage,
  itemsPerPage,
  totalReclamaciones,
  handleReclamacionPageChange,
  exportToCsv,
  exportToPdf,
  clientes,
  polizas,
  isLoadingPolicies,
  isLoadingClients,
  isLoadingReclamaciones,
  currencySymbol,
  dateFormat,
  getDateFormatOptions
}) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Control de Siniestros</h2>
      
      <ReclamacionForm 
        onReclamacionSaved={handleReclamacionSaved} 
        editingReclamacion={editingReclamacion} 
        setEditingReclamacion={setEditingReclamacion} 
        apiBaseUrl={apiBaseUrl} 
        polizas={polizas} 
        clientes={clientes} 
        isLoadingPolicies={isLoadingPolicies} 
        isLoadingClients={isLoadingClients} 
      />
      
      <ReclamacionImport 
        apiBaseUrl={apiBaseUrl} 
        onImportComplete={fetchClaimsData} 
      />
      
      <ReclamacionList
        reclamaciones={reclamaciones} 
        onEditReclamacion={setEditingReclamacion} 
        onDeleteReclamacion={handleReclamacionDelete}
        searchTerm={reclamacionSearchTerm} 
        estadoFilter={reclamacionEstadoFilter} 
        clienteIdFilter={reclamacionClienteIdFilter} 
        polizaIdFilter={reclamacionPolizaIdFilter}
        fechaReclamacionInicioFilter={reclamacionFechaReclamacionInicioFilter} 
        fechaReclamacionFinFilter={reclamacionFechaReclamacionFinFilter}
        setSearchTerm={setReclamacionSearchTerm} 
        setEstadoFilter={setReclamacionEstadoFilter} 
        setClienteIdFilter={setReclamacionClienteIdFilter} 
        setPolizaIdFilter={setReclamacionPolizaIdFilter}
        setFechaReclamacionInicioFilter={setReclamacionFechaReclamacionInicioFilter} 
        setFechaReclamacionFinFilter={setReclamacionFechaReclamacionFinFilter}
        onSearch={handleReclamacionSearch} 
        currentPage={reclamacionCurrentPage} 
        itemsPerPage={itemsPerPage} 
        totalItems={totalReclamaciones}
        onPageChange={handleReclamacionPageChange} 
        apiBaseUrl={apiBaseUrl} 
        onExport={exportToCsv} 
        onExportPdf={exportToPdf}
        clients={clientes} 
        polizas={polizas} 
        isLoadingPolicies={isLoadingPolicies} 
        isLoadingClients={isLoadingClients} 
        isLoadingReclamaciones={isLoadingReclamaciones}
        currencySymbol={currencySymbol} 
        dateFormat={dateFormat} 
        getDateFormatOptions={getDateFormatOptions}
        onReclamacionUpdated={handleReclamacionSaved}
      />
    </div>
  );
}

export default ReclamacionesPage;