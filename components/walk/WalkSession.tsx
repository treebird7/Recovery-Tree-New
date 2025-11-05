'use client';

import { useState, useEffect, useRef } from 'react';

interface WalkSessionProps {
  sessionId: string;
  step: 'step1' | 'step2' | 'step3';
  initialQuestion: string;
  onComplete: (completionData: any) => void;
}

interface Analytics {
  questionsCompleted: number;
  breakthroughMoments: number;
  redFlagsEncountered?: number;
}

export default function WalkSession({
  sessionId,
  step,
  initialQuestion,
  onComplete,
}: WalkSessionProps) {
  const [currentQuestion, setCurrentQuestion] = useState(initialQuestion);
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analytics, setAnalytics] = useState<Analytics>({
    questionsCompleted: 0,
    breakthroughMoments: 0,
  });
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ question: string; answer: string; isBreakthrough?: boolean }>
  >([]);
  const [startTime] = useState(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const answerInputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus answer input
  useEffect(() => {
    answerInputRef.current?.focus();
  }, [currentQuestion]);

  // Timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!answer.trim()) {
      alert('Please enter an answer before continuing.');
      return;
    }

    setIsLoading(true);

    try {
      // Save current conversation turn
      const newHistory = [
        ...conversationHistory,
        { question: currentQuestion, answer },
      ];
      setConversationHistory(newHistory);

      // Send answer and get next question
      const response = await fetch('/api/session/question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          answer,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process answer');
      }

      const data = await response.json();

      // Update analytics
      setAnalytics(data.analytics);

      // Check if session should be completed
      if (data.shouldComplete) {
        await completeSession();
        return;
      }

      // Set next question
      setCurrentQuestion(data.nextQuestion);
      setAnswer('');
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('Failed to process your answer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const completeSession = async () => {
    setIsLoading(true);

    try {
      // Calculate walk duration
      const walkDuration = Math.floor((Date.now() - startTime) / 60000); // minutes

      const response = await fetch('/api/session/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          walkDuration,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete session');
      }

      const data = await response.json();
      onComplete(data);
    } catch (error) {
      console.error('Error completing session:', error);
      alert('Failed to complete session. Please try again.');
      setIsLoading(false);
    }
  };

  const handleCompleteEarly = () => {
    const confirm = window.confirm(
      "Are you ready to complete your walk? We'll generate your reflection and image."
    );

    if (confirm) {
      completeSession();
    }
  };

  const stepLabels = {
    step1: 'Step 1',
    step2: 'Step 2',
    step3: 'Step 3',
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const coinsEarned = Math.floor(elapsedSeconds / 60); // 1 coin per minute

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Back to Dashboard */}
      <button
        onClick={() => window.location.href = '/dashboard'}
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

      {/* Header with Progress */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              🌳 Elder Tree Walk
            </h2>
            <p className="text-sm text-gray-600">
              {stepLabels[step]} • {analytics.questionsCompleted} questions
            </p>
          </div>
          <div className="flex gap-6">
            {/* Timer Display */}
            <div className="text-right">
              <div className="text-sm text-gray-600">Time</div>
              <div className="text-2xl font-bold text-blue-600 font-mono">
                {formatTime(elapsedSeconds)}
              </div>
              <div className="text-xs text-gray-500">{coinsEarned} 🪙</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Breakthroughs</div>
              <div className="text-2xl font-bold text-green-600">
                {analytics.breakthroughMoments}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min((analytics.questionsCompleted / 8) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
        <div className="mb-6">
          <div className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full mb-4">
            Elder Tree
          </div>
          <p className="text-lg text-gray-800 leading-relaxed whitespace-pre-wrap">
            {currentQuestion}
          </p>
        </div>

        <form onSubmit={handleSubmitAnswer}>
          <textarea
            ref={answerInputRef}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Take your time to answer honestly..."
            rows={6}
            disabled={isLoading}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent mb-4 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900 placeholder:text-gray-400"
          />

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isLoading || !answer.trim()}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : 'Continue'}
            </button>

            {analytics.questionsCompleted >= 3 && (
              <button
                type="button"
                onClick={handleCompleteEarly}
                disabled={isLoading}
                className="px-6 py-3 border-2 border-green-600 text-green-600 font-semibold rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Complete Walk
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Conversation History (Optional - can be collapsed) */}
      {conversationHistory.length > 0 && (
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Your Journey Today
          </h3>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {conversationHistory.map((turn, index) => (
              <div key={index} className="text-sm border-l-2 border-green-200 pl-3 py-1">
                <div className="text-gray-600 italic">{turn.question.slice(0, 60)}...</div>
                <div className="text-gray-800 mt-1">{turn.answer.slice(0, 80)}...</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
