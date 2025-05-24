import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import http from 'http';
import { errorHandler } from './middlewares/errorHandler';
import { router } from './routes';
import { injectServices } from './middlewares/services.middleware';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './utils/swagger';

export const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const server = http.createServer(app);


// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Service injection middleware
app.use(injectServices);

// Routes
app.use('/api', router);

// Error handling (should be last)
app.use(errorHandler);


const startServer = async (port: number): Promise<http.Server> => {
  return new Promise((resolve, reject) => {
    const s = server.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`Health check: http://localhost:${port}/api/health`);
      resolve(s);
    }).on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${port} is in use, trying ${port + 1}...`);
        startServer(port + 1).then(resolve).catch(reject);
      } else {
        reject(err);
      }
    });
  });
};

startServer(PORT)
  .catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
  