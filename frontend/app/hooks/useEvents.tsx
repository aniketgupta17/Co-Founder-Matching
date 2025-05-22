import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Event, EventRow, eventRowToEvent } from "../types/events";
import { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";

interface EventContextType {
  events: Event[];
  loading: boolean;
  error: string | null;
}

const EventContext = createContext<EventContextType | null>(null);

export const useEventContext = () => {
  const context = useContext(EventContext);

  if (!context) {
    throw new Error("useEventContext must be used within an EventProvider");
  }

  return context;
};

interface EventProviderProps {
  children: React.ReactNode;
  supabase: SupabaseClient;
}

export const EventProvider: React.FC<EventProviderProps> = ({
  children,
  supabase,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      console.log("Fetching events");
      const { data, error } = await supabase.from("events").select("*");

      if (error) {
        console.error("Supabase error fetching events:", error);
        setError(error.message);
        setLoading(false);
        return;
      }

      if (!data) {
        console.warn("No event data returned");
        setLoading(false);
        return;
      }

      const newEvents = data.map((row: EventRow) => {
        return eventRowToEvent(row);
      });

      setEvents(newEvents);
      setLoading(false);
      setError(null);
    } catch (error) {
      console.error("Uncaught error fetching events:", error);
      return;
    }
  }, [supabase]);

  useEffect(() => {
    try {
      fetchEvents();
      if (channel) {
        channel.unsubscribe();
      }

      const newChannel = supabase
        .channel("realtime:events")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "events",
          },
          () => {
            console.info("Events table changed");
            fetchEvents();
          }
        )
        .subscribe();

      setChannel(newChannel);

      return () => {
        newChannel.unsubscribe();
      };
    } catch (error) {
      setError("Uncaught error fetching events");
      setLoading(false);
    }
  }, [supabase, fetchEvents]);

  const value = {
    events,
    loading,
    error,
  };

  return (
    <EventContext.Provider value={value}>{children}</EventContext.Provider>
  );
};

export const useEvents = () => {
  const { events, loading, error } = useEventContext();

  return { events, loading, error };
};
