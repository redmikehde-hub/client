import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const socketInstance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketInstance.on('connect', () => {
      console.log('🔌 Socket connected');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.log('🔌 Socket connection error:', error.message);
      setIsConnected(false);
    });

    socketInstance.on('new_notification', (notification) => {
      console.log('📢 New notification received:', notification);
      toast.success(notification.title, {
        duration: 5000,
        style: {
          background: '#13131f',
          color: '#fff',
          border: '1px solid #6366f1',
          borderRadius: '12px',
        },
      });
    });

    socketInstance.on('error', (error) => {
      console.error('Socket error:', error);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const joinRoom = useCallback((userId) => {
    if (socket) {
      socket.emit('join', userId);
    }
  }, [socket]);

  const leaveRoom = useCallback((userId) => {
    if (socket) {
      socket.emit('leave', userId);
    }
  }, [socket]);

  const value = {
    socket,
    isConnected,
    joinRoom,
    leaveRoom,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
}

export default SocketContext;
