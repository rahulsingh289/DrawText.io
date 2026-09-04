import React, { useState } from 'react';
import { X, Copy, Check, Users, Share2, Globe, Shield, Sparkles } from 'lucide-react';
import { useCanvasStore } from '../../store/useCanvasStore';
import { useNotesStore } from '../../store/useNotesStore';

export const ShareCollabModal = () => {
  const { isShareModalOpen, setShareModalOpen, collaborators } = useCanvasStore();
  const { currentNote } = useNotesStore();
  const [copied, setCopied] = useState(false);

  if (!isShareModalOpen) return null;

  const shareUrl = window.location.href;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150 select-none">
      <div className="w-full max-w-md rounded-3xl bg-[#141824] border border-slate-700/80 shadow-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Share & Collaborate</h3>
              <p className="text-[11px] text-slate-400">Live multi-user synchronous canvas room</p>
            </div>
          </div>
          <button
            onClick={() => setShareModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-4">
          {/* Share Link Box */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Live Collaboration Invite Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-slate-300 focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-600/20 shrink-0"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Active Collaborators list */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300">
                Active Participants ({collaborators.length + 1})
              </span>
              <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Sync Connected
              </span>
            </div>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-[11px] font-bold text-white">
                    You
                  </div>
                  <span className="text-xs text-slate-200 font-medium">You (Owner)</span>
                </div>
                <span className="text-[10px] text-slate-400 uppercase font-mono">Host</span>
              </div>

              {collaborators.map((c, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white shadow-sm"
                      style={{ backgroundColor: c.color || '#ec4899' }}
                    >
                      {c.name ? c.name[0].toUpperCase() : 'G'}
                    </div>
                    <span className="text-xs text-slate-200 font-medium">{c.name || 'Guest User'}</span>
                  </div>
                  <span className="text-[10px] text-indigo-400 font-mono">Editor</span>
                </div>
              ))}
            </div>
          </div>

          {/* Permissions note */}
          <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300 flex items-start gap-2.5">
            <Globe className="w-4 h-4 shrink-0 mt-0.5 text-indigo-400" />
            <span>Anyone with this link can view and draw in real-time. Strokes are synchronized instantly.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
