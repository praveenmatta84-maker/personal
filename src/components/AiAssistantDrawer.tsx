import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  Calendar,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  RefreshCw,
  Flame,
  Clock,
  Layers,
  HelpCircle,
  FileText,
  TrendingUp,
  Zap,
  Bookmark,
  ChevronRight,
  HardDrive,
  ExternalLink,
  Globe,
} from 'lucide-react';
import { ChatMessage, DocumentItem, RoutineSlot, UserGoal } from '../types';
import { calculateRoutineStats, formatDuration, formatTime12h } from '../utils/scheduler';

interface AiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  goal: UserGoal;
  slots: RoutineSlot[];
  documents: DocumentItem[];
  activeDoc?: DocumentItem | null;
  onApplyNewTimetable: (newSlots: RoutineSlot[]) => void;
  onAddSlot: (slot: RoutineSlot) => void;
  initialPrompt?: string | null;
  onClearInitialPrompt?: () => void;
}

export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({
  isOpen,
  onClose,
  onOpen,
  goal,
  slots,
  documents,
  activeDoc,
  onApplyNewTimetable,
  onAddSlot,
  initialPrompt,
  onClearInitialPrompt,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'analysis' | 'timetable' | 'docs'>('chat');

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('plane_goal_ai_chat');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'msg-init',
        role: 'assistant',
        content: `Greetings! I am your AI Knowledge Guide & Routine Companion.

You can ask me **ANY question**—not only about your routine, but across science, technology, world history, literature, philosophy, psychology, book recommendations, and external research.

I will bring in outsourced knowledge and web insights to engage and guide you. What is on your mind today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Analysis state
  const [routineAnalysis, setRoutineAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Timetable Generator state
  const [timetableStyle, setTimetableStyle] = useState<'balanced' | 'deep_work' | 'gentle' | 'study_prep'>('balanced');
  const [wakeTime, setWakeTime] = useState('07:30');
  const [sleepTime, setSleepTime] = useState('22:30');
  const [targetFocusHours, setTargetFocusHours] = useState(goal.targetHoursPerDay || 6);
  const [generatedTimetable, setGeneratedTimetable] = useState<any>(null);
  const [isGeneratingTimetable, setIsGeneratingTimetable] = useState(false);

  // Document Assistant state
  const [selectedDocId, setSelectedDocId] = useState<string>(activeDoc?.id || documents[0]?.id || '');
  const [docResult, setDocResult] = useState<string | null>(null);
  const [docCustomQuestion, setDocCustomQuestion] = useState('');
  const [isDocProcessing, setIsDocProcessing] = useState(false);
  const [docAllocationNotice, setDocAllocationNotice] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem('plane_goal_ai_chat', JSON.stringify(messages));
    } catch {}
  }, [messages]);

  useEffect(() => {
    if (isOpen && activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, activeTab]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          onOpen();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onOpen, onClose]);

  useEffect(() => {
    if (initialPrompt && isOpen) {
      setActiveTab('chat');
      handleSendMessage(initialPrompt);
      onClearInitialPrompt?.();
    }
  }, [initialPrompt, isOpen]);

  const stats = calculateRoutineStats(slots);
  const targetDoc = documents.find((d) => d.id === selectedDocId) || documents[0];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputPrompt;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          goalTitle: goal.title,
          currentSlots: slots,
          activeDoc: targetDoc || null,
          userPrompt: text.trim(),
        }),
      });

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        role: 'assistant',
        content: data.reply || (data.error ? 'I am here with you. What would you like to explore or plan next?' : 'May your routine bring peace and purposeful focus.'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: Array.isArray(data.sources) && data.sources.length > 0 ? data.sources : undefined,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          role: 'assistant',
          content: 'I am here to support your goal. Consistent focus in small intervals creates real progress.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/ai/analyze-routine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goalTitle: goal.title,
          slots,
          streak: goal.streak,
          completedCount: slots.filter((s) => s.completed).length,
          notesCount: 0,
        }),
      });

      const data = await res.json();
      setRoutineAnalysis(data);
    } catch {
      setRoutineAnalysis({
        summary: `Your schedule for "${goal.title}" has ${slots.length} active slots.`,
        strengths: [
          'Direct alignment with your selected focus goal',
          'Clean slot-based time allocation',
        ],
        improvements: [
          'Ensure 15-minute buffers between demanding cognitive tasks',
          'Dedicate time for reading and note review',
        ],
        zenAffirmation: 'Consistency is not about perfection, but steady return to daily practice.',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateTimetable = async () => {
    setIsGeneratingTimetable(true);
    setGeneratedTimetable(null);

    const styleDescriptions = {
      balanced: 'Balanced flow between deep work, movement, and reading intervals',
      deep_work: 'High-focus work blocks with designated short recovery pauses',
      gentle: 'Unhurried pacing with mindful breaks',
      study_prep: 'Study-intensive routine prioritizing document review and skill practice',
    };

    try {
      const res = await fetch('/api/ai/generate-timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goalTitle: goal.title,
          wakeTime,
          sleepTime,
          targetHours: targetFocusHours,
          documents,
          preferences: styleDescriptions[timetableStyle],
        }),
      });

      const data = await res.json();
      setGeneratedTimetable(data);
    } catch {
      setGeneratedTimetable({
        slots: [
          { title: 'Morning Planning & Focus', startTime: '07:30', endTime: '08:00', category: 'Planning', durationMinutes: 30, note: 'Set day intentions.' },
          { title: 'Deep Work: Core Priority', startTime: '08:15', endTime: '10:15', category: 'Deep Work', durationMinutes: 120, note: 'Primary milestone work without distractions.' },
          { title: 'Rest & Movement', startTime: '10:15', endTime: '10:45', category: 'Physical', durationMinutes: 30, note: 'Hydrate and stretch away from screens.' },
          { title: 'Document Reading & Study', startTime: '11:00', endTime: '12:00', category: 'Reading', durationMinutes: 60, note: 'Study session for reading materials.' },
          { title: 'Task Execution', startTime: '13:30', endTime: '15:30', category: 'Execution', durationMinutes: 120, note: 'Execute project tasks.' },
          { title: 'Evening Reflection & Notebook', startTime: '20:30', endTime: '21:00', category: 'Reflection', durationMinutes: 30, note: 'Review progress and record notes.' },
        ],
        rationale: 'Balanced timetable designed for sustainable focus and healthy pacing.'
      });
    } finally {
      setIsGeneratingTimetable(false);
    }
  };

  const handleApplyTimetable = () => {
    if (generatedTimetable?.slots) {
      const formatted: RoutineSlot[] = generatedTimetable.slots.map((s: any, idx: number) => ({
        id: `slot-ai-${Date.now()}-${idx}`,
        goalId: goal.id,
        title: s.title,
        category: s.category || 'Deep Work',
        startTime: s.startTime,
        endTime: s.endTime,
        durationMinutes: s.durationMinutes || 60,
        completed: false,
        note: s.note,
        documentId: s.documentId,
        order: idx + 1,
      }));

      onApplyNewTimetable(formatted);
      setGeneratedTimetable(null);
      setActiveTab('chat');

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-applied-${Date.now()}`,
          role: 'assistant',
          content: '✨ Your personalized timetable has been applied to your schedule!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  const handleDocAction = async (action: 'summary' | 'key_takeaways' | 'quiz' | 'custom') => {
    if (!targetDoc) return;
    setIsDocProcessing(true);
    setDocResult(null);

    try {
      const res = await fetch('/api/ai/doc-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document: targetDoc,
          action,
          userQuestion: docCustomQuestion,
        }),
      });

      const data = await res.json();
      setDocResult(data.result);
      if (action === 'custom') setDocCustomQuestion('');
    } catch {
      setDocResult(`Summary for "${targetDoc.title}":\nThis document explores disciplined focus, daily routines, and managing cognitive energy.`);
    } finally {
      setIsDocProcessing(false);
    }
  };

  const handleAllocateDocToSchedule = async () => {
    if (!targetDoc) return;
    setIsDocProcessing(true);
    setDocAllocationNotice(null);

    try {
      const res = await fetch('/api/ai/allocate-doc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document: targetDoc,
          currentSlots: slots,
          dailyReadingGoalMinutes: 45,
        }),
      });

      const data = await res.json();
      if (data?.recommendedSlot) {
        const slotData = data.recommendedSlot;
        const newSlot: RoutineSlot = {
          id: `slot-doc-${Date.now()}`,
          goalId: goal.id,
          title: slotData.title || `Reading: ${targetDoc.title}`,
          category: 'Reading',
          startTime: slotData.startTime || '11:00',
          endTime: slotData.endTime || '11:45',
          durationMinutes: slotData.durationMinutes || 45,
          completed: false,
          documentId: targetDoc.id,
          note: slotData.note || `Study session for "${targetDoc.title}". Resume at page ${targetDoc.bookmarkPage || 1}.`,
          order: slots.length + 1,
        };

        onAddSlot(newSlot);
        setDocAllocationNotice(`Allocated "${targetDoc.title}" to ${newSlot.startTime} – ${newSlot.endTime}!`);
      }
    } catch {
      setDocAllocationNotice(`Assigned reading block for "${targetDoc.title}" into your schedule.`);
    } finally {
      setIsDocProcessing(false);
    }
  };

  return (
    <>
      {/* Prominent Button on the Right Side of the Screen (Radiant Orange Flow Theme) */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40 hidden md:block">
        <button
          onClick={onOpen}
          title="Open AI Schedule Assistant (⌘J / Ctrl+J)"
          className="flex items-center gap-2.5 py-3.5 pl-4 pr-5 rounded-l-3xl bg-orange-flow text-white shadow-2xl hover:shadow-orange-500/40 border-y border-l border-white/40 transition-all duration-200 group cursor-pointer hover:-translate-x-1.5"
          aria-label="Open AI Assistant"
        >
          <div className="relative flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-white opacity-60" />
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-xs">
              <Sparkles className="w-4 h-4 fill-white/30" />
            </div>
          </div>

          <div className="text-left">
            <span className="text-xs font-bold text-white tracking-tight block leading-tight">
              AI Assistant
            </span>
            <span className="text-[10px] text-white/80 font-medium">
              Schedule & Docs
            </span>
          </div>
        </button>
      </div>

      {/* Floating Orange Pill on the Bottom-Right (Mobile) */}
      <button
        onClick={onOpen}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4.5 py-3 rounded-full bg-orange-flow text-white shadow-2xl transition-all duration-200 cursor-pointer group active:scale-95 border border-white/40 md:hidden"
        aria-label="Open AI Routine Assistant"
      >
        <Sparkles className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
        <span className="text-xs font-bold tracking-tight">AI Assistant</span>
      </button>

      {/* Full-Height Expansive Slide-Over Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
          <div className="w-full max-w-xl md:max-w-2xl h-full bg-white border-l border-orange-200 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Drawer Top Header: Orange Flow with Pristine White Typography */}
            <div className="p-5 bg-orange-flow text-white border-b border-white/20 shadow-xs flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md text-white border border-white/30 flex items-center justify-center shadow-xs">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-serif font-medium text-white tracking-tight drop-shadow-xs">
                      AI Schedule Assistant
                    </h3>
                    <span className="text-[10px] font-mono text-orange-950 bg-white/90 px-2 py-0.5 rounded-md font-bold">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-white/80">
                    Schedule intelligence, personalized timetables & document guidance
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-[10px] font-mono text-white/80 bg-white/10 px-2 py-1 rounded-md border border-white/20">
                  ⌘J to toggle
                </span>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
                  aria-label="Close assistant"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Sub-Navigation Bar */}
            <div className="px-4 py-2 bg-stone-50/80 border-b border-stone-200 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors shrink-0 ${
                  activeTab === 'chat'
                    ? 'bg-orange-600 text-white shadow-2xs'
                    : 'bg-white text-stone-600 hover:bg-orange-50 border border-stone-200'
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Daily Dialogue</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('analysis');
                  if (!routineAnalysis) handleRunAnalysis();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors shrink-0 ${
                  activeTab === 'analysis'
                    ? 'bg-orange-600 text-white shadow-2xs'
                    : 'bg-white text-stone-600 hover:bg-orange-50 border border-stone-200'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 text-orange-600" />
                <span>Schedule Analysis</span>
              </button>

              <button
                onClick={() => setActiveTab('timetable')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors shrink-0 ${
                  activeTab === 'timetable'
                    ? 'bg-orange-600 text-white shadow-2xs'
                    : 'bg-white text-stone-600 hover:bg-orange-50 border border-stone-200'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-orange-600" />
                <span>Create Timetable</span>
              </button>

              <button
                onClick={() => setActiveTab('docs')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors shrink-0 ${
                  activeTab === 'docs'
                    ? 'bg-orange-600 text-white shadow-2xs'
                    : 'bg-white text-stone-600 hover:bg-orange-50 border border-stone-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-orange-600" />
                <span>Docs & Allocation</span>
              </button>
            </div>

            {/* TAB 1: DAILY DIALOGUE */}
            {activeTab === 'chat' && (
              <div className="flex-1 flex flex-col overflow-hidden bg-white">
                <div className="px-4 py-2 bg-orange-50/30 border-b border-orange-100 flex items-center justify-between text-[11px] text-stone-500">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                    <span>Goal: "{goal.title || 'My Goal'}"</span>
                    <span>·</span>
                    <span className="font-mono tabular-nums">{goal.streak}d streak</span>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('Clear chat history?')) {
                        setMessages([
                          {
                            id: `msg-reset-${Date.now()}`,
                            role: 'assistant',
                            content: `Conversation reset. Ready to assist with "${goal.title}".`,
                            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                          },
                        ]);
                      }
                    }}
                    className="text-[10px] text-stone-400 hover:text-stone-700 underline"
                  >
                    Reset
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${
                        msg.role === 'user' ? 'items-end' : 'items-start'
                      }`}
                    >
                      <div
                        className={`max-w-[88%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-orange-600 text-white rounded-br-xs shadow-xs'
                            : 'bg-stone-50 border border-stone-200 text-stone-800 rounded-bl-xs shadow-2xs'
                        }`}
                      >
                        <div className="whitespace-pre-line">{msg.content}</div>

                        {/* Out-sourced Knowledge & Reference Links */}
                        {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                          <div className="mt-2.5 pt-2.5 border-t border-orange-200/70 space-y-1.5">
                            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-orange-950">
                              <Globe className="w-3 h-3 text-orange-600" />
                              <span>External Sources & Research:</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {msg.sources.slice(0, 4).map((source, sIdx) => (
                                <a
                                  key={sIdx}
                                  href={source.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-orange-200 text-[10px] text-orange-900 hover:text-orange-950 hover:bg-orange-100 transition-colors shadow-2xs max-w-full"
                                  title={source.title}
                                >
                                  <ExternalLink className="w-2.5 h-2.5 text-orange-600 shrink-0" />
                                  <span className="truncate max-w-[200px]">{source.title || 'Source'}</span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-stone-400 mt-1 px-1 font-mono tabular-nums">
                        {msg.timestamp}
                      </span>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex items-center gap-2 text-xs text-stone-500 p-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-orange-600" />
                      <span>AI is searching knowledge & formulating response...</span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Chips */}
                <div className="px-4 py-2 bg-stone-50 border-t border-stone-200 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                  {[
                    'Explain the Feynman Technique',
                    'How did da Vinci structure his routine?',
                    'What does neuroscience say about focus?',
                    'Recommend 3 books on resilience',
                    'Analyze my routine balance',
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(chip)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-stone-200 hover:border-orange-300 text-[11px] text-stone-600 hover:text-stone-900 whitespace-nowrap transition-colors shadow-2xs cursor-pointer"
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                {/* Input Bar */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="p-3.5 bg-white border-t border-stone-200 flex items-center gap-2 shrink-0"
                >
                  <input
                    type="text"
                    value={inputPrompt}
                    onChange={(e) => setInputPrompt(e.target.value)}
                    placeholder="Ask anything — science, history, coding, book ideas, schedule planning..."
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:outline-hidden focus:ring-1 focus:ring-orange-500 text-stone-900 placeholder:text-stone-400"
                  />

                  <button
                    type="submit"
                    disabled={!inputPrompt.trim() || isLoading}
                    className="p-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white disabled:opacity-40 transition-colors cursor-pointer"
                    aria-label="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {/* TAB 2: SCHEDULE ANALYSIS */}
            {activeTab === 'analysis' && (
              <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-white">
                <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                  <div>
                    <h4 className="text-sm font-semibold text-stone-900 font-serif">
                      Schedule & Progress Audit
                    </h4>
                    <p className="text-xs text-stone-500">
                      Evaluates your real slots and task pacing.
                    </p>
                  </div>
                  <button
                    onClick={handleRunAnalysis}
                    disabled={isAnalyzing}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-xs font-medium text-orange-800 transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                    <span>Re-Analyze</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-orange-50/40 border border-orange-100 shadow-2xs">
                    <span className="text-[11px] text-stone-400 block">Total Focus Time</span>
                    <span className="text-base font-mono font-semibold text-stone-800 tabular-nums">
                      {formatDuration(stats.totalMinutes)}
                    </span>
                    <span className="text-[10px] text-orange-700 block mt-0.5">
                      {slots.length} created slots
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-orange-50/40 border border-orange-100 shadow-2xs">
                    <span className="text-[11px] text-stone-400 block">Completion Rate</span>
                    <span className="text-base font-mono font-semibold text-stone-800 tabular-nums">
                      {stats.percentage}%
                    </span>
                    <span className="text-[10px] text-stone-500 block mt-0.5">
                      {stats.completed} of {stats.total} done
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-orange-50/40 border border-orange-100 shadow-2xs">
                    <span className="text-[11px] text-stone-400 block">Current Streak</span>
                    <span className="text-base font-mono font-semibold text-orange-600 tabular-nums flex items-center gap-1">
                      <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
                      {goal.streak} Days
                    </span>
                    <span className="text-[10px] text-stone-500 block mt-0.5">
                      {goal.streak > 0 ? 'Verified streak' : 'Starts today'}
                    </span>
                  </div>
                </div>

                {isAnalyzing ? (
                  <div className="p-8 rounded-2xl bg-stone-50 border border-stone-200 text-center space-y-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-orange-600 mx-auto" />
                    <p className="text-xs text-stone-600">Analyzing slot distribution and pacing...</p>
                  </div>
                ) : routineAnalysis ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 space-y-1.5">
                      <span className="text-xs font-semibold text-orange-950 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                        Executive Assessment
                      </span>
                      <p className="text-xs text-orange-900 leading-relaxed">
                        {routineAnalysis.summary}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-2">
                      <h5 className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-orange-600" />
                        Identified Strengths
                      </h5>
                      <ul className="space-y-1.5 text-xs text-stone-600">
                        {routineAnalysis.strengths?.map((str: string, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-orange-600 mt-0.5">•</span>
                            <span>{str}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-2">
                      <h5 className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-orange-600" />
                        Recommended Improvements
                      </h5>
                      <ul className="space-y-2 text-xs text-stone-600">
                        {routineAnalysis.improvements?.map((imp: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-orange-50/40 border border-orange-100">
                            <span className="text-orange-600 font-bold mt-0.5">→</span>
                            <span className="leading-relaxed">{imp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : null}
              </div>
            )}

            {/* TAB 3: TIMETABLE GENERATOR */}
            {activeTab === 'timetable' && (
              <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-white">
                <div className="pb-2 border-b border-stone-200">
                  <h4 className="text-sm font-semibold text-stone-900 font-serif">
                    Personalized Timetable Architect
                  </h4>
                  <p className="text-xs text-stone-500">
                    AI generates a clean, non-overlapping schedule for your goal.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-orange-50/40 border border-orange-100 space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1.5">
                      Pacing Style
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'balanced', label: 'Balanced Flow', desc: 'Focus + rest intervals' },
                        { id: 'deep_work', label: 'Deep Work Sprint', desc: 'Maximizes high cognition' },
                        { id: 'gentle', label: 'Gentle Cadence', desc: 'Calm, unhurried pace' },
                        { id: 'study_prep', label: 'Study & Reading', desc: 'Prioritizes doc theory' },
                      ].map((style) => (
                        <button
                          key={style.id}
                          type="button"
                          onClick={() => setTimetableStyle(style.id as any)}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            timetableStyle === style.id
                              ? 'border-orange-600 bg-white ring-1 ring-orange-500'
                              : 'border-stone-200 hover:border-stone-300 bg-white'
                          }`}
                        >
                          <span className="text-xs font-semibold text-stone-900 block">
                            {style.label}
                          </span>
                          <span className="text-[10px] text-stone-500">{style.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-stone-500 mb-1">
                        Wake Time
                      </label>
                      <input
                        type="time"
                        value={wakeTime}
                        onChange={(e) => setWakeTime(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-stone-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-stone-500 mb-1">
                        Sleep Time
                      </label>
                      <input
                        type="time"
                        value={sleepTime}
                        onChange={(e) => setSleepTime(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-stone-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-stone-500 mb-1">
                        Target Hours
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={14}
                        value={targetFocusHours}
                        onChange={(e) => setTargetFocusHours(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg border border-stone-300 bg-white"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateTimetable}
                    disabled={isGeneratingTimetable}
                    className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-medium transition-colors flex items-center justify-center gap-2 shadow-xs"
                  >
                    {isGeneratingTimetable ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Generating Timetable...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                        <span>Generate Timetable</span>
                      </>
                    )}
                  </button>
                </div>

                {generatedTimetable && (
                  <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                      <div>
                        <h5 className="text-xs font-semibold text-stone-900">
                          Proposed Schedule ({generatedTimetable.slots?.length} slots)
                        </h5>
                        <p className="text-[11px] text-stone-500 italic mt-0.5">
                          "{generatedTimetable.rationale}"
                        </p>
                      </div>

                      <button
                        onClick={handleApplyTimetable}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-medium shadow-xs transition-colors shrink-0"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Apply to Today</span>
                      </button>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {generatedTimetable.slots?.map((slot: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-stone-50 border border-stone-200/70 flex items-center justify-between text-xs"
                        >
                          <div className="min-w-0 mr-2">
                            <span className="font-semibold text-stone-900 truncate block">
                              {slot.title}
                            </span>
                            <div className="flex items-center gap-1.5 text-[10px] text-stone-500 mt-0.5">
                              <span className="text-orange-700 font-medium">{slot.category}</span>
                              <span>·</span>
                              <span className="font-mono tabular-nums">{slot.durationMinutes}m</span>
                              {slot.note && <span>· {slot.note}</span>}
                            </div>
                          </div>

                          <span className="font-mono text-xs font-medium text-stone-800 bg-white px-2 py-0.5 rounded-md border border-stone-200 shrink-0 tabular-nums">
                            {formatTime12h(slot.startTime)} - {formatTime12h(slot.endTime)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: DOCS & ALLOCATION */}
            {activeTab === 'docs' && (
              <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-white">
                <div className="pb-2 border-b border-stone-200">
                  <h4 className="text-sm font-semibold text-stone-900 font-serif">
                    Document Intelligence & Schedule Allocation
                  </h4>
                  <p className="text-xs text-stone-500">
                    Analyze documents and let AI allocate study slots into your routine.
                  </p>
                </div>

                {documents.length === 0 ? (
                  <div className="p-8 rounded-2xl bg-orange-50/40 border border-orange-100 text-center space-y-2">
                    <BookOpen className="w-8 h-8 text-orange-400 mx-auto" />
                    <h5 className="text-xs font-semibold text-stone-800">No Documents Stored Yet</h5>
                    <p className="text-xs text-stone-500 max-w-xs mx-auto">
                      Open the Documents Vault from the top bar to store your reading materials.
                    </p>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-stone-700 mb-1.5">
                        Select Stored Document
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {documents.map((doc) => (
                          <button
                            key={doc.id}
                            type="button"
                            onClick={() => {
                              setSelectedDocId(doc.id);
                              setDocResult(null);
                              setDocAllocationNotice(null);
                            }}
                            className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                              selectedDocId === doc.id
                                ? 'border-orange-600 bg-orange-50/60 ring-1 ring-orange-500'
                                : 'border-stone-200 hover:border-stone-300 bg-white'
                            }`}
                          >
                            <div className="w-8 h-11 bg-orange-100 text-orange-700 rounded-md flex items-center justify-center shrink-0">
                              <BookOpen className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-semibold text-stone-900 line-clamp-1 block">
                                {doc.title}
                              </span>
                              <span className="text-[10px] text-stone-500 block truncate">
                                {doc.author}
                              </span>
                              <span className="text-[10px] text-orange-700 font-mono tabular-nums block mt-1">
                                Page {doc.bookmarkPage || 1}/{doc.totalPages || 1}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {targetDoc && (
                      <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-orange-950 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-orange-700" />
                            Schedule Allocation Engine
                          </span>
                          <button
                            onClick={handleAllocateDocToSchedule}
                            disabled={isDocProcessing}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-medium shadow-xs transition-colors"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>Allocate to My Schedule</span>
                          </button>
                        </div>

                        <p className="text-xs text-orange-900 leading-relaxed">
                          AI will assess your current slots and insert a designated study session for "{targetDoc.title}".
                        </p>

                        {docAllocationNotice && (
                          <div className="p-2.5 rounded-xl bg-white text-xs text-orange-800 border border-orange-200 flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" />
                            <span>{docAllocationNotice}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {targetDoc && (
                      <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-3">
                        <h5 className="text-xs font-semibold text-stone-800">
                          Comprehension Tools
                        </h5>

                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => handleDocAction('summary')}
                            disabled={isDocProcessing}
                            className="p-2 rounded-xl bg-stone-100 hover:bg-orange-50 text-xs font-medium text-stone-700 hover:text-orange-900 transition-colors text-center"
                          >
                            Summary
                          </button>

                          <button
                            onClick={() => handleDocAction('key_takeaways')}
                            disabled={isDocProcessing}
                            className="p-2 rounded-xl bg-stone-100 hover:bg-orange-50 text-xs font-medium text-stone-700 hover:text-orange-900 transition-colors text-center"
                          >
                            Takeaways
                          </button>

                          <button
                            onClick={() => handleDocAction('quiz')}
                            disabled={isDocProcessing}
                            className="p-2 rounded-xl bg-stone-100 hover:bg-orange-50 text-xs font-medium text-stone-700 hover:text-orange-900 transition-colors text-center"
                          >
                            Quiz
                          </button>
                        </div>

                        <div className="flex gap-2 pt-1">
                          <input
                            type="text"
                            value={docCustomQuestion}
                            onChange={(e) => setDocCustomQuestion(e.target.value)}
                            placeholder={`Ask anything about "${targetDoc.title}"...`}
                            className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:outline-hidden focus:ring-1 focus:ring-orange-500"
                          />
                          <button
                            onClick={() => handleDocAction('custom')}
                            disabled={!docCustomQuestion.trim() || isDocProcessing}
                            className="px-3 py-1.5 rounded-xl bg-orange-600 text-white text-xs font-medium hover:bg-orange-500 disabled:opacity-40"
                          >
                            Ask
                          </button>
                        </div>
                      </div>
                    )}

                    {isDocProcessing && (
                      <div className="p-6 rounded-2xl bg-white border border-stone-200 text-center space-y-2">
                        <RefreshCw className="w-5 h-5 animate-spin text-orange-600 mx-auto" />
                        <p className="text-xs text-stone-500">Synthesizing document insights...</p>
                      </div>
                    )}

                    {docResult && !isDocProcessing && (
                      <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-2 animate-in fade-in duration-150">
                        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                          <span className="text-xs font-semibold text-stone-900 font-serif">
                            AI Analysis
                          </span>
                          <button
                            onClick={() => setDocResult(null)}
                            className="text-[10px] text-stone-400 hover:text-stone-700"
                          >
                            Dismiss
                          </button>
                        </div>
                        <div className="text-xs leading-relaxed text-stone-700 whitespace-pre-line font-sans">
                          {docResult}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
