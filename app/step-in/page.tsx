'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Question {
  id: string;
  text: string;
  type: string;
  phase: string;
  phaseTitle: string;
  followUpType: string | null;
  followUpText: string | null;
  conditionalFollowUp: any;
  isFinal: boolean;
}

export default function StepInPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState('');
  const [saveEntry, setSaveEntry] = useState(true);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [sessionId] = useState<string>(() => crypto.randomUUID());
  const [stepComplete, setStepComplete] = useState(false);
  const [allQuestionsAnswered, setAllQuestionsAnswered] = useState(false);

  // Timer effect
  useEffect(() => {
    if (!timerEnabled || !sessionStartTime) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - sessionStartTime.getTime()) / 1000);
      setElapsedSeconds(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [timerEnabled, sessionStartTime]);

  // Initialize session start time on mount
  useEffect(() => {
    setSessionStartTime(new Date());
  }, []);

  // Fetch first question when step changes
  useEffect(() => {
    fetchNextQuestion();
  }, [currentStep]);

  const fetchNextQuestion = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/step-in/question?step=${currentStep}`);
      if (!response.ok) throw new Error('Failed to fetch question');

      const data = await response.json();

      if (data.completed) {
        setAllQuestionsAnswered(true);
        setCurrentQuestion(null);
      } else {
        setCurrentQuestion(data.question);
        setAllQuestionsAnswered(false);
      }
    } catch (error) {
      console.error('Error fetching question:', error);
      alert('Failed to load question. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    if (!answer.trim()) {
      alert('Please enter a response before submitting.');
      return;
    }

    if (!currentQuestion) {
      alert('No question loaded.');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/step-in/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          answerText: answer,
          stepNumber: currentStep,
          saveEntry,
          sessionId,
        }),
      });

      if (!response.ok) throw new Error('Failed to save answer');

      const data = await response.json();

      // Clear the answer
      setAnswer('');

      // Increment answered count
      setAnsweredCount(answeredCount + 1);

      // Check if step is complete
      if (data.stepComplete) {
        setStepComplete(true);
        alert(`You've completed Step ${currentStep}! Great work. ${currentStep === 3 ? 'Now head to the Prayer Protocol to solidify your commitment.' : ''}`);
      }

      // Load next question if available
      if (data.hasMoreQuestions && data.nextQuestion) {
        setCurrentQuestion(data.nextQuestion);
      } else {
        setAllQuestionsAnswered(true);
        setCurrentQuestion(null);
      }
    } catch (error) {
      console.error('Error saving answer:', error);
      alert('Failed to save answer. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinishedForToday = () => {
    const confirmed = confirm('Ready to finish for today?');
    if (!confirmed) return;

    // TODO: Watson will add Elder Tree AI encouragement here
    const encouragement = answeredCount > 0
      ? `You answered ${answeredCount} question${answeredCount > 1 ? 's' : ''} today. You showed up and did the work. That's what matters. Rest well—you've earned it.`
      : "You came here. That's the first step. Come back when you're ready to answer some questions.";

    alert(encouragement);

    // Return to dashboard
    router.push('/dashboard');
  };

  const toggleTimer = () => {
    if (!timerEnabled) {
      // Starting timer - reset to current time
      setSessionStartTime(new Date());
      setElapsedSeconds(0);
    }
    setTimerEnabled(!timerEnabled);
  };

  const handleStepChange = (newStep: 1 | 2 | 3) => {
    setCurrentStep(newStep);
    setAnswer('');
    setStepComplete(false);
    setAllQuestionsAnswered(false);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-6 py-12 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
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

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-green-400 mb-2">Step In</h1>
              <p className="text-gray-400 text-lg">12 Steps Journal and Questionnaire</p>
            </div>

            {/* Optional Timer - Top Right */}
            <div className="flex flex-col items-end gap-2">
              <button
                onClick={toggleTimer}
                className="text-sm text-gray-400 hover:text-gray-200 transition"
              >
                {timerEnabled ? 'Hide Timer' : 'Show Timer'}
              </button>
              {timerEnabled && (
                <div className="text-2xl font-mono font-bold text-gray-300">
                  {formatTime(elapsedSeconds)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step Selector */}
        <div className="mb-6 flex gap-3">
          <button
            onClick={() => handleStepChange(1)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              currentStep === 1
                ? 'bg-green-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Step 1
          </button>
          <button
            onClick={() => handleStepChange(2)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              currentStep === 2
                ? 'bg-green-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Step 2
          </button>
          <button
            onClick={() => handleStepChange(3)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              currentStep === 3
                ? 'bg-green-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Step 3
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="mb-8 bg-gray-900 rounded-2xl p-8 border border-gray-800 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mb-4"></div>
            <p className="text-gray-400">Loading question...</p>
          </div>
        )}

        {/* All Questions Answered */}
        {!isLoading && allQuestionsAnswered && (
          <div className="mb-8 bg-gray-900 rounded-2xl p-8 border border-gray-800">
            <h2 className="text-2xl font-bold text-green-400 mb-4">
              {stepComplete ? `Step ${currentStep} Complete!` : 'All Questions Answered'}
            </h2>
            <p className="text-gray-300 mb-4">
              {stepComplete
                ? `You've completed Step ${currentStep}. ${currentStep === 3 ? 'Now head to the Prayer Protocol to choose or create your commitment prayer.' : 'Great work!'}`
                : `You've answered all available questions for Step ${currentStep}. Click "Finished for today" to wrap up.`}
            </p>
            {currentStep === 3 && stepComplete && (
              <button
                onClick={() => router.push('/prayers')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-xl transition-all text-lg"
              >
                Go to Prayer Protocol
              </button>
            )}
          </div>
        )}

        {/* Question Display Area */}
        {!isLoading && currentQuestion && (
          <>
            <div className="mb-8">
              <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-sm text-green-400 font-semibold">
                    {currentQuestion.phase.toUpperCase()} - STEP {currentStep}
                  </span>
                </div>
                <h2 className="text-3xl font-bold text-white leading-relaxed whitespace-pre-wrap">
                  {currentQuestion.text}
                </h2>
                {currentQuestion.followUpText && (
                  <p className="text-gray-400 mt-4 text-sm italic">
                    {currentQuestion.followUpText}
                  </p>
                )}
                <p className="text-gray-500 mt-4 text-xs">
                  Questions from Watson's database - {answeredCount} answered this session
                </p>
              </div>
            </div>

            {/* Answer Input Area */}
            <div className="mb-6">
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Your response here..."
                className="w-full bg-gray-900 text-white border border-gray-800 rounded-xl p-6 text-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                rows={6}
                autoFocus
              />
            </div>

            {/* Save Entry Toggle */}
            <div className="mb-8">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={saveEntry}
                    onChange={(e) => setSaveEntry(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-8 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-600 rounded-full peer peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
                </div>
                <span className="text-gray-300 text-lg">
                  {saveEntry ? 'Save this entry' : "Don't save"}
                </span>
              </label>
              <p className="text-gray-500 text-sm mt-2 ml-[68px]">
                {saveEntry
                  ? 'Response will be saved to your steps journal with timestamp'
                  : 'Live conversation only - not logged to journal'}
              </p>
            </div>

            {/* Submit Button */}
            <div className="mb-8">
              <button
                onClick={handleSubmit}
                disabled={isSaving}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-xl transition-all text-lg disabled:bg-gray-700 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Submit Answer'}
              </button>
            </div>
          </>
        )}

        {/* Finished for Today Button */}
        <div className="pt-6 border-t border-gray-800">
          <button
            onClick={handleFinishedForToday}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 px-8 rounded-xl transition-all text-lg"
          >
            Finished for today
          </button>
        </div>

        {/* Step 3 Prayer Protocol Link */}
        {currentStep === 3 && (
          <div className="mt-8 bg-purple-900/20 rounded-xl p-6 border border-purple-800">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-2">Ready for Step 3 Prayer?</h3>
                <p className="text-gray-400 text-sm mb-4">
                  After completing your Step 3 questions, choose or create your commitment prayer.
                </p>
                <button
                  onClick={() => router.push('/prayers')}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition"
                >
                  Go to Prayer Protocol
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-gray-900/50 rounded-xl p-6 border border-gray-800">
          <p className="text-gray-400 text-sm leading-relaxed">
            <strong className="text-white">About Step In:</strong> This is your space for honest step work.
            Each question is designed to help you see clearly and find your own truth.
            Take your time—there's no rush. You move at your own pace through the steps.
          </p>
        </div>
      </div>
    </div>
  );
}
