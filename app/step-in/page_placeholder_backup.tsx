'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Temporary placeholder questions until Watson implements database
const PLACEHOLDER_QUESTIONS = {
  step1: [
    "Can you name a specific situation where you tried to control your addiction and failed?",
    "What has your addiction cost you that you can't get back?",
    "How has trying to manage your addiction on your own made your life unmanageable?",
    "What's one area of your life where you've completely lost control?",
  ],
  step2: [
    "What does 'Higher Power' mean to you right now?",
    "Can you think of a time when something bigger than you helped you through a difficult moment?",
    "What would it look like to trust something beyond yourself?",
  ],
  step3: [
    "What's the one thing you're most ready to let go of right now?",
    "If you were giving that over to your Higher Power, what specifically would you say?",
    "What do you need from your Higher Power in exchange? Guidance? Peace? Strength?",
    "How do you want to remember this commitment?",
  ],
};

export default function StepInPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<'step1' | 'step2' | 'step3'>('step1');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [saveEntry, setSaveEntry] = useState(true);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [answeredCount, setAnsweredCount] = useState(0);

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentQuestion = () => {
    const questions = PLACEHOLDER_QUESTIONS[currentStep];
    if (questionIndex >= questions.length) {
      return "You've completed all placeholder questions for this step. Click 'Finished for today' or switch steps.";
    }
    return questions[questionIndex];
  };

  const handleSubmit = () => {
    if (!answer.trim()) {
      alert('Please enter a response before submitting.');
      return;
    }

    // TODO: Watson will replace this with actual database save
    if (saveEntry) {
      console.log('Saving answer:', {
        step: currentStep,
        question: getCurrentQuestion(),
        answer,
        timestamp: new Date().toISOString(),
      });
    } else {
      console.log('Answer not saved (toggle OFF):', answer);
    }

    // Clear the answer
    setAnswer('');

    // Move to next question
    const questions = PLACEHOLDER_QUESTIONS[currentStep];
    if (questionIndex < questions.length - 1) {
      setQuestionIndex(questionIndex + 1);
      setAnsweredCount(answeredCount + 1);
    } else {
      // At end of questions
      setAnsweredCount(answeredCount + 1);
      alert(`You've answered all ${questions.length} placeholder questions for ${currentStep.toUpperCase()}. In the full version, Watson will determine step completion and load more questions.`);
    }
  };

  const handleFinishedForToday = () => {
    const confirmed = confirm('Ready to finish for today?');
    if (!confirmed) return;

    // TODO: Watson will replace this with actual Elder Tree encouragement
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
            onClick={() => { setCurrentStep('step1'); setQuestionIndex(0); setAnswer(''); }}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              currentStep === 'step1'
                ? 'bg-green-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Step 1
          </button>
          <button
            onClick={() => { setCurrentStep('step2'); setQuestionIndex(0); setAnswer(''); }}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              currentStep === 'step2'
                ? 'bg-green-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Step 2
          </button>
          <button
            onClick={() => { setCurrentStep('step3'); setQuestionIndex(0); setAnswer(''); }}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              currentStep === 'step3'
                ? 'bg-green-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Step 3
          </button>
        </div>

        {/* Question Display Area */}
        <div className="mb-8">
          <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm text-green-400 font-semibold">
                {currentStep.toUpperCase()} - Question {questionIndex + 1} of {PLACEHOLDER_QUESTIONS[currentStep].length}
              </span>
            </div>
            <h2 className="text-3xl font-bold text-white leading-relaxed">
              {getCurrentQuestion()}
            </h2>
            <p className="text-gray-400 mt-4 text-sm">
              Note: These are temporary placeholder questions. Watson will implement the full question database and cycling logic.
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
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-xl transition-all text-lg"
          >
            Submit Answer
          </button>
        </div>

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

        {/* Info Box */}
        <div className="mt-8 bg-gray-900/50 rounded-xl p-6 border border-gray-800">
          <p className="text-gray-400 text-sm leading-relaxed">
            <strong className="text-white">About Step In:</strong> This is your space for honest step work.
            Each question is designed to help you see clearly and find your own truth.
            Take your time—there&apos;s no rush. You move at your own pace through the steps.
          </p>
        </div>
      </div>
    </div>
  );
}
