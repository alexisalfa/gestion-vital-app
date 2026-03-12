// src/components/Pagination.jsx
import React from 'react';

/**
 * Componente de paginación reutilizable.
 *
 * @param {object} props - Las propiedades del componente.
 * @param {number} props.currentPage - La página actual (basada en 1).
 * @param {number} props.totalPages - El número total de páginas.
 * @param {function} props.onPageChange - Función de callback cuando la página cambia.
 */
function Pagination({ currentPage, totalPages, onPageChange }) {
  // Array para generar los números de página a mostrar
  const pageNumbers = [];
  // Lógica para mostrar un rango limitado de páginas alrededor de la página actual
  const maxPagesToShow = 5; // Cantidad máxima de números de página visibles
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  // Ajustar si la ventana de páginas se extiende más allá del final
  if (endPage - startPage + 1 < maxPagesToShow && totalPages > maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <nav className="flex justify-center items-center space-x-2 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
      >
        Anterior
      </button>

      {/* Botón para la primera página si no está en el rango visible */}
      {startPage > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition duration-200"
          >
            1
          </button>
          {startPage > 2 && <span className="text-gray-600">...</span>}
        </>
      )}

      {/* Números de página */}
      {pageNumbers.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-4 py-2 rounded-md transition duration-200 ${
            page === currentPage
              ? 'bg-blue-600 text-white font-semibold shadow-md'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          {page}
        </button>
      ))}

      {/* Botón para la última página si no está en el rango visible */}
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="text-gray-600">...</span>}
          <button
            onClick={() => onPageChange(totalPages)}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition duration-200"
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || totalPages === 0}
        className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
      >
        Siguiente
      </button>
    </nav>
  );
}

export default Pagination;
