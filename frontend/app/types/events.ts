import { Database } from "./supabase";

export type EventRow = Database["public"]["Tables"]["events"]["Row"];

export interface Event {
  id: number;
  title: string;
  type?: string | null;
  date: string;
  location: string;
  description: string;
  tags: string[];
}

export const eventRowToEvent = (eventRow: EventRow): Event => {
  return {
    id: eventRow.id,
    title: eventRow.title,
    type: eventRow.type,
    date: eventRow.date,
    location: eventRow.location,
    description: eventRow.description,
    tags: eventRow.tags,
  };
};
