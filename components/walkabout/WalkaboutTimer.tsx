'use client';

import { useState, useEffect } from 'react';

interface WalkaboutTimerProps {
  onEndWalk: (duration: number) => void;
}

export default function WalkaboutTimer({ onEndWalk }: WalkaboutTimerProps) {
  const [startTime] = useState(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showTimer, setShowTimer] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const seconds = Math.floor((Date.now() - startTime) / 1000);
      setElapsedSeconds(seconds);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndWalk = () => {
    const durationMinutes = Math.floor(elapsedSeconds / 60);
    onEndWalk(durationMinutes);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex flex-col items-center justify-center p-6 text-white relative">
      {/* Timer Toggle - Top Right */}
      <button
        onClick={() => setShowTimer(!showTimer)}
        className="absolute top-6 right-6 text-sm text-gray-400 hover:text-white transition-colors"
      >
        {showTimer ? 'Hide Timer' : 'Show Timer'}
      </button>

      {/* Minimal Header */}
      <div className="text-center mb-12">
        <div className="text-6xl mb-4">🌿</div>
        <p className="text-xl font-light">Walking...</p>
      </div>

      {/* Conditional Display: Timer or Tree */}
      {showTimer ? (
        /* Timer Display */
        <div className="text-8xl font-light mb-16 tracking-wider text-green-400">
          {formatTime(elapsedSeconds)}
        </div>
      ) : (
        /* Beautiful Tree Image */
        <div className="mb-16 flex flex-col items-center">
          <div className="text-9xl mb-4 animate-pulse">🌳</div>
          <p className="text-green-300 text-sm font-light">Rooted and present</p>
        </div>
      )}

      {/* Grounding Reminders */}
      <div className="max-w-md text-center space-y-6 mb-16">
        <div className="h-px bg-gray-700"></div>

        <div className="space-y-4 text-lg font-light leading-relaxed text-gray-300">
          <p>Feel your feet on the ground.</p>
          <p>Notice what's physically real.</p>
          <p>When waves come, return to your breath.</p>
        </div>

        <div className="h-px bg-gray-700"></div>
      </div>

      {/* End Walk Button (Small, Bottom) */}
      <button
        onClick={handleEndWalk}
        className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white border border-green-500 rounded-lg transition-all text-sm font-semibold"
      >
        End Walk
      </button>

      {/* Subtle coins indicator */}
      <div className="mt-8 text-xs text-gray-500 font-light">
        {Math.floor(elapsedSeconds / 60)} coins earned
      </div>
    </div>
  );
}
