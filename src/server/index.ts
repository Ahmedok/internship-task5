import 'dotenv/config';
import express, { Express, Request, Response } from 'express';
import path from 'path';
import cors from 'cors';
import morgan from 'morgan';

import { ApiResponse } from '../lib/index.js';
import { parameterValidator } from './parameterValidator.js';
import { generateSongBatch } from './songService.js';
import { FAKER_LOCALES } from './fakerSetup.js';

const app: Express = express();
const PORT = process.env.PORT ?? '3000';

app.set('trust proxy', true);

morgan.token('date', () => {
    const locale = process.env.LOG_LOCALE ?? 'en-US';
    const tz = process.env.LOG_TIMEZONE ?? 'UTC';
    return new Date().toLocaleString(locale, { timeZone: tz });
});
app.use(morgan('[:date] IP::remote-addr | :method :url | Status: :status | :response-time ms'));

app.use(cors());

// Endpoint
app.get('/api/data', (req: Request, res: Response): void => {
    try {
        const { seed, page, limit, locale, likes } = parameterValidator(req.query);
        const currentFaker = FAKER_LOCALES[locale];

        const songs = generateSongBatch(seed, locale, page, limit, likes, currentFaker);

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
