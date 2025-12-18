# Architectural Decision Record (ADR)

This document captures key architectural decisions made during the development of the Jazz Piano Practice Trainer, including context, alternatives considered, and rationale.

---

## ADR-001: Technology Stack Selection

**Date:** 2025-12-11 (Session 1)

**Status:** Accepted

**Context:**
Need to choose frontend framework, backend server, and database for local-only practice tool.

**Decision:**
- **Frontend:** React + TypeScript (via Vite)
- **Backend:** Express.js
- **Database:** SQLite

**Rationale:**

**React:**
- More current experience than Svelte
- Large ecosystem and documentation
- Simple state management sufficient for MVP (useState/useReducer)

**TypeScript:**
- Type safety for MIDI events, API contracts, state machine
- Better IDE support and autocomplete
- Catches errors at compile time

**Express:**
- Minimal, unopinionated HTTP layer
- Perfect for simple CRUD APIs (3 endpoints)
- Easy SQLite integration
- Mature and well-documented
- Gentlest on-ramp for learning backend basics

**SQLite:**
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

**Consequences:**
- Must use Chrome (Safari lacks Web MIDI API support)
- SQLite schema changes require manual migration or DB recreation
- Express requires more manual routing than opinionated frameworks

---

## ADR-002: Browser Target - Chrome Only

**Date:** 2025-12-11 (Session 1)

**Status:** Accepted

**Context:**
Web MIDI API required for keyboard input. Safari does not support Web MIDI API.

**Decision:**
Target Chrome only. Display error if Web MIDI API unavailable.

**Rationale:**
- Web MIDI API is critical for the application
- Safari has no support (not on roadmap)
- Chrome performance on M4 MacBook is excellent
- Personal tool, single-user target acceptable

**Alternatives Considered:**
- **Electron app** - Unnecessary complexity for MVP
- **Native macOS app** - Steeper learning curve, more time investment
- **Polyfill/alternative** - No viable alternative for MIDI input

**Consequences:**
- Users must use Chrome
- Clear error message if Web MIDI unavailable: "Web MIDI API not supported. Please use Chrome browser."

---

## ADR-003: Data Model Philosophy

**Date:** 2025-12-11 (Session 2)

**Status:** Accepted

**Context:**
How to structure database schema and what to store vs derive.

**Decision:**
"The database captures what happened and when. Analytics and derived metrics are calculated at query time, not during data collection."

**Rationale:**
- **Store raw events:** Timestamps, MIDI numbers, intervals (semitones)
- **Derive at query time:** Reaction time, execution time, note names (for display)
- **Exception:** Store `correct` boolean and note names despite being derivable, for query convenience

**Examples:**
- ❌ Don't store: `reaction_time_ms` in attempts table
- ✅ Do store: `prompt_displayed_at`, `root_note_played_at` (raw timestamps)
- ✅ Calculate: `reaction_time = root_note_played_at - prompt_displayed_at` when querying

**Consequences:**
- Database stores truth (MIDI numbers, timestamps)
- Formatters handle display (note names, interval names)
- Flexibility for future analytics queries
- Slightly more complex query logic

---

## ADR-004: Round Completion Flow (Option B)

**Date:** 2025-12-11 (Session 3)

**Status:** Accepted

**Context:**
How to handle round ID when logging attempts. Need round ID before logging attempts, but round doesn't exist until complete.

**Decision:**
**Option B - Create round at completion, queue attempts in memory**

Workflow:
1. User plays round → data queued in frontend (`attempts[]` with `roundId: -1`)
2. Round completes → calculate totals from queued attempts
3. `createRound()` with accurate totals → get `{id: 123}`
4. Batch `logAttempt()` calls with `roundId: 123`

**Alternatives Considered:**

**Option A - Create empty round, update later:**
- Would need UPDATE endpoint (more backend code)
- Abandoned rounds litter database
- Violates "capture what happened" principle
- Creates temporal inconsistency (round exists before complete)

**Rationale:**
- No placeholder rounds in database
- No UPDATE endpoint needed
- Simpler implementation
- Database only contains completed rounds (no garbage)
- Totals are accurate, not placeholder → real

**Trade-offs Accepted:**
- If user refreshes mid-round, data is lost (acceptable for MVP)
- `-1` sentinel value for `roundId` until round created
- All attempts batched at end (slight delay if network slow)

**Consequences:**
- Clean database (only complete rounds)
- Simpler backend (no UPDATE logic)
- Data loss on refresh (documented limitation)
- Frontend must queue attempts in memory

---

