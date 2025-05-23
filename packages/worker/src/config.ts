export const getConfig = () => ({
    redisUrl: process.env.REDIS_URL || 'redis://redis:6379',
    reminderLeadMinutes: parseInt(process.env.REMINDER_LEAD_MINUTES || '15'),
    expoAccessToken: process.env.EXPO_ACCESS_TOKEN
  });