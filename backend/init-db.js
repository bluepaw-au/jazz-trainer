import Database from 'better-sqlite3';

const db = new Database('database.db');


/* 
 * TABLE: rounds
 * Records summary information for each practice session.
 */
db.exec(`
    CREATE TABLE rounds (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lesson_type TEXT NOT NULL,              -- e.g., "intervals_ascending", "intervals_descending"
        total_attempts INTEGER NOT NULL,
        correct_count INTEGER NOT NULL,         -- No. of correct attempts
        started_at REAL NOT NULL,
        completed_at REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`);

/*
 * TABLE: attempts
 * Records each individual interval prompt and response during practice.
 */
db.exec(`
    CREATE TABLE attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        round_id INTEGER NOT NULL,
        
        -- What was prompted
        root_note_midi INTEGER NOT NULL,        -- Starting point (e.g., 60 for C4)
        root_note_name TEXT NOT NULL,           -- Derived for readability (e.g., "C4")
        interval_semitones INTEGER NOT NULL,    -- Can be positive (ascending) or negative (descending)
        expected_note_midi INTEGER NOT NULL,    -- Calculated destination
        expected_note_name TEXT NOT NULL,       -- Derived for readability (e.g., "E4")
        
        -- What was played
        played_note_midi INTEGER,               -- NULL if abandoned/timeout
        played_note_name TEXT,                  -- Derived from played_note_midi
        
        -- Outcome
        correct BOOLEAN NOT NULL,               -- Stored for query convenience
        
        -- Timeline (raw timestamps, deltas calculated at query time)
        prompt_displayed_at REAL NOT NULL,      -- When interval was displayed
        root_note_played_at REAL,               -- When user played starting note
        interval_note_played_at REAL,           -- When user played interval note
        attempt_completed_at REAL NOT NULL,     -- When attempt finished (correct/incorrect/timeout)
        
        -- Metadata
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (round_id) REFERENCES rounds(id)
    );
`);

/*
 * Indexes to make common queries faster.
 *
 * Example use cases:
 * idx_attempts_round: "give me all attempts for round #5"
 * idx_attempts_interval: "show me all attempts where user played a Major 3rd (4 semitones)"
 * idx_attempts_correct: "show me all incorrect attempts"
 * idx_attempts_created: "show me attempts in the last week" OR "order by most recent"
 */

db.exec(`
    CREATE INDEX idx_attempts_round ON attempts(round_id);
    CREATE INDEX idx_attempts_interval ON attempts(interval_semitones);
    CREATE INDEX idx_attempts_correct ON attempts(correct);
    CREATE INDEX idx_attempts_created ON attempts(created_at);
`);

db.close();
console.log("🎉Database initialized successfully!");