import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('🔌 Initializing Socket.IO connection for user:', user);
      
      // Connect to Socket.IO server
      const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      });

      newSocket.on('connect', () => {
        console.log('✅ Socket.IO connected:', newSocket.id);
        // Join user's personal room
        const userId = user._id || user.id;
        console.log('👤 Joining user room:', userId);
        if (userId) {
          newSocket.emit('join-user-room', userId.toString());
          console.log('✅ Joined room: user-' + userId);
        } else {
          console.error('❌ No user ID found:', user);
        }
      });

      newSocket.on('connect_error', (error) => {
        console.error('❌ Socket.IO connection error:', error);
      });

      newSocket.on('disconnect', (reason) => {
        console.log('🔌 Socket disconnected:', reason);
      });

      // Listen for new event notifications
      newSocket.on('new-event', (data) => {
        console.log('🔔 New event notification received:', data);
        const notification = {
          id: Date.now(),
          type: 'new-event',
          message: data.message,
          event: data.event,
          timestamp: data.timestamp,
          read: false
        };
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        toast.success(data.message || 'New event available!', {
          duration: 5000,
          onClick: () => {
            window.location.href = '/student/events';
          }
        });
      });

      // Listen for participation approval notifications
      newSocket.on('participation-approved', (data) => {
        console.log('🔔 Participation approved notification received:', data);
        
        // Check if this notification is for the current user
        const userId = user._id || user.id;
        if (data.targetUserId && data.targetUserId !== userId.toString()) {
          console.log('Notification not for current user, skipping');
          return;
        }
        
        const notification = {
          id: Date.now(),
          type: 'participation-approved',
          message: data.message,
          participation: data.participation,
          timestamp: data.timestamp,
          read: false
        };
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        toast.success(data.message || 'Your participation has been approved!', {
          duration: 5000,
          onClick: () => {
            window.location.href = '/student/profile';
          }
        });
      });

      // Also listen for broadcast events
      newSocket.on('new-event-broadcast', (data) => {
        console.log('🔔 Broadcast event notification received:', data);
        // Only process if user is a student
        if (user.role === 'student') {
          const notification = {
            id: Date.now(),
            type: 'new-event',
            message: data.message,
            event: data.event,
            timestamp: data.timestamp,
            read: false
          };
          setNotifications(prev => [notification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          toast.success(data.message || 'New event available!', {
            duration: 5000,
            onClick: () => {
              window.location.href = '/student/events';
            }
          });
        }
      });

      newSocket.on('participation-approved-broadcast', (data) => {
        const userId = user._id || user.id;
        if (data.targetUserId === userId.toString()) {
          console.log('🔔 Broadcast approval notification for current user:', data);
          // Same handling as regular participation-approved
          const notification = {
            id: Date.now(),
            type: 'participation-approved',
            message: data.message,
            participation: data.participation,
            timestamp: data.timestamp,
            read: false
          };
          setNotifications(prev => [notification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          toast.success(data.message || 'Your participation has been approved!', {
            duration: 5000,
            onClick: () => {
              window.location.href = '/student/profile';
            }
          });
        }
      });

      newSocket.on('room-joined', (data) => {
        console.log('✅ Successfully joined room:', data);
      });

      // Debug: Listen for all events
      newSocket.onAny((event, ...args) => {
        console.log('📡 Socket event received:', event, args);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      // Disconnect if user logs out
      if (socket) {
        socket.close();
        setSocket(null);
        setNotifications([]);
        setUnreadCount(0);
      }
    }
  }, [isAuthenticated, user]);

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
    setUnreadCount(0);
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearNotifications
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

