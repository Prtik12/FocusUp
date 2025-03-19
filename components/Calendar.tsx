"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CalendarPlus, Trash2 } from "lucide-react";

interface Event {
  id: number;
  title: string;
  date: string;
}

interface CalendarProps {
  events: Event[];
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
}

export default function Calendar({ events, setEvents }: CalendarProps) {
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDate, setNewEventDate] = useState("");

  const addEvent = () => {
    if (!newEventTitle || !newEventDate) return;
    setEvents([...events, { id: events.length + 1, title: newEventTitle, date: newEventDate }]);
    setNewEventTitle("");
    setNewEventDate("");
  };

  const deleteEvent = (id: number) => {
    setEvents(events.filter(event => event.id !== id));
  };

  return (
    <div className="p-4 bg-white dark:bg-[#5B4339] rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-[#4A3628] dark:text-[#FAF3DD] mb-4">📅 Your Events</h3>
      
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Event Title"
          value={newEventTitle}
          onChange={(e) => setNewEventTitle(e.target.value)}
          className="p-2 border rounded w-1/2"
        />
        <input
          type="date"
          value={newEventDate}
          onChange={(e) => setNewEventDate(e.target.value)}
          className="p-2 border rounded w-1/3"
        />
        <button onClick={addEvent} className="bg-blue-500 text-white p-2 rounded flex items-center gap-2">
          <CalendarPlus size={20} />
        </button>
      </div>
      
      {events.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-300">No upcoming events.</p>
      ) : (
        <ul className="space-y-3">
          {events.map(event => (
            <motion.li
              key={event.id}
              className="flex justify-between items-center p-3 bg-[#FAF3DD] dark:bg-[#4A3628] rounded shadow-sm"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <span className="font-medium">{event.title} - {event.date}</span>
              <button onClick={() => deleteEvent(event.id)} className="text-red-500 hover:text-red-700">
                <Trash2 size={20} />
              </button>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}
