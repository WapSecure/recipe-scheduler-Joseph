export const getConfig = () => ({
    port: parseInt(process.env.PORT || '3000'),
    reminderLeadMinutes: parseInt(process.env.REMINDER_LEAD_MINUTES || '30'),
    nodeEnv: process.env.NODE_ENV || 'development'
  });