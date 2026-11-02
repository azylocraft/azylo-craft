// Generates the material swatch textures used by the product page material picker
// (public/materials/<slug>.webp). Neutral light tones; the page tints them with the chosen colour.
// Usage: node scripts/generate-material-textures.mjs
import fs from "node:fs";
import sharp from "sharp";

const W = 1200;
const H = 480;
fs.mkdirSync("public/materials", { recursive: true });

/* ---------- noise helpers ---------- */
let seed = 7;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const hash = (x, y, s = 0) => {
  let h = (x * 374761393 + y * 668265263 + s * 982451653) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
};
const smooth = (t) => t * t * (3 - 2 * t);
function value(x, y, s) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const a = hash(xi, yi, s), b = hash(xi + 1, yi, s), c = hash(xi, yi + 1, s), d = hash(xi + 1, yi + 1, s);
  const u = smooth(xf), v = smooth(yf);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x, y, oct = 5, s = 0) {
  let sum = 0, amp = 0.5, f = 1, norm = 0;
  for (let i = 0; i < oct; i++) { sum += amp * value(x * f, y * f, s + i * 17); norm += amp; amp *= 0.5; f *= 2; }
  return sum / norm;
}
/** Worley noise: distances to the nearest two feature points (cell size in px). */
function worley(x, y, cell, s = 0) {
  const cx = Math.floor(x / cell), cy = Math.floor(y / cell);
  let f1 = 1e9, f2 = 1e9;
  for (let j = -1; j <= 1; j++)
    for (let i = -1; i <= 1; i++) {
      const gx = cx + i, gy = cy + j;
      const px = (gx + hash(gx, gy, s)) * cell, py = (gy + hash(gx, gy, s + 1)) * cell;
      const d = Math.hypot(px - x, py - y);
      if (d < f1) { f2 = f1; f1 = d; } else if (d < f2) f2 = d;
    }
  return [f1 / cell, f2 / cell];
}
const clamp = (v) => Math.max(0, Math.min(1, v));
/** Soft studio light: brighter top-left, gentle vignette. */
const light = (x, y) => {
  const nx = x / W, ny = y / H;
  const glow = 1 - 0.18 * Math.hypot(nx - 0.32, (ny - 0.25) * 0.8);
  const vig = 1 - 0.1 * Math.pow(Math.hypot(nx - 0.5, ny - 0.5) * 1.4, 2);
  return glow * vig;
};

async function save(name, fn) {
  const buf = Buffer.alloc(W * H * 3);
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const [r, g, b] = fn(x, y);
      const i = (y * W + x) * 3;
      buf[i] = clamp(r) * 255; buf[i + 1] = clamp(g) * 255; buf[i + 2] = clamp(b) * 255;
    }
  await sharp(buf, { raw: { width: W, height: H, channels: 3 } }).webp({ quality: 90 }).toFile(`public/materials/${name}.webp`);
  console.log("wrote", name);
}
const grey = (v) => [v, v * 0.99, v * 0.97];

/* ---------- materials ---------- */
// Performance fabric: fine, tight plain weave.
const weave = (x, y, p = 3.2) => {
  const warp = 0.5 + 0.5 * Math.sin((x / p) * Math.PI), weft = 0.5 + 0.5 * Math.sin((y / p) * Math.PI);
  const over = (Math.floor(x / p) + Math.floor(y / p)) % 2 ? warp : weft;
  return over;
};
await save("performance-fabric", (x, y) => {
  const t = weave(x, y) * 0.07 + fbm(x / 40, y / 40, 3, 1) * 0.06 + (hash(x, y, 2) - 0.5) * 0.05;
  return grey((0.8 + t) * light(x, y));
});

