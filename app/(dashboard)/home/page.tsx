"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Pangolin } from "next/font/google";
import "@/styles/calendar.css";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

const pangolin = Pangolin({ weight: "400", subsets: ["latin"], display: "swap" });

export default function Home() {
  const [date, setDate] = useState<Date | null>(null);
  const [quote, setQuote] = useState<string | null>(null);
  const [dailyGoal, setDailyGoal] = useState("");
  const [goalCompleted, setGoalCompleted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();

  useEffect(() => {
    setDate(new Date());

    fetch("https://api.quotable.io/random")
      .then((res) => res.json())
      .then((data) => setQuote(data.content))
      .catch(() => setQuote("Stay focused and keep pushing forward!"));

    const savedGoal = localStorage.getItem("dailyGoal");
    if (savedGoal) setDailyGoal(savedGoal);
  }, []);

  const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDailyGoal(e.target.value);
    localStorage.setItem("dailyGoal", e.target.value);
  };

  const completeGoal = () => {
    setGoalCompleted(true);
    setShowConfetti(true);

    setTimeout(() => {
      setGoalCompleted(true);
      setShowConfetti(false);
    }, 10000);
  };

  return (
    <div className={`flex min-h-screen bg-[#FBF2C0] dark:bg-[#4a3628] text-[#4A3628] dark:text-[#FAF3DD] ${pangolin.className}`}>
      <Sidebar />
      <div className="ml-[90px] p-8 w-full">
        {showConfetti && <Confetti width={width} height={height} numberOfPieces={300} recycle={false} />}

        <h1 className="text-4xl font-bold mb-4 text-[#4A3628] dark:text-[#FAF3DD]">Welcome!</h1>
        <p className="text-lg italic mb-6 text-[#48392A] dark:text-[#FAF3DD]">{quote || "Loading..."}</p>

        <div className="mb-6">
          <label className="block text-lg font-semibold">Today&apos;s Focus Goal:</label>
          <input
            type="text"
            className="w-full p-3 mt-2 border rounded-lg bg-[#FAF3DD] text-[#4A3628] dark:bg-[#48392A] dark:text-[#FAF3DD] focus:outline-none focus:ring-2 focus:ring-[#F96F5D]"
            placeholder="Enter your goal..."
            value={dailyGoal}
            onChange={handleGoalChange}
          />
          <button
            onClick={completeGoal}
            className={`mt-4 px-4 py-2 rounded-lg font-semibold transition-all ${goalCompleted ? "bg-green-500 text-white scale-105" : "bg-[#F96F5D] text-white"}`}
          >
            {goalCompleted ? "🎉 Goal Achieved!" : "Mark as Completed"}
          </button>
        </div>

        <div className="p-6 bg-[#FAF3DD] dark:bg-[#48392A] rounded-lg shadow w-full max-w-lg mt-6">
          {date && <Calendar onChange={(value) => value && setDate(value as Date)} value={date} className="custom-calendar" />}
        </div>
      </div>
    </div>
  );
}
