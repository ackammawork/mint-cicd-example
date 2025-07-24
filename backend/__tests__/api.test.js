const request = require('supertest');
const { app, dbConnectPromise } = require('../index');

describe('Todos API E2E', () => {
  let insertedId;
  let mongoClient;
  let mongoCollection;

  beforeAll(async () => {
    const {client, collection} = await dbConnectPromise;
    mongoClient = client;
    mongoCollection = collection;
    await mongoCollection.deleteMany({});
  }, 15000);

  afterAll(async () => {
    if (mongoClient) {
      await mongoClient.close();
    }
  }, 10000);

  it('should add a new todo', async () => {
    const res = await request(app)
      .post('/todos')
      .send({ text: 'Test E2E todo' });

    expect(res.statusCode).toBe(200);
    expect(res.body.insertedId).toBeDefined();
    insertedId = res.body.insertedId;
  }, 10000);

  it('should get all todos', async () => {
    const res = await request(app).get('/todos');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  }, 10000);

  it('should toggle todo completion', async () => {
    const res = await request(app).put(`/todos/${insertedId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  }, 10000);

  it('should delete the todo', async () => {
    const res = await request(app).delete(`/todos/${insertedId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  }, 10000);
});