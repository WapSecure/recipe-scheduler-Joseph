import { notificationWorker } from '../consumers/notification.consumer';
import { Job } from 'bullmq';
import { getDeviceRepository } from '../../../backend/src/config/database';

describe('Notification Worker', () => {
  const mockEvent = {
    id: 'test-event',
    userId: 'test-user',
    title: 'Test Event',
    eventTime: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should process a valid notification job', async () => {
    // Mock device repository
    const mockGetToken = jest.fn().mockResolvedValue('ExpoPushToken[valid-token]');
    getDeviceRepository().getDeviceToken = mockGetToken;

    const mockJob = {
      data: { event: mockEvent },
      id: 'test-job',
    } as unknown as Job;

    await expect(notificationWorker(mockJob)).resolves.not.toThrow();
    expect(mockGetToken).toHaveBeenCalledWith(mockEvent.userId);
  });

  it('should handle missing push token', async () => {
    const mockGetToken = jest.fn().mockResolvedValue(null);
    getDeviceRepository().getDeviceToken = mockGetToken;

    const mockJob = {
      data: { event: mockEvent },
      id: 'test-job',
    } as unknown as Job;

    await notificationWorker(mockJob);
    expect(mockGetToken).toHaveBeenCalled();
    // Should complete without error even with no token
  });

  it('should handle invalid push token', async () => {
    const mockGetToken = jest.fn().mockResolvedValue('invalid-token');
    getDeviceRepository().getDeviceToken = mockGetToken;

    const mockJob = {
      data: { event: mockEvent },
      id: 'test-job',
    } as unknown as Job;

    await notificationWorker(mockJob);
    expect(mockGetToken).toHaveBeenCalled();
    // Should complete with mock notification
  });
});