import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      appTitle: "AI Memory Manager",
      nav: { map: "Map", search: "Search", input: "Input", privacy: "Privacy" },
      map: {
        title: "Your memory map",
        subtitle: "A little more connected. A little more you.",
        youNode: "You",
        tapHint: "Tap a category circle to explore or switch to list view",
        viewMap: "Map View",
        viewList: "List View",
        triggerConflict: "Resolve Detected Conflict (1)"
      },
      categories: {
        Work: "Work",
        Favorites: "Favorite foods",
        Routines: "Routines",
        Places: "Places",
        Language: "Preferred Language"
      },
      deepDive: {
        backToMap: "Back to Map",
        categoryTitle: "Category: {{cat}}",
        factsTab: "Facts ({{count}})",
        inferencesTab: "Inferences ({{count}})",
        sourceLabel: "Source: {{src}} • {{date}}"
      },
      search: {
        title: "Search & Filter",
        placeholder: "Search memories (e.g., Work, Paris)...",
        typeLabel: "TYPE",
        all: "All Memories",
        fact: "Verified Facts",
        inference: "AI Inferences",
        confidenceLabel: "CONFIDENCE SCORE",
        confHigh: "High (>80%)",
        confMed: "Medium (50–79%)",
        confLow: "Low (<50%)",
        categoryLabel: "CATEGORY",
        clearAll: "Clear All",
        showResults: "Show {{count}} Results",
        zeroTitle: "0 memories found",
        zeroDesc: "No matches for \"{{query}}\" with active filters.",
        zeroHint: "Try clearing some of your active filters or explore suggestions below:",
        chipRecent: "Recent inferences",
        chipPopular: "Popular: Work",
        clearAndShowAll: "Clear Filters & Show All"
      },
      detail: {
        back: "Back",
        verifiedBadge: "VERIFIED FACT",
        inferenceBadge: "AI INFERENCE",
        aiBelieves: "AI believes:",
        confidence: "Confidence: {{pct}}",
        basedOn: "Based on:",
        reason1: "1. Calendar: 8 out of 10 meetings scheduled before 10 AM.",
        reason2: "2. Productivity pattern: Most emails sent between 8–10 AM.",
        verifiedDate: "Verified: {{date}}",
        editBtn: "Edit Memory",
        deleteLink: "Delete memory",
        correctBtn: "Correct This Assumption",
        flagBtn: "Flag as Incorrect"
      },
      edit: {
        title: "Edit Memory",
        category: "Memory Category",
        statement: "Memory Statement",
        type: "Memory Type",
        confidence: "Confidence Level ({{pct}})",
        keepInference: "Keep as AI Inference",
        verifyFact: "Verify as Fact",
        cancel: "Cancel",
        save: "Save Changes"
      },
      feedback: {
        banner: "[SUCCESS] Memory Flagged as Incorrect",
        youFlagged: "You flagged: \"{{statement}}\"",
        whyOptional: "Why is this incorrect? (optional)",
        reasons: {
          wrongCat: "Wrong Category",
          notTrue: "Not True",
          tooPersonal: "Too Personal",
          outdated: "Outdated"
        },
        undo: "Undo Changes",
        editDetails: "Edit Details",
        backToMap: "Back To Map"
      },
      conflict: {
        banner: "CONFLICT DETECTED",
        desc: "You said you hate morning meetings, but your work schedule has \"M–F, 9am–5pm\". Which is correct?",
        opt1: "Keep: Hate morning meetings (Inference will be deleted)",
        opt2: "Keep: M–F, 9am–5pm work schedule (Inference stays)",
        confirm: "Confirm Selection",
        later: "Decide Later"
      }
    }
  },
  hr: {
    translation: {
      appTitle: "Upravitelj AI Memorijom",
      nav: { map: "Karta", search: "Pretraga", input: "Unos", privacy: "Privatnost" },
      map: {
        title: "Vaša karta memorije",
        subtitle: "Malo povezanije. Malo više vi.",
        youNode: "Vi",
        tapHint: "Dodirnite krug kategorije za pregled ili promijenite prikaz",
        viewMap: "Prikaz karte",
        viewList: "Prikaz popisa",
        triggerConflict: "Riješi otkriveni sukob (1)"
      },
      categories: {
        Work: "Posao",
        Favorites: "Omiljena hrana",
        Routines: "Rutine",
        Places: "Mjesta",
        Language: "Željeni jezik"
      },
      deepDive: {
        backToMap: "Natrag na kartu",
        categoryTitle: "Kategorija: {{cat}}",
        factsTab: "Činjenice ({{count}})",
        inferencesTab: "Zaključci ({{count}})",
        sourceLabel: "Izvor: {{src}} • {{date}}"
      },
      search: {
        title: "Pretraga i filtriranje",
        placeholder: "Pretražite memorije (npr. Posao, Pariz)...",
        typeLabel: "VRSTA",
        all: "Sve memorije",
        fact: "Provjerene činjenice",
        inference: "AI zaključci",
        confidenceLabel: "RAZINA POUZDANOSTI",
        confHigh: "Visoka (>80%)",
        confMed: "Srednja (50–79%)",
        confLow: "Niska (<50%)",
        categoryLabel: "KATEGORIJA",
        clearAll: "Očisti sve",
        showResults: "Prikaži rezultate ({{count}})",
        zeroTitle: "Pronađeno 0 memorija",
        zeroDesc: "Nema rezultata za \"{{query}}\" uz aktivne filtere.",
        zeroHint: "Pokušajte očistiti aktivne filtere ili istražite prijedloge ispod:",
        chipRecent: "Nedavni zaključci",
        chipPopular: "Popularno: Posao",
        clearAndShowAll: "Očisti filtere i prikaži sve"
      },
      detail: {
        back: "Natrag",
        verifiedBadge: "PROVJERENA ČINJENICA",
        inferenceBadge: "AI ZAKLJUČAK",
        aiBelieves: "AI pretpostavlja:",
        confidence: "Pouzdanost: {{pct}}",
        basedOn: "Na temelju:",
        reason1: "1. Kalendar: 8 od 10 sastanaka zakazano prije 10:00.",
        reason2: "2. Obrazac produktivnosti: Većina e-poruka poslana između 8:00 i 10:00.",
        verifiedDate: "Provjereno: {{date}}",
        editBtn: "Uredi memoriju",
        deleteLink: "Obriši memoriju",
        correctBtn: "Ispravi ovu pretpostavku",
        flagBtn: "Označi kao netočno"
      },
      edit: {
        title: "Uredi memoriju",
        category: "Kategorija memorije",
        statement: "Izjava memorije",
        type: "Vrsta memorije",
        confidence: "Razina pouzdanosti ({{pct}})",
        keepInference: "Zadrži kao AI zaključak",
        verifyFact: "Potvrdi kao činjenicu",
        cancel: "Odustani",
        save: "Spremi promjene"
      },
      feedback: {
        banner: "[USPJEH] Memorija označena kao netočna",
        youFlagged: "Označili ste: \"{{statement}}\"",
        whyOptional: "Zašto je ovo netočno? (neobavezno)",
        reasons: {
          wrongCat: "Pogrešna kategorija",
          notTrue: "Nije istina",
          tooPersonal: "Previše osobno",
          outdated: "Zastarjelo"
        },
        undo: "Poništi promjene",
        editDetails: "Uredi detalje",
        backToMap: "Natrag na kartu"
      },
      conflict: {
        banner: "OTKRIVEN SUKOB PODATAKA",
        desc: "Naveli ste da ne volite jutarnje sastanke, ali vaš raspored rada kaže \"Pon–Pet, 09:00–17:00\". Što je točno?",
        opt1: "Zadrži: Ne volim jutarnje sastanke (AI zaključak se briše)",
        opt2: "Zadrži: Raspored Pon–Pet, 09:00–17:00 (AI zaključak ostaje)",
        confirm: "Potvrdi odabir",
        later: "Odluči kasnije"
      }
    }
  },
  de: {
    translation: {
      appTitle: "KI-Gedächtnisverwaltung",
      nav: { map: "Karte", search: "Suche", input: "Eingabe", privacy: "Datenschutz" },
      map: {
        title: "Ihre Gedächtniskarte",
        subtitle: "Etwas vernetzter. Etwas mehr Sie.",
        youNode: "Sie",
        tapHint: "Tippen Sie auf einen Kategoriekreis oder wechseln Sie zur Listenansicht",
        viewMap: "Kartenansicht",
        viewList: "Listenansicht",
        triggerConflict: "Erkannten Datenkonflikt lösen (1)"
      },
      categories: {
        Work: "Arbeit",
        Favorites: "Lieblingsspeisen",
        Routines: "Routinen",
        Places: "Orte",
        Language: "Bevorzugte Sprache"
      },
      deepDive: {
        backToMap: "Zurück zur Karte",
        categoryTitle: "Kategorie: {{cat}}",
        factsTab: "Fakten ({{count}})",
        inferencesTab: "Schlussfolgerungen ({{count}})",
        sourceLabel: "Quelle: {{src}} • {{date}}"
      },
      search: {
        title: "Such- und Filteroberfläche",
        placeholder: "Erinnerungen durchsuchen (z.B. Arbeit, Paris)...",
        typeLabel: "ERINNERUNGSTYP",
        all: "Alle Erinnerungen",
        fact: "Verifizierte Fakten",
        inference: "KI-Schlussfolgerungen",
        confidenceLabel: "KONFIDENZWERT",
        confHigh: "Hoch (>80%)",
        confMed: "Mittel (50–79%)",
        confLow: "Niedrig (<50%)",
        categoryLabel: "KATEGORIE",
        clearAll: "Alle zurücksetzen",
        showResults: "{{count}} Ergebnisse anzeigen",
        zeroTitle: "0 Erinnerungen gefunden",
        zeroDesc: "Keine Treffer für \"{{query}}\" mit aktiven Filtern.",
        zeroHint: "Setzen Sie aktive Filter zurück oder nutzen Sie Vorschläge:",
        chipRecent: "Neueste Schlussfolgerungen",
        chipPopular: "Beliebt: Arbeit",
        clearAndShowAll: "Filter zurücksetzen & alle anzeigen"
      },
      detail: {
        back: "Zurück",
        verifiedBadge: "VERIFIZIERTER FAKT",
        inferenceBadge: "KI-SCHLUSSFOLGERUNG",
        aiBelieves: "KI vermutet:",
        confidence: "Konfidenzwert: {{pct}}",
        basedOn: "Basierend auf:",
        reason1: "1. Kalender: 8 von 10 Besprechungen vor 10:00 Uhr geplant.",
        reason2: "2. Produktivitätsmuster: Meiste E-Mails zwischen 8–10 Uhr gesendet.",
        verifiedDate: "Verifiziert am: {{date}}",
        editBtn: "Erinnerung bearbeiten",
        deleteLink: "Erinnerung löschen",
        correctBtn: "Diese Annahme korrigieren",
        flagBtn: "Als falsch markieren"
      },
      edit: {
        title: "Erinnerung bearbeiten",
        category: "Erinnerungskategorie",
        statement: "Erinnerungsaussage",
        type: "Erinnerungstyp",
        confidence: "Vertrauensniveau ({{pct}})",
        keepInference: "Als KI-Schlussfolgerung behalten",
        verifyFact: "Als verifizierten Fakt bestätigen",
        cancel: "Abbrechen",
        save: "Änderungen speichern"
      },
      feedback: {
        banner: "[ERFOLG] Erinnerung als falsch markiert",
        youFlagged: "Markiert: \"{{statement}}\"",
        whyOptional: "Warum ist dies falsch? (optional)",
        reasons: {
          wrongCat: "Falsche Kategorie",
          notTrue: "Nicht wahr",
          tooPersonal: "Zu persönlich",
          outdated: "Veraltet"
        },
        undo: "Änderungen rückgängig machen",
        editDetails: "Details bearbeiten",
        backToMap: "Zurück zur Karte"
      },
      conflict: {
        banner: "DATENKONFLIKT ERKANNT",
        desc: "Sie sagten, Sie hassen Morgenbesprechungen, aber Ihr Arbeitsplan lautet \"Mo–Fr, 9–17 Uhr\". Was ist richtig?",
        opt1: "Behalten: Hasse Morgenbesprechungen (Schlussfolgerung wird gelöscht)",
        opt2: "Behalten: Arbeitsplan Mo–Fr, 9–17 Uhr (Schlussfolgerung bleibt)",
        confirm: "Auswahl bestätigen",
        later: "Später entscheiden"
      }
    }
  }
};

