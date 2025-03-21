import { FiAward } from "react-icons/fi";
import { motion } from "framer-motion";

type StreakCardProps = {
  streak: number;
};

export default function StreakCard({ streak }: StreakCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-[#F96F5D] to-[#FF4D4D] rounded-xl shadow-lg p-6 text-white mb-4 stats-card"
    >
      <div className="flex flex-col items-center justify-center text-center">
        <FiAward size={36} className="mb-3" />

        <div className="flex items-center justify-center my-2">
          <div className="text-5xl font-bold">{streak}</div>
          <div className="ml-2 text-xl">days</div>
        </div>

        <p className="text-sm opacity-80 mt-2">
          Keep logging in daily to increase your streak!
        </p>
      </div>
    </motion.div>
  );
}
