// Static tile layers and parallax architecture
import { COLS, ROWS, TILE } from './world.js';
import { makeCanvas, mulberry32, px, ellipse, line, P } from './art.js';

const THEMES = {
  crypt: { wall: '#241a30', wall2: '#2f2139', wall3: '#3b2b46', mortar: '#140d1c', hi: '#4a3758', moss: '#2f4a3c', deep: '#0d0813' },
  cloister: { wall: '#211a2b', wall2: '#2c2238', wall3: '#3a2c49', mortar: '#120c19', hi: '#4b3a5a', moss: '#344b41', deep: '#0c0811' },
  ossuary: { wall: '#1b2828', wall2: '#243333', wall3: '#314343', mortar: '#0d1516', hi: '#43605c', moss: '#3d5f4c', deep: '#080f10' },
  tower: { wall: '#1c1a2b', wall2: '#262338', wall3: '#332e49', mortar: '#0e0c17', hi: '#4a4468', moss: '#2f4a4a', deep: '#090811' },
  roof: { wall: '#191724', wall2: '#232030', wall3: '#302c3e', mortar: '#0b0a12', hi: '#45405c', moss: '#2c3c3a', deep: '#07060c' },
  chapel: { wall: '#291f30', wall2: '#35283d', wall3: '#43324d', mortar: '#170f1c', hi: '#58405f', moss: '#3c4438', deep: '#0e0912' }
};

export function themeOf(room) { return THEMES[room.theme] || THEMES.crypt; }

export function buildTileLayer(room) {
  const { canvas, ctx } = makeCanvas(COLS * TILE, ROWS * TILE);
  const th = themeOf(room);
  const rnd = mulberry32(room.id.charCodeAt(0) * 9173 + 11);

  const solid = (x, y) => {
    if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return true;
    return room.grid[y][x] === '#';
  };

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const ch = room.grid[y][x];
      const X = x * TILE, Y = y * TILE;
      if (ch === '#') {
        const above = !solid(x, y - 1);
        const below = !solid(x, y + 1);
        const left = !solid(x - 1, y);
        const right = !solid(x + 1, y);
        const v = rnd();
        // base
        px(ctx, X, Y, TILE, TILE, v > .55 ? th.wall2 : th.wall);
        // brick courses (8px)
        for (let by = 0; by < 2; by++) {
          const oy = Y + by * 8;
          const offset = (y * 2 + by) % 2 ? 0 : 4;
          px(ctx, X, oy, TILE, 1, th.mortar);
          px(ctx, X + ((offset + 8) % 16), oy, 1, 8, th.mortar);
          px(ctx, X + offset, oy, 1, 8, th.mortar);
        }
        // block variation
        if (v > .72) px(ctx, X + 2 + Math.floor(rnd() * 8), Y + 2 + Math.floor(rnd() * 10), 3, 1, th.wall3);
        if (v > .84) px(ctx, X + 1 + Math.floor(rnd() * 10), Y + 3 + Math.floor(rnd() * 8), 1, 3, th.mortar);
        // exposed top edge
        if (above) {
          px(ctx, X, Y, TILE, 2, th.hi);
          px(ctx, X, Y + 2, TILE, 1, th.wall3);
          for (let i = 0; i < 4; i++) {
            if (rnd() > .55) px(ctx, X + Math.floor(rnd() * 14), Y + 2, 2, 1, th.mortar);
          }
          // moss drips
          if (rnd() > .45) {
            const mx = X + Math.floor(rnd() * 12);
            px(ctx, mx, Y + 2, 1, 2 + Math.floor(rnd() * 4), th.moss);
          }
        }
        if (below) {
          px(ctx, X, Y + TILE - 2, TILE, 2, th.deep);
          px(ctx, X, Y + TILE - 3, TILE, 1, th.wall3);
        }
        if (left) {
          px(ctx, X, Y, 2, TILE, th.wall3);
          px(ctx, X, Y, 1, TILE, th.deep);
        }
        if (right) {
          px(ctx, X + TILE - 2, Y, 2, TILE, th.wall3);
          px(ctx, X + TILE - 1, Y, 1, TILE, th.deep);
        }
        // occasional cracks / bone
        if (v > .93) {
          px(ctx, X + 6, Y + 4, 1, 5, th.mortar);
          px(ctx, X + 7, Y + 8, 2, 1, th.mortar);
        }
        if (v < .06 && room.theme !== 'roof') {
          px(ctx, X + 5, Y + 9, 4, 1, P.bone2);
          px(ctx, X + 7, Y + 8, 1, 3, P.bone2);
        }
      } else if (ch === '=') {
        // one-way stone ledge
        px(ctx, X, Y, TILE, 2, th.hi);
        px(ctx, X, Y + 2, TILE, 5, th.wall2);
        px(ctx, X, Y + 7, TILE, 2, th.mortar);
        px(ctx, X + 2, Y + 2, 1, 5, th.wall3);
        px(ctx, X + 11, Y + 2, 1, 5, th.wall3);
        // little supports / carving
        px(ctx, X + 5, Y + 3, 2, 2, th.deep);
        px(ctx, X + 9, Y + 3, 2, 2, th.deep);
        if (rnd() > .5) px(ctx, X + 1 + Math.floor(rnd() * 12), Y + 1, 2, 1, P.bone2);
        // hanging moss
        if (rnd() > .55) px(ctx, X + Math.floor(rnd() * 14), Y + 8, 1, 2 + Math.floor(rnd() * 3), th.moss);
      } else if (ch === '^') {
        // spikes
        px(ctx, X, Y + 10, TILE, 6, th.deep);
        for (let i = 0; i < 4; i++) {
          const sx = X + i * 4;
          ctx.fillStyle = P.steel2;
          ctx.beginPath();
          ctx.moveTo(sx, Y + 15);
          ctx.lineTo(sx + 2, Y + 4);
          ctx.lineTo(sx + 4, Y + 15);
          ctx.closePath(); ctx.fill();
          px(ctx, sx + 2, Y + 5, 1, 5, P.steel);
        }
        px(ctx, X, Y + 14, TILE, 2, '#3a3346');
      }
    }
  }

  // door frame trim around openings
  for (const d of room.doors) {
    ctx.fillStyle = th.hi;
    if (d.side === 'left') {
      const y0 = d.rows[0] * TILE, y1 = (d.rows[d.rows.length - 1] + 1) * TILE;
      px(ctx, 0, y0 - 3, 2, y1 - y0 + 6, th.wall3);
    } else if (d.side === 'right') {
      const y0 = d.rows[0] * TILE, y1 = (d.rows[d.rows.length - 1] + 1) * TILE;
      px(ctx, COLS * TILE - 2, y0 - 3, 2, y1 - y0 + 6, th.wall3);
    }
  }

  return canvas;
}

