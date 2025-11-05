'use client';

import { useState } from 'react';

interface WalkaboutGuidanceProps {
  onStartWalk: (location: string, bodyNeed: string) => void;
}

export default function WalkaboutGuidance({ onStartWalk }: WalkaboutGuidanceProps) {
  const [location, setLocation] = useState('');
  const [bodyNeed, setBodyNeed] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (location && bodyNeed) {
      onStartWalk(location, bodyNeed);
    }
  };

  const locations = [
    { id: 'park', label: 'Park / Forest', icon: '🌲' },
    { id: 'water', label: 'Water', icon: '🌊' },
    { id: 'garden', label: 'Garden', icon: '🌻' },
    { id: 'urban', label: 'Urban nature', icon: '🏙️' },
    { id: 'mountains', label: 'Mountains', icon: '⛰️' },
    { id: 'outside', label: 'Just outside', icon: '🚪' },
  ];

  const bodyNeeds = [
    { id: 'movement', label: 'Movement', desc: 'walking, stretching' },
    { id: 'stillness', label: 'Stillness', desc: 'sitting, being' },
    { id: 'both', label: 'Both', desc: "I'll see what feels right" },
    { id: 'unsure', label: 'Not sure yet', desc: "I'll follow my body" },
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      {/* Back to Dashboard */}
      <button
        onClick={() => window.location.href = '/dashboard'}
        className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Dashboard
      </button>

      <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
        {/* Title */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-green-800 mb-2">
            🌿 Outside Walkabout
          </h1>
        </div>

        {/* Elder Tree Grounding Guidance */}
        <div className="bg-green-50 border-l-4 border-green-600 p-6 rounded-lg space-y-4">
          <p className="text-gray-800 leading-relaxed">
            You've chosen to take an Outside Walkabout. That's good.
          </p>

          <p className="text-gray-800 leading-relaxed">
            This walk isn't about making the craving disappear. It's about connecting
            with your Higher Power through your body and the world around you.
          </p>

          <div className="space-y-2">
            <p className="text-gray-800 font-medium">While you walk:</p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                Feel your feet on the ground
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                Notice the air, the sounds, what you can see
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                When the waves come, bring your attention back to what's physically real
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                Talk to your HP - just honest conversation
              </li>
              <li className="flex items-start">
                <span className="text-green-600 mr-2">•</span>
                If you find a place that feels right, sit for a moment and let yourself settle there
              </li>
            </ul>
          </div>
        </div>

        {/* Location & Body Needs Selection */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Where will you go */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Where will you go?
            </label>
            <div className="grid grid-cols-2 gap-3">
              {locations.map((loc) => (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => setLocation(loc.id)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    location === loc.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{loc.icon}</span>
                    <span className="text-sm font-medium text-gray-800">{loc.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* What does your body need */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              What does your body need today?
            </label>
            <div className="grid grid-cols-1 gap-3">
              {bodyNeeds.map((need) => (
                <button
                  key={need.id}
                  type="button"
                  onClick={() => setBodyNeed(need.id)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    bodyNeed === need.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="font-semibold text-gray-800">{need.label}</div>
                  <div className="text-sm text-gray-600 mt-1">{need.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Start Walk Button */}
          <button
            type="submit"
            disabled={!location || !bodyNeed}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-colors shadow-lg text-lg"
          >
            START WALK
          </button>
        </form>
      </div>
    </div>
  );
}
