import { useState } from 'react';
import { StudyPlan } from '@/types/studyPlan';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';

interface StoredPlanProps {
  plan: StudyPlan;
  onDelete: (id: string) => void;
  deleteInProgress?: boolean;
}

export default function StoredPlan({ plan, onDelete, deleteInProgress }: StoredPlanProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleDelete = () => {
    onDelete(plan.id);
  };

  return (
    <motion.div
      className="bg-white dark:bg-[#2A1F1A] rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      layout
    >
      <div className="p-6 flex flex-col h-[600px]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-pangolin text-[#4A3628] dark:text-[#FAF3DD] truncate">
              {plan.subject}
            </h3>
            <p className="text-base text-gray-600 dark:text-gray-300 font-pangolin">
              Exam Date: {format(new Date(plan.examDate), 'MMM dd, yyyy')}
            </p>
          </div>
          <button
            onClick={handleDelete}
            disabled={deleteInProgress}
            className={`ml-4 p-2 rounded-full transition-all duration-200 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            } hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500`}
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-[#4A3628] dark:scrollbar-thumb-[#FAF3DD] scrollbar-track-transparent">
          <div className="prose dark:prose-invert max-w-none">
            <div 
              className="text-[#4A3628] dark:text-[#FAF3DD] leading-relaxed font-pangolin"
              dangerouslySetInnerHTML={{ 
                __html: plan.content
                  .replace(/\n/g, '<br />')
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\*(.*?)\*/g, '<em>$1</em>')
                  .replace(/^# (.*$)/gm, '<h1>$1</h1>')
                  .replace(/^## (.*$)/gm, '<h2>$1</h2>')
                  .replace(/^### (.*$)/gm, '<h3>$1</h3>')
                  .replace(/^\- (.*$)/gm, '<li>$1</li>')
                  .replace(/^[0-9]+\. (.*$)/gm, '<li>$1</li>')
                  .replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>')
                  .replace(/(<li>.*<\/li>)/g, '<ol>$1</ol>')
                  .replace(/`(.*?)`/g, '<code>$1</code>')
                  .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
                  .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
                  .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" />')
                  .replace(/\n\n/g, '<br /><br />')
              }} 
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
  