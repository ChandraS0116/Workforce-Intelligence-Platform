import re
import json

# Master dictionary of 100% complete translations for all problematic and new terms
master_translations = {
    "% CONF": {
        "Telugu": "% నమ్మకం",
        "Arabic": "% ثقة",
        "German": "% KONF",
        "French": "% CONF"
    },
    "30 Days": {
        "Telugu": "30 రోజులు",
        "Arabic": "30 يومًا",
        "German": "30 Tage",
        "French": "30 jours"
    },
    "90 Days": {
        "Telugu": "90 రోజులు",
        "Arabic": "90 يومًا",
        "German": "90 Tage",
        "French": "90 jours"
    },
    "180 Days": {
        "Telugu": "180 రోజులు",
        "Arabic": "180 يومًا",
        "German": "180 Tage",
        "French": "180 jours"
    },
    "365 Days": {
        "Telugu": "365 రోజులు",
        "Arabic": "365 يومًا",
        "German": "365 Tage",
        "French": "365 jours"
    },
    "3D Org Network": {
        "Telugu": "3D ఆర్గ్ నెట్‌వర్క్",
        "Arabic": "شبكة المنظمة ثلاثية الأبعاد",
        "German": "3D-Organisationsnetzwerk",
        "French": "Réseau organisationnel 3D"
    },
    "AI Insight": {
        "Telugu": "AI అంతర్దృష్టి",
        "Arabic": "رؤية الذكاء الاصطناعي",
        "German": "KI-Erkenntnis",
        "French": "Aperçu IA"
    },
    "AI Resolution Engine": {
        "Telugu": "AI పరిష్కార ఇంజిన్",
        "Arabic": "محرك حلول الذكاء الاصطناعي",
        "German": "KI-Lösungsengine",
        "French": "Moteur de résolution IA"
    },
    "AI Schedule Optimizer": {
        "Telugu": "AI షెడ్యూల్ ఆప్టిమైజర్",
        "Arabic": "محسن الجداول بالذكاء الاصطناعي",
        "German": "KI-Zeitplanoptimierer",
        "French": "Optimisateur de planning IA"
    },
    "Add Employee": {
        "Telugu": "ఉద్యోగిని జోడించండి",
        "Arabic": "إضافة موظف",
        "German": "Mitarbeiter hinzufügen",
        "French": "Ajouter un employé"
    },
    "Analyzing network chemistry...": {
        "Telugu": "నెట్‌వర్క్ కెమిస్ట్రీని విశ్లేషిస్తోంది...",
        "Arabic": "جاري تحليل كيمياء الشبكة...",
        "German": "Netzwerkchemie wird analysiert...",
        "French": "Analyse de la chimie du réseau..."
    },
    "Arctic Intelligence": {
        "Telugu": "ఆర్క్టిక్ ఇంటెలిజెన్స్",
        "Arabic": "ذكاء القطب الشمالي",
        "German": "Arktische Intelligenz",
        "French": "Intelligence Arctique"
    },
    "Aurora Operations": {
        "Telugu": "అరోరా ఆపరేషన్స్",
        "Arabic": "عمليات الشفق",
        "German": "Aurora-Operationen",
        "French": "Opérations Aurora"
    },
    "Betweenness Centrality": {
        "Telugu": "మధ్యస్థ కేంద్రీయత",
        "Arabic": "مركزية البينية",
        "German": "Betweenness-Zentralität",
        "French": "Centralité d'intermédiarité"
    },
    "Budget Fit": {
        "Telugu": "బడ్జెట్ అనుకూలత",
        "Arabic": "ملاءمة الميزانية",
        "German": "Budgetanpassung",
        "French": "Compatibilité budgétaire"
    },
    "Build (Train)": {
        "Telugu": "నిర్మించండి (శిక్షణ)",
        "Arabic": "بناء (تدريب)",
        "German": "Aufbau (Training)",
        "French": "Construire (Former)"
    },
    "Burnout Risk": {
        "Telugu": "బలహీనపడే ప్రమాదం",
        "Arabic": "خطر الإرهاق",
        "German": "Burnout-Risiko",
        "French": "Risque d'épuisement"
    },
    "Cancel": {
        "Telugu": "రద్దు చేయండి",
        "Arabic": "إلغاء",
        "German": "Abbrechen",
        "French": "Annuler"
    },
    "Centrality ($C_B$)": {
        "Telugu": "కేంద్రీయత ($C_B$)",
        "Arabic": "المركزية ($C_B$)",
        "German": "Zentralität ($C_B$)",
        "French": "Centralité ($C_B$)"
    },
    "Certifications": {
        "Telugu": "ధృవపత్రాలు",
        "Arabic": "الشهادات",
        "German": "Zertifizierungen",
        "French": "Certifications"
    },
    "Compa-Ratio (CR)": {
        "Telugu": "కెంపా-నిష్పత్తి (CR)",
        "Arabic": "نسبة المقارنة (CR)",
        "German": "Compa-Ratio (CR)",
        "French": "Ratio Compa (CR)"
    },
    "Compensation Risk": {
        "Telugu": "పరిహార నష్టభయం",
        "Arabic": "مخاطر التعويضات",
        "German": "Vergütungsrisiko",
        "French": "Risque lié à la rémunération"
    },
    "Create New Password": {
        "Telugu": "కొత్త పాస్‌వర్డ్ సృష్టించండి",
        "Arabic": "إنشاء كلمة مرور جديدة",
        "German": "Neues Passwort erstellen",
        "French": "Créer un nouveau mot de passe"
    },
    "Crimson Carbon": {
        "Telugu": "క్రిమ్సన్ కార్బన్",
        "Arabic": "الكربون القرمزي",
        "German": "Karmesinroter Kohlenstoff",
        "French": "Carbone Cramoisi"
    },
    "Cyber Operations": {
        "Telugu": "సైబర్ ఆపరేషన్స్",
        "Arabic": "العمليات السيبرانية",
        "German": "Cyber-Operationen",
        "French": "Opérations Cyber"
    },
    "Cyberpunk Edge": {
        "Telugu": "సైబర్‌పంక్ ఎడ్జ్",
        "Arabic": "حافة السايبربانك",
        "German": "Cyberpunk-Kante",
        "French": "Bord Cyberpunk"
    },
    "Data Integrity Score": {
        "Telugu": "డేటా సమగ్రత స్కోరు",
        "Arabic": "نتيجة سلامة البيانات",
        "German": "Datenintegritätsbewertung",
        "French": "Score d'intégrité des données"
    },
    "Data Quality Center": {
        "Telugu": "డేటా నాణ్యత కేంద్రం",
        "Arabic": "مركز جودة البيانات",
        "German": "Datenqualitätszentrum",
        "French": "Centre de qualité des données"
    },
    "Data Quality Engine": {
        "Telugu": "డేటా నాణ్యత ఇంజిన్",
        "Arabic": "محرك جودة البيانات",
        "German": "Datenqualitätsengine",
        "French": "Moteur de qualité des données"
    },
    "Delivery Email": {
        "Telugu": "డెలివరీ ఇమెయిల్",
        "Arabic": "بريد التسليم الإلكتروني",
        "German": "Zustell-E-Mail",
        "French": "E-mail de livraison"
    },
    "Department ID": {
        "Telugu": "డిపార్ట్‌మెంట్ ID",
        "Arabic": "معرف القسم",
        "German": "Abteilungs-ID",
        "French": "ID de département"
    },
    "Desert Intelligence": {
        "Telugu": "డెసర్ట్ ఇంటెలిజెన్స్",
        "Arabic": "ذكاء الصحراء",
        "German": "Wüsten-Intelligenz",
        "French": "Intelligence du désert"
    },
    "Design": {
        "Telugu": "డిజైన్",
        "Arabic": "تصميم",
        "German": "Design",
        "French": "Conception"
    },
    "Details": {
        "Telugu": "వివరాలు",
        "Arabic": "التفاصيل",
        "German": "Details",
        "French": "Détails"
    },
    "Division": {
        "Telugu": "విభాగం",
        "Arabic": "قسم",
        "German": "Abteilung",
        "French": "Division"
    },
    "Employee Directory": {
        "Telugu": "ఉద్యోగుల డైరెక్టరీ",
        "Arabic": "دليل الموظفين",
        "German": "Mitarbeiterverzeichnis",
        "French": "Annuaire des employés"
    },
    "Employees": {
        "Telugu": "ఉద్యోగులు",
        "Arabic": "الموظفون",
        "German": "Mitarbeiter",
        "French": "Employés"
    },
    "Engineering": {
        "Telugu": "ఇంజనీరింగ్",
        "Arabic": "الهندسة",
        "German": "Ingenieurwesen",
        "French": "Ingénierie"
    },
    "Enter your new password below.": {
        "Telugu": "క్రింద మీ కొత్త పాస్‌వర్డ్‌ను నమోదు చేయండి.",
        "Arabic": "أدخل كلمة المرور الجديدة أدناه.",
        "German": "Geben Sie unten Ihr neues Passwort ein.",
        "French": "Entrez votre nouveau mot de passe ci-dessous."
    },
    "Executive Command": {
        "Telugu": "ఎగ్జిక్యూటివ్ కమాండ్",
        "Arabic": "القيادة التنفيذية",
        "German": "Führungskommando",
        "French": "Commande exécutive"
    },
    "Executive Command Center": {
        "Telugu": "ఎగ్జిక్యూటివ్ కమాండ్ సెంటర్",
        "Arabic": "مركز القيادة التنفيذية",
        "German": "Führungs-Kommandozentrale",
        "French": "Centre de commande exécutif"
    },
    "Executive Dashboard": {
        "Telugu": "ఎగ్జిక్యూటివ్ డ్యాష్‌బోర్డ్",
        "Arabic": "لوحة القيادة التنفيذية",
        "German": "Führungs-Dashboard",
        "French": "Tableau de bord exécutif"
    },
    "Executive Overview & Risk Aggregation": {
        "Telugu": "ఎగ్జిక్యూటివ్ అవలోకనం & రిస్క్ అగ్రిగేషన్",
        "Arabic": "نظرة عامة تنفيذية وتجميع المخاطر",
        "German": "Führungsübersicht & Risikoaggregation",
        "French": "Aperçu exécutif & Agrégation des risques"
    },
    "Executive Readiness": {
        "Telugu": "ఎగ్జిక్యూటివ్ సంసిద్ధత",
        "Arabic": "الجاهزية التنفيذية",
        "German": "Führungsbereitschaft",
        "French": "Préparation exécutive"
    },
    "Executive Readiness Index": {
        "Telugu": "ఎగ్జిక్యూటివ్ సంసిద్ధత సూచిక",
        "Arabic": "مؤشر الجاهزية التنفيذية",
        "German": "Führungsbereitschaftsindex",
        "French": "Indice de préparation exécutive"
    },
    "Export Report": {
        "Telugu": "నివేదికను ఎగుమతి చేయండి",
        "Arabic": "تصدير التقرير",
        "German": "Bericht exportieren",
        "French": "Exporter le rapport"
    },
    "FTEs": {
        "Telugu": "పూర్తి సమయ ఉద్యోగులు (FTEs)",
        "Arabic": "موظفون بدوام كامل (FTEs)",
        "German": "Vollzeitäquivalente (FTEs)",
        "French": "Équivalents temps plein (ETP)"
    },
    "Failed to load Executive Intelligence. Please check connection.": {
        "Telugu": "ఎగ్జిక్యూటివ్ ఇంటెలిజెన్స్ లోడ్ చేయడంలో విఫలమైంది. దయచేసి కనెక్షన్‌ని తనిఖీ చేయండి.",
        "Arabic": "فشل تحميل الذكاء التنفيذي. يرجى التحقق من الاتصال.",
        "German": "Führungsintelligenz konnte nicht geladen werden. Bitte Verbindung prüfen.",
        "French": "Échec du chargement de l'intelligence exécutive. Veuillez vérifier la connexion."
    },
    "Forest Operations": {
        "Telugu": "ఫారెస్ట్ ఆపరేషన్స్",
        "Arabic": "عمليات الغابات",
        "German": "Waldoperationen",
        "French": "Opérations forestières"
    },
    "Global Talent Heatmap": {
        "Telugu": "గ్లోబల్ టాలెంట్ హీట్‌మ్యాప్",
        "Arabic": "خريطة المواهب العالمية الحرارية",
        "German": "Globale Talent-Heatmap",
        "French": "Carte thermique mondiale des talents"
    },
    "Graphite Analytics": {
        "Telugu": "గ్రాఫైట్ అనలిటిక్స్",
        "Arabic": "تحليلات الجرافيت",
        "German": "Graphit-Analytik",
        "French": "Analytique Graphite"
    },
    "Headcount": {
        "Telugu": "ఉద్యోగుల సంఖ్య",
        "Arabic": "إجمالي الموظفين",
        "German": "Mitarbeiterzahl",
        "French": "Effectif"
    },
    "Health Score": {
        "Telugu": "ఆరోగ్య స్కోరు",
        "Arabic": "نتيجة الصحة",
        "German": "Gesundheitsbewertung",
        "French": "Score de santé"
    },
    "High Priority Task (Cannot be delayed)": {
        "Telugu": "అధిక ప్రాధాన్యత గల పని (వాయిదా వేయలేము)",
        "Arabic": "مهمة ذات أولوية عالية (لا يمكن تأجيلها)",
        "German": "Aufgabe mit hoher Priorität (kann nicht aufgeschoben werden)",
        "French": "Tâche haute priorité (Ne peut être retardée)"
    },
    "High-contrast tactical dashboard with neon accents and particle environments.": {
        "Telugu": "నియాన్ యాక్సెంట్లు మరియు పార్టికల్ ఎన్విరాన్‌మెంట్‌లతో కూడిన హై-కాంట్రాస్ట్ టాక్టికల్ డ్యాష్‌బోర్డ్.",
        "Arabic": "لوحة قيادة تكتيكية عالية التباين مع لمسات نيون وبيئات جزيئية.",
        "German": "Kaktisches Dashboard mit hohem Kontrast, Neon-Akzenten und Partikelumgebungen.",
        "French": "Tableau de bord tactique à contraste élevé avec accents néon et environnements de particules."
    },
    "Intelligence Engine": {
        "Telugu": "ఇంటెలిజెన్స్ ఇంజిన్",
        "Arabic": "محرك الذكاء",
        "German": "Intelligenz-Engine",
        "French": "Moteur d'intelligence"
    },
    "Invalid Link": {
        "Telugu": "చెల్లని లింక్",
        "Arabic": "رابط غير صالح",
        "German": "Ungültiger Link",
        "French": "Lien invalide"
    },
    "Isolation Risks": {
        "Telugu": "ఏకాంత నష్టభయాలు",
        "Arabic": "مخاطر العزلة",
        "German": "Isolationsrisiken",
        "French": "Risques d'isolement"
    },
    "John Doe": {
        "Telugu": "జాన్ డో",
        "Arabic": "فلان الفلاني",
        "German": "Max Mustermann",
        "French": "Jean Dupont"
    },
    "Lavender Platinum": {
        "Telugu": "లావెండర్ ప్లాటినం",
        "Arabic": "بلاتين الخزامى",
        "German": "Lavendel-Platin",
        "French": "Platine Lavande"
    },
    "Location Intelligence": {
        "Telugu": "లోకేషన్ ఇంటెలిజెన్స్",
        "Arabic": "ذكاء الموقع",
        "German": "Standortintelligenz",
        "French": "Intelligence géospatiale"
    },
    "Luxurious, high-contrast premium dashboard with gold accents.": {
        "Telugu": "బంగారు రంగు యాక్సెంట్‌లతో కూడిన విలాసవంతమైన, హై-కాంట్రాస్ట్ ప్రీమియం డ్యాష్‌బోర్డ్.",
        "Arabic": "لوحة قيادة فاخرة عالية التباين مع لمسات ذهبية.",
        "German": "Luxuriöses Premium-Dashboard mit hohem Kontrast und Goldakzenten.",
        "French": "Tableau de bord haut de gamme luxueux et à contraste élevé avec des accents dorés."
    },
    "Manage organizational workforce data.": {
        "Telugu": "సంస్థాగత వర్క్‌ఫోర్స్ డేటాను నిర్వహించండి.",
        "Arabic": "إدارة بيانات القوى العاملة التنظيمية.",
        "German": "Verwalten Sie die Daten der Organisationsmitarbeiter.",
        "French": "Gérer les données des effectifs organisationnels."
    },
    "Matcha Zen": {
        "Telugu": "మచ్చా జెన్",
        "Arabic": "ماتشا زن",
        "German": "Matcha Zen",
        "French": "Zen Matcha"
    },
    "Midnight Velvet": {
        "Telugu": "మిడ్‌నైట్ వెల్వెట్",
        "Arabic": "مخمل منتصف الليل",
        "German": "Mitternachtssamt",
        "French": "Velours de Minuit"
    },
    "Monthly": {
        "Telugu": "నెలవారీ",
        "Arabic": "شهريًا",
        "German": "Monatlich",
        "French": "Mensuel"
    },
    "Monthly Run Rate": {
        "Telugu": "నెలవారీ రన్ రేట్",
        "Arabic": "معدل التشغيل الشهري",
        "German": "Monatliche Laufrate",
        "French": "Taux d'exécution mensuel"
    },
    "Monthly Skill Gap Analysis": {
        "Telugu": "నెలవారీ నైపుణ్య అంతర విశ్లేషణ",
        "Arabic": "تحليل الفجوة في المهارات الشهري",
        "German": "Monatliche Qualifikationslückenanalyse",
        "French": "Analyse mensuelle des écarts de compétences"
    },
    "Name": {
        "Telugu": "పేరు",
        "Arabic": "الاسم",
        "German": "Name",
        "French": "Nom"
    },
    "Neon Synthwave": {
        "Telugu": "నియాన్ సింథ్‌వేవ్",
        "Arabic": "موجة النيون الاصطناعية",
        "German": "Neon-Synthwave",
        "French": "Synthwave Néon"
    },
    "No employees found": {
        "Telugu": "ఉద్యోగులు ఎవరూ కనుగొనబడలేదు",
        "Arabic": "لم يتم العثور على موظفين",
        "German": "Keine Mitarbeiter gefunden",
        "French": "Aucun employé trouvé"
    },
    "Notifications": {
        "Telugu": "నోటిఫికేషన్‌లు",
        "Arabic": "الإشعارات",
        "German": "Benachrichtigungen",
        "French": "Notifications"
    },
    "Obsidian Gold": {
        "Telugu": "అబ్సిడియన్ గోల్డ్",
        "Arabic": "ذهبي حجر السج",
        "German": "Obsidiangold",
        "French": "Or Obsidienne"
    },
    "Ocean Intelligence": {
        "Telugu": "ఓషన్ ఇంటెలిజెన్స్",
        "Arabic": "ذكاء المحيط",
        "German": "Ozean-Intelligenz",
        "French": "Intelligence Océanique"
    },
    "Operational Dashboard": {
        "Telugu": "ఆపరేషనల్ డ్యాష్‌బోర్డ్",
        "Arabic": "لوحة القيادة التشغيلية",
        "German": "Operatives Dashboard",
        "French": "Tableau de bord opérationnel"
    },
    "Platform aggregated score": {
        "Telugu": "ప్లాట్‌ఫారమ్ సగటు స్కోరు",
        "Arabic": "النتيجة المجمعة للمنصة",
        "German": "Aggregierte Plattformbewertung",
        "French": "Score global de la plateforme"
    },
    "Portfolio Command Center": {
        "Telugu": "పోర్ట్‌ఫోలియో కమాండ్ సెంటర్",
        "Arabic": "مركز قيادة المحافظ",
        "German": "Portfolio-Kommandozentrale",
        "French": "Centre de commande de portefeuille"
    },
    "Premium, calm, corporate dashboard optimized for C-suite presentations.": {
        "Telugu": "C-సూట్ ప్రదర్శనల కోసం ఆప్టిమైజ్ చేయబడిన ప్రీమియం, ప్రశాంతమైన కార్పొరేట్ డ్యాష్‌బోర్డ్.",
        "Arabic": "لوحة قيادة خاصة وهادئة للشركات محسّنة لعروض المديرين التنفيذيين.",
        "German": "Ergonomisches, ruhiges Unternehmens-Dashboard für C-Suite-Präsentationen.",
        "French": "Tableau de bord d'entreprise haut de gamme et calme, optimisé pour les présentations de direction."
    },
    "Project Health": {
        "Telugu": "ప్రాజెక్ట్ ఆరోగ్యం",
        "Arabic": "صحة المشروع",
        "German": "Projektgesundheit",
        "French": "Santé du projet"
    },
    "Quarterly": {
        "Telugu": "త్రైమాసిక",
        "Arabic": "ربع سنوي",
        "German": "Vierteljährlich",
        "French": "Trimestriel"
    },
    "Redirecting to login...": {
        "Telugu": "లాగిన్‌కు దారి మళ్ళించబడుతోంది...",
        "Arabic": "جاري التوجيه إلى تسجيل الدخول...",
        "German": "Weiterleitung zum Login...",
        "French": "Redirection vers la connexion..."
    },
    "Reporting Center": {
        "Telugu": "రిపోర్టింగ్ కేంద్రం",
        "Arabic": "مركز التقارير",
        "German": "Berichtszentrum",
        "French": "Centre de rapports"
    },
    "Request New Link": {
        "Telugu": "కొత్త లింక్ అభ్యర్థించండి",
        "Arabic": "طلب رابط جديد",
        "German": "Neuen Link anfordern",
        "French": "Demander un nouveau lien"
    },
    "Resilience Score (R_org)": {
        "Telugu": "పునరుద్ధరణ స్కోరు (R_org)",
        "Arabic": "نتيجة المرونة (R_org)",
        "German": "Resilienzbewertung (R_org)",
        "French": "Score de résilience (R_org)"
    },
    "Resource Conflicts": {
        "Telugu": "వనరుల వైరుధ్యాలు",
        "Arabic": "تضارب الموارد",
        "German": "Ressourcenkonflikte",
        "French": "Conflits de ressources"
    },
    "Risk Score ($R_v$)": {
        "Telugu": "నష్టభయ స్కోరు ($R_v$)",
        "Arabic": "نتيجة المخاطر ($R_v$)",
        "German": "Risikobewertung ($R_v$)",
        "French": "Score de risque ($R_v$)"
    },
    "Role filter...": {
        "Telugu": "పాత్ర ఫిల్టర్...",
        "Arabic": "تصفية حسب الدور...",
        "German": "Rollenfilter...",
        "French": "Filtre de rôle..."
    },
    "Royal Analytics": {
        "Telugu": "రాయల్ అనలిటిక్స్",
        "Arabic": "التحليلات الملكية",
        "German": "Königsanalytik",
        "French": "Analytique Royale"
    },
    "Save Schedule": {
        "Telugu": "షెడ్యూల్‌ను సేవ్ చేయండి",
        "Arabic": "حفظ الجدول",
        "German": "Zeitplan speichern",
        "French": "Enregistrer le planning"
    },
    "Search employees...": {
        "Telugu": "ఉద్యోగులను శోధించండి...",
        "Arabic": "البحث عن موظفين...",
        "German": "Mitarbeiter suchen...",
        "French": "Rechercher des employés..."
    },
    "Simulation Engine": {
        "Telugu": "సిమ్యులేషన్ ఇంజిన్",
        "Arabic": "محرك المحاكاة",
        "German": "Simulationsengine",
        "French": "Moteur de simulation"
    },
    "Skill Gap Analysis": {
        "Telugu": "నైపుణ్య అంతర విశ్లేషణ",
        "Arabic": "تحليل الفجوة في المهارات",
        "German": "Qualifikationslückenanalyse",
        "French": "Analyse des écarts de compétences"
    },
    "Smart Staffing": {
        "Telugu": "స్మార్ట్ సిబ్బంది నియామకం",
        "Arabic": "التوظيف الذكي",
        "German": "Intelligente Personalausstattung",
        "French": "Dotation intelligente"
    },
    "Smart Team Builder": {
        "Telugu": "స్మార్ట్ టీమ్ బిల్డర్",
        "Arabic": "باني الفريق الذكي",
        "German": "Intelligenter Teambauer",
        "French": "Constructeur d'équipe intelligent"
    },
    "Solar Command": {
        "Telugu": "సోలార్ కమాండ్",
        "Arabic": "القيادة الشمسية",
        "German": "Solarkommando",
        "French": "Commande Solaire"
    },
    "Space Command": {
        "Telugu": "స్పేస్ కమాండ్",
        "Arabic": "قيادة الفضاء",
        "German": "Weltraumkommando",
        "French": "Commande Spatiale"
    },
    "Strategic oversight and AI-driven portfolio recommendations.": {
        "Telugu": "వ్యూహాత్మక పర్యవేక్షణ మరియు AI-ఆధారిత పోర్ట్‌ఫోలియో సిఫార్సులు.",
        "Arabic": "الإشراف الاستراتيجي وتوصيات المحفظة المدفوعة بالذكاء الاصطناعي.",
        "German": "Strategische Aufsicht und KI-gestützte Portfolio-Empfehlungen.",
        "French": "Supervision stratégique et recommandations de portefeuille axées sur l'IA."
    },
    "Submit": {
        "Telugu": "సమర్పించండి",
        "Arabic": "إرسال",
        "German": "Absenden",
        "French": "Soumettre"
    },
    "Success Prob.": {
        "Telugu": "విజయ సంభావ్యత",
        "Arabic": "احتمالية النجاح",
        "German": "Erfolgswahrsch.",
        "French": "Prob. de succès"
    },
    "Sunset Horizon": {
        "Telugu": "సన్‌సెట్ హారిజాన్",
        "Arabic": "أفق الغروب",
        "German": "Sonnenuntergangshorizont",
        "French": "Horizon Couchant"
    },
    "Swap In": {
        "Telugu": "మార్పు చేయండి (Swap In)",
        "Arabic": "استبدال إدخال",
        "German": "Einwechseln",
        "French": "Remplacer"
    },
    "System": {
        "Telugu": "సిస్టమ్",
        "Arabic": "النظام",
        "German": "System",
        "French": "Système"
    },
    "Talent Matrix": {
        "Telugu": "టాలెంట్ మ్యాట్రిక్స్",
        "Arabic": "مصفوفة المواهب",
        "German": "Talentmatrix",
        "French": "Matrice des talents"
    },
    "Team Chemistry": {
        "Telugu": "టీమ్ కెమిస్ట్రీ",
        "Arabic": "كيمياء الفريق",
        "German": "Teamchemie",
        "French": "Chimie d'équipe"
    },
    "Team Chemistry Engine": {
        "Telugu": "టీమ్ కెమిస్ట్రీ ఇంజిన్",
        "Arabic": "محرك كيمياء الفريق",
        "German": "Teamchemie-Engine",
        "French": "Moteur de chimie d'équipe"
    },
    "The password reset link is invalid or has expired.": {
        "Telugu": "పాస్‌వర్డ్ రీసెట్ లింక్ చెల్లదు లేదా గడువు ముగిసింది.",
        "Arabic": "رابط إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية.",
        "German": "Der Link zum Zurücksetzen des Passworts ist ungültig oder abgelaufen.",
        "French": "Le lien de réinitialisation du mot de passe est invalide ou a expiré."
    },
    "Titanium Operations": {
        "Telugu": "టైటానియం ఆపరేషన్స్",
        "Arabic": "عمليات التيتانيوم",
        "German": "Titan-Operationen",
        "French": "Opérations Titane"
    },
    "Unified Platform Score": {
        "Telugu": "ఏకీకృత ప్లాట్‌ఫారమ్ స్కోరు",
        "Arabic": "درجة المنصة الموحدة",
        "German": "Einheitliche Plattformbewertung",
        "French": "Score de plateforme unifié"
    },
    "View Profile": {
        "Telugu": "ప్రొఫైల్ వీక్షించండి",
        "Arabic": "عرض الملف الشخصي",
        "German": "Profil anzeigen",
        "French": "Voir le profil"
    },
    "Weekly Executive Summary": {
        "Telugu": "వారాంతపు ఎగ్జిక్యూటివ్ సారాంశం",
        "Arabic": "الملخص التنفيذي الأسبوعي",
        "German": "Wöchentliche Führungszusammenfassung",
        "French": "Résumé exécutif hebdomadaire"
    },
    "Workforce AI": {
        "Telugu": "వర్క్‌ఫోర్స్ AI",
        "Arabic": "ذكاء القوى العاملة",
        "German": "Workforce KI",
        "French": "IA des effectifs"
    },
    "Workforce Health": {
        "Telugu": "వర్క్‌ఫోర్స్ ఆరోగ్యం",
        "Arabic": "صحة القوى العاملة",
        "German": "Gesundheit der Belegschaft",
        "French": "Santé des effectifs"
    },
    "admin@company.com": {
        "Telugu": "admin@company.com",
        "Arabic": "admin@company.com",
        "German": "admin@company.com",
        "French": "admin@company.com"
    },
    "e.g. Senior Developer": {
        "Telugu": "ఉదా. సీనియర్ డెవలపర్",
        "Arabic": "مثال: مطور أول",
        "German": "z.B. Senior Entwickler",
        "French": "ex. Développeur Senior"
    },
    "executive@company.com": {
        "Telugu": "executive@company.com",
        "Arabic": "executive@company.com",
        "German": "executive@company.com",
        "French": "executive@company.com"
    },
    "john@company.com": {
        "Telugu": "john@company.com",
        "Arabic": "john@company.com",
        "German": "john@company.com",
        "French": "john@company.com"
    },
    "you@company.com": {
        "Telugu": "you@company.com",
        "Arabic": "you@company.com",
        "German": "you@company.com",
        "French": "you@company.com"
    },
    "Severe Burnout Risk Detected": {
        "Telugu": "తీవ్రమైన బర్నౌట్ ప్రమాదం గుర్తించబడింది",
        "Arabic": "تم اكتشاف خطر إرهاق شديد",
        "German": "Schweres Burnout-Risiko erkannt",
        "French": "Risque d'épuisement professionnel sévère détecté"
    },
    "Underutilized Capacity Detected": {
        "Telugu": "తక్కువగా ఉపయోగించబడిన సామర్థ్యం గుర్తించబడింది",
        "Arabic": "تم اكتشاف قدرة غير مستخدمة بالكامل",
        "German": "Nicht ausgelastete Kapazität erkannt",
        "French": "Capacité sous-utilisée détectée"
    },
    "Critical Skill Shortage: Cloud Architecture": {
        "Telugu": "కీలక నైపుణ్యాల కొరత: క్లౌడ్ ఆర్కిటెక్చర్",
        "Arabic": "نقص المهارات الحرجة: هندسة السحابة",
        "German": "Kritischer Fachkräftemangel: Cloud-Architektur",
        "French": "Pénurie de compétences critiques: Architecture Cloud"
    },
    "Workforce Stabilized": {
        "Telugu": "వర్క్‌ఫోర్స్ స్థిరపడింది",
        "Arabic": "استقرار القوى العاملة",
        "German": "Belegschaft stabilisiert",
        "French": "Effectifs stabilisés"
    },
    "No immediate threats to capacity or delivery.": {
        "Telugu": "సామర్థ్యం లేదా డెలివరీకి తక్షణ ముప్పులు లేవు.",
        "Arabic": "لا توجد تهديدات فورية للقدرة أو التسليم.",
        "German": "Keine unmittelbaren Bedrohungen für Kapazität oder Lieferung.",
        "French": "Aucune menace immédiate pour la capacité ou la livraison."
    },
    "Focus on long-term employee growth and R&D projects.": {
        "Telugu": "దీర్ఘకాలిక ఉద్యోగుల వృద్ధి మరియు R&D ప్రాజెక్టులపై దృష్టి పెట్టండి.",
        "Arabic": "ركز على نمو الموظفين على المدى الطويل ومشاريع البحث والتطوير.",
        "German": "Konzentrieren Sie sich auf langfristiges Mitarbeiterwachstum und F&E-Projekte.",
        "French": "Concentrez-vous sur la croissance à long terme des employés et les projets de R&D."
    },
    "Maintains high retention and innovation.": {
        "Telugu": "అధిక నిలుపుదల మరియు ఆవిష్కరణను నిర్వహిస్తుంది.",
        "Arabic": "يحافظ على معدلات احتفاظ عالية وابتكار مستمر.",
        "German": "Erhält eine hohe Bindung und Innovation aufrecht.",
        "French": "Maintient une forte fidélisation et l'innovation."
    },
    "Rebalance workload by deferring lower-priority projects or initiating emergency contractor hiring.": {
        "Telugu": "తక్కువ ప్రాధాన్యత కలిగిన ప్రాజెక్టులను వాయిదా వేయడం ద్వారా లేదా అత్యవసర కాంట్రాక్టర్ నియామకాన్ని ప్రారంభించడం ద్వారా పనిభారాన్ని సమతుల్యం చేయండి.",
        "Arabic": "أعد توازن عبء العمل عن طريق تأجيل المشاريع ذات الأولوية المنخفضة أو بدء توظيف مقاولين في حالات الطوارئ.",
        "German": "Gleichen Sie die Arbeitsbelastung aus, indem Sie Projekte mit geringerer Priorität verschieben oder eine Notfall-Vertragsabschlusses initiieren.",
        "French": "Rééquilibrez la charge de travail en reportant les projets de faible priorité ou en lançant l'embauche d'entrepreneurs d'urgence."
    },
    "Closes skill gap in 12 weeks, ensuring project milestones are met.": {
        "Telugu": "12 వారాల్లో నైపుణ్య అంతరాన్ని మూసివేస్తుంది, ప్రాజెక్ట్ మైలురాళ్లు చేరుకునేలా చూస్తుంది.",
        "Arabic": "يسد فجوة المهارات في 12 أسبوعًا، مما يضمن تحقيق معالم المشروع.",
        "German": "Schließt die Qualifikationslücke in 12 Wochen und stellt sicher, dass Projektmeilensteine erreicht werden.",
        "French": "Comble l'écart de compétences en 12 semaines, garantissant que les jalons du projet sont atteints."
    },
    "Reallocate staff from bench to active high-demand projects.": {
        "Telugu": "బెంచ్ నుండి క్రియాశీల అధిక-డిమాండ్ ప్రాజెక్ట్‌లకు సిబ్బందిని తిరిగి కేటాయించండి.",
        "Arabic": "أعد تخصيص الموظفين من الاحتياط إلى المشاريع النشطة ذات الطلب المرتفع.",
        "German": "Verteilen Sie Personal von der Bank auf aktive Projekte mit hoher Nachfrage neu.",
        "French": "Réallouez le personnel en attente vers des projets actifs à forte demande."
    },
    "Increase capacity health by 15%.": {
        "Telugu": "సామర్థ్య ఆరోగ్యాన్ని 15% పెంచండి.",
        "Arabic": "زيادة صحة القدرة بنسبة 15%.",
        "German": "Kapazitätsgesundheit um 15% steigern.",
        "French": "Augmenter la santé de la capacité de 15%."
    },
    "Presentation Mode": {
        "Telugu": "ప్రదర్శన మోడ్",
        "Arabic": "وضع العرض التقديمي",
        "German": "Präsentationsmodus",
        "French": "Mode Présentation"
    },
    "Exit Demo Mode": {
        "Telugu": "డెమో మోడ్ నుండి నిష్క్రమించండి",
        "Arabic": "الخروج من وضع التجربة",
        "German": "Demo-Modus verlassen",
        "French": "Quitter le mode Démo"
    },
    "Capacity": {
        "Telugu": "సామర్థ్యం",
        "Arabic": "القدرة الاستيعابية",
        "German": "Kapazität",
        "French": "Capacité"
    },
    "Demand Gap": {
        "Telugu": "డిమాండ్ అంతరం",
        "Arabic": "فجوة الطلب",
        "German": "Nachfragelücke",
        "French": "Écart de demande"
    },
    "Enterprise Admin": {
        "Telugu": "ఎంటర్‌ప్రైజ్ అడ్మిన్",
        "Arabic": "مسؤول المؤسسة",
        "German": "Unternehmensadministrator",
        "French": "Administrateur d'entreprise"
    },
    "Demo Admin": {
        "Telugu": "డెమో అడ్మిన్",
        "Arabic": "مشرف التجربة",
        "German": "Demo-Administrator",
        "French": "Administrateur Démo"
    },
    "System Administrator": {
        "Telugu": "సిస్టమ్ అడ్మినిస్ట్రేటర్",
        "Arabic": "مسؤول النظام",
        "German": "Systemadministrator",
        "French": "Administrateur système"
    },
    "Admin": {
        "Telugu": "అడ్మిన్",
        "Arabic": "مسؤول",
        "German": "Admin",
        "French": "Admin"
    },
    "Available": {
        "Telugu": "అందుబాటులో ఉంది",
        "Arabic": "متاح",
        "German": "Verfügbar",
        "French": "Disponible"
    },
    "Overallocated": {
        "Telugu": "అధికంగా కేటాయించబడింది",
        "Arabic": "مخصص بشكل زائد",
        "German": "Überallokiert",
        "French": "Suraffecté"
    },
    "At Capacity": {
        "Telugu": "పూర్తి సామర్థ్యం వద్ద",
        "Arabic": "بكامل الطاقة",
        "German": "Ausgelastet",
        "French": "À pleine capacité"
    },
    "Low": {
        "Telugu": "తక్కువ",
        "Arabic": "منخفض",
        "German": "Niedrig",
        "French": "Faible"
    },
    "Medium": {
        "Telugu": "మధ్యస్థం",
        "Arabic": "متوسط",
        "German": "Mittel",
        "French": "Moyen"
    },
    "High": {
        "Telugu": "అధికం",
        "Arabic": "مرتفع",
        "German": "Hoch",
        "French": "Élevé"
    },
    "Junior": {
        "Telugu": "జూనియర్",
        "Arabic": "مبتدئ",
        "German": "Junior",
        "French": "Junior"
    },
    "Mid-Level": {
        "Telugu": "మిడ్-లెవల్",
        "Arabic": "مستوى متوسط",
        "German": "Mittelstufe",
        "French": "Niveau intermédiaire"
    },
    "Senior": {
        "Telugu": "సీనియర్",
        "Arabic": "أول",
        "German": "Senior",
        "French": "Senior"
    },
    "Lead": {
        "Telugu": "లీడ్",
        "Arabic": "قائد",
        "German": "Leitender",
        "French": "Responsable"
    },
    "Manager": {
        "Telugu": "మేనేజర్",
        "Arabic": "مدير",
        "German": "Manager",
        "French": "Manager"
    },
    "Confidence": {
        "Telugu": "నమ్మకం",
        "Arabic": "ثقة",
        "German": "Zuversicht",
        "French": "Confiance"
    },
    "Reason": {
        "Telugu": "కారణం",
        "Arabic": "السبب",
        "German": "Grund",
        "French": "Raison"
    },
    "Business Impact": {
        "Telugu": "వ్యాపార ప్రభావం",
        "Arabic": "تأثير العمل",
        "German": "Geschäftsauswirkung",
        "French": "Impact commercial"
    },
    "AI Recommended Action": {
        "Telugu": "AI సిఫార్సు చేసిన చర్య",
        "Arabic": "الإجراء الموصى به من الذكاء الاصطناعي",
        "German": "KI-empfohlene Maßnahme",
        "French": "Action recommandée par l'IA"
    },
    "Expected Outcome:": {
        "Telugu": "ఆశించిన ఫలితం:",
        "Arabic": "النتيجة المتوقعة:",
        "German": "Erwartetes Ergebnis:",
        "French": "Résultat attendu:"
    },
    "Applied": {
        "Telugu": "వర్తింపజేయబడింది",
        "Arabic": "تم التطبيق",
        "German": "Angewendet",
        "French": "Appliqué"
    },
    "Util:": {
        "Telugu": "వినియోగం:",
        "Arabic": "الاستخدام:",
        "German": "Ausl.:",
        "French": "Util:"
    },
    "% | Risk:": {
        "Telugu": "% | నష్టభయం:",
        "Arabic": "% | المخاطر:",
        "German": "% | Risiko:",
        "French": "% | Risque:"
    },
    "Match Score:": {
        "Telugu": "మ్యాచ్ స్కోరు:",
        "Arabic": "درجة التطابق:",
        "German": "Übereinstimmungsbewertung:",
        "French": "Score de correspondance:"
    },
    "% | Coverage:": {
        "Telugu": "% | కవరేజ్:",
        "Arabic": "% | التغطية:",
        "German": "% | Abdeckung:",
        "French": "% | Couverture:"
    },
    "Alternate Candidates": {
        "Telugu": "ప్రత్యామ్నాయ అభ్యర్థులు",
        "Arabic": "المرشحون البدائل",
        "German": "Alternative Kandidaten",
        "French": "Candidats alternatifs"
    },
    "Match:": {
        "Telugu": "మ్యాచ్:",
        "Arabic": "تطابق:",
        "German": "Übereinst.:",
        "French": "Correspondance:"
    },
    "| Util:": {
        "Telugu": "| వినియోగం:",
        "Arabic": "| الاستخدام:",
        "German": "| Ausl.:",
        "French": "| Util:"
    },
    "Option A: Merit Intervention": {
        "Telugu": "ఎంపిక A: మెరిట్ జోక్యం",
        "Arabic": "الخيار أ: تدخل الجدارة",
        "German": "Option A: Leistungsintervention",
        "French": "Option A: Intervention au mérite"
    },
    "Market Adjustment of": {
        "Telugu": "మార్కెట్ సర్దుబాటు రూ.",
        "Arabic": "تعديل السوق بمقدار",
        "German": "Marktanpassung von",
        "French": "Ajustement du marché de"
    },
    "This shifts CR → 0.96, reducing risk mathematically to 15%. Expected savings (ECA_current - ECA_new) =": {
        "Telugu": "ఇది CR → 0.96 కి మారుస్తుంది, ప్రమాదాన్ని గణితశాస్త్రపరంగా 15% కి తగ్గిస్తుంది. ఆశించిన పొదుపు (ECA_current - ECA_new) =",
        "Arabic": "هذا يحول CR ← 0.96، مما يقلل المخاطر رياضيًا إلى 15%. المدخرات المتوقعة (ECA_current - ECA_new) =",
        "German": "Dies verschiebt CR → 0.96 und reduziert das Risiko rechnerisch auf 15%. Erwartete Einsparungen (ECA_current - ECA_new) =",
        "French": "Cela déplace CR → 0.96, réduisant mathématiquement le risque à 15%. Économies attendues (ECA_current - ECA_new) ="
    },
    "Apply Gradient Ascent Optimization": {
        "Telugu": "గ్రేడియంట్ అసెంట్ ఆప్టిమైజేషన్ వర్తింపజేయండి",
        "Arabic": "تطبيق تحسين الصعود التدريجي",
        "German": "Gradientenanstiegsoptimierung anwenden",
        "French": "Appliquer l'optimisation par ascension de gradient"
    },
    "Expected Cost of Attrition": {
        "Telugu": "ఆశించిన వదిలివేత వ్యయం",
        "Arabic": "التكلفة المتوقعة للتناقص",
        "German": "Erwartete Fluktuationskosten",
        "French": "Coût attendu de l'attrition"
    },
    "Compa-Ratio:": {
        "Telugu": "కెంపా-నిష్పత్తి:",
        "Arabic": "نسبة المقارنة:",
        "German": "Compa-Ratio:",
        "French": "Ratio Compa:"
    },
    "Flight Risk:": {
        "Telugu": "వదిలివేత ప్రమాదం:",
        "Arabic": "خطر المغادرة:",
        "German": "Abwanderungsrisiko:",
        "French": "Risque de départ:"
    },
    "ECA: ₹": {
        "Telugu": "ECA: ₹",
        "Arabic": "ECA: ₹",
        "German": "ECA: ₹",
        "French": "ECA: ₹"
    },
    "Compensation Risk Optimization": {
        "Telugu": "పరిహార నష్టభయ ఆప్టిమైజేషన్",
        "Arabic": "تحسين مخاطر التعويضات",
        "German": "Vergütungsrisiko-Optimierung",
        "French": "Optimisation des risques de rémunération"
    },
    "Expected Cost of Attrition (ECA) vs Market Compa-Ratio Matrix.": {
        "Telugu": "ఆశించిన వదిలివేత వ్యయం (ECA) vs మార్కెట్ కెంపా-నిష్పత్తి మ్యాట్రిక్స్.",
        "Arabic": "مصفوفة التكلفة المتوقعة للتناقص (ECA) مقابل نسبة المقارنة بالسوق.",
        "German": "Erwartete Fluktuationskosten (ECA) vs. Markt-Compa-Ratio-Matrix.",
        "French": "Matrice Coût attendu de l'attrition (ECA) vs Ratio Compa du marché."
    }
}

