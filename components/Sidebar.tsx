"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiHome, FiSun, FiMoon, FiLogOut } from "react-icons/fi";
import { BsJournalBookmark, BsClock, BsSticky } from "react-icons/bs";
import Image from "next/image";
import { useTheme } from "@/providers/ThemeProviders";

const sidebarItems = [
  { icon: FiHome, label: "Home", path: "/home" },
  { icon: BsJournalBookmark, label: "Study Planner", path: "/study-planner" },
  { icon: BsClock, label: "Pomodoro Timer", path: "/pomodoro-timer" },
  { icon: BsSticky, label: "Notes", path: "/notes" },
];

export default function Sidebar() {
  const { data: session, status, update } = useSession();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMobile(window.innerWidth < 768);
      const handleResize = () => setIsMobile(window.innerWidth < 768);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  useEffect(() => {
    if (status !== "loading" && !session) {
      router.push("/signin");
    }
  }, [session, status, router]);

  // Re-fetch session to get the latest user data after profile update
  useEffect(() => {
    update(); // Fetch new session data when sidebar mounts
  }, []);

  if (status === "loading") {
    return <div className="h-screen w-20 bg-[#FBF2C0] dark:bg-[#4A3628] animate-pulse"></div>;
  }

  const userName = session?.user?.name ?? "User";
  const userImage = session?.user?.image ?? "/avatar-placeholder.png";

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: "/signin" });
  };

  return (
    <motion.div
      initial={{ width: 85 }}
      animate={{ width: isExpanded ? 240 : 85 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="h-screen border-r border-[#4A3628] dark:border-[#FAF3DD] bg-[#FBF2C0] text-[#4A3628] dark:bg-[#4A3628] dark:text-[#FAF3DD]
                 p-4 flex flex-col fixed left-0 top-0 z-50"
      onMouseEnter={() => !isMobile && setIsExpanded(true)}
      onMouseLeave={() => !isMobile && setIsExpanded(false)}
    >
      {/* Profile Section */}
      <div className="flex items-center w-full mb-5">
        <Image src={userImage} alt="Profile" width={48} height={48} className="rounded-full shrink-0" />
        <AnimatePresence>
          {isExpanded && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              className="text-lg font-semibold ml-3 whitespace-nowrap overflow-hidden text-ellipsis"
            >
              {userName}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Edit Profile */}
      <div
        onClick={() => router.push("/profile")}
        className="w-full flex items-center p-3 mb-5 rounded-lg transition duration-300 
                  hover:bg-[#E2C799] dark:hover:bg-[#5A4532] cursor-pointer"
      >
        <FiUser size={28} className="shrink-0" />
        <AnimatePresence>
          {isExpanded && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              className="text-md ml-3 whitespace-nowrap"
            >
              Edit Profile
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="w-full flex flex-col space-y-2">
        {sidebarItems.map(({ icon: Icon, label, path }) => (
          <div
            key={path}
            onClick={() => router.push(path)}
            className={`flex items-center p-3 rounded-lg transition duration-300 cursor-pointer
                       ${
                         pathname === path
                           ? "bg-[#F96F5D] text-white"
                           : "hover:bg-[#E2C799] dark:hover:bg-[#5A4532] text-[#4A3628] dark:text-[#FAF3DD]"
                       }`}
          >
            <Icon size={28} className="shrink-0" />
            <AnimatePresence>
              {isExpanded && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                  className="text-md ml-3 whitespace-nowrap"
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        ))}
      </nav>

      {/* Footer Actions */}
      <div className="mt-auto w-full space-y-2">
        {/* Theme Toggle */}
        <div
          className="w-full flex items-center p-3 rounded-lg transition duration-300 cursor-pointer
                    hover:bg-[#E2C799] dark:hover:bg-[#5A4532]"
          onClick={toggleTheme}
        >
          {theme === "dark" ? <FiSun size={28} /> : <FiMoon size={28} />}
          <AnimatePresence>
            {isExpanded && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2, delay: 0.1 }}
                className="text-md ml-3 whitespace-nowrap"
              >
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Sign Out */}
        <div
          className="w-full flex items-center p-3 rounded-lg transition duration-300 cursor-pointer
                    hover:bg-[#E2C799] dark:hover:bg-[#5A4532]"
          onClick={handleSignOut}
        >
          <FiLogOut size={28} className="shrink-0" />
          <AnimatePresence>
            {isExpanded && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2, delay: 0.1 }}
                className="text-md ml-3 whitespace-nowrap"
              >
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
