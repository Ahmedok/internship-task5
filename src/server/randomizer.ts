import { Faker } from '@faker-js/faker';
import prand from 'pure-rand';

export class RandomGenerator {
    private rng: prand.RandomGenerator;
    private faker: Faker;

    constructor(seed: string, fakerInstance: Faker) {
        const seedNumber = this.hashCode(seed);
        this.rng = prand.xoroshiro128plus(seedNumber);

        const [fakerSeed, nextRng] = prand.uniformIntDistribution(0, 1000000, this.rng);
        this.rng = nextRng;

        this.faker = fakerInstance;
        fakerInstance.seed(fakerSeed);
    }

    private hashCode(str: string): number {
        let hash = 5381;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
        }
        return hash >>> 0;
    }

    nextInt(min: number, max: number): number {
        const [num, nextRng] = prand.uniformIntDistribution(min, max, this.rng);
        this.rng = nextRng;
        return num;
    }

    nextFloat(): number {
        const [intVal, nextRng] = prand.uniformIntDistribution(0, 1000000, this.rng);
        this.rng = nextRng;
        return intVal / 1000000;
    }

    pickArray<T>(arr: readonly T[]): T {
        if (arr.length === 0) throw new Error('Cannot pick from empty array');
        const idx = this.nextInt(0, arr.length - 1);
        return arr[idx];
    }

    getSongTitle(): string {
        return this.faker.music.songName();
    }

    getAlbumName(): string {
        return this.faker.music.album();
    }

    getArtistName(): string {
        return this.faker.music.artist();
    }

    getGenre(): string {
        return this.faker.music.genre();
    }

    getReview(): string {
        return this.faker.music.review();
    }
}
