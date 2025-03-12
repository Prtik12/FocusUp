import { useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { StudyPlan } from '@/types/studyPlan';
import { toast } from 'sonner';

interface StudyPlanFormProps {
  userId: string;
  setStudyPlans: React.Dispatch<React.SetStateAction<StudyPlan[]>>;
  onPlanCreated?: () => void;
}

export default function StudyPlanForm({ userId, setStudyPlans, onPlanCreated }: StudyPlanFormProps) {
  const [subject, setSubject] = useState('');
  const [examDate, setExamDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = () => {
    const today = new Date();
    const selectedDate = new Date(examDate);
    
    if (!subject.trim()) {
      setError('Please enter a subject');
      return false;
    }
    
    if (!examDate) {
      setError('Please select an exam date');
      return false;
    }
    
    if (selectedDate < today) {
      setError('Exam date cannot be in the past');
      return false;
    }
    
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1);
    if (selectedDate > maxDate) {
      setError('Exam date cannot be more than 1 year in the future');
      return false;
    }
    
    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const newPlan = await apiClient.createStudyPlan(userId, subject, examDate);
      console.log("Newly Created Study Plan:", newPlan);
      
      setStudyPlans((prev) => [newPlan, ...prev]);
      setSubject('');
      setExamDate('');
      toast.success('Study plan created successfully!');
      onPlanCreated?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
      toast.error('Failed to create study plan', {
        description: errorMessage
      });
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-[#4a3628] p-6 rounded-lg shadow-md border border-[#4A3628] dark:border-[#FAF3DD]">
      <div className="space-y-2">
        <label htmlFor="subject" className="block text-sm font-medium text-[#4A3628] dark:text-[#FAF3DD]">
          Subject or Topic
        </label>
        <input
          id="subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g., Mathematics, History, Programming"
          className="w-full p-2 border rounded-md bg-[#FAF3DD] dark:bg-[#4a3628] text-[#4A3628] dark:text-[#FAF3DD] placeholder-gray-400"
          required
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Enter the main subject or topic you want to study
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="examDate" className="block text-sm font-medium text-[#4A3628] dark:text-[#FAF3DD]">
          Target Completion Date
        </label>
        <input
          id="examDate"
          type="date"
          value={examDate}
          onChange={(e) => setExamDate(e.target.value)}
          className="w-full p-2 border rounded-md bg-[#FAF3DD] dark:bg-[#4a3628] text-[#4A3628] dark:text-[#FAF3DD]"
          min={new Date().toISOString().split('T')[0]}
          required
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Select your target date for completing this subject
        </p>
      </div>

      {error && (
        <div className="text-red-500 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-2 px-4 rounded-md transition-colors ${
          loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-[#4A3628] dark:bg-[#FAF3DD] text-[#FAF3DD] dark:text-[#4A3628] hover:bg-[#3a2b1f] dark:hover:bg-[#e3dcc9]'
        }`}
      >
        {loading ? 'Generating Study Plan...' : 'Generate Study Plan'}
      </button>

      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        <p>Your study plan will include:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Detailed weekly breakdown</li>
          <li>Daily study goals</li>
          <li>Recommended resources</li>
          <li>Progress tracking milestones</li>
        </ul>
      </div>
    </form>
  );
}
