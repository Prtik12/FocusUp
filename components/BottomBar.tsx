"use client";

import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { FiUser, FiHome, FiSun, FiMoon, FiLogOut } from "react-icons/fi";
import { BsJournalBookmark, BsClock, BsSticky } from "react-icons/bs";
import { useTheme } from "@/providers/ThemeProviders";

const bottomBarItems = [
  { icon: FiHome, label: "Home", path: "/home" },
  { icon: BsJournalBookmark, label: "Study", path: "/study-planner" },
  { icon: BsClock, label: "Timer", path: "/pomodoro-timer" },
  { icon: BsSticky, label: "Notes", path: "/notes" },
];

export default function BottomBar() {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: "/signin" });
  };

  return (
    <div className="fixed bottom-0 left-0 w-full bg-[#FBF2C0] dark:bg-[#4A3628] text-[#4A3628] dark:text-[#FAF3DD] shadow-lg p-2 flex justify-around items-center border-t border-[#4A3628] dark:border-[#FAF3DD]">
      {bottomBarItems.map(({ icon: Icon, label, path }) => (
        <button
          key={path}
          onClick={() => router.push(path)}
          className={`flex flex-col items-center p-2 transition duration-300 ${
            pathname === path ? "text-[#F96F5D]" : "hover:text-[#F96F5D]"
          }`}
        >
          <Icon size={24} />
          <span className="text-xs">{label}</span>
        </button>
      ))}

      {/* Theme Toggle */}
      <button onClick={toggleTheme} className="flex flex-col items-center p-2 hover:text-[#F96F5D]">
        {theme === "dark" ? <FiSun size={24} /> : <FiMoon size={24} />}
        <span className="text-xs">Theme</span>
      </button>

      {/* Profile */}
      <button onClick={() => router.push("/profile")} className="flex flex-col items-center p-2 hover:text-[#F96F5D]">
        <FiUser size={24} />
        <span className="text-xs">Profile</span>
      </button>

      {/* Logout */}
      <button onClick={handleSignOut} className="flex flex-col items-center p-2 hover:text-[#F96F5D]">
        <FiLogOut size={24} />
        <span className="text-xs">Logout</span>
      </button>
    </div>
  );
}
