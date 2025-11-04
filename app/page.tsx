'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Welcome to <span className="text-blue-600">SlotSwapper</span>
            </h1>
            <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
              The peer-to-peer time-slot scheduling platform. Mark your busy slots as swappable
              and exchange them with others seamlessly.
            </p>

            <div className="flex justify-center space-x-4 mb-16">
              <Link
                href="/auth/signup"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition"
              >
                Get Started
              </Link>
              <Link
                href="/auth/login"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-medium hover:bg-gray-50 border-2 border-blue-600 transition"
              >
                Log In
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mt-16">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-4xl mb-4">📅</div>
                <h3 className="text-xl font-semibold mb-2">Manage Your Calendar</h3>
                <p className="text-gray-600">
                  Create and organize your events. Mark busy slots as swappable when you need
                  flexibility.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-4xl mb-4">🔄</div>
                <h3 className="text-xl font-semibold mb-2">Swap with Others</h3>
                <p className="text-gray-600">
                  Browse available slots from other users and request swaps that work for both of
                  you.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-4xl mb-4">🤖</div>
                <h3 className="text-xl font-semibold mb-2">AI-Powered Suggestions</h3>
                <p className="text-gray-600">
                  Get smart recommendations for optimal swaps based on compatibility and timing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
