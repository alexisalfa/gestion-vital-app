// src/pages/AsesoresPage.jsx
import React from 'react';
import AsesorForm from '../components/AsesorForm';
import AsesorImport from '../components/AsesorImport';
import AsesorList from '../components/AsesorList';

function AsesoresPage({
  apiBaseUrl,
  asesores,
  editingAsesor,
  setEditingAsesor,
  handleAsesorSaved,
  handleAsesorDelete,
  asesorCurrentPage,
  itemsPerPage,
  totalAsesores,
  handleAsesorPageChange,
  asesorSearchTerm,
  setAsesorSearchTerm,
  handleAsesorSearch,
  exportToCsv,
  exportToPdf,
  empresasAseguradoras,
  isLoadingCompanies,
  dateFormat,
  getDateFormatOptions
}) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Fuerza de Ventas</h2>
      
      <AsesorForm 
        onAsesorSaved={handleAsesorSaved} 
        editingAsesor={editingAsesor} 
        setEditingAsesor={setEditingAsesor} 
        apiBaseUrl={apiBaseUrl} 
        empresasAseguradoras={empresasAseguradoras} 
        isLoadingCompanies={isLoadingCompanies} 
      />
      
      <AsesorImport 
        apiBaseUrl={apiBaseUrl} 
        onImportComplete={handleAsesorSaved} 
      />
      
      <AsesorList
        asesores={asesores} 
        onEditAsesor={setEditingAsesor} 
        onDeleteAsesor={handleAsesorDelete}
        currentPage={asesorCurrentPage} 
        itemsPerPage={itemsPerPage} 
        totalItems={totalAsesores}
        onPageChange={handleAsesorPageChange} 
        searchTerm={asesorSearchTerm} 
        setSearchTerm={setAsesorSearchTerm}
        onSearch={handleAsesorSearch} 
        onExport={exportToCsv} 
        onExportPdf={exportToPdf} 
        empresasAseguradoras={empresasAseguradoras} 
        dateFormat={dateFormat} 
        getDateFormatOptions={getDateFormatOptions}
      />
    </div>
  );
}

export default AsesoresPage;