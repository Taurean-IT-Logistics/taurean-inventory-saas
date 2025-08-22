import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSocket } from "@/components/SocketProvider";
import { SocketEvents } from "@/lib/socket";
import { toast } from "@/hooks/use-toast";

interface UseRealtimeUpdatesOptions {
  queryKeys: string[];
  events: Array<keyof typeof SocketEvents>;
  showNotifications?: boolean;
  notificationTitle?: string;
}

export const useRealtimeUpdates = ({
  queryKeys,
  events,
  showNotifications = true,
  notificationTitle = "Update",
}: UseRealtimeUpdatesOptions) => {
  const { subscribeToEvent, unsubscribeFromEvent } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleUpdate = (data: any) => {
      // Invalidate and refetch the specified queries
      queryKeys.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      });

      // Show notification if enabled
      if (showNotifications) {
        toast({
          title: notificationTitle,
          description: "Data has been updated in real-time",
        });
      }
    };

    // Subscribe to all specified events
    events.forEach((event) => {
      const eventName = SocketEvents[event];
      subscribeToEvent(eventName, handleUpdate);
    });

    // Cleanup: unsubscribe from all events
    return () => {
      events.forEach((event) => {
        const eventName = SocketEvents[event];
        unsubscribeFromEvent(eventName, handleUpdate);
      });
    };
  }, [
    subscribeToEvent,
    unsubscribeFromEvent,
    queryClient,
    queryKeys,
    events,
    showNotifications,
    notificationTitle,
  ]);
};
