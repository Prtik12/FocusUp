const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export const apiClient = {
  async getStudyPlans(
    userId: string,
    page: number = 1,
    limit: number = 6,
    bustCache: boolean = false,
  ) {
    const timestamp = bustCache ? `&t=${Date.now()}` : "";

    const response = await fetch(
      `${API_BASE_URL}/generate-study-plan?userId=${userId}&page=${page}&limit=${limit}${timestamp}`,
      {
        cache: bustCache ? "no-store" : "default",
        headers: {
          "Pragma": bustCache ? "no-cache" : "default",
        }
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch study plans");
    }

    const data = await response.json();
    
    // Filter out any plans that were marked as deleted in session storage
    try {
      const deletedIds = JSON.parse(sessionStorage.getItem('deletedPlanIds') || '[]');
      if (deletedIds.length > 0 && Array.isArray(data.plans)) {
        data.plans = data.plans.filter((plan: { id: string }) => !deletedIds.includes(plan.id));
      }
    } catch (e) {
      console.error("Error filtering deleted plans from API response:", e);
    }

    return data;
  },

  async createStudyPlan(userId: string, subject: string, examDate: string) {
    const response = await fetch(`${API_BASE_URL}/generate-study-plan`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, subject, examDate }),
      cache: "no-store",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create study plan");
    }

    return response.json();
  },

  async deleteStudyPlan(planId: string, userId: string) {
    // Try up to 3 times
    let attempts = 0;
    const maxAttempts = 3;
    let lastError: Error | unknown = null;

    while (attempts < maxAttempts) {
      attempts++;
      try {
        console.log(`Deleting study plan: ${planId}, attempt ${attempts}`);
        
        // Use AbortController to add a timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout
        
        const response = await fetch(`${API_BASE_URL}/generate-study-plan`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ planId, userId }),
          cache: "no-store",
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete study plan");
        }

        return response.json();
      } catch (error) {
        console.error(`Delete attempt ${attempts} failed:`, error);
        lastError = error;
        
        // If it's an AbortError, it's a timeout
        if (error instanceof DOMException && error.name === 'AbortError') {
          console.log("Request timed out. Retrying...");
        }
        
        // Don't wait on the last attempt
        if (attempts < maxAttempts) {
          // Exponential backoff: wait longer with each retry
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
        }
      }
    }

    // All attempts failed
    throw lastError || new Error("Failed to delete study plan after multiple attempts");
  },
};
