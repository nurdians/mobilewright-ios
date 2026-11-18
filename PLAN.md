# Rencana Framework Automation Mobile — Mobilewright (iOS)

> Dibuat: 18 Nov 2026 · Lokasi proyek: `/Users/nurdians/Projects/learning/mobilewright-ios`

## 1. Ringkasan

Membangun framework otomasi tes mobile end-to-end berbasis **Mobilewright** ("Playwright for Mobile") dengan keputusan berikut:

| Aspek           | Keputusan                                                                                                          |
| --------------- | ------------------------------------------------------------------------------------------------------------------ |
| Platform        | **iOS saja** (simulator)                                                                                           |
| Bahasa          | **TypeScript**                                                                                                     |
| Aplikasi target | **Demo app Milliways** (sample resmi Mobile Next, `github.com/mobile-next/Milliways`) karena belum ada app sendiri |
| Arsitektur test | **Page Object Model** + custom fixtures                                                                            |
| Reporting       | **HTML report**, video & screenshot **on-failure**, accessibility tree (`viewTree`) on-failure                     |
| Data            | **Test data terpusat + multi-environment** (`.env` staging/production)                                             |
| Kualitas kode   | **ESLint + Prettier**                                                                                              |
| CI/CD           | **GitHub Actions** (macOS runner, Xcode + simulator prebuilt)                                                      |

Mobilewright adalah framework E2E open-source (Apache-2.0) dari Mobile Next: API ala Playwright (`getByRole`, `getByText`, `expect`), auto-waiting, retrying assertions, test runner & HTML report dari Playwright Test, tanpa Appium server.

## 2. Hasil Pemeriksaan Environment (Fakta)

| Komponen          | Status            | Keterangan                                                                                      |
| ----------------- | ----------------- | ----------------------------------------------------------------------------------------------- |
| Node.js           | ✅ v22.23.2       | Syarat minimum 22.12 terpenuhi                                                                  |
| npm               | ✅ 12.0.2         | —                                                                                               |
| macOS             | ✅ 15.6           | Syarat minimum 13 terpenuhi                                                                     |
| Xcode             | ❌ **Belum ada**  | Hanya Command Line Tools (`/Library/Developer/CommandLineTools`); `xcrun simctl` tidak tersedia |
| iOS Simulator     | ❌ **Belum bisa** | Terblokir oleh tidak adanya Xcode                                                               |
| Device/App target | ⚠️ Belum ada      | Pakai demo app **Milliways**                                                                    |

**Blocker utama: instalasi Xcode penuh** — tanpa ini tidak ada simulator, tidak ada test yang bisa jalan.

## 3. Arsitektur & Struktur Direktori (Target)

```
mobilewright-ios/
├── mobilewright.config.ts        # config utama (platform, bundleId, reporter, viewTree)
├── package.json
├── tsconfig.json
├── eslint.config.mjs             # ESLint flat config + typescript-eslint
├── .prettierrc / .prettierignore
├── .env.example                  # template environment variables
├── .env.<TEST_ENV>               # nilai per environment, dibuat saat dibutuhkan (gitignored)
├── .gitignore                    # node_modules, test-results, mobilewright-report, .env.*
├── apps/                         # clone Milliways + artefak build (.app/.zip) — gitignored
├── scripts/
│   ├── build-app.sh              # clone + make zip (build Milliways utk simulator)
│   ├── install-app.sh            # simctl install .app ke simulator booted
│   ├── inspect.mjs               # dump accessibility tree (verifikasi locator)
│   └── explore.mjs               # tap berurutan + dump layar (penjelajahan UI)
├── src/
│   ├── config/
│   │   └── env.ts                # loader env (process.env > .env.<TEST_ENV> > .env)
│   ├── pages/                    # Page Objects
│   │   ├── BasePage.ts           # abstract: root, waitForVisible, screenshot
│   │   ├── HomePage.ts           # welcome screen → "New Order"
│   │   ├── MenuPage.ts           # daftar item + cart button
│   │   ├── ItemDetailPage.ts     # stepper qty + "Add to Order"
│   │   ├── CartPage.ts           # "Your Order" + "Place Order"
│   │   └── ConfirmationPage.ts   # "…is on its way!"
│   ├── fixtures/
│   │   └── test.ts               # extend test: fixture `pages` (semua page object)
│   └── data/
│       ├── users.json            # akun test per environment
│       └── products.ts           # data produk/menu (terverifikasi di app)
├── tests/
│   ├── smoke/                    # app launch + menu termuat
│   ├── e2e/                      # ordering flow + multi quantity
│   └── regression/               # empty cart (known bug, test.fail())
├── test-results/                 # artefak run (gitignored)
├── mobilewright-report/          # HTML report (gitignored)
└── .github/workflows/
    └── mobile-tests.yml          # CI pipeline
```

