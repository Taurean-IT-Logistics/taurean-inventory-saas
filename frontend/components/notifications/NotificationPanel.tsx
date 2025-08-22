"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, Trash2, Settings, X, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { NotificationsAPI } from "@/lib/api";
import { useSocket } from "@/components/SocketProvider";
import { SocketEvents } from "@/lib/socket";
import { toast } from "@/hooks/use-toast";
import type { Notification, NotificationPreferences } from "@/types";
import { formatDistanceToNow } from "date-fns";

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const [showPreferences, setShowPreferences] = useState(false);
  const { subscribeToEvent, unsubscribeFromEvent } = useSocket();

  // Fetch notifications
  const { data: notificationsData = [], isLoading } = useQuery({
    queryKey: ["user-notifications"],
    queryFn: () => NotificationsAPI.getUserNotifications(),
    enabled: isOpen,
  });

  // Fetch unread count
  const { data: unreadCountData = 0 } = useQuery({
    queryKey: ["notification-unread-count"],
    queryFn: () => NotificationsAPI.getUnreadCount(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch preferences
  const { data: preferencesData } = useQuery({
    queryKey: ["notification-preferences"],
    queryFn: () => NotificationsAPI.getPreferences(),
    enabled: showPreferences,
  });

  // Extract data with proper typing
  const notifications =
    (notificationsData as any)?.notifications || notificationsData || [];
  const unreadCount = (unreadCountData as any)?.count || unreadCountData || 0;
  const preferences =
    (preferencesData as any)?.preferences ||
    (preferencesData as NotificationPreferences | undefined);

  // Mutations
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) =>
      NotificationsAPI.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["notification-unread-count"],
      });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => NotificationsAPI.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["notification-unread-count"],
      });
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId: string) =>
      NotificationsAPI.deleteNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["notification-unread-count"],
      });
      toast({
        title: "Success",
        description: "Notification deleted",
      });
    },
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: (prefs: Partial<NotificationPreferences>) =>
      NotificationsAPI.updatePreferences(prefs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-preferences"] });
      toast({
        title: "Success",
        description: "Notification preferences updated",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update preferences",
      });
    },
  });

  // Real-time notifications
  useEffect(() => {
    const handleNewNotification = (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["user-notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["notification-unread-count"],
      });

      // Show toast for new notification
      toast({
        title: data.title || "New Notification",
        description: data.message,
      });
    };

    // Subscribe to notification events
    subscribeToEvent(SocketEvents.NotificationUser, handleNewNotification);
    subscribeToEvent(SocketEvents.NotificationCompany, handleNewNotification);

    return () => {
      unsubscribeFromEvent(
        SocketEvents.NotificationUser,
        handleNewNotification
      );
      unsubscribeFromEvent(
        SocketEvents.NotificationCompany,
        handleNewNotification
      );
    };
  }, [subscribeToEvent, unsubscribeFromEvent, queryClient]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return "✅";
      case "warning":
        return "⚠️";
      case "error":
        return "❌";
      case "booking":
        return "📅";
      case "payment":
        return "💰";
      case "system":
        return "🔧";
      default:
        return "ℹ️";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-500";
      case "warning":
        return "bg-yellow-500";
      case "error":
        return "bg-red-500";
      case "booking":
        return "bg-blue-500";
      case "payment":
        return "bg-purple-500";
      case "system":
        return "bg-gray-500";
      default:
        return "bg-blue-500";
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    markAsReadMutation.mutate(notificationId);
  };

  const handleDeleteNotification = (notificationId: string) => {
    if (window.confirm("Are you sure you want to delete this notification?")) {
      deleteNotificationMutation.mutate(notificationId);
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handlePreferenceChange = (
    key: keyof NotificationPreferences,
    value: boolean
  ) => {
    if (preferences) {
      const updatedPreferences = { [key]: value };
      updatePreferencesMutation.mutate(updatedPreferences);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Dialog open={showPreferences} onOpenChange={setShowPreferences}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Notification Preferences</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email">Email Notifications</Label>
                      <Switch
                        id="email"
                        checked={preferences?.email || false}
                        onCheckedChange={(checked) =>
                          handlePreferenceChange("email", checked)
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="push">Push Notifications</Label>
                      <Switch
                        id="push"
                        checked={preferences?.push || false}
                        onCheckedChange={(checked) =>
                          handlePreferenceChange("push", checked)
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="booking">Booking Notifications</Label>
                      <Switch
                        id="booking"
                        checked={preferences?.bookingNotifications || false}
                        onCheckedChange={(checked) =>
                          handlePreferenceChange(
                            "bookingNotifications",
                            checked
                          )
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="payment">Payment Notifications</Label>
                      <Switch
                        id="payment"
                        checked={preferences?.paymentNotifications || false}
                        onCheckedChange={(checked) =>
                          handlePreferenceChange(
                            "paymentNotifications",
                            checked
                          )
                        }
                      />
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Actions */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  disabled={markAllAsReadMutation.isPending}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Mark all as read
                </Button>
                <span className="text-xs text-gray-500">
                  {notifications.length} notification
                  {notifications.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          )}

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="px-4 py-8 text-center text-gray-500">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>No notifications yet</p>
                <p className="text-sm">
                  We&apos;ll notify you when something important happens
                </p>
              </div>
            ) : (
              notifications.map((notification: Notification) => (
                <motion.div
                  key={notification._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`px-4 py-3 hover:bg-gray-50 border-b border-gray-50 ${
                    !notification.isRead ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${getNotificationColor(
                        notification.type
                      )}`}
                    ></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDistanceToNow(
                              new Date(notification.createdAt),
                              { addSuffix: true }
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification._id)}
                              disabled={markAsReadMutation.isPending}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleDeleteNotification(notification._id)
                            }
                            disabled={deleteNotificationMutation.isPending}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-gray-100 px-4 py-2">
              <Button variant="ghost" size="sm" className="w-full">
                View all notifications
              </Button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationPanel;
