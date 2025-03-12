"use client";

import { useEffect, useState, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import { useSession } from 'next-auth/react';
import StudyPlanForm from '@/components/Forms/StudyPlan/StudyPlanForm';
import StoredPlan from '@/components/study-plan/StoredPlan';
import PaginationNav from '@/components/ui/pagination-nav';
import { motion, AnimatePresence } from 'framer-motion';
import { StudyPlan } from '@/types/studyPlan';
import { Toaster, toast } from 'sonner';
import { useRouter } from 'next/navigation';

const ITEMS_PER_PAGE = 6;

export default function StudyPlanPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const userId = session?.user?.id;

  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  // Memoized fetch function to prevent unnecessary re-renders
  const fetchPlans = useCallback(async () => {
    if (!userId) return;

    setIsFetching(true);
    setError(null);
    
    try {
      const data = await apiClient.getStudyPlans(userId, page, ITEMS_PER_PAGE);
      
      if (Array.isArray(data?.plans)) {
        setStudyPlans(data.plans);
        setTotalPages(Math.ceil((data.total || 0) / ITEMS_PER_PAGE));
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch study plans';
      console.error("Error fetching study plans:", errorMessage);
      setError(errorMessage);
      toast.error('Failed to load study plans', {
        description: errorMessage
      });
    } finally {
      setIsFetching(false);
    }
  }, [userId, page]);

  // Effect for session handling and redirection
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/signin');
      return;
    }
  }, [session, status, router]);

  // Effect for fetching study plans
  useEffect(() => {
    if (!isFetching) {
      fetchPlans();
    }
  }, [fetchPlans, page]);

  const handleDelete = async (planId: string) => {
    if (isDeleting) return; // Prevent multiple delete requests

    const shouldDelete = window.confirm('Are you sure you want to delete this study plan?');
    if (!shouldDelete) return;

    setIsDeleting(planId);
    
    try {
      await apiClient.deleteStudyPlan(planId);
      setStudyPlans((prev) => prev.filter((plan) => plan.id !== planId));
      toast.success('Study plan deleted successfully');
      
      // Refetch if we're on the last page and it's now empty
      if (studyPlans.length === 1 && page > 1) {
        setPage(prev => prev - 1);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete study plan';
      console.error("Error deleting study plan:", errorMessage);
      toast.error('Failed to delete study plan', {
        description: errorMessage
      });
    } finally {
      setIsDeleting(null);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FBF2C0] dark:bg-[#4a3628]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4A3628] dark:border-[#FAF3DD]"></div>
      </div>
    );
  }

  if (!session) {
    return null; // Router will handle redirection
  }

  return (
    <div className="container mx-auto p-6 bg-[#FBF2C0] dark:bg-[#4a3628] min-h-screen">
      <Toaster position="bottom-right" richColors closeButton />
      
      <motion.h1 
        className="text-3xl font-bold mb-6 text-[#4A3628] dark:text-[#FAF3DD] text-center font-pangolin"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Study Plan Generator
      </motion.h1>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <StudyPlanForm 
          userId={userId ?? ''} 
          setStudyPlans={setStudyPlans}
          onPlanCreated={() => {
            setPage(1);
            fetchPlans();
          }}
        />
      </motion.div>
      
      {isFetching && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#4A3628] dark:border-[#FAF3DD] mx-auto"></div>
        </div>
      )}
      
      {error && !isFetching && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-red-500 py-4"
        >
          {error}
        </motion.div>
      )}

      <AnimatePresence mode="popLayout">
        {studyPlans.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {studyPlans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                layout
              >
                <StoredPlan 
                  plan={plan} 
                  onDelete={handleDelete}
                  deleteInProgress={isDeleting === plan.id}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : !isFetching && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-lg text-[#4A3628] dark:text-[#FAF3DD] mt-4"
          >
            No study plans found. Create one to get started!
          </motion.p>
        )}
      </AnimatePresence>

      {studyPlans.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <PaginationNav 
            page={page} 
            setPage={setPage} 
            pageCount={totalPages}
            isDisabled={isFetching}
          />
        </motion.div>
      )}
    </div>
  );
}
