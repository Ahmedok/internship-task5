import { useState, useCallback } from 'react';
import * as Tone from 'tone';
import { BlobWriter, BlobReader, ZipWriter } from '@zip.js/zip.js';
import lamejs from '@breezystack/lamejs';
import type { Song } from '../../../lib';

// Helper functions

const floatTo16BitPCM = (input: Float32Array, output: Int16Array) => {
    for (let i = 0; i < input.length; i++) {
        const s = Math.max(-1, Math.min(1, input[i]));
        output[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
};

const encodeMp3 = (buffer: AudioBuffer): Blob => {
    const channels = 1;
    const sampleRate = buffer.sampleRate;
    const kbps = 128;

    const mp3encoder = new lamejs.Mp3Encoder(channels, sampleRate, kbps);
    const samples = buffer.getChannelData(0);
    const sampleBlockSize = 1152;

    const mp3Data: Uint8Array[] = [];

    const int16Buffer = new Int16Array(samples.length);
    floatTo16BitPCM(samples, int16Buffer);

    const remaining = int16Buffer.length;
    for (let i = 0; i < remaining; i += sampleBlockSize) {
        const left = int16Buffer.subarray(i, i + sampleBlockSize);
        const mp3buf = mp3encoder.encodeBuffer(left);
        if (mp3buf.length > 0) mp3Data.push(mp3buf);
    }

    const mp3buf = mp3encoder.flush();
    if (mp3buf.length > 0) mp3Data.push(mp3buf);

    return new Blob(mp3Data as BlobPart[], { type: 'audio/mp3' });
};

// Download natively
const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    // Invisible link
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    // Click emulate
    document.body.appendChild(link);
    link.click();
    // Remove immediatelly
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

// The hook itself
export function useSongExport() {
    const [isExporting, setIsExporting] = useState(false);
    const [progress, setProgress] = useState(0);

    const renderSongToBuffer = async (song: Song): Promise<AudioBuffer> => {
        const duration = 15;

        const buffer = await Tone.Offline(({ transport }) => {
            let synth: Tone.PolySynth | Tone.PolySynth<Tone.MetalSynth>;
            if (song.score.instrument === 'metal') {
                synth = new Tone.PolySynth(Tone.MetalSynth, {
                    harmonicity: 12,
                    resonance: 800,
                    modulationIndex: 20,
                    envelope: { decay: 0.4, release: 0.2 },
                    volume: -15,
                }).toDestination();
            } else {
                synth = new Tone.PolySynth(Tone.Synth, {
                    oscillator: { type: 'triangle' },
                    envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 1 },
                    volume: -5,
                }).toDestination();
            }

            const bass = new Tone.MembraneSynth().toDestination();
            bass.volume.value = -5;

            const { bpm, melody, bass: bassLines } = song.score;
            transport.bpm.value = bpm;

            new Tone.Part((time, note) => {
                synth.triggerAttackRelease(note.note, note.duration, time, note.velocity);
            }, melody).start(0);

            new Tone.Part((time, note) => {
                bass.triggerAttackRelease(note.note, note.duration, time, note.velocity);
            }, bassLines).start(0);

            transport.start();
        }, duration);

        return buffer as unknown as AudioBuffer;
    };

    const exportZip = useCallback(async (songs: Song[]) => {
        if (songs.length === 0) return;
        setIsExporting(true);
        setProgress(0);

        try {
            const zipWriter = new ZipWriter(new BlobWriter('application/zip'));

            for (let i = 0; i < songs.length; i++) {
                const song = songs[i];

                const buffer = await renderSongToBuffer(song);

                await new Promise((r) => setTimeout(r, 10));

                const mp3Blob = encodeMp3(buffer);

                const safeName = `${song.artist} - ${song.title} (${song.album})`.replace(
                    /[/\\?%*:|"<>]/g,
                    '-',
                );

                await zipWriter.add(`${safeName}.mp3`, new BlobReader(mp3Blob));

                setProgress(Math.round(((i + 1) / songs.length) * 100));
            }

            const zipBlob = await zipWriter.close();

            downloadBlob(zipBlob, `Music_Score_Export.zip`);
        } catch (err) {
            console.log('Export failed:', err);
            alert('Export failed');
        } finally {
            setIsExporting(false);
        }
    }, []);

    return { isExporting, progress, exportZip };
}
