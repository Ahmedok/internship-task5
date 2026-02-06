import { RandomGenerator } from './randomizer.js';

function str(n: number | string): string {
    return String(n);
}

function hslToHex(h: number, s: number, l: number): string {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color)
            .toString(16)
            .padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

export function generateCoverSvg(rng: RandomGenerator, title: string, artist: string): string {
    // Color palette
    const baseHue = rng.nextInt(0, 360);

    const bgColor1 = hslToHex(baseHue, 60, 20);
    const bgColor2 = hslToHex((baseHue + 40) % 360, 70, 30);

    const accentHue = (baseHue + 180) % 360;

    // Some figures
    let shapes = '';
    const shapesCount = rng.nextInt(3, 6);

    for (let i = 0; i < shapesCount; i++) {
        const type = rng.nextFloat() > 0.5 ? 'circle' : 'rect';
        const fill = hslToHex(accentHue, rng.nextInt(50, 90), rng.nextInt(40, 70));
        const opacity = (rng.nextFloat() * 0.3 + 0.1).toFixed(2);

        if (type === 'circle') {
            const r = rng.nextInt(20, 150);
            const cx = rng.nextInt(0, 300);
            const cy = rng.nextInt(0, 300);
            shapes += `<circle cx="${str(cx)}" cy="${str(cy)}" r="${str(r)}" fill="${fill}" opacity="${opacity}" />`;
        } else {
            const w = rng.nextInt(50, 200);
            const h = rng.nextInt(50, 200);
            const x = rng.nextInt(-50, 250);
            const y = rng.nextInt(-50, 250);
            const rotate = rng.nextInt(0, 90);
            shapes += `<rect x="${str(x)}" y="${str(y)}" width="${str(w)}" height="${str(h)}" fill="${fill}" opacity="${opacity}" transform="rotate(${str(rotate)} ${str(x + w / 2)} ${str(y + h / 2)})" />`;
        }
    }

    // SVG construct
    const svgString = `
    <svg width="300" height="300" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:${bgColor1};stop-opacity:1" />
                <stop offset="100%" style="stop-color:${bgColor2};stop-opacity:1" />
            </linearGradient>
            <filter id="shadow">
                <feDropShadow dx="1" dy="1" stdDeviation="2" flood-color="black" flood-opacity="0.5"/>
            </filter>
        </defs>
    
        <rect width="300" height="300" fill="url(#grad)" />
    
        ${shapes}
    
        <text x="50%" y="45%" 
            dominant-baseline="middle" text-anchor="middle" 
            fill="white" font-family="system-ui, sans-serif" font-weight="bold" font-size="24"
            filter="url(#shadow)">
        ${escapeXml(title.slice(0, 20))}
        </text>
    
        <text x="50%" y="60%" 
            dominant-baseline="middle" text-anchor="middle" 
            fill="white" fill-opacity="0.8" font-family="system-ui, sans-serif" font-size="14"
            filter="url(#shadow)">
        ${escapeXml(artist)}
        </text>
    </svg>
    `.trim();

    // Base 64 convert
    const base64 = Buffer.from(svgString).toString('base64');
    return `data:image/svg+xml;base64,${base64}`;
}

function escapeXml(unsafe: string): string {
    return unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<':
                return '&lt;';
            case '>':
                return '&gt;';
            case '&':
                return '&amp;';
            case "'":
                return '&apos;';
            case '"':
                return '&quot;';
            default:
                return c;
        }
    });
}
