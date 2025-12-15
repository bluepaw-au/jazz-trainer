# Frontend Architecture Document
## Jazz Piano Practice Trainer - React/TypeScript Implementation

**Status:** ✅ Architecture validated and approved. Ready for implementation.

**Last Updated:** 2025-12-11 (Session 3)

---

## Executive Summary

### Architectural Verdict: ✅ APPROVED

The frontend architecture is pragmatic, maintainable, and appropriately scoped for MVP validation. All critical gaps have been addressed with clear implementation strategies.

### Key Design Decisions (User-Approved)

1. **Round ID Management:** Option B - Create round at completion, queue attempts in memory (acceptable data loss on refresh)
2. **Error Handling:** Simple `alert()` dialogs for MVP (no fancy error UI)
3. **Correction Mechanic:** No escape hatch - must find correct interval every time
4. **State Persistence:** No `sessionStorage` - acceptable to lose progress on refresh
5. **API Retry:** No retry logic - just show error if backend down
6. **Visual Keyboard:** Text display only for MVP - visual keyboard deferred to post-validation

---

## Technology Stack

### Core Technologies
- **React 18+** (via Vite for fast dev server)
- **TypeScript** (type safety for MIDI events, API contracts, state machine)
- **Chrome Browser** (required - Safari lacks Web MIDI API support)

### Runtime Environment
- **Frontend:** Vite dev server (port 5173)
- **Backend:** Express server on localhost:3000
- **Database:** SQLite at `backend/database.db`

### Key Dependencies
- No additional libraries required for MVP
- Web MIDI API (native browser API)
- Fetch API for backend communication
- React hooks for state management

---

## Directory Structure

```
frontend/src/
├── screens/
│   ├── GameScreen.tsx          # Active practice session (owns game state)
│   └── ResultsScreen.tsx       # Post-round summary + history list
│
├── components/
│   ├── PromptDisplay.tsx       # Shows current root + interval (TEXT ONLY for MVP)
│   └── ScoreDisplay.tsx        # Score/timer display
│
├── hooks/
│   ├── useMIDI.ts              # MIDI device I/O and event parsing
│   └── useGameLogic.ts         # Game state machine (reducer-based)
│
├── services/
│   └── api.ts                  # Backend HTTP communication
│
├── utils/
│   ├── types.ts                # TypeScript interfaces
│   ├── formatters.ts           # Display formatters (note names, intervals)
│   └── midi.ts                 # MIDI utility functions
│
├── config/
│   └── lessons.ts              # Lesson configurations (note ranges, timing)
│
├── App.tsx                     # Top-level app (screen routing)
└── main.tsx                    # Vite entry point
```

**Note:** `KeyboardVisualizer.tsx` removed from MVP - using text display only.

---

## Architectural Principles

### 1. Clean Separation of Concerns
- **Screens** own state and orchestrate hooks
- **Components** are presentational (receive props, emit events)
- **Hooks** encapsulate complex logic (MIDI I/O, game state machine)
- **Services** handle external communication (API calls)
- **Utils** provide pure functions (formatters, conversions)

### 2. Data Model Philosophy (Inherited from Backend)
> "The database captures what happened and when. Analytics and derived metrics are calculated at query time, not during data collection."

**Frontend Implications:**
- Store raw timestamps, calculate deltas in UI
- MIDI numbers are source of truth, note names are display sugar
- Semitones stored as integers, interval names formatted for display

### 3. Type Safety First
- All API contracts defined as TypeScript interfaces
- State machine phases enforced via union types
- MIDI event parsing strongly typed
- No `any` types in production code

### 4. Performance Constraints
- MIDI input must feel instant (gaming-like latency required)
- Minimal processing in MIDI event callbacks
- State updates batched via reducer
- No heavy computation on render path

---

## State Management Architecture

### Hook Responsibilities

#### `useMIDI()` - Hardware I/O Layer
**Responsibility:** Connect to MIDI devices, parse messages, expose note events

