import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { EventRepository } from '../event.repository';
import { Event } from '../interfaces';
import { v4 as uuidv4 } from 'uuid';

export class DynamoDBEventRepository implements EventRepository {
  private readonly tableName = process.env.EVENTS_TABLE || 'Events';

  constructor(private readonly dynamoClient: DynamoDBDocumentClient) {}

  async createEvent(event: Omit<Event, 'id' | 'createdAt'>): Promise<Event> {
    const newEvent: Event = {
      ...event,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };

    await this.dynamoClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: newEvent,
      })
    );

    return newEvent;
  }

  async getEventsByUser(userId: string): Promise<Event[]> {
    const result = await this.dynamoClient.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: 'userId = :userId',
        FilterExpression: 'eventTime > :now',
        ExpressionAttributeValues: {
          ':userId': userId,
          ':now': new Date().toISOString(),
        },
        ScanIndexForward: false, // Sort by eventTime descending
      })
    );

    return (result.Items as Event[]) || [];
  }

  async updateEvent(id: string, updates: Partial<Pick<Event, 'title' | 'eventTime'>>): Promise<Event | null> {
    const event = await this.getEventById(id);
    if (!event) return null;

    const updatedEvent = { ...event, ...updates };
    
    await this.dynamoClient.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: { id, userId: event.userId },
        UpdateExpression: 'SET title = :title, eventTime = :eventTime',
        ExpressionAttributeValues: {
          ':title': updatedEvent.title,
          ':eventTime': updatedEvent.eventTime,
        },
        ReturnValues: 'ALL_NEW',
      })
    );

    return updatedEvent;
  }

  async deleteEvent(id: string): Promise<boolean> {
    const event = await this.getEventById(id);
    if (!event) return false;

    await this.dynamoClient.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: { id, userId: event.userId },
      })
    );

    return true;
  }

  async getEventById(id: string): Promise<Event | null> {
    const result = await this.dynamoClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { id },
      })
    );

    return (result.Item as Event) || null;
  }
}