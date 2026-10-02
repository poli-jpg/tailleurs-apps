import { redirect } from 'next/navigation';
import { abonnementActif, getAtelierSansControle } from '@/lib/atelier';
import { dateCourte } from '@/lib/format';
import { PRIX_MENSUEL, lienContact } from '@/lib/contact';
import { deconnexion } from '@/app/actions';
import { IconeWhatsApp } from '@/components/IconeWhatsApp';

export default async function Abonnement() {
  const { atelier } = await getAtelierSansControle();
  if (abonnementActif(atelier)) redirect('/');

  const message = `Bonjour, je voudrais renouveler l’abonnement de mon atelier « ${atelier.nom} » (réf. ${atelier.id.slice(0, 8)}).`;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 p-6">
      <div className="flex flex-col gap-2">
        <span className="text-sm text-doux">{atelier.nom}</span>
        <h1 className="font-titre text-3xl font-bold text-encre">Votre abonnement a expiré</h1>
        <p className="text-doux">
          Il a pris fin le {dateCourte(atelier.abonnement_jusqu_au)}. Vos clients, mesures et commandes sont bien conservés : tout revient dès le renouvellement.
        </p>
      </div>

      <div className="carte flex flex-col gap-1 p-5">
        <span className="text-sm text-doux">Abonnement</span>
        <span className="font-titre text-2xl font-bold text-encre">{PRIX_MENSUEL}</span>
        <span className="text-sm text-doux">Paiement par Wave ou Orange Money. Envoyez-nous un message, on réactive votre accès dans la journée.</span>
      </div>

      <a href={lienContact(message)} target="_blank" rel="noopener noreferrer" className="bouton bg-vert text-white">
        <IconeWhatsApp />
        Renouveler sur WhatsApp
      </a>

      <form action={deconnexion}>
        <button className="w-full text-center text-sm font-semibold text-encre underline">Se déconnecter</button>
      </form>
    </main>
  );
}
