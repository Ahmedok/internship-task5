# Generated Songs Catalog (Task #5)

This is a training project built with React (TS + Tailwind) and Node.js (Express).
The main goal was to create SPA with fully server-rendered seeded-random generation of realistic-looking data and music.

**Deployed App:** [https://task5.miskaris.com](https://task5.miskaris.com)

## Features

- **Deterministic generation:** Seeded random data generation, dynamic localization (EN and RU, can be expanded easily), independent parameters.
- **Algorithmic music composition:** Server-generated tracks, integrated music theory, client-side playback-synthesis.
- **Visuals:** Dual display modes (Table View with _pagination_, Gallery View with _infinite scroll_), seed-based SVG covers (with basic shapes and typography), interactive toolbar.
- **Performance:** Client-side MP3 encoding, batch async ZIP export, user safeguards.

## Libraries used:

As per requirements to this task, many libraries were used:

### Server-side

- **Music theory:** [Tonal.js](https://github.com/tonaljs/tonal)
- **Fake data generation:** [faker-js](https://github.com/faker-js/faker) (with own custom extensions of non-present music methods and data)
- **Deterministic RNG (Xoroshiro128+):** [pure-rand](https://github.com/dubzzz/pure-rand)

### Client-side

- **Music synthesis (Web Audio):** [Tone.js](https://github.com/Tonejs/Tone.js)
- **View modes with Infinite scroll:** [React-Vistuoso](https://github.com/petyosi/react-virtuoso)
- **MP3 Encoding:** [Lame.js (@gideonstele fork)](https://github.com/gideonstele/lamejs)
- **ZIP creation:** [Zip.js](https://github.com/gildas-lormeau/zip.js)

## How to run locally

The project is fully containerized.

1. Clone the repository.
2. Rename `.env.example` to `.env`.
   (double check the values and enter those that apply to your situation)
3. Run with Docker Compose:
    ```bash
    docker-compose up --build
    ```
4. Open http://localhost:3000 in your browser.
