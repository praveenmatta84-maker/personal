import React from 'react';
import { Check, Clock, BookOpen, Edit2, Trash2, ArrowUp, ArrowDown, Bookmark } from 'lucide-react';
import { DocumentItem, RoutineSlot } from '../types';
import { formatTime12h } from '../utils/scheduler';

interface SlotCardProps {
  slot: RoutineSlot;
  linkedDoc?: DocumentItem;
  onToggleComplete: (slotId: string) => void;
  onEdit: (slot: RoutineSlot) => void;
  onDelete: (slotId: string) => void;
  onOpenDoc: (doc: DocumentItem) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export const SlotCard: React.FC<SlotCardProps> = ({
  slot,
  linkedDoc,
  onToggleComplete,
  onEdit,
  onDelete,
  onOpenDoc,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}) => {
  return (
    <div
      className={`group relative rounded-2xl border transition-all duration-150 p-4 sm:p-5 ${
        slot.completed
          ? 'bg-white/60 border-stone-200 text-stone-400 opacity-75'
          : 'card-glass-white border-orange-100 hover:border-orange-300 hover:shadow-md text-stone-800'
      }`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left: Completion Checkbox & Core Slot Info */}
        <div className="flex items-start gap-3.5 flex-1 min-w-0">
          <button
            onClick={() => onToggleComplete(slot.id)}
            className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center border transition-all cursor-pointer shrink-0 ${
              slot.completed
                ? 'bg-orange-500 border-orange-500 text-white shadow-xs'
                : 'border-orange-200 bg-white hover:border-orange-500 text-transparent'
            }`}
            aria-label={slot.completed ? 'Mark incomplete' : 'Mark complete'}
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </button>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-semibold tabular-nums text-orange-950 bg-orange-100/70 border border-orange-200 px-2 py-0.5 rounded-md">
                {formatTime12h(slot.startTime)} – {formatTime12h(slot.endTime)}
              </span>
              <span className="text-xs text-orange-300">·</span>
              <span className="font-mono text-xs text-stone-500 tabular-nums">
                {slot.durationMinutes}m
              </span>
              <span className="text-xs text-orange-300">·</span>
              <span className="text-xs font-medium text-orange-800 bg-orange-50 px-2.5 py-0.5 rounded-md border border-orange-200">
                {slot.category}
              </span>
            </div>

            <h3
              className={`text-base font-medium tracking-tight transition-all ${
                slot.completed ? 'line-through text-stone-400' : 'text-stone-900'
              }`}
            >
              {slot.title}
            </h3>

            {slot.note && (
              <p className="text-xs text-stone-500 line-clamp-1 leading-relaxed">
                {slot.note}
              </p>
            )}
          </div>
        </div>

        {/* Right: Linked Document Preview or Actions */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-stone-100">
          {/* Linked Document Image & Quick Resume Button */}
          {linkedDoc && (
            <div
              onClick={() => onOpenDoc(linkedDoc)}
              title={`Click to expand & resume reading "${linkedDoc.title}" from page ${linkedDoc.bookmarkPage}`}
              className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-orange-50/50 hover:bg-orange-100/70 border border-orange-200/80 transition-all cursor-pointer group/doc shadow-2xs max-w-[240px]"
            >
              {/* Visible Document Image Thumbnail */}
              <div className="relative w-10 h-14 rounded-md overflow-hidden bg-stone-200 shrink-0 shadow-2xs">
                {linkedDoc.coverImage ? (
                  <img
                    src={linkedDoc.coverImage}
                    alt={linkedDoc.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover/doc:scale-105 transition-transform duration-200"
                  />
                ) : (
                  <div className="w-full h-full bg-orange-100 text-orange-700 flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/10 group-hover/doc:bg-transparent transition-colors" />
                <div className="absolute bottom-0.5 right-0.5 bg-black/70 text-white text-[9px] font-mono px-1 rounded-xs">
                  p.{linkedDoc.bookmarkPage || 1}
                </div>
              </div>

              <div className="min-w-0 text-left">
                <div className="flex items-center gap-1 text-[10px] font-medium text-orange-800">
                  <Bookmark className="w-2.5 h-2.5 fill-orange-600 text-orange-600 shrink-0" />
                  <span>Resume Reading</span>
                </div>
                <p className="text-xs font-medium text-stone-900 truncate group-hover/doc:text-orange-950">
                  {linkedDoc.title}
                </p>
                <p className="text-[10px] text-stone-500 tabular-nums">
                  Page {linkedDoc.bookmarkPage || 1} of {linkedDoc.totalPages || 1}
                </p>
              </div>
            </div>
          )}

          {/* Action Controls */}
          <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
            {onMoveUp && !isFirst && (
              <button
                onClick={onMoveUp}
                title="Move slot earlier"
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            )}

            {onMoveDown && !isLast && (
              <button
                onClick={onMoveDown}
                title="Move slot later"
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={() => onEdit(slot)}
              title="Edit slot title & time"
              className="p-1.5 rounded-lg text-stone-400 hover:text-orange-600 hover:bg-orange-50 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onDelete(slot.id)}
              title="Remove slot"
              className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
