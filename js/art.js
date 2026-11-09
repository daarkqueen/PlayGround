// Procedural pixel art for Vesper's Lament
export const TILE = 16;

export const P = {
  ink: '#07050b',
  void: '#0b0711',
  deep: '#140c1e',
  stone: '#241a30',
  stone2: '#33243f',
  stone3: '#453050',
  moss: '#2f4a3c',
  moss2: '#4d6b52',
  bone: '#c9bda6',
  bone2: '#8e8270',
  pale: '#efe2e0',
  skin: '#ecd6d5',
  skin2: '#c9a4ab',
  hair: '#141019',
  hair2: '#2b2236',
  dress: '#1b0f22',
  dress2: '#3a2046',
  lace: '#cbbcd4',
  crimson: '#a92b4d',
  crimson2: '#e05177',
  gold: '#e4b978',
  gold2: '#9c7440',
  ghost: '#9ec6c0',
  water: '#1d3a42',
  water2: '#2f5b63',
  steel: '#c6c8dd',
  steel2: '#747895',
  fog: '#b7a6c9'
};

export function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const x = c.getContext('2d');
  x.imageSmoothingEnabled = false;
  return { canvas: c, ctx: x };
}

export function px(ctx, x, y, w, h, c) {
  ctx.fillStyle = c;
  ctx.fillRect(Math.round(x), Math.round(y), w, h);
}

export function ellipse(ctx, cx, cy, rx, ry, c) {
  ctx.fillStyle = c;
  const r = Math.max(1, Math.round(ry));
  for (let y = -r; y <= r; y++) {
    const t = 1 - (y * y) / (r * r);
    if (t < 0) continue;
    const w = Math.round(rx * Math.sqrt(t));
    ctx.fillRect(Math.round(cx - w), Math.round(cy + y), Math.max(1, w * 2), 1);
  }
}

export function line(ctx, x0, y0, x1, y1, c, w = 1) {
  ctx.strokeStyle = c;
  ctx.lineWidth = w;
  ctx.beginPath();
  ctx.moveTo(Math.round(x0) + .5, Math.round(y0) + .5);
  ctx.lineTo(Math.round(x1) + .5, Math.round(y1) + .5);
  ctx.stroke();
}

