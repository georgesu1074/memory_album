'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import QRCodeGenerator from '@/components/wedding-config/QRCodeGenerator';

interface WeddingConfig {
  id: string;
  slug: string;
  wedding_date: string;
  theme_color: string;
  secondary_color?: string;
  is_active: boolean;
  bride: {
    name: string;
    email?: string;
    display_name?: string;
  };
  groom: {
    name: string;
    email?: string;
    display_name?: string;
  };
  created_at: string;
}

export default function WeddingConfigPage() {
  const params = useParams();
  const router = useRouter();
  const weddingSlug = params.wedding_slug as string;
  
  const [wedding, setWedding] = useState<WeddingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Form state
  const [isActive, setIsActive] = useState(false);
  const [themeColor, setThemeColor] = useState('#8B5CF6');
  const [weddingDate, setWeddingDate] = useState('');

  useEffect(() => {
    fetchWeddingConfig();
  }, [weddingSlug]);

  const fetchWeddingConfig = async () => {
    try {
      const response = await fetch(`/api/weddings/${weddingSlug}/config`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Wedding not found');
        } else {
          setError('Failed to load wedding configuration');
        }
        setLoading(false);
        return;
      }

      const data = await response.json();
      setWedding(data.wedding);
      setIsActive(data.wedding.is_active);
      setThemeColor(data.wedding.theme_color);
      setWeddingDate(data.wedding.wedding_date || '');
      setLoading(false);
    } catch (err) {
      setError('Failed to load wedding configuration');
      setLoading(false);
    }
  };

  const handleActivationToggle = async () => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const endpoint = isActive 
        ? `/api/weddings/${weddingSlug}/deactivate`
        : `/api/weddings/${weddingSlug}/activate`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to update activation status');
      }

      setIsActive(!isActive);
      setSuccessMessage(isActive ? 'Wedding deactivated' : 'Wedding activated successfully!');
      
      // Update local state
      if (wedding) {
        setWedding({ ...wedding, is_active: !isActive });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update activation');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/weddings/${weddingSlug}/config`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme_color: themeColor,
          wedding_date: weddingDate || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save changes');
      }

      setSuccessMessage('Changes saved successfully!');
      
      // Update local state
      if (wedding) {
        setWedding({ 
          ...wedding, 
          theme_color: themeColor,
          wedding_date: weddingDate,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading configuration...</p>
        </div>
      </div>
    );
  }

  if (error && !wedding) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2 text-red-600">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            href="/weddings/create"
            className="text-purple-600 hover:text-purple-700 underline"
          >
            Create a new wedding
          </Link>
        </div>
      </div>
    );
  }

  if (!wedding) return null;

  const weddingUrl = `${window.location.origin}/${weddingSlug}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/${weddingSlug}`}
            className="text-purple-600 hover:text-purple-700 mb-4 inline-block"
          >
            ← Back to Wedding Page
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Wedding Configuration</h1>
          <p className="text-gray-600 mt-2">Manage your wedding page settings</p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {successMessage}
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column - Settings */}
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Basic Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Wedding URL
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={weddingUrl}
                      readOnly
                      className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-600"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(weddingUrl);
                        setSuccessMessage('URL copied to clipboard!');
                        setTimeout(() => setSuccessMessage(null), 3000);
                      }}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bride
                  </label>
                  <p className="text-gray-900">{wedding.bride.display_name || wedding.bride.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Groom
                  </label>
                  <p className="text-gray-900">{wedding.groom.display_name || wedding.groom.name}</p>
                </div>

                <div>
                  <label htmlFor="wedding-date" className="block text-sm font-medium text-gray-700 mb-1">
                    Wedding Date
                  </label>
                  <input
                    type="date"
                    id="wedding-date"
                    value={weddingDate}
                    onChange={(e) => setWeddingDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Activation Status */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Activation Status</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Wedding Page Status</p>
                    <p className="text-sm text-gray-600">
                      {isActive 
                        ? 'Your wedding page is live and accepting memories' 
                        : 'Your wedding page is in preview mode'}
                    </p>
                  </div>
                  <button
                    onClick={handleActivationToggle}
                    disabled={saving}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isActive ? 'bg-green-600' : 'bg-gray-300'
                    } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isActive ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {!isActive && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <span className="font-semibold">Preview Mode:</span> Only you can see your wedding page. 
                      Activate it when you're ready to share with guests.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Theme Settings */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Theme Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="theme-color" className="block text-sm font-medium text-gray-700 mb-1">
                    Primary Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      id="theme-color"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg"
                      placeholder="#8B5CF6"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSaveChanges}
                  disabled={saving}
                  className={`w-full px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 ${
                    saving ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - QR Code & Actions */}
          <div className="space-y-6">
            {/* QR Code */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">QR Code</h2>
              <p className="text-sm text-gray-600 mb-4">
                Share this QR code at your wedding for easy access to the memory collection page
              </p>
              <QRCodeGenerator
                url={weddingUrl}
                weddingName={`${wedding.bride.display_name || wedding.bride.name} & ${wedding.groom.display_name || wedding.groom.name}`}
              />
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Quick Actions</h2>
              <div className="space-y-3">
                <a
                  href={`/${weddingSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-center font-medium hover:bg-purple-200"
                >
                  View Wedding Page
                </a>
                <button
                  onClick={() => router.push(`/${weddingSlug}/guests`)}
                  className="block w-full px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-center font-medium hover:bg-purple-200"
                >
                  Manage Guest List
                </button>
                <button
                  onClick={() => router.push(`/${weddingSlug}/memories`)}
                  className="block w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-center font-medium hover:bg-gray-200"
                  disabled
                >
                  View Memories (Coming Soon)
                </button>
                <a
                  href={`/api/auth/google?wedding=${weddingSlug}`}
                  className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-center font-medium hover:bg-blue-700"
                >
                  Connect Google Drive
                </a>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Statistics</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">0</p>
                  <p className="text-sm text-gray-600">Memories</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">0</p>
                  <p className="text-sm text-gray-600">Photos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">0</p>
                  <p className="text-sm text-gray-600">Guests</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {new Date(wedding.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">Created</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}