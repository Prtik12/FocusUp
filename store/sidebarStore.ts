import { create } from "zustand";
import { persist } from "zustand/middleware";

type SidebarState = {
  isExpanded: boolean;
  isMobile: boolean;
  isHovered: boolean;
  setExpanded: (isExpanded: boolean) => void;
  setMobile: (isMobile: boolean) => void;
  setHovered: (isHovered: boolean) => void;
  reset: () => void;
};

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isExpanded: false,
      isMobile: false,
      isHovered: false,

      setExpanded: (isExpanded: boolean) => set({ isExpanded }),

      setMobile: (isMobile: boolean) => set({ isMobile }),

      setHovered: (isHovered: boolean) =>
        set((state) => {
          // When hovered, always expand. When not hovered, collapse only if previously hovered
          return {
            isHovered,
            isExpanded: isHovered
              ? true
              : !state.isHovered
                ? state.isExpanded
                : false,
          };
        }),

      reset: () =>
        set({
          isExpanded: false,
          isHovered: false,
        }),
    }),
    {
      name: "sidebar-storage",
      partialize: (state) => ({
        isMobile: state.isMobile,
      }),
    },
  ),
);
