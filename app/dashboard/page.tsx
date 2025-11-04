'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import LoadingSpinner from '@/components/LoadingSpinner';
import { eventAPI, aiAPI } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

interface Event {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  status: 'BUSY' | 'SWAPPABLE' | 'SWAP_PENDING';
  description?: string;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function DashboardPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [showConflicts, setShowConflicts] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    startTime: '',
    endTime: '',
    description: '',
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await eventAPI.getAll();
      setEvents(response.data.events);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeSchedule = async () => {
    try {
      const response = await aiAPI.getScheduleAnalysis();
      setConflicts(response.data.conflicts);
      setShowConflicts(true);
    } catch (error) {
      console.error('Failed to analyze schedule:', error);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await eventAPI.create(formData);
      setShowCreateModal(false);
      setFormData({ title: '', startTime: '', endTime: '', description: '' });
      fetchEvents();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to create event');
    }
  };

  const handleStatusChange = async (eventId: string, newStatus: 'BUSY' | 'SWAPPABLE') => {
    try {
      await eventAPI.update(eventId, { status: newStatus });
      fetchEvents();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to update event');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      await eventAPI.delete(eventId);
      fetchEvents();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete event');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'BUSY':
        return {
          bg: 'from-gray-800 to-gray-900',
          text: 'text-gray-100',
          border: 'border-gray-600',
          badge: 'bg-gray-600',
          glow: 'shadow-gray-500/20'
        };
      case 'SWAPPABLE':
        return {
          bg: 'from-green-900 to-emerald-900',
          text: 'text-green-100',
          border: 'border-green-500',
          badge: 'bg-green-500',
          glow: 'shadow-green-500/30'
        };
      case 'SWAP_PENDING':
        return {
          bg: 'from-yellow-900 to-amber-900',
          text: 'text-yellow-100',
          border: 'border-yellow-500',
          badge: 'bg-yellow-500',
          glow: 'shadow-yellow-500/30'
        };
      default:
        return {
          bg: 'from-gray-800 to-gray-900',
          text: 'text-gray-100',
          border: 'border-gray-600',
          badge: 'bg-gray-600',
          glow: 'shadow-gray-500/20'
        };
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 -mt-24 pt-24">
        {/* Animated background orbs */}
        <div className="fixed top-20 left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="fixed bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
          >
            <div>
              <h1 className="text-5xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                My Calendar
              </h1>
              <p className="text-gray-300 mt-2">Manage your shifts and schedule</p>
            </div>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={analyzeSchedule}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:shadow-xl hover:shadow-purple-500/30 transition flex items-center gap-2 font-bold"
              >
                <span>🤖</span> AI Analysis
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-xl hover:shadow-cyan-500/30 transition flex items-center gap-2 font-bold"
              >
                <span className="text-xl">+</span> Create Event
              </motion.button>
            </div>
          </motion.div>

          {/* AI Conflicts Alert */}
          <AnimatePresence>
            {showConflicts && conflicts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="bg-gradient-to-r from-yellow-900/80 to-orange-900/80 backdrop-blur-xl border-2 border-yellow-500/50 rounded-2xl p-6 mb-6 shadow-2xl"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-yellow-100 mb-3 flex items-center gap-2">
                      <span className="text-2xl">🤖</span> AI Schedule Analysis
                    </h3>
                    <ul className="space-y-2">
                      {conflicts.map((conflict, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-start gap-2 text-yellow-200"
                        >
                          <span className="text-yellow-400 mt-1">⚠️</span>
                          <span>{conflict}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowConflicts(false)}
                    className="text-yellow-300 hover:text-yellow-100 text-2xl font-bold"
                  >
                    ✕
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Events Grid */}
          {events.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-cyan-500/20"
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-6xl mb-4"
              >
                📅
              </motion.div>
              <p className="text-2xl font-bold text-white mb-2">No events yet</p>
              <p className="text-gray-400 mb-6">Create your first event to get started!</p>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-cyan-500/30"
              >
                Create Event
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid gap-4"
            >
              {events.map((event) => {
                const colors = getStatusColor(event.status);
                return (
                  <motion.div
                    key={event.id}
                    variants={item}
                    whileHover={{ scale: 1.02, y: -4 }}
                    className={`bg-gradient-to-r ${colors.bg} backdrop-blur-xl rounded-2xl shadow-xl hover:shadow-2xl ${colors.glow} transition-all p-6 border-l-8 ${colors.border}`}
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-3">
                          <span className="text-3xl">📌</span>
                          <div>
                            <h3 className={`text-2xl font-bold ${colors.text} mb-2`}>
                              {event.title}
                            </h3>
                            <div className="space-y-2 text-sm">
                              <p className="flex items-center gap-2 text-gray-300">
                                <span className="text-lg">📅</span>
                                <span className="font-medium">
                                  {format(new Date(event.startTime), 'PPP p')}
                                </span>
                              </p>
                              <p className="flex items-center gap-2 text-gray-300">
                                <span className="text-lg">⏰</span>
                                <span className="font-medium">
                                  {format(new Date(event.endTime), 'p')}
                                </span>
                              </p>
                              {event.description && (
                                <p className="flex items-start gap-2 mt-2 text-gray-300">
                                  <span className="text-lg">📝</span>
                                  <span className="text-gray-600">{event.description}</span>
                                </p>
                              )}
                            </div>
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${colors.badge} text-white text-xs font-bold mt-3`}
                            >
                              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                              {event.status}
                            </motion.div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 w-full md:w-auto">
                        <AnimatePresence mode="wait">
                          {event.status === 'BUSY' && (
                            <motion.button
                              key="make-swappable"
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleStatusChange(event.id, 'SWAPPABLE')}
                              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg font-medium shadow hover:shadow-lg transition"
                            >
                              ✓ Make Swappable
                            </motion.button>
                          )}
                          {event.status === 'SWAPPABLE' && (
                            <motion.button
                              key="mark-busy"
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              whileHover={{ scale: 1.05, y: -2 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleStatusChange(event.id, 'BUSY')}
                              className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-4 py-2 rounded-xl font-bold shadow-lg hover:shadow-gray-500/30 transition"
                            >
                              🔒 Mark as Busy
                            </motion.button>
                          )}
                        </AnimatePresence>
                        
                        {event.status !== 'SWAP_PENDING' && (
                          <motion.button
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDeleteEvent(event.id)}
                            className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-4 py-2 rounded-xl font-bold shadow-lg hover:shadow-red-500/30 transition"
                          >
                            🗑️ Delete
                          </motion.button>
                        )}
                        
                        {event.status === 'SWAP_PENDING' && (
                          <motion.div
                            animate={{
                              scale: [1, 1.05, 1],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                            }}
                            className="text-sm text-yellow-100 font-bold bg-yellow-600/80 px-3 py-2 rounded-xl text-center backdrop-blur-sm"
                          >
                            ⏳ Swap Pending
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>

        {/* Create Event Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50"
              onClick={() => setShowCreateModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md w-full p-8 border border-cyan-500/30"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                    Create New Event
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 hover:text-gray-200 text-2xl font-bold"
                  >
                    ✕
                  </motion.button>
                </div>

                <form onSubmit={handleCreateEvent} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Title</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-gray-900/50 border-2 border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition placeholder-gray-500"
                      placeholder="e.g., Morning Shift"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">
                      Start Time
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-gray-900/50 border-2 border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">End Time</label>
                    <input
                      type="datetime-local"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-gray-900/50 border-2 border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-900/50 border-2 border-gray-700 text-white rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition resize-none placeholder-gray-500"
                      rows={3}
                      placeholder="Add any details about this shift..."
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white py-3 rounded-xl font-bold shadow-xl hover:shadow-cyan-500/30 transition"
                    >
                      Create Event
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-6 bg-gray-700 text-gray-200 py-3 rounded-xl font-bold hover:bg-gray-600 transition"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ProtectedRoute>
  );
}
