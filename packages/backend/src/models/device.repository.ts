import { Device } from './interfaces';

export abstract class DeviceRepository {
  abstract saveDeviceToken(userId: string, pushToken: string): Promise<Device>;
  abstract getDeviceToken(userId: string): Promise<string | null>;
}