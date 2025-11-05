'use client';

import { useState } from 'react';

interface InventoryPromptProps {
  onComplete: (responses: InventoryResponses) => void;
}

export interface InventoryResponses {
  whatWentWell: string;
  strugglesToday: string;
  gratitude: string;
  tomorrowIntention: string;
  additionalNotes?: string;
}

const QUESTIONS = [
  {
    id: 'whatWentWell',
    question: 'What went well today?',
    placeholder: 'Recovery wins, connections, moments of honesty...',
    helpText: 'Focus on the positives first - what went right today?',
  },
  {
    id: 'strugglesToday',
    question: 'What was hard today?',
    placeholder: 'Urges, resentments, challenges...',
    helpText: 'Be honest about what was difficult. Where did you stumble?',
  },
  {
    id: 'gratitude',
    question: 'What are you grateful for?',
    placeholder: '1-3 things...',
    helpText: 'Keep it real, not performative. What actually matters?',
  },
  {
    id: 'tomorrowIntention',
    question: "What's one thing you'll do differently tomorrow?",
    placeholder: 'Be specific and actionable...',
    helpText: 'Not a vague commitment - what specific action will you take?',
  },
];

export default function InventoryPrompt({ onComplete }: InventoryPromptProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Partial<InventoryResponses>>({});
  const [currentAnswer, setCurrentAnswer] = useState('');

  const currentQuestion = QUESTIONS[currentStep];
  const isLastQuestion = currentStep === QUESTIONS.length - 1;

  const handleNext = () => {
    // Save current answer
    setResponses({
      ...responses,
      [currentQuestion.id]: currentAnswer,
    });

    if (isLastQuestion) {
      // Complete inventory
      onComplete({
        ...responses,
        [currentQuestion.id]: currentAnswer,
      } as InventoryResponses);
    } else {
      // Move to next question
      setCurrentStep(currentStep + 1);
      setCurrentAnswer('');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      // Load previous answer
      const prevQuestion = QUESTIONS[currentStep - 1];
      setCurrentAnswer(responses[prevQuestion.id as keyof InventoryResponses] || '');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">
            Question {currentStep + 1} of {QUESTIONS.length}
          </span>
          <span className="text-sm text-gray-600">
            {Math.round(((currentStep + 1) / QUESTIONS.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / QUESTIONS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="mb-6">
          <div className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full mb-4">
            Elder Tree
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {currentQuestion.question}
          </h2>
          <p className="text-gray-600 text-sm">{currentQuestion.helpText}</p>
        </div>

        <div className="space-y-4">
          <textarea
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder={currentQuestion.placeholder}
            rows={6}
            autoFocus
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
          />

          {/* Buttons */}
          <div className="flex gap-3">
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
            )}

            <button
              onClick={handleNext}
              disabled={!currentAnswer.trim()}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isLastQuestion ? 'Complete Inventory' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
