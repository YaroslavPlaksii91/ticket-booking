import { randomUUID } from 'node:crypto';
import type { Event } from './events.types.js';
import type { CreateEventInput, UpdateEventInput } from './events.schemas.js';
import { NotFoundError } from '../../common/errors.js';

const events: Event[] = [];

export function listEvents(): Event[] {
  return events;
}

export function getEventById(id: string): Event {
  const event = events.find((event) => event.id === id);
  if (!event) throw new NotFoundError('Event not found');
  return event;
}

export function createEvent(input: CreateEventInput): Event {
  const event: Event = {
    id: randomUUID(),
    title: input.title,
    description: input.description,
    status: 'DRAFT',
    createdAt: new Date().toISOString(),
  };
  events.push(event);
  return event;
}

export function updateEvent(id: string, input: UpdateEventInput): Event {
  const event = getEventById(id);
  Object.assign(event, input);
  return event;
}

export function deleteEvent(id: string): void {
  const index = events.findIndex((event) => event.id === id);
  if (index === -1) throw new NotFoundError('Event not found');
  events.splice(index, 1);
}
