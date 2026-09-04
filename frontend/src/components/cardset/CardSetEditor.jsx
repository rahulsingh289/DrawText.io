import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  RotateCw, 
  Check, 
  X, 
  Play, 
  Sparkles, 
  Trash2, 
  Edit2, 
  Layers, 
  Award, 
  ChevronLeft, 
  ChevronRight,
  BookOpen,
  Volume2,
  Settings
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useNotesStore } from '../../store/useNotesStore';
import { useAuthStore } from '../../store/useAuthStore';

export const CardSetEditor = () => {
  const { currentNote, setCurrentNote, updateNote } = useNotesStore();

  const [cards, setCards] = useState([
    {
      id: 'card-1',
      front: 'What is Time Complexity of QuickSort in the average case?',
      back: 'O(N log N) average time complexity using divide-and-conquer partitioning.',
      tag: 'Algorithms',
    },
    {
      id: 'card-2',
      front: 'Explain Gradient Descent update rule in Neural Networks',
      back: 'W_new = W_old - (learning_rate * dLoss/dW). Moves weights in direction of steepest descent.',
      tag: 'Deep Learning',
    },
    {
      id: 'card-3',
      front: 'What is CAP Theorem in Distributed Databases?',
      back: 'Consistency, Availability, and Partition Tolerance: A distributed system can only provide at most two guarantees simultaneously.',
      tag: 'System Design',
    }
  ]);

  const [mode, setMode] = useState('manage'); // 'manage' | 'study'
  const [studyIndex, setStudyIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [score, setScore] = useState({ mastered: 0, review: 0 });
  const [isFinished, setIsFinished] = useState(false);

  // New card modal/form
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newTag, setNewTag] = useState('Concept');

  const handleAddCard = (e) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim()) return;
    const newCard = {
      id: `card-${Date.now()}`,
      front: newFront.trim(),
      back: newBack.trim(),
      tag: newTag.trim() || 'General',
    };
    setCards([...cards, newCard]);
    setNewFront('');
    setNewBack('');
    setIsAddModalOpen(false);
  };

  const handleDeleteCard = (id) => {
    setCards(cards.filter(c => c.id !== id));
  };

  const startStudySession = () => {
    setMode('study');
    setStudyIndex(0);
    setIsFlipped(false);
    setScore({ mastered: 0, review: 0 });
    setIsFinished(false);
  };

  const handleAnswer = (mastered) => {
    if (mastered) {
      setScore(prev => ({ ...prev, mastered: prev.mastered + 1 }));
    } else {
      setScore(prev => ({ ...prev, review: prev.review + 1 }));
    }

    if (studyIndex < cards.length - 1) {
      setStudyIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      setIsFinished(true);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  };

  const currentCard = cards[studyIndex];

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
            <span className="text-sm font-bold text-slate-100">{currentNote?.title || 'Card Set & Flashcards'}</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Flashcard Deck
            </span>
          </div>
        </div>

        {/* Center Toggle: Manage Deck vs Study Mode */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-2xl border border-slate-800/80">
          <button
            onClick={() => setMode('manage')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              mode === 'manage' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Deck Overview ({cards.length})</span>
          </button>
          <button
            onClick={startStudySession}
            disabled={cards.length === 0}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              mode === 'study' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-white disabled:opacity-40'
            }`}
          >
            <Play className="w-4 h-4" />
            <span>Study Mode</span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {mode === 'manage' && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/30 transition-transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Flashcard</span>
            </button>
          )}

          <button
            onClick={() => useAuthStore.getState().setSettingsOpen(true)}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Settings & Subscription Plans"
          >
            <Settings className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8 flex justify-center bg-[#07090e]">
        {mode === 'manage' ? (
          /* Deck Cards Grid View */
          <div className="w-full max-w-5xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Concept Flashcard Collection</h3>
                <p className="text-xs text-slate-400">Review front prompts and back explanations or practice with interactive study mode.</p>
              </div>
              <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
                {cards.length} Total Cards
              </span>
            </div>

            {cards.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-slate-800 rounded-3xl bg-[#131622]">
                <Layers className="w-12 h-12 text-amber-400 mx-auto mb-3 opacity-60" />
                <h4 className="text-base font-bold text-slate-200 mb-1">Deck is Empty</h4>
                <p className="text-xs text-slate-400 mb-4">Add flashcards with questions on the front and answers on the back.</p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-md"
                >
                  + Create First Flashcard
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cards.map((card, idx) => (
                  <div
                    key={card.id}
                    className="p-5 rounded-3xl bg-[#131724] border border-slate-800 hover:border-amber-500/50 transition-all flex flex-col justify-between shadow-xl group"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[10px] text-slate-500 font-mono">
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 font-semibold">
                          #{idx + 1} {card.tag}
                        </span>
                        <button
                          onClick={() => handleDeleteCard(card.id)}
                          className="text-slate-500 hover:text-rose-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="py-3">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                          Front Prompt
                        </span>
                        <p className="text-sm font-semibold text-slate-100 leading-snug">{card.front}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-800/60">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block mb-1">
                          Back Answer
                        </span>
                        <p className="text-xs text-slate-300 leading-relaxed">{card.back}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Interactive 3D Flashcard Study Session */
          <div className="w-full max-w-xl flex flex-col items-center justify-center space-y-6">
            {!isFinished && currentCard ? (
              <>
                {/* Progress Bar & Counter */}
                <div className="w-full flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>Card {studyIndex + 1} of {cards.length}</span>
                  <div className="w-48 bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full transition-all duration-300"
                      style={{ width: `${((studyIndex + 1) / cards.length) * 100}%` }}
                    />
                  </div>
                  <span>{currentCard.tag}</span>
                </div>

                {/* 3D Flip Card */}
                <div
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="w-full min-h-[340px] rounded-3xl p-8 bg-[#141828] border border-slate-700 hover:border-amber-500/60 shadow-2xl flex flex-col justify-between cursor-pointer transition-all duration-300 hover:scale-[1.01]"
                >
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono pb-3 border-b border-slate-800">
                    <span className="text-amber-400 font-bold uppercase tracking-wider">
                      {isFlipped ? 'Answer (Back)' : 'Question (Front)'}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                      <RotateCw className="w-3.5 h-3.5" /> Click to flip
                    </span>
                  </div>

                  <div className="my-auto py-6 text-center">
                    <p className={`text-xl font-bold leading-relaxed ${isFlipped ? 'text-emerald-300 font-normal text-base' : 'text-white'}`}>
                      {isFlipped ? currentCard.back : currentCard.front}
                    </p>
                  </div>

                  <div className="text-center pt-3 border-t border-slate-800 text-xs text-slate-500">
                    {isFlipped ? 'Now assess your recall below' : 'Tap anywhere to reveal answer'}
                  </div>
                </div>

                {/* Score / Mastery Rating Buttons */}
                {isFlipped && (
                  <div className="flex items-center gap-4 w-full animate-in fade-in zoom-in-95 duration-150">
                    <button
                      onClick={() => handleAnswer(false)}
                      className="flex-1 py-3.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center justify-center gap-2 transition-transform active:scale-95"
                    >
                      <X className="w-4 h-4" />
                      <span>Needs Review</span>
                    </button>
                    <button
                      onClick={() => handleAnswer(true)}
                      className="flex-1 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 text-xs font-bold flex items-center justify-center gap-2 transition-transform active:scale-95"
                    >
                      <Check className="w-4 h-4" />
                      <span>Mastered</span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* Session Finished Summary */
              <div className="w-full p-8 rounded-3xl bg-[#141828] border border-amber-500/40 text-center space-y-4 shadow-2xl">
                <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-glow">
                  <Award className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white">Study Session Complete!</h3>
                <p className="text-xs text-slate-400">Great work reviewing your flashcard deck.</p>

                <div className="grid grid-cols-2 gap-4 py-3">
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-2xl font-black text-emerald-400">{score.mastered}</span>
                    <span className="text-xs text-slate-400 block mt-1">Mastered</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                    <span className="text-2xl font-black text-rose-400">{score.review}</span>
                    <span className="text-xs text-slate-400 block mt-1">Needs Review</span>
                  </div>
                </div>

                <button
                  onClick={startStudySession}
                  className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-600/30"
                >
                  Restart Session
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Flashcard Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-[#141824] border border-slate-700/80 shadow-2xl p-6">
            <h3 className="text-base font-bold text-white mb-1">Create Flashcard</h3>
            <p className="text-xs text-slate-400 mb-4">Add a new prompt and answer to this card set.</p>
            <form onSubmit={handleAddCard} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Front Prompt / Question
                </label>
                <textarea
                  value={newFront}
                  onChange={(e) => setNewFront(e.target.value)}
                  placeholder="e.g. What is Moore's Law?"
                  rows={2}
                  required
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Back Explanation / Answer
                </label>
                <textarea
                  value={newBack}
                  onChange={(e) => setNewBack(e.target.value)}
                  placeholder="e.g. Observation that the number of transistors in an integrated circuit doubles roughly every two years."
                  rows={3}
                  required
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Tag / Subject
                </label>
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="e.g. Physics, CS, Biology"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/30"
                >
                  Save Flashcard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
