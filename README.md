<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:1DB954,50:1aa34a,100:191414&height=200&section=header&text=Bidzz%20Extension&fontSize=56&fontColor=ffffff&fontAlignY=38&desc=Spotify%20Mod%20%E2%80%94%20Chrome%20Extension%20MV3&descAlignY=58&descSize=18&descColor=a8f0c8&animation=fadeIn" width="100%" />

<br/>

[![Chrome Extension](https://img.shields.io/badge/Chrome%20Extension-MV3-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)](https://developer.chrome.com/docs/extensions/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![CSS3](https://img.shields.io/badge/CSS3-Custom%20Properties-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![Web Audio API](https://img.shields.io/badge/Web%20Audio%20API-GainNode-FF6F00?style=for-the-badge&logo=web&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![Chrome Storage](https://img.shields.io/badge/Chrome%20Storage-Sync-FFD54F?style=for-the-badge&logo=chrome&logoColor=black)](https://developer.chrome.com/docs/extensions/reference/api/storage)

<br/>

[![Version](https://img.shields.io/badge/Version-1.0-1DB954?style=flat-square)](.)
[![License](https://img.shields.io/badge/License-MIT-191414?style=flat-square)](.)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-1aa34a?style=flat-square)](.)

<br/>

<video src="https://drive.google.com/uc?export=download&id=1h6t613pfKW5K7xaxpw5vN5TteD_v7O_b" controls width="100%" style="border-radius: 12px;"></video>

</div>

<br/>

---

<div align="center">

```
╔══════════════════════════════════════════════════════════════════════════╗
║  Ad Blocker · 8 Visual Themes · Volume Booster (Web Audio API)          ║
║  Sleep Timer · FAB Control Panel · Welcome Modal · Stats Tracker        ║
║  Pure vanilla JS · No dependencies · Manifest V3 · declarativeNetRequest ║
╚══════════════════════════════════════════════════════════════════════════╝
```

</div>

---

## `01` — Tentang Project

**Bidzz Extension** adalah ekstensi Chrome (Manifest V3) yang meningkatkan pengalaman Spotify Web Player (`open.spotify.com`) — memblokir iklan, menghadirkan 8 tema visual, volume booster hingga 200%, sleep timer, dan panel kontrol langsung di halaman Spotify.

Tidak ada dependensi eksternal, tidak perlu build step — cukup load folder sebagai unpacked extension, dan Spotify-mu langsung berubah.

> **Tipe:** Chrome Extension MV3  
> **Target:** `https://open.spotify.com/*`  
> **Storage:** `chrome.storage.local` — semua state persist antar sesi

<br/>

---

## `02` — Fitur Utama

<table>
<tr>
<td width="50%">

**🔇 Ad Blocker**
- 3 declarativeNetRequest rules — blokir audio ads, Google ads, QUIC ads
- Request audio iklan Spotify (`audio-ak-spotify-com.akamaized.net`)
- Google syndication ads (`googlesyndication.com`)
- QUIC-based audio ads (`audio-akp-quic-spotify-com`)
- Stats real-time: total blocked, hari ini, waktu dihemat

**🎨 8 Visual Themes**
- Dark (default hijau Spotify)
- Light, Midnight, Coffee, Lavender
- Synthwave, Feminine Light, Feminine Dark
- CSS custom properties — override penuh token Encore Spotify
- Collapsible theme panel — state persist di storage

**🔊 Volume Booster**
- Web Audio API — `AudioContext` + `GainNode`
- Gain 1.0× hingga 2.0× (100%–200%)
- Inject ke page main world — akses penuh ke `<audio>` element
- MutationObserver + retry periodik (2s) — tetap jalan meskipun Spotify re-mount audio

</td>
<td width="50%">

**⏱️ Sleep Timer**
- Preset: 15 / 30 / 60 menit
- Timer via absolute `endTime` timestamp — tahan reload
- Countdown live di panel dan popup (MM:SS)
- Auto-pause playback via klik tombol Spotify play/pause
- Toast notification saat timer habis — dismiss 4 detik

**🖱️ FAB Control Panel**
- Floating action button 48×48px — pojok kanan bawah
- Panel 300px — slide up, dark theme, Spotify-styled
- Stats row: blocked count, hari ini, waktu dihemat
- Volume slider, sleep timer, theme grid
- Responsive: breakpoint `max-width: 480px`

**👋 Welcome Modal**
- Full-screen overlay + backdrop blur
- Animasi scale + opacity (cubic-bezier)
- Tampil sekali — state `bidzz_welcomeShown` di storage
- Reset otomatis saat ekstensi di-install ulang

**📊 Stats Tracker**
- Service worker polling DNR every 30 detik
- `totalBlocked`, `todayBlocked`, `dailyLog`
- Waktu dihemat: `totalBlocked × 30 detik`
- Popup stats counter — animasi easing cubic

</td>
</tr>
</table>

<br/>

---

## `03` — Tech Stack

<div align="center">

| Layer | Teknologi |
|:---:|:---|
| **Platform** | Chrome Extension Manifest V3 |
| **Ad Blocking** | `declarativeNetRequest` — 3 blocking rules |
| **Volume Engine** | Web Audio API · `AudioContext` · `GainNode` |
| **Styling** | CSS Custom Properties · `themes.css` (8 tema) |
| **Storage** | `chrome.storage.local` · `onChanged` listeners |
| **Background** | Service Worker — polling 30 detik |
| **Popup** | HTML · CSS · JS vanilla — 300px, dark theme |
| **Content Script** | IIFE · Isolated World + Main World injection |
| **UI/UX** | CSS transitions · cubic-bezier · backdrop-blur |
| **Dependencies** | **Zero** — pure vanilla JavaScript |

</div>

<br/>

---

## `04` — Arsitektur

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         BIDZZ EXTENSION ARCHITECTURE                     │
└─────────────────────────────────────────────────────────────────────────┘

  User Action (popup / FAB Panel)
          │
          ▼
  ┌──────────────────┐     chrome.storage.local     ┌──────────────────┐
  │   popup.js       │◄═══════════════════════════►│   content.js      │
  │   popup.html     │   set() / get() / onChanged  │   style.css       │
  └──────────────────┘                              └────────┬─────────┘
          │                                                  │
          ▼                                                  ▼
  ┌──────────────────┐                              ┌──────────────────┐
  │  background.js   │                              │  window.postMsg  │
  │  (service worker)│                              │  BIDZZ_VOLUME    │
  │  polling 30s DNR │                              └────────┬─────────┘
  └──────────────────┘                                       │
          │                                                  ▼
          ▼                                         ┌──────────────────┐
  ┌──────────────────┐                              │  volume-boost.js │
  │  declarativeNet  │                              │  (page main world)│
  │  Request (DNR)   │                              │  AudioContext     │
  │  3 block rules   │                              │  GainNode 1.0-2.0│
  └──────────────────┘                              └──────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  Firefox: audio-ak-spotify-com  →  BLOCK (media)                        │
│  Google: googlesyndication.com  →  BLOCK (script/img/xhr)               │
│  QUIC: audio-akp-quic-spotify   →  BLOCK (media)                        │
└─────────────────────────────────────────────────────────────────────────┘
```

<br/>

---

## `05` — Instalasi

### Prasyarat

- Google Chrome / Chromium `>= 88` (Manifest V3)
- Spotify Web Player: `https://open.spotify.com`

### Langkah Instalasi

**Opsi 1 — Download ZIP:** [**DOWNLOAD**](https://github.com/BIDZZ-RAWR/Spotify-Premium-Extension/archive/refs/heads/master.zip) lalu ekstrak ke folder lokal.

**Opsi 2 — Clone via git:**
```bash
git clone https://github.com/BIDZZ-RAWR/Spotify-Premium-Extension.git
```

Setelah itu:
1. Buka `chrome://extensions` di browser Chrome
2. Aktifkan **Developer mode** (pojok kanan atas)
3. Klik **Load unpacked** → pilih folder ekstensi
4. Buka `open.spotify.com` — lihat FAB hijau di pojok kanan bawah
5. (Opsional) Chrome ⋮ → More Tools → Create Shortcut → centang **Open as window**

### Video Tutorial

[![Tutorial Install Unpacked Extension](https://img.shields.io/badge/Watch%20Tutorial%20(YouTube)-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://youtu.be/9wZt3M6chOI)

Klik badge di atas untuk panduan visual cara load unpacked extension di Chrome.

### Catatan Penting

- Ekstensi hanya aktif di `open.spotify.com` — tidak memengaruhi situs lain
- Welcome modal tampil sekali saat pertama kali membuka Spotify setelah install
- Semua state (theme, volume, timer, stats) persist di `chrome.storage.local`

<br/>

---

## `06` — Struktur Project

```
spotify-mod-chrome-plugin/
│
├── img/
│   └── icon.png                  # Icon ekstensi 128×128px (hijau + note)
│
├── js/
│   ├── background.js             # Service worker — polling DNR stats tiap 30 detik
│   ├── content.js                # Main content script — FAB, panel, timer, theme, welcome
│   └── volume-boost.js           # Injected ke page — AudioContext + GainNode
│
├── popup/
│   ├── popup.html                # Popup ekstensi — stats, volume, timer, dark toggle
│   ├── popup.js                  # Logika popup — storage sync, counter animasi
│   └── popup.css                 # Style popup — dark theme, 300px
│
├── manifest.json                 # Manifest V3 — permissions, DNR, content scripts
├── rules.json                    # 3 DNR block rules — audio ads, Google ads, QUIC
├── style.css                     # Injected CSS — FAB, panel, modal, premium hider
├── themes.css                    # 8 tema visual — CSS custom properties override
└── README.md                     # Dokumentasi ini
```

<br/>

---

## `07` — Visual Themes

Ekstensi membawa **8 tema visual** yang meng-override sistem desain Spotify (Encore tokens) via CSS custom properties. Tema diterapkan dengan menambahkan class `bidzz-theme-{id}` ke elemen `<html>`.

| ID | Nama | Base Color | Accent Color | Suasana |
|:---:|:---|:---:|:---:|:---|
| `dark` | Dark | `#07070a` | `#1DB954` | Default — hitam legam + hijau Spotify |
| `light` | Light | `#f5f0eb` | `#1DB954` | Krem terang — nyaman di siang hari |
| `midnight` | Midnight | `#000814` | `#3a86ff` | Biru tengah malam — kalem |
| `coffee` | Coffee | `#1a1410` | `#d4a373` | Cokelat hangat — estetik |
| `lavender` | Lavender | `#12101e` | `#a78bfa` | Ungu lavender — dreamy |
| `synthwave` | Synthwave | `#0a0020` | `#ff00ff` | Neon retro — 80s vibe |
| `feminine-light` | Feminine L | `#ffdae8` | `#ff1b71` | Pink pastel — ringan |
| `feminine-dark` | Feminine D | `#1e121e` | `#bc0047` | Pink gelap — bold |

Setiap tema meng-override properti berikut: `--background-base`, `--background-highlight`, `--background-press`, `--background-elevated-base`, `--background-elevated-highlight`, `--background-elevated-press`, `--background-tinted-base`, `--background-tinted-highlight`, `--background-tinted-press`, `--decorative-base`, `--decorative-subdued`, `--text-bright-accent`, `--text-positive`, `--essential-bright-accent`, `--essential-positive`.

Untuk tema terang (light, feminine-light), juga meng-override `--text-base`, `--text-subdued`, `--essential-base`, `--essential-subdued`.

<br/>

---

## `08` — Volume Booster

Volume booster bekerja melalui **Web Audio API** dengan arsitektur dua-lapis:

### Alur Kerja

```
content.js (isolated world)
    │
    ├── inject <script src="volume-boost.js"> ke <html>
    │   → volume-boost.js berjalan di MAIN world (akses penuh ke <audio>)
    │
    ├── window.postMessage({ type: 'BIDZZ_VOLUME', value: 1.5 })
    │   → dikirim ke volume-boost.js di main world
    │
    ▼
volume-boost.js (main world)
    │
    ├── Buat AudioContext
    ├── Buat GainNode (gain = value / 100)
    ├── connect: audioSource → GainNode → destination
    │
    ├── MutationObserver — deteksi <audio> baru dari Spotify
    ├── Retry periodik setiap 2 detik — handle audio remount
    └── Fallback: audio.volume jika Web Audio API gagal
```

### Spesifikasi

| Aspek | Detail |
|:---|:---|
| **Rentang Gain** | `1.0` – `2.0` (100% – 200%) |
| **Clamping** | `Math.min(2.0, Math.max(1.0, val))` |
| **AudioContext** | Resume on user interaction (`play`, `click`, `pointerdown`) |
| **Komunikasi** | `window.postMessage` + `message` event listener |
| **Fallback** | `HTMLMediaElement.volume` property |

> ⚠️ Peringatan satu kali (dismissible) akan tampil saat volume booster diaktifkan — menjelaskan bahwa fitur ini menggunakan Web Audio API dan mungkin tidak kompatibel dengan semua perangkat.

<br/>

---

## `09` — Sleep Timer

Timer tidur otomatis menjeda playback Spotify setelah durasi yang ditentukan.

```
User set timer (15 / 30 / 60 menit)
        │
        ▼
chrome.storage.local.set({ endTime: Date.now() + duration })
        │
        ▼
content.js polling setiap 1 detik
        │
        ├── Timer belum habis → tampilkan countdown (MM:SS)
        │
        └── Timer habis →
            ├── Klik tombol play/pause Spotify
            ├── Tampilkan toast "Sleep timer ended — music paused"
            └── Hapus timer dari storage
```

| Preset | Durasi |
|:---:|:---:|
| 15 menit | `15 × 60 × 1000` ms |
| 30 menit | `30 × 60 × 1000` ms |
| 60 menit | `60 × 60 × 1000` ms |

Timer state menggunakan absolute `endTime` — tetap akurat meskipun ada reload halaman. Countdown live ditampilkan di panel dan popup.

<br/>

---

## `10` — Stats & Background Service Worker

Service worker (`js/background.js`) bertanggung jawab melacak statistik pemblokiran iklan.

```
setInterval (30 detik)
    │
    ▼
chrome.declarativeNetRequest.getMatchedRules()
    │
    ▼
Hitung delta sejak polling terakhir
    │
    ▼
Update chrome.storage.local:
    ├── totalBlocked      → akumulasi keseluruhan
    ├── todayBlocked      → reset jika tanggal berganti
    ├── dailyLog          → { "2025-06-20": 142, ... }
    └── lastUpdated       → timestamp
```

### Storage Key: `bidzz_stats`

| Field | Tipe | Deskripsi |
|:---|:---:|:---|
| `totalBlocked` | `number` | Total request diblokir sepanjang masa |
| `todayBlocked` | `number` | Request diblokir hari ini |
| `dailyLog` | `Record<string, number>` | Log per tanggal |
| `installedAt` | `number` | Timestamp install |
| `lastUpdated` | `number` | Timestamp update terakhir |
| `_lastBlockedCount` | `number` | Snapshot DRN count sebelumnya |

<br/>

---

## `11` — Declarative Net Request Rules

Tiga aturan blokir di `rules.json` menggunakan `declarativeNetRequest` API — tanpa perlu memori untuk service worker, semua blocking ditangani langsung oleh Chrome:

| ID | Domain | Jenis | Tipe Resource |
|:---:|:---|:---:|:---|
| 1 | `audio-ak-spotify-com.akamaized.net` | `block` | `media`, `xmlhttprequest` |
| 2 | `googlesyndication.com` | `block` | `script`, `image`, `xmlhttprequest` |
| 3 | `audio-akp-quic-spotify-com.akamaized.net` | `block` | `media`, `xmlhttprequest` |

Semua aturan priority `1`, action `block` — tidak ada allow/redirect rules.

<br/>

---

## `12` — Popup Extension

Popup (`popup/popup.html`) adalah antarmuka cepat untuk mengontrol ekstensi tanpa perlu membuka Spotify:

```
┌─────────────────────────────────────┐
│  🎵 Bidzz                          │
│                                     │
│  Blocked     Today       Saved      │
│  1,234       56          10m 17s    │
│                                     │
│  🔊 Volume Boost ────●──────── 150% │
│    1×           1.5×          2×    │
│                                     │
│  ⏱️ Sleep Timer                     │
│  [15m] [30m] [60m]  [✕]            │
│                                     │
│  🌙 Darker Theme  [════════○]      │
└─────────────────────────────────────┘
```

- Lebar 300px, dark theme, padding longgar
- Stats counter animasi dengan `cubic-bezier(0.34, 1.56, 0.64, 1)` — efek "bounce" ringan
- Volume slider tick marks di 1.0×, 1.5×, 2.0×
- Sleep timer countdown live (MM:SS) — hijau saat aktif
- Darker Theme toggle — memicu class tambahan untuk mode gelap
- Sync real-time via `chrome.storage.onChanged` — panel dan popup selalu sinkron

<br/>

---

## `13` — Deploy & Packaging

### Sebagai Unpacked Extension (Development)

```bash
# Load folder sebagai unpacked extension:
chrome://extensions → Developer mode → Load unpacked
```

### Sebagai Packed Extension (.crx)

```bash
# 1. Buka chrome://extensions
# 2. Klik "Pack extension"
# 3. Browse folder ekstensi → klik "Pack Extension"
# 4. Hasil: *.crx (extension) + *.pem (private key — simpan aman)
```

### Untuk Distribusi

1. Pack ekstensi menjadi `.crx`
2. Upload ke Chrome Web Store Developer Dashboard
3. Atau distribusi manual: load unpacked / drag-and-drop `.crx`

### Environment Notes

- Tidak ada build step — zero dependencies
- Tidak perlu npm, webpack, atau bundler apapun
- Semua file adalah vanilla JavaScript / CSS / HTML
- Cukup load folder sebagai unpacked extension

<br/>

---

## `14` — Keamanan & Best Practices

- **Zero external dependencies** — tidak ada risiko supply chain attack
- **Isolated World** — content script tidak bisa diakses oleh page script Spotify
- **Main World injection hanya untuk Web Audio API** — terbatas pada `volume-boost.js`
- **Tidak ada API key / credential** — semua murni client-side, tidak perlu backend
- **DNR blocking** — proses blocking dilakukan oleh Chrome, bukan service worker → lebih aman dan efisien
- **Storage terisolasi** — semua data di `chrome.storage.local` — tidak bocor ke cookies atau localStorage Spotify
- **Minimal permissions** — hanya `storage` + `declarativeNetRequest` + host terbatas
- **Tidak memodifikasi DOM Spotify secara destruktif** — semua elemen tambahan memiliki prefix `bidzz-`

<br/>

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:191414,50:1aa34a,100:1DB954&height=100&section=footer&animation=fadeIn" width="100%" />

**Bidzz Extension** — Spotify Mod Chrome Extension

*Vanilla. Tanpa dependensi. Tanpa batas.*

[![Made with JavaScript](https://img.shields.io/badge/Made%20with-JavaScript%20ES6-F7DF1E?style=flat-square&logo=javascript)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Powered by Web Audio API](https://img.shields.io/badge/Powered%20by-Web%20Audio%20API-FF6F00?style=flat-square&logo=web)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![Chrome MV3](https://img.shields.io/badge/Built%20for-Chrome%20MV3-4285F4?style=flat-square&logo=googlechrome)](https://developer.chrome.com/docs/extensions/)
[![Spotify](https://img.shields.io/badge/For-Spotify%20Web-1DB954?style=flat-square&logo=spotify)](https://open.spotify.com)

</div>
