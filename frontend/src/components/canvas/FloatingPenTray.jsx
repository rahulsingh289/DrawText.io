import React, { useState, useRef, useEffect } from 'react';
import { 
  Pen, 
  PenTool, 
  Highlighter, 
  Eraser, 
  Sparkles, 
  Flame, 
  Hand,
  Type,
  Square,
  Circle,
  Triangle,
  Star,
  ArrowRight,
  Minus,
  Lasso,
  LassoSelect,
  Layers,
  Zap,
  Pencil,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Shapes as ShapesIcon,
  ChevronsUpDown,
  StickyNote,
  Database,
  Cloud,
  Pill,
  Wand2
} from 'lucide-react';
import { useCanvasStore, PEN_PRESETS, STICKY_COLORS } from '../../store/useCanvasStore';

export const FloatingPenTray = () => {
  const { 
    activeTool, 
    activePresetId, 
    setActivePreset, 
    setActiveTool, 
    currentColor,
    presetColors = {},
    inkMode,
    toggleInkMode,
    activeShapeType = 'rect',
    setActiveShapeType,
    activeLassoType = 'lasso_rect',
    setActiveLassoType,
    stickyColor = '#fef08a',
    setStickyColor,
    strokeRoughness = 'clean',
    setStrokeRoughness,
  } = useCanvasStore();

  // State: whether pen section is in compact mode (1 active pen) or full expanded mode (all pens shown)
  const [isPensCompact, setIsPensCompact] = useState(false);
  const [isPenFlyoutOpen, setIsPenFlyoutOpen] = useState(false);
  const [isShapesFlyoutOpen, setIsShapesFlyoutOpen] = useState(false);
  const [isLassoFlyoutOpen, setIsLassoFlyoutOpen] = useState(false);
  const [isStickyFlyoutOpen, setIsStickyFlyoutOpen] = useState(false);
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);

  const penRef = useRef(null);
  const shapesRef = useRef(null);
  const lassoRef = useRef(null);
  const stickyRef = useRef(null);

  // Close flyouts on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (penRef.current && !penRef.current.contains(e.target)) {
        setIsPenFlyoutOpen(false);
      }
      if (shapesRef.current && !shapesRef.current.contains(e.target)) {
        setIsShapesFlyoutOpen(false);
      }
      if (lassoRef.current && !lassoRef.current.contains(e.target)) {
        setIsLassoFlyoutOpen(false);
      }
      if (stickyRef.current && !stickyRef.current.contains(e.target)) {
        setIsStickyFlyoutOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPresetIcon = (presetId) => {
    switch (presetId) {
      case 'pen_fine': return PenTool;
      case 'pen_medium': return Pen;
      case 'pen_marker': return Flame;
      case 'pen_neon': return Zap;
      case 'pen_pencil': return Pencil;
      case 'pen_highlighter': return Highlighter;
      case 'tool_eraser': return Eraser;
      case 'tool_laser': return Sparkles;
      default: return Pen;
    }
  };

  const getShapeIcon = (shapeId) => {
    switch (shapeId) {
      case 'rect': return Square;
      case 'circle': return Circle;
      case 'triangle': return Triangle;
      case 'diamond': return Layers;
      case 'star': return Star;
      case 'arrow': return ArrowRight;
      case 'line': return Minus;
      case 'capsule': return Pill;
      case 'cylinder': return Database;
      case 'cloud': return Cloud;
      default: return ShapesIcon;
    }
  };

  const allShapes = [
    { id: 'rect', label: 'Process / Box', shortcut: 'R', icon: Square, group: 'Standard' },
    { id: 'diamond', label: 'Decision (Diamond)', shortcut: 'D', icon: Layers, group: 'Flowchart' },
    { id: 'capsule', label: 'Terminator (Capsule)', shortcut: '', icon: Pill, group: 'Flowchart' },
    { id: 'cylinder', label: 'Database Cylinder', shortcut: '', icon: Database, group: 'Flowchart' },
    { id: 'cloud', label: 'Cloud Node', shortcut: '', icon: Cloud, group: 'Flowchart' },
    { id: 'circle', label: 'Circle', shortcut: 'C', icon: Circle, group: 'Standard' },
    { id: 'triangle', label: 'Triangle', shortcut: '', icon: Triangle, group: 'Standard' },
    { id: 'star', label: 'Star', shortcut: '', icon: Star, group: 'Standard' },
    { id: 'arrow', label: 'Connector Arrow', shortcut: 'A', icon: ArrowRight, group: 'Connectors' },
    { id: 'line', label: 'Straight Line', shortcut: '', icon: Minus, group: 'Connectors' },
  ];

  const currentPreset = PEN_PRESETS.find((p) => p.id === activePresetId) || PEN_PRESETS[0];
  const ActivePenIcon = getPresetIcon(currentPreset.id);
  const isPenToolActive = ['pen', 'highlighter', 'laser'].includes(activeTool);
  const activePenColor = presetColors[currentPreset.id] || currentColor;

  const isShapeActive = [
    'rect', 'circle', 'triangle', 'diamond', 'star', 'arrow', 'line', 'capsule', 'cylinder', 'cloud'
  ].includes(activeTool);
  const ActiveShapeIcon = getShapeIcon(activeShapeType);

  const isLassoActive = activeTool === 'lasso_rect' || activeTool === 'lasso_free';
  const isStickyActive = activeTool === 'sticky';

  // If dock is completely collapsed into mini pill
  if (isDockCollapsed) {
    return (
      <div className="absolute left-6 top-1/2 -translate-y-1/2 z-30 select-none animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={() => setIsDockCollapsed(false)}
          title="Expand Toolbar"
          className="glass-panel w-11 h-14 rounded-2xl border border-indigo-500/40 shadow-2xl flex flex-col items-center justify-center gap-1 text-slate-300 hover:text-white hover:border-indigo-400 transition-all hover:scale-105 active:scale-95 bg-slate-950/90"
        >
          <Maximize2 className="w-4 h-4 text-indigo-400" />
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: activePenColor }} />
        </button>
      </div>
    );
  }

  return (
    <div className="absolute left-6 top-1/2 -translate-y-1/2 z-30 flex items-start gap-3 select-none">
      {/* Main Floating Tool Dock */}
      <div className="glass-panel p-2 rounded-3xl shadow-2xl border border-slate-700/80 flex flex-col items-center gap-1.5 backdrop-blur-xl bg-slate-950/90 animate-in fade-in slide-in-from-left-4 duration-150 max-h-[92vh] overflow-y-auto custom-scrollbar">
        
        {/* Dock Minimize / Expand Pill Button */}
        <button
          onClick={() => setIsDockCollapsed(true)}
          title="Minimize dock to floating pill"
          className="w-10 h-6 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
        >
          <Minimize2 className="w-3.5 h-3.5" />
        </button>

        {/* 1. Navigation / Pan Hand Tool */}
        <button
          onClick={() => {
            setActiveTool('hand');
            setIsPenFlyoutOpen(false);
            setIsShapesFlyoutOpen(false);
            setIsLassoFlyoutOpen(false);
            setIsStickyFlyoutOpen(false);
          }}
          title="Pan / Hand Tool (H or Space + Drag)"
          className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
            activeTool === 'hand'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40 scale-105'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
          }`}
        >
          <Hand className="w-4 h-4" />
        </button>

        {/* 2. Lasso Selection Tool (Square & Freehand) */}
        <div className="relative" ref={lassoRef}>
          <button
            onClick={() => {
              if (isLassoActive) {
                setIsLassoFlyoutOpen(!isLassoFlyoutOpen);
              } else {
                setActiveTool(activeLassoType);
                setIsPenFlyoutOpen(false);
                setIsShapesFlyoutOpen(false);
                setIsStickyFlyoutOpen(false);
              }
            }}
            title={`Lasso Select (${activeLassoType === 'lasso_rect' ? 'Box Select [S]' : 'Freehand [F]'})`}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all relative ${
              isLassoActive
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40 scale-105'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
            }`}
          >
            {activeLassoType === 'lasso_rect' ? (
              <LassoSelect className="w-4 h-4" />
            ) : (
              <Lasso className="w-4 h-4" />
            )}
            <span className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-slate-400/60" />
          </button>

          {/* Lasso Flyout */}
          {isLassoFlyoutOpen && (
            <div className="absolute left-full ml-3 top-0 glass-panel p-2 rounded-2xl border border-slate-700/80 shadow-2xl flex flex-col gap-1 z-50 min-w-[150px] bg-slate-950/95 animate-in fade-in slide-in-from-left-2 duration-150">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                Select Tool
              </span>
              <button
                onClick={() => {
                  setActiveLassoType('lasso_rect');
                  setIsLassoFlyoutOpen(false);
                }}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeLassoType === 'lasso_rect' && isLassoActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <LassoSelect className="w-4 h-4 text-indigo-400" />
                <span>Box Select (S)</span>
              </button>
              <button
                onClick={() => {
                  setActiveLassoType('lasso_free');
                  setIsLassoFlyoutOpen(false);
                }}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeLassoType === 'lasso_free' && isLassoActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <Lasso className="w-4 h-4 text-indigo-400" />
                <span>Freehand (F)</span>
              </button>
            </div>
          )}
        </div>

        <div className="w-5 h-px bg-slate-800 my-0.5" />

        {/* --- PENS SECTION --- */}
        <div className="flex items-center justify-between w-full px-1">
          <button
            onClick={() => setIsPensCompact(!isPensCompact)}
            title={isPensCompact ? 'Expand all pens on dock' : 'Make pens compact (Show active pen only)'}
            className="w-full flex items-center justify-center py-0.5 rounded-lg text-[10px] text-slate-500 hover:text-indigo-400 hover:bg-slate-800/50 transition-colors"
          >
            <ChevronsUpDown className="w-3 h-3" />
          </button>
        </div>

        {/* Compact Mode: Show 1 Active Pen with flyout selector */}
        {isPensCompact ? (
          <div className="relative" ref={penRef}>
            <button
              onClick={() => {
                if (isPenToolActive) {
                  setIsPenFlyoutOpen(!isPenFlyoutOpen);
                } else {
                  setActivePreset(activePresetId);
                  setIsShapesFlyoutOpen(false);
                  setIsLassoFlyoutOpen(false);
                  setIsStickyFlyoutOpen(false);
                }
              }}
              title={`${currentPreset.name} (Click to open pen selector)`}
              className={`relative w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                isPenToolActive
                  ? 'bg-slate-800 text-white border border-indigo-500/80 shadow-lg shadow-indigo-500/25 scale-105'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <ActivePenIcon className="w-4 h-4" />
              {currentPreset.tool !== 'eraser' && (
                <span
                  className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full ring-1 ring-slate-950 shadow-sm"
                  style={{ backgroundColor: activePenColor }}
                />
              )}
            </button>

            {/* Flyout when compact */}
            {isPenFlyoutOpen && (
              <div className="absolute left-full ml-3 top-0 glass-panel p-2.5 rounded-3xl border border-slate-700/80 shadow-2xl flex flex-col gap-1.5 z-50 min-w-[210px] bg-slate-950/95 backdrop-blur-xl animate-in fade-in slide-in-from-left-2 duration-150">
                <div className="flex items-center justify-between px-2 py-1 border-b border-slate-800/80 pb-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Pen Arsenal
                  </span>
                  <span className="text-[10px] text-indigo-400 font-mono">
                    {PEN_PRESETS.length} Pens
                  </span>
                </div>

                <div className="flex flex-col gap-1 max-h-72 overflow-y-auto custom-scrollbar pr-0.5">
                  {PEN_PRESETS.map((preset) => {
                    const Icon = getPresetIcon(preset.id);
                    const isCurrent = activePresetId === preset.id && isPenToolActive;
                    const itemColor = presetColors[preset.id] || currentColor;

                    return (
                      <button
                        key={preset.id}
                        onClick={() => {
                          setActivePreset(preset.id);
                          setIsPenFlyoutOpen(false);
                        }}
                        className={`flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-semibold transition-all group ${
                          isCurrent
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4 text-slate-300 group-hover:text-white" />
                          <span>{preset.name}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-slate-400 group-hover:text-slate-200">
                            {preset.size}px
                          </span>
                          {preset.tool !== 'eraser' && (
                            <span
                              className="w-2.5 h-2.5 rounded-full ring-1 ring-slate-900 shadow-sm"
                              style={{ backgroundColor: itemColor }}
                            />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Full Expanded Mode: All Pens directly visible on dock */
          <>
            {PEN_PRESETS.map((preset) => {
              const Icon = getPresetIcon(preset.id);
              const isActive = activePresetId === preset.id && activeTool === preset.tool;
              const individualColor = presetColors[preset.id] || currentColor;
              const shortcutKey =
                preset.tool === 'eraser'
                  ? 'E'
                  : preset.tool === 'laser'
                  ? 'L'
                  : preset.id === 'pen_fine'
                  ? 'P'
                  : '';

              return (
                <button
                  key={preset.id}
                  onClick={() => setActivePreset(preset.id)}
                  title={`${preset.name} (${preset.size}px)${shortcutKey ? ` [${shortcutKey}]` : ''}`}
                  className={`relative w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-slate-800 text-white border border-indigo-500/80 shadow-lg shadow-indigo-500/20 scale-105'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />

                  {/* Individual Active Color Pip Indicator */}
                  {preset.tool !== 'eraser' && (
                    <span
                      className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full ring-1 ring-slate-900 shadow-sm"
                      style={{ backgroundColor: individualColor }}
                    />
                  )}
                </button>
              );
            })}
          </>
        )}

        {/* Ink Mode: Permanent vs Disappearing / Live Hover Button */}
        <button
          onClick={toggleInkMode}
          title={inkMode === 'disappearing' ? 'Ink Mode: Hover / Disappearing (Strokes fade in 1.5s)' : 'Ink Mode: Permanent Mark'}
          className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
            inkMode === 'disappearing'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/40 ring-2 ring-amber-300 scale-105 animate-pulse'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Sparkles className="w-4 h-4" />
        </button>

        <div className="w-5 h-px bg-slate-800 my-0.5" />

        {/* 3. Dedicated Shapes & Flowcharts Tool Button (Opens Diagram Shapes Flyout) */}
        <div className="relative" ref={shapesRef}>
          <button
            onClick={() => {
              if (isShapeActive) {
                setIsShapesFlyoutOpen(!isShapesFlyoutOpen);
              } else {
                setActiveShapeType(activeShapeType);
                setIsPenFlyoutOpen(false);
                setIsLassoFlyoutOpen(false);
                setIsStickyFlyoutOpen(false);
              }
            }}
            title="Diagramming & Flowchart Shapes (Click to select shape)"
            className={`relative w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
              isShapeActive
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40 scale-105'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
            }`}
          >
            <ActiveShapeIcon className="w-4 h-4" />
            <span className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-slate-400/60" />
          </button>

          {/* Separate Shapes Flyout Menu with Flowcharts & Connectors */}
          {isShapesFlyoutOpen && (
            <div className="absolute left-full ml-3 top-0 glass-panel p-2.5 rounded-3xl border border-slate-700/80 shadow-2xl flex flex-col gap-1.5 z-50 min-w-[210px] bg-slate-950/95 backdrop-blur-xl animate-in fade-in slide-in-from-left-2 duration-150 max-h-80 overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between px-2 py-1 border-b border-slate-800/80 pb-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Diagram & Shapes
                </span>
                <span className="text-[10px] text-indigo-400 font-mono">
                  {allShapes.length} Symbols
                </span>
              </div>

              <div className="grid grid-cols-1 gap-1">
                {allShapes.map((shape) => {
                  const Icon = shape.icon;
                  const isCurrent = activeTool === shape.id;

                  return (
                    <button
                      key={shape.id}
                      onClick={() => {
                        setActiveShapeType(shape.id);
                        setIsShapesFlyoutOpen(false);
                      }}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                        isCurrent
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-indigo-400 group-hover:text-white" />
                        <span>{shape.label}</span>
                      </div>
                      {shape.shortcut && (
                        <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                          {shape.shortcut}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 4. Sticky Note Tool (Excalidraw / Post-it Style) */}
        <div className="relative" ref={stickyRef}>
          <button
            onClick={() => {
              if (isStickyActive) {
                setIsStickyFlyoutOpen(!isStickyFlyoutOpen);
              } else {
                setActiveTool('sticky');
                setIsPenFlyoutOpen(false);
                setIsShapesFlyoutOpen(false);
                setIsLassoFlyoutOpen(false);
              }
            }}
            title="Sticky Note (N) - Click on canvas to drop a note card"
            className={`relative w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
              isStickyActive
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/40 ring-2 ring-amber-300 scale-105'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
            }`}
          >
            <StickyNote className="w-4 h-4" />
            <span
              className="absolute bottom-1 right-1 w-2 h-2 rounded-full border border-slate-900 shadow-sm"
              style={{ backgroundColor: stickyColor }}
            />
          </button>

          {/* Sticky Notes Quick Pastel Palette */}
          {isStickyFlyoutOpen && (
            <div className="absolute left-full ml-3 top-0 glass-panel p-2.5 rounded-2xl border border-slate-700/80 shadow-2xl flex flex-col gap-2 z-50 min-w-[140px] bg-slate-950/95 backdrop-blur-xl animate-in fade-in slide-in-from-left-2 duration-150">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                Card Color
              </span>
              <div className="grid grid-cols-3 gap-2">
                {STICKY_COLORS.map((col) => (
                  <button
                    key={col}
                    onClick={() => {
                      setStickyColor(col);
                      setIsStickyFlyoutOpen(false);
                    }}
                    className={`w-8 h-8 rounded-xl border shadow-sm transition-transform hover:scale-110 ${
                      stickyColor === col ? 'ring-2 ring-indigo-500 scale-105 border-white' : 'border-slate-700/50'
                    }`}
                    style={{ backgroundColor: col }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 5. Dedicated Text Annotation Tool */}
        <button
          onClick={() => {
            setActiveTool('text');
            setIsPenFlyoutOpen(false);
            setIsShapesFlyoutOpen(false);
            setIsLassoFlyoutOpen(false);
            setIsStickyFlyoutOpen(false);
          }}
          title="Text Note Tool (T) - Click anywhere on canvas to write"
          className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
            activeTool === 'text'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40 scale-105'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
          }`}
        >
          <Type className="w-4 h-4" />
        </button>

        <div className="w-5 h-px bg-slate-800 my-0.5" />

        {/* 6. Excalidraw Sketch vs Clean CAD Mode Toggle */}
        <button
          onClick={() => setStrokeRoughness(strokeRoughness === 'clean' ? 'sketch' : 'clean')}
          title={strokeRoughness === 'sketch' ? 'Drawing Style: Hand-Drawn Sketch (Excalidraw style)' : 'Drawing Style: Architect Clean CAD'}
          className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
            strokeRoughness === 'sketch'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/40 ring-1 ring-purple-400 scale-105'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
          }`}
        >
          <Wand2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