**Interface:**
```typescript
interface MIDIHookReturn {
  isSupported: boolean;        // Web MIDI API available?
  isConnected: boolean;        // Device connected?
  error: string | null;        // Connection error message
  activeNotes: Set<number>;    // Currently held notes
  lastEvent: {
    type: 'noteOn' | 'noteOff';
    note: number;              // MIDI note number (0-127)
    timestamp: number;         // Unix seconds (not milliseconds!)
  } | null;
}

function useMIDI(
  onNoteOn: (note: number, timestamp: number) => void,
  onNoteOff: (note: number, timestamp: number) => void
): MIDIHookReturn
```

**Critical Implementation Details:**
1. **Velocity=0 handling:** `noteOn` with velocity=0 is actually `noteOff`
2. **Timestamp conversion:** Convert to seconds: `Date.now() / 1000`
3. **Device state monitoring:** Listen for `onstatechange` to detect disconnection
4. **Permission handling:** Request MIDI access on mount, handle denial gracefully

**Error Handling (MVP):**
```typescript
if (!navigator.requestMIDIAccess) {
  alert('Web MIDI API not supported. Please use Chrome browser.');
  return;
}

navigator.requestMIDIAccess()
  .catch(() => {
    alert('MIDI access denied. Please grant permission and reload.');
  });
```

---

#### `useGameLogic()` - State Machine + Game Engine
**Responsibility:** Manage game flow, validate responses, orchestrate API calls

**Interface:**
```typescript
function useGameLogic(config: LessonConfig): {
  state: GameState;
  startRound: () => void;
  handleNoteInput: (note: number, timestamp: number) => void;
  completeRound: () => Promise<void>;
}
```

**State Machine:**

```
┌─────────────┐
│   waiting   │  ← Initial state each prompt
└──────┬──────┘
       │ NOTE_ON (root matches)
       ↓
┌─────────────┐
│ root_played │  ← Root note confirmed
└──────┬──────┘
       │ NOTE_ON (interval)
       ├─ correct → advance to next prompt
       └─ incorrect → ┌────────────┐
                      │ correction │  ← Hold root 2s, hold interval 2s (NO ESCAPE)
                      └────────────┘
```

**Round Completion Flow (OPTION B - SIMPLIFIED):**

```typescript
async function completeRound() {
  // 1. Create round with final totals
  const roundData: RoundData = {
    lessonType: 'intervals_ascending',
    totalAttempts: state.attempts.length,
    correctCount: state.score.correct,
    startedAt: state.roundStartedAt,
    completedAt: Date.now() / 1000,
  };

  try {
    const { id: roundId } = await api.createRound(roundData);

    // 2. Batch log all attempts with the round ID
    await Promise.all(
      state.attempts.map(attempt =>
        api.logAttempt({ ...attempt, roundId })
      )
    );

    dispatch({ type: 'ROUND_COMPLETED' });
  } catch (err) {
    alert(`Failed to save round: ${err.message}`);
    // User can retry manually or abandon
  }
}
```

**Benefits of Option B:**
- No placeholder rounds in database
- No update endpoint needed
- Simpler implementation
- Acceptable data loss on refresh for MVP

---

### Component Data Flow

```
App.tsx
  ├─ manages screen state ('game' | 'results')
  └─ passes config from lessons.ts

GameScreen.tsx
  ├─ owns: useGameLogic(config)
  ├─ owns: useMIDI(onNoteOn, onNoteOff)
  ├─ connects: MIDI events → game.handleNoteInput()
  │
  ├─> PromptDisplay (TEXT ONLY)
  │     props: { currentPrompt, attemptIndex, totalAttempts }
  │     displays: "Play C4 → Major 3rd (E4)"
  │
  └─> ScoreDisplay
        props: { score, elapsedSeconds }

ResultsScreen.tsx
  ├─ fetches: api.getRounds(limit)
  ├─ displays: last round summary + history list
  └─ emits: onStartNew() → switches to GameScreen
```

---

## Data Contracts (Frontend ↔ Backend)

### API Service Interface

**File:** `src/services/api.ts`

**Critical:** All timestamps must be **Unix seconds** (not milliseconds).

