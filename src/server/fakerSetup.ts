import { fakerEN, fakerRU, type Faker } from '@faker-js/faker';
import { russianMusicData } from '../lib/musicDataRu';

const {
    song_name: ruSongName,
    artist: ruArtist,
    genre: ruGenre,
    album: ruAlbum,
} = russianMusicData;

fakerRU.music.songName = () => fakerRU.helpers.arrayElement(ruSongName);
fakerRU.music.artist = () => fakerRU.helpers.arrayElement(ruArtist);
fakerRU.music.genre = () => fakerRU.helpers.arrayElement(ruGenre);
fakerRU.music.album = () => fakerRU.helpers.arrayElement(ruAlbum);

export const FAKER_LOCALES: Record<string, Faker> = {
    en_US: fakerEN,
    ru: fakerRU,
};
