'use client';

import { useState } from 'react';

type Client = { id: string; nom: string };

/** Client existant : on le choisit et c'est tout. Nouveau client : on affiche nom, téléphone et type de mesures. */
export function ChoixClient({ clients, initial }: { clients: Client[]; initial: string }) {
  const [choix, setChoix] = useState(initial);
  const nouveau = choix === '';

  return (
    <fieldset className="carte flex flex-col gap-3 p-4">
      <legend className="sr-only">Client</legend>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="client_id" className="etiquette">Client</label>
        <select id="client_id" name="client_id" value={choix} onChange={(e) => setChoix(e.target.value)} className="champ">
          <option value="">+ Nouveau client</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.nom}</option>
          ))}
        </select>
      </div>

      {nouveau ? (
        <>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="client_nom" className="etiquette">Nom</label>
            <input id="client_nom" name="client_nom" required className="champ" />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="client_telephone" className="etiquette">Téléphone</label>
              <input id="client_telephone" name="client_telephone" type="tel" inputMode="tel" className="champ min-w-0" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="client_genre" className="etiquette">Mesures</label>
              <select id="client_genre" name="client_genre" className="champ">
                <option value="homme">Homme</option>
                <option value="femme">Femme</option>
              </select>
            </div>
          </div>
        </>
      ) : (
        <p className="text-[13px] text-doux">Téléphone et mesures déjà enregistrés sur sa fiche.</p>
      )}
    </fieldset>
  );
}
