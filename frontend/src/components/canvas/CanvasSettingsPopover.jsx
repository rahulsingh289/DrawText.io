import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Grid, 
  AlignLeft, 
  CircleDot, 
  Square, 
  Palette, 
  Layers, 
  Trash2, 
  FileSpreadsheet, 
  Sparkles,
  Sliders,
  Check
} from 'lucide-react';
import { useCanvasStore } from '../../store/useCanvasStore';

export const CanvasSettingsPopover = () => {
  const { 
    backgroundSettings, 
    setBackgroundSettings, 
    isBackgroundPopoverOpen, 
    setBackgroundPopoverOpen,
    clearBoard 
  } = useCanvasStore();

  const [activeTab, setActiveTab] = useState('style'); // 'style' | 'more'
  const popoverRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setBackgroundPopoverOpen(false);
      }
    };
    if (isBackgroundPopoverOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isBackgroundPopoverOpen]);

  if (!isBackgroundPopoverOpen) return null;

  const templates = [
    { id: 'grid', label: 'Grid', icon: Grid },
    { id: 'dots', label: 'Dots', icon: CircleDot },
    { id: 'ruled', label: 'Ruled', icon: AlignLeft },
    { id: 'blank', label: 'Blank', icon: Square },
  ];

  const bgColors = [
    { name: 'Dark Slate', hex: '#12141c', grid: '#262a3b' },
    { name: 'Midnight', hex: '#0b0d14', grid: '#1e2230' },
    { name: 'Deep Navy', hex: '#0f172a', grid: '#1e293b' },
    { name: 'Warm Cream', hex: '#fdfbf7', grid: '#ded9cf' },
    { name: 'Pure White', hex: '#ffffff', grid: '#e2e8f0' },
    { name: 'Emerald Night', hex: '#062e24', grid: '#0f483b' },
  ];

  const gridColors = [
    '#262a3b',
    '#333a4d',
    '#4b5563',
    '#6366f1',
    '#38bdf8',
    '#cbd5e1',
    '#e2e8f0',
  ];

  const spacings = [
    { id: 'small', label: 'Compact (20px)' },
    { id: 'medium', label: 'Standard (36px)' },
    { id: 'large', label: 'Wide (54px)' },
  ];

  return (
    <div 
      ref={popoverRef}
      className="absolute top-16 right-6 w-80 rounded-3xl glass-dropdown z-40 p-4 border border-slate-700/80 shadow-2xl animate-in fade-in zoom-in-95 duration-150 select-none"
    >
      {/* Header & Tabs */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('style')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'style' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Style
          </button>
          <button
            onClick={() => setActiveTab('more')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'more' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            More
          </button>
        </div>

        <button
          onClick={() => setBackgroundPopoverOpen(false)}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {activeTab === 'style' ? (
        <div className="py-3 space-y-4">
          {/* Template Selection */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Template Pattern
            </span>
            <div className="grid grid-cols-4 gap-2">
              {templates.map((t) => {
                const Icon = t.icon;
                const isSelected = backgroundSettings.template === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setBackgroundSettings({ template: t.id })}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-white ring-1 ring-indigo-500'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[10px] font-semibold">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Paper Background Color */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Paper Background Color
            </span>
            <div className="flex items-center gap-2.5">
              {bgColors.map((bg) => (
                <button
                  key={bg.name}
                  onClick={() => setBackgroundSettings({ backgroundColor: bg.hex, gridColor: bg.grid })}
                  title={bg.name}
                  className={`w-7 h-7 rounded-full border transition-all ${
                    backgroundSettings.backgroundColor === bg.hex
                      ? 'scale-125 border-indigo-400 ring-2 ring-indigo-500/50'
                      : 'border-slate-700 opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: bg.hex }}
                />
              ))}
            </div>
          </div>

          {/* Grid Color */}
          {backgroundSettings.template !== 'blank' && (
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Grid / Line Color
              </span>
              <div className="flex items-center gap-2">
                {gridColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setBackgroundSettings({ gridColor: color })}
                    className={`w-6 h-6 rounded-full border transition-all ${
                      backgroundSettings.gridColor === color
                        ? 'scale-125 border-indigo-400 ring-2 ring-indigo-500/50'
                        : 'border-slate-700 opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Grid Spacing */}
          {backgroundSettings.template !== 'blank' && (
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Grid Density / Spacing
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {spacings.map((sp) => {
                  const isSelected = backgroundSettings.spacing === sp.id;
                  return (
                    <button
                      key={sp.id}
                      onClick={() => setBackgroundSettings({ spacing: sp.id })}
                      className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold border transition-all ${
                        isSelected
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {sp.label.split(' ')[0]}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="py-3 space-y-4">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Board Actions
            </span>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all strokes and shapes on this whiteboard?')) {
                  clearBoard();
                  setBackgroundPopoverOpen(false);
                }
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-semibold text-xs transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear Entire Canvas</span>
            </button>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-1">
            <p className="font-semibold text-slate-300">Infinite Viewport</p>
            <p className="text-[11px]">Hold Space or use Middle-click / Two-finger scroll to pan infinitely.</p>
          </div>
        </div>
      )}
    </div>
  );
};
