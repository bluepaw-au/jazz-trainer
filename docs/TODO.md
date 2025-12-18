# Implementation Checklist

## Current Status: ✅ Backend Complete | ✅ Frontend Architecture Complete | 🔄 Phase 1 Foundation (95% Complete)

**Last Updated:** 2025-12-18 (Session 4)

**Reference Documents:**
- [Frontend Architecture](/docs/FRONTEND_ARCHITECTURE.md) - Complete architectural design and implementation sequence
- [Technical Context](/docs/TECHNICAL_CONTEXT.md) - Technical decisions and patterns
- [Database Schema](/docs/DATABASE_SCHEMA.md) - Data model
- [Architectural Decisions](/docs/ARCHITECTURAL_DECISIONS.md) - ADR log

---

## Phase 1: Technical Validation ✅ COMPLETE

- [x] Test Web MIDI API with Casio keyboard
- [x] Confirm latency is acceptable (Chrome)
- [x] Verify MIDI event structure (noteOn/noteOff)
- [x] Confirm browser choice (Chrome required, Safari unsupported)

**Result:** Web MIDI API validated. Latency imperceptible for this use case. Chrome is target browser.

---

## Phase 2: Backend Setup ✅ COMPLETE

- [x] Initialize Node/Express project
- [x] Install dependencies (express, better-sqlite3, cors)
- [x] Create database schema
- [x] Create database initialization script
- [x] Set up basic Express server structure
- [x] Create SQLite database connection module
- [x] Create API endpoint: `POST /api/rounds` (create completed round)
- [x] Create API endpoint: `POST /api/attempts` (log attempt)
- [x] Create API endpoint: `GET /api/rounds` (fetch round history)
- [x] Test endpoints with curl

---

## Phase 3: Frontend Architecture ✅ COMPLETE

- [x] Define directory structure (screens, components, hooks, services, utils, config)
- [x] Choose state management approach (useReducer for game logic)
- [x] Design MIDI integration strategy (useMIDI hook)
- [x] Define data flow patterns (MIDI → game logic → API → UI)
- [x] Document TypeScript interfaces matching backend contracts
- [x] Define round completion flow (Option B: create round at end, queue attempts in memory)
- [x] Define error handling strategy (simple alert() dialogs for MVP)
- [x] Define correction mechanic (no escape hatch, must complete)
- [x] Decide on UI approach (text display only, no visual keyboard for MVP)

**Key Architectural Decisions:**
- Round created at completion with accurate totals (acceptable data loss on refresh)
- Simple alert() error dialogs (no fancy UI)
- No correction escape hatch (must find correct interval)
- No state persistence on refresh (acceptable)
- No API retry logic (just show error)
- Text-only prompt display (visual keyboard deferred)

---

## Phase 4: Frontend Implementation

### Foundation (Phase 4.1) 🔄 95% COMPLETE

**Project Setup:**
- [x] Initialize Vite React TypeScript project
- [x] Create directory structure (screens/, components/, hooks/, services/, utils/, config/)

**Type Definitions:**
- [x] Create `src/utils/types.ts`
  - [x] Domain types: `Prompt`, `LessonConfig`, `GameState`, `Range`
  - [x] API contract types: `RoundData`, `AttemptData`, `RoundResponse`
  - [x] MIDI types: `MIDIEvent`, `MIDIHookReturn`
  - [x] Decision: snake_case for API types (match backend), camelCase for domain types

**Utility Functions:**
- [x] Create `src/utils/midi.ts`
  - [x] `midiToNoteName()` - MIDI 60 → "C4"
  - [x] `calcIntervalTarget()` - Root + semitones
- [x] Create `src/utils/formatters.ts`
  - [x] `semitonesToIntervalName()` - 4 → "Major 3rd"
  - [x] `semitonesToIntervalAbbr()` - 4 → "M3" (bonus)
  - [x] `formatDuration()` - 125s → "2:05"
  - [x] `calcReactionTime()` - Timing calculation
  - [x] `calcExecutionTime()` - Timing calculation

**Configuration:**
- [x] Create `src/config/lessons.ts`
  - [x] `LESSON_CONFIGS` constant
  - [x] `DEFAULT_LESSON` constant
  - [x] `LessonType` type

**Backend Communication:**
- [ ] Create `src/services/api.ts` 🔜 NEXT
  - [ ] `createRound(data: RoundData): Promise<{ id: number }>`
  - [ ] `logAttempt(data: AttemptData): Promise<{ id: number }>`
  - [ ] `getRounds(limit?: number): Promise<RoundResponse[]>`
  - [ ] Ensure all timestamps use `Date.now() / 1000` (Unix seconds)
  - [ ] Simple error handling (throw on non-ok response)

