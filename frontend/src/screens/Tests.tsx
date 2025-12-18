import { useState } from "react";
import { formatDuration, semitonesToIntervalName } from "../utils/formatters";
import { calcIntervalTarget, midiToNoteName } from "../utils/midi";

function App() {

  const [intervalSemitones, setIntervalSemitones] = useState(12);
  const [duration, setDuration] = useState('00:00');

  const [rootMidiNote, setRootMidiNote] = useState(60);

  //Interval target
  const [midiTargetNote, setMidiTargetNote] = useState(64);

  
    const handleDurationTest = (seconds: number) => {
      setDuration(formatDuration(seconds));
    }

  const handleIntervalTest = (semitones:number) => {
      setIntervalSemitones(semitones);
      handleCalcIntervalTarget(rootMidiNote, semitones);
  }

  const handleMidiTest = (midiNote: number) => {
    setRootMidiNote(midiNote);
    handleCalcIntervalTarget(midiNote, intervalSemitones);
  }

  const handleCalcIntervalTarget = (midiNote:number, semitones:number) => {
    setMidiTargetNote(calcIntervalTarget(midiNote, semitones));
  }

  return (
    
    <>


      <h1>Jazz Trainer</h1>
      <h2> Tests </h2>

      <div className="input-wrapper">
        <label>Seconds (formatted duration)</label>
        <input tabIndex={0} className="input" type="number" height="64" defaultValue={0} onChange={e => handleDurationTest(Number(e.target.value))} />
        {duration}
      </div>
     
      
      <div className="input-wrapper">
        <label>Root Midi Note (Number)</label>
        <input tabIndex={1} className="input" type="number" height="64" defaultValue={60} onChange={e => handleMidiTest(Number(e.target.value))} />
      </div>

      <div className="input-wrapper">
        <label>Semitones</label>
        <input tabIndex={2} className="input" type="number" height="64" defaultValue={12} onChange={e => handleIntervalTest(Number(e.target.value))} />
        
      </div>
      <div className="results-wrapper">
        <h4>Results</h4>
        <div>Midi Root Note: {midiToNoteName(rootMidiNote)} ({rootMidiNote})</div>
        <div>Midi Target Note: {midiToNoteName(midiTargetNote)} ({midiTargetNote})</div>
        <div>Interval Name: {semitonesToIntervalName(intervalSemitones)}</div>
      </div>
        
        
        

     

    </>
  )
}

export default App
