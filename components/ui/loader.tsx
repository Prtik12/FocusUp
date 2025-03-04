"use client";

import { motion } from "framer-motion";
import { Pangolin } from "next/font/google";

const pangolin = Pangolin({ weight: "400", subsets: ["latin"], display: "swap" });

export default function Loader() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black z-50">
      {/* Animated Logo */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }} // Starts lower and invisible
        animate={{ opacity: 1, y: 0 }} // Moves to final position
        transition={{ duration: 2, ease: "easeOut" }}
        className={`${pangolin.className} text-6xl sm:text-8xl font-bold text-center text-[#FAF3DD] mt-0 sm:mt-14 mb-4 sm:mb-6 relative`}
      >
        FocusUp{" "}
        <motion.span
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
          className="text-[#F96F5D] inline-block"
        >
          !
        </motion.span>
      </motion.h1>
    </div>
  );
}
