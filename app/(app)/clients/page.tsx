import Link from 'next/link';
import { getAtelier } from '@/lib/atelier';
import { initiales } from '@/lib/format';
import { creerClient } from '@/app/actions';
import { BoutonEnvoi } from '@/components/BoutonEnvoi';

export default async function Clients({ searchParams }: { searchParams: { q?: string } }) {
  const { supabase, atelier } = await getAtelier();
  let requete = supabase.from('clients').select('id, nom, telephone').eq('atelier_id', atelier.id).order('nom');
  const q = (searchParams.q ?? '').trim();
  if (q) requete = requete.or(`nom.ilike.%${q.replace(/[%,()]/g, '')}%,telephone.ilike.%${q.replace(/[%,()]/g, '')}%`);
  const { data: clients } = await requete;

  return (
    <main className="flex flex-col gap-4 px-5 pt-6">
      <h1 className="font-titre text-[26px] font-bold">Clients</h1>

      <form className="flex h-12 items-center gap-2.5 rounded-xl border border-[#D9DEEA] bg-white px-3.5">
        <label htmlFor="q" className="sr-only">Rechercher un client</label>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5B6480" strokeWidth="2" strokeLinecap="round" aria-hidden><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
        <input id="q" name="q" defaultValue={q} placeholder="Nom ou téléphone" className="flex-1 bg-transparent text-[15px] outline-none" />
      </form>

      <details className="carte p-4">
        <summary className="cursor-pointer font-semibold text-encre">Ajouter un client</summary>
        <form action={creerClient} className="mt-3 flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="nom" className="etiquette">Nom</label>
            <input id="nom" name="nom" required className="champ" />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="telephone" className="etiquette">Téléphone</label>
              <input id="telephone" name="telephone" type="tel" inputMode="tel" className="champ" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="genre" className="etiquette">Mesures</label>
              <select id="genre" name="genre" className="champ">
                <option value="homme">Homme</option>
                <option value="femme">Femme</option>
              </select>
            </div>
          </div>
          <BoutonEnvoi enCours="Ajout…" className="bouton bg-encre text-white">Ajouter et prendre les mesures</BoutonEnvoi>
        </form>
      </details>

      <ul className="flex flex-col gap-2">
        {(clients ?? []).map((c) => (
          <li key={c.id}>
            <Link href={`/clients/${c.id}`} className="carte flex items-center gap-3 p-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-pale font-bold text-encre">{initiales(c.nom)}</span>
              <span className="flex flex-col">
                <span className="font-semibold">{c.nom}</span>
                {c.telephone && <span className="text-[13px] text-doux">{c.telephone}</span>}
              </span>
            </Link>
          </li>
        ))}
        {clients?.length === 0 && (
          <li className="text-sm text-doux">{q ? 'Aucun client trouvé.' : 'Aucun client pour l’instant. Ajoutez-en un ci-dessus.'}</li>
        )}
      </ul>
    </main>
  );
}
