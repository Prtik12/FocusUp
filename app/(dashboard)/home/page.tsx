"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import BottomBar from "@/components/BottomBar";
import Calendar from "@/components/Calendar";
import EventCard from "@/components/EventCard";
import StreakCard from "@/components/StreakCard";
import UpcomingEvents from "@/components/UpcomingEvents";
import UsageGraph from "@/components/UsageGraph";
import { useSession } from "next-auth/react";
import { Pangolin } from "next/font/google";
import { Button } from "@/components/ui/button";
import { useActivityTracker } from "@/hooks/useActivityTracker";
import { useActivityData } from "@/hooks/useActivityData";
import { useEventStore } from "@/store/eventStore";
import { useSidebarStore } from "@/store/sidebarStore";

const pangolin = Pangolin({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export default function Home() {
  const { data: session } = useSession();
  const userName = session?.user?.name ?? "User";
  const eventListRef = useRef<HTMLDivElement>(null);

  const { isTracking } = useActivityTracker();
  const { activityData, isLoading, streak } = useActivityData();
  const { isMobile } = useSidebarStore();

  const {
    events,
    selectedDate,
    showEvents,
    newEventTitle,
    modalPosition,
    setSelectedDate,
    setShowEvents,
    setNewEventTitle,
    updateModalPosition,
    fetchEvents,
    createEvent,
    removeEvent,
  } = useEventStore();

  const [isCreatingEvent, setIsCreatingEvent] = useState(false);

  const updateModalPositionCallback = useCallback(() => {
    updateModalPosition({
      top: Math.max(20, window.innerHeight / 2 - 200),
      left: window.innerWidth / 2 - 180,
    });
  }, [updateModalPosition]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const filteredEvents = selectedDate
    ? events.filter(
        (event) =>
          new Date(event.date).toDateString() === selectedDate.toDateString(),
      )
    : [];

  const handleAddEvent = async () => {
    if (!newEventTitle || !selectedDate || isCreatingEvent) return;
    
    setIsCreatingEvent(true);
    try {
      await createEvent(newEventTitle, selectedDate);
    } catch (error) {
      console.error("Error creating event:", error);
    } finally {
      setIsCreatingEvent(false);
    }
  };

  return (
    <div
      className={`${pangolin.className} bg-[#FBF2C0] dark:bg-[#4A3628] min-h-screen`}
    >
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <div className="block md:hidden fixed bottom-0 w-full z-50">
        {isMobile && <BottomBar />}
      </div>

      <div className="transition-all duration-300 md:pl-[85px] lg:pl-[240px]">
        <div className="container mx-auto px-4 py-6 pb-28 md:pb-6 max-w-[1400px]">
          <header className="mb-8">
            <h1 className="text-4xl font-semibold text-[#4A3628] dark:text-[#FAF3DD]">
              Welcome, {userName}!
              {isTracking && (
                <span className="text-xs md:text-sm ml-2 opacity-70">
                  (Tracking activity)
                </span>
              )}
            </h1>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-6">
              <section>
                <h2 className="text-2xl font-medium text-[#4A3628] dark:text-[#FAF3DD] mb-4">
                  Activity Overview
                </h2>
                <UsageGraph activityData={activityData} isLoading={isLoading} />
              </section>

              <section>
                <h2 className="text-2xl font-medium text-[#4A3628] dark:text-[#FAF3DD] mb-4">
                  Upcoming Events
                </h2>
                <UpcomingEvents events={events} deleteEvent={removeEvent} />
              </section>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <section>
                <h2 className="text-2xl font-medium text-[#4A3628] dark:text-[#FAF3DD] mb-4">
                  Your Streak
                </h2>
                <StreakCard streak={streak} />
              </section>

              <section>
                <h2 className="text-2xl font-medium text-[#4A3628] dark:text-[#FAF3DD] mb-4">
                  Calendar
                </h2>
                <div className="bg-white dark:bg-[#3A291A] rounded-xl shadow-lg p-4 flex justify-center">
                  <div className="w-full max-w-md">
                    <Calendar
                      selectedDate={selectedDate}
                      setSelectedDate={(date) => {
                        setSelectedDate(date);
                        if (date) {
                          setShowEvents(true);
                          updateModalPositionCallback();
                        }
                      }}
                      events={events}
                      eventListRef={
                        eventListRef as React.RefObject<HTMLDivElement>
                      }
                      disableOutsideClickReset={false}
                    />
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showEvents && selectedDate && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 event-modal-backdrop"
              onClick={() => {
                setShowEvents(false);
                setSelectedDate(null);
              }}
            ></motion.div>

            <motion.div
              ref={eventListRef}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{
                top: modalPosition.top,
                left: modalPosition.left,
              }}
              className="fixed p-5 bg-white dark:bg-[#3A291A] rounded-xl shadow-xl z-50 w-[360px] event-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/10 transition-colors"
                onClick={() => {
                  setShowEvents(false);
                  setSelectedDate(null);
                }}
              >
                ✖
              </button>

              <h3 className="text-xl font-semibold text-[#4A3628] dark:text-[#FAF3DD] mb-1">
                Events on{" "}
                {selectedDate.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </h3>

              {filteredEvents.length > 0 ? (
                <div className="space-y-2 mt-4 mb-5">
                  {filteredEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      deleteEvent={removeEvent}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 my-4 text-center">
                  No events for this date.
                </p>
              )}

              <div className="mt-5">
                <h4 className="text-sm font-medium text-[#4A3628] dark:text-[#FAF3DD] mb-2">
                  Add New Event
                </h4>
                <input
                  type="text"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="Event title"
                  className="border p-3 w-full rounded-md bg-white/80 dark:bg-[#4A3628]/80 text-[#4A3628] dark:text-[#FAF3DD] dark:border-[#5A4532] placeholder-gray-400 dark:placeholder-gray-500 backdrop-blur-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddEvent();
                    }
                  }}
                />
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAddEvent();
                  }}
                  disabled={isCreatingEvent}
                  className={`w-full bg-gradient-to-r from-[#F96F5D] to-[#FF4D4D] text-white px-4 py-3 mt-3 rounded-md hover:scale-105 transition-all ${
                    isCreatingEvent ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isCreatingEvent ? "Adding..." : "Add Event"}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
