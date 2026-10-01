import { LIBELLES, type Statut } from '@/lib/statuts';

export function Badge({ statut, retard }: { statut: Statut; retard?: boolean }) {
  const base = 'shrink-0 whitespace-nowrap rounded-[10px] px-2.5 py-1.5 text-xs font-bold';
  if (retard) return <span className={`${base} bg-accent text-white`}>En retard</span>;
  const styles: Record<Statut, string> = {
    recue: 'border border-ligne bg-white text-doux',
    coupe: 'border border-encre bg-white text-encre',
    couture: 'bg-pale text-encre',
    prete: 'bg-vert text-white',
    livree: 'bg-fond text-doux',
  };
  return <span className={`${base} ${styles[statut]}`}>{LIBELLES[statut]}</span>;
}
