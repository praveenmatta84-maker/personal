import React, { useState } from 'react';
import { X, Plus, Search, BookOpen, Trash2, Check } from 'lucide-react';
import { NotebookEntry } from '../types';

interface NotebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes: NotebookEntry[];
  onSaveNote: (note: NotebookEntry) => void;
  onDeleteNote: (noteId: string) => void;
}

export const NotebookModal: React.FC<NotebookModalProps> = ({
  isOpen,
  onClose,
  notes,
  onSaveNote,
  onDeleteNote,
}) => {
  const [selectedNoteId, setSelectedNoteId] = useState<string>(notes[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const activeNote = notes.find((n) => n.id === selectedNoteId) || notes[0];

  const [title, setTitle] = useState(activeNote?.title || '');
  const [content, setContent] = useState(activeNote?.content || '');
  const [category, setCategory] = useState(activeNote?.category || 'Reflection');

  const handleSelectNote = (note: NotebookEntry) => {
    setSelectedNoteId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setCategory(note.category);
  };

  const handleTextChange = (newTitle: string, newContent: string, newCat: any) => {
    setTitle(newTitle);
    setContent(newContent);
    setCategory(newCat);

    if (activeNote) {
      const updated: NotebookEntry = {
        ...activeNote,
        title: newTitle,
        content: newContent,
        category: newCat,
        updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      };
      onSaveNote(updated);
    }
  };

  const handleCreateNewNote = () => {
    const newNote: NotebookEntry = {
      id: `note-${Date.now()}`,
      title: 'New Note',
      content: '',
      category: 'Reflection',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    onSaveNote(newNote);
    handleSelectNote(newNote);
  };

  if (!isOpen) return null;

  const categories = ['All', 'Reflection', 'Insight', 'Gratitude', 'Routine Idea'];

  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || n.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-md flex items-center justify-center p-0 md:p-6 overflow-hidden">
      {/* Full Window Modal */}
      <div className="w-full h-full md:max-w-6xl md:h-[92vh] bg-white md:rounded-3xl border border-stone-200/90 shadow-2xl flex flex-col overflow-hidden animate-in fade-in duration-150">
        {/* Full Window Header: Orange Flow with Pristine White Typography */}
        <div className="flex items-center justify-between px-6 py-4.5 bg-orange-flow text-white border-b border-white/20 shadow-xs shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md text-white border border-white/30 flex items-center justify-center shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-medium text-white tracking-tight drop-shadow-xs">
                Personal Notebook
              </h1>
              <p className="text-xs text-white/80">
                Your private reflections and routine breakthroughs stored in app.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleCreateNewNote}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-orange-50 text-orange-950 text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-orange-600" />
              <span>New Entry</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
              aria-label="Close notebook"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Left List & Right Editor */}
        <div className="flex-1 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-stone-200 overflow-hidden">
          {/* Notes Sidebar List */}
          <div className="w-full md:w-80 lg:w-96 bg-stone-50/50 p-4 flex flex-col space-y-3 overflow-hidden shrink-0">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white border border-stone-200 focus:outline-hidden focus:ring-1 focus:ring-orange-500 text-stone-800 placeholder:text-stone-400"
              />
            </div>

            {/* Category Filter Chips */}
            <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-orange-600 text-white'
                      : 'bg-white text-stone-600 hover:bg-orange-50 border border-stone-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Notes List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredNotes.length === 0 ? (
                <div className="text-center py-12 text-stone-400 text-xs">
                  {notes.length === 0
                    ? 'No notes written yet. Click "New Entry" to write your first reflection.'
                    : 'No matching notes found.'}
                </div>
              ) : (
                filteredNotes.map((note) => {
                  const isSelected = activeNote?.id === note.id;

                  return (
                    <div
                      key={note.id}
                      onClick={() => handleSelectNote(note)}
                      className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-white border-orange-400 shadow-xs ring-1 ring-orange-400'
                          : 'bg-white hover:bg-orange-50/40 border-stone-200 text-stone-600'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-stone-400 mb-1">
                        <span className="font-medium text-orange-700">{note.category}</span>
                        <span className="font-mono tabular-nums">{note.updatedAt?.slice(0, 10)}</span>
                      </div>
                      <h4 className="text-xs font-semibold text-stone-900 truncate">
                        {note.title || 'Untitled Note'}
                      </h4>
                      <p className="text-[11px] text-stone-500 line-clamp-2 mt-1 leading-relaxed">
                        {note.content || 'Empty note...'}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Note Editor Surface */}
          <div className="flex-1 flex flex-col bg-white overflow-hidden p-6 md:p-8">
            {activeNote ? (
              <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2">
                    <select
                      value={category}
                      onChange={(e) => handleTextChange(title, content, e.target.value)}
                      className="text-xs font-medium text-stone-700 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200 focus:ring-1 focus:ring-orange-400 cursor-pointer"
                    >
                      <option value="Reflection">Reflection</option>
                      <option value="Insight">Insight</option>
                      <option value="Gratitude">Gratitude</option>
                      <option value="Routine Idea">Routine Idea</option>
                    </select>

                    <div className="flex items-center gap-1 text-[11px] text-orange-800">
                      <Check className="w-3 h-3 text-orange-600" />
                      <span>Saved in App</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-stone-400 font-mono tabular-nums">
                      {content.split(/\s+/).filter(Boolean).length} words
                    </span>
                    <button
                      onClick={() => onDeleteNote(activeNote.id)}
                      title="Delete note"
                      className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleTextChange(e.target.value, content, category)}
                  placeholder="Note Title..."
                  className="w-full text-xl md:text-2xl font-serif font-semibold text-stone-900 border-none outline-hidden placeholder:text-stone-300 focus:ring-0 px-0"
                />

                <textarea
                  value={content}
                  onChange={(e) => handleTextChange(title, e.target.value, category)}
                  placeholder="Write your personal reflections, observations, or routine notes..."
                  className="flex-1 w-full text-sm leading-relaxed text-stone-800 border-none outline-hidden resize-none placeholder:text-stone-300 focus:ring-0 px-0 font-sans"
                />
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-stone-400">
                <BookOpen className="w-10 h-10 mb-3 text-stone-300" />
                <h3 className="text-base font-semibold text-stone-700">No Note Selected</h3>
                <p className="text-xs text-stone-400 max-w-sm mt-1">
                  Click "New Entry" above to start writing your personal notes.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
