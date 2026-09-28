export type SlotCategory =
  | 'Deep Work'
  | 'Reading'
  | 'Mindfulness'
  | 'Physical'
  | 'Reflection'
  | 'Execution'
  | 'Planning';

export interface RoutineSlot {
  id: string;
  goalId: string;
  title: string;
  category: SlotCategory;
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  durationMinutes: number;
  completed: boolean;
  note?: string;
  documentId?: string; // ID of linked document if reading slot
  order: number;
}

export interface DocumentItem {
  id: string;
  title: string;
  author: string;
  category: string;
  coverImage: string;
  totalPages: number;
  currentPage: number;
  bookmarkPage: number;
  content: string[]; // array of pages or chapters
  excerpt: string;
  personalNotes?: string;
  lastReadAt: string;
  allocatedSlotId?: string;
}

export interface NotebookEntry {
  id: string;
  title: string;
  content: string;
  category: 'Reflection' | 'Insight' | 'Gratitude' | 'Routine Idea';
  createdAt: string;
  updatedAt: string;
}

export interface UserGoal {
  id: string;
  title: string;
  description: string;
  targetHoursPerDay: number;
  streak: number;
  completionHistory: Record<string, boolean>; // 'YYYY-MM-DD' -> completed
  createdAt: string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  isLoggedIn: boolean;
  provider: 'google' | 'email' | 'guest';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedAction?: {
    type: 'apply_timetable' | 'view_doc' | 'rebalance';
    payload?: any;
  };
  sources?: { title: string; url: string }[];
}

export interface UndoAction {
  description: string;
  timestamp: number;
  snapshot: {
    slots: RoutineSlot[];
    goal: UserGoal;
    documents: DocumentItem[];
    notes: NotebookEntry[];
  };
}
