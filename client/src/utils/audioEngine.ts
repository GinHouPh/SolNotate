// This is a simple audio engine stub
// In a real application, you'd use the Web Audio API to generate the actual sounds

// Frequency mappings for each note in the 4th octave
const baseFrequencies: Record<string, number> = {
  'do': 261.63, // C4
  're': 293.66, // D4
  'mi': 329.63, // E4
  'fa': 349.23, // F4
  'sol': 392.00, // G4
  'la': 440.00, // A4
  'ti': 493.88, // B4
};

// Calculate frequency for a note in any octave
export const getFrequency = (note: string, octave: number): number => {
  const baseFreq = baseFrequencies[note];
  if (!baseFreq) return 0;
  
  // Adjust for octave difference from the 4th octave
  const octaveDiff = octave - 4;
  return baseFreq * Math.pow(2, octaveDiff);
};

// Duration in milliseconds for different note durations at 120 BPM
export const getDuration = (noteDuration: string, bpm: number): number => {
  // At 120 BPM, a quarter note is 500ms
  const quarterNoteDuration = 60000 / bpm;
  
  switch (noteDuration) {
    case 'whole':
      return quarterNoteDuration * 4;
    case 'half':
      return quarterNoteDuration * 2;
    case 'quarter':
      return quarterNoteDuration;
    case 'eighth':
      return quarterNoteDuration / 2;
    case 'sixteenth':
      return quarterNoteDuration / 4;
    default:
      return quarterNoteDuration;
  }
};

// Simple function to play a single note
export const playNote = (frequency: number, duration: number, volume: number = 0.5): void => {
  // This would use Web Audio API in a real implementation
  console.log(`Playing note with frequency ${frequency}Hz for ${duration}ms at volume ${volume}`);
  
  // Stub implementation - in real app, you'd implement this with Web Audio API
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.value = volume;
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    
    // Smooth release
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration / 1000);
    
    // Stop the oscillator after the duration
    setTimeout(() => {
      oscillator.stop();
      oscillator.disconnect();
      gainNode.disconnect();
    }, duration);
  } catch (error) {
    console.error('Error playing audio:', error);
  }
};

// Play a sequence of notes
export const playSequence = (notes: Array<{
  note: string;
  octave: number;
  duration: string;
}>, bpm: number): void => {
  let timeOffset = 0;
  
  notes.forEach(({ note, octave, duration }) => {
    const freq = getFrequency(note, octave);
    const durationMs = getDuration(duration, bpm);
    
    setTimeout(() => {
      playNote(freq, durationMs);
    }, timeOffset);
    
    timeOffset += durationMs;
  });
};