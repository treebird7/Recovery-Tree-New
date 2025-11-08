'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function MiningContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const durationMinutes = searchParams.get('duration') ? parseInt(searchParams.get('duration')!) : null;

  const [startedAt, setStartedAt] = useState<string>('');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [error, setError] = useState<string>('');
  const [isEnding, setIsEnding] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setError('No session found');
      return;
    }

    // Get session details
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/mining/status');
        if (response.ok) {
          const data = await response.json();
          if (data.activeSession && data.activeSession.sessionId === sessionId) {
            const startDateTime = new Date(data.activeSession.startedAt);
            setStartTime(startDateTime);

            const hours = startDateTime.getHours();
            const minutes = startDateTime.getMinutes();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const displayHours = hours % 12 || 12;
            setStartedAt(`${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`);
          }
        }
      } catch (err) {
        console.error('Error fetching session:', err);
      }
    };

    fetchSession();
  }, [sessionId]);

  // Timer effect
  useEffect(() => {
    if (!startTime) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
      setElapsedSeconds(elapsed);

      // Auto-end if duration reached
      if (durationMinutes && elapsed >= durationMinutes * 60) {
        clearInterval(interval);
        handleFinishMining();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, durationMinutes]);

  const handleGoBack = () => {
    router.push('/urge');
  };

  const handleFinishMining = async () => {
    const confirmed = confirm('Ready to finish mining and collect your coins?');
    if (!confirmed) return;

    setIsEnding(true);

    try {
      const response = await fetch('/api/mining/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to end mining');
      }

      // Redirect to reveal page
      router.push('/urge/reveal');
    } catch (err) {
      console.error('Error ending mining:', err);
      alert('Failed to end mining session. Please try again.');
      setIsEnding(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m ${secs}s`;
  };

  const coinsEarned = Math.floor(elapsedSeconds / 60);

  // Calculate remaining time if duration set
  const remainingSeconds = durationMinutes ? (durationMinutes * 60) - elapsedSeconds : null;
  const endTime = startTime && durationMinutes
    ? new Date(startTime.getTime() + durationMinutes * 60000).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      })
    : null;

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">{error}</p>
          <button
            onClick={handleGoBack}
            className="text-green-400 underline"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-6 py-12 max-w-xl">
        {/* Back to Dashboard */}
        <button
          onClick={() => router.push('/dashboard')}
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

        {/* Simple confirmation */}
        <div className="text-center mb-12">
          <div className="text-7xl mb-6">🌳</div>
          <h1 className="text-3xl font-bold text-green-400 mb-3">Timer Active</h1>
          {startedAt && (
            <p className="text-gray-400 text-lg">Started at {startedAt}</p>
          )}

          {/* Live Timer Display */}
          <div className="mt-6 bg-gray-900 rounded-2xl p-6 border border-gray-800">
            {durationMinutes && remainingSeconds !== null ? (
              <>
                <div className="text-sm text-gray-400 mb-2">Time Remaining</div>
                <div className="text-6xl font-mono font-bold text-white mb-2">
                  {remainingSeconds > 0 ? formatTime(remainingSeconds) : '0m 0s'}
                </div>
                <div className="text-gray-400 text-sm mb-3">
                  Ends at {endTime}
                </div>
              </>
            ) : (
              <>
                <div className="text-sm text-gray-400 mb-2">Time Elapsed</div>
                <div className="text-6xl font-mono font-bold text-white mb-2">
                  {formatTime(elapsedSeconds)}
                </div>
              </>
            )}
            <div className="text-yellow-400 text-2xl font-semibold">
              {coinsEarned} 🪙 earned
            </div>
          </div>
        </div>

        {/* Clear, direct instructions */}
        <div className="space-y-6 text-xl leading-relaxed">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <p className="text-gray-200 mb-4">
              Your tree is mining coins right now.
            </p>
            <p className="text-gray-300">
              Every minute you&apos;re not acting out = 1 coin earned.
            </p>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <p className="font-semibold text-white mb-3">What to do:</p>
            <ol className="space-y-3 text-gray-300">
              <li>1. Put your phone down</li>
              <li>2. Lie in the dark</li>
              <li>3. Close your eyes</li>
              <li>4. Just breathe</li>
            </ol>
          </div>

          <div className="bg-green-900/20 rounded-xl p-6 border border-green-800">
            <p className="text-green-200">
              You don&apos;t have to sleep. Just rest.
            </p>
            <p className="text-green-300 mt-3 text-lg">
              Even lying there awake counts. You&apos;re not acting out. That&apos;s what matters.
            </p>
          </div>

          {/* Finish Mining Button */}
          <div className="pt-6">
            <button
              onClick={handleFinishMining}
              disabled={isEnding}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-xl transition-all disabled:bg-gray-600 disabled:cursor-not-allowed text-lg"
            >
              {isEnding ? 'Finishing...' : '✓ Finish Mining & Collect Coins'}
            </button>
          </div>

          <div className="text-center pt-8">
            <p className="text-2xl font-bold text-white mb-2">
              Or see you in the morning.
            </p>
            <p className="text-gray-400 text-base">
              Open this app when you wake up to collect your coins
            </p>
          </div>
        </div>

        {/* Subtle back button (in case they need to cancel) */}
        <div className="mt-12 text-center">
          <button
            onClick={handleGoBack}
            className="text-gray-600 hover:text-gray-400 text-sm underline"
          >
            Cancel and go back
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MiningTimerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center"><div className="text-gray-400">Loading...</div></div>}>
      <MiningContent />
    </Suspense>
  );
}
