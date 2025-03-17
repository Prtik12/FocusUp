"use client";

import Link from "next/link";
import { Pangolin } from "next/font/google";
import { motion } from "framer-motion";
import { FiArrowRight, FiLogIn } from "react-icons/fi";
import { FaDiscord, FaTwitter } from "react-icons/fa";
import Navbar from "@/components/Navbar";
import Loader from "@/components/ui/loader";
import { useEffect, useState } from "react";

const pangolin = Pangolin({ weight: "400", subsets: ["latin"], display: "swap" });

export default function LandingPage() {

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setIsLoading(false), 2000); // Loader for 2 sec
    return () => clearTimeout(timeout);
  }, []);

  if (isLoading) return <Loader />;

  return (
    <main>
      <div className="relative h-auto min-h-screen bg-[#FBF2C0] dark:bg-[#4a3628] text-[#4A3628] dark:text-[#FAF3DD] flex flex-col items-center justify-center px-4 sm:px-6 overflow-auto">
        {/* Navbar */}
        <Navbar />

        {/* Animated Title */}
        <motion.h1
          initial={false} // Prevents SSR hydration issues
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`${pangolin.className} text-6xl sm:text-8xl font-bold text-center text-[#48392A] dark:text-[#FAF3DD] mt-24 sm:mt-32 mb-4 sm:mb-6 relative`}
        >
          FocusUp{" "}
          <motion.span
            initial={false} // Prevents SSR hydration issues
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
          className="mt-4 flex flex-col sm:flex-row gap-3 sm:gap-6 w-full sm:w-auto items-center"
        >
          {/* Get Started Button */}
          <Link href="/register">
            <motion.div
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              whileHover={{ scale: 1.08 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="w-full max-w-xs sm:w-auto"
            >
              <button className="bg-[#F96F5D] text-[#FAF3DD] px-4 py-3 sm:px-6 sm:py-3 rounded-lg text-xl sm:text-xl font-medium w-full flex items-center justify-center gap-2 transition-all duration-300 hover:bg-[#e05b4d] hover:scale-105">
                Get Started <FiArrowRight className="animate-pulse" />
              </button>
            </motion.div>
          </Link>

          {/* Sign In Button */}
          <Link href="/signin">
            <motion.div
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              whileHover={{ scale: 1.08 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="w-full max-w-xs sm:w-auto"
            >
              <button className="border-2 border-[#4A3628] dark:border-[#FAF3DD] text-[#4A3628] dark:text-[#FAF3DD] px-4 py-3 sm:px-6 sm:py-3 rounded-lg text-xl sm:text-xl w-full flex items-center justify-center gap-2 transition-all duration-300 hover:bg-[#4A3628] dark:hover:bg-[#FAF3DD] hover:text-[#FAF3DD] dark:hover:text-[#4A3628] hover:scale-105">
                Sign In <FiLogIn className="animate-bounce" />
              </button>
            </motion.div>
          </Link>
        </motion.div>
      </div>

{/* Footer */}
<div className="h-16 w-full dark:bg-[#FBF2C0] bg-[#4a3628] dark:text-[#4A3628] text-[#FAF3DD] flex flex-col sm:flex-row items-center justify-center sm:justify-between px-3 sm:px-6 text-xs sm:text-sm">
  <p className="text-center">© 2025 FocusUp. All rights reserved.</p>
  <div className="flex gap-3 sm:gap-4 mt-1 sm:mt-0">
    <Link href="https://discord.com" target="_blank" className="hover:scale-110 transition-transform">
      <FaDiscord className="dark:text-[#4A3628] text-[#FAF3DD] w-5 h-5 sm:w-6 sm:h-6" />
    </Link>
    <Link href="https://twitter.com" target="_blank" className="hover:scale-110 transition-transform">
      <FaTwitter className="dark:text-[#4A3628] text-[#FAF3DD] w-5 h-5 sm:w-6 sm:h-6" />
    </Link>
  </div>
</div>
    </main>
  );
}
