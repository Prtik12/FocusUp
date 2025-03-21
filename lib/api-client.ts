const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export const apiClient = {
  async getStudyPlans(userId: string, page: number = 1, limit: number = 6) {
    const response = await fetch(
      `${API_BASE_URL}/generate-study-plan?userId=${userId}&page=${page}&limit=${limit}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch study plans');
    }

    return response.json();
  },

  async createStudyPlan(userId: string, subject: string, examDate: string) {
    const response = await fetch(`${API_BASE_URL}/generate-study-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, subject, examDate }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create study plan');
    }

    return response.json();
  },

  async deleteStudyPlan(planId: string, userId: string) {
    const response = await fetch(`${API_BASE_URL}/generate-study-plan`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ planId, userId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete study plan');
    }

    return response.json();
  },
};
