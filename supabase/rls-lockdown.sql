-- ============================================================================
--  Tiki Boat — Verrouillage RLS (Row Level Security)
-- ============================================================================
--  À exécuter dans Supabase → SQL Editor (PAS via Prisma : le RLS est une
--  préoccupation Supabase, pas du schéma Prisma).
--
--  Principe : l'application n'accède JAMAIS à la base avec la clé `anon`.
--    - Prisma  → connexion via DATABASE_URL = rôle `postgres` (propriétaire) → bypasse RLS
--    - Upload  → clé `service_role` (serveur uniquement)                    → bypasse RLS
--  Donc : RLS activé + AUCUNE policy = personne ne peut lire/écrire via l'API
--  publique PostgREST (clé anon), pendant que l'app continue de tout faire.
--
--  ⚠️ Hypothèse : ce site est le SEUL consommateur de ce projet Supabase.
--     Si tu as une autre app / intégration qui utilise la clé anon, préviens
--     avant d'exécuter (il faudrait alors des policies ciblées).
-- ============================================================================

-- --- 1. AUDIT (lecture seule) — exécute d'abord et regarde le résultat --------

-- 1a. Statut RLS de chaque table du schéma public
--     rls_active = false  ->  table exposée à la clé anon (à corriger)
select relname                as table_name,
       relrowsecurity        as rls_active,
       relforcerowsecurity   as rls_forced
from pg_class
where relnamespace = 'public'::regnamespace and relkind = 'r'
order by relname;

-- 1b. Policies déjà en place (pour ne rien casser)
select tablename, policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

-- 1c. Ce que les rôles publics ont le droit de faire aujourd'hui
select table_name, grantee,
       string_agg(privilege_type, ', ' order by privilege_type) as privileges
from information_schema.role_table_grants
where table_schema = 'public' and grantee in ('anon', 'authenticated')
group by table_name, grantee
order by table_name, grantee;


-- --- 2. VERROUILLAGE — exécute après avoir regardé l'audit --------------------
--     Idempotent : sans danger même si le RLS est déjà activé quelque part.

alter table public."Reservation"        enable row level security;
alter table public."Excursion"          enable row level security;
alter table public."BlogPost"           enable row level security;
alter table public."SiteContent"        enable row level security;
alter table public."GalleryItem"        enable row level security;
alter table public."Availability"       enable row level security;
alter table public."_prisma_migrations" enable row level security;

-- Aucune CREATE POLICY : RLS actif sans policy = deny-all pour anon/authenticated.

-- Ceinture + bretelles : on retire aussi les droits par défaut que Supabase
-- accorde aux rôles publics, pour que ces tables disparaissent complètement
-- de l'API PostgREST publique. Prisma (postgres) et service_role ne sont pas
-- concernés — ils gardent tous leurs droits.
revoke all on all tables in schema public from anon, authenticated;

-- Empêche les FUTURES tables créées par Prisma d'être ré-exposées à anon
alter default privileges in schema public revoke all on tables from anon, authenticated;


-- --- 3. VÉRIFICATION post-verrouillage ---------------------------------------
--     Toutes les tables doivent maintenant montrer rls_active = true.
select relname as table_name, relrowsecurity as rls_active
from pg_class
where relnamespace = 'public'::regnamespace and relkind = 'r'
order by relname;