Prinsip:

- **`tests/`** hanya berisi orkestrasi & asersi — tidak ada locator mentah di sana.
- **`src/pages/`** satu file per layar, semua locator & aksi di dalamnya.
- **`src/data/`** satu-satunya sumber test data & kredensial.
- Locator strategy mengikuti prioritas Mobilewright Inspector: **`getByTestId` > `getByRole` > `getByLabel` > `getByText`** (fallback `getByType` untuk element type native).

## 4. Tahapan Implementasi

### Fase 0 — Siapkan Environment (blocker) ✅ selesai

1. Instal **Xcode penuh** — jalur yang terbukti jalan: **App Store manual** (`mas` CLI butuh sudo, tidak bisa non-interaktif). Setelah terpasang:
   - `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer`
   - `sudo xcodebuild -license accept`
   - iOS Simulator runtime **ikut terpasang** bersama Xcode versi App Store (tidak perlu `xcodebuild -downloadPlatform iOS` terpisah).
2. Verifikasi: `npx mobilewright doctor` → semua check hijau ✅ (hasil: 16 ok, 0 error).
3. Boot simulator: `xcrun simctl boot <UDID>` — device yang terpakai bisa berganti (awalnya iPhone 17 Pro, lalu iPhone 16e); config `deviceName: /iPhone/` menyesuaikan otomatis.

**Verifikasi lulus:** `mobilewright doctor` summary "Ready" ✅

### Fase 1 — Scaffold Proyek ✅ selesai

1. Scaffold — jalur yang terbukti jalan (scaffold interaktif dihindari): `npm install --save-dev mobilewright @mobilewright/test typescript @types/node` + **`npx mobilewright init`** (membuat `mobilewright.config.ts` + example test non-interaktif).
   - Bundle ID terverifikasi dari build: **`com.mobilenext.Milliways`** ✅
2. Siapkan demo app **Milliways**:
   - `git clone https://github.com/mobile-next/Milliways apps/Milliways-src`
   - Build: `make zip` (simulator) → `apps/Milliways-simulator.zip` (script: `scripts/build-app.sh` / `npm run app:build`).
   - **Hasil verifikasi:** `installApps` di config **tidak dipakai** — build simulator menghasilkan `.app`, dipasang langsung via `xcrun simctl install booted` (script `scripts/install-app.sh`).
3. **Agent mobilecli wajib di-install per-device** (`npx mobilewright install`) — tanpa ini semua test gagal di `connectDevice` dengan "Agent is not installed on the device". Berlaku juga bila device berganti (mis. iPhone 17 Pro → iPhone 16e): **agent + app harus di-install ulang**.
4. **Smoke check:** example test → kemudian suite sendiri.

**Verifikasi lulus:** test passed, app Milliways ter-install & ter-launch di simulator ✅

### Fase 2 — Konfigurasi Inti ✅ selesai

Config **final yang terbukti jalan** (berbeda dari draft awal — lihat catatan di bawah):

