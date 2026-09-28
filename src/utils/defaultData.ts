import { DocumentItem, NotebookEntry, RoutineSlot, UserGoal, UserProfile } from '../types';

export const INITIAL_USER: UserProfile = {
  name: 'Praveen',
  email: 'praveenprs00@gmail.com',
  avatar: '',
  isLoggedIn: true,
  provider: 'google',
};

// No fake streak, starts at 0
export const INITIAL_GOAL: UserGoal = {
  id: 'goal-1',
  title: 'My Goal Routine',
  description: 'Track daily routine slots, maintain focus, and build real streaks.',
  targetHoursPerDay: 6,
  streak: 0,
  completionHistory: {},
  createdAt: new Date().toISOString().slice(0, 10),
};

// No fake slots: slots only appear when created by the user
export const INITIAL_SLOTS: RoutineSlot[] = [];

// No fake documents: user stores documents in the app themselves
export const INITIAL_DOCUMENTS: DocumentItem[] = [];

// No fake notes: user writes notes themselves
export const INITIAL_NOTEBOOK_ENTRIES: NotebookEntry[] = [];

export const SLOT_PRESETS = [
  { title: 'Morning Focus & Planning', category: 'Planning' as const, durationMinutes: 30, note: 'Review today’s intentions and setup workspace.' },
  { title: 'Deep Work Session', category: 'Deep Work' as const, durationMinutes: 90, note: 'Uninterrupted block for primary priority tasks.' },
  { title: 'Theory & Document Study', category: 'Reading' as const, durationMinutes: 45, note: 'Focused reading and note taking from stored docs.' },
  { title: 'Rest & Movement Break', category: 'Physical' as const, durationMinutes: 30, note: 'Hydrate, stretch, and step away from screens.' },
  { title: 'Execution & Tasks', category: 'Execution' as const, durationMinutes: 60, note: 'Execute daily task checklist.' },
  { title: 'Evening Reflection & Notebook', category: 'Reflection' as const, durationMinutes: 20, note: 'Record daily progress in the notebook.' },
];
