const request = require('supertest');
process.env.NODE_ENV = 'test';
const app = require('../app');

describe('Server', () => {
  test('should handle 404 for unknown routes', async () => {
    const response = await request(app).get('/api/unknown');
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('statusCode', 404);
  });
});
