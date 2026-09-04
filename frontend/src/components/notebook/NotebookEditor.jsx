import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Copy, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  PenTool, 
  Highlighter, 
  Eraser, 
  Type, 
  Grid, 
  AlignLeft, 
  CircleDot, 
  Square, 
  BookOpen,
  Sparkles,
  Sigma,
  Undo2,
  Redo2,
  Share2,
  Check,
  Edit2,
  Settings
} from 'lucide-react';
import { Stage, Layer, Line, Rect, Circle, Text as KonvaText } from 'react-konva';
import { jsPDF } from 'jspdf';
import { useNotesStore } from '../../store/useNotesStore';
import { PALETTE_COLORS } from '../../store/useCanvasStore';
import { FormulaModal } from '../canvas/FormulaModal';
import { useCanvasStore } from '../../store/useCanvasStore';
import { useAuthStore } from '../../store/useAuthStore';

export const NotebookEditor = () => {
  const { currentNote, setCurrentNote, updateNote } = useNotesStore();
  const { setFormulaModalOpen, addElement, elements } = useCanvasStore();

  const [pages, setPages] = useState([
    {
      id: 'page-1',
      title: 'Page 1',
      strokes: [],
      notesText: '',
      template: 'ruled', // 'ruled', 'grid', 'cornell', 'dots', 'blank'
      bgColor: '#161926',
    }
  ]);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [activeTool, setActiveTool] = useState('pen'); // 'pen', 'highlighter', 'eraser', 'text'
  const [currentColor, setCurrentColor] = useState('#ffffff');
  const [strokeSize, setStrokeSize] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(currentNote?.title || 'Untitled Notebook');

  const stageRef = useRef(null);
  const activePage = pages[activePageIndex] || pages[0];

  const handleTitleSubmit = (e) => {
    e.preventDefault();
    if (title.trim() && currentNote) {
      updateNote(currentNote._id, { title: title.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleAddPage = () => {
    const newPage = {
      id: `page-${Date.now()}`,
      title: `Page ${pages.length + 1}`,
      strokes: [],
      notesText: '',
      template: activePage.template || 'ruled',
      bgColor: activePage.bgColor || '#161926',
    };
    setPages([...pages, newPage]);
    setActivePageIndex(pages.length);
  };

  const handleDeletePage = (index) => {
    if (pages.length <= 1) {
      alert('A notebook must have at least one page.');
      return;
    }
    const filtered = pages.filter((_, i) => i !== index);
    setPages(filtered);
    setActivePageIndex(Math.max(0, index - 1));
  };

  const handleDuplicatePage = (index) => {
    const target = pages[index];
    const duplicated = {
      ...target,
      id: `page-${Date.now()}`,
      title: `${target.title} (Copy)`,
    };
    const newPages = [...pages];
    newPages.splice(index + 1, 0, duplicated);
    setPages(newPages);
    setActivePageIndex(index + 1);
  };

  // Drawing handlers on the page canvas
  const handlePointerDown = (e) => {
    if (activeTool === 'text') return;
    const stage = stageRef.current;
    if (!stage) return;
    const pos = stage.getPointerPosition();
    if (!pos) return;

    setIsDrawing(true);
    if (activeTool === 'pen' || activeTool === 'highlighter') {
      setCurrentStroke({
        id: `stroke-${Date.now()}`,
        type: activeTool,
        color: currentColor,
        size: activeTool === 'highlighter' ? 20 : strokeSize,
        opacity: activeTool === 'highlighter' ? 0.35 : 1,
        points: [pos.x, pos.y],
      });
    } else if (activeTool === 'eraser') {
      const clickedEl = e.target;
      if (clickedEl && clickedEl.attrs?.id) {
        const updatedStrokes = activePage.strokes.filter(s => s.id !== clickedEl.attrs.id);
        const updatedPages = [...pages];
        updatedPages[activePageIndex].strokes = updatedStrokes;
        setPages(updatedPages);
      }
    }
  };

  const handlePointerMove = (e) => {
    if (!isDrawing || !currentStroke) return;
    const stage = stageRef.current;
    if (!stage) return;
    const pos = stage.getPointerPosition();
    if (!pos) return;

    setCurrentStroke(prev => ({
      ...prev,
      points: [...prev.points, pos.x, pos.y],
    }));
  };

  const handlePointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentStroke) {
      const updatedPages = [...pages];
      updatedPages[activePageIndex].strokes = [...updatedPages[activePageIndex].strokes, currentStroke];
      setPages(updatedPages);
      setCurrentStroke(null);
    }
  };

  const handlePageNotesChange = (text) => {
    const updatedPages = [...pages];
    updatedPages[activePageIndex].notesText = text;
    setPages(updatedPages);
  };

  const handleSetTemplate = (templateId) => {
    const updatedPages = [...pages];
    updatedPages[activePageIndex].template = templateId;
    setPages(updatedPages);
  };

  const handleExportPDF = () => {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    });
    pdf.setFontSize(20);
    pdf.text(currentNote?.title || 'Notebook', 40, 50);
    pdf.setFontSize(12);
    pages.forEach((page, idx) => {
      if (idx > 0) pdf.addPage();
      pdf.text(`--- ${page.title} ---`, 40, 80);
      if (page.notesText) {
        const splitText = pdf.splitTextToSize(page.notesText, 500);
        pdf.text(splitText, 40, 110);
      }
    });
    pdf.save(`${currentNote?.title || 'Notebook'}.pdf`);
  };

  const templates = [
    { id: 'ruled', label: 'Ruled Lines', icon: AlignLeft },
    { id: 'grid', label: 'Square Grid', icon: Grid },
    { id: 'cornell', label: 'Cornell Note', icon: BookOpen },
    { id: 'dots', label: 'Dot Matrix', icon: CircleDot },
    { id: 'blank', label: 'Blank Page', icon: Square },
  ];

  return (
    <div className="w-screen h-screen flex flex-col bg-[#0b0d14] text-slate-100 overflow-hidden select-none">
      {/* Top Navigation Bar */}
      <header className="h-14 px-4 flex items-center justify-between border-b border-slate-800/80 glass-panel sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentNote(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <div className="h-4 w-px bg-slate-800" />

          {isEditingTitle ? (
            <form onSubmit={handleTitleSubmit} className="flex items-center gap-1">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleSubmit}
                autoFocus
                className="px-2 py-0.5 bg-slate-900 border border-emerald-500 rounded-lg text-sm text-white focus:outline-none"
              />
            </form>
          ) : (
            <div
              onClick={() => setIsEditingTitle(true)}
              className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-800/60 cursor-pointer group"
            >
              <span className="text-sm font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">
                {currentNote?.title || title}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Notebook View
              </span>
              <Edit2 className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
        </div>

        {/* Center Tools */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-2xl border border-slate-800/80">
          <button
            onClick={() => setActiveTool('pen')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTool === 'pen' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <PenTool className="w-4 h-4" />
            <span>Pen</span>
          </button>
          <button
            onClick={() => setActiveTool('highlighter')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTool === 'highlighter' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Highlighter className="w-4 h-4" />
            <span>Highlighter</span>
          </button>
          <button
            onClick={() => setActiveTool('eraser')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTool === 'eraser' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eraser className="w-4 h-4" />
            <span>Eraser</span>
          </button>
          <button
            onClick={() => setActiveTool('text')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTool === 'text' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Type className="w-4 h-4" />
            <span>Text Note</span>
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          {/* Color palette swatches */}
          <div className="flex items-center gap-1.5 px-2">
            {PALETTE_COLORS.slice(0, 6).map(c => (
              <button
                key={c}
                onClick={() => setCurrentColor(c)}
                className={`w-5 h-5 rounded-full border transition-transform ${
                  currentColor === c ? 'scale-125 border-white ring-1 ring-emerald-500' : 'border-slate-700/60 opacity-80'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Template Switcher */}
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            {templates.map(t => {
              const Icon = t.icon;
              const isSelected = activePage.template === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => handleSetTemplate(t.id)}
                  title={t.label}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isSelected ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>

          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export PDF</span>
          </button>

          <button
            onClick={() => useAuthStore.getState().setSettingsOpen(true)}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Settings & Subscription Plans"
          >
            <Settings className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      </header>

      {/* Main Multi-Page Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Page Filmstrip / Thumbnail Navigation */}
        <aside className="w-64 h-full bg-[#0e111a] border-r border-slate-800/80 flex flex-col justify-between p-3 select-none">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                Pages ({pages.length})
              </span>
              <button
                onClick={handleAddPage}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-transform active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Page</span>
              </button>
            </div>

            {/* Pages Thumbnails List */}
            <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-180px)] pr-1">
              {pages.map((page, index) => {
                const isActive = activePageIndex === index;
                return (
                  <div
                    key={page.id}
                    onClick={() => setActivePageIndex(index)}
                    className={`group relative p-2.5 rounded-2xl border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-emerald-950/30 border-emerald-500 shadow-md ring-1 ring-emerald-500/40'
                        : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-200">{page.title}</span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicatePage(index);
                          }}
                          className="p-1 text-slate-400 hover:text-emerald-400"
                          title="Duplicate Page"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePage(index);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-400"
                          title="Delete Page"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Miniature Page Preview Card */}
                    <div className="h-16 w-full rounded-lg bg-[#141722] border border-slate-800 flex flex-col p-1.5 overflow-hidden">
                      <div className="w-full h-1 bg-slate-700/50 rounded mb-1" />
                      <div className="w-3/4 h-1 bg-slate-700/30 rounded mb-1" />
                      <div className="w-1/2 h-1 bg-slate-700/30 rounded" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Page Navigation Pager */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <button
              onClick={() => setActivePageIndex(Math.max(0, activePageIndex - 1))}
              disabled={activePageIndex === 0}
              className="p-1.5 rounded-lg hover:bg-slate-800 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono font-semibold text-slate-300">
              Page {activePageIndex + 1} of {pages.length}
            </span>
            <button
              onClick={() => setActivePageIndex(Math.min(pages.length - 1, activePageIndex + 1))}
              disabled={activePageIndex === pages.length - 1}
              className="p-1.5 rounded-lg hover:bg-slate-800 disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </aside>

        {/* Center: Notebook Digital Sheet & Drawing / Text Canvas */}
        <main className="flex-1 overflow-y-auto p-8 flex justify-center bg-[#07090e]">
          {/* Realistic Notebook Page Container */}
          <div className="relative w-full max-w-3xl min-h-[950px] rounded-3xl bg-[#141724] border border-slate-700/70 shadow-2xl overflow-hidden flex flex-col">
            {/* Page Header Margin */}
            <div className="h-14 px-8 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400 bg-[#121520]">
              <span className="font-bold text-slate-300">{activePage.title}</span>
              <span className="font-mono uppercase text-[10px] tracking-wider text-emerald-400">
                Format: {activePage.template}
              </span>
            </div>

            {/* Page Body Content (Cornell / Ruled / Grid background) */}
            <div 
              className="relative flex-1 p-8 overflow-hidden"
              style={{
                backgroundImage: activePage.template === 'ruled'
                  ? 'linear-gradient(#272b3d 1px, transparent 1px)'
                  : activePage.template === 'grid'
                  ? 'linear-gradient(to right, #272b3d 1px, transparent 1px), linear-gradient(to bottom, #272b3d 1px, transparent 1px)'
                  : activePage.template === 'dots'
                  ? 'radial-gradient(circle, #383e56 1.5px, transparent 1.5px)'
                  : 'none',
                backgroundSize: activePage.template === 'dots' ? '24px 24px' : '32px 32px',
              }}
            >
              {/* Cornell Cue Margin line */}
              {activePage.template === 'cornell' && (
                <div className="absolute top-0 bottom-0 left-48 w-px bg-emerald-500/30" />
              )}

              {/* Text Note Taking Area */}
              <textarea
                value={activePage.notesText || ''}
                onChange={(e) => handlePageNotesChange(e.target.value)}
                placeholder="Click here to type structured lecture notes, summaries, or insights..."
                className={`w-full h-full bg-transparent text-slate-200 text-sm leading-8 font-sans placeholder-slate-600 resize-none focus:outline-none z-10 relative ${
                  activePage.template === 'cornell' ? 'pl-44' : ''
                }`}
              />

              {/* Drawing Layer on Top of Page */}
              <div className="absolute inset-0 z-20 pointer-events-auto">
                <Stage
                  ref={stageRef}
                  width={750}
                  height={880}
                  onMouseDown={handlePointerDown}
                  onMouseMove={handlePointerMove}
                  onMouseUp={handlePointerUp}
                  onTouchStart={handlePointerDown}
                  onTouchMove={handlePointerMove}
                  onTouchEnd={handlePointerUp}
                >
                  <Layer>
                    {activePage.strokes.map(s => (
                      <Line
                        key={s.id}
                        id={s.id}
                        points={s.points}
                        stroke={s.color}
                        strokeWidth={s.size}
                        opacity={s.opacity || 1}
                        tension={0.4}
                        lineCap="round"
                        lineJoin="round"
                      />
                    ))}
                    {currentStroke && (
                      <Line
                        points={currentStroke.points}
                        stroke={currentStroke.color}
                        strokeWidth={currentStroke.size}
                        opacity={currentStroke.opacity || 1}
                        tension={0.4}
                        lineCap="round"
                        lineJoin="round"
                      />
                    )}
                  </Layer>
                </Stage>
              </div>
            </div>

            {/* Page Footer Number */}
            <div className="h-10 px-8 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500 font-mono bg-[#121520]">
              <span>DrawText Notebook Document</span>
              <span>- Page {activePageIndex + 1} -</span>
            </div>
          </div>
        </main>
      </div>

      <FormulaModal />
    </div>
  );
};
