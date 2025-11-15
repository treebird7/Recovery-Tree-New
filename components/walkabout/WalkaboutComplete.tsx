'use client';

import { useState } from 'react';

interface WalkaboutCompleteProps {
  duration: number;
  coinsEarned: number;
  onNextAction: (action: string) => void;
}

export default function WalkaboutComplete({
  duration,
  coinsEarned,
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

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="bg-gray-800 rounded-2xl shadow-xl p-8 space-y-8 border border-gray-700">
        {/* Welcome Back */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-green-400 mb-4">
            Welcome back
          </h1>
        </div>

        {!showNextSteps ? (
          /* Feeling Check-In */
          <form onSubmit={handleFeelingSubmit} className="space-y-6">
            <div className="bg-gray-900/50 border-l-4 border-green-600 p-6 rounded-lg">
              <label className="block text-lg font-medium text-gray-200 mb-3">
                How are you feeling right now?
              </label>
              <textarea
                value={feeling}
                onChange={(e) => setFeeling(e.target.value)}
                placeholder="Share what you're feeling..."
                className="w-full px-4 py-3 border border-gray-600 bg-gray-900 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none text-gray-100 placeholder:text-gray-500"
                rows={4}
                required
              />
            </div>

            <button
              type="submit"
              disabled={!feeling.trim()}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-colors shadow-lg"
            >
              Continue
            </button>
          </form>
        ) : (
          /* Celebration & Next Steps */
          <div className="space-y-8">
            {/* Elder Tree Response */}
            <div className="bg-gray-900/50 border-l-4 border-green-600 p-6 rounded-lg space-y-4">
              <p className="text-gray-200 leading-relaxed">
                {feeling}
              </p>
              <p className="text-gray-100 leading-relaxed font-medium">
                You stepped outside when you were in crisis, and you came back more grounded.
                That matters.
              </p>
            </div>

            {/* Walkabout Stats */}
            <div className="bg-green-900/30 border-2 border-green-600 rounded-2xl p-6 space-y-4">
              <h3 className="text-xl font-semibold text-green-100 text-center">
                ✨ Walk Complete
              </h3>

              <div className="flex justify-center gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">{duration}</div>
                  <div className="text-sm text-gray-400">minutes</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400">🪙 {coinsEarned}</div>
                  <div className="text-sm text-gray-400">coins earned</div>
                </div>
              </div>
            </div>

            {/* Next Steps Menu */}
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-lg text-gray-200 font-medium mb-2">
                  What do you need to do next to stay grounded?
                </p>
                <p className="text-sm text-gray-400">
                  You've got some space now. What feels right?
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => onNextAction('journal')}
                  className="p-4 bg-gray-700 border-2 border-gray-600 hover:border-green-500 hover:bg-gray-600 rounded-lg text-left transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📝</span>
                    <div>
                      <div className="font-semibold text-gray-200 group-hover:text-green-400">
                        Journal about it
                      </div>
                      <div className="text-sm text-gray-400">
                        Write about what happened
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => onNextAction('meditate')}
                  className="p-4 bg-gray-700 border-2 border-gray-600 hover:border-green-500 hover:bg-gray-600 rounded-lg text-left transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🧘</span>
                    <div>
                      <div className="font-semibold text-gray-200 group-hover:text-green-400">
                        Sit and connect with HP
                      </div>
                      <div className="text-sm text-gray-400">
                        Meditation or prayer
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => onNextAction('reach-out')}
                  className="p-4 bg-gray-700 border-2 border-gray-600 hover:border-green-500 hover:bg-gray-600 rounded-lg text-left transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📞</span>
                    <div>
                      <div className="font-semibold text-gray-200 group-hover:text-green-400">
                        Reach out to someone
                      </div>
                      <div className="text-sm text-gray-400">
                        Text or call a friend
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => onNextAction('step-work')}
                  className="p-4 bg-gray-700 border-2 border-gray-600 hover:border-green-500 hover:bg-gray-600 rounded-lg text-left transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📖</span>
                    <div>
                      <div className="font-semibold text-gray-200 group-hover:text-green-400">
                        Work a step
                      </div>
                      <div className="text-sm text-gray-400">
                        Deep or quick step work
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => onNextAction('dashboard')}
                  className="p-4 bg-gray-700 border-2 border-gray-600 hover:border-green-500 hover:bg-gray-600 rounded-lg text-left transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🏠</span>
                    <div>
                      <div className="font-semibold text-gray-200 group-hover:text-green-400">
                        Return to dashboard
                      </div>
                      <div className="text-sm text-gray-400">
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
