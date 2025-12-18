export interface Range {
  min: number;
  max: number;
}

// ============================================
// Domain Types (Game Logic)
// ============================================

export interface Prompt {
    rootMidi: number;           // MIDI Note number (0-127)
    intervalSemitones: number;
    expectedMidi: number;       // MIDI Note number (0-127)
}

export interface LessonConfig {
    name: string;
    description?: string;
    promptsPerRound: number;
    noteRange: Range;        // MIDI Note numbers (0-127)
    intervalRange: Range;    // MIDI Note numbers (0-127)
    correctionHoldTime: number; // milliseconds
}

export interface GameState {
    phase: 'idle' | 'waiting' | 'root_played' | 'correction' | 'complete';

    roundStartedAt: number | null; // Unix seconds
    currentPromptIndex: number;
    prompts: Prompt[];

    // Current attempt temporal tracking (resets each prompt)
    currentPromptDisplayedAt: number | null;
    currentRootPlayedAt: number | null;

    // Score tracking for current round
    score: {
        correct: number;
        total: number;
    }

    // Completed attempts (immutable once added)
    attempts: AttemptData[];

    // Correction state (only populated when phase === 'correction')
    correctionState: {
        rootHeldSince: number | null;
        intervalHeldSince: number | null;
    } | null;

}


// ============================================
// API Contract Types (Backend Communication)
// ============================================

export interface RoundData {
    lesson_type: string;    
    total_attempts: number; 
    correct_count: number;  
    started_at: number;     // Unix seconds
    completed_at: number;   // Unix seconds
}

export interface AttemptData {
    round_id: number;
    prompt_displayed_at: number;
    root_note_midi: number;
    root_note_name: string;
    interval_semitones: number;
    expected_note_midi: number;
    expected_note_name: string;
    played_note_midi: number | null;
    played_note_name: string | null;
    correct: boolean;
    root_note_played_at: number | null;
    interval_played_at: number | null;
}

export interface RoundResponse {
    id: number;
    lesson_type: string;
    total_attempts: number;
    correct_count: number;
    started_at: number;
    completed_at: number;
    created_at: number;
}


// ============================================
// Midi Types (Backend Communication)
// ============================================

/**
 * Represents a parsed MIDI message from the keyboard.
 */
export interface MIDIEvent {
    type: 'noteOn' | 'noteOff';
    note: number;       // MIDI Note number (0-127)
    timestamp: number;  // Unix seconds (not milliseconds)
}

/**
 * Current state of midi for use in GameScreen.
 */
export interface MIDIHookReturn {
    isSupported: boolean;        // Web MIDI API available?
    isConnected: boolean;        // Device connected?
    error: string | null;        // Connection error message
    activeNotes: Set<number>;    // Currently held notes
    lastEvent: MIDIEvent | null; // Most recent note event
}