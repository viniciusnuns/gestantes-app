#!/usr/bin/env node

/**
 * Apply RPC bootstrap migration to Supabase
 * Usage: npx tsx scripts/apply-rpc-migration.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function applyMigration() {
  try {
    console.log('📝 Reading migration SQL...')
    const sql = fs.readFileSync('./supabase/migrations/create_rpc_bootstrap.sql', 'utf-8')

    console.log('🚀 Applying RPC bootstrap migration...')
    const { error } = await supabase.rpc('_execute_sql', { sql })

    if (error) {
      // Try direct approach if RPC doesn't exist
      console.log('⚠️  Direct RPC failed, trying alternative approach...')
      console.log('📌 Please manually execute the SQL in Supabase dashboard:')
      console.log('  1. Go to SQL Editor')
      console.log('  2. Create a new query')
      console.log('  3. Copy-paste the contents of supabase/migrations/create_rpc_bootstrap.sql')
      console.log('  4. Execute')
      console.log('\n--- SQL ---')
      console.log(sql)
      process.exit(0)
    }

    console.log('✅ Migration applied successfully!')
    console.log('🎉 RPC function get_page_data_bootstrap created')
  } catch (err) {
    console.error('❌ Error applying migration:', err)
    console.log('\n📌 Manual fallback: Execute the SQL in Supabase dashboard')
    process.exit(1)
  }
}

applyMigration()
