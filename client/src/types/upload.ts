export type UploadResponse = {
  statusCode: number;
  message: string;
  data: {
    sessionId: string;
    textLength: number;
  };
  error?: string | null;
};


