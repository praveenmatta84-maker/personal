import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  RotateCcw,
  Calendar,
  Compass,
  CheckCircle2,
  BookOpen,
  FileText,
  User as UserIcon,
} from 'lucide-react';
import { UserGoal, UserProfile } from '../types';

interface MindEntranceProps {
  goal: UserGoal;
  user: UserProfile;
  undoCount: number;
  onUndo: () => void;
  onEnterApp: (mindText?: string) => void;
  onOpenAiWithMind: (mindText: string) => void;
  onOpenAuth: () => void;
  onOpenCalendar: () => void;
  onOpenNotebook: () => void;
  onOpenDocuments: () => void;
}

export const MindEntrance: React.FC<MindEntranceProps> = ({
  goal,
  user,
  undoCount,
  onUndo,
  onEnterApp,
  onOpenAiWithMind,
  onOpenAuth,
  onOpenCalendar,
  onOpenNotebook,
  onOpenDocuments,
}) => {
  const [mindText, setMindText] = useState('');

  const quickPrompts = [
    'What are the core ideas of Stoicism for daily focus?',
    'Explain the Feynman Technique for rapid mastery',
    'Conquer daily execution tasks without distraction',
    'Recommend 3 books on cognitive energy and resilience',
  ];

  const handleStartPlanning = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onEnterApp(mindText.trim() || undefined);
  };

  const handleAskAi = () => {
    onOpenAiWithMind(mindText.trim() || 'What are the most effective strategies for deep focus and routine mastery?');
  };

  return (
    <div className="relative min-h-screen bg-orange-flow flex flex-col justify-between text-white selection:bg-white selection:text-orange-600 overflow-hidden font-sans">
      {/* Decorative soft atmospheric glow overlays */}
      <div className="absolute inset-0 bg-orange-mesh pointer-events-none opacity-80" />
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-orange-950/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header: Undo Button on Top-Left + Brand + User */}
      <header className="relative z-20 flex items-center justify-between px-6 sm:px-10 py-6 max-w-7xl mx-auto w-full">
        {/* Left: Universal Undo Button & App Identity */}
        <div className="flex items-center gap-3">
          <button
            onClick={onUndo}
            disabled={undoCount === 0}
            title={undoCount > 0 ? `Undo last action (${undoCount} available)` : 'No actions to undo'}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold backdrop-blur-md transition-all ${
              undoCount > 0
                ? 'bg-white/20 hover:bg-white/30 text-white border border-white/30 shadow-md active:scale-95 cursor-pointer'
                : 'bg-white/10 text-white/40 border border-white/10 cursor-not-allowed'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Undo</span>
            {undoCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-white text-orange-600 flex items-center justify-center text-[10px] tabular-nums font-bold">
                {undoCount}
              </span>
            )}
          </button>

          <div className="hidden sm:flex items-center gap-2 pl-2">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-xs font-medium tracking-wide uppercase text-white/80">
              Personal Planning App
            </span>
          </div>
        </div>

        {/* Right: Quick Navigation & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onOpenCalendar}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-white/90 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Calendar</span>
          </button>

          <button
            onClick={onOpenNotebook}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-white/90 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Notebook</span>
          </button>

          <button
            onClick={onOpenDocuments}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-white/90 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Documents</span>
          </button>

          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/30 text-white transition-all cursor-pointer shadow-xs"
            title={user.isLoggedIn ? `Account: ${user.email}` : 'Sign in with Gmail'}
          >
            <div className="w-6 h-6 rounded-full bg-white text-orange-600 flex items-center justify-center text-xs font-bold shadow-xs">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <span className="text-xs font-medium max-w-[90px] truncate hidden sm:inline">
              {user.isLoggedIn ? user.name : 'Sign In'}
            </span>
          </button>
        </div>
      </header>

      {/* Main Flow Content: "What's on your mind?" with beautiful white typography */}
      <main className="relative z-10 max-w-3xl mx-auto w-full px-6 py-8 sm:py-16 my-auto text-center space-y-8">
        {/* App Title & Subtitle Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-medium text-white shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-orange-100" />
          <span>Personal Planning App</span>
          <span className="text-white/60">·</span>
          <span className="text-white/90 font-semibold">Plan for your goal</span>
        </div>

        {/* White Title in Beautiful Serif Font: "What's on your mind?" */}
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-light text-white tracking-tight leading-tight drop-shadow-sm">
            What's on your mind?
          </h1>
          <p className="text-sm sm:text-base text-white/90 max-w-xl mx-auto font-light leading-relaxed">
            Clarify your daily intention, set your goal, and arrange your task slots in peace.
          </p>
        </div>

        {/* Peaceful White Input Card */}
        <div className="p-4 sm:p-6 rounded-3xl bg-white text-stone-900 shadow-2xl border border-white/40 space-y-4 text-left transition-all">
          <form onSubmit={handleStartPlanning} className="space-y-3">
            <label className="block text-xs font-semibold text-orange-950 uppercase tracking-wider">
              Today's Focus or Goal
            </label>
            <div className="relative">
              <textarea
                value={mindText}
                onChange={(e) => setMindText(e.target.value)}
                placeholder="What's on your mind? Ask any question, explore concepts, or set your daily goal (e.g., 'Explain quantum computing', 'How to master TypeScript', 'Study 2 chapters today')..."
                rows={3}
                className="w-full px-4 py-3 rounded-2xl bg-orange-50/50 hover:bg-orange-50/80 focus:bg-white border border-orange-200 focus:border-orange-500 focus:ring-3 focus:ring-orange-500/20 text-stone-900 text-sm placeholder:text-stone-400 outline-hidden transition-all resize-none font-sans"
              />
            </div>

            {/* Quick Inspiration Prompts */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-medium text-stone-400 mr-1">Quick ideas:</span>
              {quickPrompts.map((prompt) => (
                <button
                  type="button"
                  key={prompt}
                  onClick={() => setMindText(prompt)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-orange-100 hover:text-orange-900 text-stone-600 transition-colors cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Action Buttons: Pure Orange & White */}
            <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => onEnterApp()}
                className="text-xs text-stone-500 hover:text-orange-700 font-medium transition-colors cursor-pointer py-1"
              >
                Skip straight to routine slots →
              </button>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleAskAi}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-950 text-xs font-semibold border border-orange-200 transition-all cursor-pointer"
                  title="Let AI structure this thought into task slots"
                >
                  <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                  <span>Ask AI to Structure</span>
                </button>

                <button
                  type="submit"
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <span>Plan For Your Goal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>

      {/* Serene Footer */}
      <footer className="relative z-10 px-6 py-6 text-center text-xs text-white/70 max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="font-light">
          Personal Planning App · No mock data, real routines & true streaks.
        </p>
        <button
          onClick={() => onEnterApp()}
          className="text-white hover:text-white/90 underline font-medium cursor-pointer"
        >
          Open Routine Timetable ({goal.title || 'My Goal'})
        </button>
      </footer>
    </div>
  );
};
