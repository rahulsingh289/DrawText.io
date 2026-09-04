import React, { useState, useEffect } from 'react';
import { X, Sigma, Check, Sparkles } from 'lucide-react';
import katex from 'katex';
import { useCanvasStore } from '../../store/useCanvasStore';

export const FormulaModal = () => {
  const { isFormulaModalOpen, setFormulaModalOpen, addElement, stagePos, stageScale } = useCanvasStore();
  const [latexInput, setLatexInput] = useState('E = mc^2');
  const [htmlPreview, setHtmlPreview] = useState('');
  const [renderError, setRenderError] = useState(null);

  useEffect(() => {
    try {
      const rendered = katex.renderToString(latexInput || ' ', {
        throwOnError: false,
        displayMode: true,
      });
      setHtmlPreview(rendered);
      setRenderError(null);
    } catch (err) {
      setRenderError(err.message);
    }
  }, [latexInput]);

  if (!isFormulaModalOpen) return null;

  const quickSymbols = [
    { label: 'Fraction', code: '\\frac{a}{b}' },
    { label: 'Integral', code: '\\int_{0}^{\\infty} x dx' },
    { label: 'Sum', code: '\\sum_{i=1}^{n} i' },
    { label: 'Square Root', code: '\\sqrt{x^2 + y^2}' },
    { label: 'Matrix', code: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}' },
    { label: 'Limits', code: '\\lim_{x \\to 0} \\frac{\\sin x}{x}' },
    { label: 'Greek', code: '\\alpha + \\beta = \\theta' },
  ];

  const handleInsert = () => {
    if (!latexInput.trim()) return;

    // Calculate canvas center coordinates in world space
    const centerX = (-stagePos.x + window.innerWidth / 2) / stageScale - 100;
    const centerY = (-stagePos.y + window.innerHeight / 2) / stageScale - 40;

    addElement({
      id: `formula-${Date.now()}`,
      type: 'formula',
      latex: latexInput,
      x: centerX,
      y: centerY,
      fontSize: 24,
      color: '#ffffff',
    });

    setFormulaModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-3xl bg-[#141824] border border-slate-700/80 shadow-2xl overflow-hidden select-none">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <Sigma className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Insert LaTeX Math Equation</h3>
              <p className="text-[11px] text-slate-400">Render high-precision mathematical formulas directly onto canvas</p>
            </div>
          </div>
          <button
            onClick={() => setFormulaModalOpen(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Quick Snippet Buttons */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Quick LaTeX Snippets
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickSymbols.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setLatexInput(item.code)}
                  className="px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-indigo-500 transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* LaTeX Input Textarea */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              LaTeX Code
            </label>
            <textarea
              value={latexInput}
              onChange={(e) => setLatexInput(e.target.value)}
              rows={3}
              placeholder="e.g. \\int_0^1 x^2 dx"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-sm font-mono text-purple-300 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Live KaTeX Render Preview Box */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Live Equation Preview
            </span>
            <div className="min-h-[90px] p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-center text-white text-xl overflow-x-auto">
              {renderError ? (
                <span className="text-xs text-rose-400 font-mono">{renderError}</span>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: htmlPreview }} />
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setFormulaModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleInsert}
              disabled={!latexInput.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-transform active:scale-95 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>Insert onto Board</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
