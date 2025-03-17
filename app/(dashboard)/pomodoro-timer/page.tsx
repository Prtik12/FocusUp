"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import BottomBar from "@/components/BottomBar";
import Sidebar from "@/components/Sidebar";
import { useTimerStore } from "@/store/useTimerStore";
import { Pangolin } from "next/font/google";

const pangolin = Pangolin({ weight: "400", subsets: ["latin"], display: "swap" });

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
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  return (
    <div
      className={`h-screen flex flex-col items-center justify-center ${pangolin.className} ${
        isMobile ? "px-0 pb-16" : "ml-20 px-0"
      } bg-[#FBF2C0] dark:bg-[#4A3628]`}
    >
      {!isMobile && <Sidebar />}
      {isMobile && <BottomBar />}

      <audio ref={chimeRef} src="/Chime.mp3" preload="auto" />

      <h1 className="text-4xl font-semibold text-[#4A3628] dark:text-[#FAF3DD] mb-6">
        Pomodoro Timer
      </h1>

      <div className="bg-[#FAF3DD] dark:bg-[#2C2C2C] shadow-lg rounded-xl py-12 px-10 w-full max-w-lg flex flex-col items-center">
        <div
          className={`w-full text-center p-6 rounded-lg transition-all ${
            isFocusMode ? "bg-[#F96F5D]" : "bg-[#4CAF50]"
          } text-white dark:text-[#FAF3DD]`}
        >
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
          >
            {isRunning ? "Pause" : "Start"}
          </Button>
          <Button
            onClick={resetTimer}
            className="px-8 py-4 text-xl font-semibold rounded-full border-2 border-[#F96F5D] text-[#F96F5D] hover:bg-[#F96F5D] hover:text-white transition-all shadow-md"
          >
            Reset
          </Button>
        </div>

        <div className="flex space-x-3">
          {[15, 25, 30, 45].map((min) => (
            <Button
              key={min}
              onClick={() => setFocusTime(min)}
              className="px-5 py-3 rounded-lg border-2 border-[#F96F5D] text-[#F96F5D] hover:bg-[#F96F5D] hover:text-white transition-all shadow-sm"
            >
              {min} min
            </Button>
          ))}
        </div>

        <p className="mt-4 text-sm text-[#4A3628] dark:text-[#FAF3DD]">
          Focus Time: {focusTime / 60} min | Rest Time: {restTime / 60} min
        </p>
      </div>
    </div>
  );
};

export default PomodoroTimer;
