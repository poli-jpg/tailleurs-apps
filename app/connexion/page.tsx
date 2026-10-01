'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function Connexion() {
  const router = useRouter();
  const [mode, setMode] = useState<'connexion' | 'inscription'>('connexion');
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState('');

  async function envoyer(e: React.FormEvent) {
    e.preventDefault();
    setEnCours(true);
    setErreur('');
    const supabase = createClient();
    const { error } =
      mode === 'connexion'
        ? await supabase.auth.signInWithPassword({ email, password: motDePasse })
        : await supabase.auth.signUp({ email, password: motDePasse });

    if (error) {
      setErreur(
        error.message === 'Invalid login credentials'
          ? 'E-mail ou mot de passe incorrect.'
          : error.message,
      );
      setEnCours(false);
      return;
    }
    router.push('/');
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-titre text-3xl font-bold text-encre">Atelier</h1>
        <p className="text-doux">Vos mesures, commandes et paiements, toujours dans votre poche.</p>
      </div>

      <form onSubmit={envoyer} className="flex flex-col gap-3">
        <label htmlFor="email" className="etiquette">E-mail</label>
        <input id="email" type="email" required autoComplete="email"
          value={email} onChange={(e) => setEmail(e.target.value)} className="champ" />

        <label htmlFor="mdp" className="etiquette">Mot de passe</label>
        <input id="mdp" type="password" required minLength={6}
          autoComplete={mode === 'connexion' ? 'current-password' : 'new-password'}
          value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} className="champ" />

        {erreur && <p className="text-sm text-accent">{erreur}</p>}

        <button type="submit" disabled={enCours} className="bouton mt-1 bg-encre text-white disabled:opacity-60">
          {enCours ? 'Patientez…' : mode === 'connexion' ? 'Se connecter' : 'Créer mon compte'}
        </button>
      </form>

      <button type="button" onClick={() => { setMode(mode === 'connexion' ? 'inscription' : 'connexion'); setErreur(''); }}
        className="text-sm font-semibold text-encre underline">
        {mode === 'connexion' ? 'Pas encore de compte ? Créer un compte' : 'Déjà un compte ? Se connecter'}
      </button>
    </main>
  );
}