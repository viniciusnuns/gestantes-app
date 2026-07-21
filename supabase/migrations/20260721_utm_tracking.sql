alter table pending_checkouts
  add column if not exists utm_data jsonb;

alter table users
  add column if not exists utm_data jsonb;
