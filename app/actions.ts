'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { getAtelier } from '@/lib/atelier';
import { MESURES } from '@/lib/mesures';
import { STATUTS, type Statut } from '@/lib/statuts';
import { entier, texte } from '@/lib/format';

async function envoyerPhoto(supabase: SupabaseClient, atelierId: string, v: FormDataEntryValue | null) {
  if (!(v instanceof File) || v.size === 0) return null;
  const ext = (v.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  const chemin = `${atelierId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from('photos').upload(chemin, v, { contentType: v.type || 'image/jpeg' });
  if (error) throw new Error("La photo n'a pas pu être envoyée : " + error.message);
  return chemin;
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
  const { data, error } = await supabase
    .from('clients')
    .insert({ atelier_id: atelier.id, nom, telephone: texte(formData.get('telephone')), genre })
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

  const [photo_tissu, photo_modele] = await Promise.all([
    envoyerPhoto(supabase, atelier.id, formData.get('photo_tissu')),
    envoyerPhoto(supabase, atelier.id, formData.get('photo_modele')),
  ]);

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
