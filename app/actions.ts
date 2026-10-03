'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { getAtelier } from '@/lib/atelier';
import { MESURES } from '@/lib/mesures';
import { STATUTS, type Statut } from '@/lib/statuts';
import { entier, texte } from '@/lib/format';

/** Cherche un client existant de l'atelier avec le même numéro (évite les doublons) */
async function clientParTelephone(supabase: SupabaseClient, atelierId: string, telephone: string | null) {
  const chiffres = (telephone ?? '').replace(/\D/g, '').slice(-9);
  if (chiffres.length < 9) return null;
  const { data } = await supabase
    .from('clients')
    .select('id, telephone')
    .eq('atelier_id', atelierId)
    .ilike('telephone', `%${chiffres.slice(-4)}%`);
  const trouve = (data ?? []).find((c) => (c.telephone ?? '').replace(/\D/g, '').slice(-9) === chiffres);
  return trouve ? (trouve.id as string) : null;
}

export async function creerAtelier(formData: FormData) {
  const supabase = createClient();
  const nom = texte(formData.get('nom'));
  if (!nom) throw new Error("Indiquez le nom de l'atelier.");
  const { error } = await supabase.rpc('creer_atelier', { p_nom: nom, p_telephone: texte(formData.get('telephone')) });
  if (error) throw new Error(error.message);
  redirect('/');
}

export async function creerClient(formData: FormData) {
  const { supabase, atelier } = await getAtelier();
  const nom = texte(formData.get('nom'));
  if (!nom) throw new Error('Indiquez le nom du client.');
  const genre = formData.get('genre') === 'femme' ? 'femme' : 'homme';
  const telephone = texte(formData.get('telephone'));
  const existant = await clientParTelephone(supabase, atelier.id, telephone);
  if (existant) redirect(`/clients/${existant}`);
  const { data, error } = await supabase
    .from('clients')
    .insert({ atelier_id: atelier.id, nom, telephone, genre })
    .select('id')
    .single();
  if (error) throw new Error(error.message);
  revalidatePath('/clients');
  redirect(`/clients/${data.id}`);
}

export async function enregistrerMesures(formData: FormData) {
  const { supabase } = await getAtelier();
  const clientId = String(formData.get('client_id'));
  const genre = formData.get('genre') === 'femme' ? 'femme' : 'homme';
  // on garde les mesures déjà prises (ex. après un changement homme/femme)
  const { data: actuel } = await supabase.from('clients').select('mesures').eq('id', clientId).maybeSingle();
  const mesures: Record<string, string> = { ...((actuel?.mesures ?? {}) as Record<string, string>) };
  for (const champ of MESURES[genre]) {
    if (!formData.has(champ.cle)) continue;
    const v = texte(formData.get(champ.cle));
    if (v) mesures[champ.cle] = v.replace(',', '.');
    else delete mesures[champ.cle];
  }
  const { error } = await supabase
    .from('clients')
    .update({
      genre,
      mesures,
      notes: texte(formData.get('notes')),
      telephone: texte(formData.get('telephone')),
      mesures_maj_le: new Date().toISOString(),
    })
    .eq('id', clientId);
  if (error) throw new Error(error.message);
  revalidatePath(`/clients/${clientId}`);
  redirect(`/clients/${clientId}`);
}

export async function creerCommande(formData: FormData) {
  const { supabase, atelier } = await getAtelier();

  let clientId = texte(formData.get('client_id'));
  if (!clientId) {
    const nom = texte(formData.get('client_nom'));
    if (!nom) throw new Error('Choisissez un client ou saisissez le nom d’un nouveau client.');
    clientId = await clientParTelephone(supabase, atelier.id, texte(formData.get('client_telephone')));
  }
  if (!clientId) {
    const nom = texte(formData.get('client_nom'))!;
    const { data, error } = await supabase
      .from('clients')
      .insert({
        atelier_id: atelier.id,
        nom,
        telephone: texte(formData.get('client_telephone')),
        genre: formData.get('client_genre') === 'femme' ? 'femme' : 'homme',
      })
      .select('id')
      .single();
    if (error) throw new Error(error.message);
    clientId = data.id as string;
  }

  const modele = texte(formData.get('modele'));
  if (!modele) throw new Error('Indiquez le modèle.');

  // les photos sont déjà dans Supabase Storage (envoyées depuis le téléphone) : on garde juste leur chemin
  const cheminPhoto = (v: FormDataEntryValue | null) => {
    const c = texte(v);
    return c && c.startsWith(`${atelier.id}/`) ? c : null;
  };
  const photo_tissu = cheminPhoto(formData.get('photo_tissu'));
  const photo_modele = cheminPhoto(formData.get('photo_modele'));

  const { data: commande, error } = await supabase
    .from('commandes')
    .insert({
      atelier_id: atelier.id,
      client_id: clientId,
      modele,
      date_livraison: texte(formData.get('date_livraison')),
      prix: entier(formData.get('prix')),
      assigne_a: texte(formData.get('assigne_a')),
      photo_tissu,
      photo_modele,
    })
    .select('id')
    .single();
  if (error) throw new Error(error.message);

  const acompte = entier(formData.get('acompte'));
  if (acompte > 0) {
    const { error: e } = await supabase
      .from('paiements')
      .insert({ atelier_id: atelier.id, commande_id: commande.id, montant: acompte });
    if (e) throw new Error(e.message);
  }

  revalidatePath('/');
  redirect(`/commandes/${commande.id}`);
}

export async function changerStatut(formData: FormData) {
  const { supabase } = await getAtelier();
  const id = String(formData.get('commande_id'));
  const statut = String(formData.get('statut')) as Statut;
  if (!STATUTS.includes(statut)) throw new Error('Statut inconnu.');
  const { error } = await supabase.from('commandes').update({ statut }).eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/');
  revalidatePath(`/commandes/${id}`);
}

export async function ajouterPaiement(formData: FormData) {
  const { supabase, atelier } = await getAtelier();
  const id = String(formData.get('commande_id'));
  const montant = entier(formData.get('montant'));
  if (montant <= 0) throw new Error('Indiquez un montant.');
  const { error } = await supabase.from('paiements').insert({ atelier_id: atelier.id, commande_id: id, montant });
  if (error) throw new Error(error.message);
  revalidatePath('/');
  revalidatePath(`/commandes/${id}`);
}

export async function deconnexion() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect('/connexion');
}
