import { createAdminClient } from '@/lib/supabase/admin'

const testBrideGroomDetails = async () => {
  const supabase = createAdminClient()
  
  console.log('🧪 Testing bride and groom details...\n')

  try {
    // Test 1: Fetch a wedding with details
    console.log('Test 1: Fetching wedding with details...')
    const { data: wedding, error: weddingError } = await supabase
      .from('weddings')
      .select(`
        *,
        groom:groom_details(*),
        bride:bride_details(*)
      `)
      .eq('slug', 'test-wedding-2024')
      .single()

    if (weddingError) {
      console.error('❌ Error fetching wedding:', weddingError)
      return
    }

    if (wedding) {
      console.log('✅ Wedding found:', {
        slug: wedding.slug,
        couple_names: wedding.couple_names,
        groom_id: wedding.groom_id,
        bride_id: wedding.bride_id
      })

      if (wedding.groom) {
        console.log('✅ Groom details:', {
          name: wedding.groom.name,
          display_name: wedding.groom.display_name
        })
      } else {
        console.log('⚠️ No groom details found')
      }

      if (wedding.bride) {
        console.log('✅ Bride details:', {
          name: wedding.bride.name,
          display_name: wedding.bride.display_name
        })
      } else {
        console.log('⚠️ No bride details found')
      }
    }

    // Test 2: Check if all weddings have detail records
    console.log('\nTest 2: Checking all weddings have detail records...')
    const { data: allWeddings, error: allError } = await supabase
      .from('weddings')
      .select('id, slug, couple_names, groom_id, bride_id')

    if (allError) {
      console.error('❌ Error fetching all weddings:', allError)
      return
    }

    console.log(`Found ${allWeddings?.length || 0} weddings:`)
    allWeddings?.forEach(w => {
      const hasGroomDetails = w.groom_id ? '✅' : '❌'
      const hasBrideDetails = w.bride_id ? '✅' : '❌'
      console.log(`  ${w.slug}: Groom ${hasGroomDetails}, Bride ${hasBrideDetails}`)
    })

    // Test 3: Query details tables directly
    console.log('\nTest 3: Querying detail tables directly...')
    const { data: groomDetails, error: groomError } = await supabase
      .from('groom_details')
      .select('*')
      .limit(5)

    const { data: brideDetails, error: brideError } = await supabase
      .from('bride_details')
      .select('*')
      .limit(5)

    console.log(`✅ Found ${groomDetails?.length || 0} groom detail records`)
    console.log(`✅ Found ${brideDetails?.length || 0} bride detail records`)

    console.log('\n✨ All tests completed!')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testBrideGroomDetails()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

export default testBrideGroomDetails