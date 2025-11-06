import React, { createContext, useState, useContext, useEffect } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';
import { Badge } from '@mui/material';

const NotificationContext = createContext({});

export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      initializeSocket();
    } else {
      disconnectSocket();
    }

    return () => {
      disconnectSocket();
    };
  }, [isAuthenticated, user]);

  const initializeSocket = () => {
    const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
      auth: {
        token: localStorage.getItem('token'),
      },
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setConnected(true);
      // Join user's personal room
      newSocket.emit('join-user-room', user._id);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });

    // Listen for notifications
    newSocket.on('notification', (notification) => {
      handleNewNotification(notification);
    });

    // Listen for event updates
    newSocket.on('event-update', (data) => {
      handleEventUpdate(data);
    });

    // Listen for participation updates
    newSocket.on('participation-update', (data) => {
      handleParticipationUpdate(data);
    });

    // Listen for announcement
    newSocket.on('announcement', (data) => {
      handleAnnouncement(data);
    });

    setSocket(newSocket);
  };

  const disconnectSocket = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setConnected(false);
    }
  };

  const handleNewNotification = (notification) => {
    setNotifications((prev) => [notification, ...prev]);
    setUnreadCount((prev) => prev + 1);

    // Show toast based on notification type
    switch (notification.type) {
      case 'event_registration':
        toast.success(`Successfully registered for ${notification.title}`);
        break;
      case 'participation_approved':
        toast.success(`Your participation in ${notification.title} has been approved!`);
        break;
      case 'participation_rejected':
        toast.error(`Your participation in ${notification.title} needs revision`);
        break;
      case 'certificate_ready':
        toast.success(`Certificate ready for ${notification.title}!`);
        break;
      case 'event_reminder':
        toast.info(`Reminder: ${notification.title} starts soon!`);
        break;
      case 'attendance_alert':
        toast.warning(`Attendance Alert: ${notification.message}`);
        break;
      default:
        toast(notification.message);
    }

    // Play notification sound if enabled
    if (localStorage.getItem('notificationSound') !== 'false') {
      playNotificationSound();
    }
  };

  const handleEventUpdate = (data) => {
    switch (data.action) {
      case 'created':
        toast.info(`New event: ${data.event.title}`);
        break;
      case 'updated':
        toast.info(`Event updated: ${data.event.title}`);
        break;
      case 'cancelled':
        toast.warning(`Event cancelled: ${data.event.title}`);
        break;
    }
  };

  const handleParticipationUpdate = (data) => {
    const message = data.status === 'approved' 
      ? `Your participation in ${data.eventTitle} has been approved!`
      : `Your participation in ${data.eventTitle} needs revision: ${data.reason}`;
    
    toast(message, {
      icon: data.status === 'approved' ? '✅' : '⚠️',
      duration: 5000,
    });
  };

  const handleAnnouncement = (data) => {
    toast(data.message, {
      icon: '📢',
      duration: 6000,
      style: {
        background: '#1e40af',
        color: '#fff',
      },
    });
  };

  const playNotificationSound = () => {
    const audio = new Audio('/notification-sound.mp3');
    audio.volume = 0.5;
    audio.play().catch(e => console.log('Could not play notification sound'));
  };

  const markAsRead = async (notificationId) => {
    try {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      // Send to backend
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      );
      setUnreadCount(0);

      // Send to backend
      await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated]);

  const value = {
    socket,
    connected,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    fetchNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
