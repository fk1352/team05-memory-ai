# AI Memory Manager — Team 05

ISTE-260 Designing the User Experience · Deliverable 2 · RIT Croatia

AI Memory Manager shows people what an AI assistant remembers about them, separating verified **facts** from AI **inferences** and explaining each inference with a confidence score and the reason behind it. Users can browse memories on a visual map, search and edit them, capture new ones from text (enriched with Wikipedia context), pause memory saving, selectively delete memories and see every change in an audit log. It implements our team topic **Memory AI (AI Memory Manager)** and works in English, Croatian and German.

## Team

| Name | GitHub | Feature area (Deliverable 1) | Main responsibility in the build |
|---|---|---|---|
| Faris Karić | [fk1352](https://github.com/fk1352) | Visual Memory Map, Search & Filter, Edit | React/Vite scaffold, i18n setup, GET/PUT /api/memories |
| Yusif Bakirli | [yb7932](https://github.com/yb7932) | Privacy Dashboard, Selective Forgetting, Audit Log | SQLite schema + seed, DELETE / audit / settings endpoints, privacy screens, DB documentation |
| Tyra Vladić | [tv6124](https://github.com/tv6124) | App shell & navigation, Memory Capture | App shell + locale switcher, POST /api/memories, Wikipedia enrichment, accessibility check |

## Technology stack

| Layer | Technology | Version |
|---|---|---|
| Runtime | Node.js | 20 or newer (tested on 22) |
| Frontend | React + Vite | React 19, Vite 8 |
| i18n | i18next + react-i18next, browser `Intl` APIs | i18next 27, react-i18next 18 |
| Backend | Express | 5 |
| Database | SQLite through the `sqlite3` npm package | sqlite3 6.0.1 (SQLite 3.52) |
| External API | Wikipedia REST API (page summary) | no key needed |
| Tests | Node.js built-in test runner (`node --test`) | — |

Prerequisites: **Node.js 20+** and **npm** (comes with Node.js). Nothing else needs to be installed — the database is a file that the server creates itself.

## Setup and run

You need **two terminals**: one for the server, one for the client.

### 1. Get the code

```bash
git clone https://github.com/fk1352/team05-memory-ai.git
cd team05-memory-ai
```

### 2. Server (terminal 1)

```bash
cd server
npm install
cp .env.example .env        # Windows (cmd): copy .env.example .env
node index.js
```

You should see `Server is running on port 5000` and, on the first start, `Seeded database successfully.`

### 3. Client (terminal 2)

```bash
cd client
npm install
cp ../.env.example .env.local   # Windows (cmd): copy ..\.env.example .env.local
npm run dev
```

Open **http://localhost:5173**. Vite forwards every `/api` request to the server on port 5000.

### Environment variables

| File | Variable | Default | Meaning |
|---|---|---|---|
| `server/.env` | `PORT` | `5000` | Port of the Express API |
| `server/.env` | `DB_PATH` | `server/db/memory_ai.sqlite` | Where the SQLite file is stored (leave empty for the default) |
| `client/.env.local` | `VITE_DEMO_AUTH` | `true` | Enables the demo account on the sign-in page (`client/src/context/demoAuth.js`) |

No secrets are needed. Real `.env` files are ignored by git; only the `.env.example` files are committed.

## Database

- **Schema:** `server/db/schema.sql` — 3 related tables: `users` → `memories` → `audit_logs` (ERD in Part B, section 4.2).
- **Seed data:** `server/db/seed.sql` — 3 fictional users, 10 memories (Croatian, German and Arabic test strings) and 9 audit events.
- **Creation and migrations:** the server runs `schema.sql` on every start. It uses `CREATE TABLE IF NOT EXISTS`, so a new clone gets a fresh database and an existing database is never wiped.
- **Seeding:** automatic when the `memories` table is empty.
- **Reset to the demo data:** stop the server, delete `server/db/memory_ai.sqlite`, start the server again.
- **Inspect the data (optional, needs the sqlite3 CLI):**
  ```bash
  sqlite3 server/db/memory_ai.sqlite "SELECT id, statement, memory_type FROM memories;"
  ```

All timestamps are stored in UTC (`2026-10-20T08:14:00Z`) and converted to the user's time zone in the browser.

## API overview

| Method | Endpoint | Purpose | Audit entry |
|---|---|---|---|
| GET | `/api/memories` | List memories (filters: `category`, `type`, `minConfidence`, `q`) | — |
| POST | `/api/memories` | Create a memory (refused with 403 while memory saving is paused) | `created` |
| PUT | `/api/memories/:id` | Edit / verify / flag a memory | `updated` |
| DELETE | `/api/memories/:id` | Delete one memory | `deleted` |
| DELETE | `/api/memories` | Delete several memories, body `{ "ids": [1, 2] }` | `deleted` (one per memory) |
| GET | `/api/audit-logs?limit=50` | History, newest first | — |
| GET | `/api/users/settings?user_id=1` | Read pause switch and language | — |
| PATCH | `/api/users/settings` | Change pause switch / language | `paused` / `resumed` |
| GET | `/api/enrich?term=Zagreb&lang=hr` | Wikipedia summary for an entity | — |

Errors are returned as short codes (`{ "error": "notFound" }`), which the client translates — no English error text reaches the interface from the server.

## External API

We use the **Wikipedia REST API** (`https://{lang}.wikipedia.org/api/rest_v1/page/summary/{title}`) to add context to entities a user types on the Input screen. It needs **no API key**. The call is made from our server (`server/services/wikipedia.js`), uses a timeout, caches results, and returns clear error codes for timeout, rate limit, upstream failure and not-found. Every summary is shown with the line “Source: Wikipedia (language)”, as Wikipedia's CC BY-SA licence requires.

## Tests

```bash
cd server
node --test
```

- `test/audit-crud.test.js` starts the real server on a temporary database and checks that **create, update and delete each write to `audit_logs`**, that pausing writes `paused`/`resumed`, that Croatian/German/Arabic text survives the round trip, and that data **survives a server restart** (requirement F2).
- `test/memories.test.js` and `test/enrich.test.js` cover validation of new memories and the Wikipedia service's failure modes.

## Languages

| Locale | Language | Why |
|---|---|---|
| `en` | English | Source language and fallback |
| `hr` | Croatian | Three plural forms (one / few / other) and diacritics č ć đ š ž |
| `de` | German | Text expansion — long compound words test the layout |

The language switcher is in the top bar; the choice is saved in `localStorage` and the `<html lang>` attribute follows it. Dates, numbers, percentages and relative times are formatted with `Intl.DateTimeFormat`, `Intl.NumberFormat` and `Intl.RelativeTimeFormat`; sorting uses `Intl.Collator`.

### Adding a new language

1. Add the translations for the new code (for example `pl`) to `client/src/i18n.js`, to the bundle in `client/src/privacy/i18n-privacy.js` and to `client/src/locales/<code>/*.json`. Use the plural suffixes that language needs (`_one`, `_few`, `_many`, `_other`).
2. Add the code to the language switcher in `client/src/App.jsx`.
3. Allow it in the database: extend `CHECK (locale_pref IN (...))` in `server/db/schema.sql` and the list in `server/routes/privacy.js`.
4. Check the screens at the narrowest width (320 px) for text that no longer fits.

## Known limitations

- **One demo user.** All screens act for seed user 1. The sign-in page from the app shell exists but is not routed in the current `App.jsx`, and there is no `POST /api/auth/login` yet.
- **Audit log details are stored in English** (for example `User deleted memory: "…"`). The event type is translated, the free-text detail is not.
- **No right-to-left locale.** German was chosen as the third locale; Arabic text is stored and displayed with `dir="auto"`, but the layout is not mirrored.
- **Tested in Chromium-based browsers only** (Chrome, Edge).

### Accessibility issues not fixed yet

- The main navigation and language switcher in the top bar have English-only `aria-label`s.
- The language switcher buttons in the top bar do not expose `aria-pressed`.
- The full results of the ten-minute check are in Part B, section 7 of the submission document.

## Third-party code and attribution

React, Vite, i18next / react-i18next, react-router-dom, Express, cors, dotenv, axios and sqlite3 are used under their open-source licences. Encyclopaedic text comes from Wikipedia under CC BY-SA 4.0. AI assistants were used during development; this is declared in Part B, section 12 of our submission document.

## Licence

See [LICENSE](LICENSE).