file_path = 'D:/Engineering/Projects/Algoleap/Workforce Intelligence Platform/Frontend/src/store/useLanguageStore.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Parse dictionaries
for lang in ['Telugu', 'Arabic', 'German', 'French']:
    match = re.search(r'"' + lang + r'": \{(.*?)\n  \}', content, re.DOTALL)
    if not match:
        continue
    block = match.group(1)
    lines = block.split('\n')
    new_lines = []
    existing_keys = set()
    for line in lines:
        if ':' in line:
            parts = line.split(':', 1)
            k = parts[0].strip().strip('"').strip("'")
            v = parts[1].strip().rstrip(',').strip('"').strip("'")
            existing_keys.add(k)
            # check if we should override v
            if k in master_translations:
                new_val = master_translations[k][lang]
                new_lines.append(f'    {json.dumps(k)}: {json.dumps(new_val, ensure_ascii=False)},')
            elif v == "" or (v == k and len(k) > 1 and not k.isdigit() and k not in ['Ctrl+K', 'PRJ-', 'e.g. 1', 'ESC', 'Lvl', 'RISK', 'All', 'System', 'Details']):
                # If it's in master_translations, we handled it above. If not, let's keep it or translate basic common words
                new_lines.append(line)
            else:
                new_lines.append(line)
        else:
            new_lines.append(line)
            
    # Add any missing keys from master_translations
    for k, trans in master_translations.items():
        if k not in existing_keys:
            new_lines.append(f'    {json.dumps(k)}: {json.dumps(trans[lang], ensure_ascii=False)},')
            
    # Also add missing keys to English if needed
    new_block = "\n".join(new_lines).rstrip(',')
    content = content.replace(block, new_block)

