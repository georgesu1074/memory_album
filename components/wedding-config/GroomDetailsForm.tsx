'use client';

import { WeddingFormData } from './WeddingSetupWizard';

interface GroomDetailsFormProps {
  data: Partial<WeddingFormData>;
  updateData: (updates: Partial<WeddingFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function GroomDetailsForm({ 
  data, 
  updateData, 
  onNext,
  onBack 
}: GroomDetailsFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Also set the wedding date if provided
    onNext();
  };

  const handleChange = (field: keyof WeddingFormData['groom'], value: string) => {
    updateData({
      groom: {
        ...data.groom!,
        [field]: value,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Groom Details</h2>
        <p className="text-gray-600">Now let's add information about the groom.</p>
      </div>

      <div>
        <label htmlFor="groom-name" className="block text-sm font-medium text-gray-700 mb-1">
          Full Name *
        </label>
        <input
          id="groom-name"
          type="text"
          required
          value={data.groom?.name || ''}
          onChange={(e) => handleChange('name', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-white text-gray-900"
          placeholder="John Doe"
        />
      </div>

      <div>
        <label htmlFor="groom-display-name" className="block text-sm font-medium text-gray-700 mb-1">
          Display Name
        </label>
        <input
          id="groom-display-name"
          type="text"
          value={data.groom?.display_name || ''}
          onChange={(e) => handleChange('display_name', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-white text-gray-900"
          placeholder="John (or leave blank to use full name)"
        />
        <p className="mt-1 text-sm text-gray-500">This is how the name will appear on the wedding page</p>
      </div>

      <div>
        <label htmlFor="groom-email" className="block text-sm font-medium text-gray-700 mb-1">
          Email Address
        </label>
        <input
          id="groom-email"
          type="email"
          value={data.groom?.email || ''}
          onChange={(e) => handleChange('email', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-white text-gray-900"
          placeholder="john@example.com"
        />
        <p className="mt-1 text-sm text-gray-500">Optional - for future dashboard access</p>
      </div>

      <div>
        <label htmlFor="wedding-date" className="block text-sm font-medium text-gray-700 mb-1">
          Wedding Date
        </label>
        <input
          id="wedding-date"
          type="date"
          value={data.wedding_date || ''}
          onChange={(e) => updateData({ wedding_date: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-white text-gray-900"
        />
        <p className="mt-1 text-sm text-gray-500">Optional - will be displayed on your wedding page</p>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
        >
          Continue to Theme Selection
        </button>
      </div>
    </form>
  );
}