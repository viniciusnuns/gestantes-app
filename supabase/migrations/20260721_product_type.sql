-- Tipo de produto comprado pela usuária
alter table users
  add column if not exists product_type text not null default 'full';

-- Garante que todas as existentes ficam como 'full'
update users set product_type = 'full' where product_type is null or product_type = '';

-- Produto comprado em cada transação
alter table pending_checkouts
  add column if not exists product_type text not null default 'full';
