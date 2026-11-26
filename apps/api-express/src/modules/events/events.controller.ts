import type { Request, Response } from 'express';
import {
  createEvent,
  deleteEvent,
  getEventById,
  listEvents,
  updateEvent,
} from './events.service.js';
import type { CreateEventInput, UpdateEventInput } from './events.types.js';
import type { IdParams } from '../../common/http.types.js';

export function listEventsController(_req: Request, res: Response) {
  res.json(listEvents());
}

export function getEventController(req: Request<IdParams>, res: Response) {
  const event = getEventById(req.params.id);
  if (!event) {
    res.status(404).json({ message: 'Event not found' });
    return;
  }
  res.json(event);
}

export function createEventController(req: Request, res: Response) {
  const event = createEvent(req.body as CreateEventInput);
  res.status(201).json(event);
}

export function updateEventController(req: Request<IdParams>, res: Response) {
  const event = updateEvent(req.params.id, req.body as UpdateEventInput);
  if (!event) {
    res.status(404).json({ message: 'Event not found' });
    return;
  }
  res.json(event);
}

export function deleteEventController(req: Request<IdParams>, res: Response) {
  const deleted = deleteEvent(req.params.id);
  if (!deleted) {
    res.status(404).json({ message: 'Event not found' });
    return;
  }
  res.status(204).end();
}
