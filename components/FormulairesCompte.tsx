'use client';

import { useEffect, useRef } from 'react';
import { useFormState } from 'react-dom';
import { modifierAtelier, modifierEmail, modifierMotDePasse, type EtatForm } from '@/app/compte-actions';
import { BoutonEnvoi } from '@/components/BoutonEnvoi';

function Message({ etat }: { etat: EtatForm }) {
  if (!etat) return null;
  return (
    <p role="status" className={`rounded-xl px-3.5 py-2.5 text-sm ${etat.ok ? 'bg-[#E7F4EC] text-vert' : 'bg-[#FFF1E8] text-[#7C2D12]'}`}>
      {etat.message}
    </p>
  );
}

function Champ(props: { id: string; label: string; type?: string; defaut?: string; auto?: string; mode?: 'tel' | 'email' }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={props.id} className="etiquette">{props.label}</label>
      <input
        id={props.id}
        name={props.id}
        type={props.type ?? 'text'}
        defaultValue={props.defaut}
        autoComplete={props.auto}
        inputMode={props.mode}
        className="champ"
      />
    </div>
  );
}

export function FormAtelier({ nom, telephone }: { nom: string; telephone: string | null }) {
  const [etat, action] = useFormState(modifierAtelier, null);
  return (
    <form action={action} className="carte flex flex-col gap-3 p-4">
      <h2 className="font-titre text-lg font-bold">Mon atelier</h2>
      <Champ id="nom" label="Nom de l’atelier" defaut={nom} />
      <Champ id="telephone" label="Numéro de téléphone" type="tel" mode="tel" defaut={telephone ?? ''} auto="tel" />
      <Message etat={etat} />
      <BoutonEnvoi enCours="Enregistrement…" className="bouton bg-encre text-white">Enregistrer</BoutonEnvoi>
    </form>
  );
}

export function FormEmail({ email }: { email: string }) {
  const [etat, action] = useFormState(modifierEmail, null);
  return (
    <form action={action} className="carte flex flex-col gap-3 p-4">
      <h2 className="font-titre text-lg font-bold">Adresse e-mail</h2>
      <p className="text-sm text-doux">Actuelle : <strong className="text-texte">{email}</strong></p>
      <Champ id="email" label="Nouvelle adresse e-mail" type="email" mode="email" auto="email" />
      <Message etat={etat} />
      <BoutonEnvoi enCours="Envoi…" className="bouton bg-encre text-white">Changer l’e-mail</BoutonEnvoi>
    </form>
  );
}

export function FormMotDePasse() {
  const [etat, action] = useFormState(modifierMotDePasse, null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (etat?.ok) ref.current?.reset();
  }, [etat]);
  return (
    <form ref={ref} action={action} className="carte flex flex-col gap-3 p-4">
      <h2 className="font-titre text-lg font-bold">Mot de passe</h2>
      <Champ id="actuel" label="Mot de passe actuel" type="password" auto="current-password" />
      <Champ id="nouveau" label="Nouveau mot de passe (8 caractères minimum)" type="password" auto="new-password" />
      <Champ id="confirmation" label="Confirmer le nouveau mot de passe" type="password" auto="new-password" />
      <Message etat={etat} />
      <BoutonEnvoi enCours="Modification…" className="bouton bg-encre text-white">Changer le mot de passe</BoutonEnvoi>
    </form>
  );
}
