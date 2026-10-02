import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { aujourdhui } from '@/lib/format';

export type Atelier = { id: string; nom: string; telephone: string | null; abonnement_jusqu_au: string };

const charger = cache(async () => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/connexion');

  const { data } = await supabase
    .from('membres')
    .select('role, ateliers(id, nom, telephone, abonnement_jusqu_au)')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle();

  if (!data?.ateliers) redirect('/bienvenue');
  const atelier = data.ateliers as unknown as Atelier;
  return { supabase, user, atelier, role: data.role as string };
});

export function abonnementActif(atelier: Atelier) {
  return atelier.abonnement_jusqu_au >= aujourdhui();
}

/** Nombre de jours restants (0 = dernier jour aujourd'hui) */
export function joursAbonnement(atelier: Atelier) {
  return Math.round((Date.parse(atelier.abonnement_jusqu_au) - Date.parse(aujourdhui())) / 86_400_000);
}

/** Atelier sans contrôle d'abonnement (page /abonnement) */
export async function getAtelierSansControle() {
  return charger();
}

/** Utilisateur connecté + son atelier. Redirige si pas connecté, pas d'atelier ou abonnement expiré. */
export async function getAtelier() {
  const r = await charger();
  if (!abonnementActif(r.atelier)) redirect('/abonnement');
  return r;
}
