-- =========================================================
-- Atelier tailleurs : schéma initial (multi-ateliers + RLS)
-- =========================================================

create type statut_commande as enum ('recue', 'coupe', 'couture', 'prete', 'livree');

-- Un atelier = un client payant du SaaS
create table ateliers (
  id          uuid primary key default gen_random_uuid(),
  nom         text not null,
  telephone   text,
  created_at  timestamptz not null default now()
);

-- Qui a accès à quel atelier
create table membres (
  atelier_id  uuid not null references ateliers (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  role        text not null default 'proprietaire' check (role in ('proprietaire', 'employe')),
  created_at  timestamptz not null default now(),
  primary key (atelier_id, user_id)
);
create index membres_user_idx on membres (user_id);

create table clients (
  id              uuid primary key default gen_random_uuid(),
  atelier_id      uuid not null references ateliers (id) on delete cascade,
  nom             text not null,
  telephone       text,
  genre           text not null default 'homme' check (genre in ('homme', 'femme')),
  mesures         jsonb not null default '{}'::jsonb,
  mesures_maj_le  timestamptz,
  notes           text,
  created_at      timestamptz not null default now(),
  unique (id, atelier_id)
);
create index clients_atelier_idx on clients (atelier_id, nom);

create table commandes (
  id              uuid primary key default gen_random_uuid(),
  atelier_id      uuid not null references ateliers (id) on delete cascade,
  client_id       uuid not null,
  numero          integer,
  modele          text not null,
  statut          statut_commande not null default 'recue',
  date_livraison  date,
  prix            integer not null default 0 check (prix >= 0),
  assigne_a       text,
  photo_tissu     text,
  photo_modele    text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (id, atelier_id),
  -- empêche de rattacher une commande au client d'un autre atelier
  foreign key (client_id, atelier_id) references clients (id, atelier_id) on delete restrict
);
create index commandes_atelier_idx on commandes (atelier_id, statut, date_livraison);

create table paiements (
  id           uuid primary key default gen_random_uuid(),
  atelier_id   uuid not null references ateliers (id) on delete cascade,
  commande_id  uuid not null,
  montant      integer not null check (montant > 0),
  created_at   timestamptz not null default now(),
  foreign key (commande_id, atelier_id) references commandes (id, atelier_id) on delete cascade
);
create index paiements_commande_idx on paiements (commande_id);

-- Numéro de commande lisible, par atelier (048, 049…)
create function attribuer_numero() returns trigger language plpgsql as $$
begin
  perform pg_advisory_xact_lock(hashtext(new.atelier_id::text));
  select coalesce(max(numero), 0) + 1 into new.numero from commandes where atelier_id = new.atelier_id;
  return new;
end $$;
create trigger commandes_numero before insert on commandes
  for each row execute function attribuer_numero();

create function maj_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create trigger commandes_maj before update on commandes
  for each row execute function maj_updated_at();

-- Vue pratique : commande + client + argent déjà payé + reste
create view commandes_resume with (security_invoker = true) as
select
  c.*,
  cl.nom        as client_nom,
  cl.telephone  as client_telephone,
  coalesce(p.total, 0)::integer                          as total_paye,
  greatest(c.prix - coalesce(p.total, 0), 0)::integer    as reste
from commandes c
join clients cl on cl.id = c.client_id
left join (select commande_id, sum(montant) as total from paiements group by commande_id) p
  on p.commande_id = c.id;

-- =========================================================
-- Sécurité : chaque atelier ne voit que ses propres données
-- =========================================================
create function est_membre(a uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from membres where atelier_id = a and user_id = auth.uid());
$$;

alter table ateliers  enable row level security;
alter table membres   enable row level security;
alter table clients   enable row level security;
alter table commandes enable row level security;
alter table paiements enable row level security;

create policy "lecture atelier" on ateliers for select using (est_membre(id));
create policy "modif atelier"   on ateliers for update using (est_membre(id)) with check (est_membre(id));
create policy "lecture membres" on membres  for select using (est_membre(atelier_id));

create policy "clients atelier"   on clients   for all using (est_membre(atelier_id)) with check (est_membre(atelier_id));
create policy "commandes atelier" on commandes for all using (est_membre(atelier_id)) with check (est_membre(atelier_id));
create policy "paiements atelier" on paiements for all using (est_membre(atelier_id)) with check (est_membre(atelier_id));

-- Création d'un atelier + rattachement du créateur comme propriétaire
create function creer_atelier(p_nom text, p_telephone text default null) returns uuid
language plpgsql security definer set search_path = public as $$
declare nouvel_id uuid;
begin
  if auth.uid() is null then raise exception 'Non connecté'; end if;
  insert into ateliers (nom, telephone) values (p_nom, p_telephone) returning id into nouvel_id;
  insert into membres (atelier_id, user_id, role) values (nouvel_id, auth.uid(), 'proprietaire');
  return nouvel_id;
end $$;
revoke all on function creer_atelier(text, text) from public, anon;
grant execute on function creer_atelier(text, text) to authenticated;

-- =========================================================
-- Photos (tissu / modèle) : bucket privé, rangé par atelier
-- chemin : <atelier_id>/<fichier>
-- =========================================================
insert into storage.buckets (id, name, public) values ('photos', 'photos', false)
on conflict (id) do nothing;

create policy "photos lecture" on storage.objects for select to authenticated
  using (bucket_id = 'photos' and public.est_membre(((storage.foldername(name))[1])::uuid));
create policy "photos ajout" on storage.objects for insert to authenticated
  with check (bucket_id = 'photos' and public.est_membre(((storage.foldername(name))[1])::uuid));
create policy "photos suppression" on storage.objects for delete to authenticated
  using (bucket_id = 'photos' and public.est_membre(((storage.foldername(name))[1])::uuid));
