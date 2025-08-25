"use client";

import { useEffect, useState } from "react";
import { Badge } from "./badge";
import { Wifi, WifiOff, AlertCircle } from "lucide-react";

interface WebSocketStatusProps {
  socket: any;
  isConnected?: boolean;
}

export function WebSocketStatus({ socket, isConnected }: WebSocketStatusProps) {
  const [status, setStatus] = useState<"connected" | "disconnected" | "error">(
    "disconnected"
  );

  useEffect(() => {
    if (!socket) {
      setStatus("disconnected");
      return;
    }

    const handleConnect = () => setStatus("connected");
    const handleDisconnect = () => setStatus("disconnected");
    const handleError = () => setStatus("error");

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleError);
    socket.on("error", handleError);

    // Set initial status
    setStatus(socket.connected ? "connected" : "disconnected");

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleError);
      socket.off("error", handleError);
    };
  }, [socket]);

  const getStatusConfig = () => {
    switch (status) {
      case "connected":
        return {
          color: "bg-green-100 text-green-800",
          icon: Wifi,
          text: "Connected",
        };
      case "error":
        return {
          color: "bg-red-100 text-red-800",
          icon: AlertCircle,
          text: "Error",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800",
          icon: WifiOff,
          text: "Disconnected",
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge className={config.color} variant="outline">
      <Icon className="w-3 h-3 mr-1" />
      {config.text}
    </Badge>
  );
}
