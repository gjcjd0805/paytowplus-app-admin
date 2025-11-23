"use client";

import { ReactNode } from "react";

interface SearchSectionProps {
  children: ReactNode;
}

export function SearchSection({ children }: SearchSectionProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 mb-4 overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-stretch md:divide-x divide-gray-200">
        {children}
      </div>
    </div>
  );
}

interface SearchFieldProps {
  label: string;
  children: ReactNode;
  className?: string;
}

export function SearchField({ label, children, className = "" }: SearchFieldProps) {
  return (
    <div className={`px-4 py-3 border-b md:border-b-0 last:border-b-0 ${className}`}>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
          {label}
        </label>
        <div className="flex items-center">
          {children}
        </div>
      </div>
    </div>
  );
}

interface DateRangeProps {
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (date: string) => void;
  onDateToChange: (date: string) => void;
  disabled?: boolean;
}

export function DateRange({ dateFrom, dateTo, onDateFromChange, onDateToChange, disabled = false }: DateRangeProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
      <input
        type="date"
        value={dateFrom}
        onChange={(e) => onDateFromChange(e.target.value)}
        disabled={disabled}
        className="w-full sm:w-auto px-3 py-1.5 border border-gray-300 rounded text-sm disabled:bg-gray-100 disabled:text-gray-500"
      />
      <span className="text-gray-400 hidden sm:inline">~</span>
      <input
        type="date"
        value={dateTo}
        onChange={(e) => onDateToChange(e.target.value)}
        disabled={disabled}
        className="w-full sm:w-auto px-3 py-1.5 border border-gray-300 rounded text-sm disabled:bg-gray-100 disabled:text-gray-500"
      />
    </div>
  );
}

interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupProps {
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  name: string;
}

export function RadioGroup({ options, value, onChange, name }: RadioGroupProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 sm:gap-4">
      {options.map((option) => (
        <label key={option.value} className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name={name}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="w-4 h-4 text-blue-600 cursor-pointer"
          />
          <span className="text-sm text-gray-700 whitespace-nowrap">{option.label}</span>
        </label>
      ))}
    </div>
  );
}

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  onReset: () => void;
  placeholder?: string;
}

export function SearchInput({ value, onChange, onSearch, onReset, placeholder = "검색어를 입력해 주세요." }: SearchInputProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm"
        onKeyPress={(e) => e.key === 'Enter' && onSearch()}
      />
      <div className="flex gap-2">
        <button
          onClick={onSearch}
          className="flex-1 sm:flex-none px-5 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded text-sm font-medium whitespace-nowrap transition-colors"
        >
          검색
        </button>
        <button
          onClick={onReset}
          className="flex-1 sm:flex-none px-5 py-1.5 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded text-sm font-medium whitespace-nowrap transition-colors"
        >
          초기화
        </button>
      </div>
    </div>
  );
}

interface SearchOption {
  value: string;
  label: string;
}

interface SearchInputWithSelectProps {
  searchType: string;
  searchValue: string;
  onSearchTypeChange: (type: string) => void;
  onSearchValueChange: (value: string) => void;
  onSearch: () => void;
  onReset: () => void;
  options: SearchOption[];
  placeholder?: string;
}

export function SearchInputWithSelect({
  searchType,
  searchValue,
  onSearchTypeChange,
  onSearchValueChange,
  onSearch,
  onReset,
  options,
  placeholder = "검색어를 입력해 주세요.",
}: SearchInputWithSelectProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
      <div className="flex gap-2 flex-1">
        <select
          value={searchType}
          onChange={(e) => onSearchTypeChange(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 rounded text-sm bg-white w-auto"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchValueChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm min-w-0"
          onKeyPress={(e) => e.key === 'Enter' && onSearch()}
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={onSearch}
          className="flex-1 sm:flex-none px-5 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded text-sm font-medium whitespace-nowrap transition-colors"
        >
          검색
        </button>
        <button
          onClick={onReset}
          className="flex-1 sm:flex-none px-5 py-1.5 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded text-sm font-medium whitespace-nowrap transition-colors"
        >
          초기화
        </button>
      </div>
    </div>
  );
}
