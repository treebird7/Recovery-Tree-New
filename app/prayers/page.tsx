'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface LibraryPrayer {
  id: string;
  prayer_text: string;
  source: string;
  author: string | null;
}

interface CollaborationAnswer {
  question: string;
  answer: string;
}

type Mode = 'selection' | 'custom' | 'collaboration';

export default function PrayerProtocolPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('selection');
  const [libraryPrayers, setLibraryPrayers] = useState<LibraryPrayer[]>([]);
  const [selectedPrayerIds, setSelectedPrayerIds] = useState<Set<string>>(new Set());
  const [customPrayerText, setCustomPrayerText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // Collaboration state
  const [collaborationStep, setCollaborationStep] = useState(0);
  const [collaborationAnswers, setCollaborationAnswers] = useState<CollaborationAnswer[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [generatedPrayer, setGeneratedPrayer] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const collaborationQuestions = [
    "What's the one thing you're most ready to let go of right now?",
    "If you were giving that over to your Higher Power, what specifically would you say?",
    "What do you need from your Higher Power in exchange? Guidance? Peace? Strength?",
    "How do you want to remember this commitment? What phrase captures it all?",
  ];

  useEffect(() => {
    fetchPrayerLibrary();
  }, []);

  const fetchPrayerLibrary = async () => {
    try {
      const response = await fetch('/api/prayers/library');
      if (!response.ok) throw new Error('Failed to fetch prayers');

      const data = await response.json();
      setLibraryPrayers(data.prayers || []);
    } catch (err) {
      console.error('Error fetching prayers:', err);
      setError('Failed to load prayer library');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePrayerSelection = (prayerId: string) => {
    const newSelection = new Set(selectedPrayerIds);
    if (newSelection.has(prayerId)) {
      newSelection.delete(prayerId);
    } else {
      newSelection.add(prayerId);
    }
    setSelectedPrayerIds(newSelection);
  };

  const handleCollaborationNext = () => {
    if (!currentAnswer.trim()) {
      alert('Please enter an answer before continuing.');
      return;
    }

    const newAnswers = [
      ...collaborationAnswers,
      {
        question: collaborationQuestions[collaborationStep],
        answer: currentAnswer,
      },
    ];

    setCollaborationAnswers(newAnswers);
    setCurrentAnswer('');

    if (collaborationStep < collaborationQuestions.length - 1) {
      setCollaborationStep(collaborationStep + 1);
    } else {
      // All questions answered - generate prayer
      generatePrayer(newAnswers);
    }
  };

  const generatePrayer = async (answers: CollaborationAnswer[]) => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/prayers/collaborate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) throw new Error('Failed to generate prayer');

      const data = await response.json();
      setGeneratedPrayer(data.prayer);
      setCollaborationStep(collaborationQuestions.length); // Move to review step
    } catch (err) {
      console.error('Error generating prayer:', err);
      alert('Failed to generate prayer. Please try again.');
      setCollaborationStep(0);
      setCollaborationAnswers([]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSavePrayers = async () => {
    // Collect all prayers to save
    const prayersToSave = [];

    // Add selected library prayers
    selectedPrayerIds.forEach((prayerId) => {
      const prayer = libraryPrayers.find((p) => p.id === prayerId);
      if (prayer) {
        prayersToSave.push({
          type: 'library',
          prayerText: prayer.prayer_text,
          libraryPrayerId: prayer.id,
          isPrimary: false,
        });
      }
    });

    // Add custom prayer if entered
    if (mode === 'custom' && customPrayerText.trim()) {
      prayersToSave.push({
        type: 'custom',
        prayerText: customPrayerText.trim(),
        source: 'custom',
        isPrimary: false,
      });
    }

    // Add generated prayer if exists
    if (mode === 'collaboration' && generatedPrayer.trim()) {
      prayersToSave.push({
        type: 'custom',
        prayerText: generatedPrayer.trim(),
        source: 'elder_tree_collaborative',
        isPrimary: false,
      });
    }

    if (prayersToSave.length === 0) {
      alert('Please select or create at least one prayer before saving.');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/prayers/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prayers: prayersToSave,
          markComplete: true, // Mark Step 3 complete
        }),
      });

      if (!response.ok) throw new Error('Failed to save prayers');

      const data = await response.json();

      if (data.step3Complete) {
        // Show completion message and redirect
        alert(
          "You've completed Step 3. You've admitted powerlessness, believed help exists, and made the decision to turn your will and life over to your Higher Power. That's the foundation."
        );
        router.push('/dashboard');
      } else {
        alert('Prayers saved successfully!');
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Error saving prayers:', err);
      alert('Failed to save prayers. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mb-4"></div>
          <p className="text-gray-400">Loading prayers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="mb-6 flex items-center gap-2 text-gray-400 hover:text-gray-200 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Dashboard
          </button>

          <h1 className="text-3xl font-bold text-green-400 mb-2">Step 3 Prayer</h1>
          <p className="text-gray-400 text-lg">Choose or Create Your Prayer</p>
        </div>

        {/* Elder Tree Guidance */}
        <div className="mb-8 bg-gray-900 rounded-xl p-6 border border-gray-800">
          <p className="text-gray-200 leading-relaxed">
            You've done the work of Step 3—you've looked at what you're willing to turn over and
            what you're holding onto. Now comes the commitment: a prayer that captures your decision
            to let your Higher Power take the lead. This isn't about perfect words. It's about your
            honest intention.
          </p>
        </div>

        {/* Mode Selection */}
        <div className="mb-8 flex gap-4">
          <button
            onClick={() => setMode('selection')}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition ${
              mode === 'selection'
                ? 'bg-green-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Browse Library
          </button>
          <button
            onClick={() => setMode('custom')}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition ${
              mode === 'custom'
                ? 'bg-green-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Write Your Own
          </button>
          <button
            onClick={() => setMode('collaboration')}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition ${
              mode === 'collaboration'
                ? 'bg-green-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Create With Elder Tree
          </button>
        </div>

        {/* Prayer Library Selection */}
        {mode === 'selection' && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Prayer Library</h2>
            {error && <div className="text-red-400 mb-4">{error}</div>}
            <div className="space-y-4">
              {libraryPrayers.map((prayer) => (
                <div
                  key={prayer.id}
                  onClick={() => togglePrayerSelection(prayer.id)}
                  className={`bg-gray-900 rounded-xl p-6 border-2 cursor-pointer transition ${
                    selectedPrayerIds.has(prayer.id)
                      ? 'border-green-600 bg-green-900/20'
                      : 'border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <input
                        type="checkbox"
                        checked={selectedPrayerIds.has(prayer.id)}
                        onChange={() => togglePrayerSelection(prayer.id)}
                        className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-green-600 focus:ring-green-600"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-200 leading-relaxed mb-2">{prayer.prayer_text}</p>
                      {prayer.author && (
                        <p className="text-sm text-gray-500">— {prayer.author}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Custom Prayer Input */}
        {mode === 'custom' && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Write Your Own Prayer</h2>
            <textarea
              value={customPrayerText}
              onChange={(e) => setCustomPrayerText(e.target.value)}
              placeholder="Write your prayer here... or start with 'I turn over...'"
              className="w-full bg-gray-900 text-white border border-gray-800 rounded-xl p-6 text-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
              rows={8}
              autoFocus
            />
          </div>
        )}

        {/* Elder Tree Collaboration */}
        {mode === 'collaboration' && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Create With Elder Tree</h2>

            {collaborationStep < collaborationQuestions.length ? (
              <div className="space-y-6">
                <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                  <p className="text-gray-400 text-sm mb-2">
                    Question {collaborationStep + 1} of {collaborationQuestions.length}
                  </p>
                  <h3 className="text-xl font-semibold text-white mb-4">
                    {collaborationQuestions[collaborationStep]}
                  </h3>
                  <textarea
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="Your answer..."
                    className="w-full bg-gray-800 text-white border border-gray-700 rounded-xl p-4 text-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-600"
                    rows={4}
                    autoFocus
                  />
                </div>

                <button
                  onClick={handleCollaborationNext}
                  disabled={!currentAnswer.trim()}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-xl transition-all disabled:bg-gray-700 disabled:cursor-not-allowed"
                >
                  {collaborationStep < collaborationQuestions.length - 1 ? 'Next Question' : 'Generate Prayer'}
                </button>
              </div>
            ) : isGenerating ? (
              <div className="bg-gray-900 rounded-xl p-12 border border-gray-800 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mb-4"></div>
                <p className="text-gray-400">Elder Tree is crafting your prayer...</p>
              </div>
            ) : generatedPrayer ? (
              <div className="space-y-6">
                <div className="bg-gray-900 rounded-xl p-6 border border-green-600">
                  <h3 className="text-lg font-semibold text-green-400 mb-4">Your Prayer</h3>
                  <textarea
                    value={generatedPrayer}
                    onChange={(e) => setGeneratedPrayer(e.target.value)}
                    className="w-full bg-gray-800 text-white border border-gray-700 rounded-xl p-4 text-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-600"
                    rows={6}
                  />
                  <p className="text-gray-500 text-sm mt-3">
                    You can edit this prayer before saving
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setCollaborationStep(0);
                      setCollaborationAnswers([]);
                      setCurrentAnswer('');
                      setGeneratedPrayer('');
                    }}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 px-8 rounded-xl transition-all"
                  >
                    Start Over
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Save Button */}
        {((mode === 'selection' && selectedPrayerIds.size > 0) ||
          (mode === 'custom' && customPrayerText.trim()) ||
          (mode === 'collaboration' && generatedPrayer.trim())) && (
          <div className="pt-6 border-t border-gray-800">
            <button
              onClick={handleSavePrayers}
              disabled={isSaving}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-xl transition-all text-lg disabled:bg-gray-700 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save My Prayer(s) & Complete Step 3'}
            </button>
          </div>
        )}

        {/* Info */}
        <div className="mt-8 bg-gray-900/50 rounded-xl p-6 border border-gray-800">
          <p className="text-gray-400 text-sm leading-relaxed">
            <strong className="text-white">About Your Prayer:</strong> This prayer becomes part of
            your daily recovery practice. You can select multiple prayers, write your own, or
            collaborate with Elder Tree to create one. Choose what feels honest and right for you.
          </p>
        </div>
      </div>
    </div>
  );
}
