import { Dispatch, SetStateAction, useEffect, useRef } from "react";
import ReactCalendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useTheme } from "next-themes";

type CalendarProps = {
  selectedDate: Date | null;
  setSelectedDate: Dispatch<SetStateAction<Date | null>>;
  events: { date: string }[]; // List of event dates
};

export default function Calendar({ selectedDate, setSelectedDate, events }: CalendarProps) {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  const calendarRef = useRef<HTMLDivElement>(null);

  // Effect to reset selectedDate when clicking outside the calendar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setSelectedDate(null); // Reset selected date
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setSelectedDate]);

  return (
    <div
      ref={calendarRef}
      className={`p-4 rounded-lg shadow-lg transition-all w-[300px] h-[330px] ${
        isDarkMode ? "bg-[#4a3628] text-[#FAF3DD]" : "bg-white text-[#4A3628]"
      }`}
    >
      <ReactCalendar
        onChange={(value) => setSelectedDate(value as Date)}
        value={selectedDate}
        className="custom-calendar w-full h-full"
        tileClassName={({ date, view }) => {
          const today = new Date();
          let className = "custom-cursor text-[#4A3628] dark:text-[#FAF3DD]"; // ✅ Uniform date colors

          if (view === "month" && date.toDateString() === today.toDateString()) {
            className += " today-highlight font-bold bg-[#F96F5D] text-white rounded-full"; // ✅ Current date styling
          }

          return className;
        }}
        tileContent={({ date, view }) => {
          if (view === "month") {
            const hasEvent = events.some((event) => new Date(event.date).toDateString() === date.toDateString());
            return hasEvent ? <div className="w-2 h-2 bg-red-500 rounded-full mx-auto mt-1"></div> : null;
          }
          return null;
        }}
      />
    </div>
  );
}
