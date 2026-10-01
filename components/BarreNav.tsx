'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const lien = 'flex h-[52px] flex-col items-center justify-center gap-1 text-[11px]';

export function BarreNav() {
  const p = usePathname();
  const actif = (ok: boolean) => (ok ? 'font-bold text-encre' : 'text-[#5B6480]');
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-ligne bg-white pb-[max(env(safe-area-inset-bottom),10px)] pt-2">
      <div className="mx-auto grid max-w-md grid-cols-3 items-center px-3">
        <Link href="/" className={`${lien} ${actif(p === '/' || p.startsWith('/commandes/') && p !== '/commandes/nouvelle')}`}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M9 4h6l1 2h3v14H5V6h3z" /><path d="M9 12h6M9 16h4" /></svg>
          Commandes
        </Link>
        <Link href="/commandes/nouvelle" aria-label="Nouvelle commande" className="flex h-14 w-14 items-center justify-center justify-self-center rounded-full bg-accent text-white">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden><path d="M12 5v14M5 12h14" /></svg>
        </Link>
        <Link href="/clients" className={`${lien} ${actif(p.startsWith('/clients'))}`}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><circle cx="9" cy="8" r="4" /><path d="M2 21c0-4 3-6 7-6s7 2 7 6" /><path d="M17 4a4 4 0 0 1 0 8M22 21c0-3-1.5-5-4-5.7" /></svg>
          Clients
        </Link>
      </div>
    </nav>
  );
}
