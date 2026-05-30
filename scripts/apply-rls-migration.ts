#!/usr/bin/env node

/**
 * Apply RLS migration to Supabase
 * Usage: npx tsx scripts/apply-rls-migration.ts
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY environment variable
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://odirmtmompghjgmhotml.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
  console.error('')
  console.error('Usage:')
  console.error('  SUPABASE_SERVICE_ROLE_KEY=your-key npx tsx scripts/apply-rls-migration.ts')
  console.error('')
  console.error('Get your Service Role Key from:')
  console.error('  1. Supabase Dashboard > gestantes-app project')
  console.error('  2. Settings > API')
  console.error('  3. Copy the "Service Role Key" value')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function applyMigration() {
  try {
    console.log('📝 Reading migration SQL...')
    const migrationPath = path.join(__dirname, '../supabase/migrations/007_enable_rls_policies.sql')
    const sql = fs.readFileSync(migrationPath, 'utf-8')

    console.log('🚀 Applying RLS migration to Supabase...')
    console.log(`   URL: ${SUPABASE_URL}`)
    console.log('')

    // Execute SQL directly via Supabase SQL endpoint
    const { error, data } = await supabase.rpc('exec_sql_as_admin', { sql })

    if (error) {
      console.error('❌ RPC method not available. Manual approach required.')
      console.log('')
      console.log('📋 SQL to execute manually in Supabase Dashboard:')
      console.log('─'.repeat(60))
      console.log(sql)
      console.log('─'.repeat(60))
      console.log('')
      console.log('Steps:')
      console.log('  1. Open: https://app.supabase.com')
      console.log('  2. Select your "gestantes-app" project')
      console.log('  3. Go to SQL Editor > New Query')
      console.log('  4. Paste the SQL above')
      console.log('  5. Click Run')
      process.exit(0)
    }

    console.log('✅ Migration applied successfully!')
    console.log('🎉 RLS policies are now active')
    console.log('')
    console.log('Next steps:')
    console.log('  1. Restart your dev server: npm run dev')
    console.log('  2. Test creating a new account')
    console.log('  3. Verify RLS isolation with multiple accounts')
  } catch (err: any) {
    console.error('❌ Error applying migration:', err.message)
    console.log('')
    console.log('📋 SQL to execute manually in Supabase Dashboard:')
    console.log('─'.repeat(60))

    try {
      const migrationPath = path.join(__dirname, '../supabase/migrations/007_enable_rls_policies.sql')
      const sql = fs.readFileSync(migrationPath, 'utf-8')
      console.log(sql)
    } catch (readErr) {
      console.error('Could not read migration file')
    }

    console.log('─'.repeat(60))
    process.exit(1)
  }
}

applyMigration()
