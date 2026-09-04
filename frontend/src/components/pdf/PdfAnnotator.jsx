import React, { useState, useRef } from 'react';
import { 
  ArrowLeft, 
  Upload, 
  Download, 
  Highlighter, 
  PenTool, 
  Eraser, 
  MessageSquare, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  FileText, 
  ChevronLeft, 
  ChevronRight, 
  Search,
  Check,
  Edit2,
  Sparkles,
  Plus,
  Copy,
  Trash2,
  Settings
} from 'lucide-react';
import { Stage, Layer, Line, Rect, Circle, Text as KonvaText } from 'react-konva';
import { jsPDF } from 'jspdf';
import { useNotesStore } from '../../store/useNotesStore';
import { useAuthStore } from '../../store/useAuthStore';

export const PdfAnnotator = () => {
  const { currentNote, setCurrentNote, updateNote } = useNotesStore();

  const [pdfFileName, setPdfFileName] = useState(currentNote?.title || 'Lecture_Notes_Research_Paper.pdf');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTool, setActiveTool] = useState('highlighter'); // 'highlighter', 'pen', 'comment', 'eraser'
  const [highlightColor, setHighlightColor] = useState('#facc15'); // Yellow highlighter
  const [penColor, setPenColor] = useState('#f87171');
  const [annotations, setAnnotations] = useState([]); // { id, page, type, points, color, size, text, x, y }
  const [comments, setComments] = useState([]); // { id, page, text, x, y, author, date }
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState(null);
  const [zoomScale, setZoomScale] = useState(1);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(currentNote?.title || 'PDF Annotation Document');

  // Multi-page PDF document state
  const [pdfPages, setPdfPages] = useState([
    {
      page: 1,
      title: 'Chapter 1: Neural Networks and Deep Learning Fundamentals',
      paragraphs: [
        'Artificial neural networks (ANNs) are computing systems inspired by the biological neural networks that constitute animal brains. An ANN is based on a collection of connected units or nodes called artificial neurons, which loosely model the neurons in a biological brain.',
        'Each connection, like the synapses in a biological brain, can transmit a signal to other neurons. An artificial neuron receives signals then processes them and can signal neurons connected to it.',
        'The output of each neuron is computed by some non-linear function of the sum of its inputs. The connections are called edges. Neurons and edges typically have a weight that adjusts as learning proceeds.'
      ]
    },
    {
      page: 2,
      title: 'Chapter 2: Gradient Descent and Backpropagation Matrix',
      paragraphs: [
        'Backpropagation is an algorithm used in machine learning to calculate a gradient that is needed in the calculation of the weights to be used in the network.',
        'The method calculates the gradient of the loss function with respect to each weight by the chain rule, computing the gradient one layer at a time, iterating backward from the last layer to avoid redundant calculations of intermediate terms in the chain rule.',
        'Convergence is reached when the gradient approaches zero or loss improvements stagnate across training epochs.'
      ]
    },
    {
      page: 3,
      title: 'Chapter 3: Transformer Attention Mechanisms & Scaling',
      paragraphs: [
        'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The Transformer, however, dispenses with recurrence completely and relies entirely on an attention mechanism to draw global dependencies between input and output.',
        'Scaled dot-product attention computes the compatibility of query vectors against key vectors to generate softmax attention weight distributions over value representations.'
      ]
    }
  ]);

  const stageRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPdfFileName(file.name);
      setTitle(file.name);
      updateNote(currentNote._id, { title: file.name });
    }
  };

  const handleAddPage = () => {
    const newPageNum = pdfPages.length + 1;
    const newPage = {
      page: newPageNum,
      title: `Page ${newPageNum}: Supplementary Notes & Analysis`,
      paragraphs: [
        'Additional annotation page created by user. You can add notes, high-precision highlights, drawings, and comments on this page.',
        'Click anywhere with the highlighter or pen to mark up this page.'
      ]
    };
    setPdfPages([...pdfPages, newPage]);
    setCurrentPage(newPageNum);
  };

  const handleDuplicatePage = (index) => {
    const target = pdfPages[index];
    const newPageNum = pdfPages.length + 1;
    const duplicated = {
      ...target,
      page: newPageNum,
      title: `${target.title} (Copy)`,
    };
    const newPages = [...pdfPages];
    newPages.splice(index + 1, 0, duplicated);
    // Renumber pages
    const renumbered = newPages.map((p, i) => ({ ...p, page: i + 1 }));
    setPdfPages(renumbered);
    setCurrentPage(index + 2);
  };

  const handleDeletePage = (index) => {
    if (pdfPages.length <= 1) {
      alert('A PDF document must have at least one page.');
      return;
    }
    const filtered = pdfPages.filter((_, i) => i !== index);
    const renumbered = filtered.map((p, i) => ({ ...p, page: i + 1 }));
    setPdfPages(renumbered);
    setCurrentPage(Math.max(1, index));
  };

  const handlePointerDown = (e) => {
    const stage = stageRef.current;
    if (!stage) return;
    const pos = stage.getPointerPosition();
    if (!pos) return;

    if (activeTool === 'comment') {
      const text = prompt('Enter sticky note annotation comment:');
      if (text) {
        setComments(prev => [
          ...prev,
          {
            id: `comment-${Date.now()}`,
            page: currentPage,
            text,
            x: pos.x / zoomScale,
            y: pos.y / zoomScale,
            date: 'Just now',
          }
        ]);
      }
      return;
    }

    setIsDrawing(true);
    if (activeTool === 'highlighter' || activeTool === 'pen') {
      setCurrentStroke({
        id: `ann-${Date.now()}`,
        page: currentPage,
        type: activeTool,
        color: activeTool === 'highlighter' ? highlightColor : penColor,
        size: activeTool === 'highlighter' ? 22 : 3,
        opacity: activeTool === 'highlighter' ? 0.35 : 1,
        points: [pos.x / zoomScale, pos.y / zoomScale],
      });
    } else if (activeTool === 'eraser') {
      const clicked = e.target;
      if (clicked && clicked.attrs?.id) {
        setAnnotations(prev => prev.filter(a => a.id !== clicked.attrs.id));
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
      points: [...prev.points, pos.x / zoomScale, pos.y / zoomScale],
    }));
  };

  const handlePointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentStroke) {
      setAnnotations(prev => [...prev, currentStroke]);
      setCurrentStroke(null);
    }
  };

  const handleExportAnnotatedPDF = () => {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    });
    pdf.setFontSize(16);
    pdf.text(`Annotated Document: ${pdfFileName}`, 40, 50);
    pdf.setFontSize(11);
    pdf.text(`Total Pages: ${pdfPages.length} | Total Comments: ${comments.length}`, 40, 75);

    pdfPages.forEach((p, idx) => {
      if (idx > 0) pdf.addPage();
      pdf.setFontSize(14);
      pdf.text(`Page ${p.page}: ${p.title}`, 40, 100);
      pdf.setFontSize(10);
      let yOffset = 130;
      p.paragraphs.forEach(para => {
        const splitText = pdf.splitTextToSize(para, 500);
        pdf.text(splitText, 40, yOffset);
        yOffset += splitText.length * 15 + 10;
      });
      // Append page comments
      const pageComms = comments.filter(c => c.page === p.page);
      if (pageComms.length > 0) {
        yOffset += 15;
        pdf.setFontSize(11);
        pdf.setTextColor(220, 38, 38);
        pdf.text('Attached Sticky Comments:', 40, yOffset);
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(9);
        pageComms.forEach((comm, cIdx) => {
          yOffset += 15;
          pdf.text(`• [Comment ${cIdx + 1}]: ${comm.text}`, 50, yOffset);
        });
      }
    });

    pdf.save(`Annotated_${pdfFileName}`);
  };

  const currentPageData = pdfPages.find(p => p.page === currentPage) || pdfPages[0];
  const pageAnnotations = annotations.filter(a => a.page === currentPage);
  const pageComments = comments.filter(c => c.page === currentPage);

  return (
    <div className="w-screen h-screen flex flex-col bg-[#0b0d14] text-slate-100 overflow-hidden select-none">
      {/* Top Header */}
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

          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-100 line-clamp-1">{pdfFileName}</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20">
              PDF Studio
            </span>
          </div>
        </div>

        {/* Center Markup Toolbar */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-2xl border border-slate-800/80">
          <button
            onClick={() => setActiveTool('highlighter')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTool === 'highlighter' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Highlighter className="w-4 h-4 text-amber-300" />
            <span>Highlighter</span>
          </button>
          <button
            onClick={() => setActiveTool('pen')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTool === 'pen' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <PenTool className="w-4 h-4" />
            <span>Pen</span>
          </button>
          <button
            onClick={() => setActiveTool('comment')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTool === 'comment' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Sticky Note</span>
          </button>
          <button
            onClick={() => setActiveTool('eraser')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTool === 'eraser' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eraser className="w-4 h-4" />
            <span>Eraser</span>
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          {/* Color Switchers */}
          <div className="flex items-center gap-1.5 px-2">
            {['#facc15', '#4ade80', '#38bdf8', '#f472b6', '#f87171'].map(color => (
              <button
                key={color}
                onClick={() => {
                  setHighlightColor(color);
                  setPenColor(color);
                }}
                className={`w-5 h-5 rounded-full border transition-transform ${
                  highlightColor === color ? 'scale-125 border-white ring-1 ring-rose-500' : 'border-slate-700/60 opacity-80'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,.doc,.docx"
            className="hidden"
          />
          <button
            onClick={handleAddPage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 transition-colors"
            title="Create New PDF Page"
          >
            <Plus className="w-4 h-4" />
            <span>Add Page</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <Upload className="w-4 h-4 text-rose-400" />
            <span>Import PDF</span>
          </button>
          <button
            onClick={handleExportAnnotatedPDF}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition-transform active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Export PDF</span>
          </button>

          <button
            onClick={() => useAuthStore.getState().setSettingsOpen(true)}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Settings & Subscription Plans"
          >
            <Settings className="w-4 h-4 text-rose-400" />
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left PDF Page Filmstrip with Add Page Trigger */}
        <aside className="w-64 h-full bg-[#0e111a] border-r border-slate-800/80 flex flex-col justify-between p-3 select-none">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-rose-400" />
                Pages ({pdfPages.length})
              </span>
              <button
                onClick={handleAddPage}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-sm transition-transform active:scale-95"
                title="Create New Page in PDF"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Page</span>
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-180px)] pr-1">
              {pdfPages.map((p, index) => {
                const isActive = currentPage === p.page;
                return (
                  <div
                    key={p.page}
                    onClick={() => setCurrentPage(p.page)}
                    className={`group relative p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-rose-950/30 border-rose-500 shadow-md ring-1 ring-rose-500/40'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-slate-200">Page {p.page}</span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicatePage(index);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-400"
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
                    {/* Miniature Page Thumbnail */}
                    <div className="h-20 w-full rounded-lg bg-white/5 border border-slate-800 p-2 flex flex-col justify-between overflow-hidden">
                      <span className="text-[9px] text-slate-400 line-clamp-2 leading-tight">
                        {p.title}
                      </span>
                      <div className="w-full h-0.5 bg-slate-700/50 rounded" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pager */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg hover:bg-slate-800 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono font-semibold text-slate-300">
              {currentPage} / {pdfPages.length}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(pdfPages.length, currentPage + 1))}
              disabled={currentPage === pdfPages.length}
              className="p-1.5 rounded-lg hover:bg-slate-800 disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </aside>

        {/* Center PDF Paper Viewer & Live Annotation Layer */}
        <main className="flex-1 overflow-y-auto p-8 flex justify-center bg-[#07090e]">
          {/* PDF Page Container */}
          <div className="relative w-full max-w-3xl min-h-[950px] rounded-3xl bg-[#ffffff] text-slate-900 shadow-2xl overflow-hidden p-12 select-text">
            {/* PDF Watermark / Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6 text-xs text-slate-400 font-mono">
              <span>{pdfFileName}</span>
              <span>PAGE {currentPage} OF {pdfPages.length}</span>
            </div>

            {/* Document Content Text */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                {currentPageData.title}
              </h2>

              {currentPageData.paragraphs.map((para, idx) => (
                <p key={idx} className="text-sm leading-7 text-slate-700 font-serif">
                  {para}
                </p>
              ))}
            </div>

            {/* Konva Annotation Overlay Layer */}
            <div className="absolute inset-0 z-20 pointer-events-auto">
              <Stage
                ref={stageRef}
                width={768}
                height={950}
                onMouseDown={handlePointerDown}
                onMouseMove={handlePointerMove}
                onMouseUp={handlePointerUp}
                onTouchStart={handlePointerDown}
                onTouchMove={handlePointerMove}
                onTouchEnd={handlePointerUp}
              >
                <Layer>
                  {pageAnnotations.map(a => (
                    <Line
                      key={a.id}
                      id={a.id}
                      points={a.points}
                      stroke={a.color}
                      strokeWidth={a.size}
                      opacity={a.opacity || 1}
                      tension={0.4}
                      lineCap="round"
                      lineJoin="round"
                      globalCompositeOperation={a.type === 'highlighter' ? 'multiply' : 'source-over'}
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
                      globalCompositeOperation={currentStroke.type === 'highlighter' ? 'multiply' : 'source-over'}
                    />
                  )}
                </Layer>
              </Stage>
            </div>

            {/* Sticky Comment Pins */}
            {pageComments.map(c => (
              <div
                key={c.id}
                className="absolute z-30 p-2.5 rounded-2xl bg-amber-100 border border-amber-300 text-slate-900 shadow-xl max-w-xs"
                style={{ left: c.x, top: c.y }}
              >
                <div className="flex items-center justify-between text-[10px] font-bold text-amber-800 mb-1">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" /> Note
                  </span>
                  <button
                    onClick={() => setComments(prev => prev.filter(item => item.id !== c.id))}
                    className="text-amber-700 hover:text-rose-600"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-xs font-medium text-slate-800">{c.text}</p>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};
