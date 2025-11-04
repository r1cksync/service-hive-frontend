'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  isConnected: boolean;
  socket: Socket | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) {
      // If no token, disconnect socket
      if (socket) {
        console.log('🔌 Disconnecting socket - no token');
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Prevent multiple connections
    if (socket?.connected) {
      console.log('⚠️ Socket already connected, skipping initialization');
      return;
    }

    // Initialize Socket.IO connection
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    console.log('🔌 Connecting to Socket.IO:', backendUrl);

    // Normalize token (strip possible "Bearer " prefix) and mask for logs
    let handshakeToken = typeof token === 'string' ? token.trim() : '';
    if (handshakeToken.startsWith('Bearer ')) handshakeToken = handshakeToken.slice(7).trim();
    console.log('🔑 Using token (masked):', handshakeToken.substring(0, 12) + '...');

    const socketInstance = io(backendUrl, {
      auth: {
        token: handshakeToken,
      },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => {
      console.log('✅ Socket.IO connected successfully');
      setIsConnected(true);
      toast.success('Real-time notifications enabled', {
        duration: 2000,
        position: 'bottom-right',
        icon: '🔔',
      });
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('❌ Socket.IO disconnected:', reason);
      setIsConnected(false);
      
      // Only show error if it's not a manual disconnect
      if (reason === 'io server disconnect' || reason === 'io client disconnect') {
        // Manual disconnect, don't show error
      } else {
        toast.error('Notifications disconnected', {
          duration: 2000,
          position: 'bottom-right',
        });
      }
    });

    socketInstance.on('connect_error', (error) => {
      console.error('❌ Socket.IO connection error:', error.message);
      setIsConnected(false);
      
      // More helpful error messages
      let errorMessage = 'Failed to connect to notifications';
      if (error.message.includes('Authentication error')) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Connection timeout. Please check your internet.';
      }
      
      toast.error(errorMessage, {
        duration: 3000,
        position: 'bottom-right',
      });
    });

    socketInstance.on('reconnect', (attemptNumber) => {
      console.log('🔄 Socket.IO reconnected after', attemptNumber, 'attempts');
      toast.success('Reconnected to notifications', {
        duration: 2000,
        position: 'bottom-right',
        icon: '🔄',
      });
    });

    socketInstance.on('reconnect_attempt', (attemptNumber) => {
      console.log('🔄 Socket.IO reconnection attempt:', attemptNumber);
    });

    socketInstance.on('reconnect_error', (error) => {
      console.error('❌ Socket.IO reconnection error:', error.message);
    });

    socketInstance.on('reconnect_failed', () => {
      console.error('❌ Socket.IO reconnection failed after all attempts');
      toast.error('Unable to restore notification connection', {
        duration: 4000,
        position: 'bottom-right',
      });
    });

    // Listen for swap request notifications
    socketInstance.on('swap-request-created', (data) => {
      console.log('Received swap-request-created:', data);
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-xl">📥</span>
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">New Swap Request</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Someone wants to swap <strong>{data.requesterSlotTitle}</strong> for your{' '}
                    <strong>{data.targetSlotTitle}</strong>
                  </p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-gray-200">
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  window.location.href = '/requests';
                }}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
              >
                View
              </button>
            </div>
          </div>
        ),
        {
          duration: 10000,
          position: 'bottom-right',
        }
      );
    });

    socketInstance.on('swap-request-accepted', (data) => {
      console.log('Received swap-request-accepted:', data);
      toast.success(
        `Your swap request was accepted! ${data.targetSlotTitle} is now yours.`,
        {
          duration: 8000,
          position: 'bottom-right',
          icon: '✅',
        }
      );
      
      // Optionally refresh the page or update data
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    });

    socketInstance.on('swap-request-rejected', (data) => {
      console.log('Received swap-request-rejected:', data);
      toast.error(
        `Your swap request for ${data.targetSlotTitle} was rejected.`,
        {
          duration: 6000,
          position: 'bottom-right',
          icon: '❌',
        }
      );
      
      // Optionally refresh the page or update data
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    });

    setSocket(socketInstance);

    return () => {
      console.log('🧹 Cleaning up socket connection');
      socketInstance.off('connect');
      socketInstance.off('disconnect');
      socketInstance.off('connect_error');
      socketInstance.off('reconnect');
      socketInstance.off('reconnect_attempt');
      socketInstance.off('reconnect_error');
      socketInstance.off('reconnect_failed');
      socketInstance.off('swap-request-created');
      socketInstance.off('swap-request-accepted');
      socketInstance.off('swap-request-rejected');
      socketInstance.disconnect();
    };
  }, [token, socket?.connected]);

  return (
    <NotificationContext.Provider value={{ isConnected, socket }}>
      <Toaster />
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
