'use client';

import { useFormStatus } from 'react-dom';

export function BoutonEnvoi({ children, enCours, className }: { children: React.ReactNode; enCours: string; className: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`${className} disabled:opacity-60`}>
      {pending ? enCours : children}
    </button>
  );
}
