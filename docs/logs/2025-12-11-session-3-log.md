# Session Log: 2025-12-11 (Session 3)

## Session Overview
**Duration:** ~2 hours
**Phase:** Phase 2 - Frontend Architecture Planning
**Focus:** Architectural design, state management strategy, implementation planning

---

## What Was Accomplished

### 1. Frontend Architecture Design
- **Discussed and validated complete frontend architecture approach**
- Defined directory structure (screens, components, hooks, services, utils, config)
- Chose state management pattern (useReducer for game logic state machine)
- Designed hook responsibilities (useMIDI for hardware I/O, useGameLogic for game state)
- Mapped component hierarchy and data flow patterns

### 2. Critical Architectural Decisions Made
- **Round ID Management:** Option B - create round at completion, queue attempts in memory
  - Simpler implementation (no placeholder rounds, no update endpoint needed)
  - Acceptable data loss on browser refresh for MVP
  - Batch log all attempts after round completes with accurate totals

- **Error Handling:** Simple `alert()` dialogs for MVP
  - No fancy error UI (toasts, modals) initially
  - Direct user feedback for MIDI errors, API failures
  - Keep implementation focused on core functionality

- **Correction Mechanic:** No escape hatch
  - User must complete 2s root hold + 2s interval hold
  - Forced attention mechanism (no skip button)
  - Text feedback only ("Hold C4... now hold E4...")

- **UI Approach:** Text-only prompt display for MVP
  - No visual keyboard component initially
  - Simple text: "Play C4 → Major 3rd (E4)"
  - Visual keyboard deferred to post-MVP validation

- **State Persistence:** No sessionStorage
  - Acceptable to lose progress on page refresh
  - Simplifies implementation
  - Sufficient for MVP validation

- **API Retry:** No automatic retry logic
  - Just show error if backend unreachable
  - User can manually retry
  - Avoids queue management complexity

### 3. State Machine Design
- **Defined game flow:**
  ```
  waiting → root_played → interval_played → correction (if wrong) → next_prompt → complete
  ```
- Chose `useReducer` pattern for predictable state transitions
- Designed action types and state shape
- Planned side-effect handling via `useEffect` (API calls outside reducer)

### 4. Data Flow Architecture
- **MIDI Input Flow:** MIDI event → useMIDI hook → onNoteOn callback → useGameLogic.handleNoteInput() → reducer → state update → UI re-render
- **API Flow:** Reducer sets flag → useEffect watches flag → API call (async) → dispatch completion action
- **Component Flow:** GameScreen owns hooks → passes props down to PromptDisplay and ScoreDisplay

### 5. TypeScript Type System
- Defined complete type interfaces matching backend contracts exactly:
  - `Prompt` - Current prompt data
  - `RoundData` - POST /api/rounds payload
  - `AttemptData` - POST /api/attempts payload
  - `RoundResponse` - GET /api/rounds response
  - `LessonConfig` - Lesson configuration
- Type safety enforced across state machine, API calls, MIDI events

### 6. Critical Implementation Details Documented
- **Timestamp Conversion:** JavaScript `Date.now()` returns milliseconds, backend expects seconds
  - Solution: `Date.now() / 1000` at every capture point
  - Enforcement in useMIDI, useGameLogic, api.ts

- **MIDI Event Parsing:**
  - Note On with velocity=0 is actually Note Off
  - Convert timestamps to Unix seconds
  - Use `Date.now()` instead of `message.timeStamp` for consistency

- **Correction Timer Logic:**
  - Check hold duration every 100ms via setInterval
  - Reset timer on noteOff during correction
  - Sequential holds (root first, then interval)

### 7. Configuration Strategy
- **Chose TypeScript constants over JSON file:**
  - Better type safety
  - No async loading complexity
  - Sufficient for MVP (user can edit constants file)
- Defined `LESSON_CONFIGS` object with intervals_ascending settings
- Note range: C3-C5 (MIDI 48-72)
- Interval range: 1-12 semitones
- Correction hold time: 2000ms

