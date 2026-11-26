import { Router } from 'express';
import {
  createEventController,
  deleteEventController,
  getEventController,
  listEventsController,
  updateEventController,
} from './events.controller.js';

export const eventsRouter = Router();

eventsRouter.get('/', listEventsController);
eventsRouter.get('/:id', getEventController);
eventsRouter.post('/', createEventController);
eventsRouter.patch('/:id', updateEventController);
eventsRouter.delete('/:id', deleteEventController);
