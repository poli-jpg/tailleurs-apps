import { getAtelier, joursAbonnement } from '@/lib/atelier';
import { dateCourte } from '@/lib/format';
import { deconnexion } from '@/app/actions';
import { Retour } from '@/components/Retour';
import { FormAtelier, FormEmail, FormMotDePasse } from '@/components/FormulairesCompte';

export default async function Compte() {
  const { atelier, user } = await getAtelier();
  const jours = joursAbonnement(atelier);

  return (
    <main className="flex flex-col gap-4 px-5 pt-5">
      <div className="flex items-center gap-3">
        <Retour href="/" />
        <h1 className="font-titre text-[22px] font-bold">Mon compte</h1>
      </div>

      <div className="carte flex items-center justify-between gap-3 p-4">
        <div className="flex flex-col">
          <span className="text-sm text-doux">Abonnement</span>
          <span className="font-semibold">Actif jusqu’au {dateCourte(atelier.abonnement_jusqu_au)}</span>
        </div>
        <span className={`rounded-[10px] px-2.5 py-1.5 text-xs font-bold ${jours <= 5 ? 'bg-accent text-white' : 'bg-pale text-encre'}`}>
          {jours === 0 ? 'Dernier jour' : `${jours} j`}
        </span>
      </div>

      <FormAtelier nom={atelier.nom} telephone={atelier.telephone} />
      <FormEmail email={user.email ?? ''} />
      <FormMotDePasse />

      <form action={deconnexion} className="pb-4">
        <button className="bouton border-2 border-accent bg-white text-accent">Se déconnecter</button>
      </form>
    </main>
  );
}
