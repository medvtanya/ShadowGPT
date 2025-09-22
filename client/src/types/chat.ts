export type ChatRequest = {
  sessionId: string;
  question: string;
};

export type ChatResponse = {
  statusCode: number;
  message: string;
  data: {
    answer: string;
    sessionId: string;
    question: string;
  };
  error?: string | null;
};


