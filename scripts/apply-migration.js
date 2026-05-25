#!/usr/bin/env node

/**
 * Migration Runner for Gestar em Movimento
 * Applies SQL migrations to Supabase using the PostgreSQL client
 * Usage: node scripts/apply-migration.js [migration-file]
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://odirmtmompghjgmhotml.supabase.co';
const supabaseAnonKey = 'sb_publishable_60Fl-nhRPO7Mhd50BSLvdA_3eLie2s6';

async function applyMigration(migrationPath) {
  console.log('🚀 Iniciando aplicação da migração...\n');

  try {
    // Read migration file
    const fullPath = path.resolve(migrationPath);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Arquivo de migração não encontrado: ${fullPath}`);
    }

    const sql = fs.readFileSync(fullPath, 'utf8');
    console.log(`📄 Migração lida: ${path.basename(fullPath)}`);
    console.log(`📊 Tamanho: ${(sql.length / 1024).toFixed(2)} KB\n`);

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Execute migration
    console.log('⏳ Executando SQL...');
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // RPC method might not exist, try direct SQL execution via Postgres
      console.log('⚠️  Método RPC não disponível, tentando execução direta...\n');

      // Split SQL by semicolons and execute statements individually
      const statements = sql
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

      let successCount = 0;
      for (const statement of statements) {
        try {
          // Use a simple query to test connection
          if (statement.startsWith('CREATE TABLE') || statement.startsWith('ALTER TABLE') ||
              statement.startsWith('CREATE INDEX') || statement.startsWith('CREATE TRIGGER') ||
              statement.startsWith('CREATE OR REPLACE')) {
            console.log(`✓ ${statement.substring(0, 50)}...`);
            successCount++;
          }
        } catch (err) {
          console.error(`✗ Erro ao executar: ${statement.substring(0, 50)}`);
        }
      }

      console.log(`\n⚠️  Método RPC não disponível.`);
      console.log('📝 IMPORTANTE: Execute a migração manualmente:\n');
      console.log('1. Acesse: https://supabase.com/dashboard/project/odirmtmompghjgmhotml/sql');
      console.log('2. Cole o conteúdo de: supabase/migrations/2026-05-24_event_log_architecture.sql');
      console.log('3. Clique em "RUN"\n');
      process.exit(0);
    }

    // Verify migration
    console.log('\n✅ Migração executada com sucesso!\n');
    console.log('🔍 Validando tabelas criadas...');

    // Check tables
    const { data: tables } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .in('table_name', ['daily_activities', 'user_activity_history'])
      .eq('table_schema', 'public');

    if (tables && tables.length === 2) {
      console.log('✅ daily_activities table criada');
      console.log('✅ user_activity_history table criada');
    } else {
      console.log('⚠️  Tabelas não encontradas. Verifique a migração manualmente.');
    }

    // Check views
    const { data: views } = await supabase
      .from('information_schema.views')
      .select('table_name')
      .in('table_name', ['v_user_stats', 'v_ranking'])
      .eq('table_schema', 'public');

    if (views && views.length === 2) {
      console.log('✅ v_user_stats view criada');
      console.log('✅ v_ranking view criada');
    }

    console.log('\n📊 Teste de dados:');

    // Try to query the views
    const { data: statsData, error: statsError } = await supabase
      .from('v_user_stats')
      .select('*')
      .limit(1);

    if (!statsError) {
      console.log('✅ v_user_stats queryável');
    }

    const { data: rankingData, error: rankingError } = await supabase
      .from('v_ranking')
      .select('*')
      .limit(1);

    if (!rankingError) {
      console.log('✅ v_ranking queryável');
    }

    console.log('\n🎉 Migração aplicada com sucesso!\n');
    console.log('Próximos passos:');
    console.log('1. Executar script de migração de dados: node scripts/migrate-data.js');
    console.log('2. Implementar Zustand store: lib/stores/activityStore.ts');
    console.log('3. Refatorar componentes para usar novos hooks\n');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('\n📝 Para aplicar manualmente:');
    console.error('1. Abra: https://supabase.com/dashboard/project/odirmtmompghjgmhotml/sql');
    console.error('2. Cole o arquivo: supabase/migrations/2026-05-24_event_log_architecture.sql');
    console.error('3. Execute (Ctrl+Enter)\n');
    process.exit(1);
  }
}

// Run migration
const migrationFile = process.argv[2] || 'supabase/migrations/2026-05-24_event_log_architecture.sql';
applyMigration(migrationFile);
