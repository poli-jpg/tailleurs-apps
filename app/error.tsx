'use client';

export default function Erreur({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 p-6">
      <h1 className="font-titre text-2xl font-bold">Ça n’a pas marché</h1>
      <p className="text-doux">{error.message || 'Une erreur est survenue.'}</p>
      <button onClick={reset} className="bouton bg-encre text-white">
        Réessayer
      </button>
    </main>
  );
}
