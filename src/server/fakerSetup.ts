import { fakerEN, fakerRU, type Faker } from '@faker-js/faker';
import { russianMusicData } from '../lib/musicDataRu.js';
import { englishMusicData } from '../lib/musicDataEn.js';

declare module '@faker-js/faker' {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface MusicModule {
        /**
         * Generates a random song review (1-3 sentences).
         */
        review(): string;
    }
}

const {
    song_name: ruSongName,
    artist: ruArtist,
    genre: ruGenre,
    album: ruAlbum,
    album_probability: RuAlbumProbability,
    sigle_label: RuSingleLabel,
    reviews: RuReviews,
} = russianMusicData;

const {
    album_probability: EnAlbumProbability,
    single_label: EnSingleLabel,
    reviews: EnReviews,
} = englishMusicData;

fakerRU.music.songName = () => fakerRU.helpers.arrayElement(ruSongName);
fakerRU.music.artist = () => fakerRU.helpers.arrayElement(ruArtist);
fakerRU.music.genre = () => fakerRU.helpers.arrayElement(ruGenre);
fakerRU.music.album = () =>
    fakerRU.helpers.maybe(() => fakerRU.helpers.arrayElement(ruAlbum), {
        probability: RuAlbumProbability,
    }) ?? RuSingleLabel;
fakerRU.music.review = () => fakerRU.helpers.arrayElements(RuReviews, { min: 1, max: 3 }).join(' ');

const enOriginalAlbum = fakerEN.music.album.bind(fakerEN);
fakerEN.music.album = () =>
    fakerEN.helpers.maybe(() => enOriginalAlbum(), { probability: EnAlbumProbability }) ??
    EnSingleLabel;
fakerEN.music.review = () => fakerEN.helpers.arrayElements(EnReviews, { min: 1, max: 3 }).join(' ');

export const FAKER_LOCALES: Record<string, Faker> = {
    en_US: fakerEN,
    ru: fakerRU,
};