```typescript
const API_BASE = 'http://localhost:3000/api';

// POST /api/rounds - Create completed round
export async function createRound(data: RoundData): Promise<{ id: number }> {
  const response = await fetch(`${API_BASE}/rounds`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return await response.json();
}

// POST /api/attempts - Log individual attempt
export async function logAttempt(data: AttemptData): Promise<{ id: number }> {
  const response = await fetch(`${API_BASE}/attempts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return await response.json();
}

// GET /api/rounds?limit=N - Fetch round history
export async function getRounds(limit: number = 10): Promise<RoundResponse[]> {
  const response = await fetch(`${API_BASE}/rounds?limit=${limit}`);

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return await response.json();
}
```

---

## Configuration Strategy

### File: `src/config/lessons.ts`

**Approach:** TypeScript constants for type safety and simplicity.

```typescript
export const LESSON_CONFIGS = {
  intervals_ascending: {
    name: "Ascending Intervals",
    promptsPerRound: 20,
    noteRange: { min: 48, max: 72 },    // C3-C5
    intervalRange: { min: 1, max: 12 }, // All intervals up to octave
    correctionHoldTime: 2000,           // 2 seconds
  }
} as const;

export const DEFAULT_LESSON: LessonType = 'intervals_ascending';

export type LessonType = keyof typeof LESSON_CONFIGS;
```

---

## Critical Implementation Details

### 1. Timestamp Handling (CRITICAL)

**Problem:** JavaScript `Date.now()` returns **milliseconds**, backend expects **seconds**.

**Solution:** Convert at every capture point.

```typescript
// ✅ CORRECT
const timestamp = Date.now() / 1000; // 1702345678.123 (seconds)
```

**Enforcement Points:**
1. `useMIDI` hook: `Date.now() / 1000`
2. `useGameLogic` reducer: Store all timestamps as seconds
3. Round start/complete: `Date.now() / 1000`

---

### 2. MIDI Event Parsing (CRITICAL)

**Correct Parsing:**
```typescript
function handleMIDIMessage(message: WebMidi.MIDIMessageEvent) {
  const [status, note, velocity] = message.data;
  const timestamp = Date.now() / 1000; // Convert to seconds!

  if (status === 144 && velocity > 0) {
    onNoteOn(note, timestamp);
  } else if (status === 128 || (status === 144 && velocity === 0)) {
    onNoteOff(note, timestamp);
  }
}
```

---

### 3. Correction Mechanic Implementation

**Requirements:**
- User plays incorrect interval
- Must hold root note for 2 seconds
- Then hold correct interval note for 2 seconds
- **NO ESCAPE HATCH** - must complete to advance
- Text feedback: "Hold C4... now hold E4..."

**Timer Logic:**
```typescript
useEffect(() => {
  if (state.phase !== 'correction') return;

  const checkCorrectionProgress = () => {
    const now = Date.now() / 1000;

    if (state.correctionState.rootHeldSince) {
      const rootHoldDuration = now - state.correctionState.rootHeldSince;
      if (rootHoldDuration >= config.correctionHoldTime / 1000) {
        // Root requirement met, now wait for interval
      }
    }

    if (state.correctionState.intervalHeldSince) {
      const intervalHoldDuration = now - state.correctionState.intervalHeldSince;
      if (intervalHoldDuration >= config.correctionHoldTime / 1000) {
        dispatch({ type: 'CORRECTION_COMPLETE' });
      }
    }
  };

  const interval = setInterval(checkCorrectionProgress, 100);
  return () => clearInterval(interval);
}, [state.phase, state.correctionState, config]);
```

---

## Error Handling Strategy (MVP)

### Simple Alert Dialogs

```typescript
// MIDI errors
if (!navigator.requestMIDIAccess) {
  alert('Web MIDI API not supported. Please use Chrome browser.');
}

// API errors
catch (err) {
  alert(`Failed to save round: ${err.message}`);
}

// Device disconnect
if (event.port.state === 'disconnected') {
  alert('MIDI device disconnected. Please reconnect and reload.');
}
```

**No Retry Logic:** Show error, let user decide to retry or abandon.

---

## Utility Functions

### File: `src/utils/midi.ts`

```typescript
export function midiToNoteName(midiNote: number): string {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(midiNote / 12) - 1;
  const noteName = noteNames[midiNote % 12];
  return `${noteName}${octave}`;
}

