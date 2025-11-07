'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface SessionHistoryItem {
  id: string;
  session_type: 'walk' | 'mining';
  started_at: string;
  completed_at: string;
  duration_minutes: number;
  coins_earned: number;
  preview: string;
}

interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
}

type FilterType = 'all' | 'walk' | 'mining';

export default function SessionHistoryPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    limit: 20,
    offset: 0,
  });
  const [selectedSession, setSelectedSession] = useState<SessionHistoryItem | null>(null);

  useEffect(() => {
    fetchHistory();
  }, [filter, pagination.offset]);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        limit: pagination.limit.toString(),
        offset: pagination.offset.toString(),
      });

      if (filter !== 'all') {
        params.append('type', filter);
      }

      const response = await fetch(`/api/sessions/history?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch session history');
      }

      const data = await response.json();
      setSessions(data.sessions);
      setPagination({
        ...pagination,
        total: data.pagination.total,
      });
    } catch (error) {
      console.error('Error fetching session history:', error);
      alert('Failed to load session history');
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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getSessionIcon = (type: 'walk' | 'mining') => {
    return type === 'walk' ? '🚶' : '⛏️';
  };

  const getSessionColor = (type: 'walk' | 'mining') => {
    return type === 'walk' ? 'green' : 'orange';
  };

  const handleNextPage = () => {
    if (pagination.offset + pagination.limit < pagination.total) {
      setPagination({
        ...pagination,
        offset: pagination.offset + pagination.limit,
      });
    }
  };

  const handlePrevPage = () => {
    if (pagination.offset > 0) {
      setPagination({
        ...pagination,
        offset: Math.max(0, pagination.offset - pagination.limit),
      });
    }
  };

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
    setPagination({
      ...pagination,
      offset: 0, // Reset to first page when filter changes
    });
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);
  const currentPage = Math.floor(pagination.offset / pagination.limit) + 1;

  if (isLoading && sessions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">📜</div>
          <p className="text-gray-600">Loading your session history...</p>
        </div>
      </div>
    );
  }

  if (selectedSession) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          {/* Back Button */}
          <button
            onClick={() => setSelectedSession(null)}
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

          {/* Session Header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">
              {getSessionIcon(selectedSession.session_type)}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {selectedSession.session_type === 'walk' ? 'Recovery Walk' : 'Urge Mining'}
            </h1>
            <p className="text-gray-600">
              {formatDate(selectedSession.completed_at)} at {formatTime(selectedSession.completed_at)}
            </p>
          </div>

          {/* Session Stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {selectedSession.duration_minutes} min
              </div>
              <div className="text-sm text-gray-600">Duration</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {selectedSession.coins_earned} 🪙
              </div>
              <div className="text-sm text-gray-600">Coins Earned</div>
            </div>
          </div>

          {/* Session Preview */}
          <div className={`bg-${getSessionColor(selectedSession.session_type)}-50 border-l-4 border-${getSessionColor(selectedSession.session_type)}-600 p-6 rounded-lg mb-8`}>
            <div className="flex items-start">
              <div className="text-3xl mr-4">🌳</div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Reflection</h3>
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {selectedSession.preview}
                </p>
              </div>
            </div>
          </div>

          {/* Note about full details */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <p className="text-sm text-blue-800">
              💡 Full session details and conversation history coming soon in the detail view
            </p>
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
            Session History
          </h1>
          <p className="text-gray-600">
            Your recovery walks and urge mining sessions
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <button
            onClick={() => handleFilterChange('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'all'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All Sessions
          </button>
          <button
            onClick={() => handleFilterChange('walk')}
            className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
              filter === 'walk'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            🚶 Walks
          </button>
          <button
            onClick={() => handleFilterChange('mining')}
            className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
              filter === 'mining'
                ? 'bg-orange-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            ⛏️ Mining
          </button>
        </div>

        {/* Sessions List */}
        {sessions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📜</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              No Sessions Yet
            </h2>
            <p className="text-gray-600 mb-6">
              {filter === 'all'
                ? 'Complete your first recovery walk or urge mining session to start building your history'
                : filter === 'walk'
                ? 'No walk sessions yet. Start your first recovery walk!'
                : 'No urge mining sessions yet. When you need support, the Elder Tree is here.'}
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.push('/walk')}
                className="bg-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-700 transition"
              >
                Start a Walk
              </button>
              <button
                onClick={() => router.push('/urge')}
                className="bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-orange-700 transition"
              >
                Need Support
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {sessions.map((session) => {
                const color = getSessionColor(session.session_type);
                return (
                  <div
                    key={session.id}
                    onClick={() => setSelectedSession(session)}
                    className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition cursor-pointer"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">
                            {getSessionIcon(session.session_type)}
                          </span>
                          <h3 className="text-lg font-bold text-gray-900">
                            {session.session_type === 'walk'
                              ? 'Recovery Walk'
                              : 'Urge Mining'}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold bg-${color}-100 text-${color}-700`}
                          >
                            {session.session_type}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">
                          {formatDate(session.completed_at)} at{' '}
                          {formatTime(session.completed_at)}
                        </p>
                        <p className="text-gray-700 text-sm line-clamp-2 mb-3">
                          {session.preview}
                        </p>
                        <div className="flex gap-4 text-xs text-gray-500">
                          <span>⏱️ {session.duration_minutes} min</span>
                          <span>🪙 {session.coins_earned} coins</span>
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
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-center">
                  <button
                    onClick={handlePrevPage}
                    disabled={pagination.offset === 0}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages} ({pagination.total} total sessions)
                  </span>
                  <button
                    onClick={handleNextPage}
                    disabled={pagination.offset + pagination.limit >= pagination.total}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
