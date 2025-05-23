import { getDeviceRepository } from '../config/database';
import { IDeviceService } from '.';
import { Device  } from '../models/interfaces';


export class DeviceService implements IDeviceService {
  async saveDeviceToken(userId: string, pushToken: string): Promise<Device> {
    return getDeviceRepository().saveDeviceToken(userId, pushToken);
  }

  async getDeviceToken(userId: string): Promise<string | null> {
    return getDeviceRepository().getDeviceToken(userId);
  }
}