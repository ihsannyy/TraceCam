import { $, controls, fileInput, touchLayer } from "./dom.js";
import { loadImage } from "./image.js";
import { syncSliders } from "./sliders.js";
import { saveSnapshot } from "./snapshot.js";
import { state } from "./state.js";

function setPressed(button, active) {
  button.classList.toggle("active", active);
  button.setAttribute("aria-pressed", String(active));
}

export function initControls() {
  $("btnPick").onclick = () => fileInput.click();

  fileInput.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    await loadImage(file);
    e.target.value = "";
  };

  $("btnSketch").onclick = function () {
    if (!state.imgSketch) return;
    state.useSketch = !state.useSketch;
    setPressed(this, state.useSketch);
  };

  $("btnMirror").onclick = function () {
    state.mirror = !state.mirror;
    setPressed(this, state.mirror);
  };

  $("btnLock").onclick = function () {
    state.locked = !state.locked;
    setPressed(this, state.locked);
    touchLayer.style.pointerEvents = state.locked ? "none" : "auto";
  };

  $("btnGrid").onclick = function () {
    state.showGrid = !state.showGrid;
    setPressed(this, state.showGrid);
  };

  $("btnReset").onclick = () => {
    if (!state.imgOriginal) return;
    const s = Math.min(globalThis.innerWidth, globalThis.innerHeight);
    state.scale = (s * 0.9) /
      Math.max(state.imgOriginal.width, state.imgOriginal.height);
    state.x = globalThis.innerWidth / 2;
    state.y = globalThis.innerHeight / 2;
    state.rotation = 0;
    state.mirror = false;
    syncSliders();
    setPressed($("btnMirror"), false);
  };

  $("btnSave").onclick = saveSnapshot;

  const toggle = $("toggleBtn");
  toggle.onclick = () => {
    const hidden = controls.classList.toggle("hidden");
    toggle.setAttribute("aria-expanded", String(!hidden));
    controls.inert = hidden;
  };
}
