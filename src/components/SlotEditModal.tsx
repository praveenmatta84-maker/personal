import React, { useState, useEffect } from 'react';
import { X, Sparkles, Clock, BookOpen, Layers } from 'lucide-react';
import { DocumentItem, RoutineSlot, SlotCategory } from '../types';
import { SLOT_PRESETS } from '../utils/defaultData';
import { minutesToTime, timeToMinutes } from '../utils/scheduler';

interface SlotEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (slotData: Partial<RoutineSlot>) => void;
  slotToEdit?: RoutineSlot | null;
  documents: DocumentItem[];
  allSlots: RoutineSlot[];
}

export const SlotEditModal: React.FC<SlotEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  slotToEdit,
  documents,
  allSlots,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<SlotCategory>('Deep Work');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('09:30');
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [note, setNote] = useState('');
  const [documentId, setDocumentId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'custom' | 'preset'>('custom');

  useEffect(() => {
    if (slotToEdit) {
      setTitle(slotToEdit.title);
      setCategory(slotToEdit.category);
      setStartTime(slotToEdit.startTime);
      setEndTime(slotToEdit.endTime);
      setDurationMinutes(slotToEdit.durationMinutes);
      setNote(slotToEdit.note || '');
      setDocumentId(slotToEdit.documentId || '');
      setActiveTab('custom');
    } else {
      if (allSlots.length > 0) {
        const lastSlot = allSlots[allSlots.length - 1];
        const lastEndMin = timeToMinutes(lastSlot.endTime);
        const nextStartMin = lastEndMin + 15;
        const nextEndMin = nextStartMin + 60;
        setStartTime(minutesToTime(nextStartMin));
        setEndTime(minutesToTime(nextEndMin));
        setDurationMinutes(60);
      } else {
        setStartTime('08:00');
        setEndTime('09:30');
        setDurationMinutes(90);
      }
      setTitle('');
      setCategory('Deep Work');
      setNote('');
      setDocumentId('');
      setActiveTab('custom');
    }
  }, [slotToEdit, isOpen, allSlots]);

  const handleStartTimeChange = (newStart: string) => {
    setStartTime(newStart);
    const startM = timeToMinutes(newStart);
    const endM = timeToMinutes(endTime);
    if (endM > startM) {
      setDurationMinutes(endM - startM);
    } else {
      setEndTime(minutesToTime(startM + durationMinutes));
    }
  };

  const handleEndTimeChange = (newEnd: string) => {
    setEndTime(newEnd);
    const startM = timeToMinutes(startTime);
    const endM = timeToMinutes(newEnd);
    if (endM > startM) {
      setDurationMinutes(endM - startM);
    }
  };

  const handleDurationChange = (minutes: number) => {
    setDurationMinutes(minutes);
    const startM = timeToMinutes(startTime);
    setEndTime(minutesToTime(startM + minutes));
  };

  const handleAutoAllocateTime = () => {
    if (allSlots.length === 0) {
      setStartTime('08:00');
      setEndTime(minutesToTime(timeToMinutes('08:00') + durationMinutes));
      return;
    }
    const lastSlot = allSlots[allSlots.length - 1];
    const nextStartMin = timeToMinutes(lastSlot.endTime) + 15;
    const nextEndMin = nextStartMin + durationMinutes;
    setStartTime(minutesToTime(nextStartMin));
    setEndTime(minutesToTime(nextEndMin));
  };

  const handleSelectPreset = (preset: (typeof SLOT_PRESETS)[0]) => {
    setTitle(preset.title);
    setCategory(preset.category);
    setDurationMinutes(preset.durationMinutes);
    setNote(preset.note);
    const startM = timeToMinutes(startTime);
    setEndTime(minutesToTime(startM + preset.durationMinutes));
    setActiveTab('custom');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      category,
      startTime,
      endTime,
      durationMinutes,
      note: note.trim(),
      documentId: documentId || undefined,
    });
    onClose();
  };

  if (!isOpen) return null;

  const categories: SlotCategory[] = [
    'Deep Work',
    'Reading',
    'Mindfulness',
    'Physical',
    'Reflection',
    'Execution',
    'Planning',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-stone-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header: Orange Flow with Pristine White Typography */}
        <div className="flex items-center justify-between px-6 py-4.5 bg-orange-flow text-white border-b border-white/20 shadow-xs">
          <div>
            <h2 className="text-xl font-serif font-medium text-white tracking-tight drop-shadow-xs">
              {slotToEdit ? 'Edit Routine Slot' : 'Add Routine Slot'}
            </h2>
            <p className="text-xs text-white/80">
              Give your slot a name and assign its timing.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        {!slotToEdit && (
          <div className="flex border-b border-stone-100 px-6 pt-2 bg-white">
            <button
              onClick={() => setActiveTab('custom')}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                activeTab === 'custom'
                  ? 'border-orange-600 text-orange-700 font-semibold'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              Add Custom Slot
            </button>
            <button
              onClick={() => setActiveTab('preset')}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                activeTab === 'preset'
                  ? 'border-orange-600 text-orange-700 font-semibold'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              Select From Presets
            </button>
          </div>
        )}

        {activeTab === 'preset' && !slotToEdit ? (
          <div className="p-6 max-h-[420px] overflow-y-auto space-y-2.5 bg-white">
            <p className="text-xs text-stone-500 mb-2">
              Choose an archetype to prefill name and time:
            </p>
            {SLOT_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className="w-full text-left p-3.5 rounded-2xl border border-stone-200 hover:border-orange-300 hover:bg-orange-50/50 transition-all flex items-center justify-between group"
              >
                <div>
                  <h4 className="text-xs font-semibold text-stone-900 group-hover:text-orange-950">
                    {preset.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-stone-500">
                    <span className="text-orange-700 font-medium">{preset.category}</span>
                    <span>·</span>
                    <span className="font-mono tabular-nums">{preset.durationMinutes} mins</span>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1 line-clamp-1">{preset.note}</p>
                </div>
                <span className="text-xs font-medium text-orange-600 group-hover:translate-x-0.5 transition-transform">
                  Select
                </span>
              </button>
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto bg-white">
            {/* Slot Name */}
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Slot Title / Name *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Deep Work: Component Architecture, Theory Reading"
                className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1.5">
                Category
              </label>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      category === cat
                        ? 'bg-orange-600 text-white shadow-2xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Assignment: Manual & Auto Allocate Option */}
            <div className="p-3.5 bg-orange-50/40 rounded-2xl border border-orange-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-orange-600" />
                  Time Allocation
                </span>

                <button
                  type="button"
                  onClick={handleAutoAllocateTime}
                  className="flex items-center gap-1 text-[11px] font-medium text-orange-800 hover:text-orange-950 bg-white border border-orange-200 px-2 py-0.5 rounded-md transition-colors shadow-2xs"
                  title="Auto-calculate next free slot without overlapping"
                >
                  <Sparkles className="w-3 h-3 text-orange-500" />
                  Auto Allocate Time
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-stone-500 mb-1">
                    Start Time (Manual)
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => handleStartTimeChange(e.target.value)}
                    className="w-full px-2.5 py-1.5 font-mono text-xs rounded-lg border border-stone-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-stone-500 mb-1">
                    End Time (Manual)
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => handleEndTimeChange(e.target.value)}
                    className="w-full px-2.5 py-1.5 font-mono text-xs rounded-lg border border-stone-300 bg-white"
                  />
                </div>
              </div>

              {/* Quick duration presets */}
              <div>
                <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1.5">
                  <span>Duration: <strong className="font-mono text-stone-900">{durationMinutes} mins</strong></span>
                </div>
                <div className="flex gap-1.5">
                  {[20, 30, 45, 60, 90, 120].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => handleDurationChange(mins)}
                      className={`flex-1 py-1 rounded-md text-[11px] font-mono transition-colors ${
                        durationMinutes === mins
                          ? 'bg-orange-600 text-white font-medium'
                          : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Document Association */}
            {documents.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Link Stored Document (Optional)
                </label>
                <select
                  value={documentId}
                  onChange={(e) => setDocumentId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20"
                >
                  <option value="">No document linked</option>
                  {documents.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      📖 {doc.title} (Page {doc.bookmarkPage || 1}/{doc.totalPages || 1})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-stone-400 mt-1">
                  Linking a document will show its thumbnail in the slot, letting you resume reading with 1 click.
                </p>
              </div>
            )}

            {/* Slot Notes */}
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Slot Notes / Instructions (Optional)
              </label>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Specific focus or reminder for this slot..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-medium text-white bg-orange-600 hover:bg-orange-500 rounded-xl shadow-xs transition-colors"
              >
                {slotToEdit ? 'Save Changes' : 'Add to Routine'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
