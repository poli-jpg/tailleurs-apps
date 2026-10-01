import { notFound } from 'next/navigation';
import { getAtelier } from '@/lib/atelier';
import { aujourdhui, dateCourte, fcfa, joursRestants, lienWhatsApp } from '@/lib/format';
import { ETAPES, LIBELLES, STATUTS, estEnRetard, statutSuivant, type Statut } from '@/lib/statuts';
import { ajouterPaiement, changerStatut } from '@/app/actions';
import { Retour } from '@/components/Retour';
import { Badge } from '@/components/Badge';
import { BoutonEnvoi } from '@/components/BoutonEnvoi';
import { IconeWhatsApp } from '@/components/IconeWhatsApp';

type Commande = {
  id: string;
  numero: number;
  modele: string;
  statut: Statut;
  date_livraison: string | null;
  prix: number;
  total_paye: number;
  reste: number;
  assigne_a: string | null;
  photo_tissu: string | null;
  photo_modele: string | null;
  client_id: string;
  client_nom: string;
  client_telephone: string | null;
};

function Photo({ url, libelle }: { url: string | null; libelle: string }) {
  return (
    <div className="relative h-[130px] overflow-hidden rounded-2xl bg-[repeating-linear-gradient(135deg,#E4E8F4_0_10px,#D7DCEC_10px_20px)]">
      {url && <img src={url} alt={libelle} className="h-full w-full object-cover" />}
      <span className="absolute bottom-2.5 left-2.5 rounded-lg bg-white px-2 py-1 text-xs font-bold text-encre">{libelle}</span>
    </div>
  );
}

export default async function DetailCommande({ params }: { params: { id: string } }) {
  const { supabase, atelier } = await getAtelier();
  const { data } = await supabase.from('commandes_resume').select('*').eq('id', params.id).maybeSingle();
  if (!data) notFound();
  const c = data as Commande;

  const chemins = [c.photo_tissu, c.photo_modele].filter((p): p is string => !!p);
  const urls: Record<string, string> = {};
  if (chemins.length) {
    const { data: signees } = await supabase.storage.from('photos').createSignedUrls(chemins, 3600);
    signees?.forEach((s) => s.path && s.signedUrl && (urls[s.path] = s.signedUrl));
  }

  const jour = aujourdhui();
  const retard = estEnRetard(c.statut, c.date_livraison, jour);
  const j = joursRestants(c.date_livraison, jour);
  const suivant = statutSuivant(c.statut);
  const indexActuel = STATUTS.indexOf(c.statut);

  const message =
    c.statut === 'prete'
      ? `Bonjour ${c.client_nom}, votre ${c.modele} est prête.${c.reste > 0 ? ` Reste à payer : ${fcfa(c.reste)}.` : ''} À bientôt, ${atelier.nom}`
      : `Bonjour ${c.client_nom}, c’est ${atelier.nom} au sujet de votre ${c.modele}.`;
  const whatsapp = lienWhatsApp(c.client_telephone, message);

  return (
    <main className="flex flex-col gap-3.5 px-5 pt-5">
      <div className="flex items-center gap-3">
        <Retour href="/" />
        <div className="flex flex-col">
          <span className="text-[13px] text-doux">Commande n° {String(c.numero).padStart(3, '0')}</span>
          <a href={`/clients/${c.client_id}`} className="font-titre text-[22px] font-bold text-texte">{c.client_nom}</a>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <Photo url={c.photo_tissu ? urls[c.photo_tissu] ?? null : null} libelle="Tissu" />
        <Photo url={c.photo_modele ? urls[c.photo_modele] ?? null : null} libelle="Modèle" />
      </div>

      <section className="carte flex flex-col gap-3.5 p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold">{c.modele}</h2>
          <Badge statut={c.statut} retard={retard} />
        </div>
        <ol className="grid grid-cols-5 gap-1">
          {STATUTS.map((s, i) => {
            const fait = i < indexActuel || (i === indexActuel && s === 'livree');
            const actuel = i === indexActuel && s !== 'livree';
            return (
              <li key={s} className="flex flex-col items-center gap-1.5">
                <span
                  className={`flex h-[30px] w-[30px] items-center justify-center rounded-full ${
                    fait ? 'bg-encre text-white' : actuel ? 'border-[3px] border-accent bg-white' : 'border-2 border-[#B8BFD3] bg-white'
                  }`}
                >
                  {fait && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12l5 5L20 7" /></svg>
                  )}
                </span>
                <span className={`text-xs ${actuel ? 'font-bold' : fait ? '' : 'text-doux'}`}>{ETAPES[s]}</span>
              </li>
            );
          })}
        </ol>
        <p className={`rounded-xl px-3 py-2.5 text-sm ${retard ? 'bg-accent text-white' : 'bg-fond'}`}>
          Livraison <strong>{dateCourte(c.date_livraison)}</strong>
          {j !== null && c.statut !== 'livree' && (j > 0 ? `, dans ${j} jour${j > 1 ? 's' : ''}` : j === 0 ? ", aujourd’hui" : `, en retard de ${-j} jour${j < -1 ? 's' : ''}`)}
        </p>
        {c.assigne_a && <p className="text-sm text-doux">Confiée à {c.assigne_a}</p>}
      </section>

      <section className="carte flex flex-col gap-2.5 p-4">
        <div className="flex justify-between text-[15px]"><span className="text-doux">Prix</span><span className="font-semibold">{fcfa(c.prix)}</span></div>
        <div className="flex justify-between text-[15px]"><span className="text-doux">Déjà payé</span><span className="font-semibold">{fcfa(c.total_paye)}</span></div>
        <div className="h-px bg-ligne" />
        <div className="flex items-center justify-between">
          <span className="font-bold">Reste à payer</span>
          <span className="font-titre text-[22px] font-bold text-accent">{fcfa(c.reste)}</span>
        </div>
        {c.reste > 0 && (
          <form action={ajouterPaiement} className="mt-1 flex gap-2">
            <input type="hidden" name="commande_id" value={c.id} />
            <label htmlFor="montant" className="sr-only">Montant reçu</label>
            <input id="montant" name="montant" inputMode="numeric" placeholder="Montant reçu" className="champ min-w-0 flex-1" />
            <BoutonEnvoi enCours="…" className="h-12 shrink-0 rounded-xl bg-encre px-4 text-sm font-semibold text-white">Encaisser</BoutonEnvoi>
          </form>
        )}
      </section>

      <div className="flex flex-col gap-2.5 pt-1">
        {suivant && (
          <form action={changerStatut}>
            <input type="hidden" name="commande_id" value={c.id} />
            <input type="hidden" name="statut" value={suivant} />
            <BoutonEnvoi enCours="Mise à jour…" className="bouton border-2 border-encre bg-white text-encre">
              {suivant === 'prete' ? 'Marquer comme prête' : suivant === 'livree' ? 'Marquer comme livrée' : `Passer à : ${LIBELLES[suivant]}`}
            </BoutonEnvoi>
          </form>
        )}
        {whatsapp ? (
          <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="bouton bg-vert text-white">
            <IconeWhatsApp />
            {c.statut === 'prete' ? 'Prévenir sur WhatsApp' : 'Écrire sur WhatsApp'}
          </a>
        ) : (
          <p className="text-center text-sm text-doux">Ajoutez le téléphone du client pour le prévenir sur WhatsApp.</p>
        )}
      </div>
    </main>
  );
}
