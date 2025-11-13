'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import WalkaboutGuidance from '@/components/walkabout/WalkaboutGuidance';
import WalkaboutTimer from '@/components/walkabout/WalkaboutTimer';
import WalkaboutComplete from '@/components/walkabout/WalkaboutComplete';

type WalkaboutStage = 'guidance' | 'walking' | 'complete';

export default function WalkaboutPage() {
  const router = useRouter();
  const [stage, setStage] = useState<WalkaboutStage>('guidance');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [walkDuration, setWalkDuration] = useState<number>(0);
  const [coinsEarned, setCoinsEarned] = useState<number>(0);

  const handleStartWalk = async () => {
    try {
      // Start walkabout session
      const response = await fetch('/api/walkabout/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error('Failed to start walkabout');
      }

      const data = await response.json();

      setSessionId(data.sessionId);
      setStage('walking');
    } catch (error) {
      console.error('Error starting walkabout:', error);
      alert('Failed to start walkabout. Please try again.');
    }
  };

  const handleEndWalk = async (duration: number) => {
    if (!sessionId) return;

    try {
      const response = await fetch('/api/walkabout/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          duration,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to end walkabout');
      }

      const data = await response.json();

      setWalkDuration(duration);
      setCoinsEarned(data.coinsEarned);
      setStage('complete');
    } catch (error) {
      console.error('Error ending walkabout:', error);
      alert('Failed to complete walkabout. Please try again.');
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
        router.push('/step-in');
        break;
      case 'dashboard':
        router.push('/dashboard');
        break;
      default:
        router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {stage === 'guidance' && (
        <WalkaboutGuidance onStartWalk={handleStartWalk} />
      )}

      {stage === 'walking' && (
        <WalkaboutTimer onEndWalk={handleEndWalk} />
      )}

      {stage === 'complete' && (
        <WalkaboutComplete
          duration={walkDuration}
          coinsEarned={coinsEarned}
          onNextAction={handleNextAction}
        />
      )}
    </div>
  );
}
