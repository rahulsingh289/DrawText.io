import React, { useState } from 'react';
import { 
  X, 
  User, 
  ShieldCheck, 
  Check, 
  Sparkles, 
  Cloud, 
  BookOpen, 
  Keyboard, 
  Trash2, 
  ExternalLink,
  Zap,
  Crown,
  Download,
  Upload,
  RefreshCw,
  HardDrive,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuthStore } from '../../store/useAuthStore';
import { useNotesStore } from '../../store/useNotesStore';
import { PaymentCheckoutModal } from './PaymentCheckoutModal';

export const SettingsModal = () => {
  const { isSettingsOpen, setSettingsOpen, user, upgradePlan } = useAuthStore();
  const { notes, folders } = useNotesStore();

  const [activeTab, setActiveTab] = useState('subscription'); // 'subscription' | 'cloud' | 'shortcuts'
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeFeedback, setUpgradeFeedback] = useState(null);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState(null);

  if (!isSettingsOpen) return null;

  const currentTier = user?.tier || 'plan_b';

  const plans = [
    {
      id: 'plan_a',
      name: 'Plan A (Starter)',
      price: '$0',
      period: 'forever',
      desc: 'Essential drawing tools for quick ideas & individual sketches',
      features: [
        'Up to 5 Whiteboards',
        'Standard Brush Engine',
        '100MB Cloud Storage',
        'Export as PNG',
        'Standard Community Support',
      ],
      current: currentTier === 'plan_a',
      badge: 'Free Tier',
      buttonText: 'Downgrade to Free',
    },
    {
      id: 'plan_b',
      name: 'Plan B (Pro Creator)',
      price: '$9.99',
      period: '/month',
      desc: 'Infinite canvas workspace for power users, designers & students',
      features: [
        'Unlimited Infinite Whiteboards',
        'High-Precision Apple Pencil Strokes',
        'LaTeX Formula & PDF Annotation Studio',
        'Voice Memos & Audio Sync',
        '10GB Cloud Storage',
        'Vector PDF & High-Res SVG Export',
        'Custom Grid & Background Paper Templates',
      ],
      current: currentTier === 'plan_b',
      badge: 'Most Popular',
      buttonText: 'Upgrade to Pro Creator',
    },
    {
      id: 'plan_c',
      name: 'Plan C (Enterprise Studio)',
      price: '$24.99',
      period: '/month',
      desc: 'Real-time multi-user live collaboration & enterprise storage',
      features: [
        'Everything in Pro Creator',
        'Multi-User Live Collaboration Rooms',
        'Unlimited Audio Voice Memos',
        '100GB High-Speed Cloud Storage',
        'Priority Cloud Rendering & AI OCR',
        'Team Folders & Shared Workspaces',
        '24/7 Dedicated Priority Support',
      ],
      current: currentTier === 'plan_c',
      badge: 'Enterprise',
      buttonText: 'Upgrade to Enterprise Studio',
    },
  ];

  const handlePlanSelect = (planId) => {
    if (planId === currentTier) return;
    const target = plans.find(p => p.id === planId);
    if (target) {
      setSelectedPlanForCheckout(target);
    }
  };

  const handlePaymentSuccess = async (planId) => {
    setIsUpgrading(true);
    await upgradePlan(planId);
    setIsUpgrading(false);
    const targetPlan = plans.find(p => p.id === planId);
    setUpgradeFeedback(`Switched to ${targetPlan?.name || planId} successfully!`);
  };

  const handleExportBackupJSON = () => {
    const backupData = {
      user: { name: user?.name, email: user?.email, tier: user?.tier },
      notesCount: notes.length,
      foldersCount: folders.length,
      notes,
      folders,
      exportedAt: new Date().toISOString(),
      version: '2.0.0',
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DrawText_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearCache = () => {
    if (window.confirm('Are you sure you want to clear your local offline canvas cache? Your cloud notes remain safe.')) {
      localStorage.removeItem('drawtext_cached_canvas');
      localStorage.removeItem('drawflow_cached_canvas');
      alert('Local canvas cache cleared successfully.');
    }
  };

  const shortcutCategories = [
    {
      category: 'Drawing & Canvas Tools',
      items: [
        { key: 'P', desc: 'Select Precision Pen tool' },
        { key: 'H', desc: 'Select Highlighter marker' },
        { key: 'E', desc: 'Select Smart Eraser' },
        { key: 'T', desc: 'Insert Text Annotation block' },
        { key: 'L', desc: 'Toggle Laser Pointer mode' },
      ]
    },
    {
      category: 'Navigation & Viewport',
      items: [
        { key: 'Space + Drag', desc: 'Pan canvas infinitely in any direction' },
        { key: 'Ctrl / Cmd + Wheel', desc: 'Smooth zoom in and out (20% to 400%)' },
        { key: 'Ctrl / Cmd + 0', desc: 'Reset zoom to 100% standard view' },
      ]
    },
    {
      category: 'History & Editing',
      items: [
        { key: 'Ctrl / Cmd + Z', desc: 'Undo last stroke or action' },
        { key: 'Ctrl / Cmd + Y / Shift+Z', desc: 'Redo previously undone stroke' },
        { key: 'Delete / Backspace', desc: 'Delete selected element or card' },
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150 select-none">
      <div className="w-full max-w-4xl rounded-3xl bg-[#131622] border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* User Identity Header (Wireframe 2) */}
        <div className="p-6 border-b border-slate-800 bg-[#0e111a] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt="Avatar"
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-500/50 shadow-lg"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">{user?.name || 'Rahul Singh'}</h3>
                <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {user?.accountStatus || `${currentTier.toUpperCase().replace('_', ' ')} Member`}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{user?.email || 'creator@drawflow.io'}</p>
            </div>
          </div>

          <button
            onClick={() => setSettingsOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800/80 bg-[#10131d]">
          <button
            onClick={() => setActiveTab('subscription')}
            className={`flex items-center gap-2 px-5 py-2.5 border-b-2 text-xs font-bold transition-all ${
              activeTab === 'subscription'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Crown className="w-4 h-4" />
            <span>Subscription & Tiers</span>
          </button>
          <button
            onClick={() => setActiveTab('cloud')}
            className={`flex items-center gap-2 px-5 py-2.5 border-b-2 text-xs font-bold transition-all ${
              activeTab === 'cloud'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>Cloud & Backup</span>
          </button>
          <button
            onClick={() => setActiveTab('shortcuts')}
            className={`flex items-center gap-2 px-5 py-2.5 border-b-2 text-xs font-bold transition-all ${
              activeTab === 'shortcuts'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Keyboard className="w-4 h-4" />
            <span>Shortcuts & Gestures</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Upgrade / Notification Banner */}
          {upgradeFeedback && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-xs text-emerald-300 font-semibold flex items-center gap-2 shadow-lg animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{upgradeFeedback}</span>
            </div>
          )}

          {activeTab === 'subscription' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-white">Select Workspace Tier</h4>
                  <p className="text-xs text-slate-400">Easily upgrade, downgrade, or change your active workspace plan.</p>
                </div>
                <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                  Current: {currentTier.toUpperCase().replace('_', ' ')}
                </span>
              </div>

              {/* Tiered Plan Cards Grid (Plan A, Plan B, Plan C) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative p-5 rounded-3xl border flex flex-col justify-between transition-all ${
                      plan.current
                        ? 'bg-indigo-950/40 border-indigo-500 shadow-2xl shadow-indigo-500/20 ring-2 ring-indigo-500/50'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Badge */}
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        plan.current
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {plan.current ? 'Active Plan' : plan.badge}
                      </span>
                    </div>

                    <div>
                      <h5 className="text-sm font-bold text-white">{plan.name}</h5>
                      <div className="flex items-baseline gap-1 my-2">
                        <span className="text-3xl font-black text-white">{plan.price}</span>
                        <span className="text-xs text-slate-400">{plan.period}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">{plan.desc}</p>

                      <div className="space-y-2 border-t border-slate-800 pt-3">
                        {plan.features.map((feat, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-300">
                            <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-800">
                      {plan.current ? (
                        <button
                          disabled
                          className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-800 text-emerald-300 border border-emerald-500/40 flex items-center justify-center gap-1.5 cursor-default"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Current Active Plan</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handlePlanSelect(plan.id)}
                          disabled={isUpgrading}
                          className={`w-full py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-lg active:scale-95 disabled:opacity-50 ${
                            plan.id === 'plan_a'
                              ? 'bg-slate-700 hover:bg-slate-600 border border-slate-600'
                              : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
                          }`}
                        >
                          {isUpgrading ? 'Switching Plan...' : plan.buttonText}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'cloud' && (
            <div className="space-y-5">
              {/* Storage Meter */}
              <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                      <HardDrive className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-white">Cloud Storage Allocation</h5>
                      <p className="text-xs text-slate-400">
                        {currentTier === 'plan_a' ? '100 MB Allocation' : currentTier === 'plan_b' ? '10 GB High-Speed Cloud' : '100 GB Enterprise Storage'}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-indigo-400">
                    {notes.length} Workspaces Synced
                  </span>
                </div>

                <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, Math.max(8, notes.length * 10))}%` }} 
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>Used: ~{(notes.length * 1.5).toFixed(1)} MB</span>
                  <span>Max: {currentTier === 'plan_a' ? '100 MB' : currentTier === 'plan_b' ? '10 GB' : '100 GB'}</span>
                </div>
              </div>

              {/* Backup and Cache Management */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-3">
                  <div>
                    <h5 className="text-sm font-bold text-white flex items-center gap-2">
                      <Download className="w-4 h-4 text-indigo-400" />
                      Export Data Backup
                    </h5>
                    <p className="text-xs text-slate-400 mt-1">
                      Download a complete JSON snapshot of all your whiteboards, notebooks, folders, and annotations.
                    </p>
                  </div>
                  <button
                    onClick={handleExportBackupJSON}
                    className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Download Backup (.json)</span>
                  </button>
                </div>

                <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-3">
                  <div>
                    <h5 className="text-sm font-bold text-white flex items-center gap-2">
                      <Trash2 className="w-4 h-4 text-rose-400" />
                      Clear Local Offline Cache
                    </h5>
                    <p className="text-xs text-slate-400 mt-1">
                      Purge temporary canvas strokes and cached thumbnails to free up local browser memory.
                    </p>
                  </div>
                  <button
                    onClick={handleClearCache}
                    className="w-full py-2.5 rounded-xl text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Purge Cache</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'shortcuts' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-base font-bold text-white mb-1">Keyboard Shortcuts & Gestures</h4>
                <p className="text-xs text-slate-400">Boost your productivity with these fast key commands.</p>
              </div>

              <div className="space-y-4">
                {shortcutCategories.map((cat, cIdx) => (
                  <div key={cIdx} className="space-y-2">
                    <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block">
                      {cat.category}
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {cat.items.map((s, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between"
                        >
                          <span className="text-xs text-slate-300">{s.desc}</span>
                          <kbd className="px-2.5 py-1 rounded-lg bg-slate-800 text-[11px] font-mono text-indigo-300 border border-slate-700 shadow-sm">
                            {s.key}
                          </kbd>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment & Checkout Modal */}
      <PaymentCheckoutModal
        plan={selectedPlanForCheckout}
        isOpen={!!selectedPlanForCheckout}
        onClose={() => setSelectedPlanForCheckout(null)}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};
