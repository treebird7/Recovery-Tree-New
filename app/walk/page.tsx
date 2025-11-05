'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PreWalkCheckIn from '@/components/walk/PreWalkCheckIn';
import WalkSession from '@/components/walk/WalkSession';
import SessionComplete from '@/components/walk/SessionComplete';

type WalkStage = 'check-in' | 'walking' | 'complete';

export default function WalkPage() {
  const router = useRouter();
  const [stage, setStage] = useState<WalkStage>('check-in');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [step, setStep] = useState<'step1' | 'step2' | 'step3'>('step1');
  const [initialQuestion, setInitialQuestion] = useState<string>('');
  const [completionData, setCompletionData] = useState<any>(null);

  // Check for incomplete session on mount
  useEffect(() => {
    checkForIncompleteSession();
  }, []);

  const checkForIncompleteSession = async () => {
    try {
      const response = await fetch('/api/session/start');
      const data = await response.json();

      if (data.hasIncompleteSession && data.session) {
        // Ask user if they want to resume
        const resume = confirm(
          'You have an incomplete walk session. Would you like to continue where you left off?'
        );

        if (resume) {
          // Resume the session - fetch the initial question
          const resumeResponse = await fetch('/api/session/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              step: data.session.current_step,
              resumeSession: true,
            }),
          });

          if (resumeResponse.ok) {
            const resumeData = await resumeResponse.json();
            setSessionId(resumeData.sessionId);
            setStep(resumeData.step);
            setInitialQuestion(resumeData.initialQuestion);
            setStage('walking');
          }
        }
      }
    } catch (error) {
      console.error('Error checking for incomplete session:', error);
    }
  };

  const handleCheckInComplete = async (
    selectedStep: 'step1' | 'step2' | 'step3',
    mood?: string,
    intention?: string
  ) => {
    try {
      // Start new session
      const response = await fetch('/api/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          step: selectedStep,
          preWalkMood: mood,
          preWalkIntention: intention,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start session');
      }

      const data = await response.json();

      setSessionId(data.sessionId);
      setStep(data.step);
      setInitialQuestion(data.initialQuestion);
      setStage('walking');
    } catch (error) {
      console.error('Error starting session:', error);
      alert('Failed to start walk session. Please try again.');
    }
  };

  const handleSessionComplete = (data: any) => {
    setCompletionData(data);
    setStage('complete');
  };

  const handleNewWalk = () => {
    setStage('check-in');
    setSessionId(null);
    setCompletionData(null);
  };

  const handleViewHistory = () => {
    router.push('/history');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {stage === 'check-in' && (
        <PreWalkCheckIn onComplete={handleCheckInComplete} />
      )}

      {stage === 'walking' && sessionId && (
        <WalkSession
          sessionId={sessionId}
          step={step}
          initialQuestion={initialQuestion}
          onComplete={handleSessionComplete}
        />
      )}

      {stage === 'complete' && completionData && (
        <SessionComplete
          reflection={completionData.reflection}
          encouragement={completionData.encouragement}
          imageUrl={completionData.imageUrl}
          insights={completionData.insights}
          mood={completionData.mood}
          moodDescription={completionData.moodDescription}
          coinsEarned={completionData.coinsEarned}
          totalCoins={completionData.totalCoins}
          analytics={completionData.analytics}
          onNewWalk={handleNewWalk}
          onViewHistory={handleViewHistory}
        />
      )}
    </div>
  );
}
