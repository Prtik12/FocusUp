import { useState } from "react";
import { apiClient } from "@/lib/api-client";
import { StudyPlan } from "@/types/studyPlan";
import { toast } from "sonner";
import { Calendar, BookOpen } from "lucide-react";

interface StudyPlanFormProps {
  userId: string;
  setStudyPlans: React.Dispatch<React.SetStateAction<StudyPlan[]>>;
  onPlanCreated?: (newPlan: StudyPlan) => void;
}

export default function StudyPlanForm({
  userId,
  setStudyPlans,
  onPlanCreated,
}: StudyPlanFormProps) {
  const [subject, setSubject] = useState("");
  const [examDate, setExamDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = () => {
    try {
      // Use local date with time set to start of day
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check subject
      if (!subject.trim()) {
        setError("Please enter a subject");
        return false;
      }

      // Check if examDate is provided
      if (!examDate) {
        setError("Please select an exam date");
        return false;
      }

      // Validate date format
      const datePattern = /^\d{4}-\d{2}-\d{2}$/;
      if (!datePattern.test(examDate)) {
        setError("Invalid date format. Please use YYYY-MM-DD");
        return false;
      }

      // Parse date and ensure it's in local timezone
      const [year, month, day] = examDate.split('-').map(Number);
      const selectedDate = new Date(year, month - 1, day);
      selectedDate.setHours(0, 0, 0, 0);

      // Check if valid date
      if (isNaN(selectedDate.getTime())) {
        setError("Invalid date. Please select a valid date");
        return false;
      }

      // Check if in the past
      if (selectedDate < today) {
        setError("Exam date cannot be in the past");
        return false;
      }

      // Check if more than 1 year in the future
      const maxDate = new Date(today);
      maxDate.setFullYear(maxDate.getFullYear() + 1);
      if (selectedDate > maxDate) {
        setError("Exam date cannot be more than 1 year in the future");
        return false;
      }

      setError(null);
      return true;
    } catch (err) {
      console.error("Date validation error:", err);
      setError("An error occurred during validation. Please try again.");
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const newPlan = await apiClient.createStudyPlan(
        userId,
        subject,
        examDate,
      );

      // Update local state
      setStudyPlans((prev) => [newPlan, ...prev]);

      // Reset form
      setSubject("");
      setExamDate("");

      // Show success message
      toast.success("Study plan created successfully!");

      // Pass the new plan to the callback
      if (onPlanCreated) {
        onPlanCreated(newPlan);
      }
    } catch (err) {
      console.error("Error creating study plan:", err);
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      toast.error("Failed to create study plan", {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#FAF3DD] dark:bg-[#2A1F1A] p-8 rounded-xl shadow-sm"
    >
      <div className="space-y-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <BookOpen className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="What do you want to study?"
            className="w-full pl-10 pr-4 py-3 border-0 border-b-2 border-gray-200 dark:border-gray-700 focus:border-[#4A3628] dark:focus:border-[#FAF3DD] bg-transparent text-[#4A3628] dark:text-[#FAF3DD] placeholder-gray-400 focus:ring-0 transition-colors"
            required
          />
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="examDate"
            type="date"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-0 border-b-2 border-gray-200 dark:border-gray-700 focus:border-[#4A3628] dark:focus:border-[#FAF3DD] bg-transparent text-[#4A3628] dark:text-[#FAF3DD] focus:ring-0 transition-colors custom-cursor"
            min={new Date().toISOString().split("T")[0]} // Using ISO string for min date
            required
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm font-semibold p-2 bg-red-50 dark:bg-red-900/20 rounded-md">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-4 rounded-lg transition-all ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#4A3628] dark:bg-[#FAF3DD] text-[#FAF3DD] dark:text-[#4A3628] hover:bg-[#3a2b1f] dark:hover:bg-[#e3dcc9] hover:shadow-md"
          }`}
        >
          {loading ? "Generating..." : "Generate Plan"}
        </button>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-[#4A3628] dark:bg-[#FAF3DD]"></div>
            <span>Weekly breakdown</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-[#4A3628] dark:bg-[#FAF3DD]"></div>
            <span>Daily goals</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-[#4A3628] dark:bg-[#FAF3DD]"></div>
            <span>Study resources</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-[#4A3628] dark:bg-[#FAF3DD]"></div>
            <span>Progress tracking</span>
          </div>
        </div>
      </div>
    </form>
  );
}
