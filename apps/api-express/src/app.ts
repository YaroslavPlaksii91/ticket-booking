import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { requestId } from './middlewares/request-id.js';
import { httpLogger } from './middlewares/http-logger.js';
import { errorHandler } from './middlewares/error-handler.js';
import { notFound } from './middlewares/not-found.js';
import { healthRouter } from './modules/health/health.router.js';
import { eventsRouter } from './modules/events/events.router.js';
import { config } from './config.js';

export const app = express();

app.use(requestId);
app.use(httpLogger);
app.use(helmet());
app.use(cors({ origin: config.CORS_ORIGINS, credentials: true }));
app.use(express.json({ limit: '100kb' }));

app.use('/health', healthRouter);
app.use('/events', eventsRouter);

app.use(notFound);
app.use(errorHandler);
