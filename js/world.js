// Room data and tilemap generation for Vesper's Lament
export const TILE = 16;
export const COLS = 30;
export const ROWS = 17;
export const VIEW_W = COLS * TILE;
export const VIEW_H = ROWS * TILE;

const WALL = '#';

function blankGrid() {
  const g = [];
  for (let y = 0; y < ROWS; y++) {
    g.push(new Array(COLS).fill('.'));
  }
  // outer shell
  for (let x = 0; x < COLS; x++) { g[0][x] = WALL; g[ROWS - 1][x] = WALL; }
  for (let y = 0; y < ROWS; y++) { g[y][0] = WALL; g[y][COLS - 1] = WALL; }
  // floor
  for (let x = 1; x < COLS - 1; x++) { g[15][x] = WALL; g[16][x] = WALL; }
  return g;
}

function applyOps(g, ops = []) {
  for (const op of ops) {
    const [kind, ...a] = op;
    if (kind === 'fill') {
      const [x, y, w, h, c = WALL] = a;
      for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) {
        if (yy >= 0 && yy < ROWS && xx >= 0 && xx < COLS) g[yy][xx] = c;
      }
    } else if (kind === 'carve') {
      const [x, y, w, h] = a;
      for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) {
        if (yy >= 0 && yy < ROWS && xx >= 0 && xx < COLS) g[yy][xx] = '.';
      }
    } else if (kind === 'ground') {
      const [x, w, row = 15] = a;
      for (let xx = x; xx < x + w; xx++) for (let yy = row; yy < ROWS; yy++) {
        if (xx >= 0 && xx < COLS) g[yy][xx] = WALL;
      }
    } else if (kind === 'platform') {
      const [x, y, w] = a;
      for (let xx = x; xx < x + w; xx++) {
        if (xx >= 0 && xx < COLS && y >= 0 && y < ROWS) g[y][xx] = '=';
      }
    } else if (kind === 'spikes') {
      const [x, y, w] = a;
      for (let xx = x; xx < x + w; xx++) {
        if (xx >= 0 && xx < COLS && y >= 0 && y < ROWS) g[y][xx] = '^';
      }
    } else if (kind === 'pillar') {
      const [x, y, h] = a;
      for (let yy = y; yy < y + h; yy++) {
        if (yy >= 0 && yy < ROWS) g[yy][x] = WALL;
      }
    }
  }
  return g;
}

function carveDoors(g, doors = []) {
  for (const d of doors) {
    if (d.side === 'left') for (const r of d.rows) g[r][0] = '.';
    if (d.side === 'right') for (const r of d.rows) g[r][COLS - 1] = '.';
    if (d.side === 'top') for (const c of d.cols) g[0][c] = '.';
    if (d.side === 'bottom') for (const c of d.cols) { g[ROWS - 1][c] = '.'; g[ROWS - 2][c] = '.'; }
  }
}

