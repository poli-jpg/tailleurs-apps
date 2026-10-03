import { getAtelier } from '@/lib/atelier';
import { creerCommande } from '@/app/actions';
import { Retour } from '@/components/Retour';
import { BoutonEnvoi } from '@/components/BoutonEnvoi';
import { ChoixClient } from '@/components/ChoixClient';

const iconePhoto = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
    <circle cx="12" cy="13" r="3.5" />
  </svg>
);

function ChampPhoto({ name, libelle }: { name: string; libelle: string }) {
  return (
    <label className="flex h-[92px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[14px] border-2 border-dashed border-[#A9B1C8] bg-white text-sm font-semibold text-encre">
      {iconePhoto}
      {libelle}
            <input type="file" name={name} accept="image/*" className="sr-only" />
    </label>
  );
}

export default async function NouvelleCommande({ searchParams }: { searchParams: { client?: string } }) {
  const { supabase, atelier } = await getAtelier();
  const { data: clients } = await supabase.from('clients').select('id, nom').eq('atelier_id', atelier.id).order('nom');

  return (
    <main className="flex flex-col gap-5 px-5 pt-5">
      <div className="flex items-center gap-3">
        <Retour href="/" label="Fermer" />
        <h1 className="font-titre text-[22px] font-bold">Nouvelle commande</h1>
      </div>

      <form action={creerCommande} className="flex flex-col gap-4">
        <ChoixClient clients={clients ?? []} initial={searchParams.client ?? ''} />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="modele" className="etiquette">Modèle</label>
          <input id="modele" name="modele" required placeholder="Ex. Grand boubou bazin" className="champ" />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <ChampPhoto name="photo_tissu" libelle="Photo du tissu" />
          <ChampPhoto name="photo_modele" libelle="Photo du modèle" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="date_livraison" className="etiquette">Date de livraison</label>
          <input id="date_livraison" name="date_livraison" type="date" className="champ" />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="prix" className="etiquette">Prix (F CFA)</label>
            <input id="prix" name="prix" inputMode="numeric" className="champ min-w-0" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="acompte" className="etiquette">Acompte reçu</label>
            <input id="acompte" name="acompte" inputMode="numeric" className="champ min-w-0" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="assigne_a" className="etiquette">Confier à</label>
          <input id="assigne_a" name="assigne_a" placeholder="Vous-même ou le prénom d’un apprenti" className="champ" />
        </div>

        <BoutonEnvoi enCours="Enregistrement…" className="bouton mt-1 bg-accent text-white">Enregistrer la commande</BoutonEnvoi>
      </form>
    </main>
  );
}
