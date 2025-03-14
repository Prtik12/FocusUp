"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import BottomBar from "@/components/BottomBar";
import Sidebar from "@/components/Sidebar";
import { Pangolin } from "next/font/google";

const pangolin = Pangolin({ weight: "400", subsets: ["latin"], display: "swap" });

const REST_TIMES: Record<number, number> = {
  15: 3 * 60,
  25: 5 * 60,
  30: 6 * 60,
  45: 9 * 60,
};

const PomodoroTimer = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [focusTime, setFocusTime] = useState(25 * 60);
  const [restTime, setRestTime] = useState(REST_TIMES[25]);
  const [timeLeft, setTimeLeft] = useState(focusTime);
  const [isRunning, setIsRunning] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(true);
  const [startTime, setStartTime] = useState<number | null>(null);

  // ✅ Handle screen resizing for mobile layout
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Restore timer state after page navigation
  useEffect(() => {
    const savedState = localStorage.getItem("pomodoroState");
    if (savedState) {
      const { timeLeft, isRunning, isFocusMode, focusTime, restTime, startTime } = JSON.parse(savedState);

      const now = Date.now();
      let updatedTimeLeft = timeLeft;

      // ⏳ If timer was running, calculate elapsed time and adjust `timeLeft`
      if (isRunning && startTime) {
        const elapsed = Math.floor((now - startTime) / 1000);
        updatedTimeLeft = Math.max(timeLeft - elapsed, 0);
      }

      setFocusTime(focusTime);
      setRestTime(restTime);
      setTimeLeft(updatedTimeLeft);
      setIsFocusMode(isFocusMode);
      setIsRunning(isRunning && updatedTimeLeft > 0);
      setStartTime(isRunning ? now - updatedTimeLeft * 1000 : null);
    }
  }, []);

  // ✅ Save state to `localStorage` to persist across navigation
  useEffect(() => {
    localStorage.setItem(
      "pomodoroState",
      JSON.stringify({
        timeLeft,
        isRunning,
        isFocusMode,
        focusTime,
        restTime,
        startTime: isRunning ? startTime : null,
      })
    );
  }, [timeLeft, isRunning, isFocusMode, focusTime, restTime, startTime]);

  // ✅ Timer logic (runs in the background)
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => Math.max(prev - 1, 0));
      }, 1000);
    } else if (timeLeft === 0) {
      playSound();
      if (isFocusMode) {
        setIsFocusMode(false);
        setTimeLeft(restTime);
        setStartTime(Date.now());
        setIsRunning(true);
      } else {
        setIsFocusMode(true);
        setTimeLeft(focusTime);
        setIsRunning(false);
      }
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, timeLeft, isFocusMode, focusTime, restTime]);

  // ✅ Play sound when timer ends
  const playSound = () => {
    const audio = new Audio("/Chime.mp3");
    audio.play().catch((error) => console.error("Error playing sound:", error));
  };

  // ✅ Start/Pause Button
  const handleStartStop = () => {
    setIsRunning((prev) => {
      const newRunningState = !prev;
      if (newRunningState) {
        setStartTime(Date.now());
      }
      return newRunningState;
    });
  };

  // ✅ Reset Button
  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(isFocusMode ? focusTime : restTime);
    setStartTime(null);
  };

  // ✅ Change Focus Session Time
  const handleSessionChange = (minutes: number) => {
    const newFocusTime = minutes * 60;
    const newRestTime = REST_TIMES[minutes] || 5 * 60;
    setFocusTime(newFocusTime);
    setRestTime(newRestTime);
    setTimeLeft(newFocusTime);
    setIsFocusMode(true);
    setIsRunning(false);
    setStartTime(null);
  };

  return (
    <div
      className={`h-screen flex flex-col items-center justify-center ${pangolin.className} ${
        isMobile ? "px-0 pb-16" : "ml-20 px-0"
      } bg-[#FBF2C0] dark:bg-[#4A3628]`}
    >
      {!isMobile && <Sidebar />}
      {isMobile && <BottomBar />}

      <h1 className="text-2xl font-semibold text-[#4A3628] dark:text-[#FAF3DD] mb-6">
        Pomodoro Timer
      </h1>

      <div className="bg-[#FAF3DD] dark:bg-[#2C2C2C] shadow-lg rounded-xl p-8 w-full max-w-md flex flex-col items-center">
        <div
          className={`w-full text-center p-6 rounded-lg transition-all ${
            isFocusMode ? "bg-[#F96F5D]" : "bg-[#4CAF50]"
          } text-white dark:text-[#FAF3DD]`}
        >
          <h2 className="text-2xl font-semibold">{isFocusMode ? "Focus Mode 🧠" : "Rest Mode ☕"}</h2>
        </div>

        <motion.div
          className="text-6xl font-bold text-[#4A3628] dark:text-[#FAF3DD] my-6"
          animate={{ scale: isRunning ? 1.1 : 1 }}
          transition={{ duration: 0.3 }}
        >
          {timeLeft > 0
            ? `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, "0")}`
            : "00:00"}
        </motion.div>

        <div className="flex space-x-4 mb-4">
          <Button
            onClick={handleStartStop}
            className="px-6 py-3 text-lg rounded-xl bg-[#F96F5D] text-white hover:brightness-110 transition-all"
          >
            {isRunning ? "Pause" : "Start"}
          </Button>
          <Button
            onClick={handleReset}
            className="px-6 py-3 text-lg rounded-xl border-2 border-[#F96F5D] text-[#F96F5D] hover:bg-[#F96F5D] hover:text-white transition-all"
          >
            Reset
          </Button>
        </div>

        <div className="flex space-x-2">
          {[15, 25, 30, 45].map((min) => (
            <Button
              key={min}
              onClick={() => handleSessionChange(min)}
              className="px-4 py-2 rounded-lg border-2 border-[#F96F5D] text-[#F96F5D] hover:bg-[#F96F5D] hover:text-white transition-all"
            >
              {min} min
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PomodoroTimer;
