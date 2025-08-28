import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase-admin';
import QRCodeGenerator from '@/components/wedding-config/QRCodeGenerator';

export default async function WeddingSuccessPage({ 
  params 
}: { 
  params: { wedding_slug: string } 
}) {
  const { data: wedding, error } = await supabaseAdmin
    .from('weddings')
    .select(`
      *,
      bride:bride_details!weddings_bride_id_fkey(*),
      groom:groom_details!weddings_groom_id_fkey(*)
    `)
    .eq('slug', params.wedding_slug)
    .single();

  if (error || !wedding) {
    notFound();
  }

  const weddingUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://memories.love'}/${wedding.slug}`;
  const brideName = wedding.bride?.display_name || wedding.bride?.name || 'Bride';
  const groomName = wedding.groom?.display_name || wedding.groom?.name || 'Groom';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Congratulations! Your Wedding Page is Ready
          </h1>
          <p className="text-lg text-gray-600">
            {brideName} & {groomName}'s memory collection page has been created successfully
          </p>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 space-y-6">
            {/* Wedding URL */}
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <h3 className="font-semibold text-purple-900 mb-2">Your Wedding URL</h3>
              <p className="text-lg font-mono text-purple-700 break-all">{weddingUrl}</p>
              <div className="mt-3 flex space-x-2">
                <Link
                  href={`/${wedding.slug}`}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700"
                >
                  View Wedding Page
                </Link>
                <button
                  onClick={() => navigator.clipboard.writeText(weddingUrl)}
                  className="px-4 py-2 bg-white text-purple-600 border border-purple-600 rounded-lg font-medium hover:bg-purple-50"
                >
                  Copy URL
                </button>
              </div>
            </div>

            {/* QR Code Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">QR Code for Easy Sharing</h3>
              <QRCodeGenerator 
                url={weddingUrl} 
                size={256}
                theme={{ primary: wedding.theme_color }}
              />
            </div>

            {/* Next Steps */}
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <h3 className="font-semibold text-yellow-900 mb-3">Next Steps</h3>
              <div className="space-y-3">
                {!wedding.is_active && (
                  <div className="flex items-start">
                    <span className="text-yellow-600 mt-0.5 mr-2">⚠️</span>
                    <div>
                      <p className="font-medium text-yellow-900">Activate Your Wedding Page</p>
                      <p className="text-sm text-yellow-800">
                        Your page is currently inactive. Activate it when you're ready for guests to see it.
                      </p>
                      <Link
                        href={`/${wedding.slug}/config`}
                        className="inline-block mt-2 text-sm font-medium text-yellow-900 hover:text-yellow-700"
                      >
                        Go to Settings →
                      </Link>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start">
                  <span className="text-green-600 mt-0.5 mr-2">📋</span>
                  <div>
                    <p className="font-medium text-gray-900">Import Guest List</p>
                    <p className="text-sm text-gray-700">
                      Upload your guest list from Zola or add guests manually.
                    </p>
                    <Link
                      href={`/${wedding.slug}/guests`}
                      className="inline-block mt-2 text-sm font-medium text-purple-600 hover:text-purple-700"
                    >
                      Manage Guests →
                    </Link>
                  </div>
                </div>

                <div className="flex items-start">
                  <span className="text-blue-600 mt-0.5 mr-2">🎨</span>
                  <div>
                    <p className="font-medium text-gray-900">Customize Your Page</p>
                    <p className="text-sm text-gray-700">
                      Adjust colors, add welcome messages, and personalize your page.
                    </p>
                    <Link
                      href={`/${wedding.slug}/config`}
                      className="inline-block mt-2 text-sm font-medium text-purple-600 hover:text-purple-700"
                    >
                      Edit Settings →
                    </Link>
                  </div>
                </div>

                <div className="flex items-start">
                  <span className="text-purple-600 mt-0.5 mr-2">📤</span>
                  <div>
                    <p className="font-medium text-gray-900">Share with Guests</p>
                    <p className="text-sm text-gray-700">
                      Print the QR code, add it to invitations, or share the link digitally.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Link
                href={`/${wedding.slug}/config`}
                className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg font-medium text-center hover:bg-purple-700"
              >
                Configure Settings
              </Link>
              <Link
                href={`/${wedding.slug}`}
                className="flex-1 px-4 py-3 bg-white text-purple-600 border border-purple-600 rounded-lg font-medium text-center hover:bg-purple-50"
              >
                Preview Wedding Page
              </Link>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Need help? Check out our <Link href="/help" className="text-purple-600 hover:text-purple-700">setup guide</Link> or contact support.</p>
        </div>
      </div>
    </div>
  );
}