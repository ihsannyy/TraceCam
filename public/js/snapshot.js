import { overlay, video } from "./dom.js";

export function saveSnapshot() {
  const canvas = document.createElement("canvas");
  canvas.width = overlay.width;
  canvas.height = overlay.height;
  const ctx = canvas.getContext("2d");

  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (vw && vh) {
    const scale = Math.max(canvas.width / vw, canvas.height / vh);
    const dw = vw * scale;
    const dh = vh * scale;
    ctx.drawImage(
      video,
      (canvas.width - dw) / 2,
      (canvas.height - dh) / 2,
      dw,
      dh,
    );
  }

  ctx.drawImage(overlay, 0, 0);

  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tracecam-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }, "image/png");
}
