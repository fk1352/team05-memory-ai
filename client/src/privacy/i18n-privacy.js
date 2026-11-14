import i18n from '../i18n';

const en = {
  privacy: {
    title: 'Privacy',
    categories: { work: 'Work', food: 'Food', location: 'Location', hobbies: 'Hobbies', travel: 'Travel', preferences: 'Preferences', health: 'Health' },
    sections: { dashboard: 'Dashboard', forget: 'Manage memories', audit: 'Audit log' },
    sectionsLabel: 'Privacy sections',
    errors: {
      offline: 'You are offline. Connect to the internet and try again.',
      timeout: 'The server took too long to answer. Try again.',
      network: 'Could not reach the server. Check that it is running and try again.',
      notFound: 'These memories no longer exist. The list has been refreshed.',
      server: 'Something went wrong on the server. Try again.',
      generic: 'Something went wrong. Try again.',
    },
    retry: 'Try again',
    loading: 'Loading…',
    dashboard: {
      heading: 'Privacy dashboard',
      intro: 'See what the assistant remembers about you and decide what it may keep.',
      total: 'Memories stored',
      facts: 'Verified facts',
      inferences: 'AI inferences',
      lastActivity: 'Last activity',
      noActivity: 'No activity yet',
      permissions: 'Memory permissions',
      pauseLabel: 'Pause memory saving',
      pauseHelp: 'While paused, nothing new is saved. Existing memories stay until you delete them.',
      statusOn: 'Memory saving is on',
      statusPaused: 'Memory saving is paused',
      savedPaused: 'Memory saving paused',
      savedResumed: 'Memory saving resumed',
      manageLink: 'Manage and delete memories',
      auditLink: 'View audit log',
    },
    forget: {
      heading: 'Selective forgetting',
      intro: 'Select the memories you want the assistant to forget.',
      selectAll: 'Select all',
      selectedCount_one: '{{count}} memory selected',
      selectedCount_other: '{{count}} memories selected',
      deleteSelected: 'Delete selected',
      clear: 'Clear selection',
      typeFact: 'Fact',
      typeInference: 'Inference',
      confidence: 'Confidence {{value}}',
      emptyTitle: 'No memories to manage',
      emptyText: 'The assistant does not remember anything about you right now.',
      listLabel: 'Your memories',
    },
    modal: {
      title_one: 'Delete {{count}} memory?',
      title_other: 'Delete {{count}} memories?',
      body: 'The assistant will forget the following. This cannot be undone.',
      more_one: '…and {{count}} more',
      more_other: '…and {{count}} more',
      cancel: 'Cancel',
      confirm: 'Delete permanently',
      deleting: 'Deleting…',
    },
    result: {
      success_one: '{{count}} memory deleted',
      success_other: '{{count}} memories deleted',
      failedTitle: 'Deletion failed',
      dismiss: 'Close message',
    },
    audit: {
      heading: 'Audit log',
      intro: 'Every change to your memories is recorded here, newest first.',
      emptyTitle: 'No events yet',
      emptyText: 'When memories are created, edited or deleted, the events appear here.',
      showDetails: 'Show details',
      hideDetails: 'Hide details',
      eventId: 'Event #{{id}}',
      memoryRef: 'Memory',
      memoryGone: 'Memory has been deleted',
      detailsLabel: 'Details',
      timeLabel: 'Time',
      actions: {
        created: 'Memory created',
        updated: 'Memory edited',
        verified: 'Memory verified',
        flagged: 'Flagged as incorrect',
        deleted: 'Memory deleted',
        paused: 'Memory saving paused',
        resumed: 'Memory saving resumed',
      },
      refresh: 'Refresh',
    },
  },
};

