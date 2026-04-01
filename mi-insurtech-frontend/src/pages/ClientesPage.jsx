// src/pages/ClientesPage.jsx
import React from 'react';
import ClientForm from '../components/ClientForm';
import ClienteImport from '../components/ClienteImport';
import ClientList from '../components/ClientList';
import { useTranslation } from 'react-i18next';

function ClientesPage({
  apiBaseUrl,
  clientes,
  editingClient,
  setEditingClient,
  onClientSaved,
  onClientImported,
  handleClientDelete,
  clienteSearchTerm,
  clienteEmailFilter,
  setClienteSearchTerm,
  setClienteEmailFilter,
  handleClienteSearch,
  clienteCurrentPage,
  totalClients,
  handleClientePageChange,
  exportToCsv,
  exportToPdf,
  dateFormat,
  getDateFormatOptions,
  itemsPerPage
}) {
  // 🚀 Encendemos el motor de idiomas para esta pantalla
  const { t } = useTranslation();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        {/* CRISTAL: El título ahora muta de idioma automáticamente */}
        <h2 className="text-2xl font-black text-white tracking-tight drop-shadow-md">
          {t('clientes.pageTitle')}
        </h2>
      </div>
      
      <ClientForm 
        apiBaseUrl={apiBaseUrl} 
        editingClient={editingClient} 
        setEditingClient={setEditingClient} 
        onClientSaved={onClientSaved} 
      />
      
      <ClienteImport 
        apiBaseUrl={apiBaseUrl} 
        onImportComplete={onClientImported} 
      />
      
      <ClientList
        clients={clientes} 
        onEditClient={setEditingClient} 
        onDeleteClient={handleClientDelete}
        searchTerm={clienteSearchTerm} 
        emailFilter={clienteEmailFilter}
        setSearchTerm={setClienteSearchTerm} 
        setEmailFilter={setClienteEmailFilter}
        onSearch={handleClienteSearch} 
        currentPage={clienteCurrentPage} 
        itemsPerPage={itemsPerPage}
        totalItems={totalClients} 
        onPageChange={handleClientePageChange}
        onExport={exportToCsv} 
        onExportPdf={exportToPdf} 
        dateFormat={dateFormat} 
        getDateFormatOptions={getDateFormatOptions}
      />
    </div>
  );
}

export default ClientesPage;