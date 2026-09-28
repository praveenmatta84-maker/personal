import { DocumentItem, NotebookEntry, RoutineSlot, UserGoal, UserProfile } from '../types';
import { INITIAL_DOCUMENTS, INITIAL_GOAL, INITIAL_NOTEBOOK_ENTRIES, INITIAL_SLOTS, INITIAL_USER } from './defaultData';

const STORAGE_KEYS = {
  GOAL: 'plane_goal_data',
  SLOTS: 'plane_goal_slots',
  DOCUMENTS: 'plane_goal_documents',
  NOTEBOOK: 'plane_goal_notebook',
  USER: 'plane_goal_user',
};

export const loadStoredGoal = (): UserGoal => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GOAL);
    return raw ? JSON.parse(raw) : INITIAL_GOAL;
  } catch {
    return INITIAL_GOAL;
  }
};

export const saveStoredGoal = (goal: UserGoal) => {
  try {
    localStorage.setItem(STORAGE_KEYS.GOAL, JSON.stringify(goal));
  } catch (e) {
    console.error('Failed to save goal', e);
  }
};

export const loadStoredSlots = (): RoutineSlot[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SLOTS);
    return raw ? JSON.parse(raw) : INITIAL_SLOTS;
  } catch {
    return INITIAL_SLOTS;
  }
};

export const saveStoredSlots = (slots: RoutineSlot[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SLOTS, JSON.stringify(slots));
  } catch (e) {
    console.error('Failed to save slots', e);
  }
};

export const loadStoredDocuments = (): DocumentItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    return raw ? JSON.parse(raw) : INITIAL_DOCUMENTS;
  } catch {
    return INITIAL_DOCUMENTS;
  }
};

export const saveStoredDocuments = (docs: DocumentItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
  } catch (e) {
    console.error('Failed to save documents', e);
  }
};

export const loadStoredNotebook = (): NotebookEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTEBOOK);
    return raw ? JSON.parse(raw) : INITIAL_NOTEBOOK_ENTRIES;
  } catch {
    return INITIAL_NOTEBOOK_ENTRIES;
  }
};

export const saveStoredNotebook = (notes: NotebookEntry[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTEBOOK, JSON.stringify(notes));
  } catch (e) {
    console.error('Failed to save notebook', e);
  }
};

export const loadStoredUser = (): UserProfile => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    return raw ? JSON.parse(raw) : INITIAL_USER;
  } catch {
    return INITIAL_USER;
  }
};

export const saveStoredUser = (user: UserProfile) => {
  try {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  } catch (e) {
    console.error('Failed to save user', e);
  }
};
