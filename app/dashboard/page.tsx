import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import LogoutButton from '@/components/LogoutButton';
import { getTotalCompletedSessions, getUserStreak } from '@/lib/services/session';
import { getActiveMiningSession, getUserCoins } from '@/lib/services/mining';
import { getTodaysInventory, getInventoryStreak } from '@/lib/services/inventory';

export const dynamic = 'force-static';
export const dynamicParams = false;

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

  // Get user stats
  const { count: completedSessions } = await getTotalCompletedSessions(user.id);
  const { streak } = await getUserStreak(user.id);
  const { coins } = await getUserCoins(user.id);
  const { data: todaysInventory } = await getTodaysInventory(user.id);
  const { streak: inventoryStreak } = await getInventoryStreak(user.id);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100">
      <nav className="bg-white shadow-sm border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-green-800">🌳 Rooting Routine</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user.email}</span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-green-900 mb-2">Welcome to Your Journey</h2>
          <p className="text-lg text-green-700">
            Ready for today&apos;s recovery walk?
          </p>
        </div>

        {/* Stats Cards */}
        {(completedSessions > 0 || streak > 0 || coins > 0 || inventoryStreak > 0) && (
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-green-600">{completedSessions}</div>
              <div className="text-sm text-gray-600">Completed Walks</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-green-600">{streak}</div>
              <div className="text-sm text-gray-600">Day Streak 🔥</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-yellow-600">{coins || 0}</div>
              <div className="text-sm text-gray-600">Coins 🪙</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-2xl font-bold text-purple-600">{inventoryStreak}</div>
              <div className="text-sm text-gray-600">Inventory Streak 📝</div>
            </div>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Urge/Crisis Button - High Priority */}
          <div className="bg-red-50 rounded-lg shadow-md p-6 hover:shadow-lg transition border-2 border-red-200">
            <div className="mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-600"
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
            <h3 className="text-xl font-bold text-gray-900 mb-2">Need Help Now?</h3>
            <p className="text-gray-600 mb-4">Talk to the Elder Tree about what&apos;s going on</p>
            <Link href="/urge">
              <button className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition">
                I Need Support
              </button>
            </Link>
          </div>

          {/* Outside Walkabout */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-emerald-600"
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
            <h3 className="text-xl font-bold text-gray-900 mb-2">Outside Walkabout</h3>
            <p className="text-gray-600 mb-4">Ground yourself through nature and movement</p>
            <Link href="/walkabout">
              <button className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition">
                Take a Walkabout
              </button>
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
            <div className="mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-600"
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
            <h3 className="text-xl font-bold text-gray-900 mb-2">Start New Walk</h3>
            <p className="text-gray-600 mb-4">Begin today&apos;s recovery walk with step work</p>
            <Link href="/walk">
              <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition">
                Begin Walk
              </button>
            </Link>
          </div>

          {/* Daily Inventory */}
          {!todaysInventory ? (
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
              <div className="mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-purple-600"
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
              <h3 className="text-xl font-bold text-gray-900 mb-2">Daily Inventory</h3>
              <p className="text-gray-600 mb-4">Take a few minutes to reflect on your day</p>
              <Link href="/inventory">
                <button className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition">
                  Complete Today&apos;s Inventory
                </button>
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 border-2 border-green-400">
              <div className="mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-green-600"
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
              <h3 className="text-xl font-bold text-gray-900 mb-2">Daily Inventory ✓</h3>
              <p className="text-gray-600 mb-4">Completed for today</p>
              <Link href="/inventory">
                <button className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition">
                  View Inventory
                </button>
              </Link>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition opacity-50 cursor-not-allowed">
            <div className="mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600"
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
            <h3 className="text-xl font-bold text-gray-900 mb-2">Session History</h3>
            <p className="text-gray-600 mb-4">Review your past walks and reflections</p>
            <button disabled className="w-full bg-gray-300 text-white py-2 rounded-lg cursor-not-allowed">
              Coming Soon
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition opacity-50 cursor-not-allowed">
            <div className="mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-purple-600"
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
            <h3 className="text-xl font-bold text-gray-900 mb-2">Progress Tracker</h3>
            <p className="text-gray-600 mb-4">Track your journey over time</p>
            <button disabled className="w-full bg-gray-300 text-white py-2 rounded-lg cursor-not-allowed">
              Coming Soon
            </button>
          </div>
        </div>

        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">About the Elder Tree</h3>
          <p className="text-gray-700 leading-relaxed">
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
