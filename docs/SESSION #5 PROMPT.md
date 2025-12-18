# Session #5 Prompt - Jazz Piano Practice Trainer

I'm building a Jazz Piano practice tool. All planning is complete and documented in the `/docs` folder.

## Your Role

Act as a **mentor and tutor**. Guide me through implementation, explain concepts, and help me think through problems—but let me write the code myself. Provide snippets and examples for new concepts, but avoid writing full implementations unless I'm stuck.

See [PERSONAL_PREFERENCES.md](PERSONAL_PREFERENCES.md) for detailed guidance on how I prefer to work.

---

## Quick Start

**Primary References:**
1. **[FRONTEND_ARCHITECTURE.md](FRONTEND_ARCHITECTURE.md)** - Complete architectural specification
2. **[TODO.md](TODO.md)** - Current task checklist with phases
3. **[SESSION #4 LOG](logs/2025-12-18-session-4-log.md)** - Most recent session notes
4. **[ARCHITECTURAL_DECISIONS.md](ARCHITECTURAL_DECISIONS.md)** - ADR log of key decisions

**Supporting Context:**
- [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) - Big picture goals
- [TECHNICAL_CONTEXT.md](TECHNICAL_CONTEXT.md) - Technical patterns and philosophy
- [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) - Backend data contracts

---

## Current Status (Updated 2025-12-18, Session 4)

### ✅ Complete

**Backend:**
- Database layer (SQLite schema, init script)
- Express server with 3 API endpoints (`POST /api/rounds`, `POST /api/attempts`, `GET /api/rounds`)
- All endpoints tested and verified

**Frontend Architecture:**
- Complete design in FRONTEND_ARCHITECTURE.md
- All architectural decisions documented (see ARCHITECTURAL_DECISIONS.md)
- Implementation sequence planned (7 phases)

**Frontend Foundation (Phase 4.1) - 95% Complete:**
- Project initialization (Vite React TypeScript)
- Directory structure created
- **Type definitions** (`types.ts`) - All interfaces defined
  - Domain types: `Prompt`, `LessonConfig`, `GameState`, `Range`
  - API types: `RoundData`, `AttemptData`, `RoundResponse` (snake_case)
  - MIDI types: `MIDIEvent`, `MIDIHookReturn`
- **MIDI utilities** (`midi.ts`) - `midiToNoteName()`, `calcIntervalTarget()`
- **Display formatters** (`formatters.ts`) - All formatters implemented
- **Lesson config** (`lessons.ts`) - Configuration constants defined
- Test harness built and utilities verified

### 🔜 Next: Complete Phase 4.1

**Immediate Task:**
- Create `src/services/api.ts` (3 simple fetch wrappers)

**After api.ts:**
- Begin Phase 4.2 - MIDI Integration (`useMIDI` hook)

---

## Key Implementation Reminders

### Critical Conventions

**Timestamps (CRITICAL):**
- JavaScript `Date.now()` returns **milliseconds**
- Backend expects **seconds** → Always convert: `Date.now() / 1000`

**MIDI Event Parsing:**
- Note On: status 144 + velocity > 0
- Note Off: status 128 OR (status 144 + velocity = 0)

**API Types:**
- Use **snake_case** for API contract types (matches backend exactly)
- Use **camelCase** for domain types (JS convention)
- See ADR-009 for rationale

**Round Completion Flow:**
1. Queue attempts in memory with `roundId: -1` placeholder
2. On complete: `createRound()` → get real `roundId`
3. Batch `logAttempt()` calls with real `roundId`
4. Handle errors with simple `alert()`

---

## Architecture Quick Reference

**State Management:**
- `useMIDI` - Hardware I/O, parse MIDI events, track `activeNotes: Set<number>`
- `useGameLogic` - State machine (reducer), prompt generation, validation

**Data Flow:**
```
MIDI Keyboard → useMIDI → useGameLogic → api.ts → Backend
                   ↓           ↓
              activeNotes   GameState → UI Components
```

**Phase 4.1 Files Created:**
- `src/utils/types.ts` - TypeScript interfaces
- `src/utils/midi.ts` - MIDI conversion utilities
- `src/utils/formatters.ts` - Display formatters
- `src/config/lessons.ts` - Lesson configuration
- `src/services/api.ts` - ← **NEXT TO CREATE**

---

## Session Logs

Read these to understand progression:
- [Session 1](logs/2025-12-11-session-log.md) - Database layer
- [Session 2](logs/2025-12-11-session-2-log.md) - Express server
- [Session 3](logs/2025-12-11-session-3-log.md) - Frontend architecture planning
- [Session 4](logs/2025-12-18-session-4-log.md) - Frontend foundation implementation

---

## Architectural Decisions

All major decisions are documented in [ARCHITECTURAL_DECISIONS.md](ARCHITECTURAL_DECISIONS.md). Key ADRs:

- **ADR-004:** Round completion flow (Option B - queue in memory)
- **ADR-005:** Simple `alert()` dialogs for errors (MVP)
- **ADR-006:** No escape hatch for correction mechanic
- **ADR-009:** snake_case for API types, camelCase for domain types
- **ADR-010:** Prompt stores MIDI numbers only (formatters for display)

---

## What's Next

**Immediate:** Create `api.ts` service (3 fetch wrappers)

**This Session Goals:**
1. Complete `api.ts`
2. Begin `useMIDI` hook implementation
3. Create MIDI test component to verify latency

See [TODO.md](TODO.md) for detailed checklist.
