import { ROOMS, ROOM_ORDER, START_ROOM, TILE, COLS, ROWS, VIEW_W, VIEW_H, tileAt, isSolid, isPlatform, isSpike } from './world.js';
import { drawGirl, drawEnemy, drawItem, drawShrine, drawBoss, px } from './art.js';
import { buildTileLayer, drawBackground } from './artbg.js';
import { Sound } from './audio.js';

const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
const $ = (selector) => document.querySelector(selector);
const sound = new Sound();
const keys = new Set();
const input = { left: false, right: false, jump: false, attack: false, dash: false };
const roomLayers = new Map(ROOM_ORDER.map(room => [room.id, buildTileLayer(room)]));
const SAVE_KEY = 'vespers-lament-save-v1';

const freshState = () => ({
  room: START_ROOM, checkpoint: START_ROOM, hp: 5, maxHp: 5, shards: 0,
  abilities: { doublejump: false, dash: false }, discovered: [START_ROOM],
  collected: [], cleared: [], bossDefeated: false, deaths: 0, kills: 0,
  shrineUsed: [],
});
let meta = freshState();
let room = ROOMS[meta.room];
let player = { x: 42, y: 240, vx: 0, vy: 0, facing: 1, grounded: false, jumps: 0, attackT: 0, attackHit: false, dashT: 0, dashCooldown: 0, hurtT: 0, invuln: 0, state: 'idle' };
let enemies = [];
let boss = null;
let projectiles = [];
let frame = 0;
let mode = 'title';
let toast = '';
let toastT = 0;
let checkpointPos = null;
let lastTime = 0;
let interactHint = '';

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
  if (id) $(id)?.classList.add('active');
  document.body.classList.toggle('playing', mode === 'playing');
}
function setToast(text, time = 150) { toast = text; toastT = time; }
function save() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(meta)); } catch (_) { /* storage may be unavailable */ }
}
function loadSave() {
  try {
    const data = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
    if (data && data.abilities && Array.isArray(data.discovered)) {
      meta = { ...freshState(), ...data, abilities: { ...freshState().abilities, ...data.abilities } };
      if (!ROOMS[meta.room]) meta.room = START_ROOM;
      if (!ROOMS[meta.checkpoint]) meta.checkpoint = START_ROOM;
      return true;
    }
  } catch (_) { /* start a new run */ }
  return false;
}
function resetRun() {
  meta = freshState();
  checkpointPos = null;
  save();
}
function activateRoom(id, entry = 'left', initial = false) {
  room = ROOMS[id];
  meta.room = id;
  if (!meta.discovered.includes(id)) meta.discovered.push(id);
  const spawn = room.spawns?.[entry] || room.spawns?.left || { x: 42, y: 240 };
  player.x = spawn.x;
  player.y = spawn.y;
  player.vx = 0;
  player.vy = 0;
  player.jumps = 0;
  player.dashT = 0;
  player.attackT = 0;
  player.invuln = initial ? 50 : 22;
  enemies = (room.enemies || []).map((e, i) => ({
    ...e, x: (e.x + .5) * TILE, y: e.y >= 14 ? 240 : e.y * TILE + 8,
    homeX: (e.x + .5) * TILE, homeY: e.y >= 14 ? 240 : e.y * TILE + 8,
    vx: 0, vy: 0, hp: e.type === 'knight' || e.type === 'gargoyle' ? 3 : 2,
    hitT: 0, hurtCooldown: 0, seed: i * 19 + id.charCodeAt(0), facing: i % 2 ? -1 : 1,
  }));
  if (meta.cleared.includes(id)) enemies = [];
  boss = room.boss && !meta.bossDefeated ? { x: 354, y: 240, hp: 12, maxHp: 12, hitT: 0, attackT: 95, hurtCooldown: 0, active: false, intro: 0 } : null;
  projectiles = [];
  sound.setMood(id);
  if (!initial) sound.play('gate');
  save();
}
function startGame(continuing = false) {
  sound.init();
  sound.startMusic(meta.room);
  mode = 'playing';
  if (continuing) {
    activateRoom(meta.room, 'left', true);
    player.x = 42; player.y = 240;
  } else {
    resetRun();
    activateRoom(START_ROOM, 'left', true);
  }
  showScreen(null);
  if (!continuing) setToast('Find the Pale Rose', 190);
}
function tileIsSolid(tx, ty) { return isSolid(tileAt(room, tx, ty)); }
function rectHitsSolid(x, y, w, h) {
  const left = Math.floor(x / TILE), right = Math.floor((x + w - 1) / TILE);
  const top = Math.floor(y / TILE), bottom = Math.floor((y + h - 1) / TILE);
  for (let ty = top; ty <= bottom; ty++) for (let tx = left; tx <= right; tx++) if (tileIsSolid(tx, ty)) return true;
  return false;
}
function collidesSpike() {
  const left = Math.floor((player.x - 6) / TILE), right = Math.floor((player.x + 5) / TILE);
  const top = Math.floor((player.y - 22) / TILE), bottom = Math.floor((player.y - 3) / TILE);
  for (let ty = top; ty <= bottom; ty++) for (let tx = left; tx <= right; tx++) if (isSpike(tileAt(room, tx, ty))) return true;
  return false;
}
function overlaps(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}
