'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
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
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Swap Requests</h1>
            <p className="text-gray-600 mt-1">Manage your incoming and outgoing swap requests</p>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-4 mb-6 border-b border-gray-200 overflow-x-auto">
            <button
              onClick={() => setFilter('all')}
              className={`pb-2 px-1 whitespace-nowrap ${
                filter === 'all'
                  ? 'border-b-2 border-blue-600 text-blue-600 font-medium'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Requests ({requests.length})
            </button>
            <button
              onClick={() => setFilter('incoming')}
              className={`pb-2 px-1 whitespace-nowrap ${
                filter === 'incoming'
                  ? 'border-b-2 border-blue-600 text-blue-600 font-medium'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📥 Incoming ({incomingPending.length})
            </button>
            <button
              onClick={() => setFilter('outgoing')}
              className={`pb-2 px-1 whitespace-nowrap ${
                filter === 'outgoing'
                  ? 'border-b-2 border-blue-600 text-blue-600 font-medium'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📤 Outgoing ({outgoingPending.length})
            </button>
            <button
              onClick={() => setFilter('accepted')}
              className={`pb-2 px-1 whitespace-nowrap ${
                filter === 'accepted'
                  ? 'border-b-2 border-green-600 text-green-600 font-medium'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              ✓ Accepted ({accepted.length})
            </button>
            <button
              onClick={() => setFilter('declined')}
              className={`pb-2 px-1 whitespace-nowrap ${
                filter === 'declined'
                  ? 'border-b-2 border-red-600 text-red-600 font-medium'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              ✕ Declined ({declined.length})
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="text-xl text-gray-600">Loading requests...</div>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-xl text-gray-600 mb-4">No swap requests</p>
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
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <div key={request.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(
                          request.status
                        )}`}
                      >
                        {request.status}
                      </span>
                      <span className="text-sm text-gray-500">
                        {format(new Date(request.createdAt), 'PPP p')}
                      </span>
                    </div>
                    {request.isIncoming ? (
                      <span className="text-sm font-medium text-blue-600">📥 Incoming</span>
                    ) : (
                      <span className="text-sm font-medium text-green-600">📤 Outgoing</span>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Requester's Slot */}
                    <div className="border-l-4 border-green-500 pl-4">
                      <p className="text-sm text-gray-500 mb-1">
                        {request.isIncoming ? 'They offer' : 'You offered'}
                      </p>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {request.requesterSlot.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        📅 {format(new Date(request.requesterSlot.startTime), 'PPP p')} -{' '}
                        {format(new Date(request.requesterSlot.endTime), 'p')}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        👤 {request.requester.name}
                      </p>
                    </div>

                    {/* Target Slot */}
                    <div className="border-l-4 border-blue-500 pl-4">
                      <p className="text-sm text-gray-500 mb-1">
                        {request.isIncoming ? 'For your slot' : 'For their slot'}
                      </p>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {request.targetSlot.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        📅 {format(new Date(request.targetSlot.startTime), 'PPP p')} -{' '}
                        {format(new Date(request.targetSlot.endTime), 'p')}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        👤 {request.targetUser.name}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons for Incoming Pending Requests */}
                  {request.isIncoming && request.status === 'PENDING' && (
                    <div className="flex space-x-3 mt-6">
                      <button
                        onClick={() => handleAccept(request.id)}
                        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition font-medium"
                      >
                        ✓ Accept Swap
                      </button>
                      <button
                        onClick={() => handleReject(request.id)}
                        className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition font-medium"
                      >
                        ✕ Reject Swap
                      </button>
                    </div>
                  )}

                  {/* Status Message for Non-Pending */}
                  {request.status === 'ACCEPTED' && (
                    <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-800">
                        ✓ This swap has been accepted. The slots have been exchanged.
                      </p>
                    </div>
                  )}

                  {request.status === 'REJECTED' && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-800">
                        ✕ This swap has been rejected. The slots are now swappable again.
                      </p>
                    </div>
                  )}

                  {/* Pending Outgoing Message */}
                  {!request.isIncoming && request.status === 'PENDING' && (
                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-yellow-800">
                        ⏳ Waiting for {request.targetUser.name} to respond...
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
