import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function toDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d) ? null : d;
}

// PUT /api/trips/:id -> ubah data perjalanan dinas
export async function PUT(request, { params }) {
  try {
    const body = await request.json();

    if (!body.nama || !body.nama.trim()) {
      return NextResponse.json({ error: 'Nama pegawai wajib diisi.' }, { status: 400 });
    }

    const trip = await prisma.trip.update({
      where: { id: params.id },
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

    return NextResponse.json(trip);
  } catch (err) {
    console.error('PUT /api/trips/[id] error:', err);
    return NextResponse.json({ error: 'Gagal memperbarui data. Data mungkin tidak ditemukan.' }, { status: 500 });
  }
}

// DELETE /api/trips/:id -> hapus data perjalanan dinas
export async function DELETE(request, { params }) {
  try {
    await prisma.trip.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('DELETE /api/trips/[id] error:', err);
    return NextResponse.json({ error: 'Gagal menghapus data. Data mungkin tidak ditemukan.' }, { status: 500 });
  }
}
