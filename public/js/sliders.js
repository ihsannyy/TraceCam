import { $ } from "./dom.js";
import { state } from "./state.js";

function syncOutputs() {
  $("opacityVal").textContent = `${Math.round(state.opacity * 100)}%`;
  $("scaleVal").textContent = `${Math.round(state.scale * 100)}%`;
  $("rotateVal").textContent = `${
    Math.round((state.rotation * 180) / Math.PI)
  }°`;
}

export function syncSliders() {
  $("opacity").value = state.opacity * 100;
  $("scale").value = state.scale * 100;
  $("rotate").value = (state.rotation * 180) / Math.PI;
  syncOutputs();
}

export function initSliders() {
  $("opacity").oninput = (e) => {
    state.opacity = e.target.value / 100;
    syncOutputs();
  };
  $("scale").oninput = (e) => {
    state.scale = e.target.value / 100;
    syncOutputs();
  };
  $("rotate").oninput = (e) => {
    state.rotation = (e.target.value * Math.PI) / 180;
    syncOutputs();
  };

  syncSliders();
}
