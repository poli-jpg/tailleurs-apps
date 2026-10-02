'use server';

import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { getAtelier } from '@/lib/atelier';
import { texte } from '@/lib/format';

export type EtatForm = { ok: boolean; message: string } | null;

export async function modifierAtelier(_: EtatForm, formData: FormData): Promise<EtatForm> {
  const { supabase, atelier } = await getAtelier();
  const nom = texte(formData.get('nom'));
  if (!nom) return { ok: false, message: 'Le nom de l’atelier est obligatoire.' };
  const { error } = await supabase
    .from('ateliers')
    .update({ nom, telephone: texte(formData.get('telephone')) })
    .eq('id', atelier.id);
  if (error) return { ok: false, message: error.message };
  revalidatePath('/', 'layout');
  return { ok: true, message: 'Informations de l’atelier enregistrées.' };
}

export async function modifierEmail(_: EtatForm, formData: FormData): Promise<EtatForm> {
  const { supabase, user } = await getAtelier();
  const email = texte(formData.get('email'))?.toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, message: 'Adresse e-mail invalide.' };
  if (email === user.email) return { ok: false, message: 'C’est déjà votre adresse actuelle.' };
  const origine = headers().get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL ?? '';
  const { error } = await supabase.auth.updateUser({ email }, { emailRedirectTo: `${origine}/auth/callback` });
  if (error) return { ok: false, message: error.message };
  return {
    ok: true,
    message: `Un e-mail de confirmation a été envoyé à ${email}. Le changement sera effectif après avoir cliqué sur le lien.`,
  };
}

export async function modifierMotDePasse(_: EtatForm, formData: FormData): Promise<EtatForm> {
  const { supabase, user } = await getAtelier();
  const actuel = String(formData.get('actuel') ?? '');
  const nouveau = String(formData.get('nouveau') ?? '');
  const confirmation = String(formData.get('confirmation') ?? '');

  if (nouveau.length < 8) return { ok: false, message: 'Le nouveau mot de passe doit faire au moins 8 caractères.' };
  if (nouveau !== confirmation) return { ok: false, message: 'Les deux nouveaux mots de passe ne correspondent pas.' };
  if (nouveau === actuel) return { ok: false, message: 'Le nouveau mot de passe doit être différent de l’actuel.' };

  // on vérifie le mot de passe actuel avant de le changer
  const { error: e1 } = await supabase.auth.signInWithPassword({ email: user.email!, password: actuel });
  if (e1) return { ok: false, message: 'Mot de passe actuel incorrect.' };

  const { error } = await supabase.auth.updateUser({ password: nouveau });
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: 'Mot de passe modifié.' };
}
