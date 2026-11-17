import { $, video } from "./dom.js";

let activeStream = null;

const CAMERA_CONSTRAINTS = {
  video: {
    facingMode: { ideal: "environment" },
    width: { ideal: 1920 },
    height: { ideal: 1080 },
  },
  audio: false,
};

const ALLOW_LABEL = "Izinkan Kamera";
const RETRY_LABEL = "Coba Lagi";

function setStatus(text, statusState = "pending") {
  const status = $("status");
  if (!status) return;

  const label = $("statusText");
  if (label) label.textContent = text;
  status.dataset.state = statusState;
  status.classList.remove("hidden");
}

function gateParts() {
  return {
    gate: $("cameraGate"),
    title: $("gateTitle"),
    msg: $("gateMsg"),
    allow: $("btnAllowCamera"),
    reload: $("btnReload"),
    skip: $("btnSkipCamera"),
    diag: $("gateDiag"),
  };
}

function setGateIcon(name) {
  const use = $("gateIcon")?.querySelector("use");
  if (use) use.setAttribute("href", `#i-${name}`);
}

function openGate({
  icon = "camera",
  title,
  message,
  allow = true,
  allowLabel = ALLOW_LABEL,
  reload = false,
  skip = true,
}) {
  const p = gateParts();
  if (!p.gate) return;

  p.gate.hidden = false;
  setGateIcon(icon);
  p.title.textContent = title;
  p.msg.innerHTML = message;
  p.allow.hidden = !allow;
  p.allow.textContent = allowLabel;
  p.allow.disabled = false;
  p.reload.hidden = !reload;
  p.skip.hidden = !skip;
}

function closeGate() {
  const gate = $("cameraGate");
  if (gate) gate.hidden = true;
}

async function getPermissionState() {
  try {
    return (await navigator.permissions.query({ name: "camera" })).state;
  } catch {
    return "unknown";
  }
}

function showDiag(state) {
  const diag = $("gateDiag");
  if (!diag) return;

  const origin = globalThis.location.origin;
  const secure = globalThis.isSecureContext ? "ya" : "tidak";
  diag.textContent = `${origin} · secure: ${secure} · izin: ${state}`;
}

async function showPromptGate() {
  const state = await getPermissionState();

  openGate({
    icon: "camera",
    title: "Aktifkan Kamera",
    message: "TraceCam membutuhkan kamera belakang untuk menampilkan dunia " +
      "nyata di balik gambar referensi.<br><br>Tekan tombol di bawah, lalu " +
      "pilih <b>Allow</b> saat browser meminta izin.",
    allowLabel: ALLOW_LABEL,
    skip: true,
  });
  showDiag(state);
  setStatus("Menunggu izin kamera", "pending");
}

async function showDeniedGate() {
  const state = await getPermissionState();

  openGate({
    icon: "ban",
    title: "Izin Kamera Diblokir",
    message: "Chrome memblokir kamera untuk situs ini." +
      "<br><br><small>Klik ikon kunci atau pengaturan di address bar → " +
      "<b>Permissions</b> → <b>Camera</b> → <b>Allow</b>, lalu tekan " +
      "Coba Lagi. Di Android, pastikan juga <b>Settings → Apps → Chrome → " +
      "Permissions → Camera</b> dalam keadaan Allow.</small>",
    allowLabel: RETRY_LABEL,
    reload: true,
    skip: true,
  });
  showDiag(state);
  setStatus("Izin kamera diblokir", "error");
}

async function showNotFoundGate(err) {
  const state = await getPermissionState();

  openGate({
    icon: "alert",
    title: "Kamera Tidak Ditemukan",
    message: "Perangkat tidak mengekspos kamera ke browser ini." +
      "<br><br><small>Pastikan izin Kamera untuk aplikasi browser aktif dan " +
      "kamera tidak sedang dipakai aplikasi lain. Kalau halaman ini dibuka " +
      "di browser dalam aplikasi, coba buka di Chrome.</small>" +
      `<br><br><code>${err?.name ?? "Error"}</code>`,
    allowLabel: RETRY_LABEL,
    reload: true,
    skip: true,
  });
  showDiag(state);
  setStatus("Kamera tidak ditemukan", "error");
}

