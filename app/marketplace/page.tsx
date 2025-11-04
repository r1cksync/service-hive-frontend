'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center mb-8"
          >
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Marketplace
              </h1>
              <p className="text-gray-400 mt-2">Browse and request swaps from other users</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchAISuggestions}
              disabled={loadingSuggestions}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg disabled:opacity-50 flex items-center gap-2"
            >
              {loadingSuggestions ? '🤖 Analyzing...' : '🤖 Get AI Suggestions'}
            </motion.button>
          </motion.div>

          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 mb-6 shadow-2xl"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  🤖 AI-Powered Swap Suggestions
                </h3>
                <button
                  onClick={() => setShowSuggestions(false)}
                  className="text-purple-400 hover:text-pink-400 text-2xl transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-3">
                {suggestions.map((sug, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm font-medium bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Match Score: {(sug.compatibilityScore * 100).toFixed(0)}%
                          </span>
                        </div>
                        <p className="text-sm text-gray-300 mb-3">{sug.reason}</p>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div className="bg-white/5 rounded-lg p-3">
                            <p className="font-medium text-purple-300">
                              Your Slot: {sug.mySlot?.title}
                            </p>
                            <p className="text-gray-400">
                              {sug.mySlot &&
                                format(new Date(sug.mySlot.startTime), 'PPP p')}
                            </p>
                          </div>
                          <div className="bg-white/5 rounded-lg p-3">
                            <p className="font-medium text-pink-300">
                              Their Slot: {sug.targetSlot?.title}
                            </p>
                            <p className="text-gray-400">
                              {sug.targetSlot &&
                                format(new Date(sug.targetSlot.startTime), 'PPP p')}
                            </p>
                          </div>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSuggestionSwap(sug)}
                        className="ml-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:from-purple-500 hover:to-pink-500 text-sm shadow-lg"
                      >
                        Request Swap
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="inline-block w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full"
              />
              <p className="text-xl text-gray-400 mt-4">Loading available slots...</p>
            </div>
          ) : availableSlots.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl"
            >
              <p className="text-xl text-gray-300 mb-4">No swappable slots available</p>
              <p className="text-gray-500">Check back later for available slots!</p>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {availableSlots.map((slot, index) => (
                <motion.div
                  key={slot.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl hover:shadow-purple-500/20 transition-all group"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="w-1 h-16 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full absolute left-6" />
                      <h3 className="text-xl font-semibold text-white mb-3 ml-4">{slot.title}</h3>
                      <div className="space-y-2 text-sm text-gray-300 ml-4">
                        <p className="flex items-center gap-2">
                          <span className="text-purple-400">📅</span>
                          {format(new Date(slot.startTime), 'PPP p')} - {format(new Date(slot.endTime), 'p')}
                        </p>
                        {slot.description && (
                          <p className="flex items-center gap-2">
                            <span className="text-pink-400">📝</span>
                            {slot.description}
                          </p>
                        )}
                        <p className="flex items-center gap-2">
                          <span className="text-blue-400">👤</span>
                          Offered by: {slot.owner.name}
                        </p>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleRequestSwap(slot)}
                      className="ml-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-xl hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg"
                    >
                      Request Swap
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Swap Request Modal */}
        {showSwapModal && selectedSlot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-gradient-to-br from-gray-900 to-purple-900/30 border border-white/20 backdrop-blur-xl rounded-2xl shadow-2xl max-w-2xl w-full p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Request Swap
                </h2>
                <button
                  onClick={() => setShowSwapModal(false)}
                  className="text-gray-400 hover:text-white text-2xl transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="mb-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl border border-purple-500/20 rounded-xl p-4">
                <h3 className="font-semibold text-purple-300 mb-2">You want to swap for:</h3>
                <p className="text-white text-lg">{selectedSlot.title}</p>
                <p className="text-sm text-gray-400 mt-1">
                  {format(new Date(selectedSlot.startTime), 'PPP p')} - {format(new Date(selectedSlot.endTime), 'p')}
                </p>
                <p className="text-sm text-gray-400">Offered by: {selectedSlot.owner.name}</p>
              </div>

              <div>
                <h3 className="font-semibold text-white mb-3">
                  Select one of your swappable slots to offer:
                </h3>

                {mySwappableSlots.length === 0 ? (
                  <p className="text-gray-400">
                    You don't have any swappable slots. Go to your dashboard and mark some slots as
                    swappable first.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                    {mySwappableSlots.map((slot) => (
                      <motion.button
                        key={slot.id}
                        whileHover={{ scale: 1.02, x: 5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSubmitSwap(slot.id)}
                        className="w-full text-left bg-white/5 hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-pink-500/20 border border-white/10 hover:border-purple-500/50 rounded-xl p-4 transition-all"
                      >
                        <p className="font-medium text-white">{slot.title}</p>
                        <p className="text-sm text-gray-400 mt-1">
                          {format(new Date(slot.startTime), 'PPP p')} - {format(new Date(slot.endTime), 'p')}
                        </p>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowSwapModal(false)}
                  className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl transition-all border border-white/10"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </ProtectedRoute>
  );
}
