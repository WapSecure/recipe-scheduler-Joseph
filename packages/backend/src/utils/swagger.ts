import swaggerJsdoc from 'swagger-jsdoc';
import { swaggerOptions } from '../config/swagger';

export const swaggerSpec = swaggerJsdoc(swaggerOptions);