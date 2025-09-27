/**
 * Pagination Utility
 * Provides consistent pagination handling across all endpoints
 */

export interface PaginationOptions {
  page?: number;
  limit?: number;
  maxLimit?: number;
  defaultLimit?: number;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/**
 * Parse pagination parameters from query string
 */
export const parsePaginationParams = (query: any, options: PaginationOptions = {}): {
  page: number;
  limit: number;
  skip: number;
} => {
  const {
    maxLimit = 100,
    defaultLimit = 10,
  } = options;

  const page = Math.max(1, parseInt(query.page as string) || 1);
  const limit = Math.min(
    maxLimit,
    Math.max(1, parseInt(query.limit as string) || defaultLimit)
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Create pagination result
 */
export const createPaginationResult = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginationResult<T> => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage,
      hasPrevPage,
    },
  };
};

/**
 * Validate pagination parameters
 */
export const validatePaginationParams = (page: number, limit: number, maxLimit: number = 100): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (page < 1) {
    errors.push("Page must be greater than 0");
  }

  if (limit < 1) {
    errors.push("Limit must be greater than 0");
  }

  if (limit > maxLimit) {
    errors.push(`Limit cannot exceed ${maxLimit}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Get pagination metadata for response
 */
export const getPaginationMetadata = (page: number, limit: number, total: number) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    startIndex: (page - 1) * limit + 1,
    endIndex: Math.min(page * limit, total),
  };
};

/**
 * Common pagination middleware
 */
export const paginationMiddleware = (options: PaginationOptions = {}) => {
  return (req: any, res: any, next: any) => {
    const { page, limit, skip } = parsePaginationParams(req.query, options);
    
    // Validate pagination parameters
    const validation = validatePaginationParams(page, limit, options.maxLimit);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters",
        errors: validation.errors,
      });
    }

    // Add pagination info to request
    req.pagination = { page, limit, skip };
    next();
  };
};

/**
 * Apply pagination to Mongoose query
 */
export const applyPagination = (query: any, page: number, limit: number) => {
  return query
    .skip((page - 1) * limit)
    .limit(limit);
};

/**
 * Get pagination response format
 */
export const formatPaginationResponse = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
  message: string = "Data fetched successfully"
) => {
  const pagination = getPaginationMetadata(page, limit, total);
  
  return {
    success: true,
    message,
    data,
    pagination,
  };
};