'use client';

import { WeddingFormData } from './WeddingSetupWizard';

interface BrideDetailsFormProps {
  data: Partial<WeddingFormData>;
  updateData: (updates: Partial<WeddingFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function BrideDetailsForm({ 
  data, 
  updateData, 
  onNext 
}: BrideDetailsFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  const handleChange = (field: keyof WeddingFormData['bride'], value: string) => {
    updateData({
      bride: {
        ...data.bride!,
        [field]: value,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Bride Details</h2>
        <p className="text-gray-600">Let's start with information about the bride.</p>
      </div>

      <div>
        <label htmlFor="bride-name" className="block text-sm font-medium text-gray-700 mb-1">
          Full Name *
        </label>
        <input
          id="bride-name"
          type="text"
          required
          value={data.bride?.name || ''}
          onChange={(e) => handleChange('name', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-white text-gray-900"
          placeholder="Jane Smith"
        />
      </div>

      <div>
        <label htmlFor="bride-display-name" className="block text-sm font-medium text-gray-700 mb-1">
          Display Name
        </label>
        <input
          id="bride-display-name"
          type="text"
          value={data.bride?.display_name || ''}
          onChange={(e) => handleChange('display_name', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-white text-gray-900"
          placeholder="Jane (or leave blank to use full name)"
        />
        <p className="mt-1 text-sm text-gray-500">This is how the name will appear on the wedding page</p>
      </div>

      <div>
        <label htmlFor="bride-email" className="block text-sm font-medium text-gray-700 mb-1">
          Email Address
        </label>
        <input
          id="bride-email"
          type="email"
          value={data.bride?.email || ''}
          onChange={(e) => handleChange('email', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-white text-gray-900"
          placeholder="jane@example.com"
        />
        <p className="mt-1 text-sm text-gray-500">Optional - for future dashboard access</p>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
        >
          Continue to Groom Details
        </button>
      </div>
    </form>
  );
}