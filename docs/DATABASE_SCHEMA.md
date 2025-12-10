# Database Schema

## Design Philosophy

**Core Principle:** The database captures what happened and when. Analytics and derived metrics are calculated at query time or in the application layer, not during data collection.

**Exception:** The `correct` boolean is stored despite being derivable (comparison of expected vs played notes) because it's fundamental to every query and provides massive query simplification.

---

## Schema

### Attempts Table

Records each individual interval prompt and response during practice.

```sql
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
```

### Rounds Table

Records summary information for each practice session.

```sql
CREATE TABLE rounds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lesson_type TEXT NOT NULL,              -- e.g., "intervals_ascending", "intervals_descending"
    total_attempts INTEGER NOT NULL,
    correct_count INTEGER NOT NULL,
    started_at REAL NOT NULL,
    completed_at REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Indexes

```sql
CREATE INDEX idx_attempts_round ON attempts(round_id);
CREATE INDEX idx_attempts_interval ON attempts(interval_semitones);
CREATE INDEX idx_attempts_correct ON attempts(correct);
CREATE INDEX idx_attempts_created ON attempts(created_at);
```

---

## Design Decisions & Reasoning

### Storage Format: Semitones Over Interval Names

**Decision:** Store `interval_semitones` as integers (e.g., 4), not names (e.g., "Major 3rd").

**Reasoning:** 
- Semitones are the mathematical truth; interval names are syntactic sugar for communication
- Enables mathematical queries and comparisons
- Use `formatters.ts` to display human-readable names in the UI
- Simpler validation and calculations

### MIDI Note Numbers + Derived Names

**Decision:** Store both `root_note_midi` and `root_note_name`.

**Reasoning:**
- MIDI numbers are source of truth for validation logic (precise, unambiguous)
- Note names provide human readability when querying or exporting data
- Small storage cost for significant usability gain
- Conversion happens once at insert time via `midiToNoteName()` function

### Expected vs Played Notes

**Decision:** Store both `expected_note_midi` and `played_note_midi` separately, plus `correct` boolean.

**Reasoning:**
- Boolean enables fast filtering ("show me all incorrect attempts")
- Storing both notes enables deep analysis:
  - "User consistently overshoots by 1 semitone"
  - "User confuses Major 3rd with Minor 3rd"
  - "User is accurate but displaced by an octave"
- Minimal storage cost, massive analytical value

### Raw Timestamps, Not Derived Metrics

**Decision:** Store multiple timestamps, calculate time deltas at query time.

**Reasoning:**
- Follows core principle: capture events, derive meaning later
- Timestamps are immutable facts; deltas are interpretations
- Enables flexible analytics as requirements evolve:
  - Reaction time: `root_note_played_at - prompt_displayed_at`
  - Execution time: `interval_note_played_at - root_note_played_at`
  - Total time: `attempt_completed_at - prompt_displayed_at`
- If analytics requirements change, historical data supports new calculations

### No Corrections Table

**Decision:** Don't log forced correction events separately.

**Reasoning:**
- Correction mechanic is remediation, not practice data
- Purpose is to force attention and break flow state, not generate metrics
- If attempt is marked incorrect, correction always occurred (or user quit)
- Reduces schema complexity for no immediate analytical benefit

### Lesson Type in Rounds, Not Attempts

**Decision:** Store `lesson_type` at round level, not per-attempt.

**Reasoning:**
- A round has one lesson type (intervals ascending, chords, etc.)
- Reduces redundancy (no need to repeat lesson type on every attempt row)
- Round-level grouping makes more sense for session analysis

---

## Future Compatibility

### Supporting Inverse/Descending Intervals

The schema naturally supports lessons where user finds the root note given a target note and interval:

**Ascending Example:**
- Prompt: "C4 → Major 3rd" 
- Data: `root_note_midi: 60, interval_semitones: 4, expected_note_midi: 64`

**Inverse Example:**
- Prompt: "E4 ← Major 3rd (find the root)"
- Data: `root_note_midi: 64, interval_semitones: -4, expected_note_midi: 60`

Same schema, different `lesson_type`, different prompt generation logic.

### Supporting Chord Lessons

When expanding to chord lessons, the schema may need extension:

- Chord lessons require storing multiple expected notes (e.g., C-E-G for C Major)
- Options: JSON array in `expected_note_midi`, or separate `chord_notes` table
- Core timing and correctness structure remains identical

This is intentionally out of scope for MVP but doesn't require schema redesign—just extension.

---

## Validation Logic

### Exact Match Required (MVP)

For interval lessons, validation is strict:

```javascript
const correct = playedNoteMidi === expectedNoteMidi;
```

No octave-agnostic comparison, no "close enough" tolerance. User must play exact MIDI note for correct muscle memory training.

### Keyboard Range Considerations

For inverse lessons (future), prompt generation must respect keyboard limits:

- Standard 88-key keyboard: MIDI 21 (A0) to MIDI 108 (C8)
- When prompting "find the root X semitones below this note," ensure result stays within range
- Not a schema issue—handled in application logic

---

## Query Examples

### Get all attempts for a specific interval

```sql
SELECT * FROM attempts 
WHERE interval_semitones = 4 
ORDER BY created_at DESC;
```

### Calculate average reaction time for last 10 rounds

```sql
SELECT 
    AVG(root_note_played_at - prompt_displayed_at) as avg_reaction_ms
FROM attempts
WHERE round_id IN (
    SELECT id FROM rounds 
    ORDER BY created_at DESC 
    LIMIT 10
);
```

### Find most commonly failed intervals

```sql
SELECT 
    interval_semitones,
    COUNT(*) as fail_count
FROM attempts
WHERE correct = false
GROUP BY interval_semitones
ORDER BY fail_count DESC;
```

### Accuracy trend over time

```sql
SELECT 
    DATE(created_at) as date,
    SUM(CASE WHEN correct THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as accuracy_percent
FROM attempts
GROUP BY DATE(created_at)
ORDER BY date;
```