```ts
import { defineConfig } from 'mobilewright';
import { config } from './src/config/env.ts'; // ekspensi .ts wajib (Node type-stripping)

export default defineConfig({
  platform: 'ios',
  bundleId: config.bundleId,
  deviceName: /iPhone/,
  testDir: './tests',
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  viewTree: 'on-failure', // ← top-level, BUKAN di use
  use: { actionTimeout: 10_000 },
  expect: { timeout: 10_000 },
});
```

- **Environment management:** loader `src/config/env.ts` — precedence `process.env` > `.env.<TEST_ENV>` > `.env`; variabel `TEST_ENV`, `BUNDLE_ID`, `APP_PATH`, kredensial test. `.env.example` di-commit, file `.env.*` nyata gitignored.
- `npm scripts`: `test`, `test:smoke`, `test:e2e`, `test:regression`, `report`, `list`, `lint`, `lint:fix`, `format`, `typecheck`, `doctor`, `app:build`, `app:install`.
- **Koreksi terhadap draft awal (terverifikasi dari tipe resmi `mobilewright/dist/config.d.ts`):**
  - `viewTree` adalah **top-level** option — tidak ada di `use`.
  - `video` **tidak ada** di config `use` (`MobilewrightUseOptions`); hanya bisa via `test.use({ video: 'retain-on-failure' })`.
  - `animations: 'off'` tidak dipakai (dibiarkan default).
  - Import lokal di config **wajib berekstensi `.ts`** + `allowImportingTsExtensions` di tsconfig, karena config di-load Node ESM type-stripping.

**Verifikasi lulus:** `npm run test:smoke` jalan dengan config & env baru ✅

### Fase 3 — Page Object Model + Fixtures ✅ selesai

1. `BasePage`: abstract — constructor terima `screen`, `abstract get root()`, helper `waitForVisible()`, `screenshot()`.
2. Page objects sesuai layar **nyata** Milliways (hasil `scripts/explore.mjs`): **HomePage** (welcome → "New Order"), **MenuPage** (item per teks + cart button), **ItemDetailPage** (stepper `−/n/+`, "Add to Order"), **CartPage** ("Your Order", total, coupon, "Place Order"), **ConfirmationPage** ("…is on its way!"). Metode berbahasa domain: `openMenu()`, `openItem('Soup of the Day')`, `addToCart()`, `placeOrder()`.
   - _Catatan:_ rencana awal menyebut CheckoutPage/AccountPage — tidak ada di flow demo; "Checkout" ternyata satu layar dengan cart, dan layar terpisah hanya konfirmasi.
3. Custom fixture `src/fixtures/test.ts` (fixture `pages` berisi semua page object):

```ts
import { test as base, expect } from '@mobilewright/test';
import { HomePage } from '../pages/HomePage';
// ... page lain

export const test = base.extend<{ pages: Pages }>({
  pages: async ({ screen }, use) => {
    await use({
      home: new HomePage(screen),
      menu: new MenuPage(screen),
      // ...
    });
  },
});
export { expect };
```

- **`test.use()` harus dipanggil di tiap file spec**, bukan di fixtures (Playwright memperlakukannya sebagai test file — melanggar → error "inconsistent test.use() options").
- App selalu launch segar per test (`autoAppLaunch` default), jadi setiap test dimulai dari HomePage — tidak butuh setup login/serial.

**Verifikasi lulus:** test e2e pertama passed memakai page object ✅

### Fase 4 — Test Suite Contoh (Acceptance) ✅ selesai — 4/4 passed

3 kelompok, **4 test** (jumlah realistis untuk flow demo Milliways; ±10 terlalu banyak untuk 5 layar):

| Kelompok            | Test                                                     | Status                                                         |
| ------------------- | -------------------------------------------------------- | -------------------------------------------------------------- |
| `tests/smoke/`      | App launch → "New Order" → menu termuat                  | ✅ passed                                                      |
| `tests/e2e/`        | Add item → cart → place order → konfirmasi "on its way"  | ✅ passed                                                      |
| `tests/e2e/`        | Multi quantity (stepper +2 → cart baris "3 × ₭28,00")    | ✅ passed                                                      |
| `tests/regression/` | Empty cart Place Order **men-crash app** (bug disengaja) | ✅ `test.fail()` — expected failure, otomatis sinyal perbaikan |

