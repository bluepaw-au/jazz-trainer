
/**
 * Convert MIDI note number to note name with octave.
 * @param midiNote MIDI note number (0-127)
 * @returns Note name with octave (e.g., "C4", "F#3")
 */
export function midiToNoteName(midiNote: number): string {
    
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#','G','G#','A','A#','B'];

    const octave = Math.floor(midiNote / 12) - 1;
    const noteName = noteNames[midiNote % 12] + octave; // Modulus by 12 gives the note position in chromatic scale (E.G. 60 % 12 = 0 = C)
    
    return noteName;
}

/**
 * Calculate the target MIDI note for an interval from a root note.
 * @param rootMidi Root note MIDI number
 * @param semitones Interval in semitones (1-12)
 * @returns Target MIDI note number
 */

export function calcIntervalTarget(rootMidi: number, semitones: number): number {
    // Given a root note and interval, calculate the expected MIDI note
    return rootMidi + semitones;
}