### 8. Testing Strategy Defined
- **Manual testing focus:**
  1. MIDI event handling (latency, rapid sequences, disconnect)
  2. State machine transitions (full rounds, correction mechanic)
  3. Data persistence (verify timestamps, database entries)
  4. Error scenarios (backend down, MIDI denied, device disconnect)
- Database verification queries documented
- No automated tests for MVP (validate tool first, add tests later)

### 9. Implementation Sequence Planned
- **7 Phases over ~7-8 days:**
  1. Foundation (Vite setup, types, utils, config)
  2. MIDI Integration (useMIDI hook, test with simple component)
  3. Game Logic (useGameLogic reducer, prompt generation)
  4. UI Components (PromptDisplay, ScoreDisplay, GameScreen)
  5. Data Persistence (API calls, round completion flow)
  6. Correction Mechanic (timers, state logic, text feedback)
  7. Error Handling (alert dialogs, all failure modes)

### 10. Documentation Created
- **FRONTEND_ARCHITECTURE.md** - Complete architectural specification
  - All design decisions with rationale
  - TypeScript interfaces and code examples
  - Implementation sequence
  - Critical details (timestamps, MIDI parsing, correction logic)
  - Testing strategy
- **TODO.md Updated** - Detailed checklist for frontend implementation
  - Broken down by file and function
  - References architecture doc
  - Clear next steps

---

## Key Learning Moments

### Architecture Discussion Process
- Started with high-level questions (client vs server game logic, config in database vs file)
- Validated user's thinking through trade-off analysis
- Challenged assumptions productively (round ID management options)
- Landed on pragmatic MVP-focused decisions

### Systems Thinking Applied
- Traced data flow from MIDI input through entire system
- Identified race conditions in side-effect handling (API calls in reducers)
- Considered failure modes systematically (MIDI errors, API errors, state errors)
- Balanced architecture quality with MVP scope constraints

### State Machine Pattern
- Recognized game flow as state machine (clear states, explicit transitions)
- Chose `useReducer` for predictable state evolution
- Separated pure state logic (reducer) from side effects (useEffect)
- Designed actions to be descriptive events, not commands

### Technical Constraints Recognition
- JavaScript timestamp format mismatch (ms vs seconds)
- MIDI event parsing gotchas (velocity=0 means noteOff)
- SQLite boolean storage (requires 0/1 integers)
- React reducer purity requirements (no async in reducers)

---

## Technical Decisions Made

1. **State Management:** `useReducer` for game state machine (vs useState)
   - Better for complex state transitions
   - Centralized state logic
   - Easier to test and debug

2. **Round Creation:** Option B - create at end with batch attempt logging
   - Avoids placeholder rounds in database
   - No update endpoint needed in backend
   - Acceptable data loss on refresh

3. **Error Handling:** Simple `alert()` dialogs
   - No error state management complexity
   - Direct user feedback
   - Sufficient for MVP validation

4. **Visual Display:** Text-only prompts
   - "Play C4 → Major 3rd (E4)"
   - Defers visual keyboard to post-MVP
   - Reduces implementation scope

5. **Configuration:** TypeScript constants (not JSON)
   - Type safety
   - No async loading
   - Editable in code for MVP

6. **Correction Mechanic:** No escape hatch
   - Must complete 2s holds
   - Forced attention learning mechanic
   - No skip button

7. **State Persistence:** None (acceptable loss on refresh)
   - No sessionStorage complexity
   - Simplifies architecture
   - Sufficient for MVP

8. **API Retry:** None (show error and let user decide)
   - No queue management
   - No localStorage caching
   - Keep it simple

---

## Files Created

```
docs/
├── FRONTEND_ARCHITECTURE.md    # Complete architectural specification
└── logs/
    └── 2025-12-11-session-3-log.md  # This file
```

## Files Modified

```
docs/
├── TODO.md                     # Updated with detailed frontend implementation checklist
└── SESSION #3 PROMPT.md        # (To be updated with session context)
```

---

## What's Next (Next Session)

### Immediate Next Steps
1. Initialize Vite React TypeScript project
2. Create directory structure
3. Implement utility files (types.ts, midi.ts, formatters.ts)
4. Create config file (lessons.ts)
5. Stub out api.ts service
6. Begin useMIDI hook implementation

