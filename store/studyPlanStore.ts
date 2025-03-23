import { create } from 'zustand';
import { apiClient } from '@/lib/api-client';
import { StudyPlan } from '@/types/studyPlan';
import { toast } from 'sonner';

interface StudyPlanState {
  // Data
  plans: StudyPlan[];
  total: number;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  
  // Status flags
  isLoading: boolean;
  isDeleting: string | null;
  error: string | null;
  
  // Recently created plan tracking
  lastCreatedPlan: StudyPlan | null;
  
  // Actions
  fetchPlans: (userId: string, bustCache?: boolean) => Promise<void>;
  createPlan: (plan: StudyPlan) => void;
  deletePlan: (userId: string, planId: string) => Promise<boolean>;
  setPage: (page: number) => void;
  reset: () => void;
}

// Keep track of deleted plans in session storage to prevent reappearance
const getDeletedPlanIds = (): string[] => {
  try {
    return JSON.parse(sessionStorage.getItem('deletedPlanIds') || '[]');
  } catch {
    return [];
  }
};

const addToDeletedPlanIds = (planId: string): void => {
  try {
    const deletedIds = getDeletedPlanIds();
    if (!deletedIds.includes(planId)) {
      deletedIds.push(planId);
      sessionStorage.setItem('deletedPlanIds', JSON.stringify(deletedIds));
    }
  } catch (e) {
    console.error('Failed to store deleted plan ID:', e);
  }
};

export const useStudyPlanStore = create<StudyPlanState>((set, get) => ({
  // Initial state
  plans: [],
  total: 0,
  currentPage: 1,
  totalPages: 1,
  itemsPerPage: 6,
  isLoading: false,
  isDeleting: null,
  error: null,
  lastCreatedPlan: null,
  
  fetchPlans: async (userId: string, bustCache = false) => {
    if (!userId) return;
    
    set({ isLoading: true, error: null });
    
    try {
      const { currentPage, itemsPerPage } = get();
      const data = await apiClient.getStudyPlans(
        userId,
        currentPage,
        itemsPerPage,
        bustCache
      );
      
      if (Array.isArray(data?.plans)) {
        // Filter out deleted plans
        const deletedIds = getDeletedPlanIds();
        const filteredPlans = data.plans.filter((plan: StudyPlan) => !deletedIds.includes(plan.id));
        
        set({
          plans: filteredPlans,
          total: data.total || 0,
          totalPages: Math.ceil((data.total || 0) / get().itemsPerPage),
          isLoading: false
        });
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch study plans";
      console.error("Error fetching study plans:", errorMessage);
      set({ error: errorMessage, isLoading: false });
      toast.error("Failed to load study plans", { description: errorMessage });
    }
  },
  
  createPlan: (plan: StudyPlan) => {
    set({ lastCreatedPlan: plan });
    
    // Add to the beginning of the list if we're on page 1
    if (get().currentPage === 1) {
      set(state => ({ 
        plans: [plan, ...state.plans],
        total: state.total + 1,
        totalPages: Math.ceil((state.total + 1) / state.itemsPerPage)
      }));
    } else {
      // If we're not on page 1, just update the count and set page to 1
      set(state => ({ 
        currentPage: 1,
        total: state.total + 1,
        totalPages: Math.ceil((state.total + 1) / state.itemsPerPage)
      }));
    }
    
    // Schedule a refetch to make sure server state is in sync
    setTimeout(() => {
      const { fetchPlans } = get();
      fetchPlans(plan.userId, true);
    }, 1000);
  },
  
  deletePlan: async (userId: string, planId: string) => {
    // Don't proceed if already deleting or invalid input
    if (get().isDeleting || !userId) return false;
    
    // Validate CUID format
    if (!/^c[a-z0-9]+$/i.test(planId)) {
      toast.error("Invalid study plan ID.");
      return false;
    }
    
    // Set deleting state
    set({ isDeleting: planId });
    
    // Add to deleted IDs in session storage (for persistence)
    addToDeletedPlanIds(planId);
    
    // Optimistically update UI by removing the plan
    set(state => ({
      plans: state.plans.filter(plan => plan.id !== planId),
      total: Math.max(0, state.total - 1),
      totalPages: Math.ceil(Math.max(0, state.total - 1) / state.itemsPerPage)
    }));
    
    const loadingToast = toast.loading("Deleting study plan...");
    
    try {
      await apiClient.deleteStudyPlan(planId, userId);
      
      toast.dismiss(loadingToast);
      toast.success("Study plan deleted successfully");
      
      // Handle empty page case - go to previous page if needed
      const { currentPage, plans, totalPages } = get();
      if (plans.length === 0 && currentPage > 1 && currentPage > totalPages) {
        set({ currentPage: currentPage - 1 });
        
        // Fetch plans for the new page
        setTimeout(() => {
          const { fetchPlans } = get();
          fetchPlans(userId, true);
        }, 300);
      }
      
      set({ isDeleting: null });
      return true;
    } catch (err) {
      console.error("Error deleting study plan:", err);
      
      toast.dismiss(loadingToast);
      toast.error("Network issue while deleting plan", {
        description: "The plan will be removed after page refresh"
      });
      
      set({ isDeleting: null });
      return false;
    }
  },
  
  setPage: (page: number) => {
    set({ currentPage: page });
  },
  
  reset: () => {
    set({
      plans: [],
      total: 0,
      currentPage: 1,
      totalPages: 1,
      isLoading: false,
      isDeleting: null,
      error: null,
      lastCreatedPlan: null
    });
  }
})); 