import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import LogoutButton from '@/components/LogoutButton';
import { getTotalCompletedSessions, getUserStreak } from '@/lib/services/session';
import { getActiveMiningSession, getUserCoins } from '@/lib/services/mining';
import { getTodaysInventory, getInventoryStreak } from '@/lib/services/inventory';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check for active mining session - redirect to reveal if exists
  const { data: activeMining } = await getActiveMiningSession(user.id);
  if (activeMining) {
    redirect('/urge/reveal');
  }

  // Get user stats in parallel for better performance
  const [
    { count: completedSessions },
    { streak },
    { coins },
    { data: todaysInventory },
    { streak: inventoryStreak },
  ] = await Promise.all([
    getTotalCompletedSessions(user.id),
    getUserStreak(user.id),
    getUserCoins(user.id),
    getTodaysInventory(user.id),
    getInventoryStreak(user.id),
  ]);

  return (
    <div className="min-h-screen bg-black">
      <nav className="bg-gray-900 shadow-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-green-400">🌳 Rooting Routine</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">{user.email}</span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-green-400 mb-2">Welcome to Your Journey</h2>
          <p className="text-lg text-gray-300">
            Ready for today&apos;s recovery walk?
          </p>
        </div>

        {/* Stats Cards */}
        {(completedSessions > 0 || streak > 0 || coins > 0 || inventoryStreak > 0) && (
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-800 rounded-lg shadow border border-gray-700 p-4">
              <div className="text-2xl font-bold text-green-400">{completedSessions}</div>
              <div className="text-sm text-gray-400">Completed Walks</div>
            </div>
            <div className="bg-gray-800 rounded-lg shadow border border-gray-700 p-4">
              <div className="text-2xl font-bold text-green-400">{streak}</div>
              <div className="text-sm text-gray-400">Day Streak 🔥</div>
            </div>
            <div className="bg-gray-800 rounded-lg shadow border border-gray-700 p-4">
              <div className="text-2xl font-bold text-yellow-400">{coins || 0}</div>
              <div className="text-sm text-gray-400">Coins 🪙</div>
            </div>
            <div className="bg-gray-800 rounded-lg shadow border border-gray-700 p-4">
              <div className="text-2xl font-bold text-green-400">{inventoryStreak}</div>
              <div className="text-sm text-gray-400">Inventory Streak 📝</div>
            </div>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Urge/Crisis Button - High Priority */}
          <div className="bg-red-900/30 rounded-lg shadow-md p-6 hover:shadow-lg transition border-2 border-red-600">
            <div className="mb-4">
              <div className="w-12 h-12 bg-red-900/50 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-100 mb-2">Need Help Now?</h3>
            <p className="text-gray-300 mb-4">Talk to the Elder Tree about what&apos;s going on</p>
            <Link href="/urge">
              <button className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition">
                I Need Support
              </button>
            </Link>
          </div>

          {/* Step Outside */}
          <div className="bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition border border-gray-700">
            <div className="mb-4">
              <div className="w-12 h-12 bg-green-900/30 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-100 mb-2">Step Outside</h3>
            <p className="text-gray-400 mb-4">Ground yourself through nature and movement</p>
            <Link href="/walkabout">
              <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition">
                Step Outside
              </button>
            </Link>
          </div>

          <div className="bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition border border-gray-700">
            <div className="mb-4">
              <div className="w-12 h-12 bg-green-900/30 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-100 mb-2">Step In</h3>
            <p className="text-gray-400 mb-4">Work through your 12-step journal questions</p>
            <Link href="/step-in">
              <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition">
                Step In
              </button>
            </Link>
          </div>

          {/* Daily Inventory */}
          {!todaysInventory ? (
            <div className="bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition border border-gray-700">
              <div className="mb-4">
                <div className="w-12 h-12 bg-green-900/30 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-100 mb-2">Daily Inventory</h3>
              <p className="text-gray-400 mb-4">Take a few minutes to reflect on your day</p>
              <Link href="/inventory">
                <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition">
                  Complete Today&apos;s Inventory
                </button>
              </Link>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg shadow-md p-6 border-2 border-green-500">
              <div className="mb-4">
                <div className="w-12 h-12 bg-green-900/30 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-100 mb-2">Daily Inventory ✓</h3>
              <p className="text-gray-400 mb-4">Completed for today</p>
              <Link href="/inventory">
                <button className="w-full bg-gray-700 text-gray-300 py-2 rounded-lg hover:bg-gray-600 transition">
                  View Inventory
                </button>
              </Link>
            </div>
          )}

          <div className="bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition border border-gray-700">
            <div className="mb-4">
              <div className="w-12 h-12 bg-green-900/30 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-100 mb-2">Session History</h3>
            <p className="text-gray-400 mb-4">Review your past walks and reflections</p>
            <Link href="/history">
              <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition">
                View History
              </button>
            </Link>
          </div>

          <div className="bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition border border-gray-700">
            <div className="mb-4">
              <div className="w-12 h-12 bg-green-900/30 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-400"
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
            <h3 className="text-xl font-bold text-gray-100 mb-2">My Prayers</h3>
            <p className="text-gray-400 mb-4">View and manage your Step 3 prayers</p>
            <Link href="/my-prayers">
              <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition">
                View Prayers
              </button>
            </Link>
          </div>

          <div className="bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition border border-gray-700 opacity-50 cursor-not-allowed">
            <div className="mb-4">
              <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-400 mb-2">Progress Tracker</h3>
            <p className="text-gray-500 mb-4">Track your journey over time</p>
            <button disabled className="w-full bg-gray-700 text-gray-500 py-2 rounded-lg cursor-not-allowed">
              Coming Soon
            </button>
          </div>
        </div>

        <div className="mt-12 bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-green-600">
          <h3 className="text-xl font-bold text-green-400 mb-4">About the Elder Tree</h3>
          <p className="text-gray-300 leading-relaxed">
            The Elder Tree is your wise companion on this journey. During your walks, it will guide
            you through recovery step work with direct, caring questions that help you see clearly
            and find your own truth. Like a good sponsor, the Elder Tree pushes for honesty and
            specificity, celebrating your breakthroughs and gently challenging vague answers.
          </p>
        </div>
      </main>
    </div>
  );
}
