'use client';

import { useState } from 'react';

interface PreWalkCheckInProps {
  onComplete: (
    step: 'step1' | 'step2' | 'step3',
    mood?: string,
    intention?: string
  ) => void;
}

export default function PreWalkCheckIn({ onComplete }: PreWalkCheckInProps) {
  const [step, setStep] = useState<'step1' | 'step2' | 'step3'>('step1');
  const [mood, setMood] = useState('');
  const [intention, setIntention] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(step, mood, intention);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      {/* Back to Dashboard */}
      <button
        onClick={() => window.location.href = '/dashboard'}
        className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to Dashboard
      </button>

      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🌳 Welcome to Your Walk
          </h1>
          <p className="text-gray-600">
            Take a moment to check in with yourself before we begin.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Which step are you working today?
            </label>
            <div className="grid grid-cols-1 gap-3">
              <button
                type="button"
                onClick={() => setStep('step1')}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  step === 'step1'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <div className="font-semibold text-gray-800">
                  Step 1: Powerlessness & Unmanageability
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Understanding where you've lost control
                </div>
              </button>

              <button
                type="button"
                onClick={() => setStep('step2')}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  step === 'step2'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <div className="font-semibold text-gray-800">
                  Step 2: Coming to Believe
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Opening to help beyond yourself
                </div>
              </button>

              <button
                type="button"
                onClick={() => setStep('step3')}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  step === 'step3'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <div className="font-semibold text-gray-800">
                  Step 3: Turning It Over
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Practicing surrender and trust
                </div>
              </button>
            </div>
          </div>

          {/* Mood Check */}
          <div>
            <label htmlFor="mood" className="block text-sm font-medium text-gray-700 mb-2">
              How are you feeling right now? (Optional)
            </label>
            <input
              id="mood"
              type="text"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              placeholder="Anxious, hopeful, tired, grateful..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Intention */}
          <div>
            <label
              htmlFor="intention"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              What do you hope to gain from this walk? (Optional)
            </label>
            <textarea
              id="intention"
              value={intention}
              onChange={(e) => setIntention(e.target.value)}
              placeholder="Clarity, peace, honesty, willingness..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors shadow-lg"
          >
            Begin Walk
          </button>
        </form>

        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>💡 Tip:</strong> Find a quiet place to walk - a park, trail, or even
            around your neighborhood. The Elder Tree will guide you with questions as you
            walk.
          </p>
        </div>
      </div>
    </div>
  );
}
