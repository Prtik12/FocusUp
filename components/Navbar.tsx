"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Pangolin } from "next/font/google";
import { FiMenu, FiX } from "react-icons/fi";


const pangolin = Pangolin({ weight: "400", subsets: ["latin"], display: "swap",});

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full bg-[#FBF2C0] text-[#4A3628] shadow-md z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        {/* Logo */}
        <Link href="/">
          <motion.h1
            className={`${pangolin.className} text-xl sm:text-2xl font-bold text-center text-[#48392A] mt-24 sm:mt-32 mb-4 sm:mb-6 relative`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            FocusUp<span className="text-[#F96F5D]">.</span>
          </motion.h1>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-8">
          {["Home", "Features", "About", "Contact"].map((item) => (
            <Link key={item} href={`/${item.toLowerCase()}`}>
              <motion.span
                className="text-lg font-medium cursor-pointer hover:text-[#F96F5D] transition"
                whileHover={{ scale: 1.1 }}
              >
                {item}
              </motion.span>
            </Link>
          ))}
        </div>

        {/* Auth Buttons */}
        <div className="hidden md:flex space-x-4">
          <Link href="/signin">
            <button className="border-2 border-[#4A3628] px-4 py-2 rounded-md hover:bg-[#4A3628] hover:text-[#FAF3DD] transition">
              Sign In
            </button>
          </Link>
          <Link href="/register">
            <button className="bg-[#F96F5D] px-4 py-2 text-[#FAF3DD] rounded-md hover:bg-[#e05b4d] transition">
              Get Started
            </button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-3xl" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-[#FBF2C0] flex flex-col items-center space-y-4 py-6 shadow-lg"
          >
            {["Home", "Features", "About", "Contact"].map((item) => (
              <Link key={item} href={`/${item.toLowerCase()}`} onClick={() => setIsOpen(false)}>
                <span className="text-lg font-medium cursor-pointer hover:text-[#F96F5D] transition">
                  {item}
                </span>
              </Link>
            ))}
            <div className="flex flex-col space-y-3">
              <Link href="/signin">
                <button className="border-2 border-[#4A3628] px-4 py-2 rounded-md hover:bg-[#4A3628] hover:text-[#FAF3DD] transition">
                  Sign In
                </button>
              </Link>
              <Link href="/register">
                <button className="bg-[#F96F5D] px-4 py-2 text-[#FAF3DD] rounded-md hover:bg-[#e05b4d] transition">
                  Get Started
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
