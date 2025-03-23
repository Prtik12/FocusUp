"use client";

import { useEffect, useState } from "react";
import { Pangolin } from "next/font/google";
import { useSession } from "next-auth/react";
import StudyPlanForm from "@/components/Forms/StudyPlan/StudyPlanForm";
import StoredPlan from "@/components/study-plan/StoredPlan";
import PaginationNav from "@/components/ui/pagination-nav";
import { motion, AnimatePresence } from "framer-motion";
import { StudyPlan } from "@/types/studyPlan";
import { Toaster } from "sonner";
import { useRouter } from "next/navigation";
import BottomBar from "@/components/BottomBar";
import Sidebar from "@/components/Sidebar";
import { useStudyPlanStore } from "@/store/studyPlanStore";

const pangolin = Pangolin({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

// Update PaginationNav to handle setPage from Zustand
const PaginationNavWithCallback = ({ 
  page, 
  setPage, 
  pageCount, 
  isDisabled 
}: { 
  page: number, 
  setPage: (page: number) => void, 
  pageCount: number, 
  isDisabled: boolean 
}) => {
  return (
    <PaginationNav
      page={page}
      setPage={(newPage) => {
        // Handle both function and direct value
        if (typeof newPage === 'function') {
          const currentPage = page;
          const calculatedPage = newPage(currentPage);
          setPage(calculatedPage);
        } else {
          setPage(newPage);
        }
      }}
      pageCount={pageCount}
      isDisabled={isDisabled}
    />
  );
};

export default function StudyPlanPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const userId = session?.user?.id;
  const [isMobile, setIsMobile] = useState(false);
  
  // Use the Zustand store for study plan state management
  const {
    plans,
    totalPages,
    currentPage,
    isLoading,
    isDeleting,
    error,
    fetchPlans,
    deletePlan,
    setPage,
    reset
  } = useStudyPlanStore();

  // Handle mobile detection
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); // Check on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Redirect to sign-in if not logged in
  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.push("/signin");
  }, [session, status, router]);

  // Fetch study plans when user logs in or page changes
  useEffect(() => {
    if (userId) {
      fetchPlans(userId, true);
    }
    
    // Cleanup store when component unmounts
    return () => {
      reset();
    };
  }, [userId, currentPage, fetchPlans, reset]);

  // Handle plan creation
  const handlePlanCreated = (newPlan: StudyPlan) => {
    // IMPORTANT: We're already calling createPlan in the form component
    // Don't call it again here to prevent duplicate plans
    // useStudyPlanStore.getState().createPlan(newPlan); 
    
    // Just debugging - no action needed here
    console.log("Plan created and handled by form component:", newPlan.id);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    if (newPage !== currentPage && !isLoading && isDeleting === null) {
      setPage(newPage);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FBF2C0] dark:bg-[#4a3628]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4A3628] dark:border-[#FAF3DD]"></div>
      </div>
    );
  }

  if (!session) return null; // Redirect handled by router

  return (
    <div
      className={`h-max relative ${pangolin.className} ${isMobile ? "px-0 pb-16" : "ml-20 px-0"}`}
    >
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
              Study Planner
            </h1>
            <p className="text-base text-gray-600 dark:text-gray-300 font-pangolin">
              Create and manage your personalized study plans
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-full mx-auto mb-12"
          >
            <StudyPlanForm
              userId={userId ?? ""}
              setStudyPlans={() => {}} // No longer needed with Zustand
              onPlanCreated={handlePlanCreated}
            />
          </motion.div>

          {isLoading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#4A3628] dark:border-[#FAF3DD] mx-auto"></div>
            </div>
          )}

          {error && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-red-500 py-4"
            >
              {error}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {Array.isArray(plans) && plans.length > 0 ? (
              <motion.div
                className="space-y-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                key="has-plans"
              >
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  layout="position"
                  layoutRoot
                >
                  {plans.map((plan, index) => (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ 
                        duration: 0.2, 
                        delay: Math.min(index * 0.05, 0.3) // Cap delay at 0.3s
                      }}
                      layout="position"
                    >
                      <StoredPlan
                        plan={plan}
                        onDelete={
                          // Delegate deletion to the store
                          (planId) => userId && deletePlan(userId, planId)
                        }
                        deleteInProgress={isDeleting === plan.id}
                      />
                    </motion.div>
                  ))}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <PaginationNavWithCallback
                    page={currentPage}
                    setPage={handlePageChange}
                    pageCount={totalPages}
                    isDisabled={isLoading || isDeleting !== null}
                  />
                </motion.div>
              </motion.div>
            ) : (
              !isLoading && (
                <motion.div
                  key="no-plans"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-center py-12"
                >
                  <p className="text-xl text-[#4A3628] dark:text-[#FAF3DD] mb-2 font-pangolin">
                    No study plans found
                  </p>
                  <p className="text-base text-gray-600 dark:text-gray-300 font-pangolin">
                    Create your first study plan to get started
                  </p>
                </motion.div>
              )
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
