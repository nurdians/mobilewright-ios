# Mobilewright iOS — Automation Test Framework

Framework otomasi tes mobile end-to-end untuk iOS, berbasis [Mobilewright](https://mobilewright.dev) (Playwright-style API) dengan TypeScript.

## Prasyarat

- **Node.js ≥ 22.12**
- **Xcode** + iOS Simulator (sudah terpasang di mesin ini: Xcode 26.3)
- Demo app **Milliways** (di-clone otomatis oleh `npm run app:build`)

Cek kapan saja:

```bash
npm run doctor        # = npx mobilewright doctor
```

## Setup

```bash
npm install
npm run app:build     # clone + build Milliways untuk simulator
npm run app:install   # install .app ke simulator yang sedang booted
```

## Menjalankan Test

```bash
npm test              # semua test
npm run test:smoke    # smoke saja
npm run test:e2e      # e2e flow
npm run test:regression
npm run report        # buka HTML report terakhir
npm run list          # list tanpa menjalankan
```

## Struktur

```
├── mobilewright.config.ts     # konfigurasi utama (platform, bundleId, reporter)
├── src/
│   ├── config/env.ts          # loader .env per environment (staging/production)
│   ├── pages/                 # Page Objects — semua locator & aksi ada di sini
│   ├── fixtures/test.ts       # test + expect + fixture `pages`
│   └── data/                  # test data terpusat (users, products)
├── tests/
│   ├── smoke/                 # sanity checks
│   ├── e2e/                   # happy path lengkap
│   └── regression/            # edge cases
└── scripts/                   # build & install app
```

### Prinsip

1. **`tests/`** hanya berisi orkestrasi & asersi — **tidak ada locator mentah**.
2. Semua locator di **`src/pages/`** — satu file per layar.
3. Prioritas locator: `getByTestId` > `getByRole` > `getByLabel` > `getByText`.
4. Test data dari **`src/data/`**, kredensial dari **`.env`**.

## Cara Menambah Test Baru

1. Buka layar terkait di simulator, jalankan `npx mobilewright inspect` untuk melihat locator.
2. Tambah/ubah page object di `src/pages/` (atau buat baru, extend `BasePage`).
3. Daftarkan di `src/fixtures/test.ts` bila page baru.
4. Buat file spec di `tests/<kategori>/`:

```ts
import { test, expect } from '../../src/fixtures/test';

test('my scenario', async ({ pages }) => {
  await pages.menu.waitForVisible();
  // ...
});
```

5. Jalankan `npm test`.

## Environment Management

- Template: `.env.example` → salin jadi `.env` (default) / `.env.staging` / `.env.production`
- Pilih environment: `TEST_ENV=production npm test`
- Baca nilai di test lewat `import { config } from '../src/config/env'`

## Ganti Aplikasi Target

Ubah `BUNDLE_ID` di `.env` (atau default di `src/config/env.ts`). Sesuaikan locator page objects dengan app baru — gunakan `npx mobilewright inspect`.

## Lint & Format

```bash
npm run lint          # ESLint
npm run lint:fix
npm run format        # Prettier
npm run typecheck     # tsc --noEmit
```

## CI

GitHub Actions (`.github/workflows/mobile-tests.yml`): lint di Ubuntu, test di `macos-15` dengan simulator + build Milliways. Report & artefak di-upload saat gagal.

## Troubleshooting

| Masalah                                                        | Solusi                                                                                     |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `mobilewright doctor` merah                                    | Ikuti perintah perbaikan yang ditampilkan (Xcode, runtime, dll.)                           |
| Simulator tidak ditemukan                                      | `xcrun simctl boot "iPhone 16"` lalu `xcrun simctl list devices booted`                    |
| Gagal `connectDevice` / "Agent is not installed on the device" | `npx mobilewright install` — agent ter-install **per-device**; ulangi bila device berganti |
| App tidak ter-install / test tidak menemukan app               | `npm run app:build && npm run app:install` (juga per-device)                               |
| Test flaky                                                     | Cek video/screenshot di report (`npm run report`); tambah `--retries 2`                    |

## Referensi

- Docs: https://mobilewright.dev/docs
- GitHub: https://github.com/mobile-next/mobilewright
- Demo app: https://github.com/mobile-next/Milliways
- Rencana lengkap: [PLAN.md](./PLAN.md)
