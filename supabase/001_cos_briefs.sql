-- Run in the COS Supabase project (SQL editor). Safe to re-run.
create extension if not exists pg_trgm;

create table if not exists cos_briefs (
  id            uuid primary key default gen_random_uuid(),
  run           text not null,
  created_at    timestamptz not null default now(),
  headline      text not null,
  money_status  text,
  html          text not null,
  text          text not null default '',
  search_text   text generated always as (lower(headline || ' ' || text)) stored
);
create index if not exists cos_briefs_created_idx on cos_briefs (created_at desc);
create index if not exists cos_briefs_run_idx on cos_briefs (run);
create index if not exists cos_briefs_search_idx on cos_briefs using gin (search_text gin_trgm_ops);

-- Only the site's server-side service key reads/writes this. No public access.
alter table cos_briefs enable row level security;
