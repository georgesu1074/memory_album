'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Search, Calendar, Users, Eye, Settings, Loader2 } from 'lucide-react'

interface Wedding {
  id: string
  slug: string
  wedding_date: string | null
  theme_color: string
  secondary_color: string | null
  is_active: boolean
  created_at: string
  created_by: string | null
  bride: {
    name: string
    display_name: string | null
  } | null
  groom: {
    name: string
    display_name: string | null
  } | null
  _count?: {
    memories: number
    owners: number
  }
}

export default function AdminWeddingsPage() {
  const [weddings, setWeddings] = useState<Wedding[]>([])
  const [filteredWeddings, setFilteredWeddings] = useState<Wedding[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all')
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAdminAndLoadWeddings()
  }, [])

  useEffect(() => {
    // Filter weddings based on search term and active filter
    let filtered = weddings

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(wedding => 
        wedding.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wedding.bride?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wedding.groom?.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply active filter
    if (filterActive !== 'all') {
      filtered = filtered.filter(wedding => 
        filterActive === 'active' ? wedding.is_active : !wedding.is_active
      )
    }

    setFilteredWeddings(filtered)
  }, [searchTerm, filterActive, weddings])

  const checkAdminAndLoadWeddings = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/auth/login')
      return
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      router.push('/dashboard')
      return
    }

    setIsAdmin(true)
    await loadWeddings()
  }

  const loadWeddings = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('weddings')
      .select(`
        *,
        bride:bride_details!weddings_bride_id_fkey(*),
        groom:groom_details!weddings_groom_id_fkey(*)
      `)
      .order('created_at', { ascending: false })

    if (data && !error) {
      // Get counts for each wedding
      const weddingsWithCounts = await Promise.all(
        data.map(async (wedding) => {
          const { count: memoriesCount } = await supabase
            .from('memories')
            .select('*', { count: 'exact', head: true })
            .eq('wedding_id', wedding.id)

          const { count: ownersCount } = await supabase
            .from('wedding_owners')
            .select('*', { count: 'exact', head: true })
            .eq('wedding_id', wedding.id)

          return {
            ...wedding,
            _count: {
              memories: memoriesCount || 0,
              owners: ownersCount || 0
            }
          }
        })
      )
      setWeddings(weddingsWithCounts)
      setFilteredWeddings(weddingsWithCounts)
    }
    setLoading(false)
  }

  const toggleActive = async (weddingId: string, currentIsActive: boolean) => {
    const { error } = await supabase
      .from('weddings')
      .update({ is_active: !currentIsActive })
      .eq('id', weddingId)

    if (!error) {
      // Update local state
      const updatedWeddings = weddings.map(wedding => 
        wedding.id === weddingId ? { ...wedding, is_active: !currentIsActive } : wedding
      )
      setWeddings(updatedWeddings)
    } else {
      alert('Failed to update wedding status')
    }
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">Manage Weddings</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by couple names or slug..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterActive('all')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filterActive === 'all' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterActive('active')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filterActive === 'active' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilterActive('inactive')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filterActive === 'inactive' 
                  ? 'bg-gray-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              Inactive
            </button>
          </div>
        </div>

        {/* Weddings Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWeddings.map((wedding) => (
              <div key={wedding.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div 
                  className="h-24 bg-gradient-to-br from-purple-400 to-pink-400"
                  style={{
                    background: wedding.theme_color 
                      ? `linear-gradient(135deg, ${wedding.theme_color}, ${wedding.secondary_color || wedding.theme_color})`
                      : undefined
                  }}
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {wedding.bride?.display_name || wedding.bride?.name || 'Bride'} & {' '}
                    {wedding.groom?.display_name || wedding.groom?.name || 'Groom'}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">/{wedding.slug}</p>
                  
                  {wedding.wedding_date && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <Calendar className="w-4 h-4" />
                      {new Date(wedding.wedding_date + 'T00:00:00').toLocaleDateString()}
                    </div>
                  )}

                  <div className="flex items-center gap-4 mb-3 text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span>{wedding._count?.owners || 0} owners</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4 text-gray-400" />
                      <span>{wedding._count?.memories || 0} memories</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => toggleActive(wedding.id, wedding.is_active)}
                      className={`px-3 py-1 text-xs rounded-full font-medium ${
                        wedding.is_active 
                          ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {wedding.is_active ? 'Active' : 'Inactive'}
                    </button>
                    <div className="flex gap-2">
                      <Link
                        href={`/${wedding.slug}`}
                        target="_blank"
                        className="p-1 text-gray-600 hover:text-gray-900"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/${wedding.slug}/config`}
                        className="p-1 text-purple-600 hover:text-purple-900"
                      >
                        <Settings className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results Count */}
        <div className="mt-6 text-sm text-gray-600">
          Showing {filteredWeddings.length} of {weddings.length} weddings
        </div>
      </main>
    </div>
  )
}