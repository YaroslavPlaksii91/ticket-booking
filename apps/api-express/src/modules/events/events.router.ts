import { Router } from 'express';
import { idParamsSchema } from '../../common/http.schemas.js';
import { validate } from '../../middlewares/validate.js';
import { createEventSchema, updateEventSchema } from './events.schemas.js';
import {
  createEventController,
  deleteEventController,
  getEventController,
  listEventsController,
  updateEventController,
} from './events.controller.js';

export const eventsRouter = Router();

eventsRouter.get('/', listEventsController);
eventsRouter.get('/:id', validate({ params: idParamsSchema }), getEventController);
eventsRouter.post('/', validate({ body: createEventSchema }), createEventController);
eventsRouter.patch(
  '/:id',
  validate({ params: idParamsSchema, body: updateEventSchema }),
  updateEventController,
);
eventsRouter.delete('/:id', validate({ params: idParamsSchema }), deleteEventController);
