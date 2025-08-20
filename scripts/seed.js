#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedDatabase() {
  console.log('🌱 Seeding database...')
  
  try {
    // Create test wedding
    const { data: wedding, error: weddingError } = await supabase
      .from('weddings')
      .insert({
        slug: 'test-wedding-2024',
        couple_names: 'Alex & Jordan',
        wedding_date: '2024-12-31',
        theme_color: '#8B5CF6',
        is_active: true,
        metadata: { test: true }
      })
      .select()
      .single()

    if (weddingError) {
      if (weddingError.code === '23505') {
        console.log('⚠️  Test wedding already exists, skipping...')
        const { data: existingWedding } = await supabase
          .from('weddings')
          .select()
          .eq('slug', 'test-wedding-2024')
          .single()
        return console.log(`\n📍 Test app at: http://localhost:3002/${existingWedding.slug}`)
      }
      throw weddingError
    }
    
    console.log('✅ Created test wedding:', wedding.slug)

    // Create test guests
    const guests = [
      { first_name: 'John', last_name: 'Smith', email: 'john@example.com' },
      { first_name: 'Jane', last_name: 'Doe', email: 'jane@example.com' },
      { first_name: 'Michael', last_name: 'Johnson', email: null },
      { first_name: 'Emily', last_name: 'Williams', email: 'emily@example.com' },
      { first_name: 'David', last_name: 'Brown', email: null },
      { first_name: 'Sarah', last_name: 'Davis', email: 'sarah@example.com' },
      { first_name: 'Robert', last_name: 'Miller', email: null },
      { first_name: 'Lisa', last_name: 'Wilson', email: 'lisa@example.com' },
      { first_name: 'James', last_name: 'Moore', email: null },
      { first_name: 'Mary', last_name: 'Taylor', email: 'mary@example.com' }
    ]

    const { data: guestData, error: guestError } = await supabase
      .from('wedding_guests')
      .insert(
        guests.map(g => ({ ...g, wedding_id: wedding.id }))
      )
      .select()

    if (guestError) throw guestError
    console.log(`✅ Created ${guestData.length} test guests`)

    // Create test memories
    const memories = [
      {
        wedding_id: wedding.id,
        guest_id: guestData[0].id,
        memory_text: "I'll never forget when Alex tried to cook dinner for Jordan on their third date and nearly burned down the kitchen! The fire alarm went off three times, but Jordan just laughed and ordered pizza. That's when I knew they were perfect for each other.",
        memory_type: 'both',
        ai_category: 'Dating Stories'
      },
      {
        wedding_id: wedding.id,
        guest_id: guestData[1].id,
        memory_text: "Jordan's karaoke performance of 'Bohemian Rhapsody' at my birthday party was legendary. Alex couldn't stop laughing and filming. The video still makes us all smile!",
        memory_type: 'groom',
        ai_category: 'Fun Moments'
      },
      {
        wedding_id: wedding.id,
        guest_id: guestData[2].id,
        memory_text: "The day Alex graduated from medical school, Jordan was in the front row with the biggest sign and bouquet of flowers. The pride and love on both their faces brought tears to everyone's eyes.",
        memory_type: 'bride',
        ai_category: 'Milestone Moments'
      }
    ]

    const { data: memoryData, error: memoryError } = await supabase
      .from('memories')
      .insert(memories)
      .select()

    if (memoryError) throw memoryError
    console.log(`✅ Created ${memoryData.length} test memories`)

    console.log('\n🎉 Seed data created successfully!')
    console.log(`\n📍 Test your app at: http://localhost:3002/${wedding.slug}`)
    console.log('\n👥 Sample Guests (for testing dropdown):')
    guestData.slice(0, 3).forEach(g => {
      console.log(`   - ${g.first_name} ${g.last_name}`)
    })
    
  } catch (error) {
    console.error('❌ Seed error:', error.message)
    process.exit(1)
  }
}

seedDatabase()