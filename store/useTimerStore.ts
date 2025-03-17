import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TimerState {
  timeLeft: number;
  isRunning: boolean;
  isFocusMode: boolean;
  focusTime: number;
  restTime: number;
  startPauseTimer: () => void;
  resetTimer: () => void;
  switchMode: () => void;
  setFocusTime: (minutes: number) => void;
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set) => ({
      timeLeft: 25 * 60, // Default: 25 min
      isRunning: false,
      isFocusMode: true,
      focusTime: 25 * 60,
      restTime: Math.floor(25 * 60 * 0.2), // 20% of focus time

      startPauseTimer: () => {
        set((state) => ({ isRunning: !state.isRunning }));
      },

      resetTimer: () => {
        set((state) => ({
          timeLeft: state.isFocusMode ? state.focusTime : state.restTime,
          isRunning: false,
        }));
      },

      switchMode: () => {
        set((state) => ({
          isFocusMode: !state.isFocusMode,
          timeLeft: state.isFocusMode ? state.restTime : state.focusTime,
          isRunning: true, // Ensure it continues running
        }));
      },      

      setFocusTime: (minutes) => {
        const focusSeconds = minutes * 60;
        const restSeconds = Math.floor(focusSeconds * 0.2); // 20% of focus time

        set({
          focusTime: focusSeconds,
          restTime: restSeconds,
          timeLeft: focusSeconds,
          isRunning: false,
        });
      },
    }),
    {
      name: "pomodoro-timer-storage",
    }
  )
);
