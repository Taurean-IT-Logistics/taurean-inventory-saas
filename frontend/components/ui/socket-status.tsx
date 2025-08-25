"use client";

import React from "react";
import { useSocket } from "@/components/SocketProvider";
import { Badge } from "./badge";
import { Wifi, WifiOff } from "lucide-react";

export const SocketStatus: React.FC = () => {
  const { isConnected } = useSocket();

  return (
    <Badge
      variant={isConnected ? "default" : "destructive"}
      className="flex items-center gap-1 text-xs"
    >
      {isConnected ? (
        <>
          <Wifi className="h-3 w-3" />
          Live
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3" />
          Offline
        </>
      )}
    </Badge>
  );
};
