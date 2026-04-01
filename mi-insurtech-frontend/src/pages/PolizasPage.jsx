// src/pages/PolizasPage.jsx
import React from 'react';
import PolizaForm from '../components/PolizaForm';
import PolizaImport from '../components/PolizaImport';
import PolizaList from '../components/PolizaList';
import { useTranslation } from 'react-i18next';

function PolizasPage({
  apiBaseUrl,
  polizas,
  editingPoliza,
  setEditingPoliza,
  handlePolizaSaved,
  handlePolizaDelete,
  polizaSearchTerm,
  polizaTipoFilter,
  polizaEstadoFilter,
  polizaClienteIdFilter,
  polizaFechaInicioFilter,
  polizaFechaFinFilter,
  setPolizaSearchTerm,
  setPolizaTipoFilter,
  setPolizaEstadoFilter,
  setPolizaClienteIdFilter,
  setPolizaFechaInicioFilter,
  setPolizaFechaFinFilter,
  handlePolizaSearch,
  polizaCurrentPage,
  handlePolizaPageChange,
  itemsPerPage,
  totalPolizas,
  exportToCsv,
  exportToPdf,
  clientes,
  empresasAseguradoras,
  asesores,
  isLoadingClients,
  isLoadingCompanies,
  isLoadingAdvisors,
  currencySymbol,
  dateFormat,
  getDateFormatOptions
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-2xl font-black text-white tracking-tight drop-shadow-md">{t('polizas.pageTitle')}</h2>
      
      <PolizaForm 
        onPolizaSaved={handlePolizaSaved} 
        editingPoliza={editingPoliza} 
        setEditingPoliza={setEditingPoliza} 
        apiBaseUrl={apiBaseUrl} 
        clientes={clientes} 
        empresasAseguradoras={empresasAseguradoras} 
        asesores={asesores} 
        isLoadingClients={isLoadingClients} 
        isLoadingCompanies={isLoadingCompanies} 
        isLoadingAdvisors={isLoadingAdvisors} 
      />
      
      <PolizaImport 
        apiBaseUrl={apiBaseUrl} 
        onImportComplete={handlePolizaSaved} 
      />
      
      <PolizaList
        polizas={polizas} 
        onEditPoliza={setEditingPoliza} 
        onDeletePoliza={handlePolizaDelete}
        searchTerm={polizaSearchTerm} 
        tipoFilter={polizaTipoFilter} 
        estadoFilter={polizaEstadoFilter}
        clienteIdFilter={polizaClienteIdFilter} 
        fechaInicioFilter={polizaFechaInicioFilter} 
        fechaFinFilter={polizaFechaFinFilter}
        setSearchTerm={setPolizaSearchTerm} 
        setTipoFilter={setPolizaTipoFilter} 
        setEstadoFilter={setPolizaEstadoFilter}
        setClienteIdFilter={setPolizaClienteIdFilter} 
        setFechaInicioFilter={setPolizaFechaInicioFilter} 
        setFechaFinFilter={setPolizaFechaFinFilter}
        onSearch={handlePolizaSearch} 
        currentPage={polizaCurrentPage} 
        itemsPerPage={itemsPerPage}
        totalItems={totalPolizas} 
        onPageChange={handlePolizaPageChange} 
        apiBaseUrl={apiBaseUrl}
        onExport={exportToCsv} 
        onExportPdf={exportToPdf} 
        clients={clientes} 
        empresasAseguradoras={empresasAseguradoras}
        currencySymbol={currencySymbol} 
        dateFormat={dateFormat} 
        getDateFormatOptions={getDateFormatOptions}
      />
    </div>
  );
}

export default PolizasPage;