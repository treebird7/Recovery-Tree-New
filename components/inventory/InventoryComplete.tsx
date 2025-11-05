'use client';

import { useRouter } from 'next/navigation';

interface InventoryCompleteProps {
  elderReflection: string;
  responses: {
    whatWentWell: string;
    strugglesToday: string;
    gratitude: string;
    tomorrowIntention: string;
  };
}

export default function InventoryComplete({
  elderReflection,
  responses,
}: InventoryCompleteProps) {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Back to Dashboard */}
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

      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🌿</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Inventory Complete
        </h1>
        <p className="text-gray-600">You showed up today. That matters.</p>
      </div>

      {/* Elder Tree Reflection */}
      <div className="bg-green-50 border-l-4 border-green-600 p-6 rounded-lg mb-8">
        <div className="flex items-start">
          <div className="text-3xl mr-4">🌳</div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Elder Tree</h3>
            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
              {elderReflection}
            </p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Today's Inventory</h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-green-700 mb-2">
              What went well
            </h3>
            <p className="text-gray-800">{responses.whatWentWell}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-orange-700 mb-2">
              Struggles today
            </h3>
            <p className="text-gray-800">{responses.strugglesToday}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-purple-700 mb-2">
              Grateful for
            </h3>
            <p className="text-gray-800">{responses.gratitude}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-blue-700 mb-2">
              Tomorrow's intention
            </h3>
            <p className="text-gray-800">{responses.tomorrowIntention}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-4">
        <button
          onClick={() => router.push('/dashboard')}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors"
        >
          Back to Dashboard
        </button>

        <button
          onClick={() => router.push('/inventory/history')}
          className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-4 px-6 rounded-lg transition-colors border-2 border-gray-200"
        >
          View Past Inventories
        </button>
      </div>

      {/* Info */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          Your inventory is saved privately. Rest well tonight.
        </p>
      </div>
    </div>
  );
}