// Linen: irregular slubbed threads in both directions.
await save("linen", (x, y) => {
  const rowV = hash(0, Math.floor(y / 2.6), 3) * 0.5 + fbm(x / 90, y / 2.6, 2, 4) * 0.5;
  const colV = hash(Math.floor(x / 2.6), 0, 5) * 0.5 + fbm(x / 2.6, y / 90, 2, 6) * 0.5;
  const slub = Math.pow(fbm(x / 60, y / 3, 3, 8), 3) * 0.25;
  const t = ((Math.floor(x / 2.6) + Math.floor(y / 2.6)) % 2 ? rowV : colV) * 0.13 + slub + (hash(x, y, 9) - 0.5) * 0.04;
  return grey((0.76 + t) * light(x, y));
});

// Velvet: soft pile with a directional sheen and crushed-pile variation.
await save("velvet", (x, y) => {
  const sheen = fbm(x / 260 + y / 520, y / 200, 4, 10);
  const crush = fbm(x / 70, y / 40, 4, 11) * 0.5 + fbm(x / 18, y / 12, 2, 12) * 0.5;
  const pile = (hash(x, y, 13) - 0.5) * 0.035;
  const t = 0.62 + sheen * 0.32 + (crush - 0.5) * 0.12 + pile;
  return grey(t * light(x, y));
});

/** Height map shaded by a light from the top-left (gives bumps a 3D look). */
const shade = (h, x, y, k) => 0.5 + (h(x - 1, y - 1) - h(x + 1, y + 1)) * k;

// Bouclé: dense raised loops of yarn.
const boucleH = (x, y) => {
  const [a] = worley(x, y, 7, 20);
  const [b] = worley(x * 1.3 + 5, y * 1.3 + 2, 7, 21);
  return Math.max(0, 1 - a * a * 1.6) * 0.7 + Math.max(0, 1 - b * b * 1.6) * 0.5;
};
await save("boucle", (x, y) => {
  const t = 0.74 + (shade(boucleH, x, y, 0.55) - 0.5) * 0.9 + boucleH(x, y) * 0.08 + fbm(x / 140, y / 140, 3, 22) * 0.05 + (hash(x, y, 23) - 0.5) * 0.03;
  return grey(t * light(x, y));
});

// Leather: soft pebbled top-grain (low-contrast domes) with gentle creases and pores.
const pebble = (s) => (x, y) => {
  const wx = x + fbm(x / 50, y / 50, 3, s) * 10, wy = y + fbm(x / 50, y / 50, 3, s + 1) * 10;
  const [f1, f2] = worley(wx, wy, 8, s + 2);
  return Math.max(0, 1 - f1 * f1 * 1.4) * 0.8 + Math.min(1, (f2 - f1) * 4) * 0.2;
};
const leatherH = pebble(30);
const leather = (x, y, h = leatherH, s = 30) => {
  const pores = hash(Math.floor(x / 2), Math.floor(y / 2), s + 3) > 0.993 ? -0.06 : 0;
  const t = 0.62 + (shade(h, x, y, 0.35) - 0.5) * 0.55 + h(x, y) * 0.05 + fbm(x / 220, y / 180, 4, s + 4) * 0.14 + pores + (hash(x, y, s + 5) - 0.5) * 0.02;
  return [t * 1.08, t * 0.98, t * 0.88];
};
await save("full-leather", (x, y) => leather(x, y).map((v) => v * light(x, y)));

// Half leather: leather seat panel meeting matched fabric sides at a stitched seam.
await save("half-leather", (x, y) => {
  const seam = W * 0.46;
  const L = light(x, y);
  if (Math.abs(x - seam) < 9) {
    const stitch = Math.abs(x - seam) < 2.5 && Math.floor(y / 9) % 2 === 0 ? 0.55 : 0.82;
    return grey(stitch * L - (hash(x, y, 40) - 0.5) * 0.03);
  }
  if (x < seam) {
    const shadeSeam = 1 - 0.12 * Math.pow(Math.max(0, 1 - (seam - x) / 60), 2);
    return leather(x, y).map((v) => v * L * shadeSeam);
  }
  const t = weave(x, y) * 0.07 + fbm(x / 40, y / 40, 3, 41) * 0.06 + (hash(x, y, 42) - 0.5) * 0.05;
  return grey((0.82 + t) * L);
});
