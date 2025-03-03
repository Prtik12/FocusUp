"use client";

import Link from "next/link";
import { Pangolin } from "next/font/google";
import { motion } from "framer-motion";
import { FiArrowRight, FiLogIn } from "react-icons/fi";
import Navbar from "@/components/Navbar";

const pangolin = Pangolin({ weight: "400", subsets: ["latin"], display: "swap" });

export default function LandingPage() {
  return (
    <main className="relative min-h-screen bg-[#FBF2C0] dark:bg-[#4a3628] text-[#4A3628] dark:text-[#FAF3DD] flex flex-col items-center justify-center px-4 sm:px-6 overflow-hidden">
      {/* Navbar */}
      <Navbar />

      {/* Animated Title */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className={`${pangolin.className} text-6xl sm:text-8xl font-bold text-center text-[#48392A] dark:text-[#FAF3DD] mt-24 sm:mt-32 mb-4 sm:mb-6 relative`}
      >
        FocusUp{" "}
        <motion.span
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
          className="text-[#F96F5D] inline-block"
        >
          !
        </motion.span>
      </motion.h1>

      {/* CTA Buttons */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.2, delayChildren: 0.5 } },
        }}
        className="mt-4 flex flex-col sm:flex-row gap-3 sm:gap-6 w-60 sm:w-auto items-center"
      >
        {/* Get Started Button */}
        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          whileHover={{ scale: 1.08 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="w-3/4 sm:w-auto"
        >
          <Link href="/register">
            <button className="bg-[#F96F5D] text-[#FAF3DD] px-4 py-2 sm:px-6 sm:py-3 rounded-lg text-xl sm:text-xl font-medium w-full sm:w-auto flex items-center justify-center gap-2 transition-all duration-300 hover:bg-[#e05b4d] hover:scale-105">
              Get Started <FiArrowRight className="animate-pulse" />
            </button>
          </Link>
        </motion.div>

        {/* Sign In Button */}
        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          whileHover={{ scale: 1.08 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="w-3/4 sm:w-auto"
        >
          <Link href="/signin">
            <button className="border-2 border-[#4A3628] dark:border-[#FAF3DD] text-[#4A3628] dark:text-[#FAF3DD] px-4 py-2 sm:px-6 sm:py-3 rounded-lg text-xl sm:text-xl w-full sm:w-auto flex items-center justify-center gap-2 transition-all duration-300 hover:bg-[#4A3628] dark:hover:bg-[#FAF3DD] hover:text-[#FAF3DD] dark:hover:text-[#4A3628] hover:scale-105">
              Sign In <FiLogIn className="animate-bounce" />
            </button>
          </Link>
        </motion.div>
      </motion.div>
    </main>
  );
}
