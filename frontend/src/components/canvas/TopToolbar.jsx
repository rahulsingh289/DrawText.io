import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Undo2, 
  Redo2, 
  Type, 
  Sigma, 
  Mic, 
  Grid, 
  Download, 
  Share2, 
  ZoomIn, 
  ZoomOut, 
  Maximize2,
  Trash2,
  Sparkles,
  Check,
  Edit2,
  Settings,
  Upload
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useCanvasStore } from '../../store/useCanvasStore';
import { useNotesStore } from '../../store/useNotesStore';
import { useAuthStore } from '../../store/useAuthStore';

export const TopToolbar = ({ stageRef }) => {
  const {
    undo,
    redo,
    historyStep,
    history,
    stageScale,
    zoomIn,
    zoomOut,
    resetZoom,
    activeTool,
    setActiveTool,
    addElement,
    stagePos,
    isBackgroundPopoverOpen,
    setBackgroundPopoverOpen,
    setFormulaModalOpen,
    setAudioRecorderOpen,
    setShareModalOpen,
    exportDiagramJSON,
    importDiagramJSON,
    clearBoard,
  } = useCanvasStore();


  const { currentNote, setCurrentNote, updateNote } = useNotesStore();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(currentNote?.title || 'Untitled Whiteboard');

  const canUndo = historyStep > 0;
  const canRedo = historyStep < history.length - 1;

  const handleTitleSubmit = (e) => {
    e.preventDefault();
    if (title.trim() && currentNote) {
      updateNote(currentNote._id, { title: title.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleInsertText = () => {
    const centerX = (-stagePos.x + window.innerWidth / 2) / stageScale - 100;
    const centerY = (-stagePos.y + window.innerHeight / 2) / stageScale - 20;

    addElement({
      id: `text-${Date.now()}`,
      type: 'text',
      text: 'Double click to edit note...',
      x: centerX,
      y: centerY,
      fontSize: 20,
      fill: '#f1f5f9',
    });
  };

  const handleExportPNG = () => {
    if (!stageRef?.current) return;
    const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
    const link = document.createElement('a');
    link.download = `${currentNote?.title || 'whiteboard'}.png`;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    if (!stageRef?.current) return;
    const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [stageRef.current.width(), stageRef.current.height()],
    });
    pdf.addImage(uri, 'PNG', 0, 0, stageRef.current.width(), stageRef.current.height());
    pdf.save(`${currentNote?.title || 'whiteboard'}.pdf`);
  };

  return (
    <header className="h-14 px-4 flex items-center justify-between border-b border-slate-800/80 glass-panel sticky top-0 z-30 select-none">
      {/* Left: Back to Dashboard & Note Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setCurrentNote(null)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
          title="Back to All Notes"
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
              className="px-2 py-0.5 bg-slate-900 border border-indigo-500 rounded-lg text-sm text-white focus:outline-none"
            />
          </form>
        ) : (
          <div
            onClick={() => setIsEditingTitle(true)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-slate-800/60 cursor-pointer group"
          >
            <span className="text-sm font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
              {currentNote?.title || title}
            </span>
            <Edit2 className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}
      </div>

      {/* Center: Insert Tools & Canvas Actions */}
      <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-2xl border border-slate-800/80 shadow-inner">
        {/* Undo / Redo */}
        <button
          onClick={undo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        >
          <Redo2 className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-slate-800 mx-1" />

        {/* Text Tool */}
        <button
          onClick={handleInsertText}
          title="Insert Text Box"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Type className="w-4 h-4 text-indigo-400" />
          <span className="hidden sm:inline">Text</span>
        </button>

        {/* LaTeX Math Formula Tool */}
        <button
          onClick={() => setFormulaModalOpen(true)}
          title="Insert LaTeX Math Equation"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Sigma className="w-4 h-4 text-purple-400" />
          <span className="hidden sm:inline">Formula</span>
        </button>

        {/* Audio Memo Recorder */}
        <button
          onClick={() => setAudioRecorderOpen(true)}
          title="Record Audio Memo"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Mic className="w-4 h-4 text-rose-400" />
          <span className="hidden sm:inline">Voice</span>
        </button>
      </div>

      {/* Right: Zoom Controls, Background Settings & Export */}
      <div className="flex items-center gap-2">
        {/* Zoom Controls Pill */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={zoomOut}
            title="Zoom Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={resetZoom}
            title="Reset Zoom to 100%"
            className="px-1.5 text-xs font-mono font-semibold text-slate-300 hover:text-white"
          >
            {Math.round(stageScale * 100)}%
          </button>
          <button
            onClick={zoomIn}
            title="Zoom In"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Paper & Grid Settings Trigger */}
        <button
          onClick={() => setBackgroundPopoverOpen(!isBackgroundPopoverOpen)}
          title="Canvas Paper & Grid Settings (Wireframe 4)"
          className={`p-2 rounded-xl border transition-colors ${
            isBackgroundPopoverOpen
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
              : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-700'
          }`}
        >
          <Grid className="w-4 h-4" />
        </button>

        {/* Export / Import Menu */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-0.5 rounded-2xl border border-slate-800">
          <button
            onClick={handleExportPNG}
            title="Export as PNG image"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden md:inline">PNG</span>
          </button>
          <button
            onClick={handleExportPDF}
            title="Export as PDF document"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <span className="hidden md:inline">PDF</span>
          </button>
          <button
            onClick={() => exportDiagramJSON(currentNote?.title || 'drawflow-scene')}
            title="Export scene diagram as .drawflow JSON"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-indigo-400 hover:text-white hover:bg-indigo-600/30 transition-colors"
          >
            <span className="font-mono text-[11px] font-bold">.JSON</span>
          </button>
          <label
            title="Import previously saved diagram .json file"
            className="flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-400" />
            <input
              type="file"
              accept=".json,.drawflow"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    importDiagramJSON(event.target.result);
                  };
                  reader.readAsText(file);
                }
              }}
            />
          </label>
        </div>

        {/* Live Collab / Share */}
        <button
          onClick={() => setShareModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-transform active:scale-95"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share</span>
        </button>

        {/* Global Settings Trigger */}
        <button
          onClick={() => useAuthStore.getState().setSettingsOpen(true)}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
          title="Settings & Subscription Plans"
        >
          <Settings className="w-4 h-4 text-indigo-400" />
        </button>
      </div>
    </header>
  );
};