const defs = [
  {
    id: 'A',
    name: 'Ashen Vestibule',
    theme: 'crypt',
    map: [0, 2],
    subtitle: 'Where the last candle remembers her name.',
    doors: [
      { side: 'right', rows: [12, 13, 14], to: 'B', entry: 'left' }
    ],
    spawns: { left: { x: 26, y: 240 }, right: { x: 456, y: 240 } },
    ops: [
      ['carve', 8, 12, 5, 2], ['carve', 15, 10, 4, 2],
      ['platform', 8, 12, 5], ['platform', 15, 10, 4],
      ['fill', 21, 13, 1, 2], ['fill', 22, 14, 1, 1]
    ],
    candles: [[10, 14], [19, 14], [25, 14], [6, 14]],
    shrine: { x: 4, y: 15 },
    enemies: [],
    items: [],
    ambience: 'dust'
  },
  {
    id: 'B',
    name: 'Hall of Broken Saints',
    theme: 'crypt',
    map: [1, 2],
    subtitle: 'Their stone eyes follow, but they cannot see.',
    doors: [
      { side: 'left', rows: [12, 13, 14], to: 'A', entry: 'right' },
      { side: 'right', rows: [12, 13, 14], to: 'C', entry: 'left' },
      { side: 'top', cols: [24, 25, 26, 27], to: 'E', entry: 'bottom' }
    ],
    spawns: {
      left: { x: 26, y: 240 }, right: { x: 456, y: 240 },
      top: { x: 26 * TILE, y: 4 * TILE }, bottom: { x: 26 * TILE, y: 240 }
    },
    ops: [
      ['carve', 12, 15, 4, 2], ['spikes', 12, 16, 4],
      ['platform', 4, 12, 3], ['platform', 8, 10, 3], ['platform', 18, 12, 3],
      ['platform', 21, 8, 3], ['platform', 24, 4, 5],
      ['carve', 24, 1, 4, 3]
    ],
    candles: [[2, 14], [10, 9], [17, 14], [28, 14]],
    enemies: [
      { type: 'crawler', x: 8, y: 15 },
      { type: 'bat', x: 15, y: 7 },
      { type: 'crawler', x: 22, y: 15 }
    ],
    ambience: 'dust'
  },
  {
    id: 'C',
    name: 'Cloister of Whispers',
    theme: 'cloister',
    map: [2, 2],
    subtitle: 'Every prayer here was answered wrongly.',
    doors: [
      { side: 'left', rows: [12, 13, 14], to: 'B', entry: 'right' },
      { side: 'bottom', cols: [21, 22, 23], to: 'D', entry: 'top' }
    ],
    spawns: {
      left: { x: 26, y: 240 }, right: { x: 456, y: 240 },
      top: { x: 22 * TILE, y: 12 * TILE }, bottom: { x: 22 * TILE, y: 12 * TILE }
    },
    ops: [
      ['carve', 21, 15, 3, 2], ['platform', 19, 12, 4],
      ['platform', 7, 11, 3], ['platform', 12, 9, 4], ['platform', 16, 12, 2],
      ['carve', 1, 9, 3, 2], ['platform', 2, 11, 3],
      ['fill', 28, 8, 2, 7], ['fill', 27, 14, 1, 2]
    ],
    candles: [[5, 14], [11, 14], [18, 11], [25, 14], [26, 14]],
    shrine: { x: 4, y: 15 },
    enemies: [
      { type: 'bat', x: 9, y: 6 },
      { type: 'wraith', x: 15, y: 8 },
      { type: 'bat', x: 24, y: 9 },
      { type: 'crawler', x: 9, y: 15 }
    ],
    ambience: 'dust'
  },
  {
    id: 'D',
    name: 'Drowned Ossuary',
    theme: 'ossuary',
    map: [2, 3],
    subtitle: 'The water carries old sins downhill.',
    doors: [
      { side: 'top', cols: [21, 22, 23], to: 'C', entry: 'bottom' }
    ],
    spawns: {
      top: { x: 22 * TILE, y: 3 * TILE }, bottom: { x: 22 * TILE, y: 26 }
    },
    ops: [
      ['carve', 21, 0, 3, 4],
      ['platform', 20, 3, 4], ['platform', 17, 6, 4], ['platform', 13, 9, 4],
      ['platform', 18, 12, 4], ['platform', 8, 12, 3], ['platform', 3, 14, 3],
      ['carve', 8, 15, 2, 2], ['carve', 15, 15, 2, 2],
      ['spikes', 8, 16, 2], ['spikes', 15, 16, 2],
      ['ground', 1, 6, 15], ['ground', 24, 5, 15],
      ['carve', 1, 13, 2, 2], ['platform', 1, 13, 2]
    ],
    candles: [[6, 14], [12, 8], [23, 14], [28, 14]],
    shrine: { x: 26, y: 15 },
    enemies: [
      { type: 'wraith', x: 10, y: 9 },
      { type: 'crawler', x: 14, y: 15 },
      { type: 'bat', x: 20, y: 7 },
      { type: 'wraith', x: 5, y: 11 }
    ],
    items: [
      { type: 'doublejump', x: 2.5, y: 13 }
    ],
    ambience: 'drip'
  },
  {
    id: 'E',
    name: 'Bell Tower Ascent',
    theme: 'tower',
    map: [1, 1],
    subtitle: 'The bell has no tongue. Still, it rings.',
    doors: [
      { side: 'bottom', cols: [25, 26, 27], to: 'B', entry: 'top' },
      { side: 'right', rows: [5, 6, 7], to: 'F', entry: 'left' }
    ],
    spawns: {
      bottom: { x: 26 * TILE, y: 240 },
      top: { x: 26 * TILE, y: 240 },
      left: { x: 26, y: 240 },
      right: { x: 456, y: 6 * TILE }
    },
    ops: [
      ['carve', 25, 15, 3, 2],
      ['platform', 23, 13, 4], ['platform', 19, 11, 4], ['platform', 23, 9, 4],
      ['platform', 18, 7, 4], ['platform', 23, 8, 5],
      ['platform', 14, 5, 4], ['platform', 9, 3, 4], ['platform', 4, 3, 3],
      ['carve', 28, 5, 2, 3]
    ],
    candles: [[3, 14], [7, 2], [17, 4], [27, 4], [20, 10]],
    shrine: { x: 3, y: 15 },
    enemies: [
      { type: 'bat', x: 12, y: 9 },
      { type: 'bat', x: 22, y: 5 },
      { type: 'wraith', x: 16, y: 12 },
      { type: 'bat', x: 25, y: 2 }
    ],
    items: [
      { type: 'dash', x: 5, y: 3 }
    ],
    ambience: 'dust'
  },
  {
    id: 'F',
    name: 'Gargoyle Rooftops',
    theme: 'roof',
    map: [2, 1],
    subtitle: 'Rain washes the blood from the gutters.',
    doors: [
      { side: 'left', rows: [12, 13, 14], to: 'E', entry: 'right' },
      { side: 'right', rows: [12, 13, 14], to: 'G', entry: 'left' }
    ],
    spawns: {
      left: { x: 26, y: 240 }, right: { x: 456, y: 240 },
      top: { x: 26 * TILE, y: 5 * TILE }
    },
    ops: [
      ['carve', 8, 15, 8, 2], ['spikes', 8, 16, 8],
      ['ground', 16, 13, 14],
      ['platform', 3, 11, 3], ['platform', 12, 8, 3],
      ['platform', 18, 10, 4], ['platform', 24, 7, 4],
      ['fill', 1, 1, 2, 4], ['fill', 27, 1, 2, 4]
    ],
    candles: [[6, 14], [20, 13], [28, 13]],
    shrine: { x: 3, y: 15 },
    enemies: [
      { type: 'gargoyle', x: 6, y: 5 },
      { type: 'gargoyle', x: 15, y: 4 },
      { type: 'knight', x: 20, y: 14 },
      { type: 'bat', x: 25, y: 4 }
    ],
    items: [
      { type: 'heart', x: 26, y: 7 }
    ],
    ambience: 'rain'
  },
  {
    id: 'G',
    name: 'Chapel of the Pale Rose',
    theme: 'chapel',
    map: [3, 1],
    subtitle: 'The Abbess has been waiting a very long time.',
    doors: [
      { side: 'left', rows: [12, 13, 14], to: 'F', entry: 'right' }
    ],
    spawns: {
      left: { x: 26, y: 240 }, right: { x: 456, y: 240 }
    },
    ops: [
      ['platform', 5, 11, 3], ['platform', 22, 11, 3],
      ['fill', 12, 1, 1, 5], ['fill', 17, 1, 1, 5]
    ],
    candles: [[3, 14], [8, 14], [21, 14], [26, 14]],
    enemies: [],
    boss: true,
    ambience: 'dust'
  }
];

