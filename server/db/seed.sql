PRAGMA foreign_keys = ON;

INSERT INTO users (id, full_name, locale_pref, memory_paused) VALUES
  (1, 'Ana Šimić',        'hr', 0),
  (2, 'Jonas Müller',     'de', 0),
  (3, 'Layla Haddad (ليلى حداد)', 'en', 1);

INSERT INTO memories
  (id, user_id, category, statement, memory_type,
   confidence_score, source_info, rationale, verified_at_utc)
VALUES
  (1, 1, 'work', 'Work schedule: M-F 9am-5pm', 'fact',
      1.00, 'Chat, 2026-10-20',
      'User stated this directly.', '2026-10-20T08:14:00Z'),

  (2, 1, 'work', 'Probably likes morning meetings', 'inference',
      0.82, 'Calendar pattern, last 30 days',
      'Accepted 9 of 11 meeting invites before 11:00; declined 4 of 5 after 15:00.',
      NULL),

  (3, 1, 'food', 'Omiljena hrana: Ćevapi i štrukli', 'fact',
      1.00, 'Chat, 2026-10-22',
      'Korisnica je to izravno navela.', '2026-10-22T18:40:00Z'),

  (4, 1, 'location', 'Lives in Zagreb, Trešnjevka district', 'fact',
      1.00, 'Profile settings',
      'Entered in profile by the user.', '2026-10-19T10:00:00Z'),

  (5, 1, 'hobbies', 'Might be learning German', 'inference',
      0.64, 'Chat topics, last 14 days',
      'Asked for 6 German translations and mentioned a Goethe course once.',
      NULL),

  (6, 1, 'travel', 'Prefers trains over flights for trips under 500 km', 'inference',
      0.71, 'Trip planning chats',
      'Chose the train option in 3 of 4 planned trips.',
      NULL),

  (7, 2, 'work', 'Arbeitet als Softwareentwickler in München', 'fact',
      1.00, 'Chat, 2026-10-25',
      'Nutzer hat dies direkt angegeben.', '2026-10-25T07:30:00Z'),

  (8, 2, 'preferences', 'Bevorzugt Straßenbahnverbindungen und Fußgängerzonen', 'inference',
      0.58, 'Route searches',
      'Searched tram routes 12 times; never searched parking.',
      NULL),

  (9, 3, 'food', 'تفضل القهوة العربية في الصباح', 'fact',
      1.00, 'Chat, 2026-10-27',
      'User stated this directly.', '2026-10-27T06:55:00Z'),

  (10, 3, 'health', 'Probably avoids caffeine after 6pm', 'inference',
      0.77, 'Evening order history',
      'Ordered decaf in 5 of 6 evening café visits.',
      NULL);

INSERT INTO audit_logs (memory_id, action_type, details, created_at_utc) VALUES
  (1,    'created',  'Saved from chat message',                         '2026-10-20T08:14:00Z'),
  (1,    'verified', 'User confirmed the work schedule',                '2026-10-20T08:15:30Z'),
  (2,    'created',  'Inferred from calendar pattern (82%)',            '2026-10-21T09:00:00Z'),
  (3,    'created',  'Spremljeno iz razgovora',                         '2026-10-22T18:40:00Z'),
  (5,    'flagged',  'User flagged as incorrect: "only on holiday"',    '2026-10-24T17:12:00Z'),
  (5,    'updated',  'Confidence lowered 0.80 → 0.64 after flag',       '2026-10-24T17:12:05Z'),
  (7,    'created',  'Aus dem Chat gespeichert',                        '2026-10-25T07:30:00Z'),
  (NULL, 'deleted',  'User deleted memory: "Home address"',             '2026-10-26T20:03:00Z'),
  (NULL, 'paused',   'User 3 paused memory saving',                     '2026-10-28T12:00:00Z');
