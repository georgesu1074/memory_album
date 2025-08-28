'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BrideDetailsForm from './BrideDetailsForm';
import GroomDetailsForm from './GroomDetailsForm';
import ThemeSelector from './ThemeSelector';
import SlugValidator from './SlugValidator';
import SetupConfirmation from './SetupConfirmation';

export interface WeddingFormData {
  bride: {
    name: string;
    email: string;
    display_name: string;
  };
  groom: {
    name: string;
    email: string;
    display_name: string;
  };
  wedding_date: string;
  slug: string;
  theme_color: string;
  secondary_color?: string;
}

const STEPS = [
  { id: 'bride', label: 'Bride Details', component: BrideDetailsForm },
  { id: 'groom', label: 'Groom Details', component: GroomDetailsForm },
  { id: 'theme', label: 'Theme & Style', component: ThemeSelector },
  { id: 'slug', label: 'Wedding URL', component: SlugValidator },
  { id: 'confirm', label: 'Review & Confirm', component: SetupConfirmation },
];

export default function WeddingSetupWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<WeddingFormData>>({
    bride: { name: '', email: '', display_name: '' },
    groom: { name: '', email: '', display_name: '' },
    wedding_date: '',
    slug: '',
    theme_color: '#8B5CF6',
    secondary_color: undefined,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateFormData = (updates: Partial<WeddingFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      // Save to localStorage for recovery
      localStorage.setItem('weddingSetupForm', JSON.stringify(formData));
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/weddings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create wedding');
      }

      // Clear saved form data
      localStorage.removeItem('weddingSetupForm');
      
      // Redirect to the wedding page
      router.push(`/${data.wedding.slug}/config/success`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setIsSubmitting(false);
    }
  };

  const CurrentStepComponent = STEPS[currentStep].component;
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Progress Bar */}
          <div className="h-2 bg-gray-200">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Step Indicators */}
          <div className="px-6 py-4 border-b">
            <div className="flex justify-between">
              {STEPS.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center ${
                    index !== STEPS.length - 1 ? 'flex-1' : ''
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      index <= currentStep
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span
                    className={`ml-2 text-sm ${
                      index <= currentStep ? 'text-purple-600' : 'text-gray-500'
                    } hidden sm:inline`}
                  >
                    {step.label}
                  </span>
                  {index !== STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-px mx-2 ${
                        index < currentStep ? 'bg-purple-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            <CurrentStepComponent
              data={formData}
              updateData={updateFormData}
              onNext={handleNext}
              onBack={handleBack}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          </div>

          {/* Navigation Buttons */}
          <div className="px-6 py-4 border-t bg-gray-50 flex justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className={`px-4 py-2 rounded-lg font-medium ${
                currentStep === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              Back
            </button>

            {currentStep < STEPS.length - 1 ? (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-6 py-2 rounded-lg font-medium ${
                  isSubmitting
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isSubmitting ? 'Creating...' : 'Create Wedding'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}