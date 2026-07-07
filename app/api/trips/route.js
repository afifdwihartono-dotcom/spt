import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function toDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d) ? null : d;
}

// GET /api/trips -> ambil semua data perjalanan dinas
export async function GET() {
  try {
    const trips = await prisma.trip.findMany({
      orderBy: { tglBerangkat: 'desc' },
    });
    return NextResponse.json(trips);
  } catch (err) {
    console.error('GET /api/trips error:', err);
    return NextResponse.json(
      { error: 'Gagal mengambil data. Pastikan DATABASE_URL sudah benar dan migrasi sudah dijalankan.' },
      { status: 500 }
    );
  }
}

// POST /api/trips -> tambah data perjalanan dinas baru
export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.nama || !body.nama.trim()) {
      return NextResponse.json({ error: 'Nama pegawai wajib diisi.' }, { status: 400 });
    }

    const trip = await prisma.trip.create({
      data: {
        nama: body.nama.trim(),
        noST: body.noST || null,
        tglST: toDate(body.tglST),
        acara: body.acara || null,
        tujuan: body.tujuan || null,
        tglBerangkat: toDate(body.tglBerangkat),
        tglPulang: toDate(body.tglPulang),
        kendaraan: body.kendaraan || null,
      },
    });

    return NextResponse.json(trip, { status: 201 });
  } catch (err) {
    console.error('POST /api/trips error:', err);
    return NextResponse.json({ error: 'Gagal menyimpan data.' }, { status: 500 });
  }
}
