'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { compresserImage } from '@/lib/image';

/**
 * La photo est réduite sur le téléphone (environ 300 Ko), puis envoyée
 * directement vers Supabase Storage, sans passer par Vercel.
 * Le formulaire reçoit seulement le chemin du fichier.
 */
export function ChampPhoto({ name, libelle, atelierId }: { name: string; libelle: string; atelierId: string }) {
  const [etat, setEtat] = useState<'vide' | 'envoi' | 'ok' | 'erreur'>('vide');
  const [apercu, setApercu] = useState<string | null>(null);
  const [chemin, setChemin] = useState('');
  const [erreur, setErreur] = useState('');
  const garde = useRef<HTMLInputElement>(null);

  // bloque l'envoi du formulaire tant que la photo n'est pas arrivée
  useEffect(() => {
    garde.current?.setCustomValidity(etat === 'envoi' ? 'Attendez la fin de l’envoi de la photo.' : '');
  }, [etat]);

  async function choisir(e: React.ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0];
    if (!fichier) return;
    if (apercu) URL.revokeObjectURL(apercu);
    setApercu(URL.createObjectURL(fichier));
    setEtat('envoi');
    setErreur('');
    setChemin('');

    const { blob, type, ext } = await compresserImage(fichier);
    const nouveauChemin = `${atelierId}/${crypto.randomUUID()}.${ext}`;
    const supabase = createClient();
    const { error } = await supabase.storage
      .from('photos')
      .upload(nouveauChemin, blob, { contentType: type, upsert: false });

    if (error) {
      setEtat('erreur');
      setErreur(error.message.includes('exceeded') ? 'Photo trop lourde pour le stockage.' : 'Envoi impossible, réessayez.');
      return;
    }
    setChemin(nouveauChemin);
    setEtat('ok');
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="relative flex h-[92px] cursor-pointer flex-col items-center justify-center gap-1.5 overflow-hidden rounded-[14px] border-2 border-dashed border-[#A9B1C8] bg-white text-sm font-semibold text-encre">
        {apercu ? (
          <img src={apercu} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
            <circle cx="12" cy="13" r="3.5" />
          </svg>
        )}
        <span className={apercu ? 'relative rounded-lg bg-white/90 px-2 py-0.5 text-xs' : ''}>
          {etat === 'envoi' ? 'Envoi…' : etat === 'ok' ? `${libelle} ✓` : libelle}
        </span>
        <input type="file" accept="image/*" onChange={choisir} className="sr-only" />
      </label>
      <input type="hidden" name={name} value={chemin} />
      <input ref={garde} tabIndex={-1} aria-hidden className="pointer-events-none h-0 w-full opacity-0" value="" onChange={() => {}} />
      {etat === 'erreur' && <span className="text-xs text-accent">{erreur}</span>}
    </div>
  );
}
