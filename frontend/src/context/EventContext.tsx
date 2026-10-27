import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { EventItem, EventEngineConfig } from '../types';
import { ApiService } from '../services/api';
import { useAuth } from './AuthContext';

interface EventContextType {
  events: EventItem[];
  activeEvent: EventItem | null;
  activeConfig: EventEngineConfig | null;
  eventConfigs: Record<string, EventEngineConfig>;
  loading: boolean;
  setActiveEventId: (id: string) => void;
  refreshEvents: () => Promise<void>;
  createEvent: (data: Partial<EventItem>) => Promise<EventItem>;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [activeEvent, setActiveEvent] = useState<EventItem | null>(null);
  const [eventConfigs, setEventConfigs] = useState<Record<string, EventEngineConfig>>({});
  const [loading, setLoading] = useState(false);

  // Load configs once
  useEffect(() => {
    ApiService.getEventTypes().then(setEventConfigs).catch(console.error);
  }, []);

  const refreshEvents = async () => {
    if (!user) {
      setEvents([]);
      setActiveEvent(null);
      return;
    }
    setLoading(true);
    try {
      const list = await ApiService.listEvents();
      setEvents(list);

      const savedActiveId = localStorage.getItem('utsavsetu_active_event_id');
      const found = list.find((e) => e.id === savedActiveId);
      if (found) {
        setActiveEvent(found);
      } else if (list.length > 0) {
        setActiveEvent(list[0]);
        localStorage.setItem('utsavsetu_active_event_id', list[0].id);
      } else {
        setActiveEvent(null);
      }
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshEvents();
  }, [user]);

  const setActiveEventId = (id: string) => {
    const found = events.find((e) => e.id === id);
    if (found) {
      setActiveEvent(found);
      localStorage.setItem('utsavsetu_active_event_id', found.id);
    }
  };

  const createEvent = async (data: Partial<EventItem>): Promise<EventItem> => {
    const created = await ApiService.createEvent(data);
    await refreshEvents();
    setActiveEvent(created);
    localStorage.setItem('utsavsetu_active_event_id', created.id);
    return created;
  };

  const activeConfig = activeEvent && eventConfigs[activeEvent.event_type]
    ? eventConfigs[activeEvent.event_type]
    : eventConfigs['wedding'] || null;

  return (
    <EventContext.Provider
      value={{
        events,
        activeEvent,
        activeConfig,
        eventConfigs,
        loading,
        setActiveEventId,
        refreshEvents,
        createEvent,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export const useEvent = () => {
  const context = useContext(EventContext);
  if (!context) throw new Error('useEvent must be used within EventProvider');
  return context;
};

