import { useState, useEffect, useCallback, useRef } from 'react';
import { ActivityData } from './useActivityTracker';

export type FormattedActivity = {
  date: string;
  minutes: number;
  formattedDate: string;
};

export const useActivityData = () => {
  const [activityData, setActivityData] = useState<FormattedActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const lastRefreshRef = useRef<Date>(new Date());
  
  // Get today's date in YYYY-MM-DD format in local timezone
  const getTodayDateString = () => {
    const today = new Date();
    return today.getFullYear() + '-' + 
           String(today.getMonth() + 1).padStart(2, '0') + '-' + 
           String(today.getDate()).padStart(2, '0');
  };
  
  // Format a date for display (e.g., "Mar 22")
  const formatDateForDisplay = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.toLocaleString('default', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
  };

  // Extract the loadActivityData logic to a callback so we can use it in multiple places
  const loadActivityData = useCallback(() => {
    setIsLoading(true);
    
    // Get data from localStorage
    const storedActivities = localStorage.getItem('userActivities');
    let activities: ActivityData[] = [];
    
    if (storedActivities) {
      activities = JSON.parse(storedActivities);
    }
    
    // Log current time for debugging
    const now = new Date();
    const todayStr = getTodayDateString();
    console.log(`Loading activity data at: ${now.toISOString()} (${now.toString()})`);
    console.log(`Current date in user's timezone: ${todayStr}`);
    
    // Create a complete array for the last 7 days
    const formattedActivities: FormattedActivity[] = [];
    
    // Fill with the last 7 days
    for (let i = 6; i >= 0; i--) {
      // Calculate date by subtracting days from today
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Format as YYYY-MM-DD
      const dateString = date.getFullYear() + '-' + 
                        String(date.getMonth() + 1).padStart(2, '0') + '-' + 
                        String(date.getDate()).padStart(2, '0');
                        
      const activity = activities.find(a => a.date === dateString);
      
      formattedActivities.push({
        date: dateString,
        minutes: activity ? activity.minutesActive : 0,
        formattedDate: formatDateForDisplay(dateString)
      });
    }
    
    // Calculate streak
    let currentStreak = 0;
    const sortedActivities = [...activities].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    // Start from today and go backwards
    const todayDate = getTodayDateString();
    let checkDate = todayDate;
    
    for (let i = 0; i < sortedActivities.length; i++) {
      // If the date matches what we're looking for and has activity
      if (sortedActivities[i].date === checkDate && sortedActivities[i].minutesActive > 0) {
        currentStreak++;
        
        // Set check date to the previous day (need to use our own date manipulation to stay consistent)
        const prevDate = new Date(checkDate);
        prevDate.setDate(prevDate.getDate() - 1);
        checkDate = prevDate.getFullYear() + '-' + 
                   String(prevDate.getMonth() + 1).padStart(2, '0') + '-' + 
                   String(prevDate.getDate()).padStart(2, '0');
      } else {
        // Break if date doesn't match or no activity
        break;
      }
    }
    
    // Update the states
    setStreak(currentStreak);
    setActivityData(formattedActivities);
    setIsLoading(false);
    
    // Update the last refresh reference
    lastRefreshRef.current = now;
    
    console.log('Activity data loaded for dates:', formattedActivities.map(a => `${a.date} (${a.formattedDate}): ${a.minutes} mins`).join(', '));
  }, []);

  // Function to check if the date has changed since the last refresh
  const hasDateChanged = useCallback(() => {
    // Get the date of the last refresh in YYYY-MM-DD format
    const lastRefresh = lastRefreshRef.current;
    const lastRefreshDate = lastRefresh.getFullYear() + '-' + 
                           String(lastRefresh.getMonth() + 1).padStart(2, '0') + '-' + 
                           String(lastRefresh.getDate()).padStart(2, '0');
                           
    // Get today's date
    const currentDate = getTodayDateString();
    
    const dateChanged = lastRefreshDate !== currentDate;
    console.log(`Date check: last=${lastRefreshDate}, current=${currentDate}, changed=${dateChanged}`);
    
    return dateChanged;
  }, []);

  // Set up a function to schedule the next midnight refresh
  const scheduleMidnightRefresh = useCallback(() => {
    // Calculate time until next midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();
    console.log(`Scheduled refresh at midnight in ${timeUntilMidnight}ms (${tomorrow.toString()})`);
    
    // Set a timeout to refresh at midnight
    const midnightTimeout = setTimeout(() => {
      console.log('Midnight timeout triggered!');
      
      // Force refresh data at midnight
      loadActivityData();
      
      // Schedule the next midnight refresh
      scheduleMidnightRefresh();
    }, timeUntilMidnight);
    
    // Return cleanup function
    return () => clearTimeout(midnightTimeout);
  }, [loadActivityData]);

  useEffect(() => {
    console.log('useActivityData hook initialized');
    
    // Load data initially
    loadActivityData();
    
    // Also schedule refresh at midnight
    const cleanupMidnightTimeout = scheduleMidnightRefresh();
    
    // Set up a regular refresh interval (every minute)
    const refreshInterval = setInterval(() => {
      // Check if the date has changed since our last refresh
      if (hasDateChanged()) {
        console.log('Date has changed since last refresh, reloading data...');
        loadActivityData();
      }
    }, 60000);
    
    // Clean up all intervals and timeouts on unmount
    return () => {
      clearInterval(refreshInterval);
      cleanupMidnightTimeout();
      console.log('useActivityData hook cleanup');
    };
  }, [loadActivityData, scheduleMidnightRefresh, hasDateChanged]);
  
  return { activityData, isLoading, streak };
}; 