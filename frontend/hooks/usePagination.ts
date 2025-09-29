import { useState, useCallback } from "react";

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface UsePaginationOptions {
  initialPage?: number;
  initialLimit?: number;
  total?: number;
}

export interface UsePaginationReturn {
  pagination: PaginationState;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setTotal: (total: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  resetPagination: () => void;
  updatePagination: (data: Partial<PaginationState>) => void;
}

export function usePagination(
  options: UsePaginationOptions = {}
): UsePaginationReturn {
  const { initialPage = 1, initialLimit = 10, total = 0 } = options;

  const [pagination, setPaginationState] = useState<PaginationState>({
    page: initialPage,
    limit: initialLimit,
    total,
    totalPages: Math.ceil(total / initialLimit),
    hasNext: total > initialPage * initialLimit,
    hasPrev: initialPage > 1,
  });

  const setPage = useCallback((page: number) => {
    setPaginationState((prev) => {
      const newPagination = {
        ...prev,
        page: Math.max(1, Math.min(page, prev.totalPages)),
        hasNext: page < prev.totalPages,
        hasPrev: page > 1,
      };
      return newPagination;
    });
  }, []);

  const setLimit = useCallback((limit: number) => {
    setPaginationState((prev) => {
      const newTotalPages = Math.ceil(prev.total / limit);
      const newPage = Math.min(prev.page, newTotalPages);
      return {
        ...prev,
        limit,
        totalPages: newTotalPages,
        page: newPage,
        hasNext: newPage < newTotalPages,
        hasPrev: newPage > 1,
      };
    });
  }, []);

  const setTotal = useCallback((total: number) => {
    setPaginationState((prev) => {
      const newTotalPages = Math.ceil(total / prev.limit);
      const newPage = Math.min(prev.page, newTotalPages);
      return {
        ...prev,
        total,
        totalPages: newTotalPages,
        page: newPage,
        hasNext: newPage < newTotalPages,
        hasPrev: newPage > 1,
      };
    });
  }, []);

  const nextPage = useCallback(() => {
    setPaginationState((prev) => {
      if (prev.hasNext) {
        const newPage = prev.page + 1;
        return {
          ...prev,
          page: newPage,
          hasNext: newPage < prev.totalPages,
          hasPrev: newPage > 1,
        };
      }
      return prev;
    });
  }, []);

  const prevPage = useCallback(() => {
    setPaginationState((prev) => {
      if (prev.hasPrev) {
        const newPage = prev.page - 1;
        return {
          ...prev,
          page: newPage,
          hasNext: newPage < prev.totalPages,
          hasPrev: newPage > 1,
        };
      }
      return prev;
    });
  }, []);

  const goToFirstPage = useCallback(() => {
    setPaginationState((prev) => ({
      ...prev,
      page: 1,
      hasNext: prev.totalPages > 1,
      hasPrev: false,
    }));
  }, []);

  const goToLastPage = useCallback(() => {
    setPaginationState((prev) => ({
      ...prev,
      page: prev.totalPages,
      hasNext: false,
      hasPrev: prev.totalPages > 1,
    }));
  }, []);

  const resetPagination = useCallback(() => {
    setPaginationState({
      page: initialPage,
      limit: initialLimit,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    });
  }, [initialPage, initialLimit]);

  const updatePagination = useCallback((data: Partial<PaginationState>) => {
    setPaginationState((prev) => {
      const newPagination = { ...prev, ...data };
      return {
        ...newPagination,
        hasNext: newPagination.page < newPagination.totalPages,
        hasPrev: newPagination.page > 1,
      };
    });
  }, []);

  return {
    pagination,
    setPage,
    setLimit,
    setTotal,
    nextPage,
    prevPage,
    goToFirstPage,
    goToLastPage,
    resetPagination,
    updatePagination,
  };
}
