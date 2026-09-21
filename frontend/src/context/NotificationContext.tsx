import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppNotification } from '../types/notification';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, addNotificationRecord } from '../firebase/firestore';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  addNotification: (notif: Omit<AppNotification, 'id'>) => Promise<void>;
  refresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const fetchNotifs = useCallback(async () => {
    try {
      const list = await getNotifications(user?.email || 'all');
      setNotifications(list);
    } catch (e) {
      console.error('Failed to load notifications:', e);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifs();
    // Refresh every 15 seconds to simulate real-time notification polling
    const interval = setInterval(fetchNotifs, 15000);
    return () => clearInterval(interval);
  }, [fetchNotifs]);

  const markRead = async (id: string) => {
    await markNotificationAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id || n.notificationId === id ? { ...n, read: true } : n));
  };

  const markAllRead = async () => {
    await markAllNotificationsAsRead(user?.email || 'all');
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const addNotification = async (notifData: Omit<AppNotification, 'id'>) => {
    const created = await addNotificationRecord(notifData);
    setNotifications(prev => [created, ...prev]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markRead,
        markAllRead,
        addNotification,
        refresh: fetchNotifs
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
