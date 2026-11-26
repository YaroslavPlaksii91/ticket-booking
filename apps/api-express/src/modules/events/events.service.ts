import { randomUUID } from 'node:crypto';
import type { CreateEventInput, Event, UpdateEventInput } from './events.types.js';

const events: Event[] = [];

export function listEvents(): Event[] {
  return events;
}

export function getEventById(id: string): Event | undefined {
  return events.find((event) => event.id === id);
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

export function updateEvent(id: string, input: UpdateEventInput): Event | undefined {
  const event = getEventById(id);
  if (!event) return undefined;

  Object.assign(event, input);
  return event;
}

export function deleteEvent(id: string): boolean {
  const index = events.findIndex((event) => event.id === id);
  if (index === -1) return false;

  events.splice(index, 1);
  return true;
}
