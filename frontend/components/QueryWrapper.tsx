"use client";

import React from "react";
import { UseQueryResult } from "@tanstack/react-query";
import { LoadingSpinner, InlineLoader } from "./LoadingSpinner";
import { ErrorMessage } from "./ErrorMessage";

interface QueryWrapperProps<T> {
  query: UseQueryResult<T>;
  children: (data: T) => React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  showRetry?: boolean;
  variant?: "default" | "inline" | "card";
}

export function QueryWrapper<T>({
  query,
  children,
  loadingComponent,
  errorComponent,
  emptyComponent,
  showRetry = true,
  variant = "default",
}: QueryWrapperProps<T>) {
  const { data, isLoading, isError, error, refetch, isFetching } = query;

  if (isLoading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }
    
    if (variant === "inline") {
      return <InlineLoader text="Loading..." />;
    }
    
    return <LoadingSpinner text="Loading..." />;
  }

  if (isError) {
    if (errorComponent) {
      return <>{errorComponent}</>;
    }

    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    
    return (
      <ErrorMessage
        message={errorMessage}
        onRetry={showRetry ? () => refetch() : undefined}
        variant={variant}
      />
    );
  }

  if (!data) {
    if (emptyComponent) {
      return <>{emptyComponent}</>;
    }
    
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground">No data available</p>
      </div>
    );
  }

  // Show loading indicator during background refetch
  const content = children(data);
  
  if (isFetching && variant !== "inline") {
    return (
      <div className="relative">
        {content}
        <div className="absolute top-0 right-0 p-2">
          <LoadingSpinner size="sm" />
        </div>
      </div>
    );
  }

  return <>{content}</>;
}

// Specialized wrapper for list queries
interface QueryListWrapperProps<T> extends Omit<QueryWrapperProps<T>, 'emptyComponent'> {
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
}

export function QueryListWrapper<T extends { length?: number } | any[]>({
  query,
  children,
  emptyTitle = "No items found",
  emptyDescription = "There are no items to display",
  emptyAction,
  ...props
}: QueryListWrapperProps<T>) {
  const isEmpty = query.data && (
    Array.isArray(query.data) 
      ? query.data.length === 0 
      : (query.data as any)?.length === 0
  );

  const emptyComponent = isEmpty ? (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <h3 className="text-lg font-semibold mb-2">{emptyTitle}</h3>
      <p className="text-muted-foreground mb-4">{emptyDescription}</p>
      {emptyAction}
    </div>
  ) : undefined;

  return (
    <QueryWrapper
      query={query}
      emptyComponent={emptyComponent}
      {...props}
    >
      {children}
    </QueryWrapper>
  );
}