**Verifikasi lulus:** `npx mobilewright test` → 4 passed ✅

### Fase 5 — Reporting & Artefak Kegagalan ✅ selesai (video terverifikasi)

1. HTML reporter: `npx mobilewright test --reporter html` → `mobilewright-report/index.html` → `npm run report` (`show-report`).
2. Otomatis saat gagal: **video** (`retain-on-failure`, terverifikasi ter-attach pada run gagal), **accessibility tree JSON** (`viewTree: 'on-failure'` — terkonfigurasi; terpicu pada failure sesungguhnya, belum terlihat pada `test.fail()` yang dihitung passed), screenshot via fixture `screen` bawaan.
3. **Pelajaran:** `viewTree` hanya menerima `'on-failure' | 'off'` dan harus **top-level** di config.

**Verifikasi lulus:** run gagal menampilkan video di HTML report ✅ (viewTree: lihat catatan di atas)

### Fase 6 — Linting & Formatting ✅ selesai

1. ESLint flat config: `@eslint/js` + `typescript-eslint` + `eslint-plugin-playwright` (untuk files tests/fixtures) + globals Node untuk `scripts/*.mjs`.
2. Prettier: default config + `.prettierignore`.
3. Script: `npm run lint`, `npm run lint:fix`, `npm run format`, `npm run typecheck`.

**Catatan versi:** `@eslint/js` di-pin ke **v9** (v10 bentrok dengan eslint 9), TypeScript di-pin ke **5.9** (typescript-eslint peer `<6.1`).

**Verifikasi lulus:** `npm run lint` + `typecheck` + `format:check` bersih ✅

### Fase 7 — CI/CD GitHub Actions ⏳ menunggu push ke GitHub

`.github/workflows/mobile-tests.yml` (sudah dibuat):

- **Trigger:** `push`/`pull_request` ke `main` + `workflow_dispatch`.
- **Job `lint`** (ubuntu): `npm ci` → lint → format:check → typecheck.
- **Job `ios-tests`** (macos-15): checkout → setup Node 22 → select Xcode → `npm ci` → `mobilewright doctor` → boot simulator → **`npx mobilewright install` (agent — wajib, lihat Fase 1)** → build + install Milliways → `mobilewright test --reporter html,junit` → upload artefak saat failure + junit summary.
- **Catatan:** langkah `xcodebuild -downloadPlatform iOS` dari draft awal **tidak diperlukan** bila runtime sudah termasuk; di GitHub runner perlu dicek saat run pertama (runtime iOS umumnya sudah prebuilt di image `macos-15`).
- **Opsional tahap lanjut:** shard paralel + `merge-reports`.

**Verifikasi lulus:** workflow hijau di GitHub — **belum diverifikasi** (butuh repo di-push).

### Fase 8 — Dokumentasi README

README.md memuat: prasyarat, setup sekali jalan, cara run test/report/lint, struktur direktori, cara **menambah page & test baru**, ganti app target (bundle ID), troubleshooting umum (`mobilewright doctor`, simulator not booted, app tidak ter-install).

## 5. Urutan & Ketergantungan

```
Fase 0 (Xcode) ──► Fase 1 (scaffold + Milliways) ──► Fase 2 (config/env)
                                              └────► Fase 3 (POM) ──► Fase 4 (test suite)
                                                                        │
                                          Fase 5 (report) ◄─────────────┤
                                          Fase 6 (lint) ◄───────────────┤
                                                                        ▼
                                                        Fase 7 (CI) ──► Fase 8 (README)
```

Fase 5 & 6 bisa paralel dengan Fase 4. Fase 7 menyusul setelah suite stabil lokal.

## 6. Risiko & Mitigasi

