'use client';

import { useState } from 'react';
import { WeddingFormData } from './WeddingSetupWizard';

interface ThemeSelectorProps {
  data: Partial<WeddingFormData>;
  updateData: (updates: Partial<WeddingFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const PRESET_THEMES = [
  { name: 'Royal Purple', primary: '#8B5CF6', secondary: '#4B5563' },
  { name: 'Ocean Blue', primary: '#0EA5E9', secondary: '#1F2937' },
  { name: 'Rose Garden', primary: '#F43F5E', secondary: '#374151' },
  { name: 'Forest Green', primary: '#10B981', secondary: '#1F2937' },
  { name: 'Sunset Orange', primary: '#F97316', secondary: '#374151' },
  { name: 'Classic Gold', primary: '#EAB308', secondary: '#1F2937' },
  { name: 'Midnight', primary: '#4338CA', secondary: '#374151' },
  { name: 'Blush Pink', primary: '#EC4899', secondary: '#4B5563' },
];

export default function ThemeSelector({ 
  data, 
  updateData, 
  onNext,
  onBack 
}: ThemeSelectorProps) {
  const [showCustom, setShowCustom] = useState(false);

  const handleThemeSelect = (primary: string, secondary?: string) => {
    updateData({
      theme_color: primary,
      secondary_color: secondary,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Theme</h2>
        <p className="text-gray-600">Select colors that match your wedding style.</p>
      </div>

      {/* Preset Themes */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Preset Themes</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PRESET_THEMES.map((theme) => (
            <button
              key={theme.name}
              type="button"
              onClick={() => handleThemeSelect(theme.primary, theme.secondary)}
              className={`p-3 rounded-lg border-2 transition-all ${
                data.theme_color === theme.primary
                  ? 'border-purple-600 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex space-x-1 mb-2 justify-center">
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: theme.primary }}
                />
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: theme.secondary }}
                />
              </div>
              <p className="text-xs font-medium text-gray-700">{theme.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Color Selection */}
      <div>
        <button
          type="button"
          onClick={() => setShowCustom(!showCustom)}
          className="text-sm font-medium text-purple-600 hover:text-purple-700"
        >
          {showCustom ? 'Hide' : 'Show'} Custom Colors
        </button>
        
        {showCustom && (
          <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label htmlFor="primary-color" className="block text-sm font-medium text-gray-700 mb-1">
                Primary Color *
              </label>
              <div className="flex space-x-2">
                <input
                  id="primary-color"
                  type="color"
                  value={data.theme_color || '#8B5CF6'}
                  onChange={(e) => updateData({ theme_color: e.target.value })}
                  className="h-10 w-20"
                />
                <input
                  type="text"
                  value={data.theme_color || '#8B5CF6'}
                  onChange={(e) => updateData({ theme_color: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  pattern="^#[0-9A-Fa-f]{6}$"
                  placeholder="#8B5CF6"
                />
              </div>
            </div>

            <div>
              <label htmlFor="secondary-color" className="block text-sm font-medium text-gray-700 mb-1">
                Secondary Color (Optional)
              </label>
              <div className="flex space-x-2">
                <input
                  id="secondary-color"
                  type="color"
                  value={data.secondary_color || '#4B5563'}
                  onChange={(e) => updateData({ secondary_color: e.target.value })}
                  className="h-10 w-20"
                />
                <input
                  type="text"
                  value={data.secondary_color || ''}
                  onChange={(e) => updateData({ secondary_color: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  pattern="^#[0-9A-Fa-f]{6}$"
                  placeholder="#4B5563"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preview */}
      <div className="p-6 rounded-lg border-2 border-gray-200" 
           style={{ 
             background: data.secondary_color 
               ? `linear-gradient(135deg, ${data.theme_color}20, ${data.secondary_color}20)` 
               : `${data.theme_color}20` 
           }}>
        <h4 className="text-lg font-bold mb-2" style={{ color: data.theme_color }}>
          Preview: {data.bride?.display_name || data.bride?.name || 'Bride'} & {data.groom?.display_name || data.groom?.name || 'Groom'}
        </h4>
        <p className="text-gray-600 mb-4">Your wedding memory collection</p>
        <button
          type="button"
          className="px-4 py-2 text-white rounded-lg font-medium"
          style={{ backgroundColor: data.secondary_color || '#4B5563' }}
        >
          Share a Memory
        </button>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
        >
          Continue to Wedding URL
        </button>
      </div>
    </form>
  );
}