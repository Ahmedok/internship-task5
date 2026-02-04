import * as Tone from 'tone';
import type { RecursivePartial } from 'tone/build/esm/core/util/Interface';

type PolySynthOptions = RecursivePartial<Tone.SynthOptions>;
type MetalSynthOptions = RecursivePartial<Tone.MetalSynthOptions>;
type MembraneOptions = RecursivePartial<Tone.MembraneSynthOptions>;

export const SYNTH_CONFIG: PolySynthOptions = {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 1 },
    volume: -10,
};

export const METAL_CONFIG: MetalSynthOptions = {
    harmonicity: 12,
    resonance: 800,
    modulationIndex: 20,
    envelope: { decay: 0.4, release: 0.2 },
    volume: -15,
};

export const BASS_CONFIG: MembraneOptions = {
    volume: -5,
};

export function createMelodySynth(instrument: 'synth' | 'metal') {
    if (instrument === 'metal') {
        return new Tone.PolySynth(Tone.MetalSynth, METAL_CONFIG);
    } else {
        return new Tone.PolySynth(Tone.Synth, SYNTH_CONFIG);
    }
}

export function createBassSynth() {
    return new Tone.MembraneSynth(BASS_CONFIG);
}