// ---------------------------------------------------------------------------
// Vesper — 18x27 procedural pixel heroine
// state: idle | run | jump | fall | dash | hurt | dead | attack
// ---------------------------------------------------------------------------
export function drawGirl(ctx, x, y, state, t, facing = 1, opts = {}) {
  const flick = opts.flicker || 0;
  const attack = state === 'attack' ? Math.min(1, (opts.attackT || 0)) : -1;
  const run = state === 'run' ? Math.sin(t * 0.42) : 0;
  const run2 = state === 'run' ? Math.cos(t * 0.42) : 0;
  const bob = state === 'idle' ? (Math.sin(t * 0.07) > 0.72 ? -1 : 0) : 0;
  const air = state === 'jump' || state === 'fall';
  const dash = state === 'dash';
  const dead = state === 'dead';
  const hurt = state === 'hurt';

  ctx.save();
  ctx.translate(Math.round(x), Math.round(y));
  if (facing < 0) ctx.scale(-1, 1);
  if (dead) {
    ctx.rotate(-1.35);
    ctx.translate(-6, -2);
  }

  const sway = Math.sin(t * 0.06) * 1.2;
  const skin = flick ? '#ffffff' : P.skin;
  const skin2 = flick ? '#ffd8e0' : P.skin2;
  const hair = flick ? '#ff9ab4' : P.hair;
  const hair2 = flick ? '#ffd0dd' : P.hair2;
  const dress = flick ? '#ffb2c4' : P.dress;
  const dress2 = flick ? '#ffe0e8' : P.dress2;
  const lace = flick ? '#ffffff' : P.lace;
  const crimson = flick ? '#ffffff' : P.crimson;

  // ---- trailing hair / cape (behind body) ----
  const trail = state === 'run' ? -3 : dash ? -6 : air ? -2 : 0;
  const lift = state === 'fall' ? 3 : state === 'jump' ? -1 : 0;
  ellipse(ctx, -4 + trail + sway * .4, -19 + lift, 5, 7, hair);
  ellipse(ctx, -7 + trail + sway * .5, -13 + lift, 4, 8, hair);
  // cape
  ellipse(ctx, -3 + trail * .7, -11 + lift, 5, 8, dress2);
  ellipse(ctx, -6 + trail * .8 + sway * .3, -6 + lift, 3.5, 6, P.dress);
  // ragged cape hem
  for (let i = 0; i < 4; i++) {
    px(ctx, -9 + trail * .7 + i * 3 + Math.sin(t * .08 + i) * 1.2, -2 + lift - (i % 2) * 2, 2, 4, dress);
  }

  // ---- legs ----
  let lfx = -1, lfy = -3, rfx = 2, rfy = -3;
  if (state === 'run') {
    lfx = -2 + run * 3; lfy = -3 - Math.max(0, run2) * 2;
    rfx = 1 - run * 3; rfy = -3 - Math.max(0, -run2) * 2;
  } else if (state === 'jump') {
    lfx = -1; lfy = -5; rfx = 3; rfy = -2;
  } else if (state === 'fall') {
    lfx = -2; lfy = -2; rfx = 3; rfy = -4;
  } else if (dash) {
    lfx = -4; lfy = -4; rfx = 2; rfy = -4;
  } else if (state === 'attack') {
    lfx = -2; lfy = -3; rfx = 3; rfy = -3;
  }
  // thighs / stockings
  px(ctx, 0 + lfx, -9 + lfy, 3, 5, P.ink);
  px(ctx, 0 + rfx, -9 + rfy, 3, 5, P.ink);
  // boots
  px(ctx, -1 + lfx, -5 + lfy, 5, 3, P.ink);
  px(ctx, -1 + rfx, -5 + rfy, 5, 3, P.ink);
  px(ctx, -1 + lfx, -5 + lfy, 4, 1, P.hair2);
  px(ctx, -1 + rfx, -5 + rfy, 4, 1, P.hair2);
  // boot heels
  px(ctx, 3 + lfx, -2 + lfy, 2, 1, P.ink);
  px(ctx, 3 + rfx, -2 + rfy, 2, 1, P.ink);

  // ---- skirt ----
  const skirtSway = state === 'run' ? run * 1.5 : Math.sin(t * .07) * .7;
  for (let i = 0; i < 8; i++) {
    const w = 3 + Math.round(i * .9);
    const off = Math.round(skirtSway * (i / 7));
    px(ctx, -w + 2 + off, -11 + i, w * 2 - 2, 1, i > 5 ? dress : dress2);
  }
  // ragged hem
  for (let i = 0; i < 5; i++) {
    px(ctx, -4 + i * 2 + Math.round(skirtSway), -3 + (i % 2), 1, 3, dress);
  }
  // lace trim
  for (let i = 0; i < 5; i++) px(ctx, -4 + i * 2, -10 + Math.round(Math.abs(i - 2) * .3), 1, 1, lace);
  // corset ribbon
  px(ctx, 0, -14, 3, 1, crimson);
  px(ctx, 1, -13, 1, 2, crimson);
  px(ctx, -1, -15, 1, 1, lace);

  // ---- torso ----
  px(ctx, -3, -19, 7, 8, dress2);
  px(ctx, -4, -17, 1, 5, dress);
  px(ctx, 4, -17, 1, 5, dress);
  // bodice trim
  px(ctx, -3, -18, 7, 1, P.dress);
  px(ctx, -2, -12, 5, 1, lace);
  // shoulder ruffles
  px(ctx, -5, -19, 2, 2, lace);
  px(ctx, 4, -19, 2, 2, lace);
  px(ctx, -5, -18, 1, 1, P.dress2);
  px(ctx, 5, -18, 1, 1, P.dress2);

  // ---- arms ----
  const armSwing = state === 'run' ? run * 2 : 0;
  if (state === 'attack') {
    // sword arm extended
    px(ctx, 3, -18, 6, 2, skin);
    px(ctx, 8, -18, 2, 2, skin2);
    // rear arm
    px(ctx, -5, -17 - armSwing * .3, 2, 6, skin2);
  } else if (dash) {
    px(ctx, -5, -18, 5, 2, skin2);
    px(ctx, 3, -17, 4, 2, skin);
  } else {
    px(ctx, -5, -18 + armSwing, 2, 7, skin2);
    px(ctx, 4, -18 - armSwing, 2, 7, skin);
    // hands
    px(ctx, -5, -11 + armSwing, 2, 2, skin2);
    px(ctx, 4, -11 - armSwing, 2, 2, skin);
  }

  // ---- head ----
  const hb = bob;
  // neck
  px(ctx, 0, -21 + hb, 2, 2, skin2);
  // face
  px(ctx, -3, -26 + hb, 7, 6, skin);
  px(ctx, -2, -27 + hb, 5, 1, skin);
  px(ctx, 4, -25 + hb, 1, 3, skin2);
  px(ctx, -4, -25 + hb, 1, 3, skin2);
  // jaw
  px(ctx, -2, -20 + hb, 4, 1, skin2);
  // eyes (glowing crimson)
  px(ctx, 1, -24 + hb, 2, 1, '#ff5b78');
  px(ctx, 1, -23 + hb, 1, 1, '#ff8fa5');
  px(ctx, -2, -24 + hb, 1, 1, '#b63a58');
  // blush
  px(ctx, 2, -22 + hb, 1, 1, '#d98b9c');
  // mouth
  px(ctx, 0, -21 + hb, 1, 1, '#8f3a50');

  // ---- hair ----
  // crown
  px(ctx, -5, -28 + hb, 9, 3, hair);
  px(ctx, -4, -29 + hb, 6, 1, hair);
  px(ctx, -6, -26 + hb, 2, 4, hair);
  px(ctx, 4, -26 + hb, 2, 4, hair);
  // bangs
  px(ctx, -4, -26 + hb, 3, 3, hair);
  px(ctx, 1, -26 + hb, 4, 2, hair);
  px(ctx, 2, -27 + hb, 3, 1, hair2);
  px(ctx, -5, -27 + hb, 4, 1, hair2);
  px(ctx, -4, -25 + hb, 1, 1, hair2);
  // side locks
  px(ctx, -6, -25 + hb, 2, 9, hair);
  px(ctx, 5, -25 + hb, 2, 7, hair);
  px(ctx, -7, -22 + hb, 1, 5, hair2);
  px(ctx, 6, -21 + hb, 1, 4, hair2);
  // ribbon
  px(ctx, 4, -29 + hb, 3, 2, crimson);
  px(ctx, 5, -30 + hb, 1, 1, P.crimson2);
  px(ctx, 3, -28 + hb, 1, 1, P.crimson2);
  // hair sheen
  px(ctx, -3, -27 + hb, 3, 1, hair2);

  // ---- hurt flash / eyes ----
  if (hurt) {
    ctx.globalCompositeOperation = 'source-atop';
    px(ctx, -10, -32, 22, 34, 'rgba(255,120,150,.45)');
    ctx.globalCompositeOperation = 'source-over';
  }

  ctx.restore();

  // ---- sword + slash trail (not mirrored so arc reads correctly) ----
  if (state === 'attack') {
    drawSlash(ctx, x, y, facing, attack, opts.slashId || 0);
  }
}

