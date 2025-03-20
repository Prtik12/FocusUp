"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import BottomBar from "@/components/BottomBar";
import Calendar from "@/components/Calendar";
import EventCard from "@/components/EventCard";
import { useSession } from "next-auth/react";
import { Pangolin } from "next/font/google";
import { Button } from "@/components/ui/button";

const pangolin = Pangolin({ weight: "400", subsets: ["latin"], display: "swap" });

type Event = {
  id: number;
  title: string;
  date: string;
};

export default function Home() {
  const { data: session } = useSession();
  const userName = session?.user?.name ?? "User";

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [showEvents, setShowEvents] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const fetchEvents = async () => {
      const res = await fetch("/api/events");
      const data: Event[] = await res.json();
      setEvents(data);
    };
    fetchEvents();
  }, []);

  const filteredEvents = selectedDate
    ? events.filter((event) => new Date(event.date).toDateString() === selectedDate.toDateString())
    : [];

  const addEvent = async () => {
    if (!newEventTitle || !selectedDate) return;

    const res = await fetch("/api/events", {
      method: "POST",
      body: JSON.stringify({ title: newEventTitle, date: selectedDate }),
      headers: { "Content-Type": "application/json" },
    });

    const data: Event = await res.json();
    setEvents([...events, data]);
    setNewEventTitle("");
  };

  const deleteEvent = async (id: number) => {
    await fetch("/api/events", {
      method: "DELETE",
      body: JSON.stringify({ id }),
      headers: { "Content-Type": "application/json" },
    });

    setEvents((prevEvents) => prevEvents.filter((event) => event.id !== id));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const eventList = document.getElementById("event-list");
      if (eventList && !eventList.contains(event.target as Node)) {
        setShowEvents(false);
      }
    };

    if (showEvents) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEvents]);

  return (
    <div
      className={`h-full min-h-screen relative flex flex-col items-center justify-center ${pangolin.className} bg-[#FBF2C0] dark:bg-[#4A3628]`}
    >
      {/* Sidebar (Desktop) */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Bottom Bar (Mobile) */}
      <div className="block md:hidden fixed bottom-0 w-full">
        <BottomBar />
      </div>

      <h1 className="text-4xl font-semibold text-[#4A3628] dark:text-[#FAF3DD] mb-6">
        Welcome, {userName}!
      </h1>

      {/* Calendar positioned at the top-right */}
      <div className="absolute top-6 right-6">
        <Calendar
          selectedDate={selectedDate}
          setSelectedDate={(date) => {
            setSelectedDate(date);
            setShowEvents(true);
            const calendarElement = document.querySelector(".custom-calendar");
            if (calendarElement) {
              const rect = calendarElement.getBoundingClientRect();
              setModalPosition({
                top: rect.bottom + window.scrollY + 10,
                left: rect.left + window.scrollX,
              });
            }
          }}
          events={events} // ✅ Pass events to Calendar to show red dots
        />
      </div>

      {/* Event List Modal */}
      <AnimatePresence>
        {showEvents && selectedDate && (
          <motion.div
            id="event-list"
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            style={{
              position: "absolute",
              top: `${modalPosition.top}px`,
              left: `${modalPosition.left}px`,
              zIndex: 50,
            }}
            className="bg-[#FAF3DD] dark:bg-[#2C2C2C] shadow-lg rounded-xl py-6 px-6 w-80"
          >
            {/* Close button */}
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowEvents(false)}
            >
              ✖
            </button>

            <h3 className="text-lg font-semibold text-[#4A3628] dark:text-[#FAF3DD]">
              Events on {selectedDate.toDateString()}:
            </h3>

            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} deleteEvent={deleteEvent} />
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No events for this date.</p>
            )}

            <div className="mt-4">
              <input
                type="text"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                placeholder="Add Event"
                className="border p-2 w-full rounded-md bg-transparent text-[#4A3628] dark:text-[#FAF3DD] dark:border-[#FAF3DD]"
              />
              <Button
                onClick={addEvent}
                className="w-full bg-gradient-to-r from-[#F96F5D] to-[#FF4D4D] text-white px-4 py-2 mt-2 rounded-md hover:scale-105 transition-all"
              >
                Add Event
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
