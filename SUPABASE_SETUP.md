# Guia de Configuração Supabase

## ✅ Passo 1: Criar as Tabelas no Supabase

1. Abra o Supabase: https://supabase.com
2. Entre no seu projeto "gestantes-em-movimento"
3. Clique em **SQL Editor** (ícone de banco de dados no menu lateral)
4. Clique em **New Query**
5. Cole TODO o SQL do arquivo `supabase-setup.sql` (arquivo neste diretório)
6. Clique em **Run** (botão azul com play)
7. Espere a mensagem "Success" ✅

## ✅ Passo 2: Habilitar Email Confirmation (Opcional mas Recomendado)

1. No Supabase, vá para **Authentication** → **Providers**
2. Clique em **Email** 
3. Marque: "Confirm email" 
4. Salve

Isso força o usuário a confirmar o email antes de usar o app.

## ✅ Passo 3: Configurar URLs de Redirecionamento

1. Vá para **Authentication** → **URL Configuration**
2. Em "Redirect URLs", adicione:
   - `http://localhost:3000`
   - `https://gestantes-app.vercel.app`
3. Salve

## ✅ Passo 4: Testar a Conexão

Na sua máquina, rode:
```bash
npm run dev
```

Abra http://localhost:3000 no navegador.

Se ver a tela de boas-vindas normal, a conexão Supabase está funcionando! ✅

## 📊 Tabelas Criadas:

### users
Armazena dados de cada gestante:
- id, email, name, week, phone
- saúde (healthy_pregnancy, had_intercurrence, doctor_approved)
- objetivos e desconfortos

### completed_activities
Rastreia cada exercício completado:
- user_id, exercise_id, exercise_name, completed_at, duration_minutes

### user_progress
Resume o progresso de cada usuária:
- user_id, points, active_days, current_streak, total_exercises

---

## 🔒 Segurança

Row Level Security (RLS) ativado:
- Cada usuária só pode ver seus próprios dados
- Impossível uma usuária acessar dados de outra
- Seguro para produção

---

## 🚀 Próximo Passo

Após completar os passos acima, avise que está pronto para que eu integre o login/cadastro no app!
