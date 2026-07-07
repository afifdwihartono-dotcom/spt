# Dashboard Matriks Perjalanan Dinas

Dashboard untuk mengelola data perjalanan dinas pegawai (Surat Tugas / ST), lengkap dengan backend (Next.js API Routes + Prisma + PostgreSQL) sehingga data tersimpan permanen di database, bukan hanya di browser.

Sudah terisi data awal dari `SPT.xlsx` (212 catatan perjalanan dinas).

**Menu:**
- **Beranda** — ringkasan statistik (total perjalanan, jumlah pegawai, tujuan terpopuler, dll)
- **Input Perjalanan** — tambah / ubah / hapus data (CRUD penuh ke database)
- **Matriks** — rekap jumlah perjalanan tiap pegawai per bulan (heatmap), per tahun
- **View Pegawai** — riwayat & statistik perjalanan per pegawai

## Teknologi

- **Next.js 14** (App Router) — frontend sekaligus backend (API routes)
- **Prisma ORM** — akses database
- **PostgreSQL** — database (disarankan pakai [Neon](https://neon.tech) atau [Supabase](https://supabase.com), keduanya gratis untuk skala kecil dan langsung kompatibel dengan Vercel)

---

## 1. Jalankan di komputer lokal

### a. Install dependencies

```bash
npm install
```

### b. Siapkan database PostgreSQL gratis

1. Buat akun di **[neon.tech](https://neon.tech)** (atau supabase.com).
2. Buat project/database baru.
3. Salin **connection string** yang diberikan (formatnya seperti `postgresql://user:password@host/dbname?sslmode=require`).

### c. Atur environment variable

```bash
cp .env.example .env
```

Buka file `.env`, lalu isi `DATABASE_URL` dengan connection string dari langkah sebelumnya.

### d. Buat tabel di database (migrasi)

```bash
npx prisma migrate dev --name init
```

Perintah ini akan membuat tabel `Trip` di database sesuai `prisma/schema.prisma`.

### e. Isi data awal (seed) dari SPT.xlsx

```bash
npm run seed
```

Ini akan memasukkan 212 data perjalanan dinas yang sudah diekstrak dari file Excel (`data/seed-data.json`).

### f. Jalankan aplikasi

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

---

## 2. Upload ke GitHub

```bash
git init
git add .
git commit -m "Dashboard perjalanan dinas - initial commit"
```

Buat repository baru di GitHub (tanpa README/gitignore, karena sudah ada), lalu:

```bash
git remote add origin https://github.com/USERNAME/NAMA-REPO.git
git branch -M main
git push -u origin main
```

> File `.env` **tidak akan ikut ter-upload** (sudah ada di `.gitignore`) — ini penting supaya kredensial database tidak bocor ke publik.

---

## 3. Deploy ke Vercel

1. Buka [vercel.com](https://vercel.com) dan login (bisa langsung pakai akun GitHub).
2. Klik **Add New → Project**, lalu pilih repository yang baru saja di-push.
3. Saat konfigurasi project, buka bagian **Environment Variables**, tambahkan:
   - `DATABASE_URL` = connection string database yang sama seperti di `.env`
   
   (Kalau memakai Neon, disarankan pakai connection string versi **"pooled connection"** yang disediakan Neon, agar cocok dengan lingkungan serverless Vercel.)
4. Klik **Deploy**. Vercel otomatis menjalankan `npm install` lalu `npm run build` (yang sudah termasuk `prisma generate`).
5. Setelah deploy pertama selesai, jalankan migrasi ke database production **sekali saja** dari komputer lokal (arahkan `DATABASE_URL` di `.env` ke database yang sama dipakai Vercel):
   ```bash
   npx prisma migrate deploy
   npm run seed
   ```
6. Selesai — buka domain `.vercel.app` yang diberikan Vercel, dashboard sudah aktif dan tersambung ke database.

Setiap kali ada perubahan skema (`prisma/schema.prisma`), jalankan `npx prisma migrate dev` secara lokal untuk membuat file migrasi baru, commit & push — Vercel hanya menjalankan migrasi yang sudah ada (`migrate deploy`), bukan membuatnya secara otomatis.

---

## Struktur Project

```
app/
  page.js              → Halaman Beranda
  input/page.js         → Halaman Input Perjalanan
  matriks/page.js        → Halaman Matriks
  pegawai/page.js        → Halaman View Pegawai
  api/trips/route.js     → API: GET (list) & POST (tambah)
  api/trips/[id]/route.js → API: PUT (ubah) & DELETE (hapus)
  layout.js              → Layout utama + sidebar
  globals.css            → Semua styling
components/
  Sidebar.js             → Navigasi sidebar
  ui.js                  → Komponen kecil (PageHeader, StatCard, dll)
lib/
  prisma.js              → Koneksi Prisma client
  helpers.js             → Fungsi format tanggal, dll
prisma/
  schema.prisma          → Struktur tabel database
  seed.js                → Script pengisi data awal
data/
  seed-data.json          → Data hasil ekstraksi dari SPT.xlsx
```

## Catatan

- Semua pengguna yang mengakses dashboard ini berbagi database yang sama — cocok untuk dipakai bersama tim/kantor.
- Untuk menambah kolom baru di form input, ubah tiga tempat: `prisma/schema.prisma` (tambah field lalu `npx prisma migrate dev`), `app/api/trips/route.js` & `app/api/trips/[id]/route.js` (tambahkan field di `data: {...}`), dan form di `app/input/page.js`.
