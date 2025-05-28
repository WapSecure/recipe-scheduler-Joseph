import { SwaggerDefinition } from 'swagger-jsdoc';

const swaggerDefinition: SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Recipe Scheduler API',
    version: '1.0.0',
    description: 'API for scheduling cooking events with push notifications',
  },
  servers: [
    {
      url: 'http://localhost:3000/api',
      description: 'Development server',
    },
    {
      url: 'https://7d8b-197-210-29-130.ngrok-free.app/api',
      description: 'Ngrok tunnel',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      Event: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          userId: { type: 'string' },
          title: { type: 'string' },
          eventTime: { type: 'string', format: 'date-time' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Device: {
        type: 'object',
        properties: {
          userId: { type: 'string' },
          pushToken: { type: 'string' },
        },
      },
    },
  },
};

export const swaggerOptions = {
  swaggerDefinition,
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};