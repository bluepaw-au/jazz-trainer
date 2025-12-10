# Future Features & Ideas

This document captures potential features beyond MVP scope, organised by the learning and usability objectives they serve.

---

## 1. Intelligent Practice (Adaptive Learning)

**Objective:** Help user focus practice time on their actual weak spots, not random drills.

### Spaced Repetition System
- Track success rate per interval type (e.g., Major 3rd vs Tritone)
- Present struggling intervals more frequently
- Reduce frequency of mastered intervals
- Similar to Anki's algorithm but for motor skills

### Difficulty Progression
- Start with intervals from C only, expand to all root notes once mastered
- Progress from simple intervals (octaves, 5ths) to complex (tritones, major 7ths)
- Unlock new interval types based on performance thresholds

### Weak Spot Identification
- Analytics showing which specific interval combinations cause issues
- "C to F# is your weakest interval" type insights
- Suggested practice sessions targeting identified weaknesses

### Performance-Based Recommendations
- "You're ready to move from intervals to chords"
- "Your speed is good but accuracy needs work on [specific intervals]"
- Session recommendations based on recent performance trends

---

## 2. Expanded Lesson Content

**Objective:** Progress through the full jazz piano learning path within the same system.

### Chord Lessons
- Major 7th chords from any root
- Minor 7th chords from any root
- Dominant 7th chords from any root
- Validation logic: all required notes pressed (allow arpeggiation but penalise timing)
- Eventually: diminished, half-diminished, augmented, extended chords

### Chord Inversions & Voicings
- Root position, 1st inversion, 2nd inversion, 3rd inversion
- Shell voicings (root, 3rd, 7th only)
- Rootless voicings (3rd and 7th, common in jazz comping)
- Drop-2, drop-3 voicings

### Chord Progression Drills
- ii-V-I in all keys
- I-VI-ii-V progression
- Common jazz turnarounds
- Modal progressions

### Scales & Modes (Future Expansion)
- Major scales in all keys
- Melodic minor, harmonic minor
- Modes (Dorian, Mixolydian, etc.)
- Validation: play ascending/descending scale within time limit

---

## 3. Enhanced Feedback & Correction

**Objective:** Make mistakes into learning moments, not just failure events.

### Nuanced Validation
- Partial credit system: "You played a minor 3rd instead of major 3rd—close!"
- Recognition of correct interval category but wrong quality
- Helpful hints: "You're one semitone off"

### Visual Feedback
- Highlight correct vs played notes on keyboard visualisation
- Show the interval distance visually
- Colour-coded feedback (green = correct, red = wrong note, yellow = right direction but wrong distance)

### Audio Feedback
- Play correct interval through Web Audio API after wrong answer
- "This is what a Major 6th sounds like from C"
- Option to hear interval before/after playing it

### Mistake Pattern Analysis
- "You consistently play Major 3rds as Major 2nds"
- Common error types tracked and surfaced
- Suggested exercises to fix specific mistake patterns

---

## 4. Practice Session Management

**Objective:** Make it easy to start, structure, and review practice sessions.

### Session Configuration UI
- Choose lesson type (intervals, chords, progressions)
- Set number of prompts per round
- Choose difficulty level or specific content
- Set time limits or target scores

### Practice Modes
- **Timed Mode:** Complete as many as possible in X minutes
- **Accuracy Mode:** Must hit X% accuracy to pass
- **Endurance Mode:** Keep going until X mistakes
- **Focus Mode:** Only practice specific intervals/chords selected by user

### Session Templates
- "Quick 5-minute warmup" (10 easy intervals)
- "Deep practice" (50 prompts, all intervals, adaptive)
- "Weak spot session" (auto-generated based on analytics)
- Custom templates user can save

### Session Scheduling & Reminders
- Set practice goals (e.g., 3 sessions per week)
- Browser notifications for practice time
- Streak tracking ("You've practiced 7 days in a row!")

---

## 5. Performance Analytics & Insights

**Objective:** Understand progress over time, not just isolated session scores.

### Performance Dashboard
- Line graph of accuracy over time
- Line graph of average response time over time
- Breakdown by interval type or chord type
- Heat map of performance by root note (which keys are hardest?)

### Historical Comparison
- "Last 10 rounds average" vs "Last 30 rounds average"
- Week-over-week improvement metrics
- Month-over-month progress tracking

