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

export default function MiningRevealPage() {
  const router = useRouter();
  const [stats, setStats] = useState<MiningStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showStateQuestion, setShowStateQuestion] = useState(false);
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

      // Show state question after brief moment to let them see stats
      setTimeout(() => {
        setShowStateQuestion(true);
      }, 2000);
    } catch (error) {
      console.error('Error checking mining status:', error);
      router.push('/dashboard');
    }
  };

  const handleStateSelection = async (state: 'stable' | 'crisis') => {
    if (!stats) return;

    setCompleting(true);

    try {
      const response = await fetch('/api/mining/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: stats.sessionId,
          userState: state,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete mining session');
      }

      // Route based on state
      if (state === 'stable') {
        router.push('/dashboard');
      } else {
        router.push('/urge');
      }
    } catch (error) {
      console.error('Error completing session:', error);
      alert('Failed to save session. Please try again.');
      setCompleting(false);
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
        {/* Back to Dashboard - Only show before state question */}
        {!showStateQuestion && (
          <button
            onClick={async () => {
              // Complete session with default 'stable' state
              if (stats) {
                await handleStateSelection('stable');
              } else {
                router.push('/dashboard');
              }
            }}
            className="mb-6 flex items-center gap-2 text-gray-400 hover:text-gray-200 transition"
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
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-8xl mb-6">🌳</div>
          <h1 className="text-3xl font-bold text-green-400 mb-2">Good Morning</h1>
        </div>

        {/* Stats Display */}
        <div className="bg-gray-800 rounded-2xl p-8 mb-8 border border-gray-700">
          <div className="text-center mb-8">
            <p className="text-gray-400 text-lg mb-3">You made it through the night.</p>
            <p className="text-white text-2xl font-semibold mb-6">
              You didn&apos;t act out.
            </p>

            <div className="bg-green-900/30 border border-green-600 rounded-lg p-6 mb-6">
              <div className="text-5xl font-bold text-green-400 mb-2">
                +{stats.coinsEarned} coins
              </div>
              <p className="text-green-200 text-lg">
                {timeDisplay} of sobriety
              </p>
            </div>

            <div className="text-gray-400">
              <p className="text-sm">Total coins: {stats.totalCoins}</p>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-6">
            <p className="text-gray-300 text-lg leading-relaxed">
              That obsession that felt impossible last night? You got through it.
              You chose rest over acting out.
            </p>
            <p className="text-white font-semibold mt-4">
              That&apos;s the work.
            </p>
          </div>
        </div>

        {/* State Question */}
        {showStateQuestion && (
          <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 animate-fade-in">
            <p className="text-white text-xl font-semibold mb-6">
              How are you feeling right now?
            </p>

            <div className="space-y-4">
              <button
                onClick={() => handleStateSelection('stable')}
                disabled={completing}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6 px-8 rounded-xl transition-all disabled:bg-gray-600 disabled:cursor-not-allowed text-lg"
              >
                {completing ? 'Saving...' : "I'm Good - Feeling Stable"}
              </button>

              <button
                onClick={() => handleStateSelection('crisis')}
                disabled={completing}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-6 px-8 rounded-xl transition-all disabled:bg-gray-600 disabled:cursor-not-allowed text-lg"
              >
                {completing ? 'Saving...' : "Still Struggling - Need Support"}
              </button>
            </div>

            <p className="text-gray-500 text-sm text-center mt-6">
              Be honest. There&apos;s no wrong answer.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
