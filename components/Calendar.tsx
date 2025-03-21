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

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

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
          
          const hasEvent = events.some(
            (event) => new Date(event.date).toDateString() === date.toDateString()
          );
          
          if (hasEvent) {
            className += " calendar-day-with-events";
          }
          
          if (date.toDateString() === today.toDateString()) {
            className += " today-highlight";
          }
          
          return className;
        }}
      />
    </div>
  );
}
