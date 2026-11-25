import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { requestId } from './middlewares/request-id.js';
import { httpLogger } from './middlewares/http-logger.js';
import { healthRouter } from './modules/health/health.routes.js';

const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:3000').split(',');

export const app = express();

app.use(requestId);
app.use(httpLogger);
app.use(helmet());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '100kb' }));

app.use('/health', healthRouter);
