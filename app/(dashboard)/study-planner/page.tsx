"use client";

import { useEffect, useState, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import { Pangolin } from "next/font/google";
import { useSession } from 'next-auth/react';
import StudyPlanForm from '@/components/Forms/StudyPlan/StudyPlanForm';
import StoredPlan from '@/components/study-plan/StoredPlan';
import PaginationNav from '@/components/ui/pagination-nav';
import { motion, AnimatePresence } from 'framer-motion';
import { StudyPlan } from '@/types/studyPlan';
import { Toaster, toast } from 'sonner';
import { useRouter } from 'next/navigation';
import BottomBar from '@/components/BottomBar';
import Sidebar from '@/components/Sidebar';

const ITEMS_PER_PAGE = 6;

const pangolin = Pangolin({ weight: "400", subsets: ["latin"], display: "swap" });

export default function StudyPlanPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const userId = session?.user?.id;
  const [isMobile, setIsMobile] = useState(false);
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); // Check on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch study plans from API
  const fetchPlans = useCallback(async () => {
    if (!userId) return;
    
    setIsFetching(true);
    setError(null);

    try {
      const data = await apiClient.getStudyPlans(userId, page, ITEMS_PER_PAGE);
      
      if (Array.isArray(data?.plans)) {
        setStudyPlans(data.plans || []);
        setTotalPages(Math.ceil((data.total || 0) / ITEMS_PER_PAGE));
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch study plans';
      console.error("Error fetching study plans:", errorMessage);
      setError(errorMessage);
      toast.error('Failed to load study plans', { description: errorMessage });
    } finally {
      setIsFetching(false);
    }
  }, [userId, page]);

  // Redirect to sign-in if not logged in
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) router.push('/signin');
  }, [session, status, router]);

  // Fetch study plans when user logs in or page changes
  useEffect(() => {
    fetchPlans();
  }, [fetchPlans, page]);

  // Handle study plan deletion
  const handleDelete = async (planId: string) => {
    if (isDeleting || !userId) return;

    // Validate CUID format
    if (!/^c[a-z0-9]+$/i.test(planId)) {
      toast.error("Invalid study plan ID.");
      return;
    }

    const shouldDelete = window.confirm("Are you sure you want to delete this study plan?");
    if (!shouldDelete) return;

    setIsDeleting(planId);

    try {
      await apiClient.deleteStudyPlan(planId, userId);
      setStudyPlans((prev) => prev.filter((plan) => plan.id !== planId));
      toast.success("Study plan deleted successfully");

      if (studyPlans.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      }
    } catch (err) {
      console.error("Error deleting study plan:", err);
      toast.error("Failed to delete study plan", { description: String(err) });
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

  if (!session) return null; // Redirect handled by router

  return (
    <div className={`h-max relative ${pangolin.className} ${isMobile ? "px-0 pb-16" : "ml-20 px-0"}`}>
      {!isMobile && <Sidebar />}
      {isMobile && <BottomBar />}

      <div className="min-h-screen bg-[#FBF2C0] dark:bg-[#4a3628]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Toaster position="bottom-right" richColors closeButton />

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl text-[#4A3628] dark:text-[#FAF3DD] mb-2">
              Study Plan Generator
            </h1>
            <p className="text-base text-gray-600 dark:text-gray-300 font-pangolin">
              Create and manage your personalized study plans
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-2xl mx-auto mb-12"
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
            {Array.isArray(studyPlans) && studyPlans.length > 0 ? (
              <motion.div
                className="space-y-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
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
              </motion.div>
            ) : !isFetching && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <p className="text-xl text-[#4A3628] dark:text-[#FAF3DD] mb-2 font-pangolin">
                  No study plans found
                </p>
                <p className="text-base text-gray-600 dark:text-gray-300 font-pangolin">
                  Create your first study plan to get started
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
