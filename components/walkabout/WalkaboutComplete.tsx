'use client';

import { useState } from 'react';

interface WalkaboutCompleteProps {
  duration: number;
  coinsEarned: number;
  location: string;
  bodyNeed: string;
  onNextAction: (action: string) => void;
}

export default function WalkaboutComplete({
  duration,
  coinsEarned,
  location,
  bodyNeed,
  onNextAction,
}: WalkaboutCompleteProps) {
  const [feeling, setFeeling] = useState('');
  const [showNextSteps, setShowNextSteps] = useState(false);

  const handleFeelingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feeling.trim()) {
      setShowNextSteps(true);
    }
  };

  const locationLabels: Record<string, string> = {
    park: '🌲 Park/Forest',
    water: '🌊 Water',
    garden: '🌻 Garden',
    urban: '🏙️ Urban nature',
    mountains: '⛰️ Mountains',
    outside: '🚪 Just outside',
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
        {/* Welcome Back */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-green-800 mb-4">
            Welcome back
          </h1>
        </div>

        {!showNextSteps ? (
          /* Feeling Check-In */
          <form onSubmit={handleFeelingSubmit} className="space-y-6">
            <div className="bg-green-50 border-l-4 border-green-600 p-6 rounded-lg">
              <label className="block text-lg font-medium text-gray-800 mb-3">
                How are you feeling right now?
              </label>
              <textarea
                value={feeling}
                onChange={(e) => setFeeling(e.target.value)}
                placeholder="Share what you're feeling..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                rows={4}
                required
              />
            </div>

            <button
              type="submit"
              disabled={!feeling.trim()}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-colors shadow-lg"
            >
              Continue
            </button>
          </form>
        ) : (
          /* Celebration & Next Steps */
          <div className="space-y-8">
            {/* Elder Tree Response */}
            <div className="bg-green-50 border-l-4 border-green-600 p-6 rounded-lg space-y-4">
              <p className="text-gray-800 leading-relaxed">
                {feeling}
              </p>
              <p className="text-gray-800 leading-relaxed font-medium">
                You went out when you were in crisis, and you came back more grounded.
                That matters.
              </p>
            </div>

            {/* Walkabout Stats */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-6 space-y-4">
              <h3 className="text-xl font-semibold text-gray-800 text-center">
                ✨ Walkabout Complete
              </h3>

              <div className="flex justify-center gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-700">{duration}</div>
                  <div className="text-sm text-gray-600">minutes</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">🪙 {coinsEarned}</div>
                  <div className="text-sm text-gray-600">coins earned</div>
                </div>
              </div>

              <div className="flex justify-center gap-4 text-sm">
                <span className="bg-white px-3 py-1 rounded-lg">
                  {locationLabels[location] || location}
                </span>
                <span className="bg-white px-3 py-1 rounded-lg capitalize">
                  {bodyNeed}
                </span>
              </div>
            </div>

            {/* Next Steps Menu */}
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-lg text-gray-800 font-medium mb-2">
                  What do you need to do next to stay grounded?
                </p>
                <p className="text-sm text-gray-600">
                  You've got some space now. What feels right?
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => onNextAction('journal')}
                  className="p-4 bg-white border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 rounded-lg text-left transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📝</span>
                    <div>
                      <div className="font-semibold text-gray-800 group-hover:text-green-700">
                        Journal about it
                      </div>
                      <div className="text-sm text-gray-600">
                        Write about what happened
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => onNextAction('meditate')}
                  className="p-4 bg-white border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 rounded-lg text-left transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🧘</span>
                    <div>
                      <div className="font-semibold text-gray-800 group-hover:text-green-700">
                        Sit and connect with HP
                      </div>
                      <div className="text-sm text-gray-600">
                        Meditation or prayer
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => onNextAction('reach-out')}
                  className="p-4 bg-white border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 rounded-lg text-left transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📞</span>
                    <div>
                      <div className="font-semibold text-gray-800 group-hover:text-green-700">
                        Reach out to someone
                      </div>
                      <div className="text-sm text-gray-600">
                        Text or call a friend
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => onNextAction('step-work')}
                  className="p-4 bg-white border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 rounded-lg text-left transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📖</span>
                    <div>
                      <div className="font-semibold text-gray-800 group-hover:text-green-700">
                        Work a step
                      </div>
                      <div className="text-sm text-gray-600">
                        Deep or quick step work
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => onNextAction('dashboard')}
                  className="p-4 bg-white border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 rounded-lg text-left transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🏠</span>
                    <div>
                      <div className="font-semibold text-gray-800 group-hover:text-green-700">
                        Return to dashboard
                      </div>
                      <div className="text-sm text-gray-600">
                        I'm good for now
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
