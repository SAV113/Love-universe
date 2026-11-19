'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/hooks/use-auth';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { MOODS } from '@/lib/constants';
import { formatDate, cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { JournalEntry, JournalComment, MoodType } from '@/types/database';
import {
  BookHeart, Plus, Search, X, Send, Lock, Globe, MessageCircle, Trash2, Edit, Heart
} from 'lucide-react';

export default function JournalPage() {
  const { user, profile } = useAuth();
  const [entries, setEntries] = useState<(JournalEntry & { comments?: JournalComment[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editing, setEditing] = useState<JournalEntry | null>(null);
  const [filterMood, setFilterMood] = useState<string>('all');
  const [search, setSearch] = useState('');

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<MoodType>('peaceful');
  const [isPrivate, setIsPrivate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [commentText, setCommentText] = useState<Record<string, string>>({});

  const supabase = createClient();

  const fetchEntries = async () => {
    const { data } = await supabase.from('journal_entries').select('*, journal_comments(*)').order('created_at', { ascending: false });
    setEntries(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchEntries(); }, []);

  const resetEditor = () => { setTitle(''); setContent(''); setMood('peaceful'); setIsPrivate(false); setEditing(null); };

  const openEditor = (entry?: JournalEntry) => {
    if (entry) { setEditing(entry); setTitle(entry.title); setContent(entry.content); setMood(entry.mood); setIsPrivate(entry.is_private); }
    else resetEditor();
    setShowEditor(true);
  };

  const saveEntry = async () => {
    if (!title.trim()) { toast.error('Give your entry a title'); return; }
    if (!user) return;
    setSaving(true);
    const data = { title: title.trim(), content, mood, is_private: isPrivate, author_id: user.id };

    if (editing) {
      await supabase.from('journal_entries').update(data).eq('id', editing.id);
      toast.success('Entry updated');
    } else {
      await supabase.from('journal_entries').insert(data);
      toast.success('Feelings saved safely ♥');
    }
    setSaving(false); setShowEditor(false); resetEditor(); fetchEntries();
  };

  const deleteEntry = async (id: string) => {
    await supabase.from('journal_entries').delete().eq('id', id);
    toast.success('Entry deleted');
    fetchEntries();
  };

  const addComment = async (entryId: string) => {
    const text = commentText[entryId]?.trim();
    if (!text || !user) return;
    await supabase.from('journal_comments').insert({ entry_id: entryId, author_id: user.id, content: text });
    setCommentText((prev) => ({ ...prev, [entryId]: '' }));
    toast.success('Response sent ♥');
    fetchEntries();
  };

  const filtered = entries.filter((e) => {
    if (filterMood !== 'all' && e.mood !== filterMood) return false;
    if (search && !e.title.toLowerCase().includes(search.toLowerCase()) && !e.content.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Mood calendar (last 30 days)
  const last30 = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (29 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayEntries = entries.filter((e) => e.created_at.startsWith(dateStr));
    const dominantMood = dayEntries[0]?.mood;
    return { date: d, mood: dominantMood, count: dayEntries.length };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold gradient-text flex items-center gap-2"><BookHeart className="w-6 h-6" /> Feelings Space</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Your feelings are safe here. You don&apos;t have to pretend to be okay.</p>
        </div>
        <Button variant="romantic" onClick={() => openEditor()}><Plus className="w-4 h-4" /> Write Entry</Button>
      </div>

      {/* Mood Calendar */}
      <div className="glass rounded-xl p-5 border border-[var(--border)]">
        <h3 className="text-sm font-medium mb-3 text-[var(--muted-foreground)]">Mood Calendar (Last 30 Days)</h3>
        <div className="flex gap-1 flex-wrap">
          {last30.map((day, i) => (
            <div key={i} title={`${day.date.toLocaleDateString()}: ${day.mood ? MOODS[day.mood as MoodType].label : 'No entry'}`}
              className="w-6 h-6 rounded-sm flex items-center justify-center text-xs cursor-default transition-transform hover:scale-125"
              style={{ backgroundColor: day.mood ? `${MOODS[day.mood as MoodType].color}30` : 'var(--muted)' }}
            >
              {day.mood ? MOODS[day.mood as MoodType].emoji : ''}
            </div>
          ))}
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search entries..." className="w-full h-10 pl-10 pr-4 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--lavender)] transition" />
        </div>
        <div className="flex gap-1 flex-wrap">
          <button onClick={() => setFilterMood('all')} className={cn('px-3 py-1.5 rounded-lg text-xs transition', filterMood === 'all' ? 'bg-[var(--lavender)]/15 text-[var(--lavender)]' : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)]')}>All</button>
          {Object.entries(MOODS).map(([key, val]) => (
            <button key={key} onClick={() => setFilterMood(key)} className={cn('px-2 py-1.5 rounded-lg text-xs transition', filterMood === key ? 'bg-[var(--lavender)]/15' : 'hover:bg-[var(--muted)]')}>
              {val.emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Entries */}
      {loading ? (
        <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-32 rounded-xl bg-[var(--muted)] animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <BookHeart className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-4" />
          <p className="text-[var(--muted-foreground)]">No entries yet. How are you feeling today?</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((entry, i) => (
            <motion.div key={entry.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass rounded-xl border border-[var(--border)] p-5 hover:border-[var(--lavender)]/20 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl" title={MOODS[entry.mood].label}>{MOODS[entry.mood].emoji}</span>
                  <div>
                    <h3 className="font-semibold">{entry.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                      <span>{formatDate(entry.created_at)}</span>
                      {entry.is_private ? <Lock className="w-3 h-3" /> : <Globe className="w-3 h-3" />}
                    </div>
                  </div>
                </div>
                {entry.author_id === user?.id && (
                  <div className="flex gap-1">
                    <button onClick={() => openEditor(entry)} className="p-1.5 rounded-lg hover:bg-[var(--muted)] transition"><Edit className="w-3.5 h-3.5 text-[var(--muted-foreground)]" /></button>
                    <button onClick={() => deleteEntry(entry.id)} className="p-1.5 rounded-lg hover:bg-[var(--muted)] transition"><Trash2 className="w-3.5 h-3.5 text-[var(--muted-foreground)]" /></button>
                  </div>
                )}
              </div>
              <p className="text-sm text-[var(--foreground)] whitespace-pre-wrap leading-relaxed">{entry.content}</p>

              {/* Comments */}
              {!entry.is_private && (
                <div className="mt-4 pt-4 border-t border-[var(--border)]">
                  {entry.comments && entry.comments.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {entry.comments.map((c) => (
                        <div key={c.id} className="flex gap-2 items-start">
                          <Heart className="w-3 h-3 text-[var(--rose-pink)] mt-1 flex-shrink-0" fill="currentColor" />
                          <div>
                            <p className="text-sm">{c.content}</p>
                            <p className="text-[10px] text-[var(--muted-foreground)]">{formatDate(c.created_at)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      value={commentText[entry.id] || ''}
                      onChange={(e) => setCommentText((prev) => ({ ...prev, [entry.id]: e.target.value }))}
                      placeholder="Send a supportive message..."
                      className="flex-1 h-9 px-3 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--lavender)] transition"
                      onKeyDown={(e) => e.key === 'Enter' && addComment(entry.id)}
                    />
                    <Button size="sm" variant="ghost" onClick={() => addComment(entry.id)}><Send className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      <AnimatePresence>
        {showEditor && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => { setShowEditor(false); resetEditor(); }}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-lg glass rounded-2xl border border-[var(--border)] p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold gradient-text">{editing ? 'Edit Entry' : 'How are you feeling?'}</h2>
                <button onClick={() => { setShowEditor(false); resetEditor(); }}><X className="w-5 h-5 text-[var(--muted-foreground)]" /></button>
              </div>
              <div className="space-y-4">
                {/* Mood Selector */}
                <div>
                  <label className="text-sm text-[var(--muted-foreground)] mb-2 block">Select your mood</label>
                  <div className="flex gap-2 flex-wrap">
                    {Object.entries(MOODS).map(([key, val]) => (
                      <button key={key} onClick={() => setMood(key as MoodType)}
                        className={cn('flex flex-col items-center gap-1 p-2 rounded-lg transition-all', mood === key ? 'bg-[var(--lavender)]/20 scale-110 ring-2 ring-[var(--lavender)]' : 'hover:bg-[var(--muted)]')}>
                        <span className="text-xl">{val.emoji}</span>
                        <span className="text-[10px] text-[var(--muted-foreground)]">{val.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title..." className="w-full h-11 px-4 rounded-lg bg-[var(--muted)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--lavender)] transition" />
                <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Let it all out..." rows={6} className="w-full px-4 py-3 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--lavender)] transition resize-none" />
                <label className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] cursor-pointer">
                  <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} className="rounded" />
                  <Lock className="w-3.5 h-3.5" /> Private entry (only you can see this)
                </label>
                <Button variant="romantic" className="w-full" onClick={saveEntry} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Entry'} <Heart className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

