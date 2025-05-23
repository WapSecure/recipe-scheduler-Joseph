export const getConfig = () => ({
    port: parseInt(process.env.PORT || '3000', 10),
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    reminderLeadMinutes: parseInt(process.env.REMINDER_LEAD_MINUTES || '15', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    dbType: process.env.DB_TYPE || 'sqlite',
    
    // DynamoDB config (optional)
    dynamoDb: {
      region: process.env.AWS_REGION || 'us-east-1',
      endpoint: process.env.DYNAMODB_ENDPOINT,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'fake',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'fake',
      eventsTable: process.env.EVENTS_TABLE || 'Events',
      devicesTable: process.env.DEVICES_TABLE || 'Devices'
    }
  });