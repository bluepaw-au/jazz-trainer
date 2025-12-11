# Jazz Piano Practice Trainer

A web-based MIDI practice tool for building automatic recall and motor skills for jazz piano fundamentals through gamified drill sessions with performance tracking.

## Overview

Learning jazz piano requires automatic recall of intervals, chords, and progressions from any root note. This tool provides instant validation via MIDI keyboard input, enforces correction on mistakes, and captures granular performance data for analysis.

**Current Status:** 🚧 In Development - Phase 2 (Backend Complete, Frontend Next)

## Features

### Current (MVP - Interval Drill)
- ✅ **MIDI Keyboard Integration** - Real-time input via Web MIDI API
- ✅ **Backend API** - Express.js REST API with three endpoints
- ✅ **Data Persistence** - SQLite database for attempts and rounds
- ⏳ **Random Interval Prompts** - Practice any interval from any root note
- ⏳ **Instant Validation** - Binary correct/incorrect feedback
- ⏳ **Forced Correction** - Hold correct answer for 2 seconds on mistakes
- ⏳ **Performance Tracking** - Score, timing, and round history

### Planned (Post-MVP)
- Chord lessons (maj7, m7, dom7)
- Adaptive difficulty (focus on weak intervals)
- Analytics dashboard with performance insights
- ii-V-I progression drills

## Tech Stack

- **Frontend:** React (TBD - Vite recommended)
- **Backend:** Node.js + Express 5
- **Database:** SQLite3 (better-sqlite3)
- **Input:** Web MIDI API (Chrome only)
- **Language:** JavaScript (ES Modules) + TypeScript (frontend)

## Project Structure

```
jazz-trainer/
├── backend/
│   ├── database.db          # SQLite database
│   ├── database.js          # Database operations module
│   ├── init-db.js           # Database initialization script
│   ├── server.js            # Express API server
│   └── package.json
├── docs/
│   ├── DATABASE_SCHEMA.md   # Database design documentation
│   ├── PROJECT_OVERVIEW.md  # High-level project vision
│   ├── TECHNICAL_CONTEXT.md # Technical decisions and patterns
│   ├── TODO.md              # Implementation checklist
│   └── logs/                # Session logs
└── frontend/                # (Coming soon)
```

## Getting Started

### Prerequisites

- Node.js 18+
- Chrome browser (Safari doesn't support Web MIDI API)
- MIDI keyboard connected to your computer

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/jazz-trainer.git
cd jazz-trainer
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Initialize the database:
```bash
node init-db.js
```

4. Start the backend server:
```bash
npm run dev
```

The server will run on `http://localhost:3000` with auto-restart on file changes.

### API Endpoints

**GET /api/rounds**
- Fetch round history
- Query param: `limit` (optional, default: 10)

**POST /api/rounds**
- Create a new practice round
- Body: `{ lesson_type, total_attempts, correct_count, started_at, completed_at }`

**POST /api/attempts**
- Log an individual attempt
- Body: `{ round_id, root_note_midi, root_note_name, interval_semitones, expected_note_midi, expected_note_name, correct, prompt_displayed_at, attempt_completed_at, ... }`

See `docs/DATABASE_SCHEMA.md` for complete field documentation.

## Database Schema

### Rounds Table
Stores summary data for each practice session.

| Field | Type | Description |
|-------|------|-------------|
| id | INTEGER | Primary key |
| lesson_type | TEXT | e.g., "intervals_ascending" |
| total_attempts | INTEGER | Number of prompts in round |
| correct_count | INTEGER | Number of correct answers |
| started_at | REAL | Unix timestamp (seconds) |
| completed_at | REAL | Unix timestamp (seconds) |
| created_at | DATETIME | Auto-generated timestamp |

### Attempts Table
Records each individual prompt and response.

| Field | Type | Description |
|-------|------|-------------|
| id | INTEGER | Primary key |
| round_id | INTEGER | Foreign key to rounds |
| root_note_midi | INTEGER | Starting note (MIDI number) |
| root_note_name | TEXT | e.g., "C4" |
| interval_semitones | INTEGER | Interval distance |
| expected_note_midi | INTEGER | Correct answer |
| expected_note_name | TEXT | e.g., "E4" |
| played_note_midi | INTEGER | User's response (nullable) |
| played_note_name | TEXT | User's response (nullable) |
| correct | BOOLEAN | True/false (stored as 1/0) |
| prompt_displayed_at | REAL | Unix timestamp |
| attempt_completed_at | REAL | Unix timestamp |
| ... | ... | Additional timing fields |

## Development

### Backend Development
```bash
cd backend
npm run dev  # Starts server with --watch flag
```

### Testing with curl

Create a round:
```bash
curl -X POST http://localhost:3000/api/rounds \
  -H "Content-Type: application/json" \
  -d '{
    "lesson_type": "intervals_ascending",
    "total_attempts": 20,
    "correct_count": 15,
    "started_at": 1702345678.123,
    "completed_at": 1702345698.456
  }'
```

Fetch rounds:
```bash
curl http://localhost:3000/api/rounds?limit=5
```

### Database Queries
```bash
# View all rounds
sqlite3 backend/database.db "SELECT * FROM rounds ORDER BY created_at DESC LIMIT 10;"

# View all attempts for a round
sqlite3 backend/database.db "SELECT * FROM attempts WHERE round_id = 1;"
```

## Documentation

- **[PROJECT_OVERVIEW.md](docs/PROJECT_OVERVIEW.md)** - Vision, problem statement, MVP scope
- **[TECHNICAL_CONTEXT.md](docs/TECHNICAL_CONTEXT.md)** - Architecture decisions and patterns
- **[DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md)** - Complete database design
- **[TODO.md](docs/TODO.md)** - Implementation checklist with progress tracking
- **Session Logs** - Detailed development notes in `docs/logs/`

## Design Principles

1. **Perfect Practice** - Only correct responses count; mistakes require correction
2. **Data First** - Capture everything from day one for future analytics
3. **Minimal Friction** - Keep hands on keys, no manual tracking
4. **Immediate Feedback** - Instant validation of responses

## Browser Compatibility

- ✅ Chrome/Chromium (required for Web MIDI API)
- ❌ Safari (no Web MIDI support)
- ❌ Firefox (limited Web MIDI support)

## Contributing

This is currently a personal learning project, but feedback and suggestions are welcome! Feel free to open an issue to discuss potential improvements.

## License

MIT License - See LICENSE file for details

## Acknowledgements

Built as a personal practice tool to support jazz piano learning. Inspired by the need for data-driven, friction-free practice sessions.

---

**Status:** Backend API complete and tested. Frontend development starting soon.
