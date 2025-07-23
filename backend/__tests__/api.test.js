// backend/__tests__/api.test.js

const request = require('supertest');
const express = require('express');
const app = require('../index'); // Export the app in index.js

describe('API Routes', () => {
  it('should respond to GET /item/:id with 200', async () => {
    // Dummy ObjectId (MongoDB format)
    const res = await request(app).get('/item/64eac0ed0c4a0f1f1f1f1f1f');
    expect(res.statusCode).toBe(200);
  });

  it('should insert an item with PUT /item', async () => {
    const res = await request(app)
      .put('/item')
      .send({ name: 'Test Item' })
      .set('Accept', 'application/json');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('insertedId');
  });
});
