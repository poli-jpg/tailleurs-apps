export const STATUTS = ['recue', 'coupe', 'couture', 'prete', 'livree'] as const;
export type Statut = (typeof STATUTS)[number];

export const LIBELLES: Record<Statut, string> = {
  recue: 'Reçue',
  coupe: 'En coupe',
  couture: 'En couture',
  prete: 'Prête',
  livree: 'Livrée',
};

export const ETAPES: Record<Statut, string> = {
  recue: 'Reçue',
  coupe: 'Coupe',
  couture: 'Couture',
  prete: 'Prête',
  livree: 'Livrée',
};

export function statutSuivant(s: Statut): Statut | null {
  const i = STATUTS.indexOf(s);
  return i >= 0 && i < STATUTS.length - 1 ? STATUTS[i + 1] : null;
}

export function estEnRetard(statut: Statut, dateLivraison: string | null, aujourdhui: string) {
  return !!dateLivraison && dateLivraison < aujourdhui && statut !== 'prete' && statut !== 'livree';
}
