'use client';

import { useEffect, useState } from 'react';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export default function NotebookApp() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Load notes from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('notebook-notes');
    if (stored) {
      try {
        setNotes(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load notes:', e);
      }
    }
  }, []);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    if (notes.length > 0 || localStorage.getItem('notebook-notes')) {
      localStorage.setItem('notebook-notes', JSON.stringify(notes));
    }
  }, [notes]);

  const createNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: '',
      content: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setNotes([newNote, ...notes]);
    setSelectedNote(newNote);
    setIsCreating(true);
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(notes.map(note => 
      note.id === id 
        ? { ...note, ...updates, updatedAt: Date.now() }
        : note
    ));
    if (selectedNote?.id === id) {
      setSelectedNote({ ...selectedNote, ...updates, updatedAt: Date.now() });
    }
  };

  const deleteNote = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (window.confirm('Are you sure you want to delete this note?')) {
      setNotes(notes.filter(note => note.id !== id));
      if (selectedNote?.id === id) {
        setSelectedNote(null);
      }
    }
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="h-[100dvh] w-full bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Notes</h1>
        <button
          onClick={createNote}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + New Note
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Notes List */}
        <div className={`${selectedNote ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 bg-white border-r border-gray-200`}>
          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Notes List */}
          <div className="flex-1 overflow-y-auto">
            {filteredNotes.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                {searchQuery ? 'No notes found' : 'No notes yet. Create one!'}
              </div>
            ) : (
              filteredNotes.map(note => (
                <div
                  key={note.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    selectedNote?.id === note.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div 
                    onClick={() => {
                      setSelectedNote(note);
                      setIsCreating(false);
                    }}
                    className="cursor-pointer"
                  >
                    <h3 className="font-medium text-gray-900 mb-1 truncate">
                      {note.title || 'Untitled Note'}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {note.content || 'No content'}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {formatDate(note.updatedAt)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('Are you sure you want to delete this note?')) {
                            setNotes(notes.filter(n => n.id !== note.id));
                            if (selectedNote?.id === note.id) {
                              setSelectedNote(null);
                            }
                          }
                        }}
                        className="text-red-500 hover:text-red-600 text-xs font-medium px-2 py-1 rounded hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Note Editor */}
        <div className={`${selectedNote ? 'flex' : 'hidden md:flex'} flex-col flex-1 bg-white`}>
          {selectedNote ? (
            <>
              {/* Editor Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                <button
                  onClick={() => setSelectedNote(null)}
                  className="md:hidden text-gray-600 hover:text-gray-900"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span className="text-xs text-gray-400">
                  {formatDate(selectedNote.updatedAt)}
                </span>
                <button
                  onClick={(e) => deleteNote(selectedNote.id, e)}
                  className="text-red-500 hover:text-red-600 text-sm font-medium"
                >
                  Delete
                </button>
              </div>

              {/* Editor Content */}
              <div className="flex-1 overflow-y-auto p-4">
                <input
                  type="text"
                  placeholder="Note title..."
                  value={selectedNote.title}
                  onChange={(e) => updateNote(selectedNote.id, { title: e.target.value })}
                  autoFocus={isCreating}
                  className="w-full text-2xl font-semibold text-gray-900 mb-4 focus:outline-none placeholder-gray-400"
                />
                <textarea
                  placeholder="Start typing..."
                  value={selectedNote.content}
                  onChange={(e) => updateNote(selectedNote.id, { content: e.target.value })}
                  className="w-full h-full min-h-[300px] text-gray-700 focus:outline-none resize-none placeholder-gray-400"
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm">Select a note to view</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}





