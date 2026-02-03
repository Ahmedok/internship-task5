import { useState, useCallback, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import type { Song } from '../../../lib';

export function useAudioPlayer() {
    const [currentSongId, setCurrentSongId] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const synthRef = useRef<Tone.PolySynth | Tone.PolySynth<Tone.MetalSynth> | null>(null);
    const bassSynthRef = useRef<Tone.MembraneSynth | null>(null);
    const partRef = useRef<Tone.Part | null>(null);
    const bassPartRef = useRef<Tone.Part | null>(null);

    const stop = useCallback(() => {
        // Transport stop
        Tone.getTransport().stop();
        Tone.getTransport().cancel();

        if (partRef.current) {
            partRef.current.dispose();
            partRef.current = null;
        }
        if (bassPartRef.current) {
            bassPartRef.current.dispose();
            bassPartRef.current = null;
        }
        if (synthRef.current) {
            synthRef.current.dispose();
            synthRef.current = null;
        }
        if (bassSynthRef.current) {
            bassSynthRef.current.dispose();
            bassSynthRef.current = null;
        }

        setIsPlaying(false);
        setCurrentSongId(null);
    }, []);

    const play = useCallback(
        async (song: Song) => {
            if (currentSongId === song.id) {
                stop();
                return;
            }

            stop();
            // AudioContext init
            await Tone.start();

            // Instrument:
            let synth: Tone.PolySynth | Tone.PolySynth<Tone.MetalSynth>;

            // Melody polysynth
            if (song.score.instrument === 'metal') {
                // Metal synth
                synth = new Tone.PolySynth(Tone.MetalSynth, {
                    harmonicity: 12,
                    resonance: 800,
                    modulationIndex: 20,
                    envelope: { decay: 0.4, release: 0.2 },
                    volume: -15,
                }).toDestination();
            } else {
                // Normal synth
                synth = new Tone.PolySynth(Tone.Synth, {
                    oscillator: { type: 'triangle' },
                    envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 1 },
                    volume: -10,
                }).toDestination();
            }

            // Bass membrane
            const bass = new Tone.MembraneSynth().toDestination();
            bass.volume.value = -5;

            synthRef.current = synth;
            bassSynthRef.current = bass;

            // JSON Partiture parsing
            const { bpm, melody, bass: bassLines } = song.score;
            Tone.getTransport().bpm.value = bpm;

            // Melody
            const melodyPart = new Tone.Part((time, noteEvent) => {
                synth.triggerAttackRelease(
                    noteEvent.note,
                    noteEvent.duration,
                    time,
                    noteEvent.velocity,
                );
            }, melody).start(0);

            // Bass
            const bassPart = new Tone.Part((time, noteEvent) => {
                bass.triggerAttackRelease(
                    noteEvent.note,
                    noteEvent.duration,
                    time,
                    noteEvent.velocity,
                );
            }, bassLines).start(0);

            partRef.current = melodyPart;
            bassPartRef.current = bassPart;

            // Start playing
            Tone.getTransport().start();
            setCurrentSongId(song.id);
            setIsPlaying(true);
        },
        [currentSongId, stop],
    );

    // Page cleanup
    useEffect(() => {
        return () => {
            stop();
        };
    }, [stop]);

    return {
        currentSongId,
        isPlaying,
        play,
        stop,
    };
}
