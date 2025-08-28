'use client';

import { WeddingFormData } from './WeddingSetupWizard';

interface SetupConfirmationProps {
  data: Partial<WeddingFormData>;
  updateData: (updates: Partial<WeddingFormData>) => void;
  onNext?: () => void;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export default function SetupConfirmation({ 
  data, 
  onBack,
  onSubmit,
  isSubmitting 
}: SetupConfirmationProps) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://memories.love';

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Your Wedding Details</h2>
        <p className="text-gray-600">Please confirm everything looks correct before creating your wedding page.</p>
      </div>

      {/* Summary Cards */}
      <div className="space-y-4">
        {/* Couple Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Couple Information</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Bride:</span>
              <span className="font-medium">{data.bride?.display_name || data.bride?.name}</span>
            </div>
            {data.bride?.email && (
              <div className="flex justify-between">
                <span className="text-gray-600">Bride Email:</span>
                <span className="font-medium">{data.bride.email}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Groom:</span>
              <span className="font-medium">{data.groom?.display_name || data.groom?.name}</span>
            </div>
            {data.groom?.email && (
              <div className="flex justify-between">
                <span className="text-gray-600">Groom Email:</span>
                <span className="font-medium">{data.groom.email}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Wedding Date:</span>
              <span className="font-medium">{formatDate(data.wedding_date)}</span>
            </div>
          </div>
        </div>

        {/* Theme */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Theme Colors</h3>
          <div className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <div 
                className="w-8 h-8 rounded-full border-2 border-gray-300"
                style={{ backgroundColor: data.theme_color }}
              />
              <div>
                <p className="text-xs text-gray-600">Primary</p>
                <p className="text-sm font-mono">{data.theme_color}</p>
              </div>
            </div>
            {data.secondary_color && (
              <div className="flex items-center space-x-2">
                <div 
                  className="w-8 h-8 rounded-full border-2 border-gray-300"
                  style={{ backgroundColor: data.secondary_color }}
                />
                <div>
                  <p className="text-xs text-gray-600">Secondary</p>
                  <p className="text-sm font-mono">{data.secondary_color}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Wedding URL */}
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <h3 className="font-semibold text-purple-900 mb-2">Your Wedding URL</h3>
          <p className="text-lg font-mono text-purple-700 break-all">
            {baseUrl}/{data.slug}
          </p>
          <p className="text-xs text-purple-600 mt-2">
            This URL cannot be changed after creation
          </p>
        </div>
      </div>

      {/* Important Notes */}
      <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
        <h4 className="font-semibold text-yellow-900 mb-2">Important Notes:</h4>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Your wedding page will start in inactive mode</li>
          <li>• You can activate it after reviewing everything</li>
          <li>• Guests can only see the page when it's active</li>
          <li>• You can edit details later except the URL</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="flex-1 py-3 bg-white text-gray-700 rounded-lg font-medium border border-gray-300 hover:bg-gray-50"
        >
          Back to Edit
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
            isSubmitting
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {isSubmitting ? 'Creating Your Wedding...' : 'Create Wedding Page'}
        </button>
      </div>
    </div>
  );
}