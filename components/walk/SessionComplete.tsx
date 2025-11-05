'use client';

import { useState } from 'react';
import Image from 'next/image';

interface SessionCompleteProps {
  reflection: string;
  encouragement: string;
  imageUrl: string | null;
  insights: string[];
  mood: string;
  moodDescription: string;
  coinsEarned?: number;
  totalCoins?: number;
  location?: string;
  bodyNeed?: string;
  analytics: {
    questionsCompleted: number;
    breakthroughMoments: number;
    walkDuration?: number;
  };
  onNewWalk: () => void;
  onViewHistory: () => void;
}

export default function SessionComplete({
  reflection,
  encouragement,
  imageUrl,
  insights,
  mood,
  moodDescription,
  coinsEarned,
  totalCoins,
  location,
  bodyNeed,
  analytics,
  onNewWalk,
  onViewHistory,
}: SessionCompleteProps) {
  const [imageError, setImageError] = useState(false);

  const locationLabels: Record<string, { label: string; icon: string }> = {
    park: { label: 'Park / Forest', icon: '🌲' },
    water: { label: 'Water', icon: '🌊' },
    garden: { label: 'Garden', icon: '🌻' },
    urban: { label: 'Urban nature', icon: '🏙️' },
    mountains: { label: 'Mountains', icon: '⛰️' },
    outside: { label: 'Just outside', icon: '🚪' },
  };

  const bodyNeedLabels: Record<string, string> = {
    movement: 'Movement',
    stillness: 'Stillness',
    both: 'Both movement & stillness',
    unsure: 'Following my body',
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
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

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          🌿 Nature Session Complete
        </h1>
        <p className="text-lg text-gray-600">{moodDescription}</p>
      </div>

      {/* Nature Session Summary */}
      {(location || bodyNeed) && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
            Your Nature Session
          </h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {location && locationLabels[location] && (
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg">
                <span className="text-2xl">{locationLabels[location].icon}</span>
                <div>
                  <div className="text-xs text-gray-500">Location</div>
                  <div className="font-medium text-gray-800">{locationLabels[location].label}</div>
                </div>
              </div>
            )}
            {bodyNeed && bodyNeedLabels[bodyNeed] && (
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg">
                <span className="text-2xl">🧘</span>
                <div>
                  <div className="text-xs text-gray-500">Your body needed</div>
                  <div className="font-medium text-gray-800">{bodyNeedLabels[bodyNeed]}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Generated Image */}
      {imageUrl && !imageError && (
        <div className="mb-8 rounded-2xl overflow-hidden shadow-2xl">
          <Image
            src={imageUrl}
            alt="Nature scene from your walk"
            width={1200}
            height={675}
            className="w-full h-auto"
            onError={() => setImageError(true)}
            priority
          />
        </div>
      )}

      {/* Encouragement */}
      <div className="bg-green-50 border-l-4 border-green-600 p-6 rounded-lg mb-8">
        <p className="text-lg text-gray-800 italic">"{encouragement}"</p>
      </div>

      {/* Coins Earned */}
      {coinsEarned !== undefined && coinsEarned > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-400 rounded-2xl p-6 mb-8 text-center">
          <div className="text-5xl mb-2">🪙</div>
          <div className="text-3xl font-bold text-yellow-700 mb-2">
            +{coinsEarned} Coins
          </div>
          <p className="text-gray-600">
            {coinsEarned} minute{coinsEarned !== 1 ? 's' : ''} in nature
          </p>
          <p className="text-gray-500 text-sm mt-1">
            Total: {totalCoins || coinsEarned} coins
          </p>
        </div>
      )}

      {/* Reflection */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Reflection</h2>
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{reflection}</p>
        </div>
      </div>

      {/* Insights */}
      {insights && insights.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Key Insights</h2>
          <ul className="space-y-3">
            {insights.map((insight, index) => (
              <li key={index} className="flex items-start">
                <span className="text-green-600 mr-3 text-xl">✓</span>
                <span className="text-gray-700">{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Analytics */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Session Stats</h2>
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {analytics.questionsCompleted}
            </div>
            <div className="text-sm text-gray-600 mt-1">Questions</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {analytics.breakthroughMoments}
            </div>
            <div className="text-sm text-gray-600 mt-1">Breakthroughs</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {analytics.walkDuration || '~'}
            </div>
            <div className="text-sm text-gray-600 mt-1">Minutes</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={onNewWalk}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors shadow-lg"
        >
          Start New Session
        </button>
        <button
          onClick={onViewHistory}
          className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-4 px-6 rounded-lg transition-colors shadow-lg border-2 border-gray-200"
        >
          View History
        </button>
      </div>

      {/* Sharing Note */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg text-center">
        <p className="text-sm text-gray-600">
          Your reflection and insights are saved privately. You did great work today.
        </p>
      </div>
    </div>
  );
}
