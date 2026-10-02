import { joursAbonnement, type Atelier } from '@/lib/atelier';
import { lienContact } from '@/lib/contact';

/** S'affiche seulement dans les 5 derniers jours de l'abonnement */
export function BandeauAbonnement({ atelier }: { atelier: Atelier }) {
  const jours = joursAbonnement(atelier);
  if (jours > 5) return null;
  const texte = jours === 0 ? 'Votre abonnement se termine aujourd’hui.' : `Votre abonnement se termine dans ${jours} jour${jours > 1 ? 's' : ''}.`;
  const message = `Bonjour, je voudrais renouveler l’abonnement de mon atelier « ${atelier.nom} » (réf. ${atelier.id.slice(0, 8)}).`;
  return (
    <a
      href={lienContact(message)}
      target="_blank"
      rel="noopener noreferrer"
      className="mx-5 mt-4 flex items-center justify-between gap-3 rounded-xl bg-[#FFF1E8] px-4 py-3 text-sm text-[#7C2D12]"
    >
      <span>{texte}</span>
      <span className="shrink-0 font-semibold underline">Renouveler</span>
    </a>
  );
}
