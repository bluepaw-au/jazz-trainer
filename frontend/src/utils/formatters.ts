import type { AttemptData } from "./types";

/**
 * Convert semitones to interval name.
 * @param semitones Number of semitones (0-12)
 * @returns Interval name (e.g., "Major 3rd")
 */
export function semitonesToIntervalName(semitones: number): string {
    
    const intervalNames = [
        "Unison",
        "Minor 2nd",
        "Major 2nd",
        "Minor 3rd",
        "Major 3rd",
        "Perfect 4th",
        "Tritone",
        "Perfect 5th",
        "Minor 6th",
        "Major 6th",
        "Minor 7th",
        "Major 7th",
        "Octave", // 12, 24, 32
    ];
    if(semitones > 12) {
        const octaves = Math.floor(semitones/12); // Get number of octaves

        // Check for "Unison/Octave" due to unison and octave being the same interval.
        if (semitones % 12 === 0){ 
            return `Octave (+${octaves -1} ${octaves>1 ? 'Octaves' : 'Octave'})`
        }
        return `${intervalNames[semitones%12]} (+${octaves} ${octaves>1 ? 'Octaves' : 'Octave'})`;
    }
    return intervalNames[semitones];
}

/**
 * Convert semitones to interval abbreviation.
 * @param semitones Number of semitones (0-12)
 * @returns Interval abbreviation (e.g., "M3")
 */
export function semitonesToIntervalAbbr(semitones: number): string {
    const intervalAbbreviations = [
        "P1",
        "m2",
        "M2",
        "m3",
        "M3",
        "P4",
        "TT",
        "P5",
        "m6",
        "M6",
        "m7",
        "M7",
        "P8"   
    ];
    if(semitones > 12) {
        // Check for "Unison/Octave" due to unison and octave being the same interval.
        if (semitones % 12 === 0){ 
            return `P8`
        }
        return `${intervalAbbreviations[semitones%12]}`;
    }
    return intervalAbbreviations[semitones];
}

/**
 * Format duration in seconds to MM:SS.
 * @param seconds Duration in seconds
 * @returns Formatted duration (e.g., "2:05")
 */
export function formatDuration(seconds: number): string {
    const displayMinutes = Math.floor(seconds/60).toString();
    const displaySeconds = Math.floor(seconds%60).toString().padStart(2, '0'); 
    return `${displayMinutes}:${displaySeconds}`;
}

/**
 * Calculate reaction time (prompt displayed → root note played).
 * @param attempt Attempt data
 * @returns Reaction time in milliseconds, or null if data missing
 */

export function calcReactionTime(attempt: AttemptData): number | null {
    if(attempt.prompt_displayed_at === null || attempt.root_note_played_at === null){
        return null;
    }
    return (attempt.root_note_played_at - attempt.prompt_displayed_at)*1000;
}

/**
 * Calculate execution time (prompt displayed → root note played).
 * @param attempt Attempt data
 * @returns Reaction time in milliseconds, or null if data missing
 */
export function calcExecutionTime(attempt: AttemptData): number | null {
    if(attempt.root_note_played_at === null || attempt.interval_played_at === null){
        return null;
    }
    return (attempt.interval_played_at - attempt.root_note_played_at)*1000;;
}