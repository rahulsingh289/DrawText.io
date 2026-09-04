import React, { useState } from 'react';
import { 
  Palette, 
  Sliders, 
  Check, 
  Trash2, 
  Box, 
  Sparkles, 
  Eraser, 
  Type,
  StickyNote,
  ArrowRight,
  ArrowLeftRight,
  Minus,
  Sparkle
} from 'lucide-react';
import { useCanvasStore, PALETTE_COLORS, STICKY_COLORS } from '../../store/useCanvasStore';

export const BottomColorBar = () => {
  const { 
    currentColor, 
    setCurrentColor, 
    currentSize, 
    setCurrentSize, 
    currentOpacity, 
    setCurrentOpacity,
    eraserSize = 24,
    setEraserSize,
    shapeFill,
    setShapeFill,
    inkMode = 'permanent',
    toggleInkMode,
    activeTool,
    clearBoard,
    quickColorSlots = ['#ffffff', '#38bdf8', '#fb923c'],
    strokeStyle = 'solid',
    setStrokeStyle,
    strokeRoughness = 'clean',
    setStrokeRoughness,
    arrowHead = 'end',
    setArrowHead,
    stickyColor = '#fef08a',
    setStickyColor,
  } = useCanvasStore();

  const [showSliders, setShowSliders] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  // Hide color bar when in Pan / Hand mode
  if (activeTool === 'hand') return null;

  // 1. Dedicated Eraser Mode UI
  if (activeTool === 'eraser') {
    const eraserSizes = [
      { label: 'Fine', size: 12 },
      { label: 'Medium', size: 24 },
      { label: 'Thick', size: 48 },
      { label: 'Max', size: 72 },
    ];

    return (
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 select-none animate-in fade-in slide-in-from-bottom-4 duration-150">
        <div className="glass-panel px-4 py-2 rounded-full border border-rose-500/30 shadow-2xl flex items-center gap-3 backdrop-blur-xl bg-slate-950/85">
          <div className="flex items-center gap-1.5 text-xs text-rose-400 font-semibold px-2">
            <Eraser className="w-4 h-4" />
            <span>Eraser</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-full border border-slate-800">
            {eraserSizes.map((es) => {
              const isSelected = eraserSize === es.size;
              return (
                <button
                  key={es.label}
                  onClick={() => setEraserSize(es.size)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 scale-105'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {es.label} ({es.size}px)
                </button>
              );
            })}
          </div>

          <div className="w-px h-5 bg-slate-800 mx-1" />

          {confirmClear ? (
            <div className="flex items-center gap-1.5 animate-in fade-in">
              <button
                onClick={() => {
                  clearBoard();
                  setConfirmClear(false);
                }}
                className="px-3 py-1 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/40 transition-transform active:scale-95"
              >
                Confirm Clear
              </button>
              <button
                onClick={() => setConfirmClear(false)}
                className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmClear(true)}
              title="Clear all drawings on board"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // 2. Dedicated Text Annotation Mode UI
  if (activeTool === 'text') {
    const textSizes = [
      { label: 'S', size: 16 },
      { label: 'M', size: 22 },
      { label: 'L', size: 32 },
      { label: 'XL', size: 48 },
    ];

    return (
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 select-none animate-in fade-in slide-in-from-bottom-4 duration-150">
        <div className="glass-panel px-4 py-2 rounded-full border border-indigo-500/40 shadow-2xl flex items-center gap-3 backdrop-blur-xl bg-slate-950/85">
          <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-semibold px-2">
            <Type className="w-4 h-4" />
            <span>Text Note</span>
          </div>

          <div className="w-px h-5 bg-slate-800" />

          {/* Quick Font Size Buttons */}
          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-full border border-slate-800">
            {textSizes.map((ts) => {
              const isSelected = Math.abs(currentSize * 4 - ts.size) < 4 || currentSize === ts.size;
              return (
                <button
                  key={ts.label}
                  onClick={() => setCurrentSize(Math.round(ts.size / 4))}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md scale-105'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {ts.label} ({ts.size}px)
                </button>
              );
            })}
          </div>

          <div className="w-px h-5 bg-slate-800" />

          {/* Quick Color Swatches for Text */}
          <div className="flex items-center gap-1.5">
            {PALETTE_COLORS.slice(0, 7).map((color) => {
              const isSelected = currentColor.toLowerCase() === color.toLowerCase();
              return (
                <button
                  key={color}
                  onClick={() => setCurrentColor(color)}
                  className={`w-6 h-6 rounded-full border transition-all relative flex items-center justify-center ${
                    isSelected
                      ? 'scale-110 border-white ring-2 ring-indigo-500 shadow-md'
                      : 'border-slate-700/60 hover:scale-105 opacity-85 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: color }}
                >
                  {isSelected && (
                    <Check 
                      className={`w-3 h-3 ${color === '#ffffff' || color === '#f8fafc' || color === '#facc15' ? 'text-black' : 'text-white'}`} 
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Custom Hex Color Picker */}
          <label className="relative w-6 h-6 rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 cursor-pointer flex items-center justify-center hover:scale-110 transition-transform shadow-md ring-1 ring-white/20">
            <Palette className="w-3 h-3 text-white" />
            <input
              type="color"
              value={currentColor}
              onChange={(e) => setCurrentColor(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </label>
        </div>
      </div>
    );
  }

  // 3. Dedicated Sticky Note (Post-it) Mode UI
  if (activeTool === 'sticky') {
    return (
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 select-none animate-in fade-in slide-in-from-bottom-4 duration-150">
        <div className="glass-panel px-4 py-2 rounded-full border border-amber-500/40 shadow-2xl flex items-center gap-3 backdrop-blur-xl bg-slate-950/85">
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold px-2">
            <StickyNote className="w-4 h-4" />
            <span>Sticky Note Color</span>
          </div>

          <div className="w-px h-5 bg-slate-800" />

          {/* Sticky Pastel Swatches */}
          <div className="flex items-center gap-2">
            {STICKY_COLORS.map((col) => {
              const isSelected = stickyColor === col;
              return (
                <button
                  key={col}
                  onClick={() => setStickyColor(col)}
                  className={`w-7 h-7 rounded-xl border transition-all relative flex items-center justify-center shadow-md ${
                    isSelected
                      ? 'scale-110 border-white ring-2 ring-amber-400 shadow-amber-500/30'
                      : 'border-slate-700/60 hover:scale-105 opacity-90 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: col }}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 text-slate-900 font-bold" />}
                </button>
              );
            })}
          </div>

          <div className="w-px h-5 bg-slate-800" />
          <span className="text-[11px] text-slate-400 font-medium px-1">
            Click anywhere on canvas to place note
          </span>
        </div>
      </div>
    );
  }

  const isShapeTool = [
    'rect', 'circle', 'triangle', 'diamond', 'star', 'arrow', 'line', 'capsule', 'cylinder', 'cloud'
  ].includes(activeTool);
  const quickSizes = [2, 5, 10, 20, 36];

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2.5 select-none animate-in fade-in slide-in-from-bottom-4 duration-150">
      {/* Expanded Slider Controls Panel */}
      {showSliders && (
        <div className="glass-panel px-6 py-3.5 rounded-3xl border border-indigo-500/40 shadow-2xl flex items-center gap-6 text-xs text-slate-200 backdrop-blur-xl bg-slate-950/90 animate-in zoom-in-95 duration-150">
          {/* Quick Size Presets & Slider */}
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-400">Thickness:</span>
            
            {/* Quick Size Pills */}
            <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
              {quickSizes.map((sz) => (
                <button
                  key={sz}
                  onClick={() => setCurrentSize(sz)}
                  className={`w-6 h-6 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center ${
                    currentSize === sz
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>

            <input
              type="range"
              min="1"
              max="48"
              value={currentSize}
              onChange={(e) => setCurrentSize(Number(e.target.value))}
              className="w-24 accent-indigo-500 cursor-pointer"
            />
            <span className="w-8 font-mono text-indigo-400 font-bold">{currentSize}px</span>

            {/* Dynamic visual preview dot */}
            <div className="w-7 h-7 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center overflow-hidden shadow-inner">
              <div 
                className="rounded-full transition-all"
                style={{ 
                  backgroundColor: currentColor,
                  width: Math.min(22, Math.max(2, currentSize)), 
                  height: Math.min(22, Math.max(2, currentSize)) 
                }}
              />
            </div>
          </div>

          <div className="w-px h-6 bg-slate-800" />

          {/* Opacity Slider */}
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-400">Opacity:</span>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={currentOpacity}
              onChange={(e) => setCurrentOpacity(Number(e.target.value))}
              className="w-20 accent-indigo-500 cursor-pointer"
            />
            <span className="w-9 font-mono text-indigo-400 font-bold">{Math.round(currentOpacity * 100)}%</span>
          </div>
        </div>
      )}

      {/* Main Streamlined Luxury Bottom Color Bar */}
      <div className="glass-panel px-3.5 py-2 rounded-full border border-slate-700/80 shadow-2xl flex items-center gap-2.5 backdrop-blur-xl bg-slate-950/85">
        {/* 3 Quick-Switch Favorite Color Wells */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 px-2 py-1 rounded-full border border-slate-800/80">
          {quickColorSlots.map((c, i) => {
            const isSelected = currentColor.toLowerCase() === c.toLowerCase();
            return (
              <button
                key={`${c}-${i}`}
                onClick={() => setCurrentColor(c)}
                title={`Favorite Color ${i + 1} (${c})`}
                className={`w-6 h-6 rounded-full transition-all relative flex items-center justify-center shadow-md ${
                  isSelected
                    ? 'scale-110 ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-950 z-10'
                    : 'hover:scale-105 opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: c }}
              >
                {isSelected && (
                  <span className={`w-1.5 h-1.5 rounded-full ${c === '#ffffff' || c === '#facc15' ? 'bg-black' : 'bg-white'}`} />
                )}
              </button>
            );
          })}
        </div>

        <div className="w-px h-5 bg-slate-800" />

        {/* Curated Palette Color Swatches */}
        <div className="flex items-center gap-1.5">
          {PALETTE_COLORS.map((color) => {
            const isSelected = currentColor.toLowerCase() === color.toLowerCase();
            return (
              <button
                key={color}
                onClick={() => setCurrentColor(color)}
                className={`w-7 h-7 rounded-full border transition-all relative flex items-center justify-center ${
                  isSelected
                    ? 'scale-110 border-white ring-2 ring-indigo-500 shadow-lg shadow-indigo-500/30'
                    : 'border-slate-700/60 hover:scale-105 opacity-85 hover:opacity-100'
                }`}
                style={{ backgroundColor: color }}
              >
                {isSelected && (
                  <Check 
                    className={`w-3.5 h-3.5 ${color === '#ffffff' || color === '#f8fafc' || color === '#facc15' ? 'text-black' : 'text-white'}`} 
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Native Custom Hex Color Input */}
        <label className="relative w-7 h-7 rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 cursor-pointer flex items-center justify-center hover:scale-110 transition-transform shadow-md ring-1 ring-white/20">
          <Palette className="w-3.5 h-3.5 text-white" />
          <input
            type="color"
            value={currentColor}
            onChange={(e) => setCurrentColor(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
        </label>

        <div className="w-px h-5 bg-slate-800" />

        {/* Draw.io Stroke Style (Solid, Dashed, Dotted) */}
        {isShapeTool && (
          <div className="flex items-center gap-1 bg-slate-900/90 p-0.5 rounded-full border border-slate-800">
            <button
              onClick={() => setStrokeStyle('solid')}
              title="Solid line"
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold transition-all ${
                strokeStyle === 'solid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              —
            </button>
            <button
              onClick={() => setStrokeStyle('dashed')}
              title="Dashed line"
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold transition-all ${
                strokeStyle === 'dashed' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              --
            </button>
            <button
              onClick={() => setStrokeStyle('dotted')}
              title="Dotted line"
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold transition-all ${
                strokeStyle === 'dotted' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              ···
            </button>
          </div>
        )}

        {/* Arrowhead selector (when arrow or line tool is active) */}
        {(activeTool === 'arrow' || activeTool === 'line') && (
          <div className="flex items-center gap-1 bg-slate-900/90 p-0.5 rounded-full border border-slate-800">
            <button
              onClick={() => setArrowHead('none')}
              title="No arrowhead"
              className={`p-1 rounded-full text-[10px] transition-all ${
                arrowHead === 'none' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Minus className="w-3 h-3" />
            </button>
            <button
              onClick={() => setArrowHead('end')}
              title="Single Arrowhead (End)"
              className={`p-1 rounded-full text-[10px] transition-all ${
                arrowHead === 'end' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowRight className="w-3 h-3" />
            </button>
            <button
              onClick={() => setArrowHead('both')}
              title="Double Arrowhead (Both Ends)"
              className={`p-1 rounded-full text-[10px] transition-all ${
                arrowHead === 'both' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowLeftRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Shape Fill Toggle (when shape tool is active) */}
        {isShapeTool && (
          <button
            onClick={() => setShapeFill(!shapeFill)}
            title={shapeFill ? 'Shape Fill: ON (translucent fill)' : 'Shape Fill: OFF (outline only)'}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              shapeFill
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>{shapeFill ? 'Fill: On' : 'Fill: Off'}</span>
          </button>
        )}

        {/* Ink Mode Toggle (when pen is active) */}
        {(activeTool === 'pen' || activeTool === 'highlighter') && (
          <button
            onClick={toggleInkMode}
            title={inkMode === 'disappearing' ? 'Ink Mode: Hover / Disappearing (Strokes fade in 1.5s)' : 'Ink Mode: Permanent Mark'}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              inkMode === 'disappearing'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/40 ring-1 ring-amber-300 animate-pulse'
                : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{inkMode === 'disappearing' ? 'Hover Mark' : 'Permanent'}</span>
          </button>
        )}

        {/* Stroke Sliders & HUD Toggle Button */}
        <button
          onClick={() => setShowSliders(!showSliders)}
          title="Adjust stroke size & opacity"
          className={`p-1.5 rounded-full transition-all ${
            showSliders 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40 scale-105' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
