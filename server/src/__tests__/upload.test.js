const request = require('supertest');
process.env.NODE_ENV = 'test';
const app = require('../app');

describe('Upload API', () => {
  test('should upload PDF file successfully', async () => {
    // Тестовый PDF буфер с корректным mimetype
    const testPdfBuffer = Buffer.from('%PDF-1.4 test');

    const response = await request(app)
      .post('/api/upload')
      .attach('file', testPdfBuffer, { filename: 'test.pdf', contentType: 'application/pdf' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('statusCode', 200);
    expect(response.body.data).toHaveProperty('sessionId');
  });

  test('should reject non-PDF files', async () => {
    const testTextBuffer = Buffer.from('test text content');

    const response = await request(app)
      .post('/api/upload')
      .attach('file', testTextBuffer, { filename: 'test.txt', contentType: 'text/plain' });

    expect(response.status).toBe(400);
  });

  test('should return 400 when no file uploaded', async () => {
    const response = await request(app)
      .post('/api/upload');

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('No PDF file uploaded');
  });
});
