/**
 * Symmetry Breach Audio Engine using Web Audio API
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    // Standard AudioContext initialization
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    } catch (e) {
      console.warn("AudioContext initialization failed or blocked by iframe environment:", e);
      return null;
    }
  }
  return audioCtx;
}

export type SoundEffectType = 
  | 'move' 
  | 'plate_trigger' 
  | 'crystal' 
  | 'laser_death' 
  | 'loop_reset' 
  | 'victory';

export function isMuted(): boolean {
  try {
    if (typeof localStorage === 'undefined' || !localStorage) return false;
    return localStorage.getItem('echoweave_mute') === 'true';
  } catch (e) {
    return false;
  }
}

export function playSfx(type: SoundEffectType) {
  try {
    if (isMuted()) return;

    const ctx = getAudioContext();
    if (!ctx) return;

    // Resume context if suspended (browser permission safeguard)
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    switch (type) {
      case 'move': {
        // Fast, high-frequency sub-audible digital pulse
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(700, now + 0.08);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.09);
        break;
      }

      case 'plate_trigger': {
        // Double metallic chime switch
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.setValueAtTime(500, now + 0.05);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.setValueAtTime(0.08, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.16);
        break;
      }

      case 'crystal': {
        // Sparkling high-frequency chime
        const frequencies = [880, 1100, 1320, 1760];
        frequencies.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const delay = idx * 0.04;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + delay);

          gain.gain.setValueAtTime(0.06, now + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.25);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + delay);
          osc.stop(now + delay + 0.26);
        });
        break;
      }

      case 'laser_death': {
        // Harsh industrial frequency drop
        const oscNode1 = ctx.createOscillator();
        const oscNode2 = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscNode1.type = 'sawtooth';
        oscNode1.frequency.setValueAtTime(220, now);
        oscNode1.frequency.linearRampToValueAtTime(50, now + 0.4);

        oscNode2.type = 'square';
        oscNode2.frequency.setValueAtTime(225, now);
        oscNode2.frequency.linearRampToValueAtTime(45, now + 0.4);

        gainNode.gain.setValueAtTime(0.15, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        oscNode1.connect(gainNode);
        oscNode2.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscNode1.start(now);
        oscNode2.start(now);
        
        oscNode1.stop(now + 0.46);
        oscNode2.stop(now + 0.46);
        break;
      }

      case 'loop_reset': {
        // Temporal rewind sound - sweep down smoothly
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.35);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        // Sub-low resonance
        const subOsc = ctx.createOscillator();
        const subGain = ctx.createGain();
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(100, now);
        subOsc.frequency.linearRampToValueAtTime(40, now + 0.35);
        subGain.gain.setValueAtTime(0.15, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);
        subOsc.connect(subGain);
        subGain.connect(ctx.destination);

        osc.start(now);
        subOsc.start(now);
        
        osc.stop(now + 0.36);
        subOsc.stop(now + 0.36);
        break;
      }

      case 'victory': {
        // Energetic multi-phase arpeggio/chords
        const chord = [329.63, 392.00, 523.25, 659.25, 783.99]; // C major chords (E4, G4, C5, E5, G5)
        chord.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const startOffset = idx * 0.08;

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + startOffset);
          osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + startOffset + 0.4);

          gain.gain.setValueAtTime(0.0, now + startOffset);
          gain.gain.linearRampToValueAtTime(0.08, now + startOffset + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, now + startOffset + 0.5);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + startOffset);
          osc.stop(now + startOffset + 0.51);
        });
        break;
      }
    }
  } catch (e) {
    console.error("Audio Synthesis Interrupted:", e);
  }
}