function drawSlash(ctx, x, y, facing, p, seed) {
  ctx.save();
  ctx.translate(Math.round(x), Math.round(y) - 14);
  ctx.scale(facing, 1);
  const a0 = -1.9 + p * 2.9;
  const r = 17 + Math.sin(p * Math.PI) * 6;
  ctx.globalAlpha = 0.28 + Math.sin(p * Math.PI) * 0.5;
  ctx.strokeStyle = '#ffd9e4';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(2, 1, r, a0 - 0.9, a0 + 0.55);
  ctx.stroke();
  ctx.globalAlpha = 0.9;
  ctx.strokeStyle = '#ff8fb0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(2, 1, r - 2, a0 - 0.7, a0 + 0.35);
  ctx.stroke();
  // blade
  const hx = 7, hy = -3;
  const bx = hx + Math.cos(a0) * 13, by = hy + Math.sin(a0) * 13;
  ctx.strokeStyle = P.steel;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(hx, hy);
  ctx.lineTo(bx, by);
  ctx.stroke();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = .6;
  ctx.beginPath();
  ctx.moveTo(hx + 2, hy - .5);
  ctx.lineTo(bx, by);
  ctx.stroke();
  // guard
  ctx.fillStyle = P.gold;
  ctx.fillRect(hx - 1, hy - 1, 3, 2);
  // sparkles
  for (let i = 0; i < 3; i++) {
    const aa = a0 + (i - 1) * .5;
    ctx.fillStyle = i === 1 ? '#fff' : '#ff9dba';
    ctx.fillRect(2 + Math.cos(aa) * (r + 2), 1 + Math.sin(aa) * (r + 2), 1, 1);
  }
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Enemies
// ---------------------------------------------------------------------------
export function drawEnemy(ctx, e, t) {
  const x = Math.round(e.x), y = Math.round(e.y);
  const hit = e.hitT > 0;
  const c = hit ? '#ffffff' : null;
  const f = e.facing || 1;
  ctx.save();
  if (f < 0) { ctx.translate(x, y); ctx.scale(-1, 1); ctx.translate(-x, -y); }

  if (e.type === 'bat') {
    const flap = Math.sin(t * .3 + e.seed) * 4;
    const col = c || '#2a2030';
    const wing = c || '#3b2b44';
    ellipse(ctx, x, y - 5, 3, 3, col);
    px(ctx, x - 1, y - 7, 1, 1, c || '#ff5b78');
    px(ctx, x + 1, y - 7, 1, 1, c || '#ff5b78');
    // wings
    ctx.fillStyle = wing;
    ctx.beginPath();
    ctx.moveTo(x - 2, y - 6);
    ctx.lineTo(x - 10, y - 9 - flap);
    ctx.lineTo(x - 7, y - 3);
    ctx.lineTo(x - 11, y - 1 + flap);
    ctx.lineTo(x - 3, y - 2);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + 2, y - 6);
    ctx.lineTo(x + 10, y - 9 + flap);
    ctx.lineTo(x + 7, y - 3);
    ctx.lineTo(x + 11, y - 1 - flap);
    ctx.lineTo(x + 3, y - 2);
    ctx.closePath(); ctx.fill();
    // ears
    px(ctx, x - 3, y - 8, 1, 2, col);
    px(ctx, x + 2, y - 8, 1, 2, col);
    // fangs
    px(ctx, x, y - 2, 1, 1, '#fff');
  } else if (e.type === 'crawler') {
    const step = Math.sin(t * .3 + e.seed) * 1.5;
    const col = c || P.bone2;
    const dark = c || '#5a4d43';
    // legs
    for (let i = 0; i < 3; i++) {
      const lx = x - 5 + i * 4;
      px(ctx, lx, y - 4 + (i % 2), 1, 5, dark);
      px(ctx, lx - 2 + (i % 2), y - 1, 3, 1, dark);
    }
    // body / skull
    ellipse(ctx, x, y - 6, 6, 4, col);
    px(ctx, x - 3, y - 8, 6, 1, col);
    // eyes
    px(ctx, x - 3, y - 7, 2, 2, c || '#ff5b78');
    px(ctx, x + 1, y - 7, 2, 2, c || '#ff5b78');
    // jaw
    px(ctx, x - 2, y - 3 + Math.round(step * .3), 5, 1, dark);
    px(ctx, x - 1, y - 2, 1, 1, dark);
    px(ctx, x + 1, y - 2, 1, 1, dark);
  } else if (e.type === 'wraith') {
    const fl = Math.sin(t * .06 + e.seed) * 2;
    const col = c || '#7fa39e';
    // tattered shroud
    for (let i = 0; i < 6; i++) {
      const w = 3 + i;
      px(ctx, x - w + 1, y - 14 + i * 2 + Math.round(fl), w * 2 - 1, 2, i < 2 ? (c || '#b7d4cd') : col);
    }
    // rags
    for (let i = 0; i < 4; i++) px(ctx, x - 4 + i * 3, y - 1 + Math.round(fl) + (i % 2) * 2, 2, 4, col);
    // hood / face void
    ellipse(ctx, x, y - 15, 4, 5, c || '#d7e8e2');
    ellipse(ctx, x, y - 14, 3, 4, c || '#101820');
    px(ctx, x - 2, y - 15, 1, 2, c || '#9dffe9');
    px(ctx, x + 1, y - 15, 1, 2, c || '#9dffe9');
    // arms
    px(ctx, x - 6, y - 11 + Math.round(fl), 2, 6, col);
    px(ctx, x + 4, y - 11 + Math.round(fl), 2, 6, col);
  } else if (e.type === 'knight') {
    const step = e.vx ? Math.sin(t * .2 + e.seed) : 0;
    const col = c || '#4a4658';
    const light = c || '#6f6a82';
    // legs
    px(ctx, x - 4, y - 7 + step, 3, 7, col);
    px(ctx, x + 2, y - 7 - step, 3, 7, col);
    // body
    px(ctx, x - 5, y - 18, 11, 11, col);
    px(ctx, x - 5, y - 18, 11, 2, light);
    px(ctx, x - 5, y - 10, 11, 2, c || '#2c2937');
    // pauldrons
    px(ctx, x - 8, y - 18, 3, 4, light);
    px(ctx, x + 6, y - 18, 3, 4, light);
    // helmet
    px(ctx, x - 4, y - 25, 9, 7, light);
    px(ctx, x - 3, y - 24, 7, 4, c || '#2c2937');
    px(ctx, x - 2, y - 23, 2, 1, c || '#ff5b78');
    px(ctx, x + 1, y - 23, 2, 1, c || '#ff5b78');
    px(ctx, x - 1, y - 28, 2, 3, c || P.crimson);
    // sword
    ctx.strokeStyle = c || P.steel;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 8, y - 15);
    ctx.lineTo(x + 11, y - 24 + step);
    ctx.stroke();
    // shield
    px(ctx, x - 10, y - 17, 2, 7, c || '#5a5266');
  } else if (e.type === 'gargoyle') {
    const flap = Math.sin(t * .22 + e.seed) * 5;
    const col = c || '#3b3444';
    const wing = c || '#4d4258';
    ellipse(ctx, x, y - 10, 5, 7, col);
    // wings
    ctx.fillStyle = wing;
    ctx.beginPath();
    ctx.moveTo(x - 3, y - 14);
    ctx.lineTo(x - 14, y - 17 - flap);
    ctx.lineTo(x - 10, y - 8);
    ctx.lineTo(x - 15, y - 5 + flap);
    ctx.lineTo(x - 3, y - 7);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + 3, y - 14);
    ctx.lineTo(x + 14, y - 17 + flap);
    ctx.lineTo(x + 10, y - 8);
    ctx.lineTo(x + 15, y - 5 - flap);
    ctx.lineTo(x + 3, y - 7);
    ctx.closePath(); ctx.fill();
    // horns
    px(ctx, x - 4, y - 20, 2, 4, col);
    px(ctx, x + 2, y - 20, 2, 4, col);
    px(ctx, x - 5, y - 21, 1, 2, col);
    px(ctx, x + 4, y - 21, 1, 2, col);
    // eyes
    px(ctx, x - 3, y - 13, 2, 2, c || '#ffd06a');
    px(ctx, x + 1, y - 13, 2, 2, c || '#ffd06a');
    // claws
    px(ctx, x - 3, y - 3, 1, 3, col);
    px(ctx, x + 2, y - 3, 1, 3, col);
  } else if (e.type === 'orb') {
    const r = 4 + Math.sin(t * .2) * 1;
    ctx.globalAlpha = .35;
    ellipse(ctx, x, y, r + 4, r + 4, c || '#ff5b78');
    ctx.globalAlpha = 1;
    ellipse(ctx, x, y, r, r, c || '#ffd0dd');
    ellipse(ctx, x - 1, y - 1, 1.5, 1.5, '#fff');
  }
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Items & shrine
// ---------------------------------------------------------------------------
export function drawItem(ctx, it, t) {
  const x = Math.round(it.x), y = Math.round(it.y);
  const bob = Math.sin(t * .08 + (it.seed || 0)) * 2;
  const pulse = .55 + Math.sin(t * .11 + (it.seed || 0)) * .2;
  ctx.save();
  ctx.globalAlpha = pulse;
  const col = it.type === 'dash' ? '#a88bff' : it.type === 'heart' ? '#ff7d9d' : '#8fd8ff';
  ellipse(ctx, x, y - 10 + bob, 14, 14, col);
  ctx.globalAlpha = 1;
  ctx.globalAlpha = .28;
  ellipse(ctx, x, y - 10 + bob, 9, 9, '#fff');
  ctx.globalAlpha = 1;

  if (it.type === 'doublejump') {
    // batwing reliquary
    px(ctx, x - 6, y - 16 + bob, 12, 2, '#e8e2ee');
    px(ctx, x - 8, y - 14 + bob, 3, 5, '#d8d0e2');
    px(ctx, x + 5, y - 14 + bob, 3, 5, '#d8d0e2');
    px(ctx, x - 5, y - 14 + bob, 10, 8, '#efe7f4');
    px(ctx, x - 3, y - 12 + bob, 6, 4, '#8fd8ff');
    px(ctx, x - 1, y - 11 + bob, 2, 2, '#fff');
    px(ctx, x - 9, y - 13 + bob, 1, 3, '#9c8fae');
    px(ctx, x + 8, y - 13 + bob, 1, 3, '#9c8fae');
  } else if (it.type === 'dash') {
    // veilstep talisman
    ctx.fillStyle = '#efe7f4';
    ctx.beginPath();
    ctx.moveTo(x, y - 18 + bob);
    ctx.lineTo(x + 7, y - 9 + bob);
    ctx.lineTo(x, y - 2 + bob);
    ctx.lineTo(x - 7, y - 9 + bob);
    ctx.closePath(); ctx.fill();
    px(ctx, x - 2, y - 13 + bob, 4, 6, '#a88bff');
    px(ctx, x - 1, y - 12 + bob, 2, 2, '#fff');
    px(ctx, x - 1, y - 5 + bob, 2, 2, '#c9b5ff');
  } else {
    // heart reliquary
    px(ctx, x - 5, y - 15 + bob, 4, 4, '#ff9ab4');
    px(ctx, x + 1, y - 15 + bob, 4, 4, '#ff9ab4');
    px(ctx, x - 5, y - 12 + bob, 10, 4, '#ff7d9d');
    px(ctx, x - 4, y - 9 + bob, 8, 3, '#e05177');
    px(ctx, x - 2, y - 6 + bob, 4, 2, '#a92b4d');
    px(ctx, x - 3, y - 14 + bob, 2, 2, '#ffe0e8');
    px(ctx, x + 2, y - 14 + bob, 1, 1, '#ffe0e8');
  }
  ctx.restore();
}

