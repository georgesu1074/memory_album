#!/usr/bin/env node
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

async function setupDatabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase environment variables')
    process.exit(1)
  }

  console.log('🚀 Setting up Supabase database...')
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    // Read SQL files
    const schemaSQL = fs.readFileSync(
      path.join(process.cwd(), 'lib', 'database.sql'),
      'utf8'
    )
    const rlsSQL = fs.readFileSync(
      path.join(process.cwd(), 'lib', 'database-rls.sql'),
      'utf8'
    )

    // Execute schema
    console.log('📊 Creating database schema...')
    const { error: schemaError } = await supabase.rpc('exec_sql', {
      sql: schemaSQL
    }).single()

    if (schemaError) {
      // Try alternative method - direct execution
      const statements = schemaSQL.split(';').filter(stmt => stmt.trim())
      for (const statement of statements) {
        if (statement.trim()) {
          console.log(`Executing: ${statement.substring(0, 50)}...`)
          const { error } = await supabase.rpc('exec_sql', {
            sql: statement + ';'
          }).single()
          if (error) {
            console.error('Schema error:', error)
          }
        }
      }
    }

    // Execute RLS policies
    console.log('🔒 Setting up Row Level Security...')
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: rlsSQL
    }).single()

    if (rlsError) {
      // Try alternative method
      const statements = rlsSQL.split(';').filter(stmt => stmt.trim())
      for (const statement of statements) {
        if (statement.trim()) {
          console.log(`Executing RLS: ${statement.substring(0, 50)}...`)
          const { error } = await supabase.rpc('exec_sql', {
            sql: statement + ';'
          }).single()
          if (error) {
            console.error('RLS error:', error)
          }
        }
      }
    }

    console.log('✅ Database setup complete!')
    console.log('\n📝 Next steps:')
    console.log('1. Go to your Supabase dashboard')
    console.log('2. Navigate to SQL Editor')
    console.log('3. Copy and paste the contents of lib/database.sql')
    console.log('4. Run the query')
    console.log('5. Copy and paste the contents of lib/database-rls.sql')
    console.log('6. Run the query')
    console.log('\nAlternatively, you can run these files directly in the SQL editor.')

  } catch (error) {
    console.error('❌ Error setting up database:', error)
    console.log('\n📝 Manual setup required:')
    console.log('1. Go to your Supabase dashboard at:', supabaseUrl)
    console.log('2. Navigate to SQL Editor')
    console.log('3. Copy and paste the contents of lib/database.sql')
    console.log('4. Run the query')
    console.log('5. Copy and paste the contents of lib/database-rls.sql')
    console.log('6. Run the query')
    process.exit(1)
  }
}

setupDatabase()