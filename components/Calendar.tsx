import { useEffect, useRef } from "react";
import ReactCalendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

type CalendarProps = {
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  events: { date: string }[];
  disableOutsideClickReset?: boolean;
  eventListRef?: React.RefObject<HTMLDivElement>;
};

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];

// Helper function to ensure dates are compared in local timezone
const areDatesEqual = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

// Helper to convert ISO string to local date without timezone issues
const parseLocalDate = (dateString: string): Date => {
  // For ISO strings from DB, convert to local date properly
  const date = new Date(dateString);
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    0, 0, 0
  );
};

export default function Calendar({
  selectedDate,
  setSelectedDate,
  events,
  disableOutsideClickReset = false,
  eventListRef,
}: CalendarProps) {
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (disableOutsideClickReset) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        (calendarRef.current && calendarRef.current.contains(target)) ||
        (eventListRef?.current && eventListRef.current.contains(target))
      ) {
        return;
      }

      setSelectedDate(null);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setSelectedDate, disableOutsideClickReset, eventListRef]);

  return (
    <div ref={calendarRef} className="custom-calendar w-full">
      <ReactCalendar
        onChange={(value) => setSelectedDate(value as Date)}
        value={selectedDate}
        className="custom-calendar w-full"
        calendarType="gregory"
        formatShortWeekday={(_, date) => DAYS[date.getDay()]}
        showFixedNumberOfWeeks={true}
        showNeighboringMonth={true}
        locale="en-US"
        tileClassName={({ date, view }) => {
          if (view !== "month") return "";

          const today = new Date();
          let className = "custom-cursor";

          // Check for events in local timezone
          const hasEvent = events.some((event) => {
            const eventDate = parseLocalDate(event.date);
            return areDatesEqual(eventDate, date);
          });

          if (hasEvent) {
            className += " calendar-day-with-events";
          }

          // Compare today's date in local timezone
          if (areDatesEqual(date, today)) {
            className += " today-highlight";
          }

          return className;
        }}
      />
    </div>
  );
}
