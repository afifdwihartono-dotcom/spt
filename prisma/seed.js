// Script ini mengisi database dengan data awal dari SPT.xlsx (sheet "ST").
// Jalankan dengan: npm run seed
// (pastikan DATABASE_URL di .env sudah menunjuk ke database yang benar)

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

function toDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d) ? null : d;
}

async function main() {
  const filePath = path.join(__dirname, '..', 'data', 'seed-data.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  const records = JSON.parse(raw);

  const existing = await prisma.trip.count();
  if (existing > 0) {
    console.log(`Database sudah berisi ${existing} data. Seeding dilewati.`);
    console.log('Hapus data lama terlebih dahulu jika ingin menjalankan ulang seed.');
    return;
  }

  console.log(`Menyiapkan ${records.length} data untuk dimasukkan...`);

  for (const r of records) {
    await prisma.trip.create({
      data: {
        nama: r.nama,
        noST: r.noST || null,
        tglST: toDate(r.tglST),
        acara: r.acara || null,
        tujuan: r.tujuan || null,
        tglBerangkat: toDate(r.tglBerangkat),
        tglPulang: toDate(r.tglPulang),
        kendaraan: r.kendaraan || null,
      },
    });
  }

  console.log(`Selesai! ${records.length} data perjalanan dinas berhasil dimasukkan ke database.`);
}

main()
  .catch((e) => {
    console.error('Gagal menjalankan seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
