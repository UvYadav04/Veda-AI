export type UnknownRecord = Record<string, unknown>;

export const isRecord = (value: unknown): value is UnknownRecord => {
  return typeof value === 'object' && value !== null;
};

// Best-effort extraction for RTK Query `unwrap()` rejections and other thrown errors.
export const getApiErrorMessage = (error: unknown): string => {
  if (isRecord(error)) {
    const data = error['data'];
    if (isRecord(data)) {
      const apiError = data['error'];
      if (typeof apiError === 'string' && apiError.trim().length > 0) return apiError;
    }

    const message = error['message'];
    if (typeof message === 'string' && message.trim().length > 0) return message;
  }

  return 'Unknown error';
};