### Blockers / Open Questions
None - architecture fully validated and approved. Clear path forward.

---

## Observations & Reflections

### What Went Well
- Comprehensive architectural thinking before coding
- Identified and addressed all critical gaps (timestamps, round ID, side effects)
- Made pragmatic MVP-focused decisions (text display, simple errors)
- User actively participated in trade-off discussions
- Clear documentation captured for handoff to next session

### What Was Challenging
- Balancing "do it right" vs "validate quickly" (resolved with clear MVP scope)
- Multiple valid approaches for round ID management (evaluated pros/cons)
- State machine complexity (mitigated with useReducer pattern)
- TypeScript type complexity (addressed with comprehensive types.ts)

### Process Notes
- Question-first approach worked well for exploring options
- Trade-off analysis helped user make informed decisions
- Systems thinking revealed non-obvious issues (side effects, timestamps)
- Breaking down into 7 implementation phases makes daunting task approachable
- Reference architecture doc ensures consistency during implementation

---

## Code Quality Notes

### Architecture Strengths
- Clean separation of concerns (screens, components, hooks, services, utils)
- Pure reducer pattern (side effects handled separately)
- Type safety enforced via TypeScript interfaces
- Pragmatic MVP scope (text display, simple errors)
- Clear data flow (MIDI → game logic → API → UI)

### Potential Improvements for Later
- Visual keyboard component (deferred)
- Fancy error UI with toasts/modals (deferred)
- State persistence via sessionStorage (deferred)
- API retry logic with localStorage queue (deferred)
- Automated testing (manual validation first)
- Multiple lesson type support (intervals only for MVP)

---

## Mentor Notes (Claude Code)

### Teaching Approach That Worked
- Let user drive architectural decisions after presenting options
- Explained trade-offs clearly (Option A vs Option B for round ID)
- Challenged assumptions without being prescriptive ("have you considered...")
- Validated user's instincts when sound (service pattern, separation of concerns)
- Identified gaps user hadn't considered (timestamps, side effects, MIDI parsing)

### User Demonstrated
- Strong systems thinking (understood data flow end-to-end)
- Pragmatic decision-making (MVP scope discipline)
- Pattern recognition (service abstraction, separation of concerns)
- Willingness to defer features (visual keyboard, fancy errors)
- Clear communication of constraints (personal tool, acceptable data loss)

### Key Insights Gained
- User values architecture planning but wants to validate quickly
- MVP scope discipline is important (avoid feature creep)
- Text-only display acceptable for initial validation
- Data loss on refresh is acceptable trade-off for simpler implementation
- Error handling can be simple (alert dialogs) for MVP

### Next Session Focus
- Initialize project and create foundation files
- Implement utility functions (types, formatters, MIDI helpers)
- Test useMIDI hook with simple component
- Validate MIDI latency and event parsing
- Begin useGameLogic reducer skeleton

---

## Critical Reminders for Next Session

### Timestamp Conversion
**ALWAYS:** `Date.now() / 1000` to convert milliseconds to seconds
- useMIDI hook when capturing note events
- useGameLogic when recording prompt displayed, round start/complete
- Never send milliseconds to backend

### MIDI Event Parsing
- Status 144 + velocity > 0 = Note On
- Status 128 OR (status 144 + velocity = 0) = Note Off
- Always convert timestamp to Unix seconds

### Round Completion Flow (Option B)
1. User completes last prompt
2. Store all attempts in memory (useGameLogic state)
3. On round complete:
   - Call `api.createRound()` → get roundId
   - Batch call `api.logAttempt()` for all attempts with roundId
   - Handle errors with simple alert()

### No Escape Hatch
- Correction mechanic has no skip button
- User must complete 2s root hold + 2s interval hold
- Text feedback guides user ("Hold C4... now hold E4...")

### Reference Documents
- [FRONTEND_ARCHITECTURE.md](/docs/FRONTEND_ARCHITECTURE.md) - Complete spec
- [TECHNICAL_CONTEXT.md](/docs/TECHNICAL_CONTEXT.md) - Backend patterns to mirror
- [DATABASE_SCHEMA.md](/docs/DATABASE_SCHEMA.md) - Data contracts