## ADR-005: Error Handling Strategy - Simple Alerts for MVP

**Date:** 2025-12-11 (Session 3)

**Status:** Accepted

**Context:**
How to handle errors in MVP (MIDI errors, API errors, device disconnection).

**Decision:**
Use simple `alert()` dialogs for all error cases. No retry logic, no fancy error UI.

**Rationale:**
- MVP validation priority over polish
- `alert()` is zero-effort, works immediately
- Acceptable UX for personal tool
- Can enhance later based on real usage feedback

**Examples:**
```typescript
if (!navigator.requestMIDIAccess) {
  alert('Web MIDI API not supported. Please use Chrome browser.');
}

catch (err) {
  alert(`Failed to save round: ${err.message}`);
}
```

**Alternatives Considered:**
- **Toast notifications** - Requires library or custom implementation
- **Modal dialogs** - More complex, unnecessary for MVP
- **Inline error messages** - Requires UI state management

**Trade-offs Accepted:**
- Less polished UX
- Blocks interaction until dismissed
- No retry mechanism (user must manually retry)

**Consequences:**
- Fast implementation (no error UI to build)
- Can be replaced with better UX post-MVP
- Explicitly document "no retry logic" as MVP limitation

---

## ADR-006: Correction Mechanic - No Escape Hatch

**Date:** 2025-12-11 (Session 3)

**Status:** Accepted

**Context:**
When user plays incorrect interval, how should correction work?

**Decision:**
**Forced correction - must complete to advance**

Requirements:
1. Hold root note for 2 seconds
2. Hold correct interval note for 2 seconds
3. No skip button, no escape hatch
4. Text feedback: "Hold C4... now hold E4..."

**Rationale:**
- **Pedagogical intent:** Breaks flow state to force conscious attention
- **Prevents rushing:** Stops bad muscle memory formation
- **Reinforces correct answer:** Visual + kinesthetic reinforcement
- **Not a retry mechanism:** It's remediation, not punishment

**Alternatives Considered:**
- **Allow skip:** Rejected - defeats learning purpose
- **Shorter hold time:** 2 seconds chosen as minimum for conscious attention
- **Optional correction:** Rejected - would be ignored by users

**Consequences:**
- Frustrating for users initially (by design)
- May slow down rounds significantly if many mistakes
- Enforces deliberate practice
- No escape valve if user gets stuck (acceptable for MVP)

---

## ADR-007: UI Approach - Text Display Only for MVP

**Date:** 2025-12-11 (Session 3)

**Status:** Accepted

**Context:**
How to display prompts and keyboard state.

**Decision:**
**Text-only prompt display for MVP. No visual keyboard component.**

Display example: "Play C4 → Major 3rd (E4)"

**Rationale:**
- Visual keyboard is nice-to-have, not critical
- Text display sufficient for MVP validation
- Reduces implementation complexity significantly
- Keyboard visualization can be added post-MVP if needed

**Alternatives Considered:**
- **Visual keyboard with highlighted keys:** Deferred to post-MVP
- **Piano roll display:** Overkill for MVP

**Trade-offs Accepted:**
- Less visually engaging
- User must mentally map note names to keyboard
- No visual feedback of keyboard state

**Consequences:**
- Faster MVP implementation
- `KeyboardVisualizer.tsx` removed from Phase 1 scope
- Can add visual keyboard later based on user feedback

---

## ADR-008: State Persistence - No sessionStorage

**Date:** 2025-12-11 (Session 3)

**Status:** Accepted

**Context:**
Should app state persist if user refreshes during a round?

**Decision:**
**No state persistence. Refresh loses progress.**

**Rationale:**
- MVP validation priority
- sessionStorage adds complexity
- Acceptable data loss for personal tool
- Can add later if becomes pain point

**Alternatives Considered:**
- **sessionStorage** - Deferred to post-MVP
- **localStorage** - Overkill for temporary state
- **Backend state** - Unnecessary complexity

**Trade-offs Accepted:**
- Accidental refresh loses round progress
- No recovery mechanism

**Consequences:**
- Simpler implementation (no serialization/deserialization)
- Explicitly document as known limitation
- Can add persistence post-MVP if needed

---

## ADR-009: API Type Convention - snake_case vs camelCase

**Date:** 2025-12-18 (Session 4)

**Status:** Accepted

**Context:**
Should frontend TypeScript use camelCase (JS convention) or snake_case (match backend)?

**Decision:**
**Hybrid approach:**
- **API contract types** (`RoundData`, `AttemptData`, `RoundResponse`): **snake_case** (match backend)
- **Domain types** (`Prompt`, `GameState`, `LessonConfig`): **camelCase** (JS convention)

