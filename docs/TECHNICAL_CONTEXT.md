# Technical Context & Decisions

This document captures key technical decisions made during planning, along with the reasoning behind them. Refer to this when making implementation choices to maintain consistency.

---

## Technology Stack

### Frontend
- **React** (via Vite or Create React App)
- **Chrome browser** (required for Web MIDI API support)
- No additional frameworks or libraries for MVP

**Why React:**
- More current experience than Svelte
- Large ecosystem and documentation
- Simple state management sufficient for MVP (useState/useReducer)

**Why Chrome:**
- Safari doesn't support Web MIDI API at all
- Chrome Web MIDI latency tested and acceptable (~imperceptible)
- User running M4 MacBook, Chrome performance is fine

### Backend
- **Express.js** on Node.js
- **SQLite3** for database

**Why Express:**
- Minimal, unopinionated HTTP layer
- Perfect for simple CRUD APIs (3 endpoints)
- Easy SQLite integration
- Mature and well-documented
- Gentlest on-ramp for learning backend basics

**Why SQLite:**
- Local-only application, no need for client-server DB
- SQL provides flexible querying for future analytics
- File-based, easy to backup/export
- No deployment complexity

**Alternatives Considered:**
- **Next.js** - Overkill, don't need SSR or page routing for SPA
- **SvelteKit** - Would require switching frontend to Svelte
- **Fastify** - Performance benefits irrelevant at this scale
- **tRPC** - Too complex for learning backend basics
- **IndexedDB** - Less portable, harder to query than SQL

---

## Architecture Pattern

```
React Frontend (Chrome)
    ↓ HTTP fetch()
Express Backend (localhost:3000)
    ↓ SQL queries
SQLite Database (database.db)
```

**Key Principle:** Clean separation between presentation (React), API layer (Express), and data (SQLite). Each layer can be tested/modified independently.

---

## Data Model Philosophy

> "The database captures what happened and when. Analytics and derived metrics are calculated at query time or in the application layer, not during data collection."

**What this means:**
- Store raw events and timestamps
- Calculate deltas (reaction time, execution time) at query time
- Don't store aggregate statistics in the database (calculate when needed)
- Exception: Store `correct` boolean despite being derivable, for query convenience

**Example:**
- ❌ Don't store: `reaction_time_ms` in attempts table
- ✅ Do store: `prompt_displayed_at`, `root_note_played_at` (raw timestamps)
- ✅ Calculate: `reaction_time = root_note_played_at - prompt_displayed_at` when querying

---

## Domain Model

### Intervals as Semitones
**Decision:** Store intervals as integers (semitones), not names.

**Reasoning:**
- Semitones are mathematical truth; names are syntactic sugar
- Enables calculations and comparisons
- Use `formatters.ts` to display human-readable names in UI

**Example:**
- Database: `interval_semitones: 4`
- Display: `formatters.semitonesToIntervalName(4)` → "Major 3rd"

### MIDI Note Numbers + Derived Names
**Decision:** Store both MIDI numbers (source of truth) and note names (convenience).

**Reasoning:**
- MIDI numbers precise and unambiguous for validation
- Note names human-readable for queries/exports
- Conversion happens once at insert time via `midiToNoteName()`

**Example:**
- Database: `root_note_midi: 60, root_note_name: "C4"`
- Validation uses: `root_note_midi`
- Display uses: `root_note_name`

---

## Validation Logic

### Exact Match Required (MVP)
**Decision:** Played note must exactly match expected MIDI note number.

**Reasoning:**
- Building muscle memory for standard voicings
- No "close enough" tolerance
- No octave-agnostic validation (C4 vs C5 are different)

**Implementation:**
```javascript
const correct = playedNoteMidi === expectedNoteMidi;
```

**Future:** Octave-agnostic mode could be a separate lesson type.

---

## Learning Mechanic: Forced Correction

**Decision:** When user plays incorrect interval, require:
1. Hold root note for 2 seconds
2. Hold correct interval for 2 seconds
3. Then continue to next prompt

**Reasoning:**
- Breaks flow state to force conscious attention
- Prevents rushing through mistakes (bad muscle memory)
- Reinforces correct answer visually + kinesthetically
- Not a "retry" mechanic—it's remediation

**Implementation Notes:**
- Highlight correct keys in UI during correction
- Display interval name during correction
- Don't count correction as additional attempt
- Don't log correction separately (just mark original as incorrect)

