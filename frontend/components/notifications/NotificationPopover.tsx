"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  MoreHorizontal,
} from "lucide-react";
import { useNotifications, Notification } from "./NotificationProvider";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

const getNotificationIcon = (category: string, type: string) => {
  const iconClass = "w-5 h-5";
  
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
      return "bg-green-100 text-green-800 border-green-200";
    case "warning":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "error":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-blue-100 text-blue-800 border-blue-200";
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
          className="relative rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Open notifications"
        >
          <Bell className="h-5 w-5 text-gray-700" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center border-2 border-white"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" className="w-96 max-h-[600px] overflow-y-auto p-0 border-0 shadow-xl">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  Mark all as read
                </Button>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-600 mt-3">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-600">No notifications yet</p>
                <p className="text-xs text-gray-500 mt-1">We'll notify you when something important happens</p>
              </div>
            ) : (
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.slice(0, 10).map((notification) => (
                  <Card
                    key={notification._id}
                    className={`border-0 border-b border-gray-100 rounded-none hover:bg-gray-50 transition-colors cursor-pointer ${
                      !notification.isRead ? "bg-blue-50/50" : ""
                    }`}
                    onClick={() => handleMarkAsRead(notification)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
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
                              <div className="flex items-center gap-2 mb-1">
                                <p className={`text-sm font-medium ${
                                  !notification.isRead ? "text-gray-900" : "text-gray-700"
                                }`}>
                                  {notification.title}
                                </p>
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-2">
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
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => e.stopPropagation()}
                                  className="h-6 w-6 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                                >
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-32">
                                <DropdownMenuItem
                                  onClick={(e) => handleDelete(e, notification._id)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            
            {notifications.length > 0 && (
              <div className="p-4 border-t border-gray-100">
                <Button
                  variant="ghost"
                  className="w-full text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  asChild
                >
                  <Link href="/user/notifications">
                    View all notifications
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};