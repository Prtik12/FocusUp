import { create } from 'zustand';
import { Event } from '@/types';

type EventState = {
  events: Event[];
  selectedDate: Date | null;
  showEvents: boolean;
  newEventTitle: string;
  modalPosition: { top: number; left: number };
  
  setEvents: (events: Event[]) => void;
  addEvent: (event: Event) => void;
  deleteEvent: (id: number) => void;
  setSelectedDate: (date: Date | null) => void;
  setShowEvents: (show: boolean) => void;
  setNewEventTitle: (title: string) => void;
  updateModalPosition: (position: { top: number; left: number }) => void;
  
  fetchEvents: () => Promise<void>;
  createEvent: (title: string, date: Date) => Promise<void>;
  removeEvent: (id: number) => Promise<void>;
};

export const useEventStore = create<EventState>((set) => ({
  events: [],
  selectedDate: null,
  showEvents: false,
  newEventTitle: '',
  modalPosition: { top: 0, left: 0 },
  
  setEvents: (events) => set({ events }),
  addEvent: (event) => set((state) => ({ events: [...state.events, event] })),
  deleteEvent: (id) => set((state) => ({ 
    events: state.events.filter(event => event.id !== id) 
  })),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setShowEvents: (show) => set({ showEvents: show }),
  setNewEventTitle: (title) => set({ newEventTitle: title }),
  updateModalPosition: (position) => set({ modalPosition: position }),
  
  fetchEvents: async () => {
    try {
      const res = await fetch('/api/events');
      const data: Event[] = await res.json();
      set({ events: data });
    } catch {
      console.error('Failed to fetch events');
    }
  },
  
  createEvent: async (title, date) => {
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        body: JSON.stringify({ title, date }),
        headers: { 'Content-Type': 'application/json' },
      });
      
      const data: Event = await res.json();
      set((state) => ({ 
        events: [...state.events, data],
        newEventTitle: '',
        showEvents: false,
        selectedDate: null
      }));
    } catch {
      console.error('Failed to create event');
    }
  },
  
  removeEvent: async (id) => {
    try {
      await fetch('/api/events', {
        method: 'DELETE',
        body: JSON.stringify({ id }),
        headers: { 'Content-Type': 'application/json' },
      });
      
      set((state) => ({ 
        events: state.events.filter(event => event.id !== id) 
      }));
    } catch {
      console.error('Failed to delete event');
    }
  },
})); 