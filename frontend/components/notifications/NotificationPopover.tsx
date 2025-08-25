"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  Check,
  Trash2,
  AlertCircle,
  CheckCircle,
  Info,
  XCircle,
  Calendar,
  CreditCard,
  Receipt,
  Settings,
  MessageSquare,
} from "lucide-react";
import { useNotifications, Notification } from "./NotificationProvider";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

const getNotificationIcon = (category: string, type: string) => {
  const iconClass = "w-4 h-4";
  
  switch (category) {
    case "booking":
      return <Calendar className={iconClass} />;
    case "payment":
      return <CreditCard className={iconClass} />;
    case "invoice":
      return <Receipt className={iconClass} />;
    case "support":
      return <MessageSquare className={iconClass} />;
    case "system":
      return <Settings className={iconClass} />;
    default:
      switch (type) {
        case "success":
          return <CheckCircle className={iconClass} />;
        case "warning":
          return <AlertCircle className={iconClass} />;
        case "error":
          return <XCircle className={iconClass} />;
        default:
          return <Info className={iconClass} />;
      }
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case "success":
      return "text-green-600 bg-green-50 border-green-200";
    case "warning":
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    case "error":
      return "text-red-600 bg-red-50 border-red-200";
    default:
      return "text-blue-600 bg-blue-50 border-blue-200";
  }
};

const getNotificationBadgeColor = (type: string) => {
  switch (type) {
    case "success":
      return "bg-green-100 text-green-800";
    case "warning":
      return "bg-yellow-100 text-yellow-800";
    case "error":
      return "bg-red-100 text-red-800";
    default:
      return "bg-blue-100 text-blue-800";
  }
};

export const NotificationPopover: React.FC = () => {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const handleMarkAsRead = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead(notification._id);
    }
  };

  const handleDelete = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    await deleteNotification(notificationId);
  };

  const getNotificationLink = (notification: Notification) => {
    if (notification.data?.link) {
      return notification.data.link;
    }

    switch (notification.category) {
      case "booking":
        return `/user/bookings/${notification.data?.bookingId || ""}`;
      case "payment":
        return `/user/transactions`;
      case "invoice":
        return `/user/invoices`;
      case "support":
        return `/user/support`;
      default:
        return "#";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full"
          aria-label="Open notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" className="w-96 max-h-[600px] overflow-y-auto">
        <div className="flex items-center justify-between p-2">
          <DropdownMenuLabel className="text-base font-semibold">
            Notifications
          </DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              Mark all as read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        
        {isLoading ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
            <p className="text-sm text-gray-600 mt-2">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center">
            <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">No notifications yet</p>
          </div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.slice(0, 10).map((notification) => (
              <DropdownMenuItem
                key={notification._id}
                className={`flex items-start gap-3 p-3 cursor-pointer hover:bg-gray-50 ${
                  !notification.isRead ? "bg-blue-50" : ""
                }`}
                onClick={() => handleMarkAsRead(notification)}
              >
                <div className="flex-shrink-0 mt-1">
                  <div
                    className={`p-2 rounded-full border ${getNotificationColor(
                      notification.type
                    )}`}
                  >
                    {getNotificationIcon(notification.category, notification.type)}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        !notification.isRead ? "text-gray-900" : "text-gray-700"
                      }`}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          variant="outline"
                          className={`text-xs ${getNotificationBadgeColor(
                            notification.type
                          )}`}
                        >
                          {notification.category}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDelete(e, notification._id)}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="justify-center text-sm text-blue-600 hover:text-blue-700">
          <Link href="/user/notifications">
            View all notifications
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};