### Detailed Session Review
- Replay a past session to see exactly what was prompted and played
- Review specific mistakes from previous sessions
- Export session data to CSV for external analysis

### Achievement Milestones
- "First perfect score!"
- "100 sessions completed"
- "Mastered all intervals from C"
- Visual badges or progress indicators

---

## 6. Advanced MIDI & Input Handling

**Objective:** Support more sophisticated practice techniques and edge cases.

### Chord Timing Validation
- Penalise arpeggiated chords (notes not pressed simultaneously)
- Measure velocity consistency across chord notes
- Train for even, balanced chord voicing

### Sustain Pedal Integration
- Lessons specifically about pedal technique
- Validation that accounts for sustained notes
- Pedal timing exercises

### Velocity Sensitivity
- Track how hard keys are pressed
- Exercises for dynamic control
- "Play this interval softly" or "Play this chord forte"

### Multiple MIDI Device Support
- Switch between keyboards mid-session
- Use different keyboards for different lesson types
- Handle MIDI controller knobs/faders for configuration

---

## 7. Gamification & Motivation

**Objective:** Make practice engaging and rewarding, especially during frustrating learning phases.

### Scoring Systems
- Points for correct answers, bonus for speed
- Combo multipliers for consecutive correct answers
- Leaderboard (even if only competing with yourself)

### Challenge Modes
- "Beat your personal best"
- Daily challenges (specific interval or chord combinations)
- "Perfect round" challenge (100% accuracy)

### Progress Visualisation
- Skill tree showing locked/unlocked content
- Visual progress bars for each interval/chord mastery
- Animated level-up effects when thresholds are hit

### Rewards & Unlocks
- Unlock new lessons by mastering prerequisites
- Unlock cosmetic themes or keyboard skins
- Unlock advanced features (analytics, etc.) through practice milestones

---

## 8. Usability & Quality of Life

**Objective:** Reduce friction, improve user experience, handle edge cases gracefully.

### Keyboard Shortcuts
- Spacebar to start/pause round
- Enter to restart round
- ESC to return to menu
- Number keys for quick lesson selection

### Practice Session Pause/Resume
- Pause mid-session without losing progress
- Resume from where you left off
- Save incomplete sessions for later

### Accessibility Features
- High contrast mode for visual impairments
- Larger text options
- Screen reader support for prompts
- Colourblind-friendly colour schemes

### Error Handling & Graceful Degradation
- Clear error messages if MIDI device disconnects
- Fallback to computer keyboard input if MIDI unavailable
- Auto-save session data even if browser crashes

### Mobile/Tablet Support (Stretch Goal)
- Bluetooth MIDI support for iPad
- Touch-friendly UI for session review on mobile
- Practice on-the-go without laptop

---

## 9. Export & Integration

**Objective:** Allow data to live beyond the app, integrate with other tools.

### Data Export
- Export all session data to CSV/JSON
- Export analytics reports to PDF
- Export specific date ranges or lesson types

### External Tool Integration
- Sync with practice journal apps
- Export to spreadsheet tools for custom analysis
- Integration with metronome or DAW software

### Backup & Restore
- Export entire database for backup
- Import database to restore on new machine
- Cloud sync option (way future, privacy considerations)

---

## 10. Community & Sharing (Very Future)

**Objective:** Learn from others, share progress, build accountability.

### Anonymous Performance Benchmarking
- "You're in the top 20% for Major 3rd speed"
- Compare your progress to anonymised user averages
- No personal data shared, just aggregate stats

### Lesson Sharing
- Export custom lesson templates
- Import community-created lessons
- Curated lesson packs from jazz educators

### Practice Buddy Features
- Share session results with a practice partner
- Friendly competition leaderboards
- Accountability check-ins

---

## Implementation Priority Framework

When deciding which features to build next, consider:

1. **Does it solve a real pain point I'm experiencing?** (User-centric)
2. **Does it require data I'm not yet capturing?** (Data infrastructure)
3. **Does it build on existing MVP functionality?** (Architectural fit)
4. **Will I actually use it, or is it just "nice to have"?** (Honest self-assessment)

Features should emerge from validated needs during actual practice sessions, not from theoretical "wouldn't it be cool if..." thinking.
