import { useState, useEffect } from 'react';
import { StudyPlan } from '@/types/studyPlan';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Trash2, X as CloseIcon, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface StoredPlanProps {
  plan: StudyPlan;
  onDelete: (id: string) => void;
  deleteInProgress?: boolean;
}

export default function StoredPlan({ plan, onDelete, deleteInProgress }: StoredPlanProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [contentError, setContentError] = useState<string | null>(null);
  const [isContentReady, setIsContentReady] = useState(false);

  useEffect(() => {
    // Validate that content is usable
    if (plan.content) {
      if (typeof plan.content !== 'string') {
        setContentError('Content format is invalid');
      } else if (plan.content.trim().length === 0) {
        setContentError('Study plan is empty');
      } else {
        setContentError(null);
        setIsContentReady(true);
      }
    }
  }, [plan.content]);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(plan.id);
  };

  return (
    <>
      <motion.div
        className="bg-[#FAF3DD] dark:bg-[#2A1F1A] rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:scale-[1.02] custom-cursor"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        layout
        onClick={() => setIsExpanded(true)}
        whileHover={{ 
          boxShadow: "0 15px 30px rgba(0,0,0,0.1)",
          borderColor: "rgba(249, 111, 93, 0.5)",
        }}
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
              } hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 custom-cursor`}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-[#4A3628] dark:scrollbar-thumb-[#FAF3DD] scrollbar-track-transparent">
            <div className="prose prose-headings:text-[#4A3628] dark:prose-headings:text-[#FAF3DD] prose-p:text-[#4A3628] dark:prose-p:text-[#FAF3DD] prose-li:text-[#4A3628] dark:prose-li:text-[#FAF3DD] max-w-none font-pangolin">
              {contentError ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <AlertTriangle className="w-10 h-10 text-amber-500 mb-2" />
                  <p className="text-red-500 font-pangolin">{contentError}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Try refreshing the page or creating a new study plan
                  </p>
                </div>
              ) : isContentReady ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {plan.content}
                </ReactMarkdown>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#4A3628] dark:border-[#FAF3DD]"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Expanded view modal */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-white/10 dark:bg-black/10 backdrop-blur-lg z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(false)}
          >
            <motion.div
              className="bg-[#FAF3DD] dark:bg-[#2A1F1A] p-8 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#4A3628] dark:text-[#FAF3DD] mb-2">
                  {plan.subject}
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 font-pangolin">
                  Exam Date: {format(new Date(plan.examDate), 'MMMM dd, yyyy')}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-pangolin mt-1">
                  Created: {format(new Date(plan.createdAt), 'MMMM dd, yyyy')}
                </p>
              </div>

              <div className="prose prose-headings:text-[#4A3628] dark:prose-headings:text-[#FAF3DD] prose-p:text-[#4A3628] dark:prose-p:text-[#FAF3DD] prose-li:text-[#4A3628] dark:prose-li:text-[#FAF3DD] prose-ul:text-[#4A3628] dark:prose-ul:text-[#FAF3DD] prose-ol:text-[#4A3628] dark:prose-ol:text-[#FAF3DD] max-w-none font-pangolin">
                {contentError ? (
                  <div className="flex flex-col items-center justify-center text-center p-4">
                    <AlertTriangle className="w-10 h-10 text-amber-500 mb-2" />
                    <p className="text-red-500 font-pangolin">{contentError}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Try refreshing the page or creating a new study plan
                    </p>
                  </div>
                ) : isContentReady ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {plan.content}
                  </ReactMarkdown>
                ) : (
                  <div className="flex items-center justify-center h-40">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#4A3628] dark:border-[#FAF3DD]"></div>
                  </div>
                )}
              </div>

              <button
                className="absolute top-4 right-4 p-2 rounded-full bg-[#F96F5D]/10 hover:bg-[#F96F5D]/20 text-[#F96F5D] transition-colors custom-cursor"
                onClick={() => setIsExpanded(false)}
              >
                <CloseIcon className="w-6 h-6" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
  