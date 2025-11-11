'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface DailyInventory {
  id: string;
  date: string;
  what_went_well: string;
  struggles_today: string;
  gratitude: string;
  tomorrow_intention: string;
  elder_reflection: string;
  completed_at: string;
}

export default function InventoryHistoryPage() {
  const router = useRouter();
  const [inventories, setInventories] = useState<DailyInventory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInventory, setSelectedInventory] = useState<DailyInventory | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/inventory/history');
      if (!response.ok) {
        throw new Error('Failed to fetch history');
      }

      const data = await response.json();
      setInventories(data.inventories);
    } catch (error) {
      console.error('Error fetching inventory history:', error);
      alert('Failed to load inventory history');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">📝</div>
          <p className="text-gray-600">Loading your inventory history...</p>
        </div>
      </div>
    );
  }

  if (selectedInventory) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          {/* Back Button */}
          <button
            onClick={() => setSelectedInventory(null)}
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
            Back to History
          </button>

          {/* Date Header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">📝</div>
            <h1 className="text-2xl font-bold text-gray-900">
              {formatDate(selectedInventory.date)}
            </h1>
          </div>

          {/* Elder Tree Reflection */}
          <div className="bg-green-50 border-l-4 border-green-600 p-6 rounded-lg mb-8">
            <div className="flex items-start">
              <div className="text-3xl mr-4">🌳</div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Elder Tree</h3>
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {selectedInventory.elder_reflection}
                </p>
              </div>
            </div>
          </div>

          {/* Inventory Details */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-green-700 mb-2">
                  What went well
                </h3>
                <p className="text-gray-800">{selectedInventory.what_went_well}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-orange-700 mb-2">
                  Struggles today
                </h3>
                <p className="text-gray-800">{selectedInventory.struggles_today}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-purple-700 mb-2">
                  Grateful for
                </h3>
                <p className="text-gray-800">{selectedInventory.gratitude}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-blue-700 mb-2">
                  Tomorrow&apos;s intention
                </h3>
                <p className="text-gray-800">{selectedInventory.tomorrow_intention}</p>
              </div>
            </div>
          </div>

          {/* Back to Dashboard */}
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-300 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
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

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Inventory History
          </h1>
          <p className="text-gray-600">
            Your daily reflections and growth over time
          </p>
        </div>

        {inventories.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              No Inventories Yet
            </h2>
            <p className="text-gray-600 mb-6">
              Complete your first daily inventory to start tracking your journey
            </p>
            <button
              onClick={() => router.push('/inventory')}
              className="bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-purple-700 transition"
            >
              Complete Today&apos;s Inventory
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {inventories.map((inventory) => (
              <div
                key={inventory.id}
                onClick={() => setSelectedInventory(inventory)}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {formatDate(inventory.date)}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                      {inventory.elder_reflection}
                    </p>
                    <div className="flex gap-4 text-xs text-gray-500">
                      <span>✓ Completed</span>
                      <span>
                        {new Date(inventory.completed_at).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                  <div>
                    <svg
                      className="w-6 h-6 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
