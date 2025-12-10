# Jazz Piano Practice Trainer - Project Overview

## Purpose
A personal practice tool to build automatic recall and motor skills for jazz piano fundamentals through gamified, low-friction drill sessions with performance tracking.

## The Problem
Learning jazz piano requires automatic recall of intervals, chords, and progressions from any root note. Traditional practice methods (physical cards, manual tracking) introduce friction that disrupts focus on the keyboard and provides no performance feedback or data capture.

## The Solution
A web-based MIDI-connected practice app that:
- Prompts random intervals/chords from random root notes
- Validates responses instantly via MIDI keyboard input
- Enforces correction on mistakes (hold correct answer)
- Captures granular performance data for future analysis
- Displays basic performance metrics (score, time)

## Core Learning Path
1. **Intervals** - Play any interval from any root note instantly
2. **Core Chords** - Play maj7, m7, dom7 from any root note instantly  
3. **ii-V-I Progressions** - Play the progression from any root note instantly

## MVP Scope: Interval Drill Only

### What's Included
**Practice Loop:**
- Random root note displayed
- User plays root note on MIDI keyboard
- Random interval displayed (semitones or interval name)
- User plays interval
- Binary validation (correct/incorrect)
- Incorrect answers require correction: hold root 2s → hold correct interval 2s
- Configurable number of prompts per round (config file)

**Data Capture:**
- SQLite database logging every attempt:
  - Root note, interval prompted, note played, correctness, response time, timestamp
- Round summaries stored separately:
  - Round ID, total attempts, correct count, average response time, timestamp

**UI:**
- Top-down keyboard visualisation (or simple note display)
- Prompt display area (root note → interval name)
- Score and timer display
- Post-round simple list of past rounds (score, time, date)

### What's Excluded from MVP
- Configuration UI (use config file or .env)
- User profiles or authentication
- Adaptive difficulty or spaced repetition
- Chord detection and validation
- Advanced analytics dashboard
- Multiple lesson types

## Technical Foundation
- **Frontend:** React (running locally via dev server)
- **Backend:** Node/Express with SQLite
- **Input:** Web MIDI API for keyboard input
- **Deployment:** Local only, no hosting required

## Key Design Principles
- **Perfect Practice:** Only correct responses count, enforce correction on mistakes
- **Data First:** Capture everything from day one for future analytics systems
- **Minimal Friction:** Keep user engaged with keys, no manual tracking or card flipping
- **Immediate Feedback:** Instant validation of right/wrong responses

## Success Metrics (MVP)
- Can I complete 20+ interval drills per session without friction?
- Does MIDI input latency feel acceptable?
- Is score and time tracking sufficient to gauge improvement?
- Am I actually using it consistently?

## Next Phase Indicators
Once MVP is validated through consistent use:
- Add chord lessons (maj7, m7, dom7)
- Implement adaptive difficulty (focus on weak intervals)
- Build analytics dashboard for performance insights
- Add ii-V-I progression drills