// ---------------------------------------------------------------------------
// Parallax background architecture
// ---------------------------------------------------------------------------
function pointedArch(ctx, x, y, w, h) {
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x, y + h * .34);
  ctx.quadraticCurveTo(x, y + h * .1, x + w * .5, y);
  ctx.quadraticCurveTo(x + w, y + h * .1, x + w, y + h * .34);
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
}

function roseWindow(ctx, cx, cy, r, t, bright) {
  ctx.save();
  ctx.globalAlpha = bright;
  ctx.fillStyle = '#0b0813';
  ctx.beginPath(); ctx.arc(cx, cy, r + 5, 0, Math.PI * 2); ctx.fill();
  const cols = ['#5b1f3b', '#3b2a63', '#6b3a2a', '#224a4a', '#5b1f3b', '#463060', '#7a3a4a', '#2c3d5c'];
  for (let i = 0; i < 12; i++) {
    const a0 = i / 12 * Math.PI * 2;
    const a1 = (i + 1) / 12 * Math.PI * 2;
    ctx.fillStyle = cols[i % cols.length];
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, a0, a1);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = '#c98a5a';
  ctx.beginPath(); ctx.arc(cx, cy, r * .3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#e4b978';
  ctx.beginPath(); ctx.arc(cx, cy, r * .17, 0, Math.PI * 2); ctx.fill();
  // tracery
  ctx.strokeStyle = 'rgba(10,6,14,.85)';
  ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy, r * .55, 0, Math.PI * 2); ctx.stroke();
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * Math.PI * 2;
    line(ctx, cx + Math.cos(a) * r * .3, cy + Math.sin(a) * r * .3, cx + Math.cos(a) * r, cy + Math.sin(a) * r, 'rgba(10,6,14,.8)', 1);
  }
  // glow
  ctx.globalAlpha = .12;
  ctx.fillStyle = '#e4b978';
  ctx.beginPath(); ctx.arc(cx, cy, r + 22, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function moon(ctx, x, y, r) {
  ctx.save();
  ctx.globalAlpha = .12;
  ctx.fillStyle = '#e8e0ef';
  ctx.beginPath(); ctx.arc(x, y, r * 2.6, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#ded3e4';
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#c8bccf';
  ctx.beginPath(); ctx.arc(x - r * .3, y - r * .2, r * .18, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + r * .25, y + r * .3, r * .12, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + r * .1, y - r * .45, r * .09, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

export function drawBackground(ctx, room, t, playerX = 240) {
  const shift = (playerX - 240) * .022;
  const W = COLS * TILE, H = ROWS * TILE;
  const th = themeOf(room);
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  if (room.theme === 'roof') {
    grad.addColorStop(0, '#0a0916'); grad.addColorStop(.55, '#141126'); grad.addColorStop(1, '#1d1626');
  } else if (room.theme === 'ossuary') {
    grad.addColorStop(0, '#081012'); grad.addColorStop(.6, '#0f1a1b'); grad.addColorStop(1, '#122021');
  } else if (room.theme === 'chapel') {
    grad.addColorStop(0, '#150c1d'); grad.addColorStop(.6, '#211327'); grad.addColorStop(1, '#160c1a');
  } else {
    grad.addColorStop(0, '#0a0711'); grad.addColorStop(.55, '#120c1a'); grad.addColorStop(1, '#171020');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  if (room.theme === 'crypt') {
    // deep wall courses
    ctx.globalAlpha = .5;
    for (let y = 26; y < H; y += 13) {
      px(ctx, 0, y, W, 1, '#0d0813');
      for (let x = ((y / 13) % 2) * 16; x < W; x += 32) px(ctx, x, y, 1, 13, '#0d0813');
    }
    ctx.globalAlpha = 1;
    // side columns
    for (let i = -1; i < 5; i++) {
      const cx = 30 + i * 112 - shift;
      px(ctx, cx, 18, 18, 226, '#1a1224');
      px(ctx, cx + 2, 18, 3, 226, '#2a1e36');
      px(ctx, cx + 13, 18, 2, 226, '#0e0915');
      px(ctx, cx - 3, 12, 24, 7, '#2a1e36');
      px(ctx, cx - 3, 19, 24, 2, '#0e0915');
      // capital carving
      px(ctx, cx + 6, 26, 6, 3, '#3a2b46');
    }
    // arches with stained glass
    for (let i = 0; i < 3; i++) {
      const ax = 78 + i * 150 - shift;
      pointedArch(ctx, ax, 44, 64, 130);
      ctx.fillStyle = '#0b0712'; ctx.fill();
      ctx.strokeStyle = '#3a2b46'; ctx.lineWidth = 2; ctx.stroke();
      // glass panes
      ctx.save();
      pointedArch(ctx, ax + 6, 52, 52, 112); ctx.clip();
      ctx.fillStyle = '#2c1a3a'; ctx.fillRect(ax + 6, 52, 52, 112);
      const paneCols = ['#5d2440', '#3b2a63', '#224a4a', '#6b3a2a'];
      for (let p = 0; p < 5; p++) {
        ctx.fillStyle = paneCols[(p + i) % paneCols.length];
        ctx.globalAlpha = .75;
        ctx.fillRect(ax + 8 + (p % 2) * 25, 60 + p * 20, 22, 17);
      }
      ctx.globalAlpha = .2;
      ctx.fillStyle = '#ffd9a0'; ctx.fillRect(ax + 6, 52, 52, 112);
      ctx.restore();
      ctx.strokeStyle = '#171020'; ctx.lineWidth = 1;
      for (let p = 1; p < 5; p++) line(ctx, ax + 6, 60 + p * 20, ax + 58, 60 + p * 20, '#171020', 1);
      line(ctx, ax + 32, 52, ax + 32, 164, '#171020', 1);
    }
    // candles along walls
    for (let i = 0; i < 6; i++) {
      const cx = 20 + i * 88 - shift * .5;
      const cy = 128 + (i % 2) * 36;
      px(ctx, cx, cy, 2, 7, '#d8cbb2');
      const fl = Math.sin(t * .2 + i) * 1;
      ellipse(ctx, cx + 1, cy - 4 + fl, 2, 3, 'rgba(255,170,90,.18)');
      ellipse(ctx, cx + 1, cy - 4 + fl, 1, 2, '#ffce8c');
    }
    // fog
    ctx.globalAlpha = .05;
    for (let i = 0; i < 3; i++) {
      const fy = 190 + i * 24;
      ctx.fillStyle = P.fog;
      ctx.beginPath();
      ctx.ellipse((W * .5 + Math.sin(t * .008 + i) * 60) - shift, fy, 200, 14, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  } else if (room.theme === 'cloister') {
    // arcade
    for (let i = 0; i < 5; i++) {
      const ax = 18 + i * 108 - shift;
      pointedArch(ctx, ax, 54, 60, 170);
      ctx.fillStyle = '#0d0814'; ctx.fill();
      ctx.strokeStyle = '#33263f'; ctx.lineWidth = 2; ctx.stroke();
      pointedArch(ctx, ax + 8, 64, 44, 150);
      ctx.fillStyle = '#151020'; ctx.fill();
      px(ctx, ax - 4, 40, 68, 6, '#2a2036');
      px(ctx, ax - 4, 46, 68, 2, '#0b0710');
      // hanging banner
      if (i % 2 === 0) {
        px(ctx, ax + 24, 46, 12, 48, '#4c1830');
        px(ctx, ax + 24, 46, 12, 2, '#7a2a48');
        ctx.fillStyle = '#4c1830';
        ctx.beginPath();
        ctx.moveTo(ax + 24, 94); ctx.lineTo(ax + 36, 94); ctx.lineTo(ax + 30, 104);
        ctx.closePath(); ctx.fill();
        px(ctx, ax + 29, 62, 2, 12, '#c9a45e');
      }
    }
    // moonlight shafts
    ctx.globalAlpha = .035;
    ctx.fillStyle = '#cfd8ff';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(40 + i * 160 - shift, 0);
      ctx.lineTo(110 + i * 160 - shift, 0);
      ctx.lineTo(190 + i * 160 - shift, 272);
      ctx.lineTo(80 + i * 160 - shift, 272);
      ctx.closePath(); ctx.fill();
    }
    ctx.globalAlpha = 1;
    // floor mist
    ctx.globalAlpha = .06;
    ctx.fillStyle = '#b7a6c9';
    ctx.beginPath(); ctx.ellipse(240 - shift, 238, 250, 20, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  } else if (room.theme === 'ossuary') {
    // brick tunnel
    ctx.globalAlpha = .5;
    for (let y = 8; y < H; y += 11) {
      px(ctx, 0, y, W, 1, '#071011');
      for (let x = ((y / 11) % 2) * 14; x < W; x += 28) px(ctx, x, y, 1, 11, '#071011');
    }
    ctx.globalAlpha = 1;
    // arched recesses with skulls
    for (let i = 0; i < 4; i++) {
      const ax = 40 + i * 118 - shift;
      pointedArch(ctx, ax, 46, 58, 100);
      ctx.fillStyle = '#0a1415'; ctx.fill();
      ctx.strokeStyle = '#2c4040'; ctx.lineWidth = 1.5; ctx.stroke();
      // stacked bones
      for (let b = 0; b < 9; b++) {
        const bx = ax + 8 + (b % 3) * 15;
        const by = 128 - Math.floor(b / 3) * 9;
        px(ctx, bx, by, 10, 2, '#6d6a5a');
        px(ctx, bx + 2, by - 1, 6, 1, '#8e8270');
      }
      // skull
      px(ctx, ax + 21, 66, 10, 9, '#b9ae97');
      px(ctx, ax + 23, 69, 2, 2, '#1a1a16');
      px(ctx, ax + 28, 69, 2, 2, '#1a1a16');
      px(ctx, ax + 25, 73, 3, 1, '#1a1a16');
    }
    // water at the bottom
    ctx.globalAlpha = .5;
    ctx.fillStyle = '#122b30';
    ctx.fillRect(0, 246, W, 26);
    for (let i = 0; i < 14; i++) {
      const wx = (i * 37 + t * .2) % W;
      px(ctx, wx, 248 + (i % 4) * 4, 8 + (i % 3) * 5, 1, 'rgba(120,190,190,.22)');
    }
    ctx.globalAlpha = 1;
    // drips
    for (let i = 0; i < 6; i++) {
      const dx = 30 + i * 76;
      const dy = (t * .6 + i * 41) % 210;
      px(ctx, dx, 20 + dy, 1, 3, 'rgba(150,210,205,.25)');
    }
    ctx.globalAlpha = .06;
    ctx.fillStyle = '#8fd8cf';
    ctx.beginPath(); ctx.ellipse(240, 120, 230, 120, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  } else if (room.theme === 'tower') {
    // huge window
    pointedArch(ctx, 166 - shift * .5, 26, 150, 200);
    ctx.fillStyle = '#090812'; ctx.fill();
    ctx.strokeStyle = '#3a3554'; ctx.lineWidth = 3; ctx.stroke();
    ctx.save();
    pointedArch(ctx, 174 - shift * .5, 34, 134, 184); ctx.clip();
    const sky = ctx.createLinearGradient(0, 30, 0, 210);
    sky.addColorStop(0, '#161a35'); sky.addColorStop(.6, '#20223f'); sky.addColorStop(1, '#2b2438');
    ctx.fillStyle = sky; ctx.fillRect(160, 30, 170, 190);
    moon(ctx, 250 - shift * .5, 78, 20);
    // clouds
    ctx.globalAlpha = .18;
    ctx.fillStyle = '#9d94b8';
    for (let i = 0; i < 4; i++) {
      const cx = ((i * 97 + t * .06) % 300) + 120 - shift * .5;
      ctx.beginPath(); ctx.ellipse(cx, 104 + i * 26, 50, 7, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
    // window tracery
    ctx.strokeStyle = '#2b2740'; ctx.lineWidth = 2;
    line(ctx, 240 - shift * .5, 34, 240 - shift * .5, 218, '#2b2740', 2);
    line(ctx, 176 - shift * .5, 150, 306 - shift * .5, 150, '#2b2740', 2);
    // beams / rafters
    for (let i = 0; i < 4; i++) {
      ctx.save();
      ctx.translate(20 + i * 130 - shift, 0);
      ctx.rotate(-.5);
      px(ctx, 0, 0, 9, 120, '#1d1829');
      px(ctx, 0, 0, 3, 120, '#2e2740');
      ctx.restore();
    }
    // bell silhouette
    ctx.fillStyle = '#171222';
    ctx.beginPath();
    ctx.moveTo(76 - shift, 96);
    ctx.quadraticCurveTo(92 - shift, 86, 104 - shift, 96);
    ctx.lineTo(108 - shift, 132);
    ctx.quadraticCurveTo(90 - shift, 144, 72 - shift, 132);
    ctx.closePath(); ctx.fill();
    px(ctx, 88 - shift, 78, 4, 10, '#171222');
    px(ctx, 70 - shift, 132, 40, 3, '#171222');
    // hanging chains
    for (let i = 0; i < 8; i++) {
      px(ctx, 116 + i * 34 - shift, 0, 1, 30 + (i % 3) * 20, 'rgba(140,130,160,.18)');
      px(ctx, 115 + i * 34 - shift, 20 + (i % 3) * 20, 3, 2, 'rgba(140,130,160,.12)');
    }
    // dust motes
    for (let i = 0; i < 18; i++) {
      const mx = (i * 71 + Math.sin(t * .02 + i) * 14) % W;
      const my = (i * 37 + t * .08) % H;
      px(ctx, mx, my, 1, 1, 'rgba(230,220,245,.14)');
    }
  } else if (room.theme === 'roof') {
    // stars
    for (let i = 0; i < 40; i++) {
      const sx = (i * 97) % W, sy = (i * 53) % 180;
      ctx.globalAlpha = .2 + (Math.sin(t * .02 + i) + 1) * .15;
      px(ctx, sx, sy, 1, 1, i % 7 ? '#cfd4e8' : '#ffd9a0');
    }
    ctx.globalAlpha = 1;
    moon(ctx, 372 - shift * .4, 58, 24);
    // clouds
    for (let i = 0; i < 5; i++) {
      const cx = ((i * 121 + t * .04) % (W + 160)) - 80 - shift * .3;
      ctx.globalAlpha = .08;
      ctx.fillStyle = '#8f8aa8';
      ctx.beginPath(); ctx.ellipse(cx, 48 + i * 22, 90, 10, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    // distant cathedral spires
    ctx.fillStyle = '#0d0b16';
    for (let i = 0; i < 7; i++) {
      const bx = i * 80 - 20 - shift * .6;
      const bh = 60 + (i * 37) % 70;
      px(ctx, bx, 230 - bh, 44, bh + 40, '#0d0b16');
      ctx.beginPath();
      ctx.moveTo(bx - 4, 230 - bh); ctx.lineTo(bx + 22, 230 - bh - 40); ctx.lineTo(bx + 48, 230 - bh);
      ctx.closePath(); ctx.fill();
      // lit window
      ctx.globalAlpha = .35 + Math.sin(t * .03 + i) * .1;
      px(ctx, bx + 18, 230 - bh + 24, 3, 5, '#e4b978');
      ctx.globalAlpha = 1;
    }
    // foreground roof edge
    px(ctx, 0, 258, W, 14, '#15121e');
    px(ctx, 0, 258, W, 2, '#2c2739');
    for (let i = 0; i < 20; i++) px(ctx, i * 25 + 4, 264, 10, 8, '#0e0b15');
    // rain
    ctx.strokeStyle = 'rgba(180,195,225,.16)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 46; i++) {
      const rx = (i * 41 + t * 1.9) % (W + 40) - 20;
      const ry = (i * 67 + t * 6.2) % (H + 40) - 20;
      ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx - 2, ry + 7); ctx.stroke();
    }
  } else if (room.theme === 'chapel') {
    // rose window
    roseWindow(ctx, 240 - shift * .4, 82, 52, t, .85);
    // side lancet windows
    for (let i = 0; i < 2; i++) {
      const ax = i === 0 ? 70 : 344;
      pointedArch(ctx, ax - shift * .5, 52, 56, 140);
      ctx.fillStyle = '#120a1a'; ctx.fill();
      ctx.strokeStyle = '#4a3455'; ctx.lineWidth = 2; ctx.stroke();
      pointedArch(ctx, ax + 7 - shift * .5, 62, 42, 124);
      ctx.fillStyle = i ? '#2e1b3e' : '#3a1a34'; ctx.fill();
      ctx.globalAlpha = .5;
      px(ctx, ax + 14 - shift * .5, 88, 6, 20, '#7a2a48');
      px(ctx, ax + 28 - shift * .5, 112, 6, 26, '#3b2a63');
      ctx.globalAlpha = 1;
    }
    // altar silhouette
    px(ctx, 196, 188, 88, 34, '#1b1020');
    px(ctx, 202, 178, 76, 10, '#241428');
    px(ctx, 238, 150, 4, 40, '#2b1830');
    px(ctx, 228, 156, 24, 3, '#2b1830');
    // pews
    for (let i = 0; i < 3; i++) {
      px(ctx, 30, 220 + i * 16, 120, 5, '#1b1222');
      px(ctx, 330, 220 + i * 16, 120, 5, '#1b1222');
    }
    // candles / glow
    for (let i = 0; i < 10; i++) {
      const cx = 24 + i * 49 - shift * .3;
      const cy = 210 + (i % 2) * 8;
      px(ctx, cx, cy, 2, 6, '#d8cbb2');
      const fl = Math.sin(t * .18 + i * 1.3) * 1.2;
      ctx.globalAlpha = .16;
      ellipse(ctx, cx + 1, cy - 4 + fl, 10, 10, '#ffb36a');
      ctx.globalAlpha = 1;
      ellipse(ctx, cx + 1, cy - 4 + fl, 1.4, 2.4, '#ffdca6');
    }
    // god rays
    ctx.globalAlpha = .03;
    ctx.fillStyle = '#ffd9a0';
    ctx.beginPath();
    ctx.moveTo(190, 40); ctx.lineTo(290, 40); ctx.lineTo(380, 272); ctx.lineTo(100, 272);
    ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 1;
    // petals
    for (let i = 0; i < 8; i++) {
      const pxx = (i * 83 + Math.sin(t * .03 + i) * 30 + t * .2) % W;
      const pyy = (i * 47 + t * .35) % H;
      px(ctx, pxx, pyy, 2, 1, 'rgba(220,120,150,.35)');
    }
  }
}
