// Rule-based memory extraction (runs in the browser, so the preview updates
// while typing and still works offline). It decides:
//   • category  – from keywords in en / hr / de
//   • type      – "fact" if the user states it about themselves,
//                 "inference" if hedged ("usually", "možda", "meistens") or unclear
//   • entities  – names and topics worth looking up (Zagreb, Barcelona, coffee)
// It returns translation KEYS for the explanation, never English text.

export const CATEGORIES = ['work', 'food', 'location', 'hobbies', 'travel', 'preferences', 'health'];
export const MAX_STATEMENT = 280;

// Lowercase, diacritics kept (č ≠ c matters in Croatian words).
const CATEGORY_WORDS = {
  work: ['meeting', 'meetings', 'work', 'job', 'office', 'boss', 'colleague', 'deadline', 'project',
    'sastanak', 'sastanke', 'sastanci', 'posao', 'poslu', 'ured', 'uredu', 'šef', 'kolega', 'projekt',
    'besprechung', 'besprechungen', 'meeting', 'arbeit', 'büro', 'chef', 'kollege', 'termin', 'termine'],
  food: ['coffee', 'tea', 'eat', 'food', 'breakfast', 'lunch', 'dinner', 'pizza', 'vegetarian', 'vegan', 'cake',
    'kava', 'kavu', 'kave', 'čaj', 'jesti', 'jedem', 'hrana', 'hranu', 'doručak', 'ručak', 'večera', 'ćevapi', 'štrukli', 'kolač',
    'kaffee', 'tee', 'essen', 'frühstück', 'mittagessen', 'abendessen', 'kuchen'],
  location: ['live', 'lives', 'home', 'address', 'neighbourhood', 'neighborhood', 'district', 'city',
    'živim', 'stanujem', 'doma', 'kvart', 'grad', 'gradu',
    'wohne', 'lebe', 'zuhause', 'stadtteil', 'stadt'],
  hobbies: ['hobby', 'learn', 'learning', 'play', 'playing', 'guitar', 'piano', 'football', 'read', 'reading', 'running', 'yoga',
    'hobi', 'učim', 'sviram', 'igram', 'nogomet', 'čitam', 'trčim',
    'lerne', 'spiele', 'gitarre', 'klavier', 'fußball', 'lese', 'laufe'],
  travel: ['travel', 'trip', 'flight', 'fly', 'train', 'holiday', 'vacation', 'visit', 'visiting',
    'putujem', 'putovanje', 'let', 'vlak', 'vlakom', 'godišnji', 'odmor', 'posjetiti',
    'reise', 'reisen', 'flug', 'fliege', 'zug', 'urlaub', 'besuchen'],
  preferences: ['prefer', 'prefers', 'like', 'likes', 'love', 'favourite', 'favorite', 'hate', 'dislike',
    'volim', 'više volim', 'draže', 'omiljen', 'omiljena', 'omiljeno', 'mrzim',
    'mag', 'liebe', 'lieber', 'bevorzuge', 'lieblings', 'hasse'],
  health: ['allergic', 'allergy', 'caffeine', 'sleep', 'doctor', 'medicine', 'gym',
    'alergičan', 'alergična', 'alergija', 'kofein', 'spavam', 'liječnik', 'teretana',
    'allergisch', 'allergie', 'koffein', 'schlafe', 'arzt', 'fitnessstudio'],
};

// Order matters when several match: the more specific category wins.
const CATEGORY_PRIORITY = ['health', 'work', 'travel', 'food', 'location', 'hobbies', 'preferences'];

const FIRST_PERSON = ['i', "i'm", 'im', "i've", 'my', 'me', 'mine',
  'ja', 'imam', 'volim', 'živim', 'radim', 'idem', 'pijem', 'jedem', 'moj', 'moja', 'moje', 'mi', 'sam',
  'ich', 'mein', 'meine', 'meinen', 'mir', 'mich', 'habe', 'bin'];

// Hedges turn a statement into a guess. Weight = how unsure it sounds.
const HEDGES = {
  maybe: 0.55, perhaps: 0.55, might: 0.6, possibly: 0.55, probably: 0.75, think: 0.7, guess: 0.6,
  usually: 0.8, often: 0.75, sometimes: 0.6, mostly: 0.8, tend: 0.75,
  možda: 0.55, vjerojatno: 0.75, mislim: 0.7, obično: 0.8, često: 0.75, ponekad: 0.6, uglavnom: 0.8,
  vielleicht: 0.55, wahrscheinlich: 0.75, glaube: 0.7, meistens: 0.8, oft: 0.75, manchmal: 0.6, normalerweise: 0.8,
};

// Lowercase topics that are worth an encyclopedia lookup even without a capital letter.
const TOPIC_WORDS = ['coffee', 'tea', 'pizza', 'yoga', 'guitar', 'piano', 'football', 'kava', 'kavu', 'kave', 'čaj', 'ćevapi',
  'štrukli', 'nogomet', 'kaffee', 'tee', 'gitarre', 'klavier', 'fußball'];

