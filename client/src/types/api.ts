export type ApiErrorResponseData = {
  statusCode?: number;
  message?: string;
  data?: unknown;
  error?: string | null;
  [key: string]: unknown;
};

export type ApiError = Error & {
  response?: {
    status: number;
    data?: ApiErrorResponseData;
  };
};