---

## Configuration Approach

**Decision:** Use config file or .env for settings, no UI configuration in MVP.

**Rationale:**
- Faster to implement
- Settings rarely change session-to-session
- Can add UI later if needed
- Personal tool, editing config file is acceptable friction

**Config Values:**
- Number of prompts per round (default: 20)
- MIDI note range (default: 48-72, C3-C5)
- Interval range (default: 1-12 semitones)
- Correction hold time (default: 2000ms)

---

## MVP Scope Boundaries

### In Scope
- Single lesson type: intervals (ascending only)
- Random root note + random interval prompts
- MIDI keyboard input via Web MIDI API
- Binary validation (correct/incorrect)
- Forced correction on wrong answers
- Data logging (attempts + rounds)
- Basic UI (keyboard viz, prompt, score, timer)
- Round history display (simple list)

### Out of Scope (Future Features)
- Configuration UI
- User profiles/authentication
- Adaptive difficulty or spaced repetition
- Chord lessons
- Inverse/descending interval lessons
- Advanced analytics dashboard
- Multiple keyboard octave ranges
- Sustain pedal integration

See `FUTURE_FEATURES.md` for full roadmap.

---

## Development Environment

### Running Locally
```bash
# Backend
cd backend && npm run dev

# Frontend  
cd frontend && npm run dev

# Both (with concurrently)
npm run dev
```

### Database Access
```bash
# Query database directly
sqlite3 backend/database.db

# Example query
SELECT * FROM rounds ORDER BY created_at DESC LIMIT 10;
```

### Browser Requirements
- Must use Chrome (Safari doesn't support Web MIDI)
- MIDI keyboard must be connected before loading app
- May need to grant MIDI access permission on first load

---

## Key Implementation Patterns

### Formatters (Display Layer)
Create `formatters.ts` with:
- `midiToNoteName(midiNote: number): string`
- `semitonesToIntervalName(semitones: number): string`  
- `calculateReactionTime(attempt: Attempt): number`
- `calculateExecutionTime(attempt: Attempt): number`
- `calculateTotalTime(attempt: Attempt): number`

**Purpose:** Separate domain logic (numbers) from presentation (strings). Database stores numbers, UI displays formatted strings.

### Timestamps
Store as JavaScript timestamps (milliseconds since epoch):
```javascript
const timestamp = Date.now(); // e.g., 1702234567890
```

Store as REAL in SQLite, convert to DATETIME for readability in queries.

### Note Name Conversion
```javascript
function midiToNoteName(midiNote) {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const octave = Math.floor(midiNote / 12) - 1;
    const noteName = noteNames[midiNote % 12];
    return `${noteName}${octave}`;
}
```

---

## Testing Strategy (MVP)

**Manual testing focus:**
1. Complete 5+ full rounds end-to-end
2. Verify all data logs correctly to database
3. Test correction mechanic thoroughly
4. Test edge cases (quit mid-round, MIDI disconnect)
5. Verify round history displays correctly

**Data validation:**
- Query database directly to inspect structure
- Export sample data to CSV, review manually
- Verify foreign key relationships
- Verify timestamps are reasonable

**No automated tests for MVP.** Once usage is validated, consider adding tests for:
- MIDI event parsing
- Note validation logic
- Database insert operations

---

## Known Limitations & Future Work

### Browser Limitations
- Chrome only (Safari doesn't support Web MIDI)
- MIDI keyboard must be connected before page load
- Page refresh loses current round state

### Data Limitations
- No backup/export UI (manual database file copy)
- No data migration strategy (recreate DB if schema changes)
- Round history unsorted in UI (display only)

### UX Limitations
- No keyboard shortcuts for common actions
- No pause/resume for rounds
- No visual keyboard layout customization
- Correction timing hardcoded (not adjustable in-app)

All of these are acceptable for MVP and can be addressed based on real usage feedback.

---

## When to Deviate from These Decisions

These decisions are based on MVP requirements for a personal practice tool. Consider changing them if:

1. **Real usage** reveals a better approach
2. **Performance** becomes an actual bottleneck (not theoretical)
3. **Learning** uncovers a fundamental misunderstanding
4. **Scope expansion** (e.g., adding chords) requires architectural changes

Always document the reasoning when deviating from established patterns.
