// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

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
      },
      // 🌍 NUEVO: Textos de la pantalla de Autenticación
      auth: {
        welcome: "Bienvenido de nuevo",
        createAccount: "Crea tu Cuenta",
        subtitleLogin: "Ingresa tus credenciales para acceder a tu bóveda.",
        subtitleRegister: "Comienza a gestionar tu agencia hoy mismo.",
        orEmail: "O ingresa con tu correo",
        alreadyAccount: "¿Ya tienes una cuenta?",
        noAccount: "¿No tienes una cuenta?",
        loginHere: "Inicia Sesión aquí",
        registerNow: "Regístrate ahora",
        slogan: "El ecosistema Insurtech blindado para automatizar tu agencia, proteger tu cartera y multiplicar tus comisiones."
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
      },
      // 🌍 NUEVO: Textos de la pantalla de Autenticación (Inglés)
      auth: {
        welcome: "Welcome back",
        createAccount: "Create your Account",
        subtitleLogin: "Enter your credentials to access your vault.",
        subtitleRegister: "Start managing your agency today.",
        orEmail: "Or log in with your email",
        alreadyAccount: "Already have an account?",
        noAccount: "Don't have an account?",
        loginHere: "Log in here",
        registerNow: "Register now",
        slogan: "The bulletproof Insurtech ecosystem to automate your agency, protect your portfolio, and multiply your commissions."
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "es", 
    fallbackLng: "en", 
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;