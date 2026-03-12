// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Aquí definimos los "diccionarios" para cada idioma.
// Luego podremos separar esto en archivos .json si crecen mucho.
const resources = {
  es: {
    translation: {
      menu: {
        dashboard: "Dashboard",
        clientes: "Clientes",
        aseguradoras: "Aseguradoras",
        asesores: "Asesores",
        polizas: "Pólizas",
        reclamaciones: "Reclamaciones",
        comisiones: "Comisiones",
        configuracion: "Configuración"
      },
      titulos: {
        gestionClientes: "Gestión de Clientes",
        gestionPolizas: "Gestión de Pólizas"
      },
      comunes: {
        buscar: "Buscar",
        limpiar: "Limpiar",
        guardar: "Guardar",
        cancelar: "Cancelar"
      }
    }
  },
  en: {
    translation: {
      menu: {
        dashboard: "Dashboard",
        clientes: "Clients",
        aseguradoras: "Insurers",
        asesores: "Advisors",
        polizas: "Policies",
        reclamaciones: "Claims",
        comisiones: "Commissions",
        configuracion: "Settings"
      },
      titulos: {
        gestionClientes: "Client Management",
        gestionPolizas: "Policy Management"
      },
      comunes: {
        buscar: "Search",
        limpiar: "Clear",
        guardar: "Save",
        cancelar: "Cancel"
      }
    }
  }
};

i18n
  .use(initReactI18next) // Conecta i18n con React
  .init({
    resources,
    lng: "es", // Idioma de arranque por defecto
    fallbackLng: "en", // Si falta una traducción en español, usa inglés
    interpolation: {
      escapeValue: false // React ya protege contra inyecciones XSS
    }
  });

export default i18n;