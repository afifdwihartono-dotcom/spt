'use client';

import { useEffect, useState } from 'react';
import { PageHeader, StatCard, Loading, ErrorNotice } from '@/components/ui';
import { fmtDate, uniqueSorted } from '@/lib/helpers';

export default function BerandaPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/trips');
      if (!res.ok) throw new Error((await res.json()).error || 'Gagal memuat data');
      setTrips(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <Loading />;
  if (error) return <ErrorNotice message={error} onRetry={load} />;

  const total = trips.length;
  const pegawai = uniqueSorted(trips.map((t) => t.nama)).length;

  const now = new Date();
  const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const bulanIni = trips.filter((t) => t.tglBerangkat && t.tglBerangkat.slice(0, 7) === thisMonthKey).length;

  const destCount = {};
  trips.forEach((t) => {
    if (t.tujuan) destCount[t.tujuan] = (destCount[t.tujuan] || 0) + 1;
  });
  const destRows = Object.entries(destCount).sort((a, b) => b[1] - a[1]);
  const topDest = destRows[0];
  const maxDest = destRows.length ? destRows[0][1] : 1;

  const recent = trips
    .slice()
    .sort((a, b) => (b.tglBerangkat || '').localeCompare(a.tglBerangkat || ''))
    .slice(0, 8);

  return (
    <>
      <PageHeader
        eyebrow="Ringkasan"
        title="Beranda"
        sub="Ikhtisar data perjalanan dinas pegawai berdasarkan Surat Tugas (ST) yang tercatat."
      />

      <div className="stat-grid">
        <StatCard value={total} label="Total Perjalanan Dinas" />
        <StatCard value={pegawai} label="Pegawai Tercatat" />
        <StatCard value={bulanIni} label="Perjalanan Bulan Ini" />
        <StatCard
          value={topDest ? topDest[0] : '-'}
          label={`Tujuan Terpopuler ${topDest ? `(${topDest[1]}x)` : ''}`}
          small
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 22 }}>
        <div className="panel">
          <div className="panel-title">
            Perjalanan Terbaru <small>8 entri terakhir</small>
          </div>
          <table>
            <thead>
              <tr>
                <th>Nama</th>
                <th>Tujuan</th>
                <th>Berangkat</th>
                <th>No. ST</th>
              </tr>
            </thead>
            <tbody>
              {recent.length ? (
                recent.map((r) => (
                  <tr key={r.id}>
                    <td>{r.nama}</td>
                    <td>
                      <span className="tag dest">{r.tujuan || '-'}</span>
                    </td>
                    <td>{fmtDate(r.tglBerangkat)}</td>
                    <td className="mono">{r.noST || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: 'var(--slate-soft)', padding: 24 }}>
                    Belum ada data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="panel">
          <div className="panel-title">Distribusi Tujuan</div>
          {destRows.length ? (
            destRows.slice(0, 6).map(([dest, count]) => (
              <div key={dest} style={{ marginBottom: 11 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 4 }}>
                  <span>{dest}</span>
                  <span style={{ color: 'var(--slate)' }}>{count}</span>
                </div>
                <div style={{ background: '#EFEBE1', borderRadius: 6, height: 7, overflow: 'hidden' }}>
                  <div
                    style={{
                      background: 'var(--gold)',
                      height: '100%',
                      width: `${((count / maxDest) * 100).toFixed(0)}%`,
                    }}
                  />
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: 'var(--slate-soft)', fontSize: 13 }}>Belum ada data.</p>
          )}
        </div>
      </div>
    </>
  );
}