**Rationale:**
- API types match backend exactly → no conversion errors
- Simpler implementation (no field mapping in `api.ts`)
- Domain types never touch backend → can use JS conventions
- Reduces bug surface area (typos in conversion, forgotten fields)

**Alternatives Considered:**

**Option A - All camelCase:**
- Requires conversion in `api.ts` for every API call
- Error-prone (forgetting to convert a field)
- More boilerplate code

**Example conversion (rejected):**
```typescript
const payload = {
  lesson_type: data.lessonType,
  total_attempts: data.totalAttempts,
  // ... tedious and error-prone
};
```

**Option B - All snake_case:**
- More consistent but violates JS conventions everywhere
- Awkward for domain logic

**Consequences:**
- API types use snake_case (e.g., `attempt.prompt_displayed_at`)
- Domain types use camelCase (e.g., `state.currentPromptIndex`)
- Clear boundary at API layer
- No conversion logic needed in `api.ts`

---

## ADR-010: Prompt Structure - Domain-Only (MIDI Numbers)

**Date:** 2025-12-18 (Session 4)

**Status:** Accepted

**Context:**
Should `Prompt` interface store MIDI numbers only, or include note names for display?

**Decision:**
**Store MIDI numbers only. Use formatters for display.**

```typescript
interface Prompt {
  rootMidi: number;           // e.g., 60
  intervalSemitones: number;  // e.g., 4
  expectedMidi: number;       // e.g., 64
}
```

**Rationale:**
- Follows "MIDI is truth, names are display sugar" principle
- Clean separation: domain logic works with numbers, UI formats strings
- Prompt is a domain concept (generated by game logic), not UI concept
- Formatters (`midiToNoteName()`, `semitonesToIntervalName()`) handle conversion at display time
- Easier to test (pure domain objects)

**Alternatives Considered:**

**Option B - Hybrid (store both MIDI + names):**
```typescript
interface Prompt {
  rootMidi: number;
  rootName: string;         // Derived from rootMidi
  intervalSemitones: number;
  intervalName: string;     // Derived
  expectedMidi: number;
  expectedName: string;     // Derived
}
```

**Rejected because:**
- Mixes domain and display concerns
- Larger objects in memory
- Backend pattern (store both) doesn't apply here - backend stores for query convenience, frontend just displays

**Consequences:**
- Every component displaying prompts calls `midiToNoteName()`
- Slight duplication of formatter calls (negligible)
- Cleaner domain model

---

## ADR-011: Round ID Placeholder Convention

**Date:** 2025-12-18 (Session 4)

**Status:** Accepted

**Context:**
`AttemptData` requires `roundId`, but round doesn't exist until completion. Need placeholder.

**Decision:**
Use **`-1` as sentinel value** for `roundId` until round created.

