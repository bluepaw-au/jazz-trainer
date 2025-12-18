# Session 4 Log - Frontend Foundation Implementation
**Date:** 2025-12-18
**Duration:** ~2 hours
**Focus:** Phase 1 - Frontend Foundation (Types, Utilities, Config)

---

## Session Goals

Complete Phase 1 (Foundation) of frontend implementation:
1. Finalize TypeScript type definitions
2. Implement MIDI utility functions
3. Implement formatter utilities
4. Create lesson configuration
5. Build test harness to verify implementations

---

## Work Completed

### 1. Type System Design Decisions

**Snake_case vs camelCase Decision:**
- Chose **snake_case** for API contract types (`RoundData`, `AttemptData`, `RoundResponse`) to match backend exactly
- Keeps **camelCase** for domain types (`Prompt`, `GameState`, `LessonConfig`)
- Eliminates error-prone conversion logic in `api.ts`
- Simpler implementation, safer for MVP

**Type Definitions Finalized:**
- `Prompt` - Domain-only (MIDI numbers, no display strings)
- `LessonConfig` - With optional `description` field
- `GameState` - Complete state machine structure with temporal tracking
- `AttemptData` - Uses `roundId: number` with `-1` placeholder convention
- `MIDIEvent` and `MIDIHookReturn` - Web MIDI integration interfaces
- `Range` type extracted for DRY

**Key Insights:**
- Prompt is domain concept (MIDI numbers), formatters handle display (note names)
- `expectedMidi` stored in `Prompt` (calculated once, not derived on every render)
- Temporal state (`currentPromptDisplayedAt`, `currentRootPlayedAt`) tracked in `GameState`
- Complete `AttemptData` objects built when interval played, pushed to immutable array

### 2. MIDI Utilities (`src/utils/midi.ts`)

**Implemented:**
- ✅ `midiToNoteName(midiNote: number): string` - Converts MIDI 60 → "C4"
- ✅ `calcIntervalTarget(rootMidi: number, semitones: number): number` - Simple addition

**Naming Convention:** Chose `calc` prefix for consistency (vs `calculate`)

**Implementation Notes:**
- Octave calculation: `Math.floor(midiNote / 12) - 1`
- Note name indexing: `noteNames[midiNote % 12]`
- Clean, tested implementation

### 3. Display Formatters (`src/utils/formatters.ts`)

**Implemented:**
- ✅ `semitonesToIntervalName(semitones: number): string` - Converts 4 → "Major 3rd"
  - Bonus: Handles compound intervals beyond 12 semitones (e.g., "Minor 2nd (+1 Octave)")
  - Includes pluralization logic for octaves
- ✅ `semitonesToIntervalAbbr(semitones: number): string` - Converts 4 → "M3" (bonus feature)
- ✅ `formatDuration(seconds: number): string` - Converts 125 → "2:05"
  - **Decision:** No padding on minutes (1:05 not 01:05) for compact display
- ✅ `calcReactionTime(attempt: AttemptData): number | null` - Prompt → root note timing
- ✅ `calcExecutionTime(attempt: AttemptData): number | null` - Root → interval timing

**All functions use snake_case for `AttemptData` field access (matches type definitions)**

### 4. Lesson Configuration (`src/config/lessons.ts`)

**Created:**
```typescript
export const LESSON_CONFIGS = {
  intervals_ascending: {
    name: "Ascending Intervals",
    description: "Practice playing intervals ascending from a root note",
    promptsPerRound: 20,
    noteRange: { min: 48, max: 72 },    // C3-C5
    intervalRange: { min: 1, max: 12 }, // Minor 2nd to Octave
    correctionHoldTime: 2000,           // 2 seconds
  }
} as const;

export const DEFAULT_LESSON: LessonType = 'intervals_ascending';
export type LessonType = keyof typeof LESSON_CONFIGS;
```

**Type Safety Discussion:**
- Considered `as const satisfies Record<string, LessonConfig>` for validation
- Chose simpler `as const` for MVP
- Can add validation later when adding more lessons

### 5. Test Harness

**Built interactive test UI in `App.tsx`:**
- Input controls for MIDI note, semitones, duration
- Real-time display of conversion results
- Verified all utility functions work correctly

**Test Cases Validated:**
- MIDI 60 → "C4" ✓
- MIDI 48 → "C3" (range minimum) ✓
- MIDI 72 → "C5" (range maximum) ✓
- Interval 4 → "Major 3rd" ✓
- Interval 12 → "Octave" ✓
- Duration 125s → "2:05" ✓

---

## Key Technical Decisions

### 1. API Type Convention
**Decision:** Use snake_case for `RoundData`, `AttemptData`, `RoundResponse`
**Rationale:** Matches backend exactly, eliminates conversion errors, simpler for MVP
**Trade-off:** Less conventional for JavaScript, but safer

