import React, { useState, useEffect } from 'react';
import { X, Target } from 'lucide-react';
import { UserGoal } from '../types';

interface GoalEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: UserGoal;
  onSave: (updated: UserGoal) => void;
}

export const GoalEditModal: React.FC<GoalEditModalProps> = ({
  isOpen,
  onClose,
  goal,
  onSave,
}) => {
  const [title, setTitle] = useState(goal.title);
  const [description, setDescription] = useState(goal.description);
  const [targetHours, setTargetHours] = useState(goal.targetHoursPerDay);

  useEffect(() => {
    setTitle(goal.title);
    setDescription(goal.description);
    setTargetHours(goal.targetHoursPerDay);
  }, [goal, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      ...goal,
      title: title.trim(),
      description: description.trim(),
      targetHoursPerDay: targetHours,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-stone-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6 bg-orange-flow text-white border-b border-white/20 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md text-white border border-white/30 flex items-center justify-center shadow-xs">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-medium text-white tracking-tight drop-shadow-xs">
                Plan For Your Goal: Title & Focus
              </h2>
              <p className="text-xs text-white/80">
                Give a title name to your goal and define your routine target.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Title Name of Your Goal *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Master Full-Stack Development, Daily Physical Vitality"
              className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-medium text-stone-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Goal Purpose / Notes
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What intention drives this goal routine?"
              className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 resize-none text-stone-700"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-700 mb-1">
              Target Daily Focus Hours
            </label>
            <input
              type="number"
              min={1}
              max={16}
              value={targetHours}
              onChange={(e) => setTargetHours(Number(e.target.value))}
              className="w-full px-3 py-1.5 font-mono text-xs rounded-xl border border-stone-300"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-medium text-white bg-orange-600 hover:bg-orange-500 rounded-xl shadow-xs"
            >
              Save Goal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
