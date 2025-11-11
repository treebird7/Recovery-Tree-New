'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function UrgePage() {
  const router = useRouter();
  const [username, setUsername] = useState('friend');
  const [currentTime, setCurrentTime] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const [stage, setStage] = useState<'initial' | 'response' | 'solution'>('initial');
  const [userInput, setUserInput] = useState('');
  const [urgeStrength, setUrgeStrength] = useState(5);
  const [elderResponse, setElderResponse] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [timerDuration, setTimerDuration] = useState<number | null>(null); // in minutes, null = indefinite
  const [customMinutes, setCustomMinutes] = useState<string>(''); // for custom input
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [miningIntent, setMiningIntent] = useState<'sleep' | 'screen'>('sleep'); // User's reason for mining
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [conversationCount, setConversationCount] = useState(0);
  const [isReadyForSolution, setIsReadyForSolution] = useState(false);

  useEffect(() => {
    // Get current time
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    setCurrentTime(`${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`);

    // Get user display name
    const getUserInfo = async () => {
      try {
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const data = await response.json();
          setUsername(data.displayName || 'friend');
        }
      } catch (error) {
        console.error('Error getting user info:', error);
        // Falls back to 'friend' default
      }
    };

    getUserInfo();
  }, []);

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    // Add user message to conversation history
    const newHistory = [...conversationHistory, { role: 'user' as const, content: userInput }];
    setConversationHistory(newHistory);
    setConversationCount(conversationCount + 1);

    const currentInput = userInput;
    setUserInput(''); // Clear input field
    setIsGenerating(true);

    try {
      const response = await fetch('/api/urge/response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userInput: currentInput,
          urgeStrength,
          conversationHistory: newHistory,
          conversationCount: conversationCount + 1,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate response');
      }

      const data = await response.json();

      // Add Elder Tree response to conversation history
      setConversationHistory([...newHistory, { role: 'assistant' as const, content: data.response }]);
      setElderResponse(data.response);

      // Check if Elder Tree is ready to offer solution
      setIsReadyForSolution(data.readyForSolution || false);

      setStage('response');
    } catch (error) {
      console.error('Error generating response:', error);
      alert('Failed to generate response. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartMining = async () => {
    setIsStarting(true);

    try {
      const response = await fetch('/api/mining/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ durationMinutes: timerDuration }),
      });

      if (!response.ok) {
        throw new Error('Failed to start mining');
      }

      const data = await response.json();

      // Navigate to timer activation screen with duration and intent parameters
      const url = `/urge/mining?sessionId=${data.sessionId}${timerDuration ? `&duration=${timerDuration}` : ''}${miningIntent ? `&intent=${miningIntent}` : ''}`;
      router.push(url);
    } catch (error) {
      console.error('Error starting mining:', error);
      alert('Failed to start mining timer. Please try again.');
      setIsStarting(false);
    }
  };

  const handleGoToWalk = () => {
    router.push('/walk');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        {/* Back to Dashboard */}
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

        {/* Elder Tree Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🌳</div>
          <h1 className="text-2xl font-bold text-green-400">Elder Tree</h1>
        </div>

        {/* Stage 1: Initial Question */}
        {stage === 'initial' && (
          <>
            <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 mb-6 border border-gray-700">
              <div className="space-y-4 text-lg leading-relaxed">
                <p className="text-gray-300">
                  Hey <span className="text-white font-semibold">{username}</span>.{' '}
                  <span className="text-green-400">{currentTime}</span>.
                </p>

                <p>
                  I&apos;m guessing you&apos;re not opening this app because everything feels easy right now.
                </p>

                <p className="text-gray-400 mb-6">What&apos;s going on?</p>

                <form onSubmit={handleUserSubmit}>
                  <textarea
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Type what's happening..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-600 bg-gray-900 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent mb-6 text-gray-100 placeholder:text-gray-500"
                  />

                  {/* Urge Strength Slider */}
                  <div className="mb-6">
                    <label className="block text-gray-300 mb-3 text-base">
                      How strong is the urge right now?
                    </label>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-400 text-sm w-8">0</span>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={urgeStrength}
                        onChange={(e) => setUrgeStrength(Number(e.target.value))}
                        className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-600"
                      />
                      <span className="text-gray-400 text-sm w-8">10</span>
                    </div>
                    <div className="text-center mt-2">
                      <span className="text-2xl font-bold text-green-400">{urgeStrength}</span>
                      <span className="text-gray-500 text-sm ml-2">
                        {urgeStrength === 0 && '(Just checking in)'}
                        {urgeStrength >= 1 && urgeStrength <= 3 && '(Mild)'}
                        {urgeStrength >= 4 && urgeStrength <= 6 && '(Moderate)'}
                        {urgeStrength >= 7 && urgeStrength <= 8 && '(Strong)'}
                        {urgeStrength >= 9 && '(Intense)'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!userInput.trim() || isGenerating}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? 'Listening...' : 'Continue'}
                  </button>
                </form>
              </div>
            </div>
          </>
        )}

        {/* Stage 2: Elder Tree Response */}
        {stage === 'response' && (
          <>
            {/* Conversation History */}
            <div className="space-y-4 mb-6">
              {conversationHistory.map((message, index) => (
                <div
                  key={index}
                  className={`rounded-2xl shadow-2xl p-6 border ${
                    message.role === 'user'
                      ? 'bg-gray-700 border-gray-600 ml-8'
                      : 'bg-gray-800 border-gray-700'
                  }`}
                >
                  {message.role === 'user' ? (
                    <p className="text-gray-200 text-base">{message.content}</p>
                  ) : (
                    <div className="border-l-4 border-green-600 pl-4 py-2 bg-gray-900/50">
                      <p className="text-gray-300 whitespace-pre-wrap text-lg leading-relaxed">
                        {message.content}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Follow-up input OR Listen button */}
            {/* Show follow-up input only if explicitly needed, otherwise show Willing button */}
            {conversationCount > 1 && !isReadyForSolution && conversationCount < 5 ? (
              <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 mb-6 border border-gray-700">
                <form onSubmit={handleUserSubmit}>
                  <textarea
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Continue the conversation..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-600 bg-gray-900 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent mb-4 text-gray-100 placeholder:text-gray-500"
                  />
                  <button
                    type="submit"
                    disabled={!userInput.trim() || isGenerating}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? 'Listening...' : 'Continue'}
                  </button>
                </form>
              </div>
            ) : (
              /* Listen Button - Show by default after first response (backward compatible) */
              <button
                onClick={() => setStage('solution')}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6 px-8 rounded-xl transition-all shadow-2xl text-xl"
              >
                I&apos;m Willing to Listen
              </button>
            )}
          </>
        )}

        {/* Stage 3: Solution & Actions */}
        {stage === 'solution' && (
          <>
            <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 mb-6 border border-gray-700">
              <div className="space-y-4 text-lg leading-relaxed">
                <div className="bg-green-900/30 border border-green-600 rounded-lg p-4 mb-6">
                  <p className="text-green-100">
                    <strong>You can put your phone down, close your eyes, and let your tree mine coins while
                    you rest.</strong>
                  </p>
                  <p className="text-green-200 mt-2 text-base">
                    Even if you can&apos;t sleep right away - just lying there in the dark, breathing, not acting
                    out - that counts. Every minute you&apos;re <em>not</em> acting out, your tree grows stronger.
                  </p>
                </div>

                <p className="text-gray-400">
                  Or you can keep white-knuckling this alone, riding the obsession until it wins or you
                  collapse from exhaustion.
                </p>

                <p className="text-xl font-bold text-white mt-6">
                  What&apos;s it going to be, {username}?
                </p>
              </div>
            </div>

            {/* Intent Choice - What do you need help with? */}
            <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 mb-6 border border-gray-700">
              <h3 className="text-white font-semibold mb-4 text-lg">What do you need help with?</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setMiningIntent('sleep')}
                  className={`py-4 px-4 rounded-lg font-semibold transition-all ${
                    miningIntent === 'sleep'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  😴 Going to sleep
                </button>

                <button
                  onClick={() => setMiningIntent('screen')}
                  className={`py-4 px-4 rounded-lg font-semibold transition-all ${
                    miningIntent === 'screen'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  📵 Putting screen down
                </button>
              </div>
            </div>

            {/* Timer Duration Selector */}
            <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 mb-6 border border-gray-700">
              <h3 className="text-white font-semibold mb-4 text-lg">How long do you want to rest?</h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <button
                  onClick={() => { setTimerDuration(null); setShowCustomInput(false); }}
                  className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                    timerDuration === null && !showCustomInput
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Until morning
                </button>
                <button
                  onClick={() => { setTimerDuration(30); setShowCustomInput(false); }}
                  className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                    timerDuration === 30 && !showCustomInput
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  30 minutes
                </button>
                <button
                  onClick={() => { setTimerDuration(60); setShowCustomInput(false); }}
                  className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                    timerDuration === 60 && !showCustomInput
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  1 hour
                </button>
                <button
                  onClick={() => { setTimerDuration(120); setShowCustomInput(false); }}
                  className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                    timerDuration === 120 && !showCustomInput
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  2 hours
                </button>
              </div>

              {/* Custom Timer Input */}
              <div className="border-t border-gray-700 pt-3">
                <button
                  onClick={() => { setShowCustomInput(!showCustomInput); if (!showCustomInput) setTimerDuration(null); }}
                  className={`w-full py-2 px-4 rounded-lg font-semibold transition-all text-sm ${
                    showCustomInput
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {showCustomInput ? '✓ Custom Time' : '+ Set Custom Time'}
                </button>

                {showCustomInput && (
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="480"
                      value={customMinutes}
                      onChange={(e) => {
                        setCustomMinutes(e.target.value);
                        const minutes = parseInt(e.target.value);
                        if (minutes > 0 && minutes <= 480) {
                          setTimerDuration(minutes);
                        }
                      }}
                      placeholder="Minutes"
                      className="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
                    />
                    <span className="text-gray-400 text-sm">minutes</span>
                  </div>
                )}
              </div>
              {timerDuration && (
                <p className="text-gray-400 text-sm mt-3 text-center">
                  Timer will end at{' '}
                  {new Date(Date.now() + timerDuration * 60000).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={handleStartMining}
                disabled={isStarting}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6 px-8 rounded-xl transition-all shadow-2xl disabled:bg-gray-600 disabled:cursor-not-allowed text-xl"
              >
                {isStarting
                  ? 'Starting Timer...'
                  : miningIntent === 'sleep'
                    ? '🌳 Start Sleep Mining Timer'
                    : '🌳 Start Mining Timer'
                }
              </button>

              <button
                onClick={handleGoToWalk}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-4 px-8 rounded-xl transition-all border-2 border-gray-600"
              >
                I&apos;m OK - Take Me to Walk Session
              </button>
            </div>

            {/* Subtle Info */}
            <div className="mt-8 text-center text-gray-500 text-sm">
              <p>Every minute mining = 1 coin earned</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
