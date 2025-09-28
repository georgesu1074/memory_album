import { createAdminClient } from '@/lib/supabase/admin'

const seedData = async () => {
  const supabase = createAdminClient()
  
  console.log('🌱 Seeding database...')

  try {
    // First create the wedding
    const { data: wedding, error: weddingError } = await supabase
      .from('weddings')
      .insert({
        slug: 'test-wedding-2024',
        wedding_date: '2024-12-31',
        theme_color: '#8B5CF6',
        is_active: true,
        metadata: { test: true }
      })
      .select()
      .single()

    if (weddingError) throw weddingError
    console.log('✅ Created test wedding:', wedding.slug)

    // Create groom details
    const { data: groomDetails, error: groomError } = await supabase
      .from('groom_details')
      .insert({
        wedding_id: wedding.id,
        name: 'Alex',
        display_name: 'Alex'
      })
      .select()
      .single()

    if (groomError) throw groomError
    console.log('✅ Created groom details:', groomDetails.name)

    // Create bride details  
    const { data: brideDetails, error: brideError } = await supabase
      .from('bride_details')
      .insert({
        wedding_id: wedding.id,
        name: 'Jordan',
        display_name: 'Jordan'
      })
      .select()
      .single()

    if (brideError) throw brideError
    console.log('✅ Created bride details:', brideDetails.name)

    // Update wedding with detail IDs
    const { error: updateWeddingError } = await supabase
      .from('weddings')
      .update({
        groom_id: groomDetails.id,
        bride_id: brideDetails.id
      })
      .eq('id', wedding.id)

    if (updateWeddingError) throw updateWeddingError
    console.log('✅ Linked wedding to bride and groom details')

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

    // Create test memories with guest references
    const memories = [
      {
        wedding_id: wedding.id,
        guest_id: guestData[0].id,
        memory_text: "I'll never forget when Alex tried to cook dinner for Jordan on their third date and nearly burned down the kitchen! The fire alarm went off three times, but Jordan just laughed and ordered pizza. That's when I knew they were perfect for each other.",
        memory_type: 'both',
        ai_category: 'Dating Stories',
        metadata: {}
      },
      {
        wedding_id: wedding.id,
        guest_id: guestData[1].id,
        memory_text: "Jordan's karaoke performance of 'Bohemian Rhapsody' at my birthday party was legendary. Alex couldn't stop laughing and filming. The video still makes us all smile!",
        memory_type: 'groom',
        ai_category: 'Fun Moments',
        metadata: {}
      },
      {
        wedding_id: wedding.id,
        guest_id: guestData[2].id,
        memory_text: "The day Alex graduated from medical school, Jordan was in the front row with the biggest sign and bouquet of flowers. The pride and love on both their faces brought tears to everyone's eyes.",
        memory_type: 'bride',
        ai_category: 'Milestone Moments',
        metadata: {}
      },
      {
        wedding_id: wedding.id,
        guest_name: 'Anonymous Guest', // Example of non-listed guest
        memory_text: "Watching you two grow together over the years has been such a joy. Your love story gives us all hope!",
        memory_type: 'both',
        ai_category: 'Well Wishes',
        metadata: {}
      }
    ]

    const { data: memoryData, error: memoryError } = await supabase
      .from('memories')
      .insert(memories)
      .select()

    if (memoryError) throw memoryError
    console.log(`✅ Created ${memoryData.length} test memories`)

    // Create a memory group
    const { data: group, error: groupError } = await supabase
      .from('memory_groups')
      .insert({
        wedding_id: wedding.id,
        title: 'College Days',
        summary: 'Memories from when Alex and Jordan met in college',
        memory_count: 2
      })
      .select()
      .single()

    if (groupError) throw groupError
    console.log('✅ Created test memory group')

    // Update some memories to belong to the group
    const { error: updateMemoryError } = await supabase
      .from('memories')
      .update({ group_id: group.id })
      .in('id', [memoryData[0].id, memoryData[1].id])

    if (updateMemoryError) throw updateMemoryError
    console.log('✅ Linked memories to group')

    console.log('\n🎉 Seed data created successfully!')
    console.log(`\n📍 Test your app at: http://localhost:3002/${wedding.slug}`)
    console.log('\n👥 Test Guests:')
    guestData.slice(0, 3).forEach(g => {
      console.log(`   - ${g.full_name}`)
    })

  } catch (error) {
    console.error('❌ Seed data failed:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  seedData()
}

export default seedData