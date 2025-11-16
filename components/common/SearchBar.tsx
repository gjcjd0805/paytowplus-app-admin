import { ReactNode } from 'react';

interface SearchBarProps {
  children: ReactNode;
  onSearch: () => void;
  onReset: () => void;
}

export default function SearchBar({ children, onSearch, onReset }: SearchBarProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <div className="space-y-4">
        {children}
        <div className="flex justify-center space-x-2 pt-2">
          <button
            onClick={onSearch}
            className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
          >
            검색
          </button>
          <button
            onClick={onReset}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
          >
            초기화
          </button>
        </div>
      </div>
    </div>
  );
}
