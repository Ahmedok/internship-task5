import { useState, useCallback, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import type { Song } from '../../../lib';
import { createSongAudioChain } from '../audioConfig';

type AudioChain = Awaited<ReturnType<typeof createSongAudioChain>>;

export function useAudioPlayer() {
    const [currentSongId, setCurrentSongId] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const audioChainRef = useRef<AudioChain | null>(null);
    const partRef = useRef<Tone.Part | null>(null);
    const bassPartRef = useRef<Tone.Part | null>(null);

    const stop = useCallback(() => {
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
        if (audioChainRef.current) {
            audioChainRef.current.dispose();
            audioChainRef.current = null;
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

            await Tone.start();

            const audioChain = await createSongAudioChain(song.score.instrument);
            audioChainRef.current = audioChain;

            const { bpm, melody, bass: bassLines } = song.score;
            Tone.getTransport().bpm.value = bpm;

            const melodyPart = new Tone.Part((time, noteEvent) => {
                audioChain.synth.triggerAttackRelease(
                    noteEvent.note,
                    noteEvent.duration,
                    time,
                    noteEvent.velocity,
                );
            }, melody).start(0);

            const bassPart = new Tone.Part((time, noteEvent) => {
                audioChain.bass.triggerAttackRelease(
                    noteEvent.note,
                    noteEvent.duration,
                    time,
                    noteEvent.velocity,
                );
            }, bassLines).start(0);

            partRef.current = melodyPart;
            bassPartRef.current = bassPart;

            let endTime = 0;
            [...song.score.melody, ...song.score.bass].forEach((n) => {
                const eventEnd = Tone.Time(n.time).toSeconds() + Tone.Time(n.duration).toSeconds();
                if (eventEnd > endTime) endTime = eventEnd;
            });
            const buffer = 3;
            const stopTime = endTime + buffer;

            Tone.getTransport().scheduleOnce(() => {
                stop();
            }, stopTime);

            Tone.getTransport().start();
            setCurrentSongId(song.id);
            setIsPlaying(true);
        },
        [currentSongId, stop],
    );

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