const hr = {
  privacy: {
    title: 'Privatnost',
    categories: { work: 'Posao', food: 'Hrana', location: 'Lokacija', hobbies: 'Hobiji', travel: 'Putovanja', preferences: 'Sklonosti', health: 'Zdravlje' },
    sections: { dashboard: 'Pregled', forget: 'Upravljanje memorijama', audit: 'Zapisnik promjena' },
    sectionsLabel: 'Odjeljci privatnosti',
    errors: {
      offline: 'Niste povezani s internetom. Povežite se i pokušajte ponovno.',
      timeout: 'Poslužitelj predugo odgovara. Pokušajte ponovno.',
      network: 'Poslužitelj nije dostupan. Provjerite radi li i pokušajte ponovno.',
      notFound: 'Ove memorije više ne postoje. Popis je osvježen.',
      server: 'Došlo je do pogreške na poslužitelju. Pokušajte ponovno.',
      generic: 'Nešto nije u redu. Pokušajte ponovno.',
    },
    retry: 'Pokušaj ponovno',
    loading: 'Učitavanje…',
    dashboard: {
      heading: 'Nadzorna ploča privatnosti',
      intro: 'Pogledajte što asistent pamti o vama i odlučite što smije zadržati.',
      total: 'Spremljene memorije',
      facts: 'Provjerene činjenice',
      inferences: 'AI zaključci',
      lastActivity: 'Posljednja aktivnost',
      noActivity: 'Još nema aktivnosti',
      permissions: 'Dopuštenja memorije',
      pauseLabel: 'Pauziraj spremanje memorije',
      pauseHelp: 'Dok je pauzirano, ništa novo se ne sprema. Postojeće memorije ostaju dok ih ne izbrišete.',
      statusOn: 'Spremanje memorije je uključeno',
      statusPaused: 'Spremanje memorije je pauzirano',
      savedPaused: 'Spremanje memorije pauzirano',
      savedResumed: 'Spremanje memorije nastavljeno',
      manageLink: 'Upravljaj i briši memorije',
      auditLink: 'Prikaži zapisnik promjena',
    },
    forget: {
      heading: 'Selektivno zaboravljanje',
      intro: 'Odaberite memorije koje asistent treba zaboraviti.',
      selectAll: 'Odaberi sve',
      selectedCount_one: 'Odabrana je {{count}} memorija',
      selectedCount_few: 'Odabrane su {{count}} memorije',
      selectedCount_other: 'Odabrano je {{count}} memorija',
      deleteSelected: 'Izbriši odabrano',
      clear: 'Poništi odabir',
      typeFact: 'Činjenica',
      typeInference: 'Zaključak',
      confidence: 'Pouzdanost {{value}}',
      emptyTitle: 'Nema memorija za upravljanje',
      emptyText: 'Asistent trenutačno ne pamti ništa o vama.',
      listLabel: 'Vaše memorije',
    },
    modal: {
      title_one: 'Izbrisati {{count}} memoriju?',
      title_few: 'Izbrisati {{count}} memorije?',
      title_other: 'Izbrisati {{count}} memorija?',
      body: 'Asistent će zaboraviti sljedeće. Ovo se ne može poništiti.',
      more_one: '…i još {{count}}',
      more_few: '…i još {{count}}',
      more_other: '…i još {{count}}',
      cancel: 'Odustani',
      confirm: 'Trajno izbriši',
      deleting: 'Brisanje…',
    },
    result: {
      success_one: 'Izbrisana je {{count}} memorija',
      success_few: 'Izbrisane su {{count}} memorije',
      success_other: 'Izbrisano je {{count}} memorija',
      failedTitle: 'Brisanje nije uspjelo',
      dismiss: 'Zatvori poruku',
    },
    audit: {
      heading: 'Zapisnik promjena',
      intro: 'Svaka promjena vaših memorija bilježi se ovdje, najnovije prvo.',
      emptyTitle: 'Još nema događaja',
      emptyText: 'Kada se memorije stvore, uređuju ili brišu, događaji se pojavljuju ovdje.',
      showDetails: 'Prikaži detalje',
      hideDetails: 'Sakrij detalje',
      eventId: 'Događaj br. {{id}}',
      memoryRef: 'Memorija',
      memoryGone: 'Memorija je izbrisana',
      detailsLabel: 'Detalji',
      timeLabel: 'Vrijeme',
      actions: {
        created: 'Memorija stvorena',
        updated: 'Memorija uređena',
        verified: 'Memorija provjerena',
        flagged: 'Označeno kao netočno',
        deleted: 'Memorija izbrisana',
        paused: 'Spremanje memorije pauzirano',
        resumed: 'Spremanje memorije nastavljeno',
      },
      refresh: 'Osvježi',
    },
  },
};

