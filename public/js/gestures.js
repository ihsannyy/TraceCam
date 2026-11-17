import { touchLayer } from "./dom.js";
import { syncSliders } from "./sliders.js";
import { state } from "./state.js";

const pointers = new Map();
let gesture = null;

function startGesture() {
  gesture = {
    startPts: Array.from(pointers.values()).map((p) => ({ ...p })),
    startState: {
      x: state.x,
      y: state.y,
      scale: state.scale,
      rotation: state.rotation,
    },
  };
}

function updateGesture() {
  const pts = Array.from(pointers.values());
  if (!gesture || !pts.length) return;

  const sp = gesture.startPts;
  const ss = gesture.startState;

  if (pts.length === 1 && sp.length === 1) {
    state.x = ss.x + (pts[0].x - sp[0].x);
    state.y = ss.y + (pts[0].y - sp[0].y);
  } else if (pts.length >= 2 && sp.length >= 2) {
    const cd = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
    const sd = Math.hypot(sp[0].x - sp[1].x, sp[0].y - sp[1].y);
    const ca = Math.atan2(pts[1].y - pts[0].y, pts[1].x - pts[0].x);
    const sa = Math.atan2(sp[1].y - sp[0].y, sp[1].x - sp[0].x);
    const cc = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
    const sc = { x: (sp[0].x + sp[1].x) / 2, y: (sp[0].y + sp[1].y) / 2 };

    if (sd > 0) state.scale = Math.max(0.05, ss.scale * (cd / sd));
    state.rotation = ss.rotation + (ca - sa);
    state.x = ss.x + (cc.x - sc.x);
    state.y = ss.y + (cc.y - sc.y);
    syncSliders();
  }
}

export function initGestures() {
  touchLayer.addEventListener("touchstart", (e) => {
    if (state.locked) return;
    e.preventDefault();
    for (const t of e.changedTouches) {
      pointers.set(t.identifier, { x: t.clientX, y: t.clientY });
    }
    startGesture();
  }, { passive: false });

  touchLayer.addEventListener("touchmove", (e) => {
    if (state.locked || !gesture) return;
    e.preventDefault();
    for (const t of e.changedTouches) {
      pointers.set(t.identifier, { x: t.clientX, y: t.clientY });
    }
    updateGesture();
  }, { passive: false });

  touchLayer.addEventListener("touchend", (e) => {
    for (const t of e.changedTouches) pointers.delete(t.identifier);
    if (pointers.size === 0) gesture = null;
    else startGesture();
  });

  touchLayer.addEventListener("touchcancel", () => {
    pointers.clear();
    gesture = null;
  });

  initMouseFallback();
}

function initMouseFallback() {
  let mouseDown = false;
  let mouseStart = null;

  touchLayer.addEventListener("mousedown", (e) => {
    if (state.locked) return;
    mouseDown = true;
    mouseStart = { x: e.clientX, y: e.clientY, sx: state.x, sy: state.y };
  });

  globalThis.addEventListener("mousemove", (e) => {
    if (!mouseDown || state.locked) return;
    state.x = mouseStart.sx + (e.clientX - mouseStart.x);
    state.y = mouseStart.sy + (e.clientY - mouseStart.y);
  });

  globalThis.addEventListener("mouseup", () => (mouseDown = false));
}
