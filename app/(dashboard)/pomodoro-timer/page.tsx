"use client";

<<<<<<< HEAD
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import BottomBar from "@/components/BottomBar";
import Sidebar from "@/components/Sidebar";
=======
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import BottomBar from "@/components/BottomBar";
import Sidebar from "@/components/Sidebar";
import { useTimerStore } from "@/store/useTimerStore";
>>>>>>> 990666b (Zustand Added)
import { Pangolin } from "next/font/google";

const pangolin = Pangolin({ weight: "400", subsets: ["latin"], display: "swap" });

<<<<<<< HEAD
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
=======
// Flip card animation
const flipVariants = {
  initial: { rotateX: 0 },
  animate: { rotateX: [-90, 0], transition: { duration: 0.5 } },
};

const PomodoroTimer = () => {
  const {
    timeLeft,
    isRunning,
    isFocusMode,
    focusTime,
    restTime,
    setFocusTime,
    startPauseTimer,
    resetTimer,
    switchMode,
  } = useTimerStore();

  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const chimeRef = useRef<HTMLAudioElement | null>(null);
  const [allowChime, setAllowChime] = useState(false);

  // Handle window resizing
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
>>>>>>> 990666b (Zustand Added)
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

<<<<<<< HEAD
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
=======
  // ⏳ Fix: Decrease timeLeft when timer is running
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        useTimerStore.setState((state) => ({
          timeLeft: state.timeLeft - 1,
        }));
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  // Play chime when timer hits 0
  useEffect(() => {
    if (timeLeft === 0 && allowChime) {
      if (chimeRef.current) {
        chimeRef.current.currentTime = 0;
        chimeRef.current.play().catch((err) => console.error("Chime failed to play:", err));
      }

      setTimeout(() => {
        switchMode();
        setAllowChime(false);
      }, 1000);
    }
  }, [timeLeft, switchMode, allowChime]);

  const handleStartPause = () => {
    if (!isRunning) {
      setAllowChime(true);
    }
    startPauseTimer();
  };

  if (isMobile === null) return null;

  const minutes = Math.floor(timeLeft / 60)
    .toString()
    .padStart(2, "0")
    .split("");
  const seconds = (timeLeft % 60)
    .toString()
    .padStart(2, "0")
    .split("");
>>>>>>> 990666b (Zustand Added)

  return (
    <div
      className={`h-screen flex flex-col items-center justify-center ${pangolin.className} ${
        isMobile ? "px-0 pb-16" : "ml-20 px-0"
      } bg-[#FBF2C0] dark:bg-[#4A3628]`}
    >
      {!isMobile && <Sidebar />}
      {isMobile && <BottomBar />}

<<<<<<< HEAD
      <h1 className="text-2xl font-semibold text-[#4A3628] dark:text-[#FAF3DD] mb-6">
        Pomodoro Timer
      </h1>

      <div className="bg-[#FAF3DD] dark:bg-[#2C2C2C] shadow-lg rounded-xl p-8 w-full max-w-md flex flex-col items-center">
=======
      <audio ref={chimeRef} src="/Chime.mp3" preload="auto" />

      <h1 className="text-4xl font-semibold text-[#4A3628] dark:text-[#FAF3DD] mb-6">
        Pomodoro Timer
      </h1>

      <div className="bg-[#FAF3DD] dark:bg-[#2C2C2C] shadow-lg rounded-xl py-12 px-10 w-full max-w-lg flex flex-col items-center">
>>>>>>> 990666b (Zustand Added)
        <div
          className={`w-full text-center p-6 rounded-lg transition-all ${
            isFocusMode ? "bg-[#F96F5D]" : "bg-[#4CAF50]"
          } text-white dark:text-[#FAF3DD]`}
        >
<<<<<<< HEAD
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
=======
          <h2 className="text-3xl font-semibold">{isFocusMode ? "Focus Mode 🧠" : "Rest Mode ☕"}</h2>
        </div>

        {/* Flip Clock Timer */}
        <div className="flex justify-center space-x-2 my-10">
          {[...minutes, ":", ...seconds].map((char, index) => (
            <div
              key={index}
              className={`relative ${
                char === ":"
                  ? "text-[#F96F5D] text-7xl mx-2"
                  : "w-24 h-32 rounded-lg shadow-lg flex items-center justify-center bg-transparent dark:bg-[#222]"
              }`}
            >
              {char === ":" ? (
                <span className="text-8xl font-bold">{char}</span>
              ) : (
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key={char}
                    className="absolute w-full h-full flex items-center justify-center text-8xl font-bold text-[#4A3628] dark:text-white"
                    variants={flipVariants}
                    initial="initial"
                    animate="animate"
                    exit={{ rotateX: 90, opacity: 0, transition: { duration: 0.3 } }}
                  >
                    {char}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          ))}
        </div>

        <div className="flex space-x-4 mb-6">
          <Button
            onClick={handleStartPause}
            className="px-8 py-4 text-xl font-semibold rounded-full transition-all text-white bg-gradient-to-r from-[#F96F5D] to-[#FF4D4D] hover:scale-105 shadow-md"
>>>>>>> 990666b (Zustand Added)
          >
            {isRunning ? "Pause" : "Start"}
          </Button>
          <Button
<<<<<<< HEAD
            onClick={handleReset}
            className="px-6 py-3 text-lg rounded-xl border-2 border-[#F96F5D] text-[#F96F5D] hover:bg-[#F96F5D] hover:text-white transition-all"
=======
            onClick={resetTimer}
            className="px-8 py-4 text-xl font-semibold rounded-full border-2 border-[#F96F5D] text-[#F96F5D] hover:bg-[#F96F5D] hover:text-white transition-all shadow-md"
>>>>>>> 990666b (Zustand Added)
          >
            Reset
          </Button>
        </div>

<<<<<<< HEAD
        <div className="flex space-x-2">
          {[15, 25, 30, 45].map((min) => (
            <Button
              key={min}
              onClick={() => handleSessionChange(min)}
              className="px-4 py-2 rounded-lg border-2 border-[#F96F5D] text-[#F96F5D] hover:bg-[#F96F5D] hover:text-white transition-all"
=======
        <div className="flex space-x-3">
          {[15, 25, 30, 45].map((min) => (
            <Button
              key={min}
              onClick={() => setFocusTime(min)}
              className="px-5 py-3 rounded-lg border-2 border-[#F96F5D] text-[#F96F5D] hover:bg-[#F96F5D] hover:text-white transition-all shadow-sm"
>>>>>>> 990666b (Zustand Added)
            >
              {min} min
            </Button>
          ))}
        </div>
<<<<<<< HEAD
=======

        <p className="mt-4 text-sm text-[#4A3628] dark:text-[#FAF3DD]">
          Focus Time: {focusTime / 60} min | Rest Time: {restTime / 60} min
        </p>
>>>>>>> 990666b (Zustand Added)
      </div>
    </div>
  );
};

export default PomodoroTimer;
