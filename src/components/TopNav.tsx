import React from 'react';
import { RotateCcw, Calendar, BookOpen, FileText, User as UserIcon, Flame, Sparkles } from 'lucide-react';
import { UserGoal, UserProfile } from '../types';

interface TopNavProps {
  goal: UserGoal;
  user: UserProfile;
  undoCount: number;
  onUndo: () => void;
  onOpenCalendar: () => void;
  onOpenNotebook: () => void;
  onOpenDocuments: () => void;
  onOpenAuth: () => void;
  onOpenMindEntrance: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  goal,
  user,
  undoCount,
  onUndo,
  onOpenCalendar,
  onOpenNotebook,
  onOpenDocuments,
  onOpenAuth,
  onOpenMindEntrance,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-orange-100 px-4 md:px-8 py-3.5 transition-colors shadow-2xs">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Left Zone: Undo Button + Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onUndo}
            disabled={undoCount === 0}
            title={undoCount > 0 ? `Undo last action (${undoCount} available)` : 'No actions to undo'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              undoCount > 0
                ? 'bg-orange-50 text-orange-800 border border-orange-200 hover:bg-orange-100 active:scale-95 cursor-pointer shadow-2xs'
                : 'text-stone-300 bg-stone-50 border border-stone-100 cursor-not-allowed opacity-50'
            }`}
            aria-label="Undo action"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Undo</span>
            {undoCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px] tabular-nums font-semibold">
                {undoCount}
              </span>
            )}
          </button>

          <button
            onClick={onOpenMindEntrance}
            className="flex flex-col text-left group cursor-pointer"
            title="Return to 'What's on your mind?'"
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 group-hover:scale-125 transition-transform" />
              <span className="font-serif text-lg tracking-tight font-semibold text-stone-900 group-hover:text-orange-600 transition-colors">
                Personal Planning App
              </span>
            </div>
            <span className="text-[10px] font-medium text-orange-600 pl-4.5 -mt-0.5 tracking-wide">
              Plan for your goal
            </span>
          </button>
        </div>

        {/* Center Zone: Separate Button to See Title Name & Streak (Opens Calendar View) */}
        <div className="flex-1 max-w-md flex items-center justify-center">
          <button
            onClick={onOpenCalendar}
            title="Click to view full calendar timetable and streak details"
            className="group flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-orange-50/70 hover:bg-orange-100 border border-orange-200 transition-all text-left shadow-2xs max-w-full cursor-pointer"
          >
            <div className="flex items-center gap-1 text-xs font-semibold text-orange-700 bg-white px-2 py-0.5 rounded-md border border-orange-200 shrink-0">
              <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
              <span className="tabular-nums">{goal.streak}d Streak</span>
            </div>

            <div className="flex items-center gap-1.5 truncate">
              <span className="text-xs font-medium text-stone-800 group-hover:text-orange-950 truncate">
                {goal.title || 'Plan for your goal'}
              </span>
              <Calendar className="w-3.5 h-3.5 text-orange-400 group-hover:text-orange-600 shrink-0" />
            </div>
          </button>
        </div>

        {/* Right Zone: Clean Functional Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <button
            onClick={onOpenMindEntrance}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 transition-all cursor-pointer"
            title="What's on your mind? entry flow"
          >
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            <span className="hidden sm:inline">What's on your mind?</span>
          </button>

          <button
            onClick={onOpenCalendar}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-stone-700 hover:text-orange-600 hover:bg-orange-50 border border-transparent hover:border-orange-200 transition-colors cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-stone-400" />
            <span className="hidden md:inline">Calendar</span>
          </button>

          <button
            onClick={onOpenNotebook}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-stone-700 hover:text-orange-600 hover:bg-orange-50 border border-transparent hover:border-orange-200 transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-stone-400" />
            <span className="hidden md:inline">Notebook</span>
          </button>

          <button
            onClick={onOpenDocuments}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-stone-700 hover:text-orange-600 hover:bg-orange-50 border border-transparent hover:border-orange-200 transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-stone-400" />
            <span className="hidden md:inline">Documents</span>
          </button>

          {/* User Profile / Account Button */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-full bg-white hover:bg-orange-50 border border-stone-200 hover:border-orange-300 transition-all cursor-pointer shadow-2xs"
            title={user.isLoggedIn ? `Account: ${user.email}` : 'Sign in with Gmail'}
          >
            <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-800 flex items-center justify-center text-xs font-semibold">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <span className="text-xs font-medium text-stone-800 max-w-[80px] sm:max-w-[110px] truncate hidden sm:inline">
              {user.isLoggedIn ? user.name : 'Sign In'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
