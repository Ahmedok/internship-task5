import 'dotenv/config';
import express, { Express, Request, Response } from 'express';
import path from 'path';

const app: Express = express();

const PORT = process.env.PORT ?? '3000';

const staticFolder = process.env.STATIC_PATH ?? 'public';
const CLIENT_PATH = path.join(process.cwd(), staticFolder);

app.use(express.static(CLIENT_PATH));

app.get('/api/status', (_: Request, res: Response) => {
  res.json({ status: 'Server is running.', time: new Date() });
});

app.get('/*splat', (_: Request, res: Response) => {
  res.sendFile(path.join(CLIENT_PATH, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Serving static files from: ${CLIENT_PATH}`);
});
