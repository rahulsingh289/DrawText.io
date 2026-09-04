import React, { useState } from 'react';
import { 
  Sparkles, 
  Lock, 
  Mail, 
  User as UserIcon, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Zap,
  Layers,
  PenTool,
  BookOpen,
  FileText,
  FileCode
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { DrawTextLogo } from '../common/DrawTextLogo';

export const AuthScreen = () => {
  const { login, register, quickDemoLogin, isLoading, authError } = useAuthStore();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSignUp) {
      if (!name.trim() || !email.trim() || !password.trim()) return;
      await register(name.trim(), email.trim(), password.trim());
    } else {
      if (!email.trim() || !password.trim()) return;
      await login(email.trim(), password.trim());
    }
  };

  const featurePills = [
    { label: 'Infinite Whiteboard', icon: PenTool },
    { label: 'Multi-Page Notebooks', icon: BookOpen },
    { label: 'PDF Annotations', icon: FileText },
    { label: 'Flashcard Study Decks', icon: FileCode },
  ];

  return (
    <div className="w-screen h-screen flex bg-[#080a10] text-slate-100 overflow-hidden select-none">
      {/* Left Aesthetic Showcase Panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 bg-gradient-to-br from-[#121626] via-[#0b0e17] to-[#080a10] border-r border-slate-800/80 relative overflow-hidden">
        {/* Background decorative glow effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Top */}
        <div className="flex items-center gap-3.5 z-10">
          <DrawTextLogo size={44} />
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              DrawText.io
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                PRO 2.0
              </span>
            </h1>
            <p className="text-xs text-slate-400">Next-Gen Visual Workspace</p>
          </div>
        </div>

        {/* Hero Value Statement */}
        <div className="max-w-md z-10 space-y-6">
          <h2 className="text-4xl font-extrabold text-white leading-tight tracking-tight">
            Infinite Ideas. <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Structured Thinking.
            </span>
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Create infinite whiteboard diagrams, structured multi-page notebooks, annotate PDF research papers, and study with interactive flashcard decks — all in one unified workspace.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            {featurePills.map((p, i) => {
              const Icon = p.icon;
              return (
                <div
                  key={i}
                  className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md"
                >
                  <div className="w-7 h-7 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-200">{p.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trust Footer */}
        <div className="flex items-center gap-6 text-xs text-slate-400 z-10">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>End-to-End Synced</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Real-time Multi-user</span>
          </div>
        </div>
      </div>

      {/* Right Login / Sign-up Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 relative overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center space-y-1.5">
            <div className="lg:hidden flex items-center justify-center gap-2 mb-4">
              <DrawTextLogo size={36} />
              <span className="text-lg font-bold text-white">DrawText.io</span>
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight">
              {isSignUp ? 'Create your workspace' : 'Welcome back'}
            </h3>
            <p className="text-xs text-slate-400">
              {isSignUp ? 'Join DrawText.io to start creating diagrams & notebooks' : 'Sign in to access your notes and whiteboards'}
            </p>
          </div>

          {/* Quick Demo Access Button */}
          <button
            onClick={quickDemoLogin}
            type="button"
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Instant Demo Access (One-Click)</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-[11px] uppercase font-mono text-slate-400">Or continue with email</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          {/* Error Message if any */}
          {authError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 text-center font-medium">
              {authError}
            </div>
          )}

          {/* Main Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Rahul Singh"
                    required={isSignUp}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>{isSignUp ? 'Create Free Account' : 'Sign In to Workspace'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch Tab */}
          <div className="text-center pt-2">
            <p className="text-xs text-slate-400">
              {isSignUp ? 'Already have an account?' : "Don't have an account yet?"}{' '}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-indigo-400 font-bold hover:underline ml-1"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
