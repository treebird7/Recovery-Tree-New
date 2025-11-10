'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface MiningStats {
  sessionId: string;
  startedAt: string;
  durationMinutes: number;
  coinsEarned: number;
  totalCoins: number;
}

type OutcomeChoice = 'didnt-act-out' | 'acted-out' | 'not-sure' | null;

export default function MiningRevealPage() {
  const router = useRouter();
  const [stats, setStats] = useState<MiningStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [outcomeChoice, setOutcomeChoice] = useState<OutcomeChoice>(null);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    checkForActiveMining();
  }, []);

  const checkForActiveMining = async () => {
    try {
      const response = await fetch('/api/mining/status');
      if (!response.ok) {
        router.push('/dashboard');
        return;
      }

      const data = await response.json();

      if (!data.hasActiveSession) {
        // No active mining session
        router.push('/dashboard');
        return;
      }

      // Calculate stats
      const startedAt = new Date(data.activeSession.startedAt);
      const now = new Date();
      const durationMinutes = Math.floor((now.getTime() - startedAt.getTime()) / (1000 * 60));
      const coinsEarned = durationMinutes;

      setStats({
        sessionId: data.activeSession.sessionId,
        startedAt: data.activeSession.startedAt,
        durationMinutes,
        coinsEarned,
        totalCoins: data.totalCoins + coinsEarned,
      });

      setLoading(false);
    } catch (error) {
      console.error('Error checking mining status:', error);
      router.push('/dashboard');
    }
  };

  const handleOutcomeSelection = async (choice: 'didnt-act-out' | 'acted-out' | 'not-sure') => {
    if (!stats) return;

    setOutcomeChoice(choice);

    // Complete the mining session
    setCompleting(true);

    try {
      const response = await fetch('/api/mining/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: stats.sessionId,
          userState: choice === 'acted-out' ? 'crisis' : 'stable',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete mining session');
      }

      setCompleting(false);
    } catch (error) {
      console.error('Error completing session:', error);
      alert('Failed to save session. Please try again.');
      setCompleting(false);
    }
  };

  const handleNextAction = (action: string) => {
    switch (action) {
      case 'journal':
        router.push('/inventory');
        break;
      case 'meditate':
        // Future: meditation/prayer feature
        router.push('/dashboard');
        break;
      case 'reach-out':
        // Future: contacts feature
        router.push('/dashboard');
        break;
      case 'step-work':
        router.push('/walk');
        break;
      case 'dashboard':
        router.push('/dashboard');
        break;
      default:
        router.push('/dashboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🌳</div>
          <p className="text-gray-400">Calculating your coins...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const hours = Math.floor(stats.durationMinutes / 60);
  const minutes = stats.durationMinutes % 60;
  const timeDisplay = hours > 0
    ? `${hours}h ${minutes}m`
    : `${minutes}m`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-6 py-12 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-8xl mb-6">🌳</div>
          <h1 className="text-3xl font-bold text-green-400 mb-2">Welcome Back</h1>
        </div>

        {/* Stats Display */}
        <div className="bg-gray-800 rounded-2xl p-8 mb-8 border border-gray-700">
          <div className="text-center">
            <div className="bg-green-900/30 border border-green-600 rounded-lg p-6 mb-6">
              <div className="text-5xl font-bold text-green-400 mb-2">
                +{stats.coinsEarned} coins
              </div>
              <p className="text-green-200 text-lg">
                {timeDisplay} away from the screen
              </p>
            </div>

            <div className="text-gray-400">
              <p className="text-sm">Total coins: {stats.totalCoins}</p>
            </div>
          </div>
        </div>

        {/* Outcome Choice - If not selected yet */}
        {!outcomeChoice && (
          <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
            <p className="text-white text-xl font-semibold mb-6 text-center">
              How did it go?
            </p>

            <div className="space-y-3">
              <button
                onClick={() => handleOutcomeSelection('didnt-act-out')}
                disabled={completing}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6 px-8 rounded-xl transition-all disabled:bg-gray-600 disabled:cursor-not-allowed text-lg"
              >
                {completing ? 'Saving...' : "I didn't act out"}
              </button>

              <button
                onClick={() => handleOutcomeSelection('acted-out')}
                disabled={completing}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-6 px-8 rounded-xl transition-all disabled:bg-gray-600 disabled:cursor-not-allowed text-lg"
              >
                {completing ? 'Saving...' : "I acted out"}
              </button>

              <button
                onClick={() => handleOutcomeSelection('not-sure')}
                disabled={completing}
                className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-6 px-8 rounded-xl transition-all disabled:bg-gray-700 disabled:cursor-not-allowed text-lg"
              >
                {completing ? 'Saving...' : "I'm not sure"}
              </button>
            </div>

            <p className="text-gray-500 text-sm text-center mt-6">
              Be honest. There's no wrong answer.
            </p>
          </div>
        )}

        {/* Response & Next Steps - After outcome selected */}
        {outcomeChoice && !completing && (
          <div className="space-y-6">
            {/* Appropriate Response Based on Choice */}
            <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
              {outcomeChoice === 'didnt-act-out' && (
                <div className="space-y-4">
                  <p className="text-2xl font-bold text-green-400 text-center mb-4">
                    You made it through. 🌳
                  </p>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    That obsession that felt impossible? You got through it. You chose rest over acting out.
                  </p>
                  <p className="text-white font-semibold text-lg">
                    That's the work. This is recovery.
                  </p>
                </div>
              )}

              {outcomeChoice === 'acted-out' && (
                <div className="space-y-4">
                  <p className="text-xl font-semibold text-orange-400 text-center mb-4">
                    You're still here. That matters.
                  </p>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    Acting out doesn't erase the time you spent trying. You put your phone down. You tried to rest. That took courage.
                  </p>
                  <p className="text-white font-semibold text-lg">
                    Recovery isn't perfect. It's just showing up again.
                  </p>
                </div>
              )}

              {outcomeChoice === 'not-sure' && (
                <div className="space-y-4">
                  <p className="text-xl font-semibold text-gray-300 text-center mb-4">
                    That's okay. You don't have to know.
                  </p>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    What matters most is that you're in recovery now. You're here. You're trying.
                  </p>
                  <p className="text-white font-semibold text-lg">
                    Keep moving forward. That's enough.
                  </p>
                </div>
              )}
            </div>

            {/* Next Steps Menu (Same as Walkabout) */}
            <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
              <div className="text-center mb-6">
                <p className="text-lg text-white font-medium mb-2">
                  What do you need to do next to stay grounded?
                </p>
                <p className="text-sm text-gray-400">
                  You've got some space now. What feels right?
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => handleNextAction('journal')}
                  className="p-4 bg-gray-700 border-2 border-gray-600 hover:border-green-500 hover:bg-gray-600 rounded-lg text-left transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📝</span>
                    <div>
                      <div className="font-semibold text-white group-hover:text-green-400">
                        Journal about it
                      </div>
                      <div className="text-sm text-gray-400">
                        Write about what happened
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleNextAction('meditate')}
                  className="p-4 bg-gray-700 border-2 border-gray-600 hover:border-green-500 hover:bg-gray-600 rounded-lg text-left transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🧘</span>
                    <div>
                      <div className="font-semibold text-white group-hover:text-green-400">
                        Sit and connect with HP
                      </div>
                      <div className="text-sm text-gray-400">
                        Meditation or prayer
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleNextAction('reach-out')}
                  className="p-4 bg-gray-700 border-2 border-gray-600 hover:border-green-500 hover:bg-gray-600 rounded-lg text-left transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📞</span>
                    <div>
                      <div className="font-semibold text-white group-hover:text-green-400">
                        Reach out to someone
                      </div>
                      <div className="text-sm text-gray-400">
                        Text or call a friend
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleNextAction('step-work')}
                  className="p-4 bg-gray-700 border-2 border-gray-600 hover:border-green-500 hover:bg-gray-600 rounded-lg text-left transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📖</span>
                    <div>
                      <div className="font-semibold text-white group-hover:text-green-400">
                        Work a step
                      </div>
                      <div className="text-sm text-gray-400">
                        Deep or quick step work
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleNextAction('dashboard')}
                  className="p-4 bg-gray-700 border-2 border-gray-600 hover:border-green-500 hover:bg-gray-600 rounded-lg text-left transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🏠</span>
                    <div>
                      <div className="font-semibold text-white group-hover:text-green-400">
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
