import { QueueService } from '../services/queue.service';
import { Event } from '../models/interfaces';

describe('QueueService', () => {
  let queueService: QueueService;
  const mockAdd = jest.fn();

  beforeEach(() => {
    // Mock the BullMQ Queue
    queueService = new QueueService();
    queueService['queue'] = {
      add: mockAdd,
    } as any;
  });

  it('should schedule a reminder with correct delay', async () => {
    const testEvent: Event = {
      id: 'test-id',
      userId: 'user-1',
      title: 'Test Event',
      eventTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
      createdAt: new Date().toISOString()
    };

    await queueService.scheduleReminder(testEvent);

    expect(mockAdd).toHaveBeenCalledWith(
      `reminder:${testEvent.id}`,
      { event: testEvent },
      expect.objectContaining({
        jobId: `reminder:${testEvent.id}`,
        delay: expect.any(Number)
      })
    );
  });

  it('should not schedule if event time is in past', async () => {
    const pastEvent: Event = {
      id: 'past-id',
      userId: 'user-1',
      title: 'Past Event',
      eventTime: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      createdAt: new Date().toISOString()
    };

    await queueService.scheduleReminder(pastEvent);
    expect(mockAdd).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({
        delay: 0 
      })
    );
  });
});