import type { LessonConfig } from "../utils/types";

export const LESSON_CONFIGS  = {
    intervals_ascending: {
        name: "Ascending Intervals",
        description: "Practice playing intervals ascending from a root note",
        promptsPerRound: 20,
        noteRange: {min:60, max: 72},
        intervalRange: {min:1, max: 12},
        correctionHoldTime: 2000
    }
} as const satisfies Record<string, LessonConfig>;

export const DEFAULT_LESSON: LessonType = 'intervals_ascending';

export type LessonType = keyof typeof LESSON_CONFIGS;