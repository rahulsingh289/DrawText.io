import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Check, 
  LayoutGrid, 
  List as ListIcon, 
  Calendar, 
  Clock, 
  SortAsc,
  SlidersHorizontal
} from 'lucide-react';
import { useNotesStore } from '../../store/useNotesStore';

export const SortLayoutDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const {
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    viewMode,
    setViewMode,
  } = useNotesStore();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sortOptions = [
    { id: 'updatedAt', label: 'Date Modified', icon: Clock },
    { id: 'createdAt', label: 'Date Created', icon: Calendar },
    { id: 'name', label: 'Name (Title)', icon: SortAsc },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/80 transition-all shadow-sm"
      >
        <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
        <span className="capitalize">{sortOptions.find(o => o.id === sortBy)?.label || 'Sort'}</span>
        {sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-slate-400" /> : <ArrowDown className="w-3.5 h-3.5 text-slate-400" />}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 p-2 rounded-2xl glass-dropdown z-50 animate-in fade-in zoom-in-95 duration-100">
          {/* View Mode Toggle */}
          <div className="p-2 border-b border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              View Layout
            </span>
            <div className="grid grid-cols-2 gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'grid'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grid</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'list'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ListIcon className="w-3.5 h-3.5" />
                <span>List</span>
              </button>
            </div>
          </div>

          {/* Sort By Field */}
          <div className="p-2 border-b border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Sort By
            </span>
            <div className="space-y-0.5">
              {sortOptions.map((option) => {
                const isSelected = sortBy === option.id;
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={() => {
                      setSortBy(option.id);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      isSelected
                        ? 'bg-indigo-500/15 text-indigo-400 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 text-slate-400" />
                      <span>{option.label}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sort Direction */}
          <div className="p-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Order
            </span>
            <div className="space-y-0.5">
              <button
                onClick={() => setSortOrder('desc')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  sortOrder === 'desc'
                    ? 'bg-indigo-500/15 text-indigo-400 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ArrowDown className="w-3.5 h-3.5 text-slate-400" />
                  <span>Newest / Z to A</span>
                </div>
                {sortOrder === 'desc' && <Check className="w-3.5 h-3.5 text-indigo-400" />}
              </button>
              <button
                onClick={() => setSortOrder('asc')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  sortOrder === 'asc'
                    ? 'bg-indigo-500/15 text-indigo-400 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ArrowUp className="w-3.5 h-3.5 text-slate-400" />
                  <span>Oldest / A to Z</span>
                </div>
                {sortOrder === 'asc' && <Check className="w-3.5 h-3.5 text-indigo-400" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
