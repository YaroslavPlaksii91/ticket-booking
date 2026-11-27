import type { Request, Response } from 'express';
import {
  createEvent,
  deleteEvent,
  getEventById,
  listEvents,
  updateEvent,
} from './events.service.js';
import type { CreateEventInput, UpdateEventInput } from './events.schemas.js';
import type { IdParams } from '../../common/http.schemas.js';

export function listEventsController(_req: Request, res: Response) {
  res.json(listEvents());
}

export function getEventController(req: Request<IdParams>, res: Response) {
  res.json(getEventById(req.params.id));
}

export function createEventController(
  req: Request<unknown, unknown, CreateEventInput>,
  res: Response,
) {
  const event = createEvent(req.body);
  res.status(201).json(event);
}

export function updateEventController(
  req: Request<IdParams, unknown, UpdateEventInput>,
  res: Response,
) {
  res.json(updateEvent(req.params.id, req.body));
}

export function deleteEventController(req: Request<IdParams>, res: Response) {
  deleteEvent(req.params.id);
  res.status(204).end();
}
