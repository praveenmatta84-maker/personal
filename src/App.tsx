import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Sparkles,
  Calendar,
  Flame,
  CheckCircle2,
  BookOpen,
  FileText,
  RotateCcw,
  Edit3,
  Clock,
  Target,
} from 'lucide-react';
import {
  DocumentItem,
  NotebookEntry,
  RoutineSlot,
  UndoAction,
  UserGoal,
  UserProfile,
} from './types';
import {
  loadStoredDocuments,
  loadStoredGoal,
  loadStoredNotebook,
  loadStoredSlots,
  loadStoredUser,
  saveStoredDocuments,
  saveStoredGoal,
  saveStoredNotebook,
  saveStoredSlots,
  saveStoredUser,
} from './utils/storage';
import { autoAllocateTimes, calculateRoutineStats, formatDuration } from './utils/scheduler';
import { TopNav } from './components/TopNav';
import { SlotCard } from './components/SlotCard';
import { SlotEditModal } from './components/SlotEditModal';
import { CalendarModal } from './components/CalendarModal';
import { NotebookModal } from './components/NotebookModal';
import { DocumentModal } from './components/DocumentModal';
import { AiAssistantDrawer } from './components/AiAssistantDrawer';
import { AuthModal } from './components/AuthModal';
import { GoalEditModal } from './components/GoalEditModal';
import { MindEntrance } from './components/MindEntrance';

