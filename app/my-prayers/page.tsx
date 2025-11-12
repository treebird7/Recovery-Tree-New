'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Prayer {
  id: string;
  prayer_text: string;
  source: string;
  is_primary: boolean;
  created_at: string;
}

export default function MyPrayersPage() {
  const router = useRouter();
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchPrayers();
  }, []);

  const fetchPrayers = async () => {
    try {
      const response = await fetch('/api/prayers/user');
      if (!response.ok) throw new Error('Failed to fetch prayers');

      const data = await response.json();
      setPrayers(data.prayers || []);
    } catch (err) {
      console.error('Error fetching prayers:', err);
      alert('Failed to load prayers');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetPrimary = async (prayerId: string) => {
    try {
      const response = await fetch('/api/prayers/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prayerId, isPrimary: true }),
      });

      if (!response.ok) throw new Error('Failed to update prayer');

      // Refresh prayers
      await fetchPrayers();
    } catch (err) {
      console.error('Error setting primary prayer:', err);
      alert('Failed to set primary prayer');
    }
  };

  const handleStartEdit = (prayer: Prayer) => {
    setEditingId(prayer.id);
    setEditText(prayer.prayer_text);
  };

  const handleSaveEdit = async (prayerId: string) => {
    if (!editText.trim()) {
      alert('Prayer text cannot be empty');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/prayers/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prayerId, prayerText: editText }),
      });

      if (!response.ok) throw new Error('Failed to update prayer');

      // Refresh prayers
      await fetchPrayers();
      setEditingId(null);
      setEditText('');
    } catch (err) {
      console.error('Error updating prayer:', err);
      alert('Failed to update prayer');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleDelete = async (prayerId: string) => {
    const confirmed = confirm('Are you sure you want to delete this prayer?');
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/prayers/update?id=${prayerId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete prayer');

      // Refresh prayers
      await fetchPrayers();
    } catch (err) {
      console.error('Error deleting prayer:', err);
      alert('Failed to delete prayer');
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'library_selected':
        return 'From Library';
      case 'custom':
        return 'Custom';
      case 'elder_tree_collaborative':
        return 'Co-created with Elder Tree';
      default:
        return source;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mb-4"></div>
          <p className="text-gray-400">Loading your prayers...</p>
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

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-green-400 mb-2">My Prayers</h1>
              <p className="text-gray-400 text-lg">Your Step 3 commitment prayers</p>
            </div>

            <button
              onClick={() => router.push('/prayers')}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg transition"
            >
              Add Prayer
            </button>
          </div>
        </div>

        {/* Prayers List */}
        {prayers.length === 0 ? (
          <div className="bg-gray-900 rounded-xl p-12 border border-gray-800 text-center">
            <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-purple-400"
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
            <h3 className="text-xl font-bold text-white mb-2">No prayers yet</h3>
            <p className="text-gray-400 mb-6">
              Start by selecting from the library or creating your own Step 3 prayer
            </p>
            <button
              onClick={() => router.push('/prayers')}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-lg transition"
            >
              Create Your First Prayer
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {prayers.map((prayer) => (
              <div
                key={prayer.id}
                className={`bg-gray-900 rounded-xl p-6 border-2 transition ${
                  prayer.is_primary
                    ? 'border-purple-600 bg-purple-900/10'
                    : 'border-gray-800'
                }`}
              >
                {/* Header with badges */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex gap-2">
                    {prayer.is_primary && (
                      <span className="bg-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                        Primary Prayer
                      </span>
                    )}
                    <span className="bg-gray-800 text-gray-400 text-xs font-semibold px-3 py-1 rounded-full">
                      {getSourceLabel(prayer.source)}
                    </span>
                  </div>

                  {/* Actions dropdown */}
                  <div className="flex gap-2">
                    {!prayer.is_primary && (
                      <button
                        onClick={() => handleSetPrimary(prayer.id)}
                        className="text-sm text-purple-400 hover:text-purple-300 transition"
                      >
                        Set as Primary
                      </button>
                    )}
                  </div>
                </div>

                {/* Prayer text */}
                {editingId === prayer.id ? (
                  <div className="space-y-4">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full bg-gray-800 text-white border border-gray-700 rounded-xl p-4 text-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-600"
                      rows={6}
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleSaveEdit(prayer.id)}
                        disabled={isSaving}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition disabled:bg-gray-700"
                      >
                        {isSaving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={isSaving}
                        className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition disabled:bg-gray-800"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-200 text-lg leading-relaxed mb-4">
                      {prayer.prayer_text}
                    </p>

                    {/* Action buttons */}
                    <div className="flex gap-4 pt-4 border-t border-gray-800">
                      <button
                        onClick={() => handleStartEdit(prayer)}
                        className="text-sm text-gray-400 hover:text-gray-200 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(prayer.id)}
                        className="text-sm text-red-400 hover:text-red-300 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}

                {/* Created date */}
                <p className="text-xs text-gray-500 mt-4">
                  Created {new Date(prayer.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Info */}
        {prayers.length > 0 && (
          <div className="mt-8 bg-gray-900/50 rounded-xl p-6 border border-gray-800">
            <p className="text-gray-400 text-sm leading-relaxed">
              <strong className="text-white">About Your Prayers:</strong> Your primary prayer is
              the one you'll use most often in your daily practice. You can mark any prayer as
              primary, edit them anytime, or add new ones as your recovery journey evolves.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
