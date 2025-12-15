I'm building a Jazz Piano practice tool. All planning is complete and documented in the /docs folder.

Steps for you to follow:
1. Read the PROJECT_OVERVIEW first to get the big picture.

2. Read the session logs to understand what we've accomplished:
   - /docs/logs/2025-12-11-session-log.md (Session 1: Database layer)
   - /docs/logs/2025-12-11-session-2-log.md (Session 2: Express server)
   - /docs/logs/2025-12-11-session-3-log.md (Session 3: Frontend architecture)

3. Reference TODO.md to see what's next in Phase 2.

4. Read PERSONAL_PREFERENCES.md to understand how I prefer to work together.

5. Review TECHNICAL_CONTEXT.md for key technical decisions and patterns.

6. **CRITICAL:** Read FRONTEND_ARCHITECTURE.md for complete architectural specification (this is your primary reference for frontend implementation).

I want to write the code myself—please act as a mentor and tutor. Don't write the code for me unless I get stuck. Snippets and examples are fine, especially if it's something I've never done before.


## Current Status (Updated 2025-12-11, Session 3)

**Phase 2 Backend: ✅ COMPLETE**
- Database layer complete (init-db.js, database.js)
- Express server complete (server.js)
- All three API endpoints implemented and tested
- Data persistence verified

**Phase 2 Frontend Architecture: ✅ COMPLETE**
- Complete architectural design documented in FRONTEND_ARCHITECTURE.md
- Directory structure defined (screens, components, hooks, services, utils, config)
- State management approach chosen (useReducer for game state machine)
- MIDI integration strategy designed (useMIDI hook)
- Data flow patterns mapped (MIDI → game logic → API → UI)
- All critical gaps addressed (timestamps, round ID, side effects, error handling)
- TypeScript interfaces defined matching backend contracts
- Implementation sequence planned (7 phases)

**Phase 2 Frontend Implementation: 🔜 NEXT**
- Initialize Vite React TypeScript project
- Create directory structure
- Implement utility files (types.ts, midi.ts, formatters.ts)
- Create config file (lessons.ts)
- Stub out api.ts service
- Begin useMIDI hook implementation

## Key Architectural Decisions (Reference)

These decisions were made in Session 3 and are documented in FRONTEND_ARCHITECTURE.md:

1. **Round ID Management:** Create round at completion, queue attempts in memory (Option B)
   - Simpler implementation, no backend changes needed
   - Acceptable data loss on refresh

2. **Error Handling:** Simple `alert()` dialogs for MVP
   - No fancy error UI initially

3. **Correction Mechanic:** No escape hatch
   - Must complete 2s root hold + 2s interval hold to advance

4. **UI Approach:** Text-only prompt display for MVP
   - No visual keyboard component initially
   - Example: "Play C4 → Major 3rd (E4)"

5. **State Persistence:** No sessionStorage
   - Acceptable to lose progress on refresh

6. **API Retry:** No automatic retry logic
   - Just show error if backend unreachable

7. **Configuration:** TypeScript constants in lessons.ts
   - No JSON file or database storage

## Critical Implementation Reminders

**Timestamp Conversion (CRITICAL):**
- JavaScript `Date.now()` returns **milliseconds**
- Backend expects **seconds** (REAL type in SQLite)
- **ALWAYS** convert: `Date.now() / 1000`
- Enforce in: useMIDI hook, useGameLogic reducer, api.ts

**MIDI Event Parsing:**
- Status 144 + velocity > 0 = Note On
- Status 128 OR (status 144 + velocity = 0) = Note Off
- Use `Date.now() / 1000` for timestamp conversion

**Round Completion Flow (Option B):**
1. Store all attempts in memory during round
2. On round complete:
   - Call `api.createRound(roundData)` → get `{id: roundId}`
   - Batch call `api.logAttempt({...attempt, roundId})` for all attempts
   - Handle errors with simple `alert()`

## Reference Documents

**Primary References:**
- [FRONTEND_ARCHITECTURE.md](/docs/FRONTEND_ARCHITECTURE.md) - **START HERE** - Complete architectural spec
- [TODO.md](/docs/TODO.md) - Detailed implementation checklist
- [SESSION #3 LOG](/docs/logs/2025-12-11-session-3-log.md) - Architecture planning session notes

**Supporting References:**
- [PROJECT_OVERVIEW.md](/docs/PROJECT_OVERVIEW.md) - Big picture
- [TECHNICAL_CONTEXT.md](/docs/TECHNICAL_CONTEXT.md) - Backend patterns to mirror
- [DATABASE_SCHEMA.md](/docs/DATABASE_SCHEMA.md) - Data contracts
- [PERSONAL_PREFERENCES.md](/docs/PERSONAL_PREFERENCES.md) - How I prefer to work

Let's pick up where we left off by implementing the frontend.
