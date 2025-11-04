'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { swapAPI, eventAPI, aiAPI } from '@/lib/api';

interface Event {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: string;
}

interface SwappableSlot {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: string;
  description?: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
}

interface Suggestion {
  targetSlotId: string;
  mySlotId: string;
  reason: string;
  compatibilityScore: number;
  targetSlot: SwappableSlot;
  mySlot: Event;
}

export default function MarketplacePage() {
  const [availableSlots, setAvailableSlots] = useState<SwappableSlot[]>([]);
  const [mySwappableSlots, setMySwappableSlots] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SwappableSlot | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [slotsRes, myEventsRes] = await Promise.all([
        swapAPI.getSwappableSlots(),
        eventAPI.getAll(),
      ]);

      setAvailableSlots(slotsRes.data.slots);
      setMySwappableSlots(
        myEventsRes.data.events.filter((e: Event) => e.status === 'SWAPPABLE')
      );
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAISuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const response = await aiAPI.getSwapSuggestions();
      setSuggestions(response.data.suggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Failed to fetch AI suggestions:', error);
      alert('Failed to generate AI suggestions');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleRequestSwap = (slot: SwappableSlot) => {
    if (mySwappableSlots.length === 0) {
      alert('You need to have at least one swappable slot to request a swap!');
      return;
    }
    setSelectedSlot(slot);
    setShowSwapModal(true);
  };

  const handleSubmitSwap = async (mySlotId: string) => {
    if (!selectedSlot) return;

    try {
      await swapAPI.createSwapRequest({
        mySlotId,
        theirSlotId: selectedSlot.id,
      });
      alert('Swap request sent successfully!');
      setShowSwapModal(false);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to send swap request');
    }
  };

  const handleSuggestionSwap = (suggestion: Suggestion) => {
    handleRequestSwap(suggestion.targetSlot);
  };

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
              <p className="text-gray-600 mt-1">Browse and request swaps from other users</p>
            </div>
            <button
              onClick={fetchAISuggestions}
              disabled={loadingSuggestions}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
            >
              {loadingSuggestions ? '🤖 Analyzing...' : '🤖 Get AI Suggestions'}
            </button>
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-purple-900">
                  🤖 AI-Powered Swap Suggestions
                </h3>
                <button
                  onClick={() => setShowSuggestions(false)}
                  className="text-purple-600 hover:text-purple-800"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-3">
                {suggestions.map((sug, i) => (
                  <div key={i} className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm font-medium text-purple-700">
                            Match Score: {(sug.compatibilityScore * 100).toFixed(0)}%
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{sug.reason}</p>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-gray-900">
                              Your Slot: {sug.mySlot?.title}
                            </p>
                            <p className="text-gray-600">
                              {sug.mySlot &&
                                format(new Date(sug.mySlot.startTime), 'PPP p')}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              Their Slot: {sug.targetSlot?.title}
                            </p>
                            <p className="text-gray-600">
                              {sug.targetSlot &&
                                format(new Date(sug.targetSlot.startTime), 'PPP p')}
                            </p>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSuggestionSwap(sug)}
                        className="ml-4 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm"
                      >
                        Request Swap
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="text-xl text-gray-600">Loading available slots...</div>
            </div>
          ) : availableSlots.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-xl text-gray-600 mb-4">No swappable slots available</p>
              <p className="text-gray-500">Check back later for available slots!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {availableSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500 hover:shadow-lg transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{slot.title}</h3>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>
                          📅 {format(new Date(slot.startTime), 'PPP p')} -{' '}
                          {format(new Date(slot.endTime), 'p')}
                        </p>
                        {slot.description && <p>📝 {slot.description}</p>}
                        <p>👤 Offered by: {slot.owner.name}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRequestSwap(slot)}
                      className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      Request Swap
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Swap Request Modal */}
        {showSwapModal && selectedSlot && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Request Swap</h2>
                <button
                  onClick={() => setShowSwapModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="mb-6 bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">You want to swap for:</h3>
                <p className="text-gray-800">{selectedSlot.title}</p>
                <p className="text-sm text-gray-600">
                  {format(new Date(selectedSlot.startTime), 'PPP p')} -{' '}
                  {format(new Date(selectedSlot.endTime), 'p')}
                </p>
                <p className="text-sm text-gray-600">Offered by: {selectedSlot.owner.name}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Select one of your swappable slots to offer:
                </h3>

                {mySwappableSlots.length === 0 ? (
                  <p className="text-gray-600">
                    You don't have any swappable slots. Go to your dashboard and mark some slots as
                    swappable first.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {mySwappableSlots.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => handleSubmitSwap(slot.id)}
                        className="w-full text-left bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-green-500 rounded-lg p-4 transition"
                      >
                        <p className="font-medium text-gray-900">{slot.title}</p>
                        <p className="text-sm text-gray-600">
                          {format(new Date(slot.startTime), 'PPP p')} -{' '}
                          {format(new Date(slot.endTime), 'p')}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6">
                <button
                  onClick={() => setShowSwapModal(false)}
                  className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
