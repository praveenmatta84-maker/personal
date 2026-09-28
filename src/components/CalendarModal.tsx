import React, { useState } from 'react';
import { X, Flame, ChevronLeft, ChevronRight, CheckCircle2, Clock, Calendar as CalendarIcon, Sparkles } from 'lucide-react';
import { DocumentItem, RoutineSlot, UserGoal } from '../types';
import { calculateRoutineStats, formatDuration, formatTime12h } from '../utils/scheduler';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: UserGoal;
  slots: RoutineSlot[];
  documents: DocumentItem[];
  onToggleSlotComplete: (slotId: string) => void;
  onOpenDoc: (doc: DocumentItem) => void;
  onEditGoal: () => void;
}

export const CalendarModal: React.FC<CalendarModalProps> = ({
  isOpen,
  onClose,
  goal,
  slots,
  documents,
  onToggleSlotComplete,
  onOpenDoc,
  onEditGoal,
}) => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState(today.getDate());

  if (!isOpen) return null;

  const stats = calculateRoutineStats(slots);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const getDateKey = (day: number) => {
    const m = (currentMonth + 1).toString().padStart(2, '0');
    const d = day.toString().padStart(2, '0');
    return `${currentYear}-${m}-${d}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-md flex items-center justify-center p-0 md:p-6 overflow-y-auto">
      {/* Full Window Container */}
      <div className="w-full h-full md:max-w-6xl md:h-[92vh] bg-white md:rounded-3xl border border-stone-200/90 shadow-2xl flex flex-col overflow-hidden animate-in fade-in duration-150">
        {/* Top Header: Orange Flow with Pristine White Typography */}
        <div className="flex items-center justify-between px-6 py-4.5 bg-orange-flow text-white border-b border-white/20 shadow-xs shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md text-white border border-white/30 flex items-center justify-center shadow-xs">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/80 font-medium">Goal Calendar & Timetable</span>
                <span className="text-white/60">·</span>
                <button
                  onClick={onEditGoal}
                  className="text-xs text-white hover:text-orange-100 font-semibold underline cursor-pointer"
                >
                  Edit Goal Name
                </button>
              </div>
              <h1 className="text-xl font-serif font-medium text-white tracking-tight drop-shadow-xs">
                {goal.title || 'My Daily Goal'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Real Streak Count */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white text-orange-950 shadow-md border border-white/80">
              <Flame className="w-4 h-4 fill-orange-500 text-orange-500 shrink-0" />
              <div>
                <span className="text-xs font-bold tabular-nums block leading-tight">{goal.streak}-Day Streak</span>
                <span className="text-[10px] text-stone-500 block leading-tight">
                  {goal.streak > 0 ? 'Verified streak' : 'Start streak today'}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
              aria-label="Close window"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-stone-200">
          {/* Left Column (5 cols): Interactive Calendar & Streak Insights */}
          <div className="lg:col-span-5 p-6 bg-white flex flex-col space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-stone-900 font-serif">
                {monthNames[currentMonth]} {currentYear}
              </h2>
              <div className="flex items-center gap-1">
                <button
                  onClick={prevMonth}
                  className="p-1 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextMonth}
                  className="p-1 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Calendar Days Grid */}
            <div>
              <div className="grid grid-cols-7 text-center mb-2 text-[11px] font-medium text-stone-400">
                <span>Su</span>
                <span>Mo</span>
                <span>Tu</span>
                <span>We</span>
                <span>Th</span>
                <span>Fr</span>
                <span>Sa</span>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center">
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-10" />
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateKey = getDateKey(day);
                  const isDone = goal.completionHistory[dateKey];
                  const isSelected = selectedDay === day;
                  const isToday = currentYear === 2026 && currentMonth === 8 && day === 27;

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`relative h-10 rounded-xl flex flex-col items-center justify-center text-xs transition-all ${
                        isSelected
                          ? 'bg-orange-600 text-white font-medium shadow-xs'
                          : 'hover:bg-orange-50 text-stone-700'
                      }`}
                    >
                      <span className="font-mono tabular-nums">{day}</span>
                      {isDone && (
                        <span
                          className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                            isSelected ? 'bg-white' : 'bg-orange-500'
                          }`}
                        />
                      )}
                      {isToday && !isSelected && (
                        <span className="absolute top-1 right-1 w-1 h-1 rounded-full bg-orange-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Daily Progress Summary */}
            <div className="p-4 rounded-2xl bg-orange-50/40 border border-orange-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                  Today’s Rhythm
                </span>
                <span className="text-xs font-mono font-medium text-orange-700">
                  {stats.percentage}% Completed
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-stone-200 overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full transition-all duration-300"
                  style={{ width: `${stats.percentage}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                <div className="p-2.5 rounded-xl bg-white border border-stone-200/80">
                  <span className="text-[11px] text-stone-400 block">Slots Done</span>
                  <span className="text-sm font-mono font-semibold text-stone-800 tabular-nums">
                    {stats.completed} / {stats.total}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-stone-200/80">
                  <span className="text-[11px] text-stone-400 block">Focus Hours</span>
                  <span className="text-sm font-mono font-semibold text-stone-800 tabular-nums">
                    {formatDuration(stats.totalMinutes)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (7 cols): Full Day Timetable Slots View */}
          <div className="lg:col-span-7 p-6 bg-stone-50/50 flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-stone-900 font-serif">
                  Schedule for {monthNames[currentMonth]} {selectedDay}, {currentYear}
                </h3>
                <p className="text-xs text-stone-500">
                  {slots.length > 0 ? 'All scheduled slots in time order.' : 'No slots created yet.'}
                </p>
              </div>

              <span className="text-xs font-mono text-stone-600 tabular-nums bg-white px-2.5 py-1 rounded-lg border border-stone-200">
                {slots.length} Slot{slots.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Slots Timeline List */}
            {slots.length === 0 ? (
              <div className="p-10 rounded-2xl bg-white border border-dashed border-stone-300 text-center space-y-2">
                <Clock className="w-8 h-8 text-stone-300 mx-auto" />
                <h4 className="text-xs font-semibold text-stone-700">No Slots Scheduled</h4>
                <p className="text-xs text-stone-400 max-w-xs mx-auto">
                  Slots will appear here as soon as you create them.
                </p>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-[520px] pr-1">
                {slots.map((slot) => {
                  const doc = documents.find((d) => d.id === slot.documentId);

                  return (
                    <div
                      key={slot.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        slot.completed
                          ? 'bg-stone-50 border-stone-200 text-stone-400'
                          : 'bg-white border-stone-200 hover:border-orange-300 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => onToggleSlotComplete(slot.id)}
                            className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                              slot.completed
                                ? 'bg-orange-500 border-orange-500 text-white'
                                : 'border-stone-300 bg-white hover:border-orange-500'
                            }`}
                          >
                            {slot.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </button>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-medium text-stone-700 tabular-nums">
                                {formatTime12h(slot.startTime)} - {formatTime12h(slot.endTime)}
                              </span>
                              <span className="text-xs text-stone-400">·</span>
                              <span className="text-[11px] text-orange-700 font-medium">{slot.category}</span>
                            </div>
                            <h4
                              className={`text-sm font-medium ${
                                slot.completed ? 'line-through text-stone-400' : 'text-stone-900'
                              }`}
                            >
                              {slot.title}
                            </h4>
                          </div>
                        </div>

                        {doc && (
                          <div
                            onClick={() => onOpenDoc(doc)}
                            className="flex items-center gap-2 p-1 bg-orange-50/70 hover:bg-orange-100/70 rounded-lg border border-orange-200 cursor-pointer group"
                            title={`Resume reading: ${doc.title}`}
                          >
                            {doc.coverImage && (
                              <img
                                src={doc.coverImage}
                                alt={doc.title}
                                referrerPolicy="no-referrer"
                                className="w-7 h-10 object-cover rounded-sm shadow-2xs"
                              />
                            )}
                            <div className="text-left hidden sm:block pr-1">
                              <span className="text-[10px] text-orange-800 font-medium block">
                                Resume doc
                              </span>
                              <span className="text-[10px] text-stone-500 font-mono">
                                p.{doc.bookmarkPage || 1}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
