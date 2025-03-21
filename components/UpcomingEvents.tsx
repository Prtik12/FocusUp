import { Event } from "@/types";
import { motion } from "framer-motion";
import { format, parseISO, isAfter, isBefore, addDays } from "date-fns";
import EventCard from "./EventCard";

type UpcomingEventsProps = {
  events: Event[];
  deleteEvent: (id: number) => Promise<void>;
};

export default function UpcomingEvents({ events, deleteEvent }: UpcomingEventsProps) {
  const today = new Date();
  const nextWeek = addDays(today, 7);

  const upcomingEvents = events
    .filter((event) => {
      const eventDate = parseISO(event.date);
      return isAfter(eventDate, today) && isBefore(eventDate, nextWeek);
    })
    .sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

  const groupedEvents = upcomingEvents.reduce((acc, event) => {
    const dateKey = format(parseISO(event.date), 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(event);
    return acc;
  }, {} as Record<string, Event[]>);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-white dark:bg-[#4A3628] rounded-xl shadow-lg p-6 mb-4 stats-card"
    >
      <div className="space-y-5">
        {Object.keys(groupedEvents).length > 0 ? (
          Object.entries(groupedEvents).map(([dateKey, dateEvents]) => (
            <div key={dateKey} className="space-y-2">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {format(parseISO(dateKey), "EEEE, MMMM d")}
              </div>
              <div className="space-y-2 pl-2 border-l-2 border-yellow-500 dark:border-yellow-600">
                {dateEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    deleteEvent={() => deleteEvent(event.id)}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-3">
            No upcoming events for the next 7 days
          </p>
        )}
      </div>
    </motion.div>
  );
} 