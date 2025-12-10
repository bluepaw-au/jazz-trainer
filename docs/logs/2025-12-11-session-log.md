# Session Log: 2025-12-11

## Session Overview
**Duration:** ~1-2 hours
**Phase:** Phase 2 - Backend Setup
**Focus:** Database layer implementation and Express fundamentals

---

## What Was Accomplished

### 1. Backend Project Initialization
- Created `backend/` directory structure
- Set up `package.json` with ES module support
- Installed dependencies: `express`, `cors`, `better-sqlite3`
- Configured dev script with `--watch` flag for auto-restart

### 2. Database Schema Implementation
- Created `init-db.js` - Database initialization script
- Translated schema from DATABASE_SCHEMA.md into SQL CREATE statements
- Implemented both tables: `rounds` and `attempts`
- Added foreign key relationship (attempts → rounds)
- Created four indexes for query optimization:
  - `idx_attempts_round` - For filtering by round
  - `idx_attempts_interval` - For interval-specific analytics
  - `idx_attempts_correct` - For filtering by correctness
  - `idx_attempts_created` - For time-based queries
- Successfully ran initialization and verified schema with `sqlite3 .schema`

### 3. Database Operations Module
- Created `database.js` - SQLite connection and prepared statements
- Implemented three core functions:
  - `createRound(data)` - Inserts new round, returns ID
  - `createAttempt(data)` - Inserts attempt data
  - `getRounds(limit)` - Fetches recent rounds
- Used prepared statements for security and performance
- Leveraged SQLite's `DEFAULT CURRENT_TIMESTAMP` for automatic timestamps

---

## Key Learning Moments

### Express Architecture Understanding
- Grasped the "receptionist" mental model for Express
- Understood middleware chain execution (CORS → JSON parser → router → handler)
- Learned separation of concerns: server.js (HTTP) vs database.js (SQL)

### SQL Fundamentals Refresher
- **Primary keys**: Unique identifiers for rows, automatically indexed
- **Foreign keys**: Relationship constraints between tables
- **Indexes**: Performance optimization for frequently queried columns
- **Prepared statements**: Pre-compiled SQL with `?` placeholders for security

### Better-SQLite3 Specifics
- `.prepare()` - Compiles SQL once, reuse many times
- `.run()` - Execute statement, returns info with `lastInsertRowid`
- `.all()` - Returns all matching rows as array
- Synchronous API (simpler than async alternatives for this use case)

### Development Techniques Discovered
- SQL formatting: Multi-line template literals for readability
- Placeholder counting: Visual alignment prevents mismatches
- Multi-cursor editing: Copy columns, paste as placeholders, bulk replace with `?`
- `DEFAULT CURRENT_TIMESTAMP`: Let database handle timestamps automatically

---

## Technical Decisions Made

1. **ES Modules over CommonJS**: Using `import/export` for consistency with frontend
2. **better-sqlite3 over sqlite3**: Synchronous API simpler for MVP
3. **No ORM**: Direct SQL for learning and full control (3 endpoints don't justify ORM complexity)
4. **Option 3 for init-db.js**: Simple CREATE without `IF NOT EXISTS` - manual control via file deletion
5. **Omit `created_at` from INSERT**: Leveraging SQLite's DEFAULT for automatic timestamping

---

## Files Created

```
backend/
├── package.json           # Project config with ES modules and dependencies
├── init-db.js             # Database initialization script (run once)
├── database.js            # SQLite operations module (3 functions)
├── database.db            # SQLite database file (generated)
├── node_modules/          # Installed dependencies
└── package-lock.json      # Locked dependency versions
```

---

## What's Next (Tomorrow's Session)

### Immediate Next Steps
1. Create `server.js` - Express application setup
   - Import dependencies (express, cors, database functions)
   - Configure middleware (CORS, JSON parser)
   - Implement three route handlers:
     - `POST /api/rounds` - Start new round
     - `POST /api/attempts` - Log attempt
     - `GET /api/rounds` - Fetch round history
   - Start listening on port 3000

2. Test backend with curl
   - Create a test round
   - Log test attempts
   - Fetch rounds to verify data flow

3. Verify database persistence
   - Query database directly with sqlite3
   - Check data structure and relationships

### Blockers / Open Questions
None currently - clear path forward for completing backend setup.

---

## Observations & Reflections

### What Went Well
- Strong conceptual understanding before coding (mental models helped)
- Caught errors quickly (placeholder mismatches, typos)
- Discovered formatting techniques that improve maintainability
- Documentation-first approach paid off (schema translation was straightforward)

### What Was Challenging
- Initial unfamiliarity with SQL syntax (quickly resolved with explanation)
- Tedious placeholder counting (solved with formatting and comments)
- Understanding when to use DEFAULT vs explicit values (timestamps)

### Process Notes
- Question-first approach worked well for building understanding
- Breaking down Express into components (middleware, routing, handlers) made it less intimidating
- Comparing alternatives (ORMs vs raw SQL, placeholder strategies) helped inform decisions
- KISS principle applied successfully (Option 3 for init-db.js)

---

## Code Quality Notes

### Strengths
- Clean separation of concerns (init vs operations)
- Clear comments documenting placeholder counts
- Proper use of prepared statements (security + performance)
- Schema matches documentation exactly

### Potential Improvements for Later
- Error handling in database.js (currently assumes success)
- Could add validation before INSERT (but may be overkill for local tool)
- getRounds could optionally fetch attempts too (will address when building Express routes)

---

## Mentor Notes (Claude Code)

### Teaching Approach That Worked
- Systems thinking explanations (how pieces fit together)
- Trade-off analysis (ORM vs raw SQL, placeholder strategies)
- Real-world analogies (receptionist for Express, textbook index for database indexes)
- Letting user discover formatting improvements organically

### User Demonstrated
- Strong grasp of separation of concerns
- Good instinct for KISS principle
- Quick error detection and correction
- Asking "why" questions to build deeper understanding
- Applying learned patterns immediately (multi-line SQL formatting)

### Next Session Focus
- Route handler implementation
- Request/response cycle in practice
- Testing with curl (seeing the full stack in action)
- Error handling considerations