function showInsecureGate() {
  openGate({
    icon: "lock",
    title: "Butuh HTTPS",
    message: "Browser hanya mengizinkan kamera di <b>secure context</b>." +
      "<br><br><small>Buka lewat <code>http://localhost:8080</code> di HP " +
      "ini, atau pakai URL <b>https://</b> (tunnel) kalau diakses dari " +
      "perangkat lain. Alamat IP LAN biasa (http://192.168.x.x) tidak akan " +
      "bisa.</small>",
    allow: false,
    skip: true,
  });
  showDiag("—");
  setStatus("Kamera butuh HTTPS/localhost", "error");
}

async function startCamera() {
  const p = gateParts();
  setStatus("Meminta izin kamera", "pending");
  p.allow.disabled = true;
  p.allow.textContent = "Meminta izin…";

  try {
    activeStream?.getTracks().forEach((track) => track.stop());
    activeStream = await navigator.mediaDevices.getUserMedia(
      CAMERA_CONSTRAINTS,
    );
    video.srcObject = activeStream;
    await video.play().catch(() => {});

    closeGate();
    setStatus("Kamera aktif", "ok");
    setTimeout(() => $("status")?.classList.add("hidden"), 2000);
    return true;
  } catch (err) {
    console.warn("Kamera gagal:", err);
    const name = err?.name;

    if (name === "NotAllowedError" || name === "SecurityError") {
      await showDeniedGate();
    } else if (name === "NotFoundError" || name === "OverconstrainedError") {
      await showNotFoundGate(err);
    } else if (name === "NotReadableError") {
      openGate({
        icon: "alert",
        title: "Kamera Sedang Dipakai",
        message: "Aplikasi lain sedang memakai kamera." +
          "<br><br><small>Tutup aplikasi kamera lain, lalu tekan Coba Lagi.</small>",
        allowLabel: RETRY_LABEL,
        skip: true,
      });
      showDiag(await getPermissionState());
    } else {
      openGate({
        icon: "alert",
        title: "Kamera Gagal",
        message: String(err?.message ?? err),
        allowLabel: RETRY_LABEL,
        skip: true,
      });
      showDiag(await getPermissionState());
    }

    p.allow.disabled = false;
    return false;
  }
}

export async function initCamera() {
  if (!globalThis.isSecureContext) {
    showInsecureGate();
    return false;
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    openGate({
      icon: "alert",
      title: "Browser Tidak Mendukung",
      message: "Browser ini tidak menyediakan akses kamera " +
        "(<code>getUserMedia</code> tidak tersedia).",
      allow: false,
      skip: true,
    });
    setStatus("Browser tidak mendukung kamera", "error");
    return false;
  }

  const state = await getPermissionState();

  if (state === "granted") return startCamera();
  if (state === "denied") {
    await showDeniedGate();
    return false;
  }

  await showPromptGate();
  return false;
}

$("btnAllowCamera")?.addEventListener("click", startCamera);
$("btnReload")?.addEventListener("click", () => globalThis.location.reload());
$("btnSkipCamera")?.addEventListener("click", () => {
  closeGate();
  setStatus("Kamera nonaktif", "idle");
  setTimeout(() => $("status")?.classList.add("hidden"), 2500);
});

export function keepScreenAwake() {
  async function requestWakeLock() {
    try {
      if ("wakeLock" in navigator) {
        await navigator.wakeLock.request("screen");
      }
    } catch (e) {
      console.warn("WakeLock:", e);
    }
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") requestWakeLock();
  });
  requestWakeLock();
}

export function initFullscreenToggle() {
  let lastTap = 0;
  document.addEventListener("touchend", () => {
    const now = Date.now();
    if (now - lastTap < 300) {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.().catch(() => {});
      } else {
        document.exitFullscreen?.();
      }
    }
    lastTap = now;
  });
}
