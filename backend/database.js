import Database from "better-sqlite3";

const db = new Database("database.db");


// ---------------------------------------- //
//           PREPARE STATEMENTS             //
//    Compile SQL once, reuse many times    //
// ---------------------------------------- //
const insertRoundStatement = db.prepare(`
    INSERT INTO rounds (
        lesson_type,
        total_attempts,
        correct_count,
        started_at,
        completed_at
    )
    VALUES (?, ?, ?, ?, ?) -- 5 Placeholders
`);

const insertAttemptStatement = db.prepare(`
  INSERT INTO attempts (
    round_id,
    root_note_midi,
    root_note_name,
    interval_semitones,
    expected_note_midi,
    expected_note_name,
    played_note_midi,
    played_note_name,
    correct,
    prompt_displayed_at,
    root_note_played_at,
    interval_note_played_at,
    attempt_completed_at
  )
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) -- 13 Placeholders
`);

const getRoundsStatement = db.prepare(`
    SELECT * FROM rounds
    ORDER BY created_at DESC
    LIMIT ?
`)


// ---------------------------------------- //
//           EXPORT FUNCTIONS               //
// Export functions that use the statements //
// ---------------------------------------- //

export function createRound(data) {
    const info = insertRoundStatement.run(
        data.lesson_type,
        data.total_attempts, 
        data.correct_count, 
        data.started_at, 
        data.completed_at
    );
    return info.lastInsertRowid;
}

export function createAttempt(data) {
    insertAttemptStatement.run(
        data.round_id,
        data.root_note_midi,
        data.root_note_name,
        data.interval_semitones,
        data.expected_note_midi,
        data.expected_note_name,
        data.played_note_midi,
        data.played_note_name,
        data.correct,
        data.prompt_displayed_at,
        data.root_note_played_at,
        data.interval_note_played_at,
        data.attempt_completed_at
    );
}

export function getRounds(limit = 10) {
  return getRoundsStatement.all(limit);
}