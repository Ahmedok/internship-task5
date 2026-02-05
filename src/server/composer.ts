import { Key, Chord, Note } from 'tonal';
import { RandomGenerator } from './randomizer';
import { SongScore, NoteEvent } from '../lib/index.js';

const ROOTS = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

export function generateSongScore(rng: RandomGenerator, targetDuration = 15): SongScore {
    // Tonality (key)
    const root = rng.pickArray(ROOTS);
    const mode = rng.nextFloat() > 0.3 ? 'major' : 'minor';

    // Chords
    const keyChords =
        mode === 'major' ? Key.majorKey(root).chords : Key.minorKey(root).natural.chords;

    const bpm = rng.nextInt(80, 140);
    const beatsPerBar = 4;
    const secondsPerBar = (beatsPerBar * 60) / bpm;
    const bars = Math.ceil(targetDuration / secondsPerBar);

    const POP_CHORD_INDICES = [0, 2, 3, 4, 5];

    // Chord progression
    const progression = [];
    for (let i = 0; i < bars; i++) {
        if (i === 0) {
            progression.push(keyChords[0]);
        } else if (i === bars - 1) {
            progression.push(keyChords[4]);
        } else {
            progression.push(keyChords[rng.pickArray(POP_CHORD_INDICES)]);
        }
    }

    const melody: NoteEvent[] = [];
    const bass: NoteEvent[] = [];

    progression.forEach((chordName, barIndex) => {
        // Note array from the chord
        const chord = Chord.get(chordName);
        if (!chord.notes.length) return;
        const chordNotes = chord.notes;

        // Bass line
        const bassNote = Note.simplify(chordNotes[0] + '2');
        const bassEvent: NoteEvent = {
            note: bassNote,
            duration: '1m',
            time: `${barIndex.toString()}:0:0`,
            velocity: 0.7 + rng.nextFloat() * 0.3,
        };
        bass.push(bassEvent);

        // Melody
        const notesCount = rng.nextInt(4, 8);

        for (let i = 0; i < notesCount; i++) {
            if (rng.nextFloat() < 0.1) continue;

            const noteName = rng.pickArray(chordNotes);
            const octave = rng.nextInt(4, 5);

            const quarter = rng.nextInt(0, 3);
            const sixteenth = rng.pickArray([0, 2]);

            const durations = ['8n', '4n', '8n', '16n'];

            const melodyEvent: NoteEvent = {
                note: noteName + octave.toString(),
                duration: rng.pickArray(durations),
                time: `${barIndex.toString()}:${quarter.toString()}:${sixteenth.toString()}`,
                velocity: rng.nextFloat() * 0.4 + 0.4,
            };
            melody.push(melodyEvent);
        }
    });

    // Random choice
    const instrument = rng.pickArray(['synth', 'metal']);

    return {
        bpm,
        instrument: instrument as 'synth' | 'metal',
        melody,
        bass,
    };
}
