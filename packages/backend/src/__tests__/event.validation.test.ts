import { eventSchema } from '../validations/event.validation';

describe('Event Validation', () => {
  it('should validate a correct event', () => {
    const validEvent = {
      title: 'Test Event',
      eventTime: new Date(Date.now() + 3600000).toISOString(),
      userId: 'user-1'
    };
    expect(() => eventSchema.parse(validEvent)).not.toThrow();
  });

  it('should reject an event with empty title', () => {
    const invalidEvent = {
      title: '',
      eventTime: new Date(Date.now() + 3600000).toISOString(),
      userId: 'user-1'
    };
    expect(() => eventSchema.parse(invalidEvent)).toThrow();
  });

  it('should reject an event with invalid date', () => {
    const invalidEvent = {
      title: 'Test Event',
      eventTime: 'invalid-date',
      userId: 'user-1'
    };
    expect(() => eventSchema.parse(invalidEvent)).toThrow();
  });

  it('should require userId', () => {
    const invalidEvent = {
      title: 'Test Event',
      eventTime: new Date(Date.now() + 3600000).toISOString()
    };
    expect(() => eventSchema.parse(invalidEvent)).toThrow();
  });
});