**Rationale:**
- `-1` is clearly invalid (won't conflict with auto-increment IDs starting at 1)
- Standard sentinel value pattern
- Keeps type as `number` (no need for `number | null`)
- Overwritten with real ID when batch creating attempts

**Alternatives Considered:**
- **`0` placeholder:** Could theoretically conflict if ID starts at 0
- **`null` placeholder:** Requires `roundId?: number` (optional field) - less clear
- **Omit field:** TypeScript errors (required field)

**Consequences:**
- Frontend code uses `-1` temporarily
- Backend never sees `-1` (overwritten before POST)
- Clear convention for "not yet assigned"

---

## ADR-012: GameState Temporal Tracking

**Date:** 2025-12-18 (Session 4)

**Status:** Accepted

**Context:**
How to track timestamps during a prompt before building complete `AttemptData`.

**Decision:**
**Store temporal state in GameState, build immutable AttemptData at interval played.**

```typescript
interface GameState {
  currentPromptDisplayedAt: number | null;
  currentRootPlayedAt: number | null;
  attempts: AttemptData[];  // Immutable once added
}
```

When interval played → build complete `AttemptData` object and push to `attempts[]`.

**Rationale:**
- Clear temporal boundaries (these fields reset each prompt)
- Immutable `attempts` array (never modified after creation)
- Easier to reason about (no partial attempt objects)
- Building complete object marks "end of attempt" event

**Alternatives Considered:**

**Option A - Store in temporary state object:**
```typescript
currentAttempt: {
  promptDisplayedAt: number | null;
  rootNotePlayedAt: number | null;
}
```
Rejected: Unnecessary nesting for two fields.

**Option B - Write partial attempt, update later:**
```typescript
attempts.push({ promptDisplayedAt, rootNotePlayedAt: null, ... });
// Later:
attempts[index].rootNotePlayedAt = timestamp;
```
Rejected: Mutating array harder to reason about.

**Consequences:**
- Two temporal fields in GameState
- Complete `AttemptData` objects built at interval event
- Immutable `attempts` array (easier debugging)

---

## ADR-013: Duration Formatting - No Minute Padding

**Date:** 2025-12-18 (Session 4)

**Status:** Accepted

**Context:**
Should `formatDuration()` pad minutes with leading zeros?

**Decision:**
**No padding on minutes.** Format as `"M:SS"` not `"MM:SS"`.

Examples:
- 65 seconds → `"1:05"` (not `"01:05"`)
- 125 seconds → `"2:05"` (not `"02:05"`)

**Rationale:**
- More compact display
- Standard convention for durations under 10 minutes
- Cleaner visual (no unnecessary zero)

**Alternatives Considered:**
- **Pad minutes:** Fixed width, easier to align in UI

**Trade-offs Accepted:**
- Variable width (e.g., "1:05" vs "10:30")
- Slightly harder to align in grid layouts

**Consequences:**
- `formatDuration()` uses `Math.floor(seconds/60).toString()` (no padding)
- Seconds always padded: `.padStart(2, '0')`

---

## ADR-014: Naming Convention - `calc` Prefix

**Date:** 2025-12-18 (Session 4)

**Status:** Accepted

**Context:**
Function naming consistency for calculation utilities.

**Decision:**
Use **`calc` prefix** (abbreviated) for all calculation functions.

**Rationale:**
- Intentional abbreviation (vs `calculate`)
- Consistency across codebase
- Shorter, cleaner

**Applied to:**
- `calcIntervalTarget()`
- `calcReactionTime()`
- `calcExecutionTime()`

**Alternatives Considered:**
- **`calculate` prefix:** More verbose, less concise
- **Mixed convention:** Inconsistent (some `calc`, some `calculate`)

**Consequences:**
- All calculation functions use `calc` prefix
- Consistent convention throughout utils

---

## Summary Table

| ADR | Decision | Status | Date |
|-----|----------|--------|------|
| ADR-001 | React + TypeScript + Express + SQLite | Accepted | 2025-12-11 |
| ADR-002 | Chrome only (Web MIDI requirement) | Accepted | 2025-12-11 |
| ADR-003 | Store raw events, derive metrics at query time | Accepted | 2025-12-11 |
| ADR-004 | Round completion flow (Option B - queue in memory) | Accepted | 2025-12-11 |
| ADR-005 | Simple alert() dialogs for errors | Accepted | 2025-12-11 |
| ADR-006 | Forced correction mechanic (no escape) | Accepted | 2025-12-11 |
| ADR-007 | Text-only prompt display (no visual keyboard) | Accepted | 2025-12-11 |
| ADR-008 | No state persistence (sessionStorage) | Accepted | 2025-12-11 |
| ADR-009 | snake_case for API types, camelCase for domain | Accepted | 2025-12-18 |
| ADR-010 | Prompt stores MIDI numbers only (domain-only) | Accepted | 2025-12-18 |
| ADR-011 | `-1` placeholder for roundId | Accepted | 2025-12-18 |
| ADR-012 | Temporal tracking in GameState | Accepted | 2025-12-18 |
| ADR-013 | No minute padding in formatDuration() | Accepted | 2025-12-18 |
| ADR-014 | `calc` prefix for calculation functions | Accepted | 2025-12-18 |

---

## Notes on ADR Process

**When to create an ADR:**
- Architectural choices with lasting impact
- Trade-offs between multiple valid approaches
- Decisions that affect multiple parts of the codebase
- Choices that might be questioned or revisited later

**ADR Template:**
1. **Context:** What problem are we solving?
2. **Decision:** What did we choose?
3. **Rationale:** Why did we choose this?
4. **Alternatives Considered:** What else did we evaluate?
5. **Consequences:** What are the trade-offs?

**ADR Lifecycle:**
- **Proposed:** Under discussion
- **Accepted:** Decision made and implemented
- **Deprecated:** Superseded by newer decision
- **Rejected:** Considered but not adopted

---

## Future Decisions to Document

Potential ADRs for future sessions:
- Visual keyboard implementation approach (if/when added)
- Analytics dashboard architecture
- Adaptive difficulty algorithm
- Chord detection strategy
- Multi-user support (if ever needed)
