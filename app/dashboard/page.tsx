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

  // Only fetch weddings if user is an admin
  let weddings: WeddingWithDetails[] = []
  if (profile?.is_admin) {
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
    
    weddings = (ownedWeddings?.map(ow => ow.weddings).filter(Boolean) || []) as unknown as WeddingWithDetails[]
  }

  // Show coming soon page for non-admins
  if (!profile?.is_admin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">Memory Album</h1>
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

        {/* Coming Soon Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 rounded-full mb-6">
              <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Coming Soon!</h2>
            <p className="text-xl text-gray-600 mb-8">
              We're working on something special for you.
            </p>
            
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Your Wedding Memory Albums</h3>
              <p className="text-gray-600 mb-6">
                Soon you'll be able to create and manage beautiful memory albums for your wedding. 
                Guests will be able to share photos and memories that will be automatically organized 
                using AI technology.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-3">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">Photo Collection</h4>
                  <p className="text-sm text-gray-600">Gather memories from all your guests</p>
                </div>
                
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-3">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">AI Organization</h4>
                  <p className="text-sm text-gray-600">Smart categorization of memories</p>
                </div>
                
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-3">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">Beautiful Albums</h4>
                  <p className="text-sm text-gray-600">Cherish memories forever</p>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Check back soon or contact support if you need immediate assistance.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

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