"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import BottomBar from "@/components/BottomBar";
import Sidebar from "@/components/Sidebar";
import { useTimerStore } from "@/store/useTimerStore";
import { Pangolin } from "next/font/google";
import { toast } from "sonner";

const pangolin = Pangolin({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

// Flip card animation
const flipVariants = {
  initial: { rotateX: 0 },
  animate: { rotateX: [-90, 0], transition: { duration: 0.5 } },
};

// Banner animation
const bannerVariants = {
  focus: {
    backgroundColor: "#F96F5D",
    scale: [1, 1.03, 1],
    transition: { duration: 0.5 },
  },
  rest: {
    backgroundColor: "#4CAF50",
    scale: [1, 1.03, 1],
    transition: { duration: 0.5 },
  },
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
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission | null>(null);
  const [modeChanging, setModeChanging] = useState(false);
  const [completedCycles, setCompletedCycles] = useState(0);

  // Handle window resizing
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Request notification permission
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationPermission(Notification.permission);

      if (
        Notification.permission !== "granted" &&
        Notification.permission !== "denied"
      ) {
        Notification.requestPermission().then((permission) => {
          setNotificationPermission(permission);
        });
      }
    }
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

  // Handle timer completion and mode switching
  useEffect(() => {
    if (timeLeft === 0 && !modeChanging) {
      // Play chime sound
      if (chimeRef.current) {
        chimeRef.current.currentTime = 0;
        chimeRef.current
          .play()
          .catch((err) => console.error("Chime failed to play:", err));
      }

      // Set mode changing to prevent multiple switches
      setModeChanging(true);

      // Update completed cycles counter (only when finishing a focus session)
      if (isFocusMode) {
        setCompletedCycles((prev) => prev + 1);
      }

      // Determine next mode message
      const currentMode = isFocusMode ? "Focus" : "Rest";
      const nextMode = isFocusMode ? "Rest" : "Focus";
      const message = `${currentMode} session completed! Time for ${nextMode} mode.`;

      // Show toast notification
      toast.success(message, { duration: 5000 });

      // Show browser notification
      if (notificationPermission === "granted") {
        new Notification("Pomodoro Timer", {
          body: message,
          icon: "/favicon.ico",
        });
      }

      // Switch mode automatically after animation
      setTimeout(() => {
        switchMode(); // This toggles between focus and rest modes
        setModeChanging(false);
      }, 1000);
    }
  }, [timeLeft, isFocusMode, notificationPermission, switchMode, modeChanging]);

  const handleStartPause = () => {
    if (!isRunning && timeLeft === 0) {
      // If timer is at 0, switch mode first then start
      switchMode();
    }
    startPauseTimer();
  };

  const handleRequestNotifications = () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      Notification.requestPermission().then((permission) => {
        setNotificationPermission(permission);
        if (permission === "granted") {
          toast.success("Notifications enabled for timer completion!");
        }
      });
    }
  };

  if (isMobile === null) return null;

  const minutes = Math.floor(timeLeft / 60)
    .toString()
    .padStart(2, "0")
    .split("");
  const seconds = (timeLeft % 60).toString().padStart(2, "0").split("");

  // Determine action button text based on timer state
  const actionButtonText = isRunning
    ? "Pause"
    : timeLeft === 0
      ? `Start ${isFocusMode ? "Rest" : "Focus"}`
      : "Start";

  return (
    <div
      className={`h-screen flex flex-col items-center justify-center ${pangolin.className} ${
        isMobile ? "px-0 pb-16" : "ml-20 px-0"
      } bg-[#FBF2C0] dark:bg-[#4A3628]`}
    >
      {!isMobile && <Sidebar />}
      <div className="block md:hidden fixed bottom-0 w-full z-50">
        {isMobile && <BottomBar />}
      </div>

      <audio ref={chimeRef} src="/Chime.mp3" preload="auto" />

      <h1 className="text-2xl md:text-4xl font-semibold text-[#4A3628] dark:text-[#FAF3DD] mb-4 md:mb-6">
        Pomodoro Timer
      </h1>

      <div className="bg-[#FAF3DD] dark:bg-[#2C2C2C] shadow-lg rounded-xl py-8 md:py-12 px-6 md:px-10 w-full max-w-lg flex flex-col items-center">
        <motion.div
          className="w-full text-center p-4 md:p-6 rounded-lg text-white dark:text-[#FAF3DD]"
          animate={isFocusMode ? "focus" : "rest"}
          variants={bannerVariants}
          key={isFocusMode ? "focus" : "rest"} // Add key to force animation on mode change
        >
          <h2 className="text-2xl md:text-3xl font-semibold">
            {isFocusMode ? "Focus Mode 🧠" : "Rest Mode ☕"}
          </h2>
          {completedCycles > 0 && (
            <p className="text-sm mt-2 opacity-80">
              {completedCycles} {completedCycles === 1 ? "cycle" : "cycles"}{" "}
              completed
            </p>
          )}
        </motion.div>

        {/* Flip Clock Timer */}
        <div className="flex justify-center space-x-1 md:space-x-2 my-6 md:my-10">
          {[...minutes, ":", ...seconds].map((char, index) => (
            <div
              key={index}
              className={`relative ${
                char === ":"
                  ? "text-[#F96F5D] text-4xl md:text-7xl mx-1 md:mx-2"
                  : "w-16 md:w-24 h-24 md:h-32 rounded-lg shadow-lg flex items-center justify-center bg-transparent dark:bg-[#222]"
              }`}
            >
              {char === ":" ? (
                <span className="text-5xl md:text-8xl font-bold">{char}</span>
              ) : (
                <AnimatePresence mode="popLayout">
                  <motion.div
                    key={char}
                    className="absolute w-full h-full flex items-center justify-center text-5xl md:text-8xl font-bold text-[#4A3628] dark:text-white"
                    variants={flipVariants}
                    initial="initial"
                    animate="animate"
                    exit={{
                      rotateX: 90,
                      opacity: 0,
                      transition: { duration: 0.3 },
                    }}
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
            className="px-6 md:px-8 py-3 md:py-4 text-lg md:text-xl font-semibold rounded-full transition-all text-white bg-gradient-to-r from-[#F96F5D] to-[#FF4D4D] hover:scale-105 shadow-md custom-cursor"
          >
            {actionButtonText}
          </Button>
          <Button
            onClick={resetTimer}
            className="px-6 md:px-8 py-3 md:py-4 text-lg md:text-xl font-semibold rounded-full border-2 border-[#F96F5D] text-[#F96F5D] hover:bg-[#F96F5D] hover:text-white transition-all shadow-md custom-cursor"
          >
            Reset
          </Button>
        </div>

        <div className="flex flex-wrap justify-center gap-2 md:space-x-3">
          {[15, 25, 30, 45].map((min) => (
            <Button
              key={min}
              onClick={() => setFocusTime(min)}
              className="px-3 md:px-5 py-2 md:py-3 text-sm md:text-base rounded-lg border-2 border-[#F96F5D] text-[#F96F5D] hover:bg-[#F96F5D] hover:text-white transition-all shadow-sm custom-cursor"
            >
              {min} min
            </Button>
          ))}
        </div>

        <p className="mt-4 text-sm text-[#4A3628] dark:text-[#FAF3DD]">
          Focus Time: {focusTime / 60} min | Rest Time: {restTime / 60} min
        </p>

        {notificationPermission !== "granted" && (
          <button
            onClick={handleRequestNotifications}
            className="mt-4 text-sm text-[#F96F5D] underline hover:text-[#e85b4b] transition-colors custom-cursor"
          >
            Enable Notifications
          </button>
        )}
      </div>
    </div>
  );
};

export default PomodoroTimer;
