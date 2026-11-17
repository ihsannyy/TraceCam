const THRESHOLD = 40;

export function edgeDetect(srcCanvas) {
  const w = srcCanvas.width;
  const h = srcCanvas.height;
  const srcData = srcCanvas.getContext("2d").getImageData(0, 0, w, h).data;

  const gray = new Float32Array(w * h);
  for (let i = 0, j = 0; i < srcData.length; i += 4, j++) {
    gray[j] = 0.299 * srcData[i] +
      0.587 * srcData[i + 1] +
      0.114 * srcData[i + 2];
  }

  const out = document.createElement("canvas");
  out.width = w;
  out.height = h;

  const outCtx = out.getContext("2d");
  const outData = outCtx.createImageData(w, h);
  const d = outData.data;

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4;

      const gx = -gray[(y - 1) * w + (x - 1)] -
        2 * gray[y * w + (x - 1)] -
        gray[(y + 1) * w + (x - 1)] +
        gray[(y - 1) * w + (x + 1)] +
        2 * gray[y * w + (x + 1)] +
        gray[(y + 1) * w + (x + 1)];

      const gy = -gray[(y - 1) * w + (x - 1)] -
        2 * gray[(y - 1) * w + x] -
        gray[(y - 1) * w + (x + 1)] +
        gray[(y + 1) * w + (x - 1)] +
        2 * gray[(y + 1) * w + x] +
        gray[(y + 1) * w + (x + 1)];

      const mag = Math.sqrt(gx * gx + gy * gy);
      d[idx + 3] = Math.min(255, Math.max(0, (mag - THRESHOLD) * 1.5));
    }
  }

  outCtx.putImageData(outData, 0, 0);
  return out;
}
