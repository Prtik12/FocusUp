import { useState, useEffect, useCallback } from 'react';
import { format, subDays, parseISO, differenceInMilliseconds } from 'date-fns';
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
  const [lastRefreshDate, setLastRefreshDate] = useState<string>('');

  // Extract the loadActivityData logic to a callback so we can use it in multiple places
  const loadActivityData = useCallback(() => {
    setIsLoading(true);
    
    // Get data from localStorage
    const storedActivities = localStorage.getItem('userActivities');
    let activities: ActivityData[] = [];
    
    if (storedActivities) {
      activities = JSON.parse(storedActivities);
    }
    
    // Create a complete array for the last 7 days
    const today = new Date();
    const formattedActivities: FormattedActivity[] = [];
    
    // Fill with the last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const dateString = format(date, 'yyyy-MM-dd');
      const activity = activities.find(a => a.date === dateString);
      
      formattedActivities.push({
        date: dateString,
        minutes: activity ? activity.minutesActive : 0,
        formattedDate: format(date, 'MMM dd')
      });
    }
    
    // Calculate streak
    let currentStreak = 0;
    const sortedActivities = [...activities].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    // Start from today and go backwards
    const todayDate = format(today, 'yyyy-MM-dd');
    let checkDate = todayDate;
    
    for (let i = 0; i < sortedActivities.length; i++) {
      // If the date matches what we're looking for and has activity
      if (sortedActivities[i].date === checkDate && sortedActivities[i].minutesActive > 0) {
        currentStreak++;
        // Set check date to the previous day
        checkDate = format(subDays(parseISO(checkDate), 1), 'yyyy-MM-dd');
      } else {
        // Break if date doesn't match or no activity
        break;
      }
    }
    
    setStreak(currentStreak);
    setActivityData(formattedActivities);
    setIsLoading(false);
    
    // Update the last refresh date
    setLastRefreshDate(todayDate);
  }, []);

  // Set up a function to schedule the next midnight refresh
  const scheduleMidnightRefresh = useCallback(() => {
    // Calculate time until next midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const timeUntilMidnight = differenceInMilliseconds(tomorrow, now);
    
    // Set a timeout to refresh at midnight
    const midnightTimeout = setTimeout(() => {
      // Refresh data
      loadActivityData();
      
      // Schedule the next midnight refresh
      scheduleMidnightRefresh();
    }, timeUntilMidnight);
    
    // Return cleanup function
    return () => clearTimeout(midnightTimeout);
  }, [loadActivityData]);

  useEffect(() => {
    // Load data initially
    loadActivityData();
    
    // Also schedule refresh at midnight
    const cleanupMidnightTimeout = scheduleMidnightRefresh();
    
    // Set up a regular refresh interval (every minute)
    const refreshInterval = setInterval(() => {
      // Check if the date has changed since our last refresh
      const currentDate = format(new Date(), 'yyyy-MM-dd');
      
      // If the date has changed or it's the first load, refresh the data
      if (currentDate !== lastRefreshDate) {
        loadActivityData();
      }
    }, 60000);
    
    // Clean up all intervals and timeouts on unmount
    return () => {
      clearInterval(refreshInterval);
      cleanupMidnightTimeout();
    };
  }, [loadActivityData, scheduleMidnightRefresh, lastRefreshDate]);
  
  return { activityData, isLoading, streak };
}; 