// Locale-aware plural helper using Intl.PluralRules (Section 6.3 requirement)
export function formatMemoryCount(count, locale = 'en') {
  const rules = new Intl.PluralRules(locale);
  const category = rules.select(count);
  const num = new Intl.NumberFormat(locale).format(count);

  if (locale.startsWith('hr')) {
    if (category === 'one') return `${num} pronađena memorija`;
    if (category === 'few') return `${num} pronađene memorije`;
    return `${num} pronađenih memorija`;
  }
  if (locale.startsWith('de')) {
    return category === 'one' ? `${num} Erinnerung gefunden` : `${num} Erinnerungen gefunden`;
  }
  return category === 'one' ? `${num} memory found` : `${num} memories found`;
}

// Locale-aware percentage and date helpers (Section 6.4 requirement)
export function formatPercent(value, locale = 'en') {
  return new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 0 }).format((value || 0) / 100);
}

export function formatUtcDate(utcString, locale = 'en') {
  if (!utcString) return '';
  const date = new Date(utcString);
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date);
}

export function sortMemoriesByLocale(memories, locale = 'hr') {
  const collator = new Intl.Collator(locale, { sensitivity: 'base' });
  return [...memories].sort((a, b) => collator.compare(a.statement || '', b.statement || ''));
}

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem('memory_ai_locale') || 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false }
});

export default i18n;