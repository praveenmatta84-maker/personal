import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  BookOpen,
  Plus,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Calendar,
  Check,
  ArrowLeft,
  Trash2,
  Edit2,
  Search,
  HardDrive,
  Download,
  FileUp,
} from 'lucide-react';
import { DocumentItem } from '../types';

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: DocumentItem[];
  activeDocId?: string | null;
  onSaveDoc: (doc: DocumentItem) => void;
  onDeleteDoc?: (docId: string) => void;
  onShareDocWithAi: (doc: DocumentItem, action: 'explain' | 'allocate') => void;
}

export const DocumentModal: React.FC<DocumentModalProps> = ({
  isOpen,
  onClose,
  documents,
  activeDocId,
  onSaveDoc,
  onDeleteDoc,
  onShareDocWithAi,
}) => {
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newCategory, setNewCategory] = useState('Study & Theory');
  const [newContent, setNewContent] = useState('');
  const [newExcerpt, setNewExcerpt] = useState('');
  const [newCover, setNewCover] = useState('/src/assets/images/doc_zen_mindfulness_1790533289178.jpg');
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeDocId) {
      const found = documents.find((d) => d.id === activeDocId);
      if (found) {
        setSelectedDoc(found);
        setCurrentPage(found.bookmarkPage || 1);
        setIsAddingNew(false);
        setIsEditing(false);
      }
    } else if (documents.length > 0 && !selectedDoc && !isAddingNew) {
      setSelectedDoc(documents[0]);
      setCurrentPage(documents[0].bookmarkPage || 1);
    }
  }, [activeDocId, documents]);

  const handleOpenReader = (doc: DocumentItem) => {
    setSelectedDoc(doc);
    setCurrentPage(doc.bookmarkPage || 1);
    setIsAddingNew(false);
    setIsEditing(false);
  };

  const handlePageChange = (newPage: number) => {
    if (!selectedDoc) return;
    if (newPage >= 1 && newPage <= selectedDoc.totalPages) {
      setCurrentPage(newPage);
      const updated: DocumentItem = {
        ...selectedDoc,
        currentPage: newPage,
        bookmarkPage: newPage,
        lastReadAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      };
      setSelectedDoc(updated);
      onSaveDoc(updated);
    }
  };

  const handleSaveBookmark = () => {
    if (!selectedDoc) return;
    const updated: DocumentItem = {
      ...selectedDoc,
      bookmarkPage: currentPage,
      lastReadAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    setSelectedDoc(updated);
    onSaveDoc(updated);
  };

  const handleFileUpload = (file: File) => {
    setFileName(file.name);
    const titleWithoutExt = file.name.replace(/\.[^/.]+$/, '');
    if (!newTitle) setNewTitle(titleWithoutExt);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        setNewContent(text);
        if (!newExcerpt) {
          setNewExcerpt(text.slice(0, 150).trim() + '...');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleSaveDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const paragraphs = newContent.split(/\n\s*\n/).filter(Boolean);
    const pages = paragraphs.length > 0 ? paragraphs : [newContent];

    if (isEditing && selectedDoc) {
      const updated: DocumentItem = {
        ...selectedDoc,
        title: newTitle.trim(),
        author: newAuthor.trim() || selectedDoc.author,
        category: newCategory,
        coverImage: newCover,
        content: pages,
        totalPages: pages.length,
        excerpt: newExcerpt || newContent.slice(0, 140) + '...',
      };
      onSaveDoc(updated);
      setSelectedDoc(updated);
      setIsEditing(false);
    } else {
      const newDoc: DocumentItem = {
        id: `doc-${Date.now()}`,
        title: newTitle.trim(),
        author: newAuthor.trim() || 'My Library',
        category: newCategory,
        coverImage: newCover,
        totalPages: pages.length,
        currentPage: 1,
        bookmarkPage: 1,
        content: pages,
        excerpt: newExcerpt || newContent.slice(0, 140) + '...',
        lastReadAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      };
      onSaveDoc(newDoc);
      setSelectedDoc(newDoc);
      setCurrentPage(1);
      setIsAddingNew(false);
    }

    setNewTitle('');
    setNewAuthor('');
    setNewContent('');
    setNewExcerpt('');
    setFileName(null);
  };

  const handleStartEdit = (doc: DocumentItem) => {
    setNewTitle(doc.title);
    setNewAuthor(doc.author);
    setNewCategory(doc.category);
    setNewContent(doc.content.join('\n\n'));
    setNewExcerpt(doc.excerpt);
    setNewCover(doc.coverImage);
    setIsEditing(true);
    setIsAddingNew(true);
  };

  const handleExportDoc = (doc: DocumentItem) => {
    const textBlob = new Blob([doc.content.join('\n\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(textBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.title.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  const categories = ['All', 'Focus & Presence', 'Productivity Systems', 'Rest & Recovery', 'Study & Theory'];

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || doc.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-md flex items-center justify-center p-0 md:p-6 overflow-hidden">
      {/* Full Window Modal Container */}
      <div className="w-full h-full md:max-w-6xl md:h-[92vh] bg-white md:rounded-3xl border border-stone-200/90 shadow-2xl flex flex-col overflow-hidden animate-in fade-in duration-150">
        {/* Full Window Header: Orange Flow with Pristine White Typography */}
        <div className="flex items-center justify-between px-6 py-4.5 bg-orange-flow text-white border-b border-white/20 shadow-xs shrink-0">
          <div className="flex items-center gap-3.5">
            {(selectedDoc || isAddingNew) && (
              <button
                onClick={() => {
                  setSelectedDoc(null);
                  setIsAddingNew(false);
                  setIsEditing(false);
                }}
                className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
                title="Back to Document Vault"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}

            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md text-white border border-white/30 flex items-center justify-center shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-serif font-medium text-white tracking-tight drop-shadow-xs">
                  {isAddingNew
                    ? isEditing
                      ? 'Edit Stored Document'
                      : 'Store New Document in App'
                    : selectedDoc
                    ? selectedDoc.title
                    : 'Document Vault (Stored in App)'}
                </h1>
                <span className="text-[10px] font-mono text-orange-950 bg-white/90 px-2 py-0.5 rounded-md flex items-center gap-1 font-semibold">
                  <HardDrive className="w-3 h-3 text-orange-600" />
                  <span>Stored In-App</span>
                </span>
              </div>
              <p className="text-xs text-white/80">
                {selectedDoc && !isAddingNew
                  ? `By ${selectedDoc.author} · Resumed at Page ${selectedDoc.bookmarkPage} of ${selectedDoc.totalPages}`
                  : 'Store reading materials, study guides, and books directly in the app.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {!isAddingNew && !selectedDoc && (
              <button
                onClick={() => {
                  setIsEditing(false);
                  setNewTitle('');
                  setNewAuthor('');
                  setNewContent('');
                  setNewExcerpt('');
                  setFileName(null);
                  setIsAddingNew(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-orange-50 text-orange-950 text-xs font-semibold shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-orange-600" />
                <span>Store New Doc</span>
              </button>
            )}

            {selectedDoc && !isAddingNew && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleStartEdit(selectedDoc)}
                  className="p-1.5 rounded-xl border border-white/30 bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
                  title="Edit document"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleExportDoc(selectedDoc)}
                  className="p-1.5 rounded-xl border border-white/30 bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
                  title="Export text"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>

                {onDeleteDoc && (
                  <button
                    onClick={() => {
                      if (confirm(`Remove "${selectedDoc.title}" from app storage?`)) {
                        onDeleteDoc(selectedDoc.id);
                        setSelectedDoc(null);
                      }
                    }}
                    className="p-1.5 rounded-xl border border-red-300/40 bg-red-500/20 text-white hover:bg-red-500/30 transition-colors cursor-pointer"
                    title="Delete document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  onClick={() => onShareDocWithAi(selectedDoc, 'explain')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white border border-white/30 text-xs font-medium transition-all cursor-pointer"
                  title="Ask AI to analyze and explain this document"
                >
                  <Sparkles className="w-3.5 h-3.5 text-orange-200" />
                  <span className="hidden sm:inline">Ask AI to Explain</span>
                </button>

                <button
                  onClick={() => onShareDocWithAi(selectedDoc, 'allocate')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-orange-50 text-orange-950 text-xs font-semibold shadow-xs transition-all cursor-pointer"
                  title="Have AI allocate this document into your timetable schedule"
                >
                  <Calendar className="w-3.5 h-3.5 text-orange-600" />
                  <span className="hidden sm:inline">Allocate to Schedule</span>
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto">
          {isAddingNew ? (
            /* Upload & Store New Document Form */
            <form onSubmit={handleSaveDocument} className="max-w-2xl mx-auto p-6 md:p-8 space-y-5">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <div>
                  <h3 className="text-sm font-semibold text-stone-800">
                    {isEditing ? 'Update Stored Document' : 'Store Document in Local App Storage'}
                  </h3>
                  <p className="text-xs text-stone-500">
                    Upload a file (.txt, .md, .json) or type/paste text directly.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNew(false);
                    setIsEditing(false);
                  }}
                  className="text-xs text-stone-500 hover:text-stone-800"
                >
                  Cancel
                </button>
              </div>

              {/* Drag and Drop File Upload Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-6 rounded-2xl border-2 border-dashed transition-all cursor-pointer text-center ${
                  isDragging
                    ? 'border-orange-500 bg-orange-50/50'
                    : 'border-stone-300 hover:border-orange-400 bg-stone-50/60 hover:bg-white'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md,.json,.csv,.text"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 text-orange-600 flex items-center justify-center mx-auto mb-2 shadow-2xs">
                  <FileUp className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-semibold text-stone-800">
                  {fileName ? `Selected file: ${fileName}` : 'Click to select or drop a file to store'}
                </h4>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  Supports .txt, .md, .json documents · Stored completely offline in app
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Distributed Systems Architecture, Deep Focus Manual"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Author / Source
                  </label>
                  <input
                    type="text"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    placeholder="e.g. Research Paper, Dr. Vance"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="e.g. Focus & Presence, Engineering"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white"
                  />
                </div>
              </div>

              {/* Cover Art Choice */}
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1.5">
                  Choose Cover Art Thumbnail
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { name: 'Mindfulness & Sage', path: '/src/assets/images/doc_zen_mindfulness_1790533289178.jpg' },
                    { name: 'Modern Flow & Slate', path: '/src/assets/images/doc_atomic_habits_1790533300951.jpg' },
                    { name: 'Twilight Restoration', path: '/src/assets/images/doc_calm_evening_1790533313432.jpg' },
                  ].map((art) => (
                    <button
                      key={art.path}
                      type="button"
                      onClick={() => setNewCover(art.path)}
                      className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                        newCover === art.path
                          ? 'border-orange-600 bg-orange-50/70 ring-1 ring-orange-500'
                          : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      <img
                        src={art.path}
                        alt={art.name}
                        referrerPolicy="no-referrer"
                        className="w-8 h-11 object-cover rounded-md"
                      />
                      <span className="text-[11px] font-medium text-stone-700 line-clamp-1">
                        {art.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Document Content / Text * (Double line breaks split into pages)
                </label>
                <textarea
                  rows={8}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Paste your study notes, manuscript, or reading material here. Separate chapters or paragraphs with double line breaks to automatically create pages..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 leading-relaxed font-sans"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                <span className="text-[11px] text-stone-400">
                  {newContent.split(/\n\s*\n/).filter(Boolean).length || 1} page(s) will be created
                </span>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingNew(false);
                      setIsEditing(false);
                    }}
                    className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-medium text-white bg-orange-600 hover:bg-orange-500 rounded-xl shadow-xs"
                  >
                    {isEditing ? 'Save Changes' : 'Store in App'}
                  </button>
                </div>
              </div>
            </form>
          ) : selectedDoc ? (
            /* Immersive Document Reader Surface */
            <div className="max-w-3xl mx-auto p-6 md:p-10 flex flex-col space-y-6">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-stone-200/90 shadow-2xs">
                <div className="flex items-center gap-3">
                  {selectedDoc.coverImage ? (
                    <img
                      src={selectedDoc.coverImage}
                      alt={selectedDoc.title}
                      referrerPolicy="no-referrer"
                      className="w-10 h-14 object-cover rounded-md shadow-xs"
                    />
                  ) : (
                    <div className="w-10 h-14 bg-orange-100 text-orange-700 flex items-center justify-center rounded-md">
                      <BookOpen className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <span className="text-[11px] text-stone-400 font-medium">{selectedDoc.category}</span>
                    <h3 className="text-sm font-semibold text-stone-900">{selectedDoc.title}</h3>
                    <p className="text-xs text-stone-500 font-mono tabular-nums">
                      Page {currentPage} of {selectedDoc.totalPages} · Bookmarked at Page {selectedDoc.bookmarkPage || 1}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveBookmark}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 text-xs font-medium transition-colors"
                    title="Bookmark current page"
                  >
                    <Bookmark className="w-3.5 h-3.5 fill-orange-600 text-orange-600" />
                    <span>Bookmark Page</span>
                  </button>
                </div>
              </div>

              {/* Page Reader Text Surface */}
              <div className="p-8 md:p-12 rounded-3xl bg-white border border-stone-200/90 shadow-xs min-h-[380px] prose prose-stone max-w-none">
                <div className="font-serif text-base md:text-lg leading-relaxed text-stone-800 whitespace-pre-line selection:bg-orange-100">
                  {selectedDoc.content[currentPage - 1] || 'No content for this page.'}
                </div>
              </div>

              {/* Navigation Controls: Prev / Next */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-stone-200 hover:border-orange-400 text-stone-700 text-xs font-medium disabled:opacity-30 disabled:hover:border-stone-200 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous Page</span>
                </button>

                <div className="flex items-center gap-1 font-mono text-xs text-stone-500 tabular-nums">
                  <span>Page</span>
                  <span className="font-semibold text-stone-900">{currentPage}</span>
                  <span>of</span>
                  <span>{selectedDoc.totalPages}</span>
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= selectedDoc.totalPages}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-stone-200 hover:border-orange-400 text-stone-700 text-xs font-medium disabled:opacity-30 disabled:hover:border-stone-200 transition-colors"
                >
                  <span>Next Page</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Document Library Grid */
            <div className="p-6 md:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-orange-50 text-orange-700 border border-orange-200/80">
                    <HardDrive className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-stone-900">
                      In-App Document Storage
                    </h3>
                    <p className="text-xs text-stone-500">
                      {documents.length} document{documents.length !== 1 ? 's' : ''} stored · 100% offline & private
                    </p>
                  </div>
                </div>

                <div className="relative w-full sm:w-72">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Search stored docs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white border border-stone-200 focus:outline-hidden focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>

              {documents.length === 0 ? (
                <div className="p-12 rounded-3xl bg-white border border-dashed border-stone-300 text-center space-y-3">
                  <BookOpen className="w-10 h-10 text-stone-300 mx-auto" />
                  <h4 className="text-sm font-semibold text-stone-800 font-serif">
                    No Documents Stored Yet
                  </h4>
                  <p className="text-xs text-stone-400 max-w-sm mx-auto">
                    Click "Store New Doc" above to upload or paste your study materials into the app.
                  </p>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setNewTitle('');
                      setNewAuthor('');
                      setNewContent('');
                      setNewExcerpt('');
                      setFileName(null);
                      setIsAddingNew(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-medium transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Store First Document</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-5 rounded-2xl bg-white border border-stone-200/90 hover:border-orange-300 hover:shadow-xs transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          onClick={() => handleOpenReader(doc)}
                          className="w-16 h-22 rounded-xl overflow-hidden bg-stone-100 shrink-0 cursor-pointer shadow-xs group/img relative"
                          title="Click to resume reading"
                        >
                          {doc.coverImage ? (
                            <img
                              src={doc.coverImage}
                              alt={doc.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover/img:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full bg-orange-100 text-orange-700 flex items-center justify-center">
                              <BookOpen className="w-6 h-6" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/10 group-hover/img:bg-transparent transition-colors" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] text-orange-700 font-medium uppercase tracking-wider block">
                            {doc.category}
                          </span>
                          <h4
                            onClick={() => handleOpenReader(doc)}
                            className="text-sm font-semibold text-stone-900 hover:text-orange-700 cursor-pointer truncate mt-0.5"
                          >
                            {doc.title}
                          </h4>
                          <p className="text-xs text-stone-500 truncate">{doc.author}</p>

                          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-orange-800 font-medium">
                            <Bookmark className="w-3 h-3 fill-orange-600 text-orange-600" />
                            <span>Page {doc.bookmarkPage || 1}/{doc.totalPages || 1}</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed italic">
                        "{doc.excerpt}"
                      </p>

                      <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                        <button
                          onClick={() => handleOpenReader(doc)}
                          className="flex-1 py-1.5 px-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-medium transition-colors text-center"
                        >
                          Resume Reading
                        </button>

                        <button
                          onClick={() => onShareDocWithAi(doc, 'allocate')}
                          className="p-1.5 rounded-xl border border-stone-200 hover:bg-orange-50 text-stone-600 transition-colors"
                          title="Allocate doc to timetable with AI"
                        >
                          <Calendar className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
