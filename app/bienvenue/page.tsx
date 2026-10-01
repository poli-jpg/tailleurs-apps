import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { creerAtelier } from '@/app/actions';
import { BoutonEnvoi } from '@/components/BoutonEnvoi';

export default async function Bienvenue() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/connexion');
  const { data } = await supabase.from('membres').select('atelier_id').eq('user_id', user.id).limit(1).maybeSingle();
  if (data) redirect('/');

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-titre text-3xl font-bold text-encre">Bienvenue</h1>
        <p className="text-doux">Commençons par votre atelier. Vous pourrez modifier ces informations plus tard.</p>
      </div>
      <form action={creerAtelier} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="nom" className="etiquette">Nom de l’atelier</label>
          <input id="nom" name="nom" required placeholder="Ex. Atelier Diop Couture" className="champ" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="telephone" className="etiquette">Téléphone de l’atelier</label>
          <input id="telephone" name="telephone" type="tel" inputMode="tel" className="champ" />
        </div>
        <BoutonEnvoi enCours="Création…" className="bouton bg-accent text-white">Créer mon atelier</BoutonEnvoi>
      </form>
    </main>
  );
}
