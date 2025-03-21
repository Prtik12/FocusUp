import { Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

type Event = {
  id: number;
  title: string;
  date: string;
};

type EventCardProps = {
  event: Event;
  deleteEvent: (id: number) => Promise<void>;
};

export default function EventCard({ event, deleteEvent }: EventCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    await deleteEvent(event.id);
    setIsDeleting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className="event-card flex justify-between items-center bg-white/80 dark:bg-[#4a3628]/80 dark:text-[#FAF3DD] p-3.5 rounded-lg shadow-md border border-gray-200/50 dark:border-[#FAF3DD]/20 transition-all hover:shadow-lg backdrop-blur-sm"
    >
      <span className="font-medium text-gray-800 dark:text-[#FAF3DD] truncate pr-2">
        {event.title}
      </span>

      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className={`text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-all p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 ${
          isDeleting ? "opacity-50 cursor-not-allowed" : ""
        }`}
        aria-label="Delete event"
      >
        <Trash2 size={18} />
      </button>
    </motion.div>
  );
}
