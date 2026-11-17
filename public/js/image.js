import { edgeDetect } from "./sketch.js";
import { syncSliders } from "./sliders.js";
import { state } from "./state.js";

const MAX_DIMENSION = 1800;

export async function loadImage(file) {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.src = url;
  await img.decode();

  let w = img.naturalWidth;
  let h = img.naturalHeight;
  if (Math.max(w, h) > MAX_DIMENSION) {
    const k = MAX_DIMENSION / Math.max(w, h);
    w = Math.round(w * k);
    h = Math.round(h * k);
  }

  const orig = document.createElement("canvas");
  orig.width = w;
  orig.height = h;
  const origCtx = orig.getContext("2d");
  origCtx.fillStyle = "#fff";
  origCtx.fillRect(0, 0, w, h);
  origCtx.drawImage(img, 0, 0, w, h);
  state.imgOriginal = orig;

  state.imgSketch = edgeDetect(orig);

  URL.revokeObjectURL(url);

  const screenMin = Math.min(globalThis.innerWidth, globalThis.innerHeight);
  state.scale = (screenMin * 0.9) / Math.max(w, h);
  state.x = globalThis.innerWidth / 2;
  state.y = globalThis.innerHeight / 2;
  state.rotation = 0;
  syncSliders();
}
