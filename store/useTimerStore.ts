import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface TimerState {
  timeLeft: number;
  isRunning: boolean;
  isFocusMode: boolean;
  focusTime: number;
  restTime: number;
  lastTimestamp: number | null;
  hasHydrated: boolean;
  startPauseTimer: () => void;
  resetTimer: () => void;
  switchMode: () => void;
  setFocusTime: (minutes: number) => void;
  setHasHydrated: (state: boolean) => void;
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => {
      let timerInterval: NodeJS.Timeout | null = null;

      const startTimer = () => {
        if (get().isRunning || !get().hasHydrated) return;

        set({ isRunning: true, lastTimestamp: Date.now() });

        timerInterval = setInterval(() => {
          set((state) => {
            const now = Date.now();
            const elapsed = Math.floor((now - (state.lastTimestamp ?? now)) / 1000);
            const newTimeLeft = state.timeLeft - elapsed;

            if (newTimeLeft <= 0) {
              clearInterval(timerInterval as NodeJS.Timeout);
              return { timeLeft: 0, isRunning: false, lastTimestamp: null };
            }

            return { timeLeft: newTimeLeft, lastTimestamp: now };
          });
        }, 1000);
      };

      return {
        timeLeft: 25 * 60,
        isRunning: false,
        isFocusMode: true,
        focusTime: 25 * 60,
        restTime: Math.floor(25 * 60 * 0.2),
        lastTimestamp: null,
        hasHydrated: false,

        setHasHydrated: (state) => set({ hasHydrated: state }),

        startPauseTimer: () => {
          if (!get().hasHydrated) return;

          if (get().isRunning) {
            clearInterval(timerInterval as NodeJS.Timeout);
            set({ isRunning: false, lastTimestamp: null });
          } else {
            startTimer();
          }
        },

        resetTimer: () => {
          if (!get().hasHydrated) return;
          clearInterval(timerInterval as NodeJS.Timeout);
          set((state) => ({
            timeLeft: state.isFocusMode ? state.focusTime : state.restTime,
            isRunning: false,
            lastTimestamp: null,
          }));
        },

        switchMode: () => {
          if (!get().hasHydrated) return;
          clearInterval(timerInterval as NodeJS.Timeout);
          set((state) => ({
            isFocusMode: !state.isFocusMode,
            timeLeft: state.isFocusMode ? state.restTime : state.focusTime,
            isRunning: false,
            lastTimestamp: null,
          }));
          startTimer(); // Auto-start new session
        },

        setFocusTime: (minutes) => {
          if (!get().hasHydrated) return;
          const focusSeconds = minutes * 60;
          const restSeconds = Math.floor(focusSeconds * 0.2);
          clearInterval(timerInterval as NodeJS.Timeout);
          set({
            focusTime: focusSeconds,
            restTime: restSeconds,
            timeLeft: focusSeconds,
            isRunning: false,
            isFocusMode: true,
            lastTimestamp: null,
          });
        },
      };
    },
    {
      name: "pomodoro-timer-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
          if (state.isRunning) {
            state.startPauseTimer(); // Resume the timer after hydration
          }
        }
      },
    }
  )
);
