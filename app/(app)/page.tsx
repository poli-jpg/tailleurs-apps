import Link from 'next/link';
import { BandeauAbonnement } from '@/components/BandeauAbonnement';
import { getAtelier } from '@/lib/atelier';
import { aujourdhui, dansNJours, dateCourte, fcfa, initiales } from '@/lib/format';
import { estEnRetard, type Statut } from '@/lib/statuts';
import { Badge } from '@/components/Badge';

type Ligne = {
  id: string;
  numero: number;
  modele: string;
  statut: Statut;
  date_livraison: string | null;
  client_nom: string;
  reste: number;
};

const FILTRES = [
  { cle: 'toutes', libelle: 'Toutes' },
  { cle: 'en-cours', libelle: 'En cours' },
  { cle: 'pretes', libelle: 'Prêtes' },
  { cle: 'retard', libelle: 'En retard' },
] as const;

export default async function Accueil({ searchParams }: { searchParams: { filtre?: string; q?: string } }) {
  const { supabase, atelier } = await getAtelier();
  const { data } = await supabase
    .from('commandes_resume')
    .select('id, numero, modele, statut, date_livraison, client_nom, reste')
    .eq('atelier_id', atelier.id)
    .neq('statut', 'livree')
    .order('date_livraison', { ascending: true, nullsFirst: false });

  const commandes = (data ?? []) as Ligne[];
  const jour = aujourdhui();
  const semaine = dansNJours(7);

  const aLivrer = commandes.filter((c) => c.date_livraison && c.date_livraison >= jour && c.date_livraison <= semaine).length;
  const enRetard = commandes.filter((c) => estEnRetard(c.statut, c.date_livraison, jour)).length;
  const aEncaisser = commandes.reduce((s, c) => s + c.reste, 0);

  const filtre = searchParams.filtre ?? 'toutes';
  const q = (searchParams.q ?? '').trim().toLowerCase();
  const visibles = commandes.filter((c) => {
    if (q && !`${c.client_nom} ${c.modele} ${c.numero}`.toLowerCase().includes(q)) return false;
    if (filtre === 'en-cours') return c.statut !== 'prete';
    if (filtre === 'pretes') return c.statut === 'prete';
    if (filtre === 'retard') return estEnRetard(c.statut, c.date_livraison, jour);
    return true;
  });

  return (
    <main>
      <header className="flex flex-col gap-5 bg-encre px-5 pb-6 pt-7 text-white">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[13px] text-[#C9D0E8]">{atelier.nom}</span>
            <h1 className="font-titre text-[26px] font-bold">Vos commandes</h1>
          </div>
                                 <Link href="/compte" aria-label="Mon compte" className="flex h-11 w-11 items-center justify-center rounded-full border border-[#3A4778]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" /></svg>
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col gap-1 rounded-[14px] bg-encre-2 p-3">
            <span className="font-titre text-[26px] font-bold">{aLivrer}</span>
            <span className="text-xs leading-tight text-[#D4DAF0]">À livrer cette semaine</span>
          </div>
          <Link href="/?filtre=retard" className={`flex flex-col gap-1 rounded-[14px] p-3 ${enRetard ? 'bg-accent' : 'bg-encre-2'}`}>
            <span className="font-titre text-[26px] font-bold">{enRetard}</span>
            <span className="text-xs leading-tight">En retard</span>
          </Link>
          <div className="flex flex-col gap-1 rounded-[14px] bg-encre-2 p-3">
            <span className="font-titre text-xl font-bold leading-8">{fcfa(aEncaisser)}</span>
            <span className="text-xs leading-tight text-[#D4DAF0]">Reste à encaisser</span>
          </div>
        </div>
      </header>

      <BandeauAbonnement atelier={atelier} />

      <div className="flex flex-col gap-3 px-5 pt-4">
        <form className="flex h-12 items-center gap-2.5 rounded-xl border border-[#D9DEEA] bg-white px-3.5">
          <label htmlFor="q" className="sr-only">Rechercher un client ou une commande</label>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5B6480" strokeWidth="2" strokeLinecap="round" aria-hidden><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <input id="q" name="q" defaultValue={searchParams.q} placeholder="Rechercher un client ou une commande" className="flex-1 bg-transparent text-[15px] outline-none" />
          {filtre !== 'toutes' && <input type="hidden" name="filtre" value={filtre} />}
        </form>
        <div className="flex gap-2 overflow-x-auto">
          {FILTRES.map((f) => (
            <Link key={f.cle} href={f.cle === 'toutes' ? '/' : `/?filtre=${f.cle}`} className={`puce shrink-0 ${filtre === f.cle ? 'puce-active' : ''}`}>
              {f.libelle}
            </Link>
          ))}
        </div>
      </div>

            <section className="mt-5 flex flex-col divide-y divide-ligne border-y border-ligne bg-white">
        {visibles.length === 0 ? (
          <div className="flex flex-col items-start gap-3 p-5">
            <p className="font-semibold">{commandes.length === 0 ? 'Aucune commande pour l’instant' : 'Aucune commande ici'}</p>
            <p className="text-sm text-doux">
              {commandes.length === 0 ? 'Enregistrez votre première commande : client, modèle, prix et date de livraison.' : 'Changez de filtre ou de recherche.'}
            </p>
            {commandes.length === 0 && (
              <Link href="/commandes/nouvelle" className="rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white">Nouvelle commande</Link>
            )}
          </div>
        ) : (
          visibles.map((c) => (
            <Link key={c.id} href={`/commandes/${c.id}`} className="flex items-center gap-3 px-5 py-3.5 active:bg-fond">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pale font-bold text-encre">{initiales(c.client_nom)}</span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate text-[15px] font-semibold">{c.client_nom}</span>
                <span className="truncate text-[13px] text-doux">{c.modele}</span>
                <span className="text-[13px] text-doux">
                  {dateCourte(c.date_livraison)}
                  {c.reste > 0 ? `, reste ${fcfa(c.reste)}` : ', payée'}
                </span>
              </span>
              <Badge statut={c.statut} retard={estEnRetard(c.statut, c.date_livraison, jour)} />
            </Link>
          ))
        )}
      </section>
    </main>
  );
}
