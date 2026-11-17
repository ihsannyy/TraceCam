import { ctx, overlay } from "./dom.js";
import { state } from "./state.js";

export function resizeOverlay() {
  const dpr = Math.min(globalThis.devicePixelRatio || 1, 2);
  overlay.width = globalThis.innerWidth * dpr;
  overlay.height = globalThis.innerHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function drawGrid(w, h) {
  ctx.save();
  ctx.strokeStyle = "rgba(201, 168, 106, 0.32)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 0; x <= w; x += 50) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
  }
  for (let y = 0; y <= h; y += 50) {
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
  }
  ctx.stroke();

  ctx.strokeStyle = "rgba(232, 209, 166, 0.7)";
  ctx.beginPath();
  ctx.moveTo(w / 2 - 20, h / 2);
  ctx.lineTo(w / 2 + 20, h / 2);
  ctx.moveTo(w / 2, h / 2 - 20);
  ctx.lineTo(w / 2, h / 2 + 20);
  ctx.stroke();
  ctx.restore();
}

function frame() {
  const w = globalThis.innerWidth;
  const h = globalThis.innerHeight;

  ctx.clearRect(0, 0, w, h);

  if (state.showGrid) drawGrid(w, h);

  const img = state.useSketch ? state.imgSketch : state.imgOriginal;
  if (img) {
    ctx.save();
    ctx.globalAlpha = state.opacity;
    ctx.translate(state.x, state.y);
    ctx.rotate(state.rotation);
    ctx.scale(state.mirror ? -state.scale : state.scale, state.scale);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    ctx.restore();
  }

  requestAnimationFrame(frame);
}

export function startRenderLoop() {
  globalThis.addEventListener("resize", resizeOverlay);
  resizeOverlay();
  requestAnimationFrame(frame);
}
