'use client';

import { useState, useEffect, useCallback } from 'react';
import { WeddingFormData } from './WeddingSetupWizard';
import debounce from 'lodash/debounce';

interface SlugValidatorProps {
  data: Partial<WeddingFormData>;
  updateData: (updates: Partial<WeddingFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function SlugValidator({ 
  data, 
  updateData, 
  onNext,
  onBack 
}: SlugValidatorProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Generate initial slug from names
  useEffect(() => {
    if (!data.slug && data.bride?.name && data.groom?.name) {
      const firstName1 = data.bride.name.split(' ')[0].toLowerCase();
      const firstName2 = data.groom.name.split(' ')[0].toLowerCase();
      const autoSlug = `${firstName1}-and-${firstName2}`;
      updateData({ slug: autoSlug });
    }
  }, []);

  // Debounced validation function
  const validateSlug = useCallback(
    debounce(async (slug: string) => {
      if (!slug || slug.length < 3) {
        setIsAvailable(null);
        setValidationError('URL must be at least 3 characters');
        return;
      }

      setIsValidating(true);
      setValidationError(null);

      try {
        const response = await fetch('/api/weddings/validate-slug', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug }),
        });

        const result = await response.json();
        setIsAvailable(result.available);
        setValidationError(result.error || null);
        setSuggestions(result.suggestions || []);
      } catch (error) {
        setValidationError('Failed to check availability');
        setIsAvailable(null);
      } finally {
        setIsValidating(false);
      }
    }, 500),
    []
  );

  // Validate on slug change
  useEffect(() => {
    if (data.slug) {
      validateSlug(data.slug);
    }
  }, [data.slug, validateSlug]);

  const handleSlugChange = (value: string) => {
    // Clean the input - only lowercase letters, numbers, and hyphens
    const cleaned = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    updateData({ slug: cleaned });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAvailable) {
      onNext();
    }
  };

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://memoryalbum.ai';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Wedding URL</h2>
        <p className="text-gray-600">This is the link you'll share with your guests.</p>
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
          Wedding URL *
        </label>
        <div className="flex items-center space-x-2">
          <span className="text-gray-500">{baseUrl}/</span>
          <input
            id="slug"
            type="text"
            required
            value={data.slug || ''}
            onChange={(e) => handleSlugChange(e.target.value)}
            className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent bg-white text-gray-900 ${
              isAvailable === true
                ? 'border-green-500 focus:ring-green-500'
                : isAvailable === false
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-purple-600'
            }`}
            placeholder="jane-and-john"
            minLength={3}
            maxLength={50}
          />
        </div>
        
        {/* Validation Status */}
        <div className="mt-2">
          {isValidating && (
            <p className="text-sm text-gray-500">Checking availability...</p>
          )}
          {!isValidating && isAvailable === true && (
            <p className="text-sm text-green-600">✓ This URL is available!</p>
          )}
          {!isValidating && isAvailable === false && validationError && (
            <p className="text-sm text-red-600">{validationError}</p>
          )}
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="mt-3">
            <p className="text-sm text-gray-600 mb-2">Try one of these:</p>
            <div className="space-y-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => updateData({ slug: suggestion })}
                  className="block w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm"
                >
                  {baseUrl}/<span className="font-medium">{suggestion}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* URL Preview Card */}
      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
        <p className="text-sm font-medium text-purple-900 mb-1">Your wedding page will be at:</p>
        <p className="text-lg font-mono text-purple-700">
          {baseUrl}/{data.slug || 'your-wedding-url'}
        </p>
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <p>• Use lowercase letters, numbers, and hyphens only</p>
        <p>• Must be between 3 and 50 characters</p>
        <p>• This URL cannot be changed once created</p>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={!isAvailable || isValidating}
          className={`w-full py-3 rounded-lg font-medium transition-colors ${
            isAvailable
              ? 'bg-purple-600 text-white hover:bg-purple-700'
              : 'bg-gray-400 text-white cursor-not-allowed'
          }`}
        >
          Continue to Review
        </button>
      </div>
    </form>
  );
}