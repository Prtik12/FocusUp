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
      // Every time we update deletedIds, also store in localStorage for persistence across sessions
      localStorage.setItem('deletedPlanIds', JSON.stringify(deletedIds));
    }
  } catch (e) {
    console.error('Failed to store deleted plan ID:', e);
  }
};

// Sync deleted IDs from localStorage to sessionStorage on init
const syncDeletedIdsFromStorage = (): void => {
  try {
    // Try to get from localStorage first (more persistent)
    const localStorageIds = localStorage.getItem('deletedPlanIds');
    if (localStorageIds) {
      sessionStorage.setItem('deletedPlanIds', localStorageIds);
    }
  } catch (e) {
    console.error('Failed to sync deleted plan IDs from storage:', e);
  }
};

// Run sync on module load
syncDeletedIdsFromStorage();

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
      // Force sync deleted IDs before fetching
      syncDeletedIdsFromStorage();
      
      const { currentPage, itemsPerPage } = get();
      const data = await apiClient.getStudyPlans(
        userId,
        currentPage,
        itemsPerPage,
        bustCache
      );
      
      if (Array.isArray(data?.plans)) {
        // Get the latest deleted IDs
        const deletedIds = getDeletedPlanIds();
        console.log("Filtering with deleted IDs:", deletedIds);
        
        // Filter out deleted plans
        const filteredPlans = data.plans.filter((plan: StudyPlan) => {
          const shouldKeep = !deletedIds.includes(plan.id);
          if (!shouldKeep) {
            console.log(`Filtering out deleted plan: ${plan.id}`);
          }
          return shouldKeep;
        });
        
        set({
          plans: filteredPlans,
          total: Math.max((data.total || 0) - deletedIds.length, 0),
          totalPages: Math.ceil(Math.max((data.total || 0) - deletedIds.length, 0) / get().itemsPerPage),
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
    // Track the plan we're creating to avoid duplication
    const { plans } = get();
    const existingPlan = plans.find(p => p.id === plan.id);
    
    // If this plan already exists, don't add it again
    if (existingPlan) {
      console.log(`Plan ${plan.id} already exists, not duplicating`);
      return;
    }
    
    console.log(`Adding plan ${plan.id} to store`);
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
    
    console.log(`Attempting to delete plan: ${planId}`);
    
    // Set deleting state
    set({ isDeleting: planId });
    
    // Add to deleted IDs in both session and local storage (for persistence)
    addToDeletedPlanIds(planId);
    
    // Double-check our arrays include this planId
    const confirmDeletedIds = getDeletedPlanIds();
    console.log(`Plan ${planId} is in deleted IDs: ${confirmDeletedIds.includes(planId)}`);
    
    // Optimistically update UI by removing the plan
    set(state => {
      // First verify the plan is in state
      const planExists = state.plans.some(plan => plan.id === planId);
      console.log(`Plan ${planId} exists in state: ${planExists}`);
      
      // Only decrement total if plan actually exists
      const newTotal = planExists 
        ? Math.max(0, state.total - 1)
        : state.total;
        
      return {
        plans: state.plans.filter(plan => plan.id !== planId),
        total: newTotal,
        totalPages: Math.ceil(Math.max(0, newTotal) / state.itemsPerPage)
      };
    });
    
    const loadingToast = toast.loading("Deleting study plan...");
    
    try {
      // Execute delete on server
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
      } else {
        // Even if the current page isn't empty, do a refresh to ensure sync
        setTimeout(() => {
          const { fetchPlans } = get();
          fetchPlans(userId, true);
        }, 500);
      }
      
      set({ isDeleting: null });
      return true;
    } catch (err) {
      console.error("Error deleting study plan:", err);
      
      toast.dismiss(loadingToast);
      toast.error("Network issue while deleting plan", {
        description: "The plan will be removed after page refresh"
      });
      
      // Despite the error, make sure this plan is properly marked as deleted
      // and doesn't reappear on next fetch
      addToDeletedPlanIds(planId);
      
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