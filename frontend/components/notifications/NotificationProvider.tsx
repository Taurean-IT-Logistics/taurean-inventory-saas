"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { NotificationsAPI } from "@/lib/api";
import { useSocket } from "@/hooks/useSocket";
import { SocketEvents } from "@/lib/socket";
import { toast } from "@/hooks/use-toast";

export interface Notification {
  _id: string;
  user: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  category: "booking" | "payment" | "invoice" | "system" | "support";
  isRead: boolean;
  data?: any;
  createdAt: string;
  updatedAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  // Fetch notifications
  const {
    data: notifications = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => NotificationsAPI.getUserNotifications(),
    staleTime: 30000, // 30 seconds
  });

  // Fetch unread count
  const { data: unreadCountData } = useQuery({
    queryKey: ["notifications-unread-count"],
    queryFn: () => NotificationsAPI.getUnreadCount(),
    staleTime: 10000, // 10 seconds
  });

  // Update unread count when data changes
  useEffect(() => {
    if (unreadCountData !== undefined) {
      setUnreadCount(unreadCountData);
    } else {
      // Fallback: calculate from notifications
      const count = notifications.filter((n: Notification) => !n.isRead).length;
      setUnreadCount(count);
    }
  }, [unreadCountData, notifications]);

  // Socket event listeners for real-time notifications
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification: Notification) => {
      // Add new notification to the list
      queryClient.setQueryData(["notifications"], (old: Notification[] = []) => {
        return [notification, ...old];
      });

      // Update unread count
      setUnreadCount((prev) => prev + 1);

      // Show toast notification
      toast({
        title: notification.title,
        description: notification.message,
        variant: notification.type === "error" ? "destructive" : "default",
      });
    };

    const handleNotificationUpdate = (data: { notificationId: string; updates: Partial<Notification> }) => {
      queryClient.setQueryData(["notifications"], (old: Notification[] = []) => {
        return old.map((n) =>
          n._id === data.notificationId ? { ...n, ...data.updates } : n
        );
      });
    };

    const handleNotificationDelete = (notificationId: string) => {
      queryClient.setQueryData(["notifications"], (old: Notification[] = []) => {
        return old.filter((n) => n._id !== notificationId);
      });
    };

    // Listen for real-time events
    socket.on(SocketEvents.NotificationCreated, handleNewNotification);
    socket.on(SocketEvents.NotificationUpdated, handleNotificationUpdate);
    socket.on(SocketEvents.NotificationDeleted, handleNotificationDelete);

    return () => {
      socket.off(SocketEvents.NotificationCreated, handleNewNotification);
      socket.off(SocketEvents.NotificationUpdated, handleNotificationUpdate);
      socket.off(SocketEvents.NotificationDeleted, handleNotificationDelete);
    };
  }, [socket, queryClient]);

  const markAsRead = async (notificationId: string) => {
    try {
      await NotificationsAPI.markAsRead(notificationId);
      
      // Update local state
      queryClient.setQueryData(["notifications"], (old: Notification[] = []) => {
        return old.map((n) =>
          n._id === notificationId ? { ...n, isRead: true } : n
        );
      });

      // Update unread count
      setUnreadCount((prev) => Math.max(0, prev - 1));

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await NotificationsAPI.markAllAsRead();
      
      // Update local state
      queryClient.setQueryData(["notifications"], (old: Notification[] = []) => {
        return old.map((n) => ({ ...n, isRead: true }));
      });

      // Reset unread count
      setUnreadCount(0);

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await NotificationsAPI.deleteNotification(notificationId);
      
      // Update local state
      queryClient.setQueryData(["notifications"], (old: Notification[] = []) => {
        const deletedNotification = old.find((n) => n._id === notificationId);
        const newList = old.filter((n) => n._id !== notificationId);
        
        // Update unread count if deleted notification was unread
        if (deletedNotification && !deletedNotification.isRead) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
        
        return newList;
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const refreshNotifications = () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};