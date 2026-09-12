import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const publicDir = resolve(root, 'public');

const FONT = 'DejaVu Sans';

function defs() {
  return `<defs>
    <radialGradient id="g1" cx="80%" cy="0%" r="90%">
      <stop offset="0%" stop-color="#7e22ce" stop-opacity="0.5"/>
      <stop offset="60%" stop-color="#3b0764" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#09090b" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="g2" cx="0%" cy="110%" r="80%">
      <stop offset="0%" stop-color="#a21caf" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="#09090b" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#c084fc"/>
      <stop offset="100%" stop-color="#6b21a8"/>
    </linearGradient>
  </defs>`;
}

function base(w, h) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <rect width="${w}" height="${h}" fill="#09090b"/>
    <rect width="${w}" height="${h}" fill="url(#g1)"/>
    <rect width="${w}" height="${h}" fill="url(#g2)"/>
    ${defs()}`;
}

function glyph(s, stroke) {
  const path = `M${s * 0.36} ${s * 0.73}V${s * 0.18}l${s * 0.5} ${-s * 0.09}v${s * 0.52}`;
  return `<g fill="none" stroke="#fff" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">
    <path d="${path}"/>
    <circle cx="${s * 0.24}" cy="${s * 0.71}" r="${s * 0.13}"/>
    <circle cx="${s * 0.755}" cy="${s * 0.615}" r="${s * 0.13}"/>
  </g>`;
}

async function renderOgsvg() {
  const w = 1200;
  const h = 630;
  const s = 150;
  const cx = w / 2;
  const cy = h * 0.33;
  return Buffer.from(`${base(w, h)}
    <rect x="${cx - s / 2}" y="${cy - s / 2}" width="${s}" height="${s}" rx="${s * 0.26}" fill="url(#logoGrad)"/>
    <g transform="translate(${cx - s * 0.5}, ${cy - s * 0.5}) scale(${s / 200})">${glyph(200, 13)}</g>
    <text x="${cx}" y="${h * 0.6}" text-anchor="middle" font-family="${FONT}" font-size="96" font-weight="bold" fill="#ffffff">brainzscrobble</text>
    <text x="${cx}" y="${h * 0.6 + 66}" text-anchor="middle" font-family="${FONT}" font-size="40" fill="#c7c7cc">Manual scrobbler for ListenBrainz</text>
  </svg>`);
}

async function renderIcon() {
  const size = 180;
  const m = size * 0.13;
  const s = size - 2 * m;
  return Buffer.from(`${base(size, size)}
    <rect x="${m}" y="${m}" width="${s}" height="${s}" rx="${s * 0.22}" fill="url(#logoGrad)"/>
    <g transform="translate(${m + (s - size * 0.62) / 2}, ${m + (s - size * 0.62) / 2})">${glyph(size * 0.62, 10)}</g>
  </svg>`);
}

await sharp(await renderOgsvg()).png().toFile(resolve(publicDir, 'og.png'));
await sharp(await renderIcon()).png().toFile(resolve(publicDir, 'apple-touch-icon.png'));

console.log('Generated public/og.png and public/apple-touch-icon.png');