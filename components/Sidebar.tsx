"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiHome, FiSun, FiMoon, FiLogOut } from "react-icons/fi";
import { BsJournalBookmark, BsClock, BsSticky } from "react-icons/bs";
import Image from "next/image";
import { useTheme } from "@/providers/ThemeProviders";
import { useSidebarStore } from "@/store/sidebarStore";

const sidebarItems = [
  { icon: FiHome, label: "Home", path: "/home" },
  { icon: BsJournalBookmark, label: "Study Planner", path: "/study-planner" },
  { icon: BsClock, label: "Pomodoro Timer", path: "/pomodoro-timer" },
  { icon: BsSticky, label: "Notes", path: "/notes" },
];

export default function Sidebar() {
  const { data: session, status } = useSession();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  const {
    isExpanded,
    isMobile,
    setMobile,
    setHovered,
    reset
  } = useSidebarStore();

  const [userName, setUserName] = useState("User");
  const [userImage, setUserImage] = useState("/avatar-placeholder.png");

  // Reset sidebar state on unmount
  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  useEffect(() => {
    if (session?.user) {
      setUserName(session.user.name || "User");
      setUserImage(session.user.image || "/avatar-placeholder.png");
    }
  }, [session?.user]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleResize = () => setMobile(window.innerWidth < 768);
      handleResize();
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [setMobile]);

  useEffect(() => {
    if (status !== "loading" && !session) {
      router.push("/signin");
    }
  }, [session, status, router]);

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: "/signin" });
  };

  // Simplified mouse handlers
  const handleMouseEnter = useCallback(() => {
    if (!isMobile) {
      setHovered(true);
    }
  }, [isMobile, setHovered]);

  const handleMouseLeave = useCallback(() => {
    if (!isMobile) {
      setHovered(false);
    }
  }, [isMobile, setHovered]);

  // Simplified item click handler
  const handleItemClick = useCallback((path: string) => {    
    if (isMobile) {
      // Only collapse on mobile after navigation
      setTimeout(() => {
        setHovered(false);
      }, 300);
    }
    
    router.push(path);
  }, [isMobile, router, setHovered]);

  const handleClickWithPrevent = useCallback((e: React.MouseEvent, path: string) => {
    e.preventDefault();
    handleItemClick(path);
  }, [handleItemClick]);

  return (
    <motion.div
      initial={{ width: 85 }}
      animate={{ 
        width: isExpanded ? 240 : 85,
        transition: { 
          duration: 0.3, 
          ease: "easeInOut",
          type: "tween"
        }
      }}
      className="h-screen border-r border-[#4A3628] dark:border-[#FAF3DD] bg-[#FBF2C0] text-[#4A3628] dark:bg-[#4A3628] dark:text-[#FAF3DD]
                 p-4 flex flex-col fixed left-0 top-0 z-50 overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={() => isMobile && setHovered(true)}
      onTouchEnd={() => isMobile && setHovered(false)}
    >
      {/* Profile Section */}
      <div className="flex items-center w-full mb-5 min-w-[240px]">
        <div className="shrink-0">
          <Image
            src={userImage || "/avatar-placeholder.png"}
            alt="Profile"
            width={48}
            height={48}
            className="rounded-full object-cover w-12 h-12"
            priority
          />
        </div>

        <AnimatePresence mode="wait">
          {isExpanded && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="text-lg font-semibold ml-3 whitespace-nowrap overflow-hidden text-ellipsis"
            >
              {userName}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Edit Profile */}
      <div
        onClick={(e) => handleClickWithPrevent(e, "/profile")}
        className="w-full flex items-center p-3 mb-5 rounded-lg transition duration-300 
                  hover:bg-[#E2C799] dark:hover:bg-[#5A4532] custom-cursor min-w-[240px]"
      >
        <div className="shrink-0">
          <FiUser size={28} />
        </div>
        <AnimatePresence mode="wait">
          {isExpanded && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
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
            onClick={(e) => handleClickWithPrevent(e, path)}
            className={`flex items-center p-3 rounded-lg transition duration-300 custom-cursor min-w-[240px]
                       ${
                         pathname === path
                           ? "bg-[#F96F5D] text-white"
                           : "hover:bg-[#E2C799] dark:hover:bg-[#5A4532] text-[#4A3628] dark:text-[#FAF3DD]"
                       }`}
          >
            <div className="shrink-0">
              <Icon size={28} />
            </div>
            <AnimatePresence mode="wait">
              {isExpanded && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
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
          className="w-full flex items-center p-3 rounded-lg transition duration-300 cursor-pointer custom-cursor min-w-[240px]
                    hover:bg-[#E2C799] dark:hover:bg-[#5A4532]"
          onClick={(e) => {
            e.preventDefault();
            toggleTheme();
          }}
        >
          <div className="shrink-0">
            {theme === "dark" ? <FiSun size={28} /> : <FiMoon size={28} />}
          </div>
          <AnimatePresence mode="wait">
            {isExpanded && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="text-md ml-3 whitespace-nowrap"
              >
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Sign Out */}
        <div
          className="w-full flex items-center p-3 rounded-lg transition duration-300 cursor-pointer custom-cursor min-w-[240px]
                    hover:bg-[#E2C799] dark:hover:bg-[#5A4532]"
          onClick={(e) => {
            e.preventDefault();
            handleSignOut();
          }}
        >
          <div className="shrink-0">
            <FiLogOut size={28} />
          </div>
          <AnimatePresence mode="wait">
            {isExpanded && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
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
