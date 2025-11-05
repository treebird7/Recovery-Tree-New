'use client';

import { useState } from 'react';
import { PRICING } from '@/lib/lemonsqueezy';

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');

  const handleCheckout = async (variantId: string, planName: string) => {
    try {
      setLoading(planName);

      const response = await fetch('/api/lemonsqueezy/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ variantId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout');
      }

      // Redirect to Lemon Squeezy Checkout
      window.location.href = data.url;
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            Choose Your Journey
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Start your recovery journey with nature-guided walks
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="mt-12 flex justify-center">
          <div className="relative bg-gray-100 rounded-full p-1 flex">
            <button
              onClick={() => setBillingInterval('monthly')}
              className={`${
                billingInterval === 'monthly'
                  ? 'bg-white shadow-sm'
                  : 'text-gray-600'
              } px-6 py-2 rounded-full font-medium transition-all`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval('yearly')}
              className={`${
                billingInterval === 'yearly'
                  ? 'bg-white shadow-sm'
                  : 'text-gray-600'
              } px-6 py-2 rounded-full font-medium transition-all`}
            >
              Yearly
              <span className="ml-2 text-green-600 text-sm">Save 17%</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {/* Free Plan */}
          <PricingCard
            name={PRICING.free.name}
            price="Free"
            period=""
            features={PRICING.free.features}
            buttonText="Get Started"
            buttonVariant="secondary"
            onSelect={() => (window.location.href = '/signup')}
            loading={false}
          />

          {/* Monthly/Yearly Plan */}
          {billingInterval === 'monthly' ? (
            <PricingCard
              name={PRICING.monthly.name}
              price={`$${PRICING.monthly.price}`}
              period="/month"
              features={PRICING.monthly.features}
              buttonText="Start Daily Practice"
              buttonVariant="primary"
              popular={true}
              onSelect={() => handleCheckout(PRICING.monthly.variantId, PRICING.monthly.name)}
              loading={loading === PRICING.monthly.name}
            />
          ) : (
            <PricingCard
              name={PRICING.yearly.name}
              price={`$${PRICING.yearly.price}`}
              period="/year"
              features={PRICING.yearly.features}
              buttonText="Start Annual Journey"
              buttonVariant="primary"
              popular={true}
              onSelect={() => handleCheckout(PRICING.yearly.variantId, PRICING.yearly.name)}
              loading={loading === PRICING.yearly.name}
            />
          )}
        </div>

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <FAQItem
              question="Can I cancel anytime?"
              answer="Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period."
            />
            <FAQItem
              question="What's included in the free plan?"
              answer="The free plan includes 3 guided walks per month with Steps 1-3 questions, basic reflections, and nature imagery."
            />
            <FAQItem
              question="How does the AI guidance work?"
              answer="Our Elder Tree voice uses Claude AI to guide you through recovery steps during your walk, asking thoughtful questions and providing personalized reflections."
            />
            <FAQItem
              question="Is my data private?"
              answer="Absolutely. Your sessions are private and encrypted. We never share your personal information or recovery journey with anyone."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface PricingCardProps {
  name: string;
  price: string;
  period: string;
  features: string[];
  buttonText: string;
  buttonVariant: 'primary' | 'secondary';
  popular?: boolean;
  onSelect: () => void;
  loading: boolean;
}

function PricingCard({
  name,
  price,
  period,
  features,
  buttonText,
  buttonVariant,
  popular = false,
  onSelect,
  loading,
}: PricingCardProps) {
  return (
    <div
      className={`relative bg-white rounded-2xl shadow-lg p-8 ${
        popular ? 'ring-2 ring-green-500 transform scale-105' : ''
      }`}
    >
      {popular && (
        <div className="absolute top-0 right-8 transform -translate-y-1/2">
          <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-semibold bg-green-500 text-white">
            Most Popular
          </span>
        </div>
      )}

      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900">{name}</h3>
        <div className="mt-4">
          <span className="text-4xl font-bold text-gray-900">{price}</span>
          <span className="text-gray-600">{period}</span>
        </div>
      </div>

      <ul className="mt-8 space-y-4">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <svg
              className="h-6 w-6 text-green-500 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="ml-3 text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={onSelect}
        disabled={loading}
        className={`mt-8 w-full py-3 px-6 rounded-lg font-semibold transition-all ${
          buttonVariant === 'primary'
            ? 'bg-green-600 text-white hover:bg-green-700 disabled:bg-green-400'
            : 'bg-gray-100 text-gray-900 hover:bg-gray-200 disabled:bg-gray-50'
        } ${loading ? 'cursor-not-allowed' : ''}`}
      >
        {loading ? 'Loading...' : buttonText}
      </button>
    </div>
  );
}

interface FAQItemProps {
  question: string;
  answer: string;
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left"
      >
        <h3 className="text-lg font-semibold text-gray-900">{question}</h3>
        <svg
          className={`h-5 w-5 text-gray-500 transition-transform ${
            isOpen ? 'transform rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isOpen && (
        <p className="mt-4 text-gray-600">{answer}</p>
      )}
    </div>
  );
}
