const request = require('supertest');
process.env.NODE_ENV = 'test';
const app = require('../app');
const PdfService = require('../services/pdfService');

describe('Chat API', () => {
  let testSessionId;

  beforeAll(() => {
    // Создаем тестовую сессию
    testSessionId = PdfService.createSession('Test PDF content for testing');
  });

  test('should send message successfully', async () => {
    const response = await request(app)
      .post('/api/chat')
      .send({
        sessionId: testSessionId,
        question: 'What is this document about?'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('statusCode', 200);
    expect(response.body.data).toHaveProperty('answer');
    expect(response.body.data).toHaveProperty('sessionId', testSessionId);
  });

  test('should return 400 for missing fields', async () => {
    const response = await request(app)
      .post('/api/chat')
      .send({
        sessionId: testSessionId
        // missing question
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Missing required fields');
  });

  test('should return 404 for invalid session', async () => {
    const response = await request(app)
      .post('/api/chat')
      .send({
        sessionId: 'invalid-session-id',
        question: 'What is this document about?'
      });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('Session not found');
  });

  test('should get chat history', async () => {
    const response = await request(app)
      .get(`/api/chat/history/${testSessionId}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('statusCode', 200);
    expect(response.body.data).toHaveProperty('sessionId', testSessionId);
  });
});
