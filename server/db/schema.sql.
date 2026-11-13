PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS memories;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name      TEXT    NOT NULL,
    locale_pref    TEXT    NOT NULL DEFAULT 'en'
                           CHECK (locale_pref IN ('en', 'hr', 'de')),
    memory_paused  INTEGER NOT NULL DEFAULT 0
                           CHECK (memory_paused IN (0, 1))
);

CREATE TABLE memories (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id          INTEGER NOT NULL
                             REFERENCES users(id) ON DELETE CASCADE,
    category         TEXT    NOT NULL,
    statement        TEXT    NOT NULL,
    memory_type      TEXT    NOT NULL
                             CHECK (memory_type IN ('fact', 'inference')),
    confidence_score REAL    NOT NULL DEFAULT 1.0
                             CHECK (confidence_score BETWEEN 0 AND 1),
    source_info      TEXT,
    rationale        TEXT,
    verified_at_utc  TEXT
);

CREATE INDEX idx_memories_user_category ON memories (user_id, category);

CREATE TABLE audit_logs (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    memory_id       INTEGER REFERENCES memories(id) ON DELETE SET NULL,
    action_type     TEXT    NOT NULL
                            CHECK (action_type IN
                              ('created', 'updated', 'verified',
                               'flagged', 'deleted', 'paused', 'resumed')),
    details         TEXT,
    created_at_utc  TEXT    NOT NULL
                            DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE INDEX idx_audit_created ON audit_logs (created_at_utc DESC);
