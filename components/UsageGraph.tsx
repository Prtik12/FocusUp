import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { FormattedActivity } from "@/hooks/useActivityData";
import { useEffect } from "react";

type UsageGraphProps = {
  activityData: FormattedActivity[];
  isLoading: boolean;
};

export default function UsageGraph({ activityData, isLoading }: UsageGraphProps) {
  // Add custom cursor to Recharts components after rendering
  useEffect(() => {
    const rechartElements = document.querySelectorAll('.recharts-wrapper, .recharts-surface, .recharts-layer, .recharts-bar-rectangle, .recharts-tooltip-wrapper');
    rechartElements.forEach(element => {
      element.classList.add('custom-cursor');
    });
  }, [activityData, isLoading]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white dark:bg-[#4A3628] rounded-xl shadow-lg p-6 mb-4 stats-card custom-cursor"
    >
      {isLoading ? (
        <div className="h-64 w-full flex items-center justify-center custom-cursor">
          <div className="animate-pulse text-gray-500 dark:text-gray-400">
            Loading activity data...
          </div>
        </div>
      ) : (
        <div className="h-64 w-full custom-cursor">
          <ResponsiveContainer width="100%" height="100%" className="custom-cursor">
            <BarChart
              data={activityData}
              margin={{
                top: 10,
                right: 10,
                left: 0,
                bottom: 20,
              }}
              className="custom-cursor"
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} className="custom-cursor" />
              <XAxis 
                dataKey="formattedDate" 
                tick={{ fill: '#4A3628', fontSize: 12 }}
                tickMargin={10}
                className="dark:fill-[#FAF3DD] custom-cursor"
              />
              <YAxis
                label={{ 
                  value: 'Minutes', 
                  angle: -90, 
                  position: 'insideLeft',
                  className: 'dark:fill-[#FAF3DD]'
                }}
                tick={{ fill: '#4A3628', fontSize: 12 }}
                className="dark:fill-[#FAF3DD] custom-cursor"
              />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: '#FBF2C0', 
                  border: 'none',
                  borderRadius: '8px',
                  color: '#4A3628'
                }}
                cursor={{ fill: 'rgba(249, 111, 93, 0.1)' }}
                formatter={(value) => [`${value} mins`, 'Time Spent']}
              />
              <Bar 
                dataKey="minutes" 
                fill="#F96F5D"
                radius={[4, 4, 0, 0]}
                animationDuration={1000}
                className="custom-cursor"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">
        Time spent on the application over the last week
      </p>
    </motion.div>
  );
} 