export function calculateIntervalTarget(rootMidi: number, semitones: number): number {
  return rootMidi + semitones;
}
```

### File: `src/utils/formatters.ts`

```typescript
export function semitonesToIntervalName(semitones: number): string {
  const intervals = [
    'Unison', 'Minor 2nd', 'Major 2nd', 'Minor 3rd', 'Major 3rd',
    'Perfect 4th', 'Tritone', 'Perfect 5th', 'Minor 6th', 'Major 6th',
    'Minor 7th', 'Major 7th', 'Octave'
  ];
  return intervals[semitones] || `${semitones} semitones`;
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function calculateReactionTime(attempt: AttemptData): number | null {
  if (!attempt.rootNotePlayedAt) return null;
  return (attempt.rootNotePlayedAt - attempt.promptDisplayedAt) * 1000; // ms
}
```

---

## Testing Strategy (MVP)

### Manual Testing Focus Areas

**Priority 1: MIDI Event Handling**
- Connect keyboard, verify notes register instantly
- Test rapid note sequences
- Disconnect keyboard mid-round

**Priority 2: State Machine Transitions**
- Complete full round (20 prompts)
- Trigger correction mechanic (wrong interval)
- Test hold timers (2s root, 2s interval)

**Priority 3: Data Persistence**
- Complete 3 rounds
- Query database: verify all attempts logged
- Verify timestamps are Unix seconds (not milliseconds)

**Priority 4: Error Scenarios**
- Start frontend without backend running
- Deny MIDI permission
- Network error during API call

### Database Verification

```bash
# Verify rounds logged correctly
sqlite3 backend/database.db "SELECT id, lesson_type, total_attempts, correct_count FROM rounds ORDER BY id DESC LIMIT 5;"

# Verify timestamps are seconds (not milliseconds)
sqlite3 backend/database.db "SELECT prompt_displayed_at, root_note_played_at FROM attempts LIMIT 1;"
```

---

## Implementation Sequence

### Phase 1: Foundation
1. Initialize Vite React TypeScript project
2. Create directory structure
3. Define all types in `types.ts`
4. Create `midi.ts` and `formatters.ts` utilities
5. Create `lessons.ts` config
6. Create `api.ts` service (stub functions)

### Phase 2: MIDI Integration
7. Implement `useMIDI` hook
8. Create simple test component to display MIDI input
9. Verify latency is acceptable
10. Test error modes (no device, access denied)

### Phase 3: Game Logic
11. Implement `useGameLogic` reducer skeleton
12. Implement prompt generation
13. Wire MIDI input to game logic
14. Test state transitions manually

### Phase 4: UI Components
15. Create `PromptDisplay.tsx` (text only)
16. Create `ScoreDisplay.tsx`
17. Create `GameScreen.tsx` (wire everything together)

### Phase 5: Data Persistence
18. Implement round completion flow (Option B)
19. Test full round end-to-end
20. Verify database entries
21. Create `ResultsScreen.tsx`

### Phase 6: Correction Mechanic
22. Implement correction state logic
23. Add correction timers
24. Add text feedback ("Hold C4...")
25. Test thoroughly

### Phase 7: Error Handling
26. Add alert() dialogs for all error cases
27. Test all error scenarios

---

## Post-MVP Enhancements (Deferred)

- Visual keyboard component with highlighted keys
- Fancy error UI (toasts, modals)
- Session state persistence (`sessionStorage`)
- API retry logic with `localStorage` queue
- Correction escape hatch (skip button)
- Pause/resume functionality
- Multiple lesson types

---

## Final Checklist Before Implementation

- [ ] All TypeScript types defined in `types.ts`
- [ ] Timestamp conversion strategy documented
- [ ] Round completion flow (Option B) understood
- [ ] Error handling strategy (alert dialogs) accepted
- [ ] No visual keyboard for MVP (text only)
- [ ] No correction escape hatch (must complete)
- [ ] No state persistence on refresh (acceptable loss)
- [ ] Backend API contracts match exactly

**Status:** ✅ Ready for implementation
