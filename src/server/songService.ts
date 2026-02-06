import type { Song } from '../lib/index.js';
import type { Faker } from '@faker-js/faker';
import { RandomGenerator } from './randomizer.js';
import { generateCoverSvg } from './coverGenerator.js';
import { generateSongScore } from './composer.js';

export function generateSong(
    seed: string,
    locale: string,
    absoluteIndex: number,
    avgLikes: number,
    faker: Faker,
): Song {
    const songSeed = `${seed}_${locale}_${absoluteIndex.toString()}`;
    const rng = new RandomGenerator(songSeed, faker);

    const title = rng.getSongTitle();
    const artist = rng.getArtistName();
    const genre = rng.getGenre();
    const album = rng.getAlbumName();

    const baseLikes = Math.floor(avgLikes);
    const fractionalChance = avgLikes - baseLikes;
    const extraLike = rng.nextFloat() < fractionalChance ? 1 : 0;
    const likesCount = baseLikes + extraLike;

    const cover = generateCoverSvg(rng, title, artist);
    const score = generateSongScore(rng);

    return {
        id: songSeed,
        index: absoluteIndex,
        title,
        artist,
        album,
        genre,
        cover,
        score,
        likes: likesCount,
    };
}

export function generateSongBatch(
    seed: string,
    locale: string,
    page: number,
    limit: number,
    avgLikes: number,
    faker: Faker,
): Song[] {
    const startAbsoluteIndex = (page - 1) * limit;
    const songs: Song[] = [];

    for (let i = 0; i < limit; i++) {
        songs.push(generateSong(seed, locale, startAbsoluteIndex + i + 1, avgLikes, faker));
    }

    return songs;
}
