import Link from 'next/link';

export function Retour({ href, label = 'Retour' }: { href: string; label?: string }) {
  return (
    <Link href={href} aria-label={label} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ligne bg-white">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m15 18-6-6 6-6" /></svg>
    </Link>
  );
}