| Risiko                                                                           | Dampak                            | Mitigasi                                                                                            |
| -------------------------------------------------------------------------------- | --------------------------------- | --------------------------------------------------------------------------------------------------- |
| Xcode belum terpasang (unduhan besar, butuh disk & waktu)                        | Blocker total                     | Fase 0 lebih dulu; siapkan kuota/disk ≥ 40 GB (realita: sisa disk sempit, mepet tapi cukup)         |
| Format build simulator Milliways (`.app` vs `.ipa`) tidak diterima `installApps` | App tidak ter-install otomatis    | ✅ terverifikasi: pakai `simctl install` via `scripts/install-app.sh` (installApps tidak dipakai)   |
| Bundle ID Milliways tidak persis `com.mobilenext.Milliways`                      | Config salah                      | ✅ terverifikasi dari `Info.plist` saat build                                                       |
| Test flaky (animasi, timing)                                                     | CI tidak stabil                   | Auto-waiting bawaan, `retries` di CI, timeout longgar                                               |
| Belum ada app sendiri                                                            | Framework perlu disesuaikan nanti | Config & page object dibuat generik; ganti `bundleId` + map ulang locator saat app sendiri siap     |
| **Agent & app ter-install per-device** — device berganti (simulator baru/reboot) | Semua test gagal `connectDevice`  | Jalankan `npx mobilewright install` + `npm run app:install` lagi; dokumen di README troubleshooting |
| `test.use()` dipanggil di helper fixtures                                        | Error "inconsistent test.use()"   | ✅ terverifikasi: panggil `test.use()` per file spec                                                |

## 7. Acceptance Criteria (Selesai =)

- [x] `npx mobilewright doctor` → semua check hijau (16 ok, 0 error)
- [x] `npx mobilewright test` lokal → **4/4 passed** (smoke + e2e + regression)
- [x] Struktur POM & fixtures sesuai §3; tidak ada locator mentah di `tests/`
- [x] HTML report terbukti memuat video on-failure saat test gagal (bug Milliways tertangkap)
- [x] `npm run lint` & `npm run format` & `npm run typecheck` bersih
- [x] Workflow GitHub Actions dibuat (`.github/workflows/mobile-tests.yml`) — verifikasi hijau menunggu push ke GitHub
- [x] README lengkap (setup → run → tambah test baru)

### Catatan implementasi (18 Nov 2026)

- **Xcode 26.3** terpasang via App Store; `xcode-select` diset + license di-accept; iOS 26.3 runtime + iPhone 17 Pro ter-boot.
- **Milliways** di-build dari source (`make zip`) dan di-install via `simctl install` — bundle ID terkonfirmasi `com.mobilenext.Milliways`.
- **Locator diverifikasi langsung** dari accessibility tree (bukan tebakan) via `scripts/explore.mjs` — beberapa penyesuaian: role `textfield` (bukan `textbox`), cart button berganti nama antara "Shopping Cart" dan angka badge, items Milliways berupa `StaticText` biasa (bukan list/cell).
- **Bug disengaja Milliways ditemukan**: Place Order saat cart kosong men-crash app. Ditangani dengan `test.fail()` — suite tetap hijau dan otomatis memberi sinyal bila bug diperbaiki.
- **TypeScript 5.9** (bukan 7) karena `typescript-eslint` belum mendukung TS 7; `allowImportingTsExtensions` diaktifkan agar config bisa di-load Node type-stripping.
- `test.use({ video: 'retain-on-failure' })` dipanggil **per file spec**, bukan di helper fixtures (aturan Playwright: `test.use()` hanya di test file).

## 8. Referensi

- Docs: https://mobilewright.dev/docs
- GitHub: https://github.com/mobile-next/mobilewright
- API Reference (README): https://github.com/mobile-next/mobilewright#api-reference
- Demo app Milliways: https://github.com/mobile-next/Milliways
- Playwright Test (dasar runner): https://playwright.dev/docs/test-intro