### 2. Prompt Structure
**Decision:** Store only MIDI numbers in `Prompt`, use formatters for display
**Rationale:** Clean domain/display separation, follows "MIDI is truth" principle
**Alternative Rejected:** Storing both MIDI + note names (unnecessary duplication)

### 3. Round ID Management
**Decision:** Use `-1` placeholder in `AttemptData` until round created
**Rationale:** Simple sentinel value, clearly invalid, won't conflict with auto-increment IDs
**Implementation:** Overwrite with real ID when batch creating attempts

### 4. GameState Temporal Tracking
**Decision:** Store `currentPromptDisplayedAt` and `currentRootPlayedAt` in state
**Rationale:** Build complete immutable `AttemptData` when interval played
**Alternative Rejected:** Mutating attempts array (harder to reason about)

### 5. Duration Formatting
**Decision:** No padding on minutes ("1:05" not "01:05")
**Rationale:** More compact, standard for durations under 10 minutes
**Trade-off:** Variable width (less predictable UI alignment)

### 6. Naming Convention
**Decision:** Use `calc` prefix for calculation functions
**Rationale:** Consistency, intentional abbreviation
**Applied to:** `calcIntervalTarget`, `calcReactionTime`, `calcExecutionTime`

---

## Web MIDI API Deep Dive

**Crash course provided on:**
- How MIDI protocol works (`[status, note, velocity]`)
- Web MIDI API flow: request access → get devices → listen for messages
- Why `Set<number>` for `activeNotes` (track multiple held notes simultaneously)
- Velocity=0 handling (some keyboards send noteOn with velocity=0 instead of noteOff)
- Timestamp conversion (`Date.now() / 1000` for Unix seconds)

**Key Insights:**
- `Set` prevents duplicates, fast lookup with `.has()`
- `Map` would be overkill (don't need velocity data)
- Critical for correction mechanic (checking if note is held for 2 seconds)

---

## Files Created

1. `frontend/src/utils/types.ts` - All TypeScript interfaces (113 lines)
2. `frontend/src/utils/midi.ts` - MIDI conversion utilities (27 lines)
3. `frontend/src/utils/formatters.ts` - Display formatters (102 lines)
4. `frontend/src/config/lessons.ts` - Lesson configuration (13 lines)
5. `frontend/src/App.tsx` - Test harness (76 lines)

**Total:** ~331 lines of production code (excluding test harness)

---

## Phase 1 Status: ✅ COMPLETE (Except api.ts)

**Completed:**
- [x] Initialize Vite React TypeScript project
- [x] Create directory structure (screens/, components/, hooks/, services/, utils/, config/)
- [x] Define all types in `types.ts`
- [x] Create `midi.ts` utilities
- [x] Create `formatters.ts` utilities
- [x] Create `lessons.ts` config
- [x] Build test harness to verify functions

**Remaining for Phase 1:**
- [ ] Create `api.ts` service (3 functions: createRound, logAttempt, getRounds)

---

## Next Session: Complete Phase 1 + Start Phase 2

**Priority 1:** Create `api.ts` (simple fetch wrappers)
**Priority 2:** Begin Phase 2 - MIDI Integration
- Implement `useMIDI` hook
- Create MIDI test component
- Verify latency is acceptable

---

## Lessons Learned

### What Went Well
1. **Systems thinking first** - Discussed trade-offs before implementing (snake_case decision)
2. **Test-driven approach** - Built test harness to verify utilities work
3. **Intentional decisions** - Every choice documented with rationale (calc vs calculate, padding, etc.)
4. **Clean separation** - Domain types vs API types, MIDI numbers vs display strings

### What Could Improve
1. **Type validation** - Could use `satisfies` for config validation (deferred to later)
2. **Edge case testing** - Didn't test MIDI bounds (0, 127) systematically
3. **Compound interval handling** - Over-engineered for MVP (intervals 1-12 only)

### Technical Insights
1. **MIDI is truth** principle applies to frontend too (store numbers, format for display)
2. **Temporal state** needs explicit tracking (can't derive timestamps retroactively)
3. **Immutable data** simpler to reason about (build complete objects, don't mutate)
4. **Type alignment** critical for API contracts (snake_case reduces errors)

---

## Notes for Future Sessions

- Test harness in `App.tsx` can be removed once full UI built
- `semitonesToIntervalAbbr()` is scope creep but harmless
- Consider adding `satisfies` validation when adding more lessons
- Run `npx tsc --noEmit` to verify no type errors before proceeding

---

## References

- [Frontend Architecture](../FRONTEND_ARCHITECTURE.md) - Phase 1 implementation sequence
- [Technical Context](../TECHNICAL_CONTEXT.md) - Data model philosophy
- [Database Schema](../DATABASE_SCHEMA.md) - API contract field names
