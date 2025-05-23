import { DynamoDBDocumentClient, PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { DeviceRepository } from '../device.repository';
import { Device } from '../interfaces';

export class DynamoDBDeviceRepository implements DeviceRepository {
  private readonly tableName = process.env.DEVICES_TABLE || 'Devices';

  constructor(private readonly dynamoClient: DynamoDBDocumentClient) {}

  async saveDeviceToken(userId: string, pushToken: string): Promise<Device> {
    const device: Device = { userId, pushToken };

    await this.dynamoClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: device,
      })
    );

    return device;
  }

  async getDeviceToken(userId: string): Promise<string | null> {
    const result = await this.dynamoClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { userId },
      })
    );

    return result.Item?.pushToken || null;
  }
}