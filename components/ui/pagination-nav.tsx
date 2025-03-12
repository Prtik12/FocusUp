interface PaginationNavProps {
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  pageCount: number;
  isDisabled?: boolean;
}

export default function PaginationNav({ page, setPage, pageCount, isDisabled = false }: PaginationNavProps) {
  const handlePrevPage = () => {
    if (page > 1 && !isDisabled) {
      setPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (page < pageCount && !isDisabled) {
      setPage(prev => prev + 1);
    }
  };

  if (pageCount <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-4 mt-8">
      <button
        onClick={handlePrevPage}
        disabled={page === 1 || isDisabled}
        className={`px-4 py-2 rounded-md transition-colors ${
          page === 1 || isDisabled
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-[#4A3628] dark:bg-[#FAF3DD] text-[#FAF3DD] dark:text-[#4A3628] hover:bg-[#3a2b1f] dark:hover:bg-[#e3dcc9]'
        }`}
      >
        Previous
      </button>
      
      <span className="text-[#4A3628] dark:text-[#FAF3DD]">
        Page {page} of {pageCount}
      </span>
      
      <button
        onClick={handleNextPage}
        disabled={page === pageCount || isDisabled}
        className={`px-4 py-2 rounded-md transition-colors ${
          page === pageCount || isDisabled
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-[#4A3628] dark:bg-[#FAF3DD] text-[#FAF3DD] dark:text-[#4A3628] hover:bg-[#3a2b1f] dark:hover:bg-[#e3dcc9]'
        }`}
      >
        Next
      </button>
    </div>
  );
}
  