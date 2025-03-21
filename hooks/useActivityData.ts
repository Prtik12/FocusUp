import { useState, useEffect } from 'react';
import { format, subDays, parseISO } from 'date-fns';
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

  useEffect(() => {
    const loadActivityData = () => {
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
    };
    
    loadActivityData();
    
    // Set up a refresh interval (every minute)
    const refreshInterval = setInterval(loadActivityData, 60000);
    
    return () => clearInterval(refreshInterval);
  }, []);
  
  return { activityData, isLoading, streak };
}; 