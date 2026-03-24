// src/utils/fetchWrapper.js

/**
 * Envoltorio centralizado para peticiones a la API.
 * Maneja automáticamente la inyección del Token, los errores HTTP y la expiración de sesión (401).
 */
const fetchWrapper = async (url, options = {}) => {
  const token = localStorage.getItem('access_token');
  
  // 1. Validar que exista el token antes de disparar a la red
  if (!token) {
    throw new Error("No_Token"); // Código interno para manejarlo en los hooks
  }

  // 2. Ejecutar la petición con los headers unificados
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      'Authorization': `Bearer ${token}`
    },
  });

  // 3. Interceptar y manejar errores HTTP
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Token_Expirado"); 
    }
    
    // Intentar extraer el mensaje de error del backend (FastAPI arroja "detail")
    let errorMessage = `Error HTTP: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch (e) {
      // Si la respuesta no es JSON, se queda con el error genérico
    }
    
    throw new Error(errorMessage);
  }

  // 4. Si todo sale bien, devolver los datos limpios
  // Si es un DELETE (204 No Content), no intentamos parsear JSON
  if (response.status === 204) {
    return true; 
  }

  return response.json();
};

export default fetchWrapper;