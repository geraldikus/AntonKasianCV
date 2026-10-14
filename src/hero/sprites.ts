import { Texture } from "pixi.js";

export type Palette = Record<string, string>;

const PAPER: Palette = {
  k: "#1a120c",
  h: "#3b2416",
  s: "#f0c4a0",
  e: "#fffdf6",
  r: "#d94f30",
  t: "#2c3d4f",
  b: "#5a4028",
  n: "#2b1c12",
  g: "#4e8f3a",
  d: "#6b4a2b",
  m: "#3d2a18",
  c: "#fffdf6",
  u: "#cfe8ff",
  y: "#e2a51a",
  w: "#fff4b0",
  z: "#9ad0ff",
  o: "#f4d27a",
  f: "#d9ecff",
  p: "#7ec6ff",
  x: "#ffffff",
};

const PLAYER_IDLE = [
  "......kkkk......",
  "....kkhhhhkk....",
  "...khhhhhhhhk...",
  "...khhsssshhk...",
  "...ksessesssk...",
  "...kssssssssk...",
  "....kssssssk....",
  "....kkrrrrkk....",
  "...krrrrrrrrk...",
  "..ktkrrrrkktk...",
  "..kt.tttt.tk...",
  "...k.tttt.k....",
  "....kbbbbk.....",
  "....kbkkbk.....",
  "....kn..nk.....",
  "....kk..kk.....",
];

const PLAYER_RUN_A = [
  "......kkkk......",
  "....kkhhhhkk....",
  "...khhhhhhhhk...",
  "...khhsssshhk...",
  "...ksessesssk...",
  "...kssssssssk...",
  "....kssssssk....",
  "....kkrrrrkk....",
  "...krrrrrrrrk...",
  ".kt.krrrrk.tk..",
  ".kt..tttt..tk..",
  "...k.tttt.k....",
  "....kbbbbk.....",
  "....kbbbk......",
  "...knk..nk.....",
  "...kk....kk....",
];

const PLAYER_RUN_B = [
  "......kkkk......",
  "....kkhhhhkk....",
  "...khhhhhhhhk...",
  "...khhsssshhk...",
  "...ksessesssk...",
  "...kssssssssk...",
  "....kssssssk....",
  "....kkrrrrkk....",
  "...krrrrrrrrk...",
  "..ktkrrrrkktk...",
  "..kt.tttt.tk...",
  "...k.tttt.k....",
  "....kbbbbk.....",
  ".....kbbbk.....",
  "....kn..knk....",
  "....kk...kk....",
];

const PLAYER_JUMP = [
  "......kkkk......",
  "....kkhhhhkk....",
  "...khhhhhhhhk...",
  "...khhsssshhk...",
  "...ksessesssk...",
  "...kssssssssk...",
  "....kssssssk....",
  "..k.kkrrrrkk.k..",
  ".ktkrrrrrrrrktk.",
  "..kt.tttt.tk...",
  "...k.tttt.k....",
  "....kbbbbk.....",
  "....kbkkbk.....",
  "...kn....nk....",
  "...kk....kk....",
  "................",
];

const GROUND = [
  "gggggggggggggggg",
  "gkgkgkgkgkgkgkgk",
  "dddddddddddddddd",
  "dmdmdmdmdmdmdmdm",
  "mmmmmmmmmmmmmmmm",
  "mkmkmkmkmkmkmkmk",
  "kkkkkkkkkkkkkkkk",
  "................",
];

const COIN_A = [
  "..kkkk..",
  ".kyyyyk.",
  "kyywyyyk",
  "kywwyyyk",
  "kyyyyyyk",
  "kyyyyyyk",
  ".kyyyyk.",
  "..kkkk..",
];

const COIN_B = [
  "...kk...",
  "..kyyk..",
  ".kywyyk.",
  ".kwwyyk.",
  ".kyyyyk.",
  ".kyyyyk.",
  "..kyyk..",
  "...kk...",
];

const CLOUD = [
  "......kkkkkk......",
  "....kkcccccckk....",
  "...kcccccccccck...",
  "..kccccccckkkkkkk.",
  ".kkccccccccccccck.",
  "kkcccccccccccccckk",
  ".kkkkkkkkkkkkkkkk.",
];

const DUST = [
  ".k.",
  "kkk",
  ".k.",
];

const PARTICLE = [
  "yy",
  "yy",
];

function normalize(rows: string[]): string[] {
  const width = Math.max(...rows.map((row) => row.length));
  return rows.map((row) => {
    if (row.length > width) {
      throw new Error(`Sprite row too long (${row.length}): ${row}`);
    }
    return row.padEnd(width, ".");
  });
}

function pixelsToCanvas(rows: string[], palette: Palette): HTMLCanvasElement {
  const grid = normalize(rows);
  const height = grid.length;
  const width = grid[0]?.length ?? 0;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  ctx.imageSmoothingEnabled = false;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const ch = grid[y][x];
      if (!ch || ch === ".") continue;
      ctx.fillStyle = palette[ch] ?? "#000";
      ctx.fillRect(x, y, 1, 1);
    }
  }
  return canvas;
}

function textureFrom(rows: string[], palette: Palette): Texture {
  const texture = Texture.from(pixelsToCanvas(rows, palette));
  texture.source.scaleMode = "nearest";
  texture.source.autoGenerateMipmaps = false;
  return texture;
}

export type SpriteSheet = {
  idle: Texture;
  run: Texture[];
  jump: Texture;
  ground: Texture;
  coin: Texture[];
  cloud: Texture;
  dust: Texture;
  particle: Texture;
};

export function makeSheet(): SpriteSheet {
  const palette = PAPER;
  return {
    idle: textureFrom(PLAYER_IDLE, palette),
    run: [textureFrom(PLAYER_RUN_A, palette), textureFrom(PLAYER_RUN_B, palette)],
    jump: textureFrom(PLAYER_JUMP, palette),
    ground: textureFrom(GROUND, palette),
    coin: [textureFrom(COIN_A, palette), textureFrom(COIN_B, palette)],
    cloud: textureFrom(CLOUD, palette),
    dust: textureFrom(DUST, palette),
    particle: textureFrom(PARTICLE, palette),
  };
}
