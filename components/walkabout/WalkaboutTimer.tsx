'use client';

import { useState, useEffect } from 'react';

interface WalkaboutTimerProps {
  onEndWalk: (duration: number) => void;
}

export default function WalkaboutTimer({ onEndWalk }: WalkaboutTimerProps) {
  const [startTime] = useState(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

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
    <div className="min-h-screen bg-gradient-to-b from-green-900 to-green-800 flex flex-col items-center justify-center p-6 text-white">
      {/* Minimal Header */}
      <div className="text-center mb-12">
        <div className="text-6xl mb-4">🌿</div>
        <p className="text-xl font-light">Walking...</p>
      </div>

      {/* Large Timer Display */}
      <div className="text-8xl font-light mb-16 tracking-wider">
        {formatTime(elapsedSeconds)}
      </div>

      {/* Grounding Reminders */}
      <div className="max-w-md text-center space-y-6 mb-16">
        <div className="h-px bg-green-600"></div>

        <div className="space-y-4 text-lg font-light leading-relaxed">
          <p>Feel your feet on the ground.</p>
          <p>Notice what's physically real.</p>
          <p>When waves come, return to your breath.</p>
        </div>

        <div className="h-px bg-green-600"></div>
      </div>

      {/* End Walk Button (Small, Bottom) */}
      <button
        onClick={handleEndWalk}
        className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-lg transition-all text-sm font-light"
      >
        End Walk
      </button>

      {/* Subtle coins indicator */}
      <div className="mt-8 text-xs text-green-300 font-light">
        {Math.floor(elapsedSeconds / 60)} coins earned
      </div>
    </div>
  );
}
