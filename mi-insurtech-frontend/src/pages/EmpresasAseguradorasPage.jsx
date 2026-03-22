// src/pages/EmpresasAseguradorasPage.jsx
import React from 'react';
import EmpresaAseguradoraForm from '../components/EmpresaAseguradoraForm';
import EmpresaAseguradoraImport from '../components/EmpresaAseguradoraImport';
import EmpresaAseguradoraList from '../components/EmpresaAseguradoraList';

function EmpresasAseguradorasPage({
  apiBaseUrl,
  empresas,
  editingEmpresaAseguradora,
  setEditingEmpresaAseguradora,
  handleEmpresaAseguradoraSaved,
  handleEmpresaAseguradoraDelete,
  empresaAseguradoraCurrentPage,
  itemsPerPage,
  totalEmpresasAseguradoras,
  handleEmpresaAseguradoraPageChange,
  empresaAseguradoraSearchTerm,
  setEmpresaAseguradoraSearchTerm,
  handleEmpresaAseguradoraSearch,
  exportToCsv,
  exportToPdf,
  dateFormat,
  getDateFormatOptions
}) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Red de Aseguradoras</h2>
      
      <EmpresaAseguradoraForm 
        onEmpresaAseguradoraSaved={handleEmpresaAseguradoraSaved} 
        editingEmpresaAseguradora={editingEmpresaAseguradora} 
        setEditingEmpresaAseguradora={setEditingEmpresaAseguradora} 
        apiBaseUrl={apiBaseUrl} 
      />
      
      <EmpresaAseguradoraImport 
        apiBaseUrl={apiBaseUrl} 
        onImportComplete={handleEmpresaAseguradoraSaved} 
      />
      
      <EmpresaAseguradoraList
        empresas={empresas} 
        onEditEmpresaAseguradora={setEditingEmpresaAseguradora} 
        onDeleteEmpresaAseguradora={handleEmpresaAseguradoraDelete}
        currentPage={empresaAseguradoraCurrentPage} 
        itemsPerPage={itemsPerPage} 
        totalItems={totalEmpresasAseguradoras}
        onPageChange={handleEmpresaAseguradoraPageChange} 
        searchTerm={empresaAseguradoraSearchTerm} 
        setSearchTerm={setEmpresaAseguradoraSearchTerm}
        onSearch={handleEmpresaAseguradoraSearch} 
        onExport={exportToCsv} 
        onExportPdf={exportToPdf} 
        dateFormat={dateFormat} 
        getDateFormatOptions={getDateFormatOptions}
      />
    </div>
  );
}

export default EmpresasAseguradorasPage;