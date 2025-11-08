'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import InventoryPrompt, {
  type InventoryResponses,
} from '@/components/inventory/InventoryPrompt';
import InventoryComplete from '@/components/inventory/InventoryComplete';

type InventoryStage = 'loading' | 'prompt' | 'submitting' | 'complete' | 'already-done';

export default function InventoryPage() {
  const router = useRouter();
  const [stage, setStage] = useState<InventoryStage>('loading');
  const [completionData, setCompletionData] = useState<any>(null);

  useEffect(() => {
    checkTodaysInventory();
  }, []);

  const checkTodaysInventory = async () => {
    try {
      const response = await fetch('/api/inventory/today');
      if (!response.ok) {
        throw new Error('Failed to check inventory');
      }

      const data = await response.json();

      if (data.hasInventory) {
        setStage('already-done');
      } else {
        setStage('prompt');
      }
    } catch (error) {
      console.error('Error checking inventory:', error);
      alert('Failed to load inventory. Please try again.');
    }
  };

  const handleComplete = async (responses: InventoryResponses) => {
    setStage('submitting');

    try {
      const response = await fetch('/api/inventory/today', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          whatWentWell: responses.whatWentWell,
          strugglesToday: responses.strugglesToday,
          gratitude: responses.gratitude,
          tomorrowIntention: responses.tomorrowIntention,
          additionalNotes: responses.additionalNotes,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit inventory');
      }

      const data = await response.json();

      setCompletionData({
        elderReflection: data.inventory.elder_reflection,
        responses: {
          whatWentWell: data.inventory.what_went_well,
          strugglesToday: data.inventory.struggles_today,
          gratitude: data.inventory.gratitude,
          tomorrowIntention: data.inventory.tomorrow_intention,
        },
      });

      setStage('complete');
    } catch (error) {
      console.error('Error submitting inventory:', error);
      alert('Failed to submit inventory. Please try again.');
      setStage('prompt');
    }
  };

  if (stage === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🌿</div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (stage === 'already-done') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="text-6xl mb-4">✓</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Already Complete
            </h1>
            <p className="text-gray-600 mb-6">
              You&apos;ve already completed today&apos;s inventory. Come back tomorrow!
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Back to Dashboard
              </button>
              <button
                onClick={() => router.push('/inventory/history')}
                className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors border-2 border-gray-200"
              >
                View Past Inventories
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'submitting') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🌳</div>
          <p className="text-gray-600">Generating reflection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {stage === 'prompt' && (
        <>
          <div className="container mx-auto px-4 py-8 max-w-3xl">
            <button
              onClick={() => router.push('/dashboard')}
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
          </div>
          <InventoryPrompt onComplete={handleComplete} />
        </>
      )}

      {stage === 'complete' && completionData && (
        <InventoryComplete
          elderReflection={completionData.elderReflection}
          responses={completionData.responses}
        />
      )}
    </div>
  );
}
