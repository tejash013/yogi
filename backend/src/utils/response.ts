export function success<T>(data: T, message = 'Success') {
  return {
    success: true,
    data,
    message,
  };
}

export function paginated<T>(data: T[], total: number, page: number, limit: number, message = 'Success') {
  return {
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
    message,
  };
}

export function failure(message = 'Failed', errors: string[] = []) {
  return {
    success: false,
    data: null,
    message,
    errors,
  };
}
