import React, { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, Pin, PinOff, Tag, Search } from 'lucide-react';
import { api } from '../api/api.ts';
import { Note } from '../types.ts';

export const NotesPage: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const fetchNotes = async () => {
    try {
      const res = await api.get('/api/notes');
      setNotes(res.data);
    } catch (err) {
      console.error('Error fetching notes:', err);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;
    const tags = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      const res = await api.post('/api/notes', {
        title: title.trim() || 'Untitled Reflection',
        content: content.trim(),
        tags,
        isPinned: false,
      });
      setNotes((prev) => [res.data, ...prev]);
      setTitle('');
      setContent('');
      setTagInput('');
      setShowAdd(false);
    } catch (err) {
      console.error('Error creating note:', err);
    }
  };

  const togglePin = async (id: string, current: boolean) => {
    try {
      const res = await api.put(`/api/notes/${id}`, { isPinned: !current });
      setNotes((prev) => prev.map((n) => (n.id === id ? res.data : n)));
    } catch (err) {
      console.error('Error toggling pin:', err);
    }
  };

  const deleteNote = async (id: string) => {
    try {
      await api.delete(`/api/notes/${id}`);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error('Error deleting note:', err);
    }
  };

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase()) ||
      n.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#1e293b] p-5 rounded-2xl border border-gray-200/80 dark:border-gray-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <FileText className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
              Mindset Notes & Reflections
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            "Paper is patient. Capture ideas, lessons learned, and breakthroughs."
          </p>
        </div>

        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>
      </div>

      {/* Add Note Form */}
      {showAdd && (
        <form
          onSubmit={handleCreateNote}
          className="bg-white dark:bg-[#1e293b] p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900 shadow-sm space-y-3"
        >
          <input
            type="text"
            placeholder="Note Title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full font-bold text-sm bg-transparent border-b border-gray-200 dark:border-gray-700 pb-2 focus:outline-none focus:border-emerald-500 text-gray-900 dark:text-gray-100"
          />
          <textarea
            rows={4}
            placeholder="Write your reflection, lesson, or strategy..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full text-xs sm:text-sm bg-transparent focus:outline-none resize-y text-gray-800 dark:text-gray-200"
          />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
            <input
              type="text"
              placeholder="Tags (comma separated, e.g. habit, focus, mindset)"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="w-full sm:w-80 text-xs px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none"
            />
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
              >
                Save Note
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search reflections & notes..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1e293b] text-xs sm:text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredNotes.map((note) => (
          <div
            key={note.id}
            className={`p-5 rounded-2xl border bg-white dark:bg-[#1e293b] shadow-xs flex flex-col justify-between transition-all ${
              note.isPinned
                ? 'border-emerald-300 dark:border-emerald-800 bg-[#f6fcf8]/60 dark:bg-emerald-950/20 ring-1 ring-emerald-400/30'
                : 'border-gray-200/80 dark:border-gray-800 hover:border-gray-300'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-gray-100 leading-snug">
                  {note.title}
                </h3>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => togglePin(note.id, note.isPinned)}
                    className={`p-1 transition-colors ${
                      note.isPinned
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-gray-300 dark:text-gray-600 hover:text-gray-500'
                    }`}
                    title={note.isPinned ? 'Unpin note' : 'Pin to top'}
                  >
                    <Pin className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                    title="Delete note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {note.content}
              </p>
            </div>

            {note.tags && note.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                {note.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-medium"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
