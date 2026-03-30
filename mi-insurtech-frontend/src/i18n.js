// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  // 🇪🇸 ESPAÑOL (Idioma Base)
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
      },
      dashboard: {
        loading: "Cargando...",
        expired: "EXPIRADO",
        licenseActive: "LICENCIA ACTIVA",
        trialLicense: "Licencia de Prueba",
        proLicense: "Licencia Profesional",
        hello: "¡Hola",
        restrictedAccess: "Acceso restringido. Contacte a soporte.",
        timeRemaining: "Tiempo restante para la activación total.",
        serviceStatus: "Estado del Servicio",
        clients: "Clientes",
        policies: "Pólizas",
        policiesProfit: "Pólizas & Ganancia",
        registered: "registradas",
        premiums: "Primas:",
        commission: "Comisión:",
        claims: "Siniestros",
        pendingProcess: "Trámite pendiente",
        operativeNetwork: "Red Operativa",
        advisors: "Asesores",
        insurers: "Aseguradoras",
        companies: "Empresas",
        lossRatio: "Siniestralidad",
        paid: "Pagado:",
        ratioPremiumsClaims: "Ratio Primas vs Siniestros",
        activePremiums: "Primas Activas",
        operativeDistribution: "Distribución Operativa",
        strategicAgenda: "Agenda Estratégica de Renovaciones Próximas (30 Días)",
        noPoliciesExpiring: "No tienes pólizas por vencer en los próximos 30 días. ¡Todo al día!",
        policyContract: "Póliza / Contrato",
        expirationTerm: "Plazo de Vencimiento",
        premiumToRenew: "Prima a Renovar",
        execution: "Ejecución",
        daysRemaining: "Quedan",
        days: "días",
        expiresToday: "VENCE HOY",
        manageWA: "Gestionar WA",
        simulation: "✨ Simulación de lo que esperas",
        waGreeting: "Hola",
        waMessage1: "soy tu asesor de Gestión Vital 🛡️. Me comunico contigo para recordarte que tu póliza Nro:",
        waMessage2: "vence el próximo",
        waMessage3: "¿Deseas que te apoye gestionando la renovación para mantener tu cobertura activa?"
      },
      dashboardCharts: {
        ceoVision: "Visión de CEO",
        simulation: "✨ Simulación de lo que esperas",
        portfolioHealth: "Salud de la Cartera",
        retentionIndex: "Índice de Retención",
        retentionDesc: "Muestra la proporción de pólizas Activas frente a las Vencidas o Anuladas en tu cartera actual.",
        retentionTip: "¡Tu mina de oro está en las renovaciones! Cuesta 5 veces más conseguir un cliente nuevo que retener a uno actual.",
        topInsurers: "Top 5 Aseguradoras",
        riskConcentration: "Concentración de Riesgo",
        riskDesc: "Identifica cuáles son las 5 compañías de seguros que concentran el mayor volumen de primas.",
        riskTip: "Los líderes diversifican. Usa esta data para exigir mejores comisiones a tu aseguradora principal.",
        lossRatioIndex: "Índice de Siniestralidad",
        lossRatioBalance: "Balance de Loss Ratio",
        lossRatioDesc: "Compara el volumen de siniestros reportados contra el dinero que las aseguradoras han pagado.",
        lossRatioTip: "Un índice controlado demuestra que tus clientes son rentables. ¡Úsalo para exigir bonos de rentabilidad!",
        active: "Activas",
        expired: "Vencidas",
        inactive: "Inactivas",
        other: "Otra",
        policies: "Pólizas",
        casesNumber: "N° de Casos",
        amountPaid: "Monto Pagado"
      }
    }
  },

  // 🇺🇸 INGLÉS
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
      },
      dashboard: {
        loading: "Loading...",
        expired: "EXPIRED",
        licenseActive: "ACTIVE LICENSE",
        trialLicense: "Trial License",
        proLicense: "Professional License",
        hello: "Hello",
        restrictedAccess: "Restricted access. Contact support.",
        timeRemaining: "Time remaining for full activation.",
        serviceStatus: "Service Status",
        clients: "Clients",
        policies: "Policies",
        policiesProfit: "Policies & Profit",
        registered: "registered",
        premiums: "Premiums:",
        commission: "Commission:",
        claims: "Claims",
        pendingProcess: "Pending process",
        operativeNetwork: "Operative Network",
        advisors: "Advisors",
        insurers: "Insurers",
        companies: "Companies",
        lossRatio: "Loss Ratio",
        paid: "Paid:",
        ratioPremiumsClaims: "Premiums vs Claims Ratio",
        activePremiums: "Active Premiums",
        operativeDistribution: "Operative Distribution",
        strategicAgenda: "Strategic Agenda for Upcoming Renewals (30 Days)",
        noPoliciesExpiring: "You have no policies expiring in the next 30 days. All up to date!",
        policyContract: "Policy / Contract",
        expirationTerm: "Expiration Term",
        premiumToRenew: "Premium to Renew",
        execution: "Execution",
        daysRemaining: "Remaining",
        days: "days",
        expiresToday: "EXPIRES TODAY",
        manageWA: "Manage WA",
        simulation: "✨ Simulation of what to expect",
        waGreeting: "Hello",
        waMessage1: "I am your Gestión Vital advisor 🛡️. I am contacting you to remind you that your policy No:",
        waMessage2: "expires next",
        waMessage3: "Would you like me to help you manage the renewal to keep your coverage active?"
      },
      dashboardCharts: {
        ceoVision: "CEO Vision",
        simulation: "✨ Simulation of what to expect",
        portfolioHealth: "Portfolio Health",
        retentionIndex: "Retention Index",
        retentionDesc: "Shows the proportion of Active policies versus Expired or Cancelled ones in your current portfolio.",
        retentionTip: "Your gold mine is in renewals! It costs 5 times more to get a new client than to retain a current one.",
        topInsurers: "Top 5 Insurers",
        riskConcentration: "Risk Concentration",
        riskDesc: "Identifies which 5 insurance companies concentrate the highest volume of premiums.",
        riskTip: "Leaders diversify. Use this data to demand better commissions from your main insurer.",
        lossRatioIndex: "Loss Ratio Index",
        lossRatioBalance: "Loss Ratio Balance",
        lossRatioDesc: "Compares the volume of reported claims against the money insurers have paid out.",
        lossRatioTip: "A controlled index proves your clients are profitable. Use it to demand profitability bonuses!",
        active: "Active",
        expired: "Expired",
        inactive: "Inactive",
        other: "Other",
        policies: "Policies",
        casesNumber: "Number of Cases",
        amountPaid: "Amount Paid"
      }
    }
  },

  // 🇩🇪 ALEMÁN
  de: {
    translation: {
      menu: {
        dashboard: "Dashboard",
        clientes: "Kunden",
        aseguradoras: "Versicherer",
        asesores: "Berater",
        polizas: "Policen",
        reclamaciones: "Schadensfälle",
        comisiones: "Provisionen",
        configuracion: "Einstellungen"
      },
      titulos: {
        gestionClientes: "Kundenverwaltung",
        gestionPolizas: "Policenverwaltung"
      },
      comunes: {
        buscar: "Suchen",
        limpiar: "Leeren",
        guardar: "Speichern",
        cancelar: "Abbrechen"
      },
      auth: {
        welcome: "Willkommen zurück",
        createAccount: "Konto erstellen",
        subtitleLogin: "Geben Sie Ihre Anmeldedaten ein, um auf Ihren Tresor zuzugreifen.",
        subtitleRegister: "Beginnen Sie noch heute mit der Verwaltung Ihrer Agentur.",
        orEmail: "Oder melden Sie sich mit Ihrer E-Mail an",
        alreadyAccount: "Haben Sie bereits ein Konto?",
        noAccount: "Haben Sie noch kein Konto?",
        loginHere: "Hier anmelden",
        registerNow: "Jetzt registrieren",
        slogan: "Das kugelsichere Insurtech-Ökosystem, um Ihre Agentur zu automatisieren, Ihr Portfolio zu schützen und Ihre Provisionen zu vervielfachen."
      },
      dashboard: {
        loading: "Wird geladen...",
        expired: "ABGELAUFEN",
        licenseActive: "LIZENZ AKTIV",
        trialLicense: "Testlizenz",
        proLicense: "Professionelle Lizenz",
        hello: "Hallo",
        restrictedAccess: "Eingeschränkter Zugriff. Support kontaktieren.",
        timeRemaining: "Verbleibende Zeit bis zur vollständigen Aktivierung.",
        serviceStatus: "Servicestatus",
        clients: "Kunden",
        policies: "Policen",
        policiesProfit: "Policen & Gewinn",
        registered: "registriert",
        premiums: "Prämien:",
        commission: "Provision:",
        claims: "Schäden",
        pendingProcess: "Ausstehende Bearbeitung",
        operativeNetwork: "Operatives Netzwerk",
        advisors: "Berater",
        insurers: "Versicherer",
        companies: "Unternehmen",
        lossRatio: "Schadenquote",
        paid: "Bezahlt:",
        ratioPremiumsClaims: "Verhältnis Prämien vs. Schäden",
        activePremiums: "Aktive Prämien",
        operativeDistribution: "Operative Verteilung",
        strategicAgenda: "Strategische Agenda für anstehende Verlängerungen (30 Tage)",
        noPoliciesExpiring: "Sie haben keine Policen, die in den nächsten 30 Tagen ablaufen. Alles auf dem neuesten Stand!",
        policyContract: "Police / Vertrag",
        expirationTerm: "Ablauffrist",
        premiumToRenew: "Zu erneuernde Prämie",
        execution: "Ausführung",
        daysRemaining: "Verbleibende",
        days: "Tage",
        expiresToday: "LÄUFT HEUTE AB",
        manageWA: "WA verwalten",
        simulation: "✨ Simulation Ihrer Erwartungen",
        waGreeting: "Hallo",
        waMessage1: "Ich bin Ihr Gestión Vital Berater 🛡️. Ich kontaktiere Sie, um Sie daran zu erinnern, dass Ihre Police Nr:",
        waMessage2: "am kommenden",
        waMessage3: "Möchten Sie, dass ich Sie bei der Verwaltung der Verlängerung unterstütze, um Ihre Deckung aktiv zu halten?"
      },
      dashboardCharts: {
        ceoVision: "CEO-Vision",
        simulation: "✨ Simulation Ihrer Erwartungen",
        portfolioHealth: "Portfolio-Gesundheit",
        retentionIndex: "Kundenbindungsindex",
        retentionDesc: "Zeigt das Verhältnis von aktiven zu abgelaufenen oder stornierten Policen in Ihrem aktuellen Portfolio.",
        retentionTip: "Ihre Goldmine liegt in den Verlängerungen! Einen neuen Kunden zu gewinnen kostet 5-mal mehr, als einen bestehenden zu halten.",
        topInsurers: "Top 5 Versicherer",
        riskConcentration: "Risikokonzentration",
        riskDesc: "Identifiziert die 5 Versicherungsunternehmen mit dem höchsten Prämienvolumen.",
        riskTip: "Führungskräfte diversifizieren. Nutzen Sie diese Daten, um bessere Provisionen von Ihrem Hauptversicherer zu fordern.",
        lossRatioIndex: "Schadenquotenindex",
        lossRatioBalance: "Schadenquoten-Bilanz",
        lossRatioDesc: "Vergleicht das Volumen der gemeldeten Schäden mit dem Geld, das die Versicherer ausgezahlt haben.",
        lossRatioTip: "Ein kontrollierter Index beweist, dass Ihre Kunden profitabel sind. Nutzen Sie dies, um Rentabilitätsboni zu fordern!",
        active: "Aktiv",
        expired: "Abgelaufen",
        inactive: "Inaktiv",
        other: "Andere",
        policies: "Policen",
        casesNumber: "Anzahl der Fälle",
        amountPaid: "Gezahlter Betrag"
      }
    }
  },

  // 🇫🇷 FRANCÉS
  fr: {
    translation: {
      menu: {
        dashboard: "Tableau de Bord",
        clientes: "Clients",
        aseguradoras: "Assureurs",
        asesores: "Conseillers",
        polizas: "Polices",
        reclamaciones: "Réclamations",
        comisiones: "Commissions",
        configuracion: "Paramètres"
      },
      titulos: {
        gestionClientes: "Gestion des Clients",
        gestionPolizas: "Gestion des Polices"
      },
      comunes: {
        buscar: "Rechercher",
        limpiar: "Effacer",
        guardar: "Enregistrer",
        cancelar: "Annuler"
      },
      auth: {
        welcome: "Bon retour",
        createAccount: "Créer un compte",
        subtitleLogin: "Entrez vos identifiants pour accéder à votre coffre-fort.",
        subtitleRegister: "Commencez à gérer votre agence dès aujourd'hui.",
        orEmail: "Ou connectez-vous avec votre e-mail",
        alreadyAccount: "Vous avez déjà un compte ?",
        noAccount: "Vous n'avez pas de compte ?",
        loginHere: "Connectez-vous ici",
        registerNow: "Inscrivez-vous maintenant",
        slogan: "L'écosystème Insurtech blindé pour automatiser votre agence, protéger votre portefeuille et multiplier vos commissions."
      },
      dashboard: {
        loading: "Chargement...",
        expired: "EXPIRÉ",
        licenseActive: "LICENCE ACTIVE",
        trialLicense: "Licence d'Essai",
        proLicense: "Licence Professionnelle",
        hello: "Bonjour",
        restrictedAccess: "Accès restreint. Contacter le support.",
        timeRemaining: "Temps restant pour l'activation totale.",
        serviceStatus: "État du Service",
        clients: "Clients",
        policies: "Polices",
        policiesProfit: "Polices & Bénéfices",
        registered: "enregistrées",
        premiums: "Primes :",
        commission: "Commission :",
        claims: "Sinistres",
        pendingProcess: "En attente de traitement",
        operativeNetwork: "Réseau Opérationnel",
        advisors: "Conseillers",
        insurers: "Assureurs",
        companies: "Entreprises",
        lossRatio: "Sinistralité",
        paid: "Payé :",
        ratioPremiumsClaims: "Ratio Primes vs Sinistres",
        activePremiums: "Primes Actives",
        operativeDistribution: "Distribution Opérationnelle",
        strategicAgenda: "Agenda Stratégique des Prochains Renouvellements (30 Jours)",
        noPoliciesExpiring: "Vous n'avez aucune police expirant dans les 30 prochains jours. Tout est à jour !",
        policyContract: "Police / Contrat",
        expirationTerm: "Délai d'Expiration",
        premiumToRenew: "Prime à Renouveler",
        execution: "Exécution",
        daysRemaining: "Il reste",
        days: "jours",
        expiresToday: "EXPIRE AUJOURD'HUI",
        manageWA: "Gérer WA",
        simulation: "✨ Simulation de ce à quoi vous vous attendez",
        waGreeting: "Bonjour",
        waMessage1: "Je suis votre conseiller Gestión Vital 🛡️. Je vous contacte pour vous rappeler que votre police N° :",
        waMessage2: "expire le",
        waMessage3: "Souhaitez-vous que je vous aide à gérer le renouvellement pour maintenir votre couverture active ?"
      },
      dashboardCharts: {
        ceoVision: "Vision du PDG",
        simulation: "✨ Simulation de ce à quoi vous vous attendez",
        portfolioHealth: "Santé du Portefeuille",
        retentionIndex: "Indice de Rétention",
        retentionDesc: "Affiche la proportion de polices actives par rapport aux polices expirées ou annulées dans votre portefeuille actuel.",
        retentionTip: "Votre mine d'or réside dans les renouvellements ! Obtenir un nouveau client coûte 5 fois plus cher que de fidéliser un client actuel.",
        topInsurers: "Top 5 des Assureurs",
        riskConcentration: "Concentration des Risques",
        riskDesc: "Identifie les 5 compagnies d'assurance qui concentrent le plus grand volume de primes.",
        riskTip: "Les leaders diversifient. Utilisez ces données pour exiger de meilleures commissions de votre assureur principal.",
        lossRatioIndex: "Indice de Sinistralité",
        lossRatioBalance: "Bilan du Ratio de Sinistralité",
        lossRatioDesc: "Compare le volume des sinistres signalés à l'argent que les assureurs ont payé.",
        lossRatioTip: "Un indice contrôlé prouve que vos clients sont rentables. Utilisez-le pour exiger des bonus de rentabilité !",
        active: "Actives",
        expired: "Expirées",
        inactive: "Inactives",
        other: "Autre",
        policies: "Polices",
        casesNumber: "Nombre de Cas",
        amountPaid: "Montant Payé"
      }
    }
  },
  
  // 🇨🇳 CHINO MANDARÍN
  zh: {
    translation: {
      menu: {
        dashboard: "仪表板",
        clientes: "客户",
        aseguradoras: "保险公司",
        asesores: "顾问",
        polizas: "保单",
        reclamaciones: "理赔",
        comisiones: "佣金",
        configuracion: "设置"
      },
      titulos: {
        gestionClientes: "客户管理",
        gestionPolizas: "保单管理"
      },
      comunes: {
        buscar: "搜索",
        limpiar: "清除",
        guardar: "保存",
        cancelar: "取消"
      },
      auth: {
        welcome: "欢迎回来",
        createAccount: "创建您的账户",
        subtitleLogin: "输入您的凭据以访问您的保险库。",
        subtitleRegister: "今天就开始管理您的机构。",
        orEmail: "或使用您的电子邮件登录",
        alreadyAccount: "已经有账户了？",
        noAccount: "还没有账户？",
        loginHere: "在此登录",
        registerNow: "立即注册",
        slogan: "无懈可击的保险科技生态系统，自动化您的机构，保护您的投资组合，并使您的佣金倍增。"
      },
      dashboard: {
        loading: "加载中...",
        expired: "已过期",
        licenseActive: "许可证有效",
        trialLicense: "试用许可证",
        proLicense: "专业许可证",
        hello: "你好",
        restrictedAccess: "访问受限。请联系支持人员。",
        timeRemaining: "完全激活的剩余时间。",
        serviceStatus: "服务状态",
        clients: "客户",
        policies: "保单",
        policiesProfit: "保单与利润",
        registered: "已注册",
        premiums: "保费：",
        commission: "佣金：",
        claims: "理赔",
        pendingProcess: "待处理流程",
        operativeNetwork: "运营网络",
        advisors: "顾问",
        insurers: "保险公司",
        companies: "公司",
        lossRatio: "赔付率",
        paid: "已支付：",
        ratioPremiumsClaims: "保费与理赔比率",
        activePremiums: "有效保费",
        operativeDistribution: "运营分布",
        strategicAgenda: "近期续保战略日程 (30 天)",
        noPoliciesExpiring: "未来 30 天内没有即将到期的保单。一切都是最新的！",
        policyContract: "保单 / 合同",
        expirationTerm: "到期期限",
        premiumToRenew: "续保保费",
        execution: "执行",
        daysRemaining: "剩余",
        days: "天",
        expiresToday: "今日到期",
        manageWA: "管理 WA",
        simulation: "✨ 预期模拟",
        waGreeting: "你好",
        waMessage1: "我是您的 Gestión Vital 顾问 🛡️。我与您联系是为了提醒您，您的保单号：",
        waMessage2: "即将于",
        waMessage3: "到期。您希望我协助您管理续保以保持您的保障有效吗？"
      },
      dashboardCharts: {
        ceoVision: "CEO 愿景",
        simulation: "✨ 预期模拟",
        portfolioHealth: "投资组合健康度",
        retentionIndex: "留存指数",
        retentionDesc: "显示当前投资组合中有效保单与过期或取消保单的比例。",
        retentionTip: "您的金矿在于续保！获取新客户的成本是留住现有客户的 5 倍。",
        topInsurers: "前 5 名保险公司",
        riskConcentration: "风险集中度",
        riskDesc: "确定集中了最大保费金额的 5 家保险公司。",
        riskTip: "领导者懂得分散风险。利用这些数据要求您的主要保险公司提供更好的佣金。",
        lossRatioIndex: "赔付率指数",
        lossRatioBalance: "赔付率平衡",
        lossRatioDesc: "比较已报案理赔数量与保险公司已支付金额。",
        lossRatioTip: "受控的指数证明您的客户是盈利的。用它来要求盈利奖金！",
        active: "有效",
        expired: "已过期",
        inactive: "未激活",
        other: "其他",
        policies: "保单",
        casesNumber: "案件数量",
        amountPaid: "已付金额"
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "es", // Idioma por defecto
    fallbackLng: "en", 
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;