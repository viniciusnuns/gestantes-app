create table if not exists checkout_errors (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  billing_type text,
  email text,
  error_message text,
  error_type text, -- 'create_exception', 'webhook_exception', 'webhook_user_create'
  metadata jsonb,
  resolved boolean default false
);

create index if not exists checkout_errors_created_at_idx on checkout_errors (created_at desc);
create index if not exists checkout_errors_email_idx on checkout_errors (email);
create index if not exists checkout_errors_resolved_idx on checkout_errors (resolved) where resolved = false;
