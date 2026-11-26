export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'HIDDEN' | 'ARCHIVED';

export interface Event {
  id: string;
  title: string;
  description: string;
  status: EventStatus;
  createdAt: string;
}

export type CreateEventInput = Pick<Event, 'title' | 'description'>;

export type UpdateEventInput = Partial<Pick<Event, 'title' | 'description' | 'status'>>;