export function drawShrine(ctx, s, t, active) {
  const x = Math.round(s.x), y = Math.round(s.y);
  // altar
  px(ctx, x - 11, y - 8, 22, 8, P.stone2);
  px(ctx, x - 11, y - 8, 22, 1, P.stone3);
  px(ctx, x - 9, y - 6, 18, 4, P.stone);
  px(ctx, x - 13, y - 1, 26, 1, '#120b18');
  px(ctx, x - 12, y - 2, 24, 1, P.stone2);
  // statue
  px(ctx, x - 3, y - 18, 6, 10, '#3a2a46');
  px(ctx, x - 2, y - 22, 5, 5, '#4c3759');
  px(ctx, x - 4, y - 20, 2, 7, '#3a2a46');
  px(ctx, x + 3, y - 20, 2, 7, '#3a2a46');
  // halo
  ctx.strokeStyle = active ? '#ffcf8a' : '#6d5a78';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(x + .5, y - 24, 6, 0, Math.PI * 2); ctx.stroke();
  // candle
  px(ctx, x - 7, y - 11, 2, 3, '#e8dcc2');
  px(ctx, x + 5, y - 11, 2, 3, '#e8dcc2');
  const f = Math.sin(t * .25) * 1;
  if (active) {
    ellipse(ctx, x - 6, y - 14 + f * .3, 2, 3, 'rgba(255,170,90,.35)');
    ellipse(ctx, x - 6, y - 14 + f * .3, 1, 2, '#ffd9a0');
    ellipse(ctx, x + 6, y - 14 - f * .3, 2, 3, 'rgba(255,170,90,.35)');
    ellipse(ctx, x + 6, y - 14 - f * .3, 1, 2, '#ffd9a0');
  } else {
    px(ctx, x - 6, y - 13, 1, 2, '#5b4c61');
    px(ctx, x + 6, y - 13, 1, 2, '#5b4c61');
  }
  // glow
  if (active) {
    ctx.globalAlpha = .12 + Math.sin(t * .08) * .04;
    ellipse(ctx, x, y - 10, 26, 20, '#ffb36a');
    ctx.globalAlpha = 1;
  }
}

