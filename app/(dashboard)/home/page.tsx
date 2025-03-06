"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Pangolin } from "next/font/google";
import "@/styles/calendar.css";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { v4 as uuidv4 } from "uuid";

const pangolin = Pangolin({ weight: "400", subsets: ["latin"], display: "swap" });

export default function Home() {
  const [date, setDate] = useState<Date | null>(null);
  const [quote, setQuote] = useState<string | null>(null);
  const [tasks, setTasks] = useState<{ id: string; text: string; completed: boolean }[]>([]);
  const [taskInput, setTaskInput] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();

  useEffect(() => {
    setDate(new Date());

    fetch("https://api.quotable.io/random")
      .then((res) => res.json())
      .then((data) => setQuote(data.content))
      .catch(() => setQuote("Stay focused and keep pushing forward!"));

    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) setTasks(JSON.parse(savedTasks));
  }, []);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (taskInput.trim() !== "") {
      setTasks([...tasks, { id: uuidv4(), text: taskInput, completed: false }]);
      setTaskInput("");
    }
  };

  const toggleTaskCompletion = (taskId: string) => {
    setTasks(tasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));

    // Show confetti when a task is marked as completed
    const task = tasks.find(t => t.id === taskId);
    if (task && !task.completed) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 9000);
    }
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const deleteAllTasks = () => {
    setTasks([]);
  };

  const completeAllTasks = () => {
    setTasks(tasks.map(task => ({ ...task, completed: true })));
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 9000);
  };

  return (
    <div className={`flex min-h-screen bg-[#FBF2C0] dark:bg-[#4a3628] text-[#4A3628] dark:text-[#FAF3DD] ${pangolin.className}`}>
      <Sidebar />
      <div className="ml-[90px] p-8 w-full flex flex-col">
        {showConfetti && <Confetti width={width} height={height} numberOfPieces={300} recycle={false} />}

        {/* ✅ Flex Container for Welcome Message and Calendar */}
        <div className="flex justify-between items-start w-full">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-4 text-[#4A3628] dark:text-[#FAF3DD]">Welcome!</h1>
            <p className="text-lg italic mb-6 text-[#48392A] dark:text-[#FAF3DD]">{quote || "Loading..."}</p>
          </div>

          {/* ✅ Calendar Positioned Beside Welcome Message */}
          <div className="bg-[#FAF3DD] dark:bg-[#48392A] rounded-lg shadow-lg p-2">
            {date && <Calendar onChange={(value) => value && setDate(value as Date)} value={date} className="custom-calendar" />}
          </div>
        </div>

        {/* ✅ Task Completion Section */}
        <div className="mt-6 p-4 bg-[#FAF3DD] dark:bg-[#48392A] rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-3">Task Completion</h2>

          {/* ✅ Input & Add Button */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              className="flex-grow p-2 border rounded-lg bg-[#FAF3DD] text-[#4A3628] dark:bg-[#48392A] dark:text-[#FAF3DD] focus:outline-none focus:ring-2 focus:ring-[#F96F5D]"
              placeholder="Enter a new task..."
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()} // ✅ Add task when Enter is pressed
            />
            <button onClick={addTask} className="px-4 py-2 bg-[#F96F5D] text-white rounded-lg font-semibold">Add</button>
          </div>

          {/* ✅ Task List */}
          <ul>
            {tasks.map((task) => (
              <li key={task.id} className="flex justify-between items-center p-2 bg-[#FAF3DD] dark:bg-[#5A4532] rounded-lg mb-2">
                <span className={`flex-grow ${task.completed ? "line-through text-gray-500" : ""}`}>
                  {task.text}
                </span>
                <button onClick={() => toggleTaskCompletion(task.id)} className="px-2 py-1 bg-green-500 text-white rounded-lg text-sm">
                  {task.completed ? "Undo" : "Complete"}
                </button>
                <button onClick={() => deleteTask(task.id)} className="ml-2 px-2 py-1 bg-red-500 text-white rounded-lg text-sm">Delete</button>
              </li>
            ))}
          </ul>

          {/* ✅ Delete All & Complete All Buttons Positioned to the Right */}
          {tasks.length > 0 && (
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={deleteAllTasks} className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold">
                Delete All Tasks
              </button>
              <button onClick={completeAllTasks} className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold">
                Complete All Tasks
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