### MIDI Integration (Phase 4.2) 🔜 NEXT AFTER api.ts

- [ ] Create `src/hooks/useMIDI.ts`
  - [ ] Request MIDI access on mount
  - [ ] Parse MIDI messages (`[status, note, velocity]`)
  - [ ] Handle velocity=0 as noteOff
  - [ ] Convert timestamps to Unix seconds (`Date.now() / 1000`)
  - [ ] Track `activeNotes` as `Set<number>`
  - [ ] Error handling: unsupported browser, permission denied, no devices
  - [ ] Return: `{ isSupported, isConnected, error, activeNotes, lastEvent }`
- [ ] Create MIDI test component
  - [ ] Display connected device name
  - [ ] Display pressed notes in real-time
  - [ ] Verify latency feels acceptable
- [ ] Test error scenarios
  - [ ] No MIDI access permission
  - [ ] No devices connected
  - [ ] Device disconnected mid-session

### Game Logic (Phase 4.3)

- [ ] Create `src/hooks/useGameLogic.ts`
  - [ ] Define reducer with `GameState` type
  - [ ] Implement state machine: `idle → waiting → root_played → [correction] → next prompt`
  - [ ] Generate all prompts at round start (random root + interval)
  - [ ] Handle note input events from `useMIDI`
  - [ ] Validate interval played (exact MIDI match)
  - [ ] Build complete `AttemptData` when interval played
  - [ ] Track score (`correct`, `total`)
  - [ ] Implement correction state (hold root 2s → hold interval 2s)
  - [ ] Implement round completion (call `api.createRound()`, batch `api.logAttempt()`)
  - [ ] Return: `{ state, startRound, handleNoteInput, completeRound }`
- [ ] Test state machine transitions manually
  - [ ] Complete prompt with correct answer
  - [ ] Trigger correction mechanic
  - [ ] Verify all 20 prompts advance correctly

### UI Components (Phase 4.4)

- [ ] Create `src/components/PromptDisplay.tsx`
  - [ ] Display current root note name (e.g., "C4")
  - [ ] Display interval name (e.g., "Major 3rd")
  - [ ] Display expected note name (e.g., "E4")
  - [ ] Display attempt progress ("Prompt 5 of 20")
  - [ ] Show correction state ("Hold C4... now hold E4...")
  - [ ] Props: `{ currentPrompt, attemptIndex, totalAttempts, phase, correctionState }`
- [ ] Create `src/components/ScoreDisplay.tsx`
  - [ ] Display correct/total score (e.g., "18/20")
  - [ ] Display accuracy percentage (e.g., "90%")
  - [ ] Display elapsed time (e.g., "2:05")
  - [ ] Props: `{ score: { correct, total }, elapsedSeconds }`
- [ ] Create `src/screens/GameScreen.tsx`
  - [ ] Use `useMIDI(onNoteOn, onNoteOff)`
  - [ ] Use `useGameLogic(config)`
  - [ ] Connect MIDI events → `game.handleNoteInput()`
  - [ ] Track elapsed time (start when round starts)
  - [ ] Render `<PromptDisplay />` and `<ScoreDisplay />`
  - [ ] Handle round completion → transition to ResultsScreen
  - [ ] Error handling for MIDI disconnection

### Data Persistence (Phase 4.5)

- [ ] Test round completion flow end-to-end
  - [ ] Start backend server
  - [ ] Complete full 20-prompt round
  - [ ] Verify round created in database
  - [ ] Verify all 20 attempts logged with correct `round_id`
  - [ ] Verify timestamps are Unix seconds (not milliseconds)
- [ ] Create `src/screens/ResultsScreen.tsx`
  - [ ] Fetch round history: `api.getRounds(10)`
  - [ ] Display last round summary (score, time, accuracy)
  - [ ] Display simple list of past rounds (date, score, time)
  - [ ] "Start New Round" button → transition to GameScreen
  - [ ] Error handling if backend unavailable
- [ ] Create `src/App.tsx`
  - [ ] Screen routing: `screen: 'game' | 'results'`
  - [ ] Load config: `LESSON_CONFIGS[DEFAULT_LESSON]`
  - [ ] Pass config to `<GameScreen />`
  - [ ] Handle screen transitions

### Correction Mechanic (Phase 4.6)

- [ ] Implement correction state logic in `useGameLogic`
  - [ ] Detect incorrect interval played
  - [ ] Enter correction phase
  - [ ] Track `rootHeldSince` when root pressed
  - [ ] Check if root held for 2 seconds
  - [ ] Track `intervalHeldSince` when correct interval pressed
  - [ ] Check if interval held for 2 seconds
  - [ ] Exit correction → advance to next prompt
