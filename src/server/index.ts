import 'dotenv/config';
import express, { Express, Request, Response } from 'express';
import path from 'path';
import cors from 'cors';
import { fakerEN, fakerRU, type Faker } from '@faker-js/faker';

import { ApiResponse, Song } from '../lib/index.js';
import { RandomGenerator } from './randomizer.js';
import { generateSongScore } from './composer.js';
import { generateCoverSvg } from './coverGenerator.js';

const app: Express = express();
const PORT = process.env.PORT ?? '3000';

app.use(cors());

// Faker "localization"
const FAKER_LOCALES: Record<string, Faker> = {
    en_US: fakerEN,
    ru: fakerRU,
};

// Endpoint
app.get('/api/data', (req: Request, res: Response): void => {
    try {
        // Param parsin
        const seed = (req.query.seed as string) || 'default';
        const page = parseInt(req.query.page as string) || 1;
        const locale = (req.query.locale as string) || 'en_US';
        const avgLikes = parseFloat(req.query.likes as string) || 0;

        // Limit set (with safety)
        let limit = Number(req.query.limit) || 10;
        limit = Math.max(1, Math.min(100, limit));

        // Locale set
        const currentFaker = FAKER_LOCALES[locale];

        const songs: Song[] = [];

        // Batch generation (global index)
        const startAbsoluteIndex = (page - 1) * limit;

        for (let i = 0; i < limit; i++) {
            const absoluteIndex = startAbsoluteIndex + i + 1;

            // Seed + index combo
            const songSeed = `${seed}_${locale}_${absoluteIndex.toString()}`;
            const rng = new RandomGenerator(songSeed);

            // local Faker sync
            currentFaker.seed(rng.nextInt(0, 10000000));

            // Text generation
            const title = currentFaker.music.songName();
            const artist = currentFaker.music.artist();
            const genre = currentFaker.music.genre();
            const album = currentFaker.music.album();

            // Likes generation
            const baseLikes = Math.floor(avgLikes);
            const fractionalChance = avgLikes - baseLikes;
            const extraLike = rng.nextFloat() < fractionalChance ? 1 : 0;
            const likesCount = baseLikes + extraLike;

            // Cover generation
            const cover = generateCoverSvg(rng, title, artist);

            // Music generation
            const score = generateSongScore(rng);

            songs.push({
                id: songSeed,
                index: absoluteIndex,
                title,
                artist,
                album,
                genre,
                cover,
                score,
                likes: likesCount,
            });
        }

        const response: ApiResponse = {
            seed,
            page,
            limit,
            songs,
        };

        res.json(response);
    } catch (error) {
        console.log('Generation error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

const STATIC_PATH = process.env.STATIC_PATH ?? 'public';
const CLIENT_PATH = path.join(process.cwd(), STATIC_PATH);

app.use(express.static(CLIENT_PATH));

app.get('/api/status', (_: Request, res: Response) => {
    res.json({ status: 'Server is running.', time: new Date() });
});

app.get('/*splat', (_: Request, res: Response) => {
    res.sendFile(path.join(CLIENT_PATH, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running at port: ${PORT}`);
    console.log(`Serving static files from: ${CLIENT_PATH}`);
});
