import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, Calendar, Heart, Settings, ArrowLeft, TrendingUp } from 'lucide-react'
import UserAvatar from '@/components/UserAvatar'

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    redirect('/dashboard')
  }

  // Get statistics
  const { count: totalUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })

  const { count: totalWeddings } = await supabase
    .from('weddings')
    .select('*', { count: 'exact', head: true })

  const { count: activeWeddings } = await supabase
    .from('weddings')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  const { count: totalMemories } = await supabase
    .from('memories')
    .select('*', { count: 'exact', head: true })

  // Get recent weddings
  const { data: recentWeddings } = await supabase
    .from('weddings')
    .select(`
      *,
      bride:bride_details!weddings_bride_id_fkey(*),
      groom:groom_details!weddings_groom_id_fkey(*)
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  // Get recent users
  const { data: recentUsers } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{totalUsers || 0}</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Weddings</p>
                <p className="text-3xl font-bold text-gray-900">{totalWeddings || 0}</p>
              </div>
              <Heart className="w-8 h-8 text-pink-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Weddings</p>
                <p className="text-3xl font-bold text-gray-900">{activeWeddings || 0}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Memories</p>
                <p className="text-3xl font-bold text-gray-900">{totalMemories || 0}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Management Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link
            href="/admin/users"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4">
              <Users className="w-10 h-10 text-purple-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Manage Users</h3>
                <p className="text-sm text-gray-600">View and manage all users, grant admin access</p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/weddings"
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-4">
              <Heart className="w-10 h-10 text-pink-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Manage Weddings</h3>
                <p className="text-sm text-gray-600">View all weddings, manage ownership</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Weddings */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Recent Weddings</h3>
            </div>
            <div className="p-6">
              {recentWeddings && recentWeddings.length > 0 ? (
                <div className="space-y-4">
                  {recentWeddings.map((wedding) => (
                    <div key={wedding.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {wedding.bride?.name || 'Bride'} & {wedding.groom?.name || 'Groom'}
                        </p>
                        <p className="text-sm text-gray-600">/{wedding.slug}</p>
                      </div>
                      <Link
                        href={`/${wedding.slug}/config`}
                        className="text-purple-600 hover:text-purple-700 text-sm"
                      >
                        Manage
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No weddings yet</p>
              )}
            </div>
          </div>

          {/* Recent Users */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Recent Users</h3>
            </div>
            <div className="p-6">
              {recentUsers && recentUsers.length > 0 ? (
                <div className="space-y-4">
                  {recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <UserAvatar 
                          avatarUrl={user.avatar_url}
                          name={user.full_name}
                          email={user.email}
                          size="sm"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{user.full_name || 'Unknown'}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                      {user.is_admin && (
                        <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">
                          Admin
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No users yet</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}