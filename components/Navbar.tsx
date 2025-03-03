"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Pangolin } from "next/font/google";
import { FiMenu, FiX, FiGithub, FiSun, FiMoon } from "react-icons/fi";
import { useTheme } from "@/providers/ThemeProviders";

const pangolin = Pangolin({ weight: "400", subsets: ["latin"], display: "swap" });

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [clientTheme, setClientTheme] = useState<string | null>(null);

  useEffect(() => {
    setClientTheme(theme);
  }, [theme]);

  return (
    <nav
      className={`fixed top-0 left-0 w-full shadow-md z-50 ${
        clientTheme === "dark" ? "bg-[#4a3628] text-[#FAF3DD]" : "bg-[#FBF2C0] text-[#4A3628]"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <motion.h1
            className={`${pangolin.className} text-xl sm:text-2xl font-bold text-left`}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            FocusUp
            <span className="text-[#F96F5D] inline-block">!</span>
          </motion.h1>
        </Link>

        {/* Mobile Icons */}
        <div className="flex items-center md:hidden space-x-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="text-2xl p-2 rounded-md transition hover:text-[#F96F5D]"
          >
            {clientTheme === "dark" ? <FiSun /> : <FiMoon />}
          </button>

          {/* GitHub Icon */}
          <a
            href="https://github.com/Prtik12/FocusUp"
            target="_blank"
            rel="noopener noreferrer"
            className="text-2xl transition hover:text-[#F96F5D]"
          >
            <FiGithub />
          </a>

          {/* Mobile Menu Button */}
          <button className="text-3xl" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        {/* Desktop Buttons */}
        <div className="hidden md:flex space-x-4 items-center">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="text-2xl p-2 rounded-md transition hover:text-[#F96F5D]"
          >
            {clientTheme === "dark" ? <FiSun /> : <FiMoon />}
          </button>

          {/* GitHub Icon */}
          <a
            href="https://github.com/Prtik12/FocusUp"
            target="_blank"
            rel="noopener noreferrer"
            className="text-2xl transition hover:text-[#F96F5D]"
          >
            <FiGithub />
          </a>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className={`md:hidden flex flex-col items-center py-6 shadow-lg space-y-4 w-full ${
              clientTheme === "dark" ? "bg-[#4a3628] text-[#FAF3DD]" : "bg-[#FBF2C0] text-[#4A3628]"
            }`}
          >
            {/* Empty mobile menu (buttons removed) */}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
