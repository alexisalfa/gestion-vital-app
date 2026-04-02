// src/config/tenantConfig.js

export const TENANTS = {
  // 🛡️ 1. EL NODO DE SEGUROS (El original)
  seguros: {
    id: 'seguros',
    name: 'Nexus Insurance',
    slogan: 'Gestión de carteras, pólizas y comisiones.',
    colors: {
      text: 'text-cyan-400',
      bgHover: 'hover:bg-cyan-500/20',
      border: 'border-cyan-500/20',
      button: 'bg-cyan-600 hover:bg-cyan-500',
      shadow: 'shadow-[0_0_15px_rgba(34,211,238,0.2)]'
    },
    modules: ['clientes', 'polizas', 'reclamaciones', 'comisiones', 'asesores', 'empresas']
  },

  // 🏥 2. EL NODO MÉDICO (Clínicas y Salud)
  medica: {
    id: 'medica',
    name: 'Nexus Medical',
    slogan: 'Control de pacientes, citas y liquidaciones.',
    colors: {
      text: 'text-emerald-400',
      bgHover: 'hover:bg-emerald-500/20',
      border: 'border-emerald-500/20',
      button: 'bg-emerald-600 hover:bg-emerald-500',
      shadow: 'shadow-[0_0_15px_rgba(16,185,129,0.2)]'
    },
    modules: ['pacientes', 'citas', 'doctores', 'facturacion', 'historial']
  },

  // 🏢 3. EL NODO INMOBILIARIO (PropTech)
  inmuebles: {
    id: 'inmuebles',
    name: 'Nexus Realty',
    slogan: 'Administración de propiedades, contratos y cobranzas.',
    colors: {
      text: 'text-amber-400',
      bgHover: 'hover:bg-amber-500/20',
      border: 'border-amber-500/20',
      button: 'bg-amber-600 hover:bg-amber-500',
      shadow: 'shadow-[0_0_15px_rgba(245,158,11,0.2)]'
    },
    modules: ['propiedades', 'inquilinos', 'contratos', 'pagos', 'mantenimiento']
  }
};

// 🧠 EL DETECTOR DE ENTORNO
export const getTenantConfig = () => {
  // 1. Obtenemos la URL actual en la que está navegando el usuario
  const hostname = window.location.hostname;
  
  // 2. Buscamos palabras clave en el dominio real
  if (hostname.includes('seguros.vital.nexus')) return TENANTS.seguros;
  if (hostname.includes('medica.vital.nexus')) return TENANTS.medica;
  if (hostname.includes('inmuebles.vital.nexus')) return TENANTS.inmuebles;

  // 3. 🚀 TRUCO DE INGENIERO PARA PRUEBAS LOCALES EN SU PC
  // Si estamos en localhost, podemos simular el entorno leyendo la URL así: localhost:5173/?tenant=medica
  const params = new URLSearchParams(window.location.search);
  const tenantParam = params.get('tenant');
  
  if (tenantParam && TENANTS[tenantParam]) {
    return TENANTS[tenantParam];
  }

  // 4. Si no detecta nada (ej. entra por vital.nexus base), carga Seguros por defecto
  return TENANTS.seguros; 
};