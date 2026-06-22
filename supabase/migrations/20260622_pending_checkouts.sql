-- Tabela para pagamentos pendentes (PIX/Boleto aguardando confirmação)
CREATE TABLE IF NOT EXISTS pending_checkouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asaas_payment_id text UNIQUE NOT NULL,
  asaas_customer_id text NOT NULL,
  email text NOT NULL,
  name text NOT NULL,
  password_hash text NOT NULL,
  billing_type text NOT NULL CHECK (billing_type IN ('PIX', 'CREDIT_CARD', 'BOLETO')),
  value numeric(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'PENDING',
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '24 hours')
);

CREATE INDEX IF NOT EXISTS pending_checkouts_payment_id ON pending_checkouts(asaas_payment_id);
CREATE INDEX IF NOT EXISTS pending_checkouts_email ON pending_checkouts(email);

-- RLS: apenas funções de serviço acessam
ALTER TABLE pending_checkouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service_role_only" ON pending_checkouts
  USING (false);

GRANT ALL ON pending_checkouts TO service_role;
