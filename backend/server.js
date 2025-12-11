import cors from 'cors';
import express from 'express';

import {createRound, createAttempt, getRounds} from './database.js';

// 2. Create app instance
const app = express();
const port = process.env.PORT || 3000;

// 3. Middleware
// Only affects INCOMING requests and data, not sending.
app.use(cors());
app.use(express.json());


/**
 * Quick Reference for callback parameters in Express.js
 * 
 * 1. Request Object (req)
 * Common properties:
 * req.body - Parsed request body (needs express.json() middleware for JSON)
 * req.params - URL parameters from route patterns like /users/:id → req.params.id
 * req.query - Query string parameters like ?limit=10 → req.query.limit
 * req.headers - HTTP headers from the request
 * req.method - HTTP method (GET, POST, etc.)
 * 
 * 2. Response Object (res)
 * Common methods:
 * res.json(data) - Send JSON response (200 status by default)
 * res.status(code) - Set status code (chainable: res.status(404).json({error: 'Not found'}))
 * res.send(data) - Send response (auto-detects type)
 * res.sendStatus(code) - Send just status code with default message
 */


// 4. Route handlers
app.get('/api/rounds', (req, res) => {
    const rounds = getRounds(req.query.limit);
    res.json(rounds);
});

app.post('/api/rounds', (req, res) => {
    const data = req.body;
    const isValid = data.lesson_type != null        && typeof data.lesson_type === 'string'
                    && data.total_attempts != null  && typeof data.total_attempts === 'number'
                    && data.correct_count != null   && typeof data.correct_count === 'number'
                    && data.started_at != null      && typeof data.started_at === 'number'       // Unix timestamp (REAL) e.g. 1702345678.123
                    && data.completed_at != null    && typeof data.completed_at === 'number';    // Unix timestamp (REAL) e.g. 1702345678.123    
    
    if(!isValid){
        res.status(400).json({ error: 'Invalid request format' })
        return;
    }

    // Validation successful send request to DB
    const newRoundId = createRound(req.body);
    res.json({id: newRoundId});
});

app.post('/api/attempts', (req, res) => {
    const data = req.body;
    const isValid = data.round_id != null                   && typeof data.round_id === 'number'

                    // PROMPTED NOTES
                    && data.root_note_midi != null          && typeof data.root_note_midi === 'number'
                    && data.root_note_name != null          && typeof data.root_note_name === 'string'
                    && data.interval_semitones != null      && typeof data.interval_semitones === 'number'
                    && data.expected_note_midi != null      && typeof data.expected_note_midi === 'number'
                    && data.expected_note_name != null      && typeof data.expected_note_name === 'string'

                    // PLAYED NOTES (OPTIONAL)
                    && ( data.played_note_midi == null      || typeof data.played_note_midi === 'number' )
                    && ( data.played_note_name == null      || typeof data.played_note_name === 'string' )

                    // OUTCOME
                    && data.correct != null                 && typeof data.correct === 'boolean'

                    // TIMELINE - Raw timestamps, deltas calculated at query time.
                    && data.prompt_displayed_at != null     && typeof data.prompt_displayed_at === 'number'    // Unix timestamp (REAL) e.g. 1702345678.123
                    && data.attempt_completed_at != null    && typeof data.attempt_completed_at === 'number'    // Unix timestamp (REAL) e.g. 1702345678.123

                    // Optional Timestamps
                    && (data.root_note_played_at == null        || typeof data.root_note_played_at === 'number')    // Unix timestamp (REAL) e.g. 1702345678.123
                    && (data.interval_note_played_at == null    || typeof data.interval_note_played_at === 'number');    // Unix timestamp (REAL) e.g. 1702345678.123

    if(!isValid){
        res.status(400).json({ error: 'Invalid request format' })
        return;
    }

    const newAttemptId = createAttempt(req.body);
    res.json({id: newAttemptId});
});

// 5. Start server
app.listen(port, () => {
    console.log("server is running on http://localhost:" + port);
});