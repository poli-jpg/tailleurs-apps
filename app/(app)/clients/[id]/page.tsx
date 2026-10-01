import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAtelier } from '@/lib/atelier';
import { MESURES } from '@/lib/mesures';
import { aujourdhui, dateCourte, initiales, lienWhatsApp } from '@/lib/format';
import { estEnRetard, type Statut } from '@/lib/statuts';
import { enregistrerMesures } from '@/app/actions';
import { Retour } from '@/components/Retour';
import { Badge } from '@/components/Badge';
import { BoutonEnvoi } from '@/components/BoutonEnvoi';
import { IconeWhatsApp } from '@/components/IconeWhatsApp';

export default async function FicheClient({ params, searchParams }: { params: { id: string }; searchParams: { onglet?: string } }) {
  const { supabase, atelier } = await getAtelier();
  const { data: client } = await supabase
    .from('clients')
    .select('id, nom, telephone, genre, mesures, mesures_maj_le, notes')
    .eq('id', params.id)
    .maybeSingle();
  if (!client) notFound();

  const onglet = searchParams.onglet === 'commandes' ? 'commandes' : 'mesures';
  const { data: commandes } = await supabase
    .from('commandes')
    .select('id, modele, statut, date_livraison')
    .eq('client_id', client.id)
    .order('created_at', { ascending: false });

  const genre = (client.genre === 'femme' ? 'femme' : 'homme') as 'homme' | 'femme';
  const mesures = (client.mesures ?? {}) as Record<string, string>;
  const whatsapp = lienWhatsApp(client.telephone, `Bonjour ${client.nom}, c’est ${atelier.nom}.`);
  const jour = aujourdhui();

  return (
    <main className="flex flex-col">
      <header className="flex flex-col gap-4 border-b border-ligne bg-white px-5 pb-4 pt-5">
        <Retour href="/clients" />
        <div className="flex items-center gap-3.5">
          <span className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-encre font-titre text-[22px] font-bold text-white">{initiales(client.nom)}</span>
          <div className="flex flex-col">
            <h1 className="font-titre text-2xl font-bold">{client.nom}</h1>
            {client.telephone && <span className="text-sm text-doux">{client.telephone}</span>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {client.telephone ? (
            <a href={`tel:${client.telephone}`} className="flex h-[46px] items-center justify-center rounded-xl border border-[#D9DEEA] font-semibold">Appeler</a>
          ) : (
            <span className="flex h-[46px] items-center justify-center rounded-xl border border-dashed border-[#D9DEEA] text-sm text-doux">Pas de numéro</span>
          )}
          {whatsapp ? (
            <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="flex h-[46px] items-center justify-center gap-2 rounded-xl bg-vert font-semibold text-white">
              <IconeWhatsApp />
              WhatsApp
            </a>
          ) : (
            <Link href={`/commandes/nouvelle?client=${client.id}`} className="flex h-[46px] items-center justify-center rounded-xl bg-accent font-semibold text-white">Nouvelle commande</Link>
          )}
        </div>
      </header>

      <div className="flex gap-2 px-5 pt-3.5">
        <Link href={`/clients/${client.id}`} className={`puce h-10 ${onglet === 'mesures' ? 'puce-active' : ''}`}>Mesures</Link>
        <Link href={`/clients/${client.id}?onglet=commandes`} className={`puce h-10 ${onglet === 'commandes' ? 'puce-active' : ''}`}>
          Commandes ({commandes?.length ?? 0})
        </Link>
      </div>

      {onglet === 'mesures' ? (
        <form action={enregistrerMesures} className="flex flex-col gap-3 px-5 pt-3.5">
          <input type="hidden" name="client_id" value={client.id} />
          <div className="flex items-end justify-between gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="genre" className="text-[13px] font-semibold text-doux">Mesures en cm</label>
              <select id="genre" name="genre" defaultValue={genre} className="h-10 rounded-lg border border-[#D9DEEA] bg-white px-2 text-sm">
                <option value="homme">Homme</option>
                <option value="femme">Femme</option>
              </select>
            </div>
            {client.mesures_maj_le && (
              <span className="text-xs text-doux">prises le {dateCourte(client.mesures_maj_le.slice(0, 10))}</span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {MESURES[genre].map((m) => (
              <div key={m.cle} className="carte flex flex-col gap-0.5 px-3.5 py-2.5">
                <label htmlFor={m.cle} className="text-[13px] text-doux">{m.libelle}</label>
                <input
                  id={m.cle}
                  name={m.cle}
                  inputMode="decimal"
                  defaultValue={mesures[m.cle] ?? ''}
                  placeholder="—"
                  className="w-full bg-transparent font-titre text-2xl font-bold text-encre outline-none placeholder:text-[#B8BFD3]"
                />
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="telephone" className="etiquette">Téléphone</label>
            <input id="telephone" name="telephone" type="tel" inputMode="tel" defaultValue={client.telephone ?? ''} className="champ" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="notes" className="etiquette">Remarques</label>
            <textarea id="notes" name="notes" rows={2} defaultValue={client.notes ?? ''} placeholder="Ex. aime les cols brodés, manches un peu larges" className="rounded-xl border border-[#D9DEEA] bg-white p-3.5 text-[15px]" />
          </div>
          <BoutonEnvoi enCours="Enregistrement…" className="bouton mt-1 bg-encre text-white">Enregistrer les mesures</BoutonEnvoi>
        </form>
      ) : (
        <div className="flex flex-col gap-2.5 px-5 pt-3.5">
          <Link href={`/commandes/nouvelle?client=${client.id}`} className="bouton bg-accent text-white">Nouvelle commande pour {client.nom.split(' ')[0]}</Link>
          {(commandes ?? []).map((c) => (
            <Link key={c.id} href={`/commandes/${c.id}`} className="carte flex items-center justify-between gap-3 p-3.5">
              <span className="flex flex-col">
                <span className="font-semibold">{c.modele}</span>
                <span className="text-[13px] text-doux">{dateCourte(c.date_livraison)}</span>
              </span>
              <Badge statut={c.statut as Statut} retard={estEnRetard(c.statut as Statut, c.date_livraison, jour)} />
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
