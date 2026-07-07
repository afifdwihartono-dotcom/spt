'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  {
    group: 'Ringkasan',
    items: [
      {
        href: '/',
        label: 'Beranda',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 11l9-8 9 8" />
            <path d="M5 10v10h14V10" />
          </svg>
        ),
      },
    ],
  },
  {
    group: 'Kelola Data',
    items: [
      {
        href: '/input',
        label: 'Input Perjalanan',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
        ),
      },
      {
        href: '/matriks',
        label: 'Matriks',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
          </svg>
        ),
      },
      {
        href: '/pegawai',
        label: 'View Pegawai',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
          </svg>
        ),
      },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="stamp">
          <span>ST</span>
        </div>
        <div className="brand-text">
          <div className="t1">Perjalanan Dinas</div>
          <div className="t2">Satker Perumahan DIY</div>
        </div>
      </div>

      <div className="nav">
        {NAV_ITEMS.map((section) => (
          <div key={section.group}>
            <div className="nav-label">{section.group}</div>
            {section.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item${pathname === item.href ? ' active' : ''}`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        Data tersimpan di database dan dapat diakses oleh seluruh pengguna dashboard ini.
      </div>
    </aside>
  );
}
