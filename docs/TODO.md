# Implementation Checklist

## Current Status: 🔨 Phase 2 - Backend Setup In Progress

---

## Phase 1: Technical Validation ✅ COMPLETE

- [x] Test Web MIDI API with Casio keyboard
- [x] Confirm latency is acceptable (Chrome)
- [x] Verify MIDI event structure (noteOn/noteOff)
- [x] Confirm browser choice (Chrome required, Safari unsupported)

**Result:** Web MIDI API validated. Latency imperceptible for this use case. Chrome is target browser.

---

## Phase 2: Foundation Setup

### Backend Setup
- [x] Initialize Node/Express project
- [x] Install dependencies (express, better-sqlite3, cors)
- [x] Create database schema (use `DATABASE_SCHEMA.md` as reference)
- [x] Create database initialization script
- [ ] Set up basic Express server structure
- [x] Create SQLite database connection module
- [ ] Create API endpoint: `POST /api/rounds` (start new round)
- [ ] Create API endpoint: `POST /api/attempts` (log attempt)
- [ ] Create API endpoint: `GET /api/rounds` (fetch round history)
- [ ] Test endpoints with curl or Postman

### Frontend Setup
- [ ] Initialize React project (Vite or Create React App)
- [ ] Install dependencies (none required for MVP beyond React)
- [ ] Set up project structure (components, utils, types)
- [ ] Create `formatters.ts` utility file
  - [ ] `midiToNoteName()` function
  - [ ] `semitonesToIntervalName()` function
  - [ ] Timing calculation functions
- [ ] Create `types.ts` for TypeScript interfaces (Attempt, Round, etc.)

### Development Environment
- [ ] Set up concurrent dev script (run backend + frontend together)
- [ ] Configure CORS for local development
- [ ] Test backend/frontend communication

---

## Phase 3: Core Functionality - Interval Drill

### MIDI Integration
- [ ] Create `useMIDI` React hook
- [ ] Request MIDI access on component mount
- [ ] Handle MIDI device connection/disconnection
- [ ] Parse MIDI messages (noteOn/noteOff)
- [ ] Convert MIDI note numbers to usable format
- [ ] Test MIDI input displays in real-time

### Game Logic
- [ ] Create game state management (useState or useReducer)
  - Current round status (waiting/active/complete)
  - Current prompt (root note, interval)
  - Current score
  - Attempt history for current round
- [ ] Implement prompt generation logic
  - Random root note selection (define range, e.g., C3-C5)
  - Random interval selection (1-12 semitones)
  - Calculate expected note
- [ ] Implement validation logic
  - Compare played note to expected note (exact match)
  - Update score
  - Track timing data
- [ ] Implement correction mechanic
  - Detect incorrect answer
  - Enter correction state
  - Require hold root note for 2 seconds
  - Require hold correct interval for 2 seconds
  - Visual feedback during correction
  - Exit correction state and continue

### UI Components
- [ ] Create `<KeyboardVisualizer>` component
  - Display top-down keyboard view
  - Highlight prompted root note
  - Highlight expected interval note during correction
  - Show played notes
- [ ] Create `<PromptDisplay>` component
  - Show current root note
  - Show current interval (formatted)
  - Clear, readable typography
- [ ] Create `<ScoreDisplay>` component
  - Current score (correct/total)
  - Round timer
  - Accuracy percentage
- [ ] Create `<GameScreen>` component (main practice interface)
  - Integrate all above components
  - Handle game state transitions
- [ ] Create `<ResultsScreen>` component
  - Show round summary (score, time, accuracy)
  - Display list of past rounds
  - Button to start new round

### Data Persistence
- [ ] Implement attempt logging
  - Capture all required fields (see DATABASE_SCHEMA.md)
  - Calculate derived fields (note names)
  - POST to `/api/attempts` endpoint
- [ ] Implement round logging
  - Capture round summary data
  - POST to `/api/rounds` endpoint
- [ ] Implement round history fetching
  - GET from `/api/rounds` endpoint
  - Display in results screen

---

## Phase 4: Configuration & Polish

### Configuration
- [ ] Create config file (or .env) for:
  - Number of prompts per round (default: 20)
  - MIDI note range (default: 48-72, C3-C5)
  - Interval range (default: 1-12 semitones)
  - Correction hold time (default: 2000ms)
- [ ] Load config on app start
- [ ] Use config values throughout app

### Visual Polish
- [ ] Basic styling (CSS/Tailwind)
- [ ] Responsive layout
- [ ] Visual feedback for correct/incorrect
- [ ] Smooth transitions between states
- [ ] Loading states for API calls

### Error Handling
- [ ] Handle MIDI device disconnection gracefully
- [ ] Handle database errors gracefully
- [ ] Display user-friendly error messages
- [ ] Prevent app crashes on edge cases

---

## Phase 5: Testing & Validation

### Manual Testing
- [ ] Complete 5+ practice rounds end-to-end
- [ ] Verify all data is logging correctly to database
- [ ] Verify round history displays correctly
- [ ] Test correction mechanic thoroughly
- [ ] Test edge cases (quit mid-round, disconnect MIDI, etc.)

### Data Validation
- [ ] Query database directly to verify data structure
- [ ] Verify timestamps are recording correctly
- [ ] Verify all expected fields are populated
- [ ] Verify foreign key relationships work
- [ ] Export sample data to CSV, review manually

### Performance Check
- [ ] Verify MIDI input latency is acceptable during actual practice
- [ ] Verify UI remains responsive during rounds
- [ ] Check for memory leaks (long practice sessions)

---

## Phase 6: Real-World Usage

### Daily Practice Integration
- [ ] Use the app for actual practice sessions for 1 week
- [ ] Note any friction points or missing features
- [ ] Gather subjective feedback on usefulness
- [ ] Track whether it's actually being used consistently

### Iteration Decision Point
Based on 1 week of real usage:
- Is the MVP solving the problem?
- Is MIDI latency actually acceptable in practice?
- Is the correction mechanic helping or hindering?
- What's the highest-value next feature?

**Decision:** Continue with chord lessons, or iterate on interval drill, or add analytics?

---

## Future Phases (Post-MVP)

See `FUTURE_FEATURES.md` for detailed feature roadmap.

**Likely next steps:**
1. Add analytics dashboard (visualize performance over time)
2. Implement adaptive difficulty (focus on weak intervals)
3. Add chord lessons (maj7, m7, dom7)
4. Add ii-V-I progression drills

---

## Notes

### Quick Reference Commands
```bash
# Start backend
cd backend && npm run dev

# Start frontend
cd frontend && npm run dev

# Start both (with concurrently)
npm run dev

# Query database directly
sqlite3 backend/database.db "SELECT * FROM rounds ORDER BY created_at DESC LIMIT 10;"
```

### Critical Implementation Reminders
- Store MIDI numbers, derive note names at insert time
- Store raw timestamps, calculate deltas at query time
- Exact match validation only (no "close enough")
- Chrome only, Safari doesn't support Web MIDI
- Correction is forced attention, not retry mechanism
- Data first: capture everything even if not displayed in UI yet