// ---------------------------------------------------------------------------
// Boss — The Pale Abbess
// ---------------------------------------------------------------------------
export function drawBoss(ctx, b, t) {
  const x = Math.round(b.x), y = Math.round(b.y);
  const hit = b.hitT > 0;
  const c = hit ? '#ffffff' : null;
  const phase2 = b.hp < b.maxHp * .5;
  const bob = Math.sin(t * .045) * 4;
  ctx.save();
  // halo
  const halo = phase2 ? '#ff7d9d' : '#e4b978';
  ctx.globalAlpha = .22 + Math.sin(t * .06) * .06;
  ellipse(ctx, x, y - 54 + bob, 30, 30, halo);
  ctx.globalAlpha = 1;
  ctx.strokeStyle = halo;
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(x + .5, y - 54 + bob, 21, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,230,180,.35)';
  ctx.beginPath(); ctx.arc(x + .5, y - 54 + bob, 24, 0, Math.PI * 2); ctx.stroke();
  // radiance spikes
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * Math.PI * 2 + t * .005;
    px(ctx, x + Math.cos(a) * 25, y - 54 + bob + Math.sin(a) * 25, 1, 1, halo);
  }
  // trailing veil
  for (let i = 0; i < 8; i++) {
    const w = 8 + i * 2;
    const off = Math.sin(t * .04 + i * .6) * 3;
    px(ctx, x - w + off, y - 32 + i * 4 + bob * .5, w * 2, 4, i > 5 ? '#2a1838' : (c || '#4a2a56'));
  }
  // robe
  for (let i = 0; i < 12; i++) {
    const w = 6 + i * 1.6;
    px(ctx, x - w, y - 36 + i * 3, w * 2, 3, i % 3 === 0 ? (c || '#3a2148') : (c || '#2c1737'));
  }
  // robe trim
  for (let i = 0; i < 8; i++) px(ctx, x - 16 + i * 4, y - 6 + (i % 2), 2, 5, c || '#5c3766');
  // arms
  const arm = Math.sin(t * .03) * 4;
  px(ctx, x - 20, y - 34 + arm, 5, 24, c || '#d8c8d8');
  px(ctx, x + 15, y - 34 - arm, 5, 24, c || '#d8c8d8');
  px(ctx, x - 22, y - 12 + arm, 7, 4, c || '#f0e4e8');
  px(ctx, x + 15, y - 12 - arm, 7, 4, c || '#f0e4e8');
  // stole
  px(ctx, x - 4, y - 44, 8, 24, c || '#d9cbe0');
  px(ctx, x - 2, y - 42, 4, 20, c || '#8c2b4d');
  // head / veil
  ellipse(ctx, x, y - 46 + bob, 7, 8, c || '#f2e8ea');
  px(ctx, x - 8, y - 52 + bob, 16, 10, c || '#1a1024');
  px(ctx, x - 7, y - 50 + bob, 14, 7, c || '#efe2e6');
  // face
  px(ctx, x - 4, y - 49 + bob, 8, 6, c || '#f2e2e2');
  // eyes
  px(ctx, x - 3, y - 47 + bob, 2, 1, phase2 ? '#ff3d68' : '#b33b5c');
  px(ctx, x + 2, y - 47 + bob, 2, 1, phase2 ? '#ff3d68' : '#b33b5c');
  px(ctx, x - 3, y - 46 + bob, 1, 1, '#ff9ab4');
  px(ctx, x + 3, y - 46 + bob, 1, 1, '#ff9ab4');
  // mouth
  px(ctx, x - 1, y - 43 + bob, 2, 1, '#7c2942');
  // veil crown
  px(ctx, x - 9, y - 55 + bob, 18, 2, c || '#d9cbe0');
  px(ctx, x - 6, y - 58 + bob, 12, 3, c || '#f0e4e8');
  for (let i = 0; i < 5; i++) px(ctx, x - 8 + i * 4, y - 60 + bob, 2, 2, c || '#e4b978');
  // rosary
  for (let i = 0; i < 6; i++) {
    const a = i / 6 * Math.PI * 2;
    px(ctx, x + Math.cos(a) * 8, y - 26 + Math.sin(a) * 5, 1, 1, c || '#ffcf8a');
  }
  // blood motes in phase 2
  if (phase2) {
    for (let i = 0; i < 6; i++) {
      const a = t * .02 + i * 1.1;
      px(ctx, x + Math.cos(a) * (24 + i), y - 30 + Math.sin(a * 1.3) * 20, 1, 1, '#ff5b78');
    }
  }
  ctx.restore();
}
