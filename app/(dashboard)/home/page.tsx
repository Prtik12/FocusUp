"use client";

import { useEffect, useState } from "react";
import BottomBar from "@/components/BottomBar";
import Sidebar from "@/components/Sidebar";
import { useSession } from "next-auth/react";
import React from "react";
import { Pangolin } from "next/font/google";
import { motion } from "framer-motion";
import { Trash2, CheckCircle, CalendarPlus } from "lucide-react";
import Calendar from "@/components/Calendar";

const pangolin = Pangolin({ weight: "400", subsets: ["latin"], display: "swap" });

export default function Home() {
  const { data: session } = useSession();
  const userName = session?.user?.name ?? "User";

  const [isMobile, setIsMobile] = useState(false);
  const [quote] = useState("&ldquo;Your only limit is your mind.&rdquo;");
  
  const [tasks, setTasks] = useState([
    { id: 1, title: "Complete FocusUp UI", completed: false },
    { id: 2, title: "Study React Animations", completed: true },
  ]);

  const [events, setEvents] = useState([
    { id: 1, title: "Project Deadline", date: "2025-03-21" },
    { id: 2, title: "Team Meeting", date: "2025-03-25" },
  ]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const addTask = (title: string) => {
    if (title) {
      setTasks([...tasks, { id: tasks.length + 1, title, completed: false }]);
    }
  };

  const toggleTaskCompletion = (taskId: number) => {
    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)));
  };

  const deleteTask = (taskId: number) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const addEvent = (title: string, date: string) => {
    if (title && date) {
      setEvents([...events, { id: events.length + 1, title, date }]);
    }
  };

  return (
    <div className={`h-full min-h-screen relative ${pangolin.className} ${isMobile ? "px-0 pb-16" : "ml-20 px-6"}`}>
      {!isMobile && <Sidebar />}
      {isMobile && <BottomBar />}

      <motion.div
        className="absolute top-5 left-6 text-2xl font-semibold text-[#4A3628] dark:text-[#FAF3DD]"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Welcome, {userName}! 👋
      </motion.div>

      <div className="pt-16 bg-[#FBF2C0] dark:bg-[#4A3628] min-h-screen p-6 rounded-xl shadow-md">
        <motion.div
          className="text-xl italic text-[#4A3628] dark:text-[#FAF3DD] mb-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          dangerouslySetInnerHTML={{ __html: quote }}
        />

        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold text-[#4A3628] dark:text-[#FAF3DD] mb-4">✅ Task List</h2>
          <input
            type="text"
            placeholder="Add a new task..."
            className="w-full p-2 mb-4 border rounded"
            onKeyDown={(e) => e.key === "Enter" && addTask(e.currentTarget.value)}
          />
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              className={`p-4 flex justify-between items-center rounded-lg shadow-sm border ${task.completed ? "bg-green-500 text-white" : "bg-[#FAF3DD] text-[#4A3628] dark:bg-[#5B4339] dark:text-[#FAF3DD]"}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className={`cursor-pointer text-lg ${task.completed ? "line-through opacity-60" : ""}`} onClick={() => toggleTaskCompletion(task.id)}>
                {task.title}
              </span>
              <div className="flex space-x-3">
                <button onClick={() => toggleTaskCompletion(task.id)} className="text-green-700 dark:text-green-400 hover:text-green-900 dark:hover:text-green-200 transition">
                  <CheckCircle size={22} />
                </button>
                <button onClick={() => deleteTask(task.id)} className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 transition">
                  <Trash2 size={22} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-[#4A3628] dark:text-[#FAF3DD] mb-4">📅 Upcoming Events</h2>
          <button className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2 mb-4">
            <CalendarPlus size={20} /> Add Event
          </button>
          <Calendar events={events} />
        </div>
      </div>
    </div>
  );
}
