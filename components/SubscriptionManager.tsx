'use client';

import { useState, useEffect } from 'react';
import { Subscription } from '@/types/subscription';

export default function SubscriptionManager() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/lemonsqueezy/subscription');
      const data = await response.json();
      setSubscription(data.subscription);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = () => {
    // Lemon Squeezy uses a simple customer portal URL
    if (subscription?.lemonsqueezy_customer_id) {
      window.open(`https://app.lemonsqueezy.com/my-orders`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!subscription || subscription.status === 'canceled') {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Active Subscription
        </h3>
        <p className="text-gray-600 mb-4">
          Subscribe to unlock unlimited guided walks and advanced features.
        </p>
        <a
          href="/pricing"
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          View Pricing Plans
        </a>
      </div>
    );
  }

  const isActive = subscription.status === 'active' || subscription.status === 'trialing';
  const isPastDue = subscription.status === 'past_due';

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Your Subscription
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Manage your billing and subscription settings
          </p>
        </div>
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            isActive
              ? 'bg-green-100 text-green-800'
              : isPastDue
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
        </span>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Plan</span>
          <span className="font-medium text-gray-900">
            {subscription.lemonsqueezy_variant_id?.includes('monthly') ? 'Monthly' : 'Yearly'}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Current Period</span>
          <span className="font-medium text-gray-900">
            {new Date(subscription.current_period_start).toLocaleDateString()} -{' '}
            {new Date(subscription.current_period_end).toLocaleDateString()}
          </span>
        </div>
        {subscription.cancel_at_period_end && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
            <svg
              className="h-5 w-5 text-yellow-600"
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
            <span className="text-sm text-yellow-800">
              Your subscription will be canceled at the end of the current period
            </span>
          </div>
        )}
        {isPastDue && (
          <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
            <svg
              className="h-5 w-5 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm text-red-800">
              Payment failed. Please update your payment method.
            </span>
          </div>
        )}
      </div>

      <button
        onClick={handleManageSubscription}
        className="w-full py-2 px-4 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors font-medium"
      >
        Manage Subscription
      </button>

      <p className="text-xs text-gray-500 mt-3 text-center">
        Update payment method, view invoices, or cancel subscription
      </p>
    </div>
  );
}
