import request from 'supertest';
import { app } from '../index';
import { getEventRepository } from '../config/database';
import { Event } from '../models/interfaces';

describe('Event API Integration Tests', () => {
  beforeEach(async () => {
    // Clear database before each test
    const repo = getEventRepository();
    if ('deleteAll' in repo) {
      await (repo as any).deleteAll();
    }
  });

  it('POST /events - should create a new event', async () => {
    const newEvent = {
      title: 'Integration Test Event',
      eventTime: new Date(Date.now() + 3600000).toISOString(),
      userId: 'test-user'
    };

    const response = await request(app)
      .post('/api/events')
      .send(newEvent)
      .expect(201);

    expect(response.body).toMatchObject({
      title: newEvent.title,
      userId: newEvent.userId
    });
    expect(response.body.id).toBeDefined();
    expect(response.body.createdAt).toBeDefined();
  });

  it('GET /events - should return created events', async () => {
    const repo = getEventRepository();
    await repo.createEvent({
      title: 'Test Event 1',
      eventTime: new Date(Date.now() + 7200000).toISOString(),
      userId: 'test-user'
    });

    const response = await request(app)
      .get('/api/events?userId=test-user')
      .expect(200);

    expect(response.body.length).toBe(1);
    expect(response.body[0].title).toBe('Test Event 1');
  });
});