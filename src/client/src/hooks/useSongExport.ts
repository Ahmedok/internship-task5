import { useState, useCallback } from 'react';
import * as Tone from 'tone';
import { BlobWriter, BlobReader, ZipWriter } from '@zip.js/zip.js';
import lamejs from '@breezystack/lamejs';
import type { Song } from '../../../lib';
import { createSongAudioChain } from '../audioConfig';

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

const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export function useSongExport() {
    const [isExporting, setIsExporting] = useState(false);
    const [progress, setProgress] = useState(0);

    const renderSongToBuffer = async (song: Song): Promise<AudioBuffer> => {
        let endTime = 0;
        [...song.score.melody, ...song.score.bass].forEach((n) => {
            const eventEnd = Tone.Time(n.time).toSeconds() + Tone.Time(n.duration).toSeconds();
            if (eventEnd > endTime) endTime = eventEnd;
        });
        const tailBuffer = 3;
        const stopTime = endTime + tailBuffer;

        const buffer = await Tone.Offline(async ({ transport }) => {
            const audioChain = await createSongAudioChain(song.score.instrument);

            const { bpm, melody, bass: bassLines } = song.score;
            transport.bpm.value = bpm;

            melody.forEach((note) => {
                transport.schedule((time) => {
                    audioChain.synth.triggerAttackRelease(
                        note.note,
                        note.duration,
                        time,
                        note.velocity,
                    );
                }, note.time);
            });

            bassLines.forEach((note) => {
                transport.schedule((time) => {
                    audioChain.bass.triggerAttackRelease(
                        note.note,
                        note.duration,
                        time,
                        note.velocity,
                    );
                }, note.time);
            });

            transport.start();
        }, stopTime);

        return buffer as unknown as AudioBuffer;
    };

    const exportZip = useCallback(async (songs: Song[]) => {
        if (songs.length === 0) return;

        const songsSnapshot = songs.map((s) => ({ ...s, score: { ...s.score } }));

        setIsExporting(true);
        setProgress(0);

        try {
            const zipWriter = new ZipWriter(new BlobWriter('application/zip'));

            for (let i = 0; i < songsSnapshot.length; i++) {
                const song = songsSnapshot[i];

                const buffer = await renderSongToBuffer(song);

                await new Promise((r) => setTimeout(r, 10));

                const mp3Blob = encodeMp3(buffer);

                const safeName = `${song.artist} - ${song.title} (${song.album})`.replace(
                    /[/\\?%*:|"<>]/g,
                    '-',
                );

                await zipWriter.add(`${safeName}.mp3`, new BlobReader(mp3Blob));

                setProgress(Math.round(((i + 1) / songsSnapshot.length) * 100));
            }

            const zipBlob = await zipWriter.close();

            downloadBlob(zipBlob, `MP3_Export(${songsSnapshot.length.toString()} tracks).zip`);
        } catch (err) {
            console.log('Export failed:', err);
            alert('Export failed');
        } finally {
            setIsExporting(false);
        }
    }, []);

    return { isExporting, progress, exportZip };
}
