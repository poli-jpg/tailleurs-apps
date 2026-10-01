# Atelier – gestion de couture (MVP)

Application mobile (PWA) pour les tailleurs : clients et mesures, commandes avec photos,
suivi des statuts, acomptes et reste à payer, message WhatsApp quand la tenue est prête.

Stack : Next.js 14 (App Router, server actions) · Supabase (Postgres, Auth, Storage) · Tailwind.

## Démarrer

1. **Créer un projet Supabase**, puis dans *SQL Editor* exécuter `supabase/migrations/0001_init.sql`
   (ou `supabase db push` avec la CLI).
2. **Auth** : *Authentication › URL Configuration*
   - Site URL : `http://localhost:3000` (puis l'URL Vercel)
   - Redirect URLs : `http://localhost:3000/auth/callback` et `https://<ton-domaine>/auth/callback`
3. **Variables d'environnement** : copier `.env.example` en `.env.local` et remplir l'URL + la clé anon.
4. `npm install` puis `npm run dev`.

Premier passage : connexion par lien e-mail → création de l'atelier → tableau de bord.

## Structure

```
app/
  (app)/page.tsx                 Accueil : stats semaine, retards, reste à encaisser, filtres
  (app)/commandes/nouvelle       Nouvelle commande (+ nouveau client à la volée, photos, acompte)
  (app)/commandes/[id]           Détail : étapes, encaissement, statut suivant, WhatsApp
  (app)/clients                  Liste + recherche + ajout
  (app)/clients/[id]             Mesures homme/femme, remarques, historique des commandes
  connexion, bienvenue, auth/callback
  actions.ts                     Toutes les écritures (server actions)
lib/                             Supabase, atelier courant, mesures, statuts, formatage
supabase/migrations/0001_init.sql
```

## Sécurité (multi-ateliers)

Chaque table porte un `atelier_id` et la RLS limite tout à `est_membre(atelier_id)`.
Les clés étrangères composites empêchent de rattacher une commande ou un paiement
à un autre atelier. Les photos sont dans un bucket privé, rangées par `atelier_id/`,
affichées via des URL signées d'une heure.

## Pas encore fait (volontairement)

- Connexion par numéro de téléphone (OTP SMS) — à brancher quand un fournisseur SMS est choisi
- Inviter un employé / apprenti dans l'atelier (`membres.role = 'employe'`)
- Notes vocales sur la fiche client
- Abonnement payant (Wave / Orange Money via un agrégateur)
- Icônes PWA (`public/manifest.webmanifest` → `icons`)
- Mode hors ligne
