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
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Initialize Socket.IO connection
    const socketInstance = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001', {
      auth: {
        token,
      },
      autoConnect: true,
    });

    socketInstance.on('connect', () => {
      console.log('Socket.IO connected');
      setIsConnected(true);
      toast.success('Real-time notifications enabled', {
        duration: 2000,
        position: 'bottom-right',
      });
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket.IO disconnected');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
      toast.error('Failed to connect to notifications', {
        duration: 3000,
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
      socketInstance.disconnect();
    };
  }, [token]);

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
