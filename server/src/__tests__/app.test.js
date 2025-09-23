const request = require('supertest');
process.env.NODE_ENV = 'test';
const app = require('../app');

describe('Server', () => {
  test('should respond 200 for GET /', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
  });

  test('should respond 200 for GET /api/health', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
  });

  test('should handle 404 for unknown routes', async () => {
    const response = await request(app).get('/api/unknown');
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('statusCode', 404);
  });
});
