'use client';

interface WalkaboutGuidanceProps {
  onStartWalk: () => void;
}

export default function WalkaboutGuidance({ onStartWalk }: WalkaboutGuidanceProps) {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      {/* Back to Dashboard */}
      <button
        onClick={() => window.location.href = '/dashboard'}
        className="mb-6 flex items-center gap-2 text-amber-700 hover:text-amber-900 transition"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Dashboard
      </button>

      <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
        {/* Title */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-amber-800 mb-2">
            🌿 Step Outside
          </h1>
        </div>

        {/* Elder Tree Grounding Guidance */}
        <div className="bg-amber-50 border-l-4 border-amber-600 p-6 rounded-lg space-y-4">
          <p className="text-gray-800 leading-relaxed">
            You've chosen to step outside. That's good.
          </p>

          <p className="text-gray-800 leading-relaxed">
            This walk isn't about making the craving disappear. It's about connecting
            with your Higher Power through your body and the world around you.
          </p>

          <div className="space-y-2">
            <p className="text-gray-800 font-medium">While you walk:</p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-amber-600 mr-2">•</span>
                Feel your feet on the ground
              </li>
              <li className="flex items-start">
                <span className="text-amber-600 mr-2">•</span>
                Notice the air, the sounds, what you can see
              </li>
              <li className="flex items-start">
                <span className="text-amber-600 mr-2">•</span>
                When the waves come, bring your attention back to what's physically real
              </li>
              <li className="flex items-start">
                <span className="text-amber-600 mr-2">•</span>
                Talk to your HP - just honest conversation
              </li>
              <li className="flex items-start">
                <span className="text-amber-600 mr-2">•</span>
                If you find a place that feels right, sit for a moment and let yourself settle there
              </li>
            </ul>
          </div>
        </div>

        {/* Start Walk Button */}
        <button
          onClick={onStartWalk}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors shadow-lg text-lg"
        >
          START WALK
        </button>
      </div>
    </div>
  );
}
