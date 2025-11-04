'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { swapAPI } from '@/lib/api';

interface SwapRequest {
  id: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  requester: {
    id: string;
    name: string;
    email: string;
  };
  requesterSlot: {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    status: string;
  };
  targetUser: {
    id: string;
    name: string;
    email: string;
  };
  targetSlot: {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    status: string;
  };
  isIncoming: boolean;
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<SwapRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'incoming' | 'outgoing' | 'accepted' | 'declined'>('all');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await swapAPI.getSwapRequests();
      setRequests(response.data.requests);
    } catch (error) {
      console.error('Failed to fetch swap requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId: string) => {
    if (!confirm('Are you sure you want to accept this swap? Your calendars will be updated.')) {
      return;
    }

    try {
      await swapAPI.respondToSwap(requestId, true);
      alert('Swap accepted successfully! Your calendar has been updated.');
      fetchRequests();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to accept swap');
    }
  };

  const handleReject = async (requestId: string) => {
    if (!confirm('Are you sure you want to reject this swap?')) {
      return;
    }

    try {
      await swapAPI.respondToSwap(requestId, false);
      alert('Swap rejected. Both slots are now swappable again.');
      fetchRequests();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to reject swap');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRequests = requests.filter((req) => {
    if (filter === 'incoming') return req.isIncoming && req.status === 'PENDING';
    if (filter === 'outgoing') return !req.isIncoming && req.status === 'PENDING';
    if (filter === 'accepted') return req.status === 'ACCEPTED';
    if (filter === 'declined') return req.status === 'REJECTED';
    return true;
  });

  const incomingPending = requests.filter((r) => r.isIncoming && r.status === 'PENDING');
  const outgoingPending = requests.filter((r) => !r.isIncoming && r.status === 'PENDING');
  const accepted = requests.filter((r) => r.status === 'ACCEPTED');
  const declined = requests.filter((r) => r.status === 'REJECTED');

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Swap Requests
            </h1>
            <p className="text-gray-400 mt-2">Manage your incoming and outgoing swap requests</p>
          </motion.div>

          {/* Filter Tabs */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex space-x-4 mb-6 border-b border-white/10 overflow-x-auto"
          >
            <button
              onClick={() => setFilter('all')}
              className={`pb-3 px-1 whitespace-nowrap transition-all ${
                filter === 'all'
                  ? 'border-b-2 border-purple-500 text-purple-400 font-medium'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              All Requests ({requests.length})
            </button>
            <button
              onClick={() => setFilter('incoming')}
              className={`pb-3 px-1 whitespace-nowrap transition-all ${
                filter === 'incoming'
                  ? 'border-b-2 border-purple-500 text-purple-400 font-medium'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              📥 Incoming ({incomingPending.length})
            </button>
            <button
              onClick={() => setFilter('outgoing')}
              className={`pb-3 px-1 whitespace-nowrap transition-all ${
                filter === 'outgoing'
                  ? 'border-b-2 border-purple-500 text-purple-400 font-medium'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              📤 Outgoing ({outgoingPending.length})
            </button>
            <button
              onClick={() => setFilter('accepted')}
              className={`pb-3 px-1 whitespace-nowrap transition-all ${
                filter === 'accepted'
                  ? 'border-b-2 border-green-500 text-green-400 font-medium'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              ✓ Accepted ({accepted.length})
            </button>
            <button
              onClick={() => setFilter('declined')}
              className={`pb-3 px-1 whitespace-nowrap transition-all ${
                filter === 'declined'
                  ? 'border-b-2 border-red-500 text-red-400 font-medium'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              ✕ Declined ({declined.length})
            </button>
          </motion.div>

          {loading ? (
            <div className="text-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="inline-block w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full"
              />
              <p className="text-xl text-gray-400 mt-4">Loading requests...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl"
            >
              <p className="text-xl text-gray-300 mb-4">No swap requests</p>
              <p className="text-gray-500">
                {filter === 'incoming'
                  ? 'No pending incoming requests at the moment.'
                  : filter === 'outgoing'
                  ? "You haven't made any pending swap requests."
                  : filter === 'accepted'
                  ? "No accepted swap requests yet."
                  : filter === 'declined'
                  ? "No declined swap requests."
                  : 'No swap requests to display.'}
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl hover:shadow-purple-500/20 transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          request.status === 'PENDING'
                            ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                            : request.status === 'ACCEPTED'
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                            : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}
                      >
                        {request.status}
                      </span>
                      <span className="text-sm text-gray-400">
                        {format(new Date(request.createdAt), 'PPP p')}
                      </span>
                    </div>
                    {request.isIncoming ? (
                      <span className="text-sm font-medium bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                        📥 Incoming
                      </span>
                    ) : (
                      <span className="text-sm font-medium bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                        📤 Outgoing
                      </span>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Requester's Slot */}
                    <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-lg border border-green-500/20 rounded-xl p-4">
                      <p className="text-sm text-gray-400 mb-2">
                        {request.isIncoming ? 'They offer' : 'You offered'}
                      </p>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {request.requesterSlot.title}
                      </h3>
                      <p className="text-sm text-gray-300 flex items-center gap-2">
                        <span className="text-green-400">📅</span>
                        {format(new Date(request.requesterSlot.startTime), 'PPP p')} - {format(new Date(request.requesterSlot.endTime), 'p')}
                      </p>
                      <p className="text-sm text-gray-300 mt-2 flex items-center gap-2">
                        <span className="text-green-400">👤</span>
                        {request.requester.name}
                      </p>
                    </div>

                    {/* Target Slot */}
                    <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-lg border border-blue-500/20 rounded-xl p-4">
                      <p className="text-sm text-gray-400 mb-2">
                        {request.isIncoming ? 'For your slot' : 'For their slot'}
                      </p>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {request.targetSlot.title}
                      </h3>
                      <p className="text-sm text-gray-300 flex items-center gap-2">
                        <span className="text-blue-400">📅</span>
                        {format(new Date(request.targetSlot.startTime), 'PPP p')} - {format(new Date(request.targetSlot.endTime), 'p')}
                      </p>
                      <p className="text-sm text-gray-300 mt-2 flex items-center gap-2">
                        <span className="text-blue-400">👤</span>
                        {request.targetUser.name}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons for Incoming Pending Requests */}
                  {request.isIncoming && request.status === 'PENDING' && (
                    <div className="flex space-x-3 mt-6">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAccept(request.id)}
                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-xl hover:from-green-500 hover:to-emerald-500 transition-all font-medium shadow-lg"
                      >
                        ✓ Accept Swap
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleReject(request.id)}
                        className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 text-white py-3 px-4 rounded-xl hover:from-red-500 hover:to-pink-500 transition-all font-medium shadow-lg"
                      >
                        ✕ Reject Swap
                      </motion.button>
                    </div>
                  )}

                  {/* Status Messages */}
                  {request.status === 'ACCEPTED' && (
                    <div className="mt-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-4">
                      <p className="text-sm text-green-300 flex items-center gap-2">
                        <span className="text-lg">✓</span>
                        This swap has been accepted. The slots have been exchanged.
                      </p>
                    </div>
                  )}

                  {request.status === 'REJECTED' && (
                    <div className="mt-4 bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/30 rounded-xl p-4">
                      <p className="text-sm text-red-300 flex items-center gap-2">
                        <span className="text-lg">✕</span>
                        This swap has been rejected. The slots are now swappable again.
                      </p>
                    </div>
                  )}

                  {/* Pending Outgoing Message */}
                  {!request.isIncoming && request.status === 'PENDING' && (
                    <div className="mt-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-4">
                      <p className="text-sm text-yellow-300 flex items-center gap-2">
                        <span className="text-lg">⏳</span>
                        Waiting for {request.targetUser.name} to respond...
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