export const ROOMS = {};
export const ROOM_ORDER = [];
for (const def of defs) {
  const grid = applyOps(blankGrid(), def.ops);
  carveDoors(grid, def.doors);
  const room = { ...def, grid, exits: [] };
  for (const d of def.doors) {
    let zone;
    if (d.side === 'left') zone = { x: -8, y: d.rows[0] * TILE, w: 18, h: (d.rows[d.rows.length - 1] - d.rows[0] + 1) * TILE };
    if (d.side === 'right') zone = { x: VIEW_W - 10, y: d.rows[0] * TILE, w: 20, h: (d.rows[d.rows.length - 1] - d.rows[0] + 1) * TILE };
    if (d.side === 'top') zone = { x: d.cols[0] * TILE, y: -14, w: (d.cols[d.cols.length - 1] - d.cols[0] + 1) * TILE, h: 22 };
    if (d.side === 'bottom') zone = { x: d.cols[0] * TILE, y: VIEW_H - 6, w: (d.cols[d.cols.length - 1] - d.cols[0] + 1) * TILE, h: 20 };
    room.exits.push({ ...d, zone });
  }
  ROOMS[def.id] = room;
  ROOM_ORDER.push(room);
}

export function tileAt(room, tx, ty) {
  if (tx < 0 || tx >= COLS || ty < 0 || ty >= ROWS) return WALL;
  return room.grid[ty][tx];
}

export function isSolid(ch) { return ch === '#'; }

export function isPlatform(ch) { return ch === '='; }

export function isSpike(ch) { return ch === '^'; }

export const START_ROOM = 'A';
export const SHRINE_ROOMS = ROOM_ORDER.filter(r => r.shrine).map(r => r.id);
