'use client';

import { useEffect, useMemo, useState } from 'react';
import { PageHeader, Loading, ErrorNotice } from '@/components/ui';
import { MONTHS, uniqueSorted, monthIndex, yearOf } from '@/lib/helpers';

export default function MatriksPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [year, setYear] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/trips');
      if (!res.ok) throw new Error((await res.json()).error || 'Gagal memuat data');
      const data = await res.json();
      setTrips(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const years = useMemo(() => {
    const ys = uniqueSorted(trips.map((t) => yearOf(t.tglBerangkat || t.tglST)));
    return ys.length ? ys : [String(new Date().getFullYear())];
  }, [trips]);

  useEffect(() => {
    if (!year || !years.includes(year)) setYear(years[years.length - 1]);
  }, [years, year]);

  if (loading) return <Loading />;
  if (error) return <ErrorNotice message={error} onRetry={load} />;

  const activeYear = year || years[years.length - 1];
  const filtered = trips.filter((t) => yearOf(t.tglBerangkat) === activeYear);
  const names = uniqueSorted(filtered.map((t) => t.nama));

  const grid = {};
  names.forEach((n) => (grid[n] = Array(12).fill(0)));
  filtered.forEach((t) => {
    const m = monthIndex(t.tglBerangkat);
    if (m !== null && grid[t.nama]) grid[t.nama][m]++;
  });

  const colTotals = Array(12).fill(0);
  names.forEach((n) => grid[n].forEach((v, i) => (colTotals[i] += v)));
  const grandTotal = colTotals.reduce((a, b) => a + b, 0);
  const maxVal = Math.max(1, ...names.map((n) => Math.max(...grid[n])));

  function heatStyle(v) {
    if (v === 0) return undefined;
    const intensity = Math.min(1, v / maxVal);
    const alpha = 0.15 + intensity * 0.55;
    return {
      background: `rgba(184,134,59,${alpha.toFixed(2)})`,
      color: intensity > 0.55 ? '#fff' : '#5B4419',
    };
  }

  return (
    <>
      <PageHeader
        eyebrow="Kelola Data"
        title="Matriks Perjalanan Dinas"
        sub="Rekap jumlah perjalanan dinas tiap pegawai per bulan, disusun dari tanggal keberangkatan."
      />

      <div className="pill-row">
        {years.map((y) => (
          <div key={y} className={`pill${y === activeYear ? ' active' : ''}`} onClick={() => setYear(y)}>
            {y}
          </div>
        ))}
      </div>

      <div className="panel">
        <div className="panel-title">
          Rekap {activeYear}{' '}
          <small>
            {names.length} pegawai &middot; {grandTotal} perjalanan
          </small>
        </div>
        <div className="matrix-wrap">
          <table className="matrix-table">
            <thead>
              <tr>
                <th style={{ position: 'sticky', left: 0, background: '#FBFAF7' }}>Pegawai</th>
                {MONTHS.map((m) => (
                  <th key={m}>{m}</th>
                ))}
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {names.length ? (
                names.map((n) => {
                  const row = grid[n];
                  const total = row.reduce((a, b) => a + b, 0);
                  return (
                    <tr key={n}>
                      <td className="name-cell">{n}</td>
                      {row.map((v, i) => (
                        <td key={i} style={heatStyle(v)}>
                          {v ? <span className="heat">{v}</span> : <span style={{ color: '#D9D2C2' }}>–</span>}
                        </td>
                      ))}
                      <td className="total-cell">{total}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={14} style={{ textAlign: 'center', color: 'var(--slate-soft)', padding: 24 }}>
                    Belum ada data untuk tahun ini
                  </td>
                </tr>
              )}
            </tbody>
            {names.length > 0 && (
              <tfoot>
                <tr className="total-row">
                  <td className="name-cell">Total</td>
                  {colTotals.map((v, i) => (
                    <td key={i}>{v || '–'}</td>
                  ))}
                  <td className="total-cell">{grandTotal}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </>
  );
}
