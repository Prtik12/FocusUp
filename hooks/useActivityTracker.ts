import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

// Define the activity data structure
export type ActivityData = {
  date: string;
  minutesActive: number;
  lastUpdated: string;
};

export const useActivityTracker = () => {
  const { data: session } = useSession();
  const [isTracking, setIsTracking] = useState(false);
  
  // Start activity tracking
  useEffect(() => {
    if (!session?.user) return;
    
    // Variables to track user activity
    let activityStartTime = new Date();
    let idleTimer: NodeJS.Timeout | null = null;
    let totalActiveTime = 0;
    let isActive = true;
    
    // Load today's existing activity from localStorage
    const loadTodayActivity = () => {
      const today = new Date().toISOString().split('T')[0];
      const storedActivities = localStorage.getItem('userActivities');
      
      if (storedActivities) {
        const activities = JSON.parse(storedActivities) as ActivityData[];
        const todayActivity = activities.find(a => a.date === today);
        
        if (todayActivity) {
          totalActiveTime = todayActivity.minutesActive * 60; // Convert minutes to seconds
        }
      }
    };

    // Save activity data to localStorage
    const saveActivity = () => {
      if (!isActive || !session?.user) return;
      
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();
      const elapsedSeconds = Math.floor((new Date().getTime() - activityStartTime.getTime()) / 1000);
      
      if (elapsedSeconds <= 0) return;
      
      // Add the elapsed time to total active time
      totalActiveTime += elapsedSeconds;
      
      // Convert seconds to minutes (rounded to 1 decimal place)
      const minutesActive = Math.round((totalActiveTime / 60) * 10) / 10;
      
      // Get existing activities or create new array
      const storedActivities = localStorage.getItem('userActivities');
      let activities: ActivityData[] = [];
      
      if (storedActivities) {
        activities = JSON.parse(storedActivities);
      }
      
      // Find if today already has an entry
      const todayIndex = activities.findIndex(a => a.date === today);
      
      if (todayIndex >= 0) {
        // Update existing entry
        activities[todayIndex] = {
          date: today,
          minutesActive,
          lastUpdated: now
        };
      } else {
        // Add new entry
        activities.push({
          date: today,
          minutesActive,
          lastUpdated: now
        });
      }
      
      // Keep only the last 14 days of activity
      activities = activities
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 14);
      
      // Save to localStorage
      localStorage.setItem('userActivities', JSON.stringify(activities));
      
      // Sync with server if needed
      syncActivityWithServer(activities);
      
      // Reset the start time for the next interval
      activityStartTime = new Date();
    };

    // Sync with server (placeholder - implement with your API)
    const syncActivityWithServer = async (activities: ActivityData[]) => {
      try {
        // Only sync if there are activities to sync
        if (activities.length === 0) return;
        
        // Send the activity data to the server
        await fetch('/api/activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ activities })
        });
      } catch (error) {
        console.error('Failed to sync activity with server:', error);
      }
    };

    // Activity event handlers
    const handleActivity = () => {
      if (!isActive) {
        isActive = true;
        activityStartTime = new Date(); // Reset the start time if coming back from idle
      }
      
      // Reset the idle timer
      if (idleTimer) {
        clearTimeout(idleTimer);
      }
      
      // Set a new idle timer
      idleTimer = setTimeout(() => {
        if (isActive) {
          saveActivity(); // Save current session before going idle
          isActive = false;
        }
      }, 60000); // Consider user idle after 1 minute of inactivity
    };

    // Save on window/tab close or hide
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveActivity();
      } else if (document.visibilityState === 'visible') {
        // Reset the timer when the window becomes visible again
        isActive = true;
        activityStartTime = new Date();
      }
    };

    // Initialize
    loadTodayActivity();
    setIsTracking(true);
    activityStartTime = new Date();
    
    // Set up periodic saving (every 30 seconds)
    const saveInterval = setInterval(saveActivity, 30000);
    
    // Set up event listeners for user activity
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Clean up
    return () => {
      setIsTracking(false);
      saveActivity(); // Save on unmount
      
      if (idleTimer) {
        clearTimeout(idleTimer);
      }
      
      clearInterval(saveInterval);
      
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [session?.user]);

  return { isTracking };
}; 