const de = {
  privacy: {
    title: 'Datenschutz',
    categories: { work: 'Arbeit', food: 'Essen', location: 'Ort', hobbies: 'Hobbys', travel: 'Reisen', preferences: 'Vorlieben', health: 'Gesundheit' },
    sections: { dashboard: 'Übersicht', forget: 'Erinnerungen verwalten', audit: 'Änderungsprotokoll' },
    sectionsLabel: 'Datenschutzbereiche',
    errors: {
      offline: 'Sie sind offline. Stellen Sie eine Internetverbindung her und versuchen Sie es erneut.',
      timeout: 'Der Server antwortet zu langsam. Bitte erneut versuchen.',
      network: 'Der Server ist nicht erreichbar. Prüfen Sie, ob er läuft, und versuchen Sie es erneut.',
      notFound: 'Diese Erinnerungen existieren nicht mehr. Die Liste wurde aktualisiert.',
      server: 'Auf dem Server ist ein Fehler aufgetreten. Bitte erneut versuchen.',
      generic: 'Etwas ist schiefgelaufen. Bitte erneut versuchen.',
    },
    retry: 'Erneut versuchen',
    loading: 'Wird geladen…',
    dashboard: {
      heading: 'Datenschutz-Übersicht',
      intro: 'Sehen Sie, was sich der Assistent über Sie merkt, und entscheiden Sie, was er behalten darf.',
      total: 'Gespeicherte Erinnerungen',
      facts: 'Bestätigte Fakten',
      inferences: 'KI-Schlussfolgerungen',
      lastActivity: 'Letzte Aktivität',
      noActivity: 'Noch keine Aktivität',
      permissions: 'Speicherberechtigungen',
      pauseLabel: 'Speichern von Erinnerungen pausieren',
      pauseHelp: 'Während der Pause wird nichts Neues gespeichert. Vorhandene Erinnerungen bleiben, bis Sie sie löschen.',
      statusOn: 'Speichern von Erinnerungen ist aktiv',
      statusPaused: 'Speichern von Erinnerungen ist pausiert',
      savedPaused: 'Speichern von Erinnerungen pausiert',
      savedResumed: 'Speichern von Erinnerungen fortgesetzt',
      manageLink: 'Erinnerungen verwalten und löschen',
      auditLink: 'Änderungsprotokoll anzeigen',
    },
    forget: {
      heading: 'Gezieltes Vergessen',
      intro: 'Wählen Sie die Erinnerungen aus, die der Assistent vergessen soll.',
      selectAll: 'Alle auswählen',
      selectedCount_one: '{{count}} Erinnerung ausgewählt',
      selectedCount_other: '{{count}} Erinnerungen ausgewählt',
      deleteSelected: 'Auswahl löschen',
      clear: 'Auswahl aufheben',
      typeFact: 'Fakt',
      typeInference: 'Schlussfolgerung',
      confidence: 'Konfidenz {{value}}',
      emptyTitle: 'Keine Erinnerungen vorhanden',
      emptyText: 'Der Assistent merkt sich derzeit nichts über Sie.',
      listLabel: 'Ihre Erinnerungen',
    },
    modal: {
      title_one: '{{count}} Erinnerung löschen?',
      title_other: '{{count}} Erinnerungen löschen?',
      body: 'Der Assistent wird Folgendes vergessen. Dies kann nicht rückgängig gemacht werden.',
      more_one: '…und {{count}} weitere',
      more_other: '…und {{count}} weitere',
      cancel: 'Abbrechen',
      confirm: 'Endgültig löschen',
      deleting: 'Wird gelöscht…',
    },
    result: {
      success_one: '{{count}} Erinnerung gelöscht',
      success_other: '{{count}} Erinnerungen gelöscht',
      failedTitle: 'Löschen fehlgeschlagen',
      dismiss: 'Meldung schließen',
    },
    audit: {
      heading: 'Änderungsprotokoll',
      intro: 'Jede Änderung an Ihren Erinnerungen wird hier festgehalten, die neueste zuerst.',
      emptyTitle: 'Noch keine Ereignisse',
      emptyText: 'Wenn Erinnerungen erstellt, bearbeitet oder gelöscht werden, erscheinen die Ereignisse hier.',
      showDetails: 'Details anzeigen',
      hideDetails: 'Details ausblenden',
      eventId: 'Ereignis Nr. {{id}}',
      memoryRef: 'Erinnerung',
      memoryGone: 'Erinnerung wurde gelöscht',
      detailsLabel: 'Details',
      timeLabel: 'Zeit',
      actions: {
        created: 'Erinnerung erstellt',
        updated: 'Erinnerung bearbeitet',
        verified: 'Erinnerung bestätigt',
        flagged: 'Als falsch markiert',
        deleted: 'Erinnerung gelöscht',
        paused: 'Speichern pausiert',
        resumed: 'Speichern fortgesetzt',
      },
      refresh: 'Aktualisieren',
    },
  },
};

i18n.addResourceBundle('en', 'translation', en, true, false);
i18n.addResourceBundle('hr', 'translation', hr, true, false);
i18n.addResourceBundle('de', 'translation', de, true, false);

export const errorKey = (code) =>
  ['offline', 'timeout', 'network', 'notFound', 'server'].includes(code) ? `privacy.errors.${code}` : 'privacy.errors.generic';

export function formatDateTime(utc, locale) {
  if (!utc) return '';
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(utc));
}

export function formatRelative(utc, locale, now = Date.now()) {
  if (!utc) return '';
  const seconds = Math.round((new Date(utc).getTime() - now) / 1000);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit);
  }
  return rtf.format(seconds, 'second');
}

export function formatConfidence(score, locale) {
  const value = Number(score ?? 1);
  const fraction = value > 1 ? value / 100 : value;
  return new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 0 }).format(fraction);
}
