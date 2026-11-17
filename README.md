# TraceCam

**Jiplak gambar apa saja dengan kamera HP.** Arahkan kamera ke kertas, atur
gambar referensi di layar, lalu jiplak. Gratis, offline, dan tanpa install.

<p align="center">
  <img src="docs/demo.gif" alt="Demo TraceCam: memuat gambar, mengubahnya menjadi sketsa, mengatur opasitas, lalu menjiplak di atas kertas" width="330">
</p>

## Fitur

- **Langsung dari browser** — tanpa unduh dan tanpa instal aplikasi.
- **Bisa offline** — setelah dibuka sekali, aplikasi tersimpan di perangkat
  (PWA).
- **Kamera penuh layar** — tampilan kamera belakang sebagai alas menjiplak.
- **Mode sketsa** — gambar diubah menjadi garis secara otomatis.
- **Gestur alami** — geser satu jari, cubit untuk zoom, putar dengan dua jari.
- **Panel kontrol** — atur opasitas, skala, rotasi, grid, dan kunci posisi.
- **Simpan hasil** — simpan tampilan kamera beserta jiplakan sebagai PNG.

## Mulai

Butuh [Node.js](https://nodejs.org) 20 atau lebih baru.

```bash
npm install
npm run dev
```

Buka `http://localhost:8080`. Untuk menjalankan tanpa watch:

```bash
npm start
```

## Cara pakai

1. Buka TraceCam, lalu izinkan akses kamera.
2. Tekan **Foto** dan pilih gambar yang ingin dijiplak.
3. Geser dengan satu jari; cubit dan putar dengan dua jari.
4. Aktifkan **Sketsa** untuk mengubah gambar menjadi garis.
5. Atur **Opasitas** agar gambar terlihat tipis di atas kertas.
6. Tekan **Kunci** supaya gambar tidak bergeser saat mulai menjiplak.
7. Tekan **Simpan** untuk menyimpan hasilnya sebagai PNG.

## Catatan kamera

Browser hanya mengizinkan kamera pada secure context, yaitu `http://localhost`
atau alamat `https://`. Alamat IP LAN seperti `http://192.168.x.x` tidak bisa
membuka kamera. Untuk menguji di HP, arahkan tunnel HTTPS ke server lokal.

Kalau izin pernah ditolak, buka pengaturan situs di browser, ubah izin kamera
menjadi **Allow**, lalu muat ulang halaman.

## Struktur

```text
.
├── dev.ts                  # Server lokal: API, static, dan fallback SPA
├── api/[...route].ts       # Entry API untuk Vercel
├── src/
│   ├── app.ts              # Hono app: middleware dan API
│   ├── middleware/logger.ts
│   └── routes/api.ts
├── public/                 # Semua aset yang dikirim ke browser
│   ├── index.html          # Markup dan sprite ikon SVG
│   ├── css/style.css       # Tema klasik (kuningan, serif, bottom sheet)
│   ├── js/                 # Modul ES: kamera, gesture, overlay, sketsa, dll.
│   ├── manifest.json       # Metadata PWA
│   ├── sw.js               # Service worker untuk mode offline
│   └── icon.svg
├── vercel.json             # Konfigurasi hosting Vercel
├── package.json
├── tsconfig.json
└── docs/demo.gif           # GIF demo untuk README
```

Tidak ada build step. Frontend dimuat langsung oleh browser, sedangkan server
dijalankan dengan `tsx`.

## API

| Method | Path          | Keterangan             |
| ------ | ------------- | ---------------------- |
| GET    | `/api/health` | Cek status server      |
| POST   | `/api/traces` | Contoh endpoint (echo) |

Path `/api/*` yang tidak dikenal mengembalikan `404` dalam format JSON.

## Perintah

| Perintah        | Fungsi                       |
| --------------- | ---------------------------- |
| `npm run dev`   | Jalankan server dengan watch |
| `npm start`     | Jalankan server tanpa watch  |
| `npm run check` | Type-check TypeScript        |
| `npm run fmt`   | Format kode dengan Prettier  |

Port bisa diubah lewat environment variable `PORT`:

```bash
PORT=3000 npm run dev
```

## Teknologi

Node.js · Hono · TypeScript · Vanilla JS (ES modules) · Canvas API · PWA
