-- =========================================================
-- Abonnement : chaque atelier a une date de fin d'abonnement
-- Nouveaux ateliers : 30 jours d'essai gratuit
-- =========================================================

alter table ateliers
  add column abonnement_jusqu_au date not null default (current_date + 30);

-- Membre ET abonnement en cours
create or replace function est_membre_actif(a uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from membres m
    join ateliers at on at.id = m.atelier_id
    where m.atelier_id = a
      and m.user_id = auth.uid()
      and at.abonnement_jusqu_au >= current_date
  );
$$;

-- Abonnement expiré = plus d'accès aux données (elles restent conservées)
drop policy "clients atelier" on clients;
drop policy "commandes atelier" on commandes;
drop policy "paiements atelier" on paiements;
create policy "clients atelier"   on clients   for all using (est_membre_actif(atelier_id)) with check (est_membre_actif(atelier_id));
create policy "commandes atelier" on commandes for all using (est_membre_actif(atelier_id)) with check (est_membre_actif(atelier_id));
create policy "paiements atelier" on paiements for all using (est_membre_actif(atelier_id)) with check (est_membre_actif(atelier_id));

drop policy "photos lecture" on storage.objects;
drop policy "photos ajout" on storage.objects;
drop policy "photos suppression" on storage.objects;
create policy "photos lecture" on storage.objects for select to authenticated
  using (bucket_id = 'photos' and public.est_membre_actif(((storage.foldername(name))[1])::uuid));
create policy "photos ajout" on storage.objects for insert to authenticated
  with check (bucket_id = 'photos' and public.est_membre_actif(((storage.foldername(name))[1])::uuid));
create policy "photos suppression" on storage.objects for delete to authenticated
  using (bucket_id = 'photos' and public.est_membre_actif(((storage.foldername(name))[1])::uuid));

-- Le tailleur peut changer le nom et le téléphone de son atelier, PAS la date d'abonnement
revoke update on ateliers from authenticated, anon;
grant update (nom, telephone) on ateliers to authenticated;

-- Pour toi uniquement (SQL Editor) : prolonger l'abonnement d'un atelier
-- Exemple : select prolonger_abonnement('id-de-l-atelier', 1);
create or replace function prolonger_abonnement(p_atelier uuid, p_mois int default 1) returns date
language sql security definer set search_path = public as $$
  update ateliers
  set abonnement_jusqu_au = (greatest(abonnement_jusqu_au, current_date) + make_interval(months => p_mois))::date
  where id = p_atelier
  returning abonnement_jusqu_au;
$$;
revoke all on function prolonger_abonnement(uuid, int) from public, anon, authenticated;
