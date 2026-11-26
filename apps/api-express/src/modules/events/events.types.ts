import type { EventStatus } from './events.schemas.js';

export interface Event {
  id: string;
  title: string;
  description: string;
  status: EventStatus;
  createdAt: string;
}
