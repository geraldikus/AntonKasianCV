import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pub = join(root, "public");
mkdirSync(pub, { recursive: true });

const FONT_5x7 = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
  G: ["01110", "10001", "10000", "10111", "10001", "10001", "01110"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  "/": ["00001", "00010", "00100", "01000", "10000", "10000", "10000"],
  "-": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  "2": ["01110", "10001", "00001", "00110", "01000", "10000", "11111"],
  "D": ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
};

function crc32(buf) {
  let crc = 0xffffffff;
  for (const byte of buf) {
    crc ^= byte;
    for (let i = 0; i < 8; i += 1) {
      const mask = -(crc & 1);
      crc = (crc >>> 1) ^ (0xedb88320 & mask);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function writePng(path, width, height, getPixel) {
  const rows = [];
  for (let y = 0; y < height; y += 1) {
    const row = Buffer.alloc(1 + width * 3);
    for (let x = 0; x < width; x += 1) {
      const [r, g, b] = getPixel(x, y);
      const i = 1 + x * 3;
      row[i] = r;
      row[i + 1] = g;
      row[i + 2] = b;
    }
    rows.push(row);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(Buffer.concat(rows))),
    chunk("IEND", Buffer.alloc(0)),
  ]);
  writeFileSync(path, png);
}

function drawText(setPixel, text, originX, originY, scale, color) {
  let x = originX;
  for (const ch of text) {
    const glyph = FONT_5x7[ch] ?? FONT_5x7[" "];
    for (let gy = 0; gy < 7; gy += 1) {
      for (let gx = 0; gx < 5; gx += 1) {
        if (glyph[gy][gx] !== "1") continue;
        for (let py = 0; py < scale; py += 1) {
          for (let px = 0; px < scale; px += 1) {
            setPixel(x + gx * scale + px, originY + gy * scale + py, color);
          }
        }
      }
    }
    x += 6 * scale;
  }
}

const W = 1200;
const H = 630;
const pixels = new Uint8Array(W * H * 3);
pixels.fill(0xf4);
for (let i = 1; i < pixels.length; i += 3) pixels[i] = 0xf1;
for (let i = 2; i < pixels.length; i += 3) pixels[i] = 0xe8;

function setPixel(x, y, [r, g, b]) {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const i = (y * W + x) * 3;
  pixels[i] = r;
  pixels[i + 1] = g;
  pixels[i + 2] = b;
}

function fillRect(x, y, w, h, color) {
  for (let yy = y; yy < y + h; yy += 1) {
    for (let xx = x; xx < x + w; xx += 1) setPixel(xx, yy, color);
  }
}

const ink = [0x1b, 0x1b, 0x1b];
const accent = [0xd9, 0x4f, 0x30];
const sky = [0x9a, 0xd0, 0xff];
const grass = [0x4e, 0x8f, 0x3a];
const dirt = [0x6b, 0x4a, 0x2b];

fillRect(0, 0, W, 360, sky);
fillRect(0, 360, W, 40, grass);
fillRect(0, 400, W, H - 400, dirt);
fillRect(0, 0, W, 16, ink);
fillRect(0, H - 16, W, 16, ink);
fillRect(0, 0, 16, H, ink);
fillRect(W - 16, 0, 16, H, ink);
fillRect(16, 16, W - 32, 8, accent);
fillRect(48, 200, 16, 160, accent);
fillRect(80, 200, 48, 16, accent);
fillRect(80, 272, 32, 16, accent);

drawText(setPixel, "ANTON KASIAN", 160, 88, 8, ink);
drawText(setPixel, "FRONTEND / GAME DEV", 160, 168, 5, accent);
drawText(setPixel, "TYPESCRIPT - PIXIJS - HELSINKI", 160, 520, 4, [0xff, 0xfd, 0xf6]);

writePng(join(pub, "og.png"), W, H, (x, y) => {
  const i = (y * W + x) * 3;
  return [pixels[i], pixels[i + 1], pixels[i + 2]];
});

console.log("wrote public/og.png");
