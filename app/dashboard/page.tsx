import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Settings, Users, Calendar, LogOut } from 'lucide-react'
import type { WeddingWithDetails } from '@/types/wedding'
import UserAvatar from '@/components/UserAvatar'
import ErrorAlert from '@/components/ErrorAlert'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get weddings the user owns
  const { data: ownedWeddings } = await supabase
    .from('wedding_owners')
    .select(`
      wedding_id,
      weddings (
        *,
        bride:bride_details!weddings_bride_id_fkey(*),
        groom:groom_details!weddings_groom_id_fkey(*)
      )
    `)
    .eq('user_id', user.id)

  const weddings = (ownedWeddings?.map(ow => ow.weddings).filter(Boolean) || []) as unknown as WeddingWithDetails[]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Memory Album Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <UserAvatar 
                  avatarUrl={profile?.avatar_url}
                  name={profile?.full_name}
                  email={user.email}
                  size="sm"
                />
                <span className="text-sm text-gray-700">{profile?.full_name || user.email}</span>
                {profile?.is_admin && (
                  <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">Admin</span>
                )}
              </div>
              <Link
                href="/auth/signout"
                className="text-gray-500 hover:text-gray-700"
              >
                <LogOut className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        <ErrorAlert />
        
        {/* Admin Panel Link */}
        {profile?.is_admin && (
          <div className="mb-6">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Admin Panel
            </Link>
          </div>
        )}

        {/* Page Title */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Your Weddings</h2>
          <p className="mt-2 text-gray-600">Manage your wedding memory albums</p>
        </div>

        {/* Create New Wedding Button */}
        <Link
          href="/weddings/create"
          className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors mb-8"
        >
          <Plus className="w-5 h-5" />
          Create New Wedding
        </Link>

        {/* Weddings Grid */}
        {weddings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No weddings yet</h3>
            <p className="text-gray-600 mb-6">Create your first wedding memory album to get started</p>
            <Link
              href="/weddings/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Wedding
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {weddings.map((wedding) => (
              <div key={wedding.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div 
                  className="h-32 bg-gradient-to-br from-purple-400 to-pink-400"
                  style={{
                    background: wedding.theme_color 
                      ? `linear-gradient(135deg, ${wedding.theme_color}, ${(wedding as any).secondary_color || wedding.theme_color})`
                      : undefined
                  }}
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {wedding.bride?.display_name || wedding.bride?.name || 'Bride'} & {wedding.groom?.display_name || wedding.groom?.name || 'Groom'}
                  </h3>
                  
                  {wedding.wedding_date && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                      <Calendar className="w-4 h-4" />
                      {new Date(wedding.wedding_date + 'T00:00:00').toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      wedding.is_active 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {wedding.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/${wedding.slug}`}
                      className="flex-1 px-3 py-2 text-center text-purple-600 border border-purple-600 rounded hover:bg-purple-50 transition-colors text-sm"
                    >
                      View
                    </Link>
                    <Link
                      href={`/${wedding.slug}/config`}
                      className="flex-1 px-3 py-2 text-center bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm"
                    >
                      Configure
                    </Link>
                    <Link
                      href={`/${wedding.slug}/guests`}
                      className="flex-1 px-3 py-2 text-center text-purple-600 border border-purple-600 rounded hover:bg-purple-50 transition-colors text-sm"
                    >
                      Guests
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}