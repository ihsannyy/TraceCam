import { initCamera, initFullscreenToggle, keepScreenAwake } from "./camera.js";
import { initControls } from "./controls.js";
import { initGestures } from "./gestures.js";
import { startRenderLoop } from "./overlay.js";
import { initSliders } from "./sliders.js";

startRenderLoop();
initCamera();
keepScreenAwake();
initFullscreenToggle();
initGestures();
initSliders();
initControls();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").catch(() => {});
}
