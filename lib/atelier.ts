import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type Atelier = { id: string; nom: string; telephone: string | null };

/** Utilisateur connecté + son atelier. Redirige si besoin. */
export const getAtelier = cache(async () => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/connexion');

  const { data } = await supabase
    .from('membres')
    .select('role, ateliers(id, nom, telephone)')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle();

  if (!data?.ateliers) redirect('/bienvenue');
  const atelier = data.ateliers as unknown as Atelier;
  return { supabase, user, atelier, role: data.role as string };
});
