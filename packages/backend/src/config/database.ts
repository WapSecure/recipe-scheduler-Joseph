import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { EventRepository } from '../models/event.repository';
import { DeviceRepository } from '../models/device.repository';
import { DynamoDBEventRepository } from '../models/dynamodb/event.repository';
import { DynamoDBDeviceRepository } from '../models/dynamodb/device.repository';

let eventRepository: EventRepository;
let deviceRepository: DeviceRepository;

export const initializeDatabase = async (): Promise<void> => {
  if (process.env.DB_TYPE === 'dynamodb') {
    const dynamoClient = new DynamoDBClient({
      region: process.env.AWS_REGION || 'us-east-1',
      endpoint: process.env.DYNAMODB_ENDPOINT || undefined,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'fake',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'fake',
      },
    });

    const dynamoDocumentClient = DynamoDBDocumentClient.from(dynamoClient);
    
    // Use the concrete implementations
    eventRepository = new DynamoDBEventRepository(dynamoDocumentClient);
    deviceRepository = new DynamoDBDeviceRepository(dynamoDocumentClient);
  } else {
    const { SQLiteEventRepository, SQLiteDeviceRepository } = await import('./sqlite');
    eventRepository = new SQLiteEventRepository();
    deviceRepository = new SQLiteDeviceRepository();
  }
};

export const getEventRepository = (): EventRepository => {
  if (!eventRepository) {
    throw new Error('Database not initialized');
  }
  return eventRepository;
};

export const getDeviceRepository = (): DeviceRepository => {
  if (!deviceRepository) {
    throw new Error('Database not initialized');
  }
  return deviceRepository;
};

