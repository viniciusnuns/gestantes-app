alter table pending_checkouts
  add column if not exists fbp text,
  add column if not exists fbc text,
  add column if not exists client_ip text,
  add column if not exists user_agent text;
