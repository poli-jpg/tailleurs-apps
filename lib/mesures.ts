export type Champ = { cle: string; libelle: string };

export const MESURES: Record<'homme' | 'femme', Champ[]> = {
  homme: [
    { cle: 'cou', libelle: 'Tour de cou' },
    { cle: 'epaules', libelle: 'Épaules' },
    { cle: 'poitrine', libelle: 'Poitrine' },
    { cle: 'taille', libelle: 'Taille' },
    { cle: 'bassin', libelle: 'Bassin' },
    { cle: 'long_boubou', libelle: 'Longueur boubou' },
    { cle: 'long_chemise', libelle: 'Longueur chemise' },
    { cle: 'long_manche', libelle: 'Longueur manche' },
    { cle: 'tour_bras', libelle: 'Tour de bras' },
    { cle: 'long_pantalon', libelle: 'Longueur pantalon' },
    { cle: 'cuisse', libelle: 'Tour de cuisse' },
    { cle: 'bas_pantalon', libelle: 'Bas du pantalon' },
  ],
  femme: [
    { cle: 'epaules', libelle: 'Épaules' },
    { cle: 'poitrine', libelle: 'Poitrine' },
    { cle: 'sous_poitrine', libelle: 'Sous-poitrine' },
    { cle: 'taille', libelle: 'Taille' },
    { cle: 'hanches', libelle: 'Hanches' },
    { cle: 'long_buste', libelle: 'Longueur buste' },
    { cle: 'long_robe', libelle: 'Longueur robe' },
    { cle: 'long_jupe', libelle: 'Longueur jupe / pagne' },
    { cle: 'long_manche', libelle: 'Longueur manche' },
    { cle: 'tour_bras', libelle: 'Tour de bras' },
    { cle: 'encolure', libelle: 'Encolure' },
    { cle: 'long_taille_basse', libelle: 'Longueur taille basse' },
  ],
};