const STOP_CAPITALS = new Set(['I', 'Ich', 'Ja', 'The', 'A', 'An', 'My', 'Mein', 'Meine', 'Moj', 'Moja', 'Moje',
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
  'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag']);

// German capitalises every noun. Skip a capitalised word when it follows an
// article or is everyday vocabulary, so "im Sommer" is not taken for a name.
const GERMAN_DETERMINERS = new Set(['der', 'die', 'das', 'den', 'dem', 'des', 'ein', 'eine', 'einen', 'einem', 'einer',
  'im', 'am', 'beim', 'zum', 'zur', 'vom', 'jeden', 'jede', 'jedem', 'mein', 'meine', 'meinen', 'meinem', 'kein', 'keine']);
const COMMON_NOUNS = new Set(['sommer', 'winter', 'frühling', 'herbst', 'morgen', 'abend', 'nacht', 'woche', 'wochenende',
  'jahr', 'monat', 'tag', 'uhr', 'stunde', 'zeit', 'freund', 'freundin', 'familie', 'schwester', 'bruder', 'mutter', 'vater']);
const ALL_CATEGORY_WORDS = new Set(Object.values(CATEGORY_WORDS).flat());

const WORD_RE = /[\p{L}\p{M}'’-]+/gu;

function words(text) {
  return (text.match(WORD_RE) ?? []).map((w) => w.replace(/’/g, "'"));
}

function findEntities(text) {
  const found = [];
  const seen = new Set();
  const add = (name) => {
    const key = name.toLocaleLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      found.push(name);
    }
  };
  // Runs of capitalised words not at the very start: "New York", "Zagreb", "Barcelona"
  const tokens = words(text);
  let run = [];
  tokens.forEach((token, i) => {
    const lower = token.toLocaleLowerCase();
    const previous = tokens[i - 1]?.toLocaleLowerCase();
    const capital =
      /^\p{Lu}/u.test(token) &&
      !STOP_CAPITALS.has(token) &&
      !ALL_CATEGORY_WORDS.has(lower) &&
      !COMMON_NOUNS.has(lower) &&
      !(previous && GERMAN_DETERMINERS.has(previous) && run.length === 0);
    // German capitalises every noun, so skip the first word and lone 1–2 letter tokens.
    if (capital && i > 0 && token.length > 2) run.push(token);
    else {
      if (run.length) add(run.join(' '));
      run = [];
    }
  });
  if (run.length) add(run.join(' '));
  for (const token of tokens) {
    const lower = token.toLocaleLowerCase();
    if (TOPIC_WORDS.includes(lower)) add(lower);
  }
  return found.slice(0, 5);
}

function normaliseStatement(text) {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean) return '';
  const capped = clean.charAt(0).toLocaleUpperCase() + clean.slice(1);
  return capped.length > MAX_STATEMENT ? capped.slice(0, MAX_STATEMENT).trimEnd() : capped;
}

/**
 * @returns {null | {
 *   statement: string, category: string, memory_type: 'fact'|'inference',
 *   confidence_score: number, entities: string[],
 *   reasons: { key: string, values?: object }[]
 * }}
 */
export function extractMemory(text) {
  const statement = normaliseStatement(text ?? '');
  if (statement.length < 3) return null;

  const lower = statement.toLocaleLowerCase();
  const tokens = words(lower);
  const reasons = [];

  // Category
  let category = 'preferences';
  let categoryWord = null;
  for (const cat of CATEGORY_PRIORITY) {
    const hit = CATEGORY_WORDS[cat].find((w) => (w.includes(' ') ? lower.includes(w) : tokens.includes(w)));
    if (hit) {
      category = cat;
      categoryWord = hit;
      break;
    }
  }
  reasons.push(categoryWord ? { key: 'capture.reason.category', values: { word: categoryWord } } : { key: 'capture.reason.categoryDefault' });

  // Fact or inference
  const hedge = tokens.find((t) => t in HEDGES);
  const firstPerson = tokens.some((t) => FIRST_PERSON.includes(t));
  let memoryType = 'fact';
  let confidence = 1;
  if (hedge) {
    memoryType = 'inference';
    confidence = HEDGES[hedge];
    reasons.push({ key: 'capture.reason.hedge', values: { word: hedge } });
  } else if (firstPerson) {
    reasons.push({ key: 'capture.reason.firstPerson' });
  } else {
    memoryType = 'inference';
    confidence = 0.6;
    reasons.push({ key: 'capture.reason.noFirstPerson' });
  }

  return {
    statement,
    category,
    memory_type: memoryType,
    confidence_score: confidence,
    entities: findEntities(statement),
    reasons,
  };
}
