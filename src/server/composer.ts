import { Key, Chord, Note } from 'tonal';
import { RandomGenerator } from './randomizer';
import { SongScore, NoteEvent } from '../lib/index.js';

const ROOTS = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

export function generateSongScore(rng: RandomGenerator): SongScore {
    // Tonality (key)
    const root = rng.pickArray(ROOTS);
    const mode = rng.nextFloat() > 0.3 ? 'major' : 'minor';

    // Chords
    const keyChords =
        mode === 'major' ? Key.majorKey(root).chords : Key.minorKey(root).natural.chords;

    // Chord progression
    const progression = [
        keyChords[0],
        rng.pickArray(keyChords),
        rng.pickArray(keyChords),
        keyChords[mode === 'major' ? 4 : 3],
    ];

    const melody: NoteEvent[] = [];
    const bass: NoteEvent[] = [];
    const bpm = rng.nextInt(80, 140);

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
            velocity: 0.7,
        };
        bass.push(bassEvent);

        // Melody
        const notesCount = rng.nextInt(4, 8);

        for (let i = 0; i < notesCount; i++) {
            const noteName = rng.pickArray(chordNotes);
            const octave = rng.nextInt(4, 5);

            const quarter = rng.nextInt(0, 3);
            const sixteenth = rng.pickArray([0, 2]);

            const melodyEvent: NoteEvent = {
                note: noteName + octave.toString(),
                duration: '8n',
                time: `${barIndex.toString()}:${quarter.toString()}:${sixteenth.toString()}`,
                velocity: rng.nextFloat() * 0.5 + 0.5,
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
