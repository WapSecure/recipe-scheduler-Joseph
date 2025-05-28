import { Event, Device } from '../models/interfaces';
import sqlite3 from 'sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { EventRepository } from '../models/event.repository';
import { DeviceRepository } from '../models/device.repository';

export class SQLiteEventRepository implements EventRepository {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database('./database.sqlite'); // File-based for persistence
    this.initialize();
  }

  private initialize() {
    this.db.serialize(() => {
      this.db.run(`
        CREATE TABLE IF NOT EXISTS events (
          id TEXT PRIMARY KEY,
          userId TEXT NOT NULL,
          title TEXT NOT NULL,
          eventTime TEXT NOT NULL,
          createdAt TEXT NOT NULL
        )
      `);
      this.db.run('CREATE INDEX IF NOT EXISTS idx_userId ON events(userId)');
    });
  }

  async createEvent(event: Omit<Event, 'id' | 'createdAt'>): Promise<Event> {
    const newEvent: Event = {
      ...event,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };

    await new Promise<void>((resolve, reject) => {
      this.db.run(
        'INSERT INTO events (id, userId, title, eventTime, createdAt) VALUES (?, ?, ?, ?, ?)',
        [newEvent.id, newEvent.userId, newEvent.title, newEvent.eventTime, newEvent.createdAt],
        (err) => (err ? reject(err) : resolve())
      );
    });

    return newEvent;
  }

  // async getEventsByUser(userId: string): Promise<Event[]> {
  //   return new Promise((resolve, reject) => {
  //     this.db.all(
  //       'SELECT * FROM events WHERE userId = ? AND eventTime > ? ORDER BY eventTime ASC',
  //       [userId, new Date().toISOString()],
  //       (err, rows) => (err ? reject(err) : resolve(rows as Event[]))
  //     );
  //   });
  // }

  async getEventsByUser(userId: string, limit: number = 10, offset: number = 0): Promise<Event[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT * FROM events 
         WHERE userId = ? AND eventTime > ? 
         ORDER BY eventTime ASC 
         LIMIT ? OFFSET ?`,
        [userId, new Date().toISOString(), limit, offset],
        (err, rows) => (err ? reject(err) : resolve(rows as Event[]))
      );
    });
  }

  async updateEvent(
    id: string,
    updates: Partial<Pick<Event, 'title' | 'eventTime'>>
  ): Promise<Event | null> {
    const event = await this.getEventById(id);
    if (!event) return null;

    const updatedEvent = { ...event, ...updates };

    await new Promise<void>((resolve, reject) => {
      this.db.run(
        'UPDATE events SET title = ?, eventTime = ? WHERE id = ?',
        [updatedEvent.title, updatedEvent.eventTime, id],
        (err) => (err ? reject(err) : resolve())
      );
    });

    return updatedEvent;
  }

  async deleteEvent(id: string): Promise<boolean> {
    const result = await new Promise<boolean>((resolve, reject) => {
      this.db.run('DELETE FROM events WHERE id = ?', [id], function (err) {
        if (err) return reject(err);
        resolve(this.changes > 0);
      });
    });

    return result;
  }

  async getEventById(id: string): Promise<Event | null> {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM events WHERE id = ?', [id], (err, row) =>
        err ? reject(err) : resolve((row as Event) || null)
      );
    });
  }
}

// implementation for SQLiteDeviceRepository
export class SQLiteDeviceRepository implements DeviceRepository {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database('./database.sqlite');
    this.initialize();
  }

  private initialize() {
    this.db.run(`
        CREATE TABLE IF NOT EXISTS devices (
          userId TEXT PRIMARY KEY,
          pushToken TEXT NOT NULL
        )
      `);
  }

  async saveDeviceToken(userId: string, pushToken: string): Promise<Device> {
    await new Promise<void>((resolve, reject) => {
      this.db.run(
        'INSERT OR REPLACE INTO devices (userId, pushToken) VALUES (?, ?)',
        [userId, pushToken],
        (err) => (err ? reject(err) : resolve())
      );
    });

    return { userId, pushToken };
  }

  async getDeviceToken(userId: string): Promise<string | null> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT pushToken FROM devices WHERE userId = ?',
        [userId],
        (err, row: { pushToken?: string } | undefined) => {
          if (err) return reject(err);
          resolve(row?.pushToken || null);
        }
      );
    });
  }
}