- [ ] Add correction timer display
  - [ ] Show progress indicator ("Hold C4... 1.5s / 2s")
  - [ ] Visual feedback when requirement met
- [ ] Test correction mechanic thoroughly
  - [ ] Play wrong interval → verify enters correction
  - [ ] Release root early → verify timer resets
  - [ ] Complete 2s hold on both notes → verify advances

### Error Handling (Phase 4.7)

- [ ] Add `alert()` dialogs for all error cases
  - [ ] MIDI not supported (Safari)
  - [ ] MIDI permission denied
  - [ ] MIDI device disconnected
  - [ ] API error (backend down)
  - [ ] Network error during round completion
- [ ] Test all error scenarios
  - [ ] Start app without MIDI keyboard
  - [ ] Deny MIDI permission
  - [ ] Disconnect keyboard mid-round
  - [ ] Stop backend mid-round
  - [ ] Complete round with backend down

---

## Phase 5: Configuration & Polish

### Configuration
- [x] Lesson config in `lessons.ts` (already complete)
- [ ] Load config on app start (already handled in architecture)
- [ ] Use config values throughout app

### Visual Polish
- [ ] Basic CSS styling
- [ ] Responsive layout
- [ ] Visual feedback for correct/incorrect (color changes)
- [ ] Smooth phase transitions
- [ ] Loading states for API calls

### Error Handling Polish
- [ ] User-friendly error messages
- [ ] Prevent crashes on edge cases
- [ ] Graceful degradation when features unavailable

---

## Phase 6: Testing & Validation

### Manual Testing
- [ ] Complete 5+ practice rounds end-to-end
- [ ] Verify MIDI latency feels acceptable during actual practice
- [ ] Verify correction mechanic enforces 2-second holds
- [ ] Test edge cases:
  - [ ] Quit mid-round (data lost - expected)
  - [ ] Disconnect MIDI keyboard
  - [ ] Rapid note sequences
  - [ ] Playing multiple notes simultaneously

### Data Validation
- [ ] Query database directly to verify structure
  ```bash
  sqlite3 backend/database.db "SELECT * FROM rounds ORDER BY id DESC LIMIT 5;"
  sqlite3 backend/database.db "SELECT * FROM attempts WHERE round_id = X LIMIT 5;"
  ```
- [ ] Verify timestamps are Unix seconds (not milliseconds)
- [ ] Verify `round_id` foreign keys are correct
- [ ] Verify note names match MIDI numbers
- [ ] Export sample data, review manually

### Performance Check
- [ ] MIDI input latency during practice (should be imperceptible)
- [ ] UI responsiveness during rounds
- [ ] Memory leaks check (long sessions)

---

## Phase 7: Real-World Usage

### Daily Practice Integration
- [ ] Use app for actual practice sessions for 1 week
- [ ] Note friction points or missing features
- [ ] Track consistency of use
- [ ] Gather subjective feedback on usefulness

### Iteration Decision Point
After 1 week of real usage, assess:
- Is the MVP solving the problem?
- Is MIDI latency acceptable in practice?
- Is the correction mechanic helping or hindering?
- What's the highest-value next feature?

**Decision:** Continue with chord lessons, iterate on interval drill, or add analytics?

---

## Future Phases (Post-MVP)

See `FUTURE_FEATURES.md` for detailed roadmap.

**Likely next steps:**
1. Analytics dashboard (visualize performance over time)
2. Adaptive difficulty (focus on weak intervals)
3. Chord lessons (maj7, m7, dom7)
4. ii-V-I progression drills

---

## Quick Reference Commands

```bash
# Start backend
cd backend && npm run dev

# Start frontend
cd frontend && npm run dev

# Start both (if configured)
npm run dev

# Query database
sqlite3 backend/database.db "SELECT * FROM rounds ORDER BY created_at DESC LIMIT 10;"

# Verify timestamps are seconds (not milliseconds)
sqlite3 backend/database.db "SELECT prompt_displayed_at, root_note_played_at FROM attempts LIMIT 1;"
```

---

## Critical Implementation Reminders

- **Timestamps:** Always `Date.now() / 1000` (Unix seconds, not milliseconds)
- **MIDI parsing:** Handle velocity=0 as noteOff
- **Validation:** Exact MIDI match only (no "close enough")
- **Browser:** Chrome only (Safari doesn't support Web MIDI)
- **Correction:** Forced attention mechanism, not retry
- **Data capture:** Log everything even if not displayed in UI yet
- **Round ID:** Use `-1` placeholder until round created
- **API types:** snake_case (match backend), domain types: camelCase
