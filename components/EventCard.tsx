import { Trash2 } from "lucide-react";
import { motion } from "framer-motion";

type Event = {
  id: number;
  title: string;
  date: string;
};

type EventCardProps = {
  event: Event;
  deleteEvent: (id: number) => Promise<void>; // ✅ Accepts deleteEvent from Home.tsx
};

export default function EventCard({ event, deleteEvent }: EventCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className="flex justify-between items-center bg-white dark:bg-[#4a3628] dark:text-[#FAF3DD] p-3 rounded-lg shadow-md border border-gray-200 dark:border-[#FAF3DD] transition-all hover:shadow-lg"
    >
      <span className="font-medium text-gray-800 dark:text-[#FAF3DD]">{event.title}</span>

      <button
        onClick={() => deleteEvent(event.id)}
        className="text-red-600 hover:text-red-800 transition-transform transform hover:scale-110 relative group"
      >
        <Trash2 size={18} />

        {/* Tooltip on hover */}
        <span className="absolute top-[-28px] right-0 opacity-0 group-hover:opacity-100 bg-red-600 text-white text-xs px-2 py-1 rounded transition-opacity">
          Delete
        </span>
      </button>
    </motion.div>
  );
}
