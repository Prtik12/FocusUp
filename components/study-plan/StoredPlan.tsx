interface StoredPlanProps {
    plan: {
      id: string;
      content: string;
      subject: string;
      examDate: string;
      createdAt: string;
    };
    onDelete: (id: string) => void;
    deleteInProgress?: boolean;
  }
  
  export default function StoredPlan({ plan, onDelete, deleteInProgress = false }: StoredPlanProps) {
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };
  
    const handleDelete = async () => {
      try {
        await onDelete(plan.id);
      } catch (error) {
        console.error('Error deleting study plan:', error);
        // You can add toast notification here for error feedback
      }
    };
  
    return (
      <div className="bg-white dark:bg-[#4a3628] border border-[#4A3628] dark:border-[#FAF3DD] p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-[#4A3628] dark:text-[#FAF3DD] mb-1">
              {plan.subject}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Target Date: {formatDate(plan.examDate)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Created: {formatDate(plan.createdAt)}
            </p>
          </div>
          <button
            onClick={handleDelete}
            disabled={deleteInProgress}
            className={`text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors ${
              deleteInProgress ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            aria-label="Delete study plan"
          >
            {deleteInProgress ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-red-500"></div>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
  
        <div className="prose prose-sm dark:prose-invert max-w-none mt-4">
          <div className="whitespace-pre-line text-[#4A3628] dark:text-[#FAF3DD] leading-relaxed">
            {plan.content}
          </div>
        </div>
      </div>
    );
  }
  