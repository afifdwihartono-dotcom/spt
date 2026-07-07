'use client';

import { useEffect, useMemo, useState } from 'react';
import { PageHeader, StatCard, Loading, ErrorNotice } from '@/components/ui';
import { fmtDate, uniqueSorted, initials } from '@/lib/helpers';

export default function PegawaiPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

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

  const names = useMemo(() => uniqueSorted(trips.map((t) => t.nama)), [trips]);

  useEffect(() => {
    if (!selected && names.length) setSelected(names[0]);
  }, [names, selected]);

  if (loading) return <Loading />;
  if (error) return <ErrorNotice message={error} onRetry={load} />;

  const employeeTrips = selected
    ? trips
        .filter((t) => t.nama === selected)
        .sort((a, b) => (b.tglBerangkat || '').localeCompare(a.tglBerangkat || ''))
    : [];

  const destCount = {};
  employeeTrips.forEach((t) => {
    if (t.tujuan) destCount[t.tujuan] = (destCount[t.tujuan] || 0) + 1;
  });
  const topDests = Object.entries(destCount).sort((a, b) => b[1] - a[1]);
  const lastTrip = employeeTrips[0];

  return (
    <>
      <PageHeader
        eyebrow="Kelola Data"
        title="View Pegawai"
        sub="Lihat riwayat dan rekap perjalanan dinas per pegawai dari hasil input data."
      />

      <div className="employee-picker">
        <select value={selected || ''} onChange={(e) => setSelected(e.target.value)}>
          {names.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      {!selected ? (
        <div className="empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
          </svg>
          <p>Belum ada data pegawai. Tambahkan data melalui menu Input Perjalanan.</p>
        </div>
      ) : (
        <>
          <div className="employee-hero">
            <div className="avatar">{initials(selected)}</div>
            <div>
              <div className="employee-name">{selected}</div>
              <div className="employee-meta">
                {employeeTrips.length} perjalanan tercatat &middot; {topDests.length} tujuan berbeda
              </div>
            </div>
          </div>

          <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <StatCard value={employeeTrips.length} label="Total Perjalanan" />
            <StatCard value={topDests[0] ? topDests[0][0] : '-'} label="Tujuan Tersering" small />
            <StatCard value={lastTrip ? fmtDate(lastTrip.tglBerangkat) : '-'} label="Perjalanan Terakhir" small />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 22 }}>
            <div className="panel">
              <div className="panel-title">Riwayat Perjalanan</div>
              {employeeTrips.length ? (
                <div className="timeline">
                  {employeeTrips.map((r) => (
                    <div key={r.id} className="tl-item">
                      <div className="tl-date">{fmtDate(r.tglBerangkat)}</div>
                      <div className="tl-title">
                        {r.tujuan || '-'} &mdash; {r.acara || '-'}
                      </div>
                      <div className="tl-sub">
                        No. ST: <span className="mono">{r.noST || '-'}</span> &middot; {r.kendaraan || '-'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--slate-soft)', fontSize: 13 }}>Belum ada riwayat.</p>
              )}
            </div>
            <div className="panel">
              <div className="panel-title">Frekuensi Tujuan</div>
              {topDests.length ? (
                topDests.map(([d, c]) => (
                  <div
                    key={d}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '8px 0',
                      borderBottom: '1px solid var(--line)',
                      fontSize: 13,
                    }}
                  >
                    <span>{d}</span>
                    <span style={{ fontWeight: 700, color: 'var(--gold)' }}>{c}x</span>
                  </div>
                ))
              ) : (
                <p style={{ color: 'var(--slate-soft)', fontSize: 13 }}>-</p>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
