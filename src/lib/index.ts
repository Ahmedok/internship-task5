export type NoteEvent = {
    note: string;
    duration: string;
    time: string | number;
    velocity: number;
};

export type SongScore = {
    bpm: number;
    instrument: 'synth' | 'metal';
    melody: NoteEvent[];
    bass: NoteEvent[];
};

export type Song = {
    id: string;
    index: number;

    title: string;
    artist: string;
    album: string;
    genre: string;
    review: string;

    cover: string;
    likes: number;
    score: SongScore;
};

export type ApiResponse = {
    seed: string;
    page: number;
    songs: Song[];
    limit: number;
};
