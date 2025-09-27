import { useState, useEffect, useCallback, useRef } from "react";

export interface InfiniteScrollOptions {
  hasMore: boolean;
  isLoading: boolean;
  threshold?: number;
  rootMargin?: string;
}

export interface InfiniteScrollReturn {
  loadMore: () => void;
  reset: () => void;
  setHasMore: (hasMore: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  observerRef: React.RefObject<HTMLDivElement>;
}

export function useInfiniteScroll(
  onLoadMore: () => void,
  options: InfiniteScrollOptions
): InfiniteScrollReturn {
  const { hasMore, isLoading, threshold = 100, rootMargin = "0px" } = options;

  const [internalHasMore, setInternalHasMore] = useState(hasMore);
  const [internalIsLoading, setInternalIsLoading] = useState(isLoading);

  const observerRef = useRef<HTMLDivElement>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  const loadMore = useCallback(() => {
    if (!internalIsLoading && internalHasMore) {
      onLoadMore();
    }
  }, [internalIsLoading, internalHasMore, onLoadMore]);

  const reset = useCallback(() => {
    setInternalHasMore(true);
    setInternalIsLoading(false);
  }, []);

  const setHasMore = useCallback((hasMore: boolean) => {
    setInternalHasMore(hasMore);
  }, []);

  const setIsLoading = useCallback((isLoading: boolean) => {
    setInternalIsLoading(isLoading);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const currentObserverRef = observerRef.current;
    if (!currentObserverRef) return;

    observer.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !internalIsLoading && internalHasMore) {
          loadMore();
        }
      },
      {
        rootMargin,
        threshold: threshold / 100, // Convert percentage to decimal
      }
    );

    observer.current.observe(currentObserverRef);

    return () => {
      if (observer.current && currentObserverRef) {
        observer.current.unobserve(currentObserverRef);
      }
    };
  }, [internalIsLoading, internalHasMore, loadMore, threshold, rootMargin]);

  // Update internal state when props change
  useEffect(() => {
    setInternalHasMore(hasMore);
  }, [hasMore]);

  useEffect(() => {
    setInternalIsLoading(isLoading);
  }, [isLoading]);

  return {
    loadMore,
    reset,
    setHasMore,
    setIsLoading,
    observerRef,
  };
}