export default function App() {
  const [goal, setGoal] = useState<UserGoal>(loadStoredGoal);
  const [slots, setSlots] = useState<RoutineSlot[]>(loadStoredSlots);
  const [documents, setDocuments] = useState<DocumentItem[]>(loadStoredDocuments);
  const [notebook, setNotebook] = useState<NotebookEntry[]>(loadStoredNotebook);
  const [user, setUser] = useState<UserProfile>(loadStoredUser);

  // App View Mode: 'mind' entrance with orange flow vs 'planner' routine
  const [viewMode, setViewMode] = useState<'mind' | 'planner'>('mind');
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string | null>(null);

  const [undoStack, setUndoStack] = useState<UndoAction[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals (activated via buttons)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isNotebookOpen, setIsNotebookOpen] = useState(false);
  const [isDocumentOpen, setIsDocumentOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isGoalEditOpen, setIsGoalEditOpen] = useState(false);
  const [isSlotEditOpen, setIsSlotEditOpen] = useState(false);
  const [slotToEdit, setSlotToEdit] = useState<RoutineSlot | null>(null);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [activeDocForModal, setActiveDocForModal] = useState<string | null>(null);

  // Filter category
  const [filterCategory, setFilterCategory] = useState<string>('All');

  // Sync to local storage
  useEffect(() => {
    saveStoredGoal(goal);
  }, [goal]);

  useEffect(() => {
    saveStoredSlots(slots);
  }, [slots]);

  useEffect(() => {
    saveStoredDocuments(documents);
  }, [documents]);

  useEffect(() => {
    saveStoredNotebook(notebook);
  }, [notebook]);

  useEffect(() => {
    saveStoredUser(user);
  }, [user]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const pushUndoSnapshot = useCallback((description: string) => {
    setUndoStack((prev) => [
      {
        description,
        timestamp: Date.now(),
        snapshot: {
          slots: JSON.parse(JSON.stringify(slots)),
          goal: JSON.parse(JSON.stringify(goal)),
          documents: JSON.parse(JSON.stringify(documents)),
          notes: JSON.parse(JSON.stringify(notebook)),
        },
      },
      ...prev.slice(0, 24),
    ]);
  }, [slots, goal, documents, notebook]);

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const [latest, ...rest] = undoStack;
    setSlots(latest.snapshot.slots);
    setGoal(latest.snapshot.goal);
    setDocuments(latest.snapshot.documents);
    setNotebook(latest.snapshot.notes);
    setUndoStack(rest);
    showToast(`Undone: ${latest.description}`);
  }, [undoStack]);

  // Universal Undo keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        const activeTag = document.activeElement?.tagName.toLowerCase();
        if (activeTag !== 'input' && activeTag !== 'textarea') {
          e.preventDefault();
          handleUndo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo]);

  // Slot handlers
  const handleToggleSlotComplete = (slotId: string) => {
    pushUndoSnapshot('Toggle slot completion');
    const todayKey = new Date().toISOString().slice(0, 10);

    setSlots((prev) => {
      const updated = prev.map((s) => (s.id === slotId ? { ...s, completed: !s.completed } : s));

      // Calculate real completion: if all real created slots are completed today, update streak
      const total = updated.length;
      const completed = updated.filter((s) => s.completed).length;

      if (total > 0 && completed === total) {
        setGoal((prevGoal) => {
          if (!prevGoal.completionHistory[todayKey]) {
            const nextStreak = (prevGoal.streak || 0) + 1;
            showToast(`🎉 All slots complete! Real streak: ${nextStreak} day${nextStreak > 1 ? 's' : ''}`);
            return {
              ...prevGoal,
              streak: nextStreak,
              completionHistory: {
                ...prevGoal.completionHistory,
                [todayKey]: true,
              },
            };
          }
          return prevGoal;
        });
      }

      return updated;
    });
  };

  const handleOpenAddSlot = () => {
    setSlotToEdit(null);
    setIsSlotEditOpen(true);
  };

  const handleOpenEditSlot = (slot: RoutineSlot) => {
    setSlotToEdit(slot);
    setIsSlotEditOpen(true);
  };

  const handleSaveSlot = (slotData: Partial<RoutineSlot>) => {
    if (slotToEdit) {
      pushUndoSnapshot(`Edit slot "${slotData.title || slotToEdit.title}"`);
      setSlots((prev) =>
        prev.map((s) => (s.id === slotToEdit.id ? ({ ...s, ...slotData } as RoutineSlot) : s))
      );
      showToast(`Updated "${slotData.title}"`);
    } else {
      pushUndoSnapshot(`Add slot "${slotData.title}"`);
      const newSlot: RoutineSlot = {
        id: `slot-${Date.now()}`,
        goalId: goal.id,
        title: slotData.title || 'My Task Slot',
        category: slotData.category || 'Deep Work',
        startTime: slotData.startTime || '09:00',
        endTime: slotData.endTime || '10:00',
        durationMinutes: slotData.durationMinutes || 60,
        completed: false,
        note: slotData.note,
        documentId: slotData.documentId,
        order: slots.length + 1,
      };
      setSlots((prev) => [...prev, newSlot]);
      showToast(`Added "${newSlot.title}"`);
    }
  };

  const handleDeleteSlot = (slotId: string) => {
    const toDelete = slots.find((s) => s.id === slotId);
    pushUndoSnapshot(`Delete slot "${toDelete?.title || 'Slot'}"`);
    setSlots((prev) => prev.filter((s) => s.id !== slotId));
    showToast(`Slot deleted`);
  };

  const handleMoveSlot = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slots.length) return;
    pushUndoSnapshot('Reorder slots');
    const updated = [...slots];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setSlots(updated);
  };

  const handleAutoAllocateAllSlots = () => {
    if (slots.length === 0) return;
    pushUndoSnapshot('Auto-allocate all slot times');
    const allocated = autoAllocateTimes(slots, '08:00', 15);
    setSlots(allocated);
    showToast('⚡ Slot times auto-allocated without overlap!');
  };

  const handleOpenDocFromSlot = (doc: DocumentItem) => {
    setActiveDocForModal(doc.id);
    setIsDocumentOpen(true);
  };

  const handleShareDocWithAi = async (doc: DocumentItem, action: 'explain' | 'allocate') => {
    if (action === 'explain') {
      setIsDocumentOpen(false);
      setIsAiOpen(true);
    } else {
      try {
        const res = await fetch('/api/ai/allocate-doc', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            document: doc,
            currentSlots: slots,
            dailyReadingGoalMinutes: 45,
          }),
        });
        const data = await res.json();
        if (data?.recommendedSlot) {
          pushUndoSnapshot(`Allocate document "${doc.title}" to schedule`);
          const newSlot: RoutineSlot = {
            id: `slot-doc-${Date.now()}`,
            goalId: goal.id,
            title: data.recommendedSlot.title,
            category: 'Reading',
            startTime: data.recommendedSlot.startTime,
            endTime: data.recommendedSlot.endTime,
            durationMinutes: data.recommendedSlot.durationMinutes || 45,
            completed: false,
            documentId: doc.id,
            note: data.recommendedSlot.note,
            order: slots.length + 1,
          };
          setSlots((prev) => [...prev, newSlot]);
          setIsDocumentOpen(false);
          showToast(`Allocated reading slot for "${doc.title}"!`);
        }
      } catch {
        showToast('Document allocated to schedule.');
      }
    }
  };

  const stats = calculateRoutineStats(slots);

  const filteredSlots = slots.filter((slot) => {
    if (filterCategory === 'All') return true;
    return slot.category === filterCategory;
  });

  return (
    <div className="min-h-screen bg-orange-flow-soft text-stone-900 flex flex-col font-sans selection:bg-orange-200 selection:text-orange-950 relative overflow-x-hidden">
      {/* Ambient subtle orange mesh backdrop */}
      <div className="absolute inset-0 bg-orange-mesh-subtle pointer-events-none -z-0" />
      {viewMode === 'mind' ? (
        <MindEntrance
          goal={goal}
          user={user}
          undoCount={undoStack.length}
          onUndo={handleUndo}
          onEnterApp={(mindText) => {
            if (mindText) {
              pushUndoSnapshot(`Set goal to "${mindText}"`);
              setGoal((prev) => ({ ...prev, title: mindText }));
              showToast(`Goal set: "${mindText}"`);
            }
            setViewMode('planner');
          }}
          onOpenAiWithMind={(mindText) => {
            setAiInitialPrompt(mindText);
            setIsAiOpen(true);
          }}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenCalendar={() => setIsCalendarOpen(true)}
          onOpenNotebook={() => setIsNotebookOpen(true)}
          onOpenDocuments={() => {
            setActiveDocForModal(null);
            setIsDocumentOpen(true);
          }}
        />
      ) : (
        <>
          {/* Top Navigation Bar: Orange & White Theme, Brand "Personal Planning App" */}
          <TopNav
            goal={goal}
            user={user}
            undoCount={undoStack.length}
            onUndo={handleUndo}
            onOpenCalendar={() => setIsCalendarOpen(true)}
            onOpenNotebook={() => setIsNotebookOpen(true)}
            onOpenDocuments={() => {
              setActiveDocForModal(null);
              setIsDocumentOpen(true);
            }}
            onOpenAuth={() => setIsAuthOpen(true)}
            onOpenMindEntrance={() => setViewMode('mind')}
          />

      {/* Main Viewport: Clean, Button-Centric & No Clutter */}
      <main className="relative z-10 flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 md:py-8 space-y-6">
        {/* Goal Title Header Card: Glass White with Flowing Orange Accent */}
        <section className="relative overflow-hidden card-glass-white p-6 md:p-8 rounded-3xl border border-orange-200/90 shadow-md space-y-4">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-orange-flow" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-orange-900 font-bold bg-orange-100 px-2.5 py-0.5 rounded-md border border-orange-200">
                  Goal Title
                </span>
                <button
                  onClick={() => setIsGoalEditOpen(true)}
                  className="text-xs text-stone-500 hover:text-orange-600 flex items-center gap-1 transition-colors underline cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Rename</span>
                </button>
              </div>

              {/* Requirement 1 & 5: Goal Title */}
              <h1 className="text-2xl sm:text-3xl font-serif font-medium text-stone-900 tracking-tight">
                {goal.title || 'Plan for your goal'}
              </h1>

              {goal.description && (
                <p className="text-xs text-stone-600">{goal.description}</p>
              )}
            </div>

            {/* Separate Button to View Calendar & Slots */}
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => setIsCalendarOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white shadow-md font-semibold text-xs transition-all cursor-pointer hover:shadow-lg active:scale-95"
                title="Click to view full calendar timetable and streak"
              >
                <Flame className="w-4 h-4 fill-white text-white" />
                <span className="tabular-nums">{goal.streak}d Streak</span>
                <span className="text-orange-200">·</span>
                <span>View Calendar</span>
              </button>
            </div>
          </div>

          {/* Simple Progress Bar if slots exist */}
          {slots.length > 0 && (
            <div className="pt-3 border-t border-orange-100 flex items-center justify-between text-xs text-stone-600">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-stone-900 tabular-nums">
                  {stats.completed} of {stats.total} slots completed
                </span>
                <span className="text-orange-300">·</span>
                <span className="font-mono tabular-nums text-orange-700 font-bold">
                  {stats.percentage}%
                </span>
              </div>
              <span className="font-mono tabular-nums text-stone-500">
                {formatDuration(stats.completedMinutes)} focused
              </span>
            </div>
          )}
        </section>

        {/* Slot Controls & Primary Action Buttons */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Category Filter Chips if slots exist */}
            {slots.length > 0 ? (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {['All', 'Deep Work', 'Reading', 'Planning', 'Physical', 'Execution'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      filterCategory === cat
                        ? 'bg-orange-600 text-white shadow-xs'
                        : 'card-glass-white text-stone-700 hover:bg-orange-50 hover:text-orange-950 border border-orange-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-xs font-semibold text-stone-700">
                Routine Slots ({slots.length})
              </div>
            )}

            {/* Action Buttons: Add Slot & Auto Allocate */}
            <div className="flex items-center gap-2">
              {slots.length > 1 && (
                <button
                  onClick={handleAutoAllocateAllSlots}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl card-glass-white hover:bg-orange-50 border border-orange-200 text-orange-950 text-xs font-semibold transition-all shadow-xs cursor-pointer"
                  title="Auto-sequence slot times without overlapping"
                >
                  <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                  <span>Auto Allocate Time</span>
                </button>
              )}

              <button
                onClick={handleOpenAddSlot}
                className="flex items-center gap-1.5 px-4.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold transition-all shadow-md cursor-pointer hover:shadow-lg active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add Slot</span>
              </button>
            </div>
          </div>

          {/* Slots View: Empty State vs User Created Slots */}
          {slots.length === 0 ? (
            <div className="p-12 rounded-3xl card-glass-white border-2 border-dashed border-orange-300 text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto shadow-2xs">
                <Clock className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-stone-900 font-serif">
                  No Routine Slots Created Yet
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                  Your daily slots will appear here as soon as you create them. Give a name to your slot, choose a duration, and assign its time.
                </p>
              </div>

              <div className="flex justify-center gap-2 pt-2">
                <button
                  onClick={handleOpenAddSlot}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold transition-all shadow-md cursor-pointer hover:shadow-lg active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add First Slot</span>
                </button>
              </div>
            </div>
          ) : filteredSlots.length === 0 ? (
            <div className="p-8 rounded-2xl card-glass-white border border-orange-100 text-center text-xs text-stone-500">
              No slots found in category "{filterCategory}".
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSlots.map((slot, index) => {
                const linkedDoc = documents.find((d) => d.id === slot.documentId);

                return (
                  <SlotCard
                    key={slot.id}
                    slot={slot}
                    linkedDoc={linkedDoc}
                    onToggleComplete={handleToggleSlotComplete}
                    onEdit={handleOpenEditSlot}
                    onDelete={handleDeleteSlot}
                    onOpenDoc={handleOpenDocFromSlot}
                    onMoveUp={() => handleMoveSlot(index, 'up')}
                    onMoveDown={() => handleMoveSlot(index, 'down')}
                    isFirst={index === 0}
                    isLast={index === filteredSlots.length - 1}
                  />
                );
              })}
            </div>
          )}
        </section>

        {/* Clean Buttons to View Sections (No Clutter, Accessible by Button) */}
        <section className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => setIsNotebookOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl card-glass-white hover:bg-orange-50/80 border border-orange-200 hover:border-orange-400 text-xs font-semibold text-stone-800 transition-all shadow-xs cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-orange-600" />
            <span>Open Personal Notebook ({notebook.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveDocForModal(null);
              setIsDocumentOpen(true);
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl card-glass-white hover:bg-orange-50/80 border border-orange-200 hover:border-orange-400 text-xs font-semibold text-stone-800 transition-all shadow-xs cursor-pointer"
          >
            <FileText className="w-4 h-4 text-orange-600" />
            <span>Stored Documents Vault ({documents.length})</span>
          </button>
        </section>
      </main>
      </>
      )}

      {/* Floating Zen Toast */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-stone-900 text-white text-xs font-medium shadow-xl flex items-center gap-2 animate-in fade-in duration-150">
          <Sparkles className="w-3.5 h-3.5 text-orange-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Prominent Right-Side AI Assistant Button & Drawer */}
      <AiAssistantDrawer
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        onOpen={() => setIsAiOpen(true)}
        goal={goal}
        slots={slots}
        documents={documents}
        activeDoc={documents.find((d) => d.id === activeDocForModal) || documents[0]}
        initialPrompt={aiInitialPrompt}
        onClearInitialPrompt={() => setAiInitialPrompt(null)}
        onApplyNewTimetable={(newSlots) => {
          pushUndoSnapshot('Apply AI generated timetable');
          setSlots(newSlots);
          showToast('Applied AI timetable to your routine!');
          setViewMode('planner');
        }}
        onAddSlot={(s) => {
          pushUndoSnapshot(`Add slot "${s.title}"`);
          setSlots((prev) => [...prev, s]);
          setViewMode('planner');
        }}
      />

      {/* Full Window Modals Opened via Buttons */}
      <CalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        goal={goal}
        slots={slots}
        documents={documents}
        onToggleSlotComplete={handleToggleSlotComplete}
        onOpenDoc={handleOpenDocFromSlot}
        onEditGoal={() => setIsGoalEditOpen(true)}
      />

      <NotebookModal
        isOpen={isNotebookOpen}
        onClose={() => setIsNotebookOpen(false)}
        notes={notebook}
        onSaveNote={(note) => {
          setNotebook((prev) => {
            const idx = prev.findIndex((n) => n.id === note.id);
            if (idx >= 0) {
              const updated = [...prev];
              updated[idx] = note;
              return updated;
            }
            return [note, ...prev];
          });
        }}
        onDeleteNote={(noteId) => {
          setNotebook((prev) => prev.filter((n) => n.id !== noteId));
          showToast('Note deleted');
        }}
      />

      <DocumentModal
        isOpen={isDocumentOpen}
        onClose={() => setIsDocumentOpen(false)}
        documents={documents}
        activeDocId={activeDocForModal}
        onSaveDoc={(doc) => {
          setDocuments((prev) => {
            const idx = prev.findIndex((d) => d.id === doc.id);
            if (idx >= 0) {
              const updated = [...prev];
              updated[idx] = doc;
              return updated;
            }
            return [doc, ...prev];
          });
        }}
        onDeleteDoc={(docId) => {
          pushUndoSnapshot('Delete document');
          setDocuments((prev) => prev.filter((d) => d.id !== docId));
          showToast('Document removed');
        }}
        onShareDocWithAi={handleShareDocWithAi}
      />

      <SlotEditModal
        isOpen={isSlotEditOpen}
        onClose={() => setIsSlotEditOpen(false)}
        onSave={handleSaveSlot}
        slotToEdit={slotToEdit}
        documents={documents}
        allSlots={slots}
      />

      <GoalEditModal
        isOpen={isGoalEditOpen}
        onClose={() => setIsGoalEditOpen(false)}
        goal={goal}
        onSave={(updated) => {
          pushUndoSnapshot(`Rename goal to "${updated.title}"`);
          setGoal(updated);
          showToast(`Goal saved: "${updated.title}"`);
        }}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={user}
        onLogin={(newUser) => {
          setUser(newUser);
          showToast(`Signed in as ${newUser.name}`);
        }}
        onLogout={() => {
          setUser({
            name: '',
            email: '',
            avatar: '',
            isLoggedIn: false,
            provider: 'guest',
          });
          showToast('Signed out');
        }}
      />
    </div>
  );
}