# Let's also ensure all master keys exist in English block
eng_match = re.search(r'"English": \{(.*?)\n  \}', content, re.DOTALL)
if eng_match:
    eng_block = eng_match.group(1)
    eng_lines = eng_block.split('\n')
    eng_keys = set()
    for line in eng_lines:
        if ':' in line:
            k = line.split(':', 1)[0].strip().strip('"').strip("'")
            eng_keys.add(k)
    for k in master_translations.keys():
        if k not in eng_keys:
            eng_lines.append(f'    {json.dumps(k)}: {json.dumps(k)},')
    new_eng_block = "\n".join(eng_lines).rstrip(',')
    content = content.replace(eng_block, new_eng_block)

# Now inject the dynamic pattern matching in t(key)
old_t_func = """      t: (key) => {
        const lang = get().language;
        return translations[lang]?.[key] || key;
      },"""

new_t_func = """      t: (key) => {
        if (!key) return "";
        const lang = get().language;
        const dict = translations[lang];
        if (dict && dict[key] && dict[key] !== "" && dict[key] !== key) return dict[key];
        if (dict && dict[key] && dict[key] !== "") return dict[key];
        
        if (lang === "Telugu") {
          let m = key.match(/^(\\d+) employees are operating above critical utilization levels\\.$/);
          if (m) return `${m[1]} మంది ఉద్యోగులు క్లిష్టమైన వినియోగ స్థాయిల కంటే ఎక్కువగా పనిచేస్తున్నారు.`;
          m = key.match(/^Critical Skill Shortage: (.*)$/);
          if (m) return `కీలక నైపుణ్యాల కొరత: ${dict?.[m[1]] || m[1]}`;
          m = key.match(/^Demand for (.*) outpaces supply by (\\d+) headcounts\\.$/);
          if (m) return `${dict?.[m[1]] || m[1]} కోసం డిమాండ్ సరఫరా కంటే ${m[2]} హెడ్‌కౌంట్ల వరకు మించిపోయింది.`;
          m = key.match(/^Hire (\\d+) (.*) Engineers and upskill remaining internal staff\\.$/);
          if (m) return `${m[1]} మంది ${dict?.[m[2]] || m[2]} ఇంజనీర్లను నియమించండి మరియు మిగిలిన అంతర్గత సిబ్బంది నైపుణ్యాలను పెంచండి.`;
          m = key.match(/^(\\d+) employees are currently under (\\d+)% utilization, representing sunk cost\\.$/);
          if (m) return `${m[1]} మంది ఉద్యోగులు ప్రస్తుతం ${m[2]}% కంటే తక్కువ వినియోగంలో ఉన్నారు, ఇది నష్టాన్ని సూచిస్తుంది.`;
          m = key.match(/^Strong match \\((.*?)%\\)\\. (.*?) Utilized at (.*?)%\\.$/);
          if (m) return `బలమైన మ్యాచ్ (${m[1]}%). ${dict?.[m[2]] || m[2]} ${m[3]}% వినియోగించబడింది.`;
          m = key.match(/^Missing (\\d+) skills\\.$/);
          if (m) return `${m[1]} నైపుణ్యాలు కొరతగా ఉన్నాయి.`;
        } else if (lang === "Arabic") {
          let m = key.match(/^(\\d+) employees are operating above critical utilization levels\\.$/);
          if (m) return `يعمل ${m[1]} موظف فوق مستويات الاستخدام الحرجة.`;
          m = key.match(/^Critical Skill Shortage: (.*)$/);
          if (m) return `نقص المهارات الحرجة: ${dict?.[m[1]] || m[1]}`;
          m = key.match(/^Demand for (.*) outpaces supply by (\\d+) headcounts\\.$/);
          if (m) return `الطلب على ${dict?.[m[1]] || m[1]} يفوق العرض بمقدار ${m[2]} موظف.`;
          m = key.match(/^Hire (\\d+) (.*) Engineers and upskill remaining internal staff\\.$/);
          if (m) return `وظف ${m[1]} مهندس ${dict?.[m[2]] || m[2]} وقم بتطوير مهارات الموظفين الداخليين المتبقين.`;
          m = key.match(/^(\\d+) employees are currently under (\\d+)% utilization, representing sunk cost\\.$/);
          if (m) return `يوجد حاليًا ${m[1]} موظف يعملون بنسبة استخدام أقل من ${m[2]}%، مما يمثل تكلفة غارقة.`;
          m = key.match(/^Strong match \\((.*?)%\\)\\. (.*?) Utilized at (.*?)%\\.$/);
          if (m) return `تطابق قوي (${m[1]}%). ${dict?.[m[2]] || m[2]} مستخدم بنسبة ${m[3]}%.`;
          m = key.match(/^Missing (\\d+) skills\\.$/);
          if (m) return `ينقص ${m[1]} مهارات.`;
        } else if (lang === "German") {
          let m = key.match(/^(\\d+) employees are operating above critical utilization levels\\.$/);
          if (m) return `${m[1]} Mitarbeiter arbeiten über den kritischen Auslastungsgrenzen.`;
          m = key.match(/^Critical Skill Shortage: (.*)$/);
          if (m) return `Kritischer Fachkräftemangel: ${dict?.[m[1]] || m[1]}`;
          m = key.match(/^Demand for (.*) outpaces supply by (\\d+) headcounts\\.$/);
          if (m) return `Die Nachfrage nach ${dict?.[m[1]] || m[1]} übersteigt das Angebot um ${m[2]} Mitarbeiter.`;
          m = key.match(/^Hire (\\d+) (.*) Engineers and upskill remaining internal staff\\.$/);
          if (m) return `Stellen Sie ${m[1]} ${dict?.[m[2]] || m[2]}-Ingenieure ein und bilden Sie das verbleibende interne Personal weiter.`;
          m = key.match(/^(\\d+) employees are currently under (\\d+)% utilization, representing sunk cost\\.$/);
          if (m) return `${m[1]} Mitarbeiter haben derzeit eine Auslastung von unter ${m[2]} %, was versunkene Kosten darstellt.`;
          m = key.match(/^Strong match \\((.*?)%\\)\\. (.*?) Utilized at (.*?)%\\.$/);
          if (m) return `Starke Übereinstimmung (${m[1]}%). ${dict?.[m[2]] || m[2]} Ausgelastet zu ${m[3]}%.`;
          m = key.match(/^Missing (\\d+) skills\\.$/);
          if (m) return `Es fehlen ${m[1]} Fähigkeiten.`;
        } else if (lang === "French") {
          let m = key.match(/^(\\d+) employees are operating above critical utilization levels\\.$/);
          if (m) return `${m[1]} employés fonctionnent au-dessus des niveaux d'utilisation critiques.`;
          m = key.match(/^Critical Skill Shortage: (.*)$/);
          if (m) return `Pénurie de compétences critiques: ${dict?.[m[1]] || m[1]}`;
          m = key.match(/^Demand for (.*) outpaces supply by (\\d+) headcounts\\.$/);
          if (m) return `La demande en ${dict?.[m[1]] || m[1]} dépasse l'offre de ${m[2]} effectifs.`;
          m = key.match(/^Hire (\\d+) (.*) Engineers and upskill remaining internal staff\\.$/);
          if (m) return `Embauchez ${m[1]} ingénieurs ${dict?.[m[2]] || m[2]} et perfectionnez le reste du personnel interne.`;
          m = key.match(/^(\\d+) employees are currently under (\\d+)% utilization, representing sunk cost\\.$/);
          if (m) return `${m[1]} employés ont actuellement une utilisation inférieure à ${m[2]} %, représentant un coût irrécupérable.`;
          m = key.match(/^Strong match \\((.*?)%\\)\\. (.*?) Utilized at (.*?)%\\.$/);
          if (m) return `Forte correspondance (${m[1]}%). ${dict?.[m[2]] || m[2]} Utilisé à ${m[3]}%.`;
          m = key.match(/^Missing (\\d+) skills\\.$/);
          if (m) return `Il manque ${m[1]} compétences.`;
        }

        return dict?.[key] || key;
      },"""

if old_t_func in content:
    content = content.replace(old_t_func, new_t_func)
else:
    print("WARNING: old_t_func not matched exactly!")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully updated useLanguageStore.ts!")
