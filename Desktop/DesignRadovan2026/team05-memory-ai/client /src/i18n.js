import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

export const SUPPORTED_LOCALES = ['en', 'hr', 'de'];
export const LOCALE_STORAGE_KEY = 'amm.locale';

const resources = {
  en: {
    translation: {
      welcome: "Remember less. Know more.",
      searchPlaceholder: "Search your memories...",
      mapTab: "Map",
      searchTab: "Search",
      inputTab: "Input",
      privacyTab: "Privacy",

      // --- App shell (feat/app-shell-and-navigation) ---
      app: {
        name: "AI Memory Manager",
        pageTitle: "{{page}} · AI Memory Manager",
        skipToContent: "Skip to main content"
      },
      header: {
        brandLabel: "AI Memory Manager, go to home",
        home: "Home",
        saved: "Saved memories",
        searchLabel: "Search memories",
        searchSubmit: "Search"
      },
      nav: { label: "Main navigation" },
      locale: {
        switcherLabel: "Interface language",
        changed: "Language changed to {{language}}"
      },
      user: {
        menuButton: "Account menu for {{name}}",
        signIn: "Sign in",
        signOut: "Sign out"
      },
      notifications: {
        unread_one: "{{count}} unread notification",
        unread_other: "{{count}} unread notifications"
      },
      auth: {
        title: "Welcome back",
        subtitle: "Sign in to continue to your account.",
        email: "Email",
        emailPlaceholder: "name@example.com",
        password: "Password",
        passwordPlaceholder: "Enter your password",
        showPassword: "Show password",
        hidePassword: "Hide password",
        remember: "Remember me",
        submit: "Sign in",
        submitting: "Signing in…",
        demoHint: "Demo account: {{email}} · password: {{password}}",
        errors: {
          emailRequired: "Enter your email address.",
          emailInvalid: "Enter a valid email address, for example name@example.com.",
          passwordRequired: "Enter your password.",
          invalidCredentials: "That email and password don't match. Try again."
        }
      },
      pages: { map: "Memory map", search: "Search", input: "Input", privacy: "Privacy", login: "Sign in" },
      placeholder: { body: "This screen is being built and arrives with the next merge." }
    }
  },
  hr: {
    translation: {
      welcome: "Zapamtite manje. Znajte više.",
      searchPlaceholder: "Pretražite svoje memorije...",
      mapTab: "Karta",
      searchTab: "Pretraži",
      inputTab: "Unos",
      privacyTab: "Privatnost",

      app: {
        name: "AI Memory Manager",
        pageTitle: "{{page}} · AI Memory Manager",
        skipToContent: "Preskoči na glavni sadržaj"
      },
      header: {
        brandLabel: "AI Memory Manager, idi na početnu",
        home: "Početna",
        saved: "Spremljena sjećanja",
        searchLabel: "Pretraži sjećanja",
        searchSubmit: "Traži"
      },
      nav: { label: "Glavna navigacija" },
      locale: {
        switcherLabel: "Jezik sučelja",
        changed: "Jezik je promijenjen: {{language}}"
      },
      user: {
        menuButton: "Izbornik računa: {{name}}",
        signIn: "Prijava",
        signOut: "Odjava"
      },
      notifications: {
        unread_one: "{{count}} nepročitana obavijest",
        unread_few: "{{count}} nepročitane obavijesti",
        unread_other: "{{count}} nepročitanih obavijesti"
      },
      auth: {
        title: "Dobro došli natrag",
        subtitle: "Prijavite se kako biste nastavili do svog računa.",
        email: "E-pošta",
        emailPlaceholder: "ime@primjer.hr",
        password: "Lozinka",
        passwordPlaceholder: "Unesite lozinku",
        showPassword: "Prikaži lozinku",
        hidePassword: "Sakrij lozinku",
        remember: "Zapamti me",
        submit: "Prijavi se",
        submitting: "Prijava u tijeku…",
        demoHint: "Demo račun: {{email}} · lozinka: {{password}}",
        errors: {
          emailRequired: "Unesite adresu e-pošte.",
          emailInvalid: "Unesite valjanu adresu e-pošte, npr. ime@primjer.hr.",
          passwordRequired: "Unesite lozinku.",
          invalidCredentials: "E-pošta i lozinka se ne podudaraju. Pokušajte ponovno."
        }
      },
      pages: { map: "Karta sjećanja", search: "Pretraga", input: "Unos", privacy: "Privatnost", login: "Prijava" },
      placeholder: { body: "Ovaj je zaslon u izradi i stiže sa sljedećim spajanjem." }
    }
  },
  de: {
    translation: {
      welcome: "Weniger merken. Mehr wissen.",
      searchPlaceholder: "Durchsuche deine Erinnerungen...",
      mapTab: "Karte",
      searchTab: "Suchen",
      inputTab: "Eingabe",
      privacyTab: "Datenschutz",

      app: {
        name: "AI Memory Manager",
        pageTitle: "{{page}} · AI Memory Manager",
        skipToContent: "Zum Hauptinhalt springen"
      },
      header: {
        brandLabel: "AI Memory Manager, zur Startseite",
        home: "Startseite",
        saved: "Gespeicherte Erinnerungen",
        searchLabel: "Erinnerungen durchsuchen",
        searchSubmit: "Suchen"
      },
      nav: { label: "Hauptnavigation" },
      locale: {
        switcherLabel: "Sprache der Benutzeroberfläche",
        changed: "Sprache geändert: {{language}}"
      },
      user: {
        menuButton: "Kontomenü für {{name}}",
        signIn: "Anmelden",
        signOut: "Abmelden"
      },
      notifications: {
        unread_one: "{{count}} ungelesene Benachrichtigung",
        unread_other: "{{count}} ungelesene Benachrichtigungen"
      },
      auth: {
        title: "Willkommen zurück",
        subtitle: "Melde dich an, um mit deinem Konto fortzufahren.",
        email: "E-Mail-Adresse",
        emailPlaceholder: "name@beispiel.de",
        password: "Passwort",
        passwordPlaceholder: "Passwort eingeben",
        showPassword: "Passwort anzeigen",
        hidePassword: "Passwort verbergen",
        remember: "Angemeldet bleiben",
        submit: "Anmelden",
        submitting: "Anmeldung läuft…",
        demoHint: "Demo-Konto: {{email}} · Passwort: {{password}}",
        errors: {
          emailRequired: "Gib deine E-Mail-Adresse ein.",
          emailInvalid: "Gib eine gültige E-Mail-Adresse ein, z. B. name@beispiel.de.",
          passwordRequired: "Gib dein Passwort ein.",
          invalidCredentials: "E-Mail-Adresse und Passwort passen nicht zusammen. Versuch es noch einmal."
        }
      },
      pages: { map: "Erinnerungskarte", search: "Suche", input: "Eingabe", privacy: "Datenschutz", login: "Anmelden" },
      placeholder: { body: "Dieser Bildschirm ist in Arbeit und kommt mit dem nächsten Merge." }
    }
  }
};

/** Saved choice survives a reload; never guessed from IP. Falls back to English. */
function getInitialLocale() {
  try {
    const saved = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (SUPPORTED_LOCALES.includes(saved)) return saved;
  } catch {
    /* storage can be blocked (private mode) */
  }
  return "en";
}

/** Keep <html lang> and <html dir> in sync with the active language. */
function applyDocumentLocale(lng) {
  document.documentElement.lang = lng;
  document.documentElement.dir = i18n.dir(lng);
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getInitialLocale(),
    fallbackLng: { hr: ["en"], de: ["en"], default: ["en"] },
    supportedLngs: SUPPORTED_LOCALES,
    interpolation: {
      escapeValue: false
    }
  });

applyDocumentLocale(i18n.language);
i18n.on("languageChanged", (lng) => {
  applyDocumentLocale(lng);
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, lng);
  } catch {
    /* ignore */
  }
});

export default i18n;
