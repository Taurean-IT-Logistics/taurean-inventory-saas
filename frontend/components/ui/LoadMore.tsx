"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface LoadMoreProps {
  onLoadMore: () => void;
  isLoading: boolean;
  hasMore: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function LoadMore({
  onLoadMore,
  isLoading,
  hasMore,
  className = "",
  children,
}: LoadMoreProps) {
  if (!hasMore) {
    return null;
  }

  return (
    <div className={`flex justify-center py-4 ${className}`}>
      <Button
        onClick={onLoadMore}
        disabled={isLoading}
        variant="outline"
        className="min-w-[120px]"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </>
        ) : (
          children || "Load More"
        )}
      </Button>
    </div>
  );
}
