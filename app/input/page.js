'use client';

import { useEffect, useMemo, useState } from 'react';
import { PageHeader, Loading, ErrorNotice, EmptyState } from '@/components/ui';
import { fmtDate, toDateInputValue, uniqueSorted } from '@/lib/helpers';

const KENDARAAN_OPTIONS = ['Kendaraan Sewa', 'Kendaraan Pribadi', 'Pribadi', 'Kereta', 'Kendaraan Dinas'];

const EMPTY_FORM = {
  nama: '',
  noST: '',
  tglST: '',
  acara: '',
  tujuan: '',
  kendaraan: KENDARAAN_OPTIONS[0],
  tglBerangkat: '',
  tglPulang: '',
};

export default function InputPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState('');
  const [filterTujuan, setFilterTujuan] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

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

  const tujuanOptions = useMemo(() => uniqueSorted(trips.map((t) => t.tujuan)), [trips]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return trips
      .filter((r) => {
        const matchQ = !q || [r.nama, r.tujuan, r.acara, r.noST].some((f) => (f || '').toLowerCase().includes(q));
        const matchT = !filterTujuan || r.tujuan === filterTujuan;
        return matchQ && matchT;
      })
      .sort((a, b) => (b.tglBerangkat || '').localeCompare(a.tglBerangkat || ''));
  }, [trips, search, filterTujuan]);

  function openAddModal() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  function openEditModal(r) {
    setEditingId(r.id);
    setForm({
      nama: r.nama || '',
      noST: r.noST || '',
      tglST: toDateInputValue(r.tglST),
      acara: r.acara || '',
      tujuan: r.tujuan || '',
      kendaraan: r.kendaraan || KENDARAAN_OPTIONS[0],
      tglBerangkat: toDateInputValue(r.tglBerangkat),
      tglPulang: toDateInputValue(r.tglPulang),
    });
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;
    setModalOpen(false);
    setEditingId(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingId ? `/api/trips/${editingId}` : '/api/trips';
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Gagal menyimpan data');
      await load();
      setModalOpen(false);
      setEditingId(null);
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Hapus data perjalanan dinas ini?')) return;
    try {
      const res = await fetch(`/api/trips/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).error || 'Gagal menghapus data');
      setTrips((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      alert(e.message);
    }
  }

  if (loading) return <Loading />;
  if (error) return <ErrorNotice message={error} onRetry={load} />;

  return (
    <>
      <PageHeader
        eyebrow="Kelola Data"
        title="Input Perjalanan Dinas"
        sub="Tambah, ubah, atau hapus catatan Surat Tugas (ST) perjalanan dinas pegawai."
      />

      <div className="toolbar">
        <div className="search-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Cari nama, tujuan, acara, atau no. ST..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="filter" value={filterTujuan} onChange={(e) => setFilterTujuan(e.target.value)}>
          <option value="">Semua Tujuan</option>
          {tujuanOptions.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <button className="btn" onClick={openAddModal}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Tambah Data
        </button>
      </div>

      <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ maxHeight: 'calc(100vh - 300px)', overflow: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Pegawai</th>
                <th>No. ST</th>
                <th>Tgl ST</th>
                <th>Acara / Keperluan</th>
                <th>Tujuan</th>
                <th>Berangkat</th>
                <th>Pulang</th>
                <th>Kendaraan</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length ? (
                filtered.map((r, i) => (
                  <tr key={r.id}>
                    <td>{i + 1}</td>
                    <td>
                      <strong>{r.nama}</strong>
                    </td>
                    <td className="mono">{r.noST || '-'}</td>
                    <td>{fmtDate(r.tglST)}</td>
                    <td style={{ maxWidth: 260 }}>{r.acara || '-'}</td>
                    <td>
                      <span className="tag dest">{r.tujuan || '-'}</span>
                    </td>
                    <td>{fmtDate(r.tglBerangkat)}</td>
                    <td>{fmtDate(r.tglPulang)}</td>
                    <td>{r.kendaraan || '-'}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <button className="icon-btn" onClick={() => openEditModal(r)}>
                        Ubah
                      </button>{' '}
                      <button
                        className="icon-btn"
                        style={{ color: 'var(--red)', borderColor: '#EFD2CC' }}
                        onClick={() => handleDelete(r.id)}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10}>
                    <EmptyState message="Tidak ada data yang cocok. Coba ubah pencarian atau filter." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target.classList.contains('modal-overlay')) closeModal();
          }}
        >
          <div className="modal">
            <div className="modal-head">
              <h3>{editingId ? 'Ubah Data Perjalanan' : 'Tambah Data Perjalanan'}</h3>
              <button className="modal-close" onClick={closeModal}>
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="field-grid">
                <div className="field full">
                  <label>Nama Pegawai</label>
                  <input
                    required
                    value={form.nama}
                    onChange={(e) => setForm({ ...form, nama: e.target.value })}
                    placeholder="cth. Rizki Narwidina, S.T., M.Sc."
                  />
                </div>
                <div className="field">
                  <label>No. ST</label>
                  <input
                    value={form.noST}
                    onChange={(e) => setForm({ ...form, noST: e.target.value })}
                    placeholder="0003/ST/Bp8.5/2026"
                  />
                </div>
                <div className="field">
                  <label>Tanggal ST</label>
                  <input
                    type="date"
                    value={form.tglST}
                    onChange={(e) => setForm({ ...form, tglST: e.target.value })}
                  />
                </div>
                <div className="field full">
                  <label>Acara / Keperluan</label>
                  <textarea
                    value={form.acara}
                    onChange={(e) => setForm({ ...form, acara: e.target.value })}
                    placeholder="Deskripsi acara atau keperluan perjalanan"
                  />
                </div>
                <div className="field">
                  <label>Tujuan</label>
                  <input
                    required
                    value={form.tujuan}
                    onChange={(e) => setForm({ ...form, tujuan: e.target.value })}
                    placeholder="cth. Sleman"
                  />
                </div>
                <div className="field">
                  <label>Kendaraan</label>
                  <select value={form.kendaraan} onChange={(e) => setForm({ ...form, kendaraan: e.target.value })}>
                    {KENDARAAN_OPTIONS.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Tanggal Berangkat</label>
                  <input
                    required
                    type="date"
                    value={form.tglBerangkat}
                    onChange={(e) => setForm({ ...form, tglBerangkat: e.target.value })}
                  />
                </div>
                <div className="field">
                  <label>Tanggal Pulang</label>
                  <input
                    type="date"
                    value={form.tglPulang}
                    onChange={(e) => setForm({ ...form, tglPulang: e.target.value })}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
                <button type="button" className="btn secondary" onClick={closeModal} disabled={saving}>
                  Batal
                </button>
                <button type="submit" className="btn" disabled={saving}>
                  {saving ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Simpan Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
