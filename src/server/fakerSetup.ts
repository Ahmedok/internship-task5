import { fakerEN, fakerRU, type Faker } from '@faker-js/faker';
import { russianMusicData } from '../lib/musicDataRu';

const {
    song_name: ruSongName,
    artist: ruArtist,
    genre: ruGenre,
    album: ruAlbum,
} = russianMusicData;

const albumProbability = 0.7;

fakerRU.music.songName = () => fakerRU.helpers.arrayElement(ruSongName);
fakerRU.music.artist = () => fakerRU.helpers.arrayElement(ruArtist);
fakerRU.music.genre = () => fakerRU.helpers.arrayElement(ruGenre);
fakerRU.music.album = () =>
    fakerRU.helpers.maybe(() => fakerRU.helpers.arrayElement(ruAlbum), {
        probability: albumProbability,
    }) ?? 'Сингл';

const enOriginalAlbum = fakerEN.music.album.bind(fakerEN);
fakerEN.music.album = () =>
    fakerEN.helpers.maybe(() => enOriginalAlbum(), { probability: albumProbability }) ?? 'Single';

export const FAKER_LOCALES: Record<string, Faker> = {
    en_US: fakerEN,
    ru: fakerRU,
};
