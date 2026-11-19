'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/hooks/use-auth';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { LETTER_CATEGORIES, OPEN_WHEN_TAGS } from '@/lib/constants';
import { formatDate, cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { LoveLetter, LetterCategory } from '@/types/database';
import {
  Mail, Plus, Heart, Search, Filter, Trash2, Edit, Star,
  Send, Save, X, Clock, BookOpen, ChevronDown
} from 'lucide-react';

export default function LettersPage() {
  const { user } = useAuth();
  const [letters, setLetters] = useState<LoveLetter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editing, setEditing] = useState<LoveLetter | null>(null);
  const [showReader, setShowReader] = useState<LoveLetter | null>(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterFav, setFilterFav] = useState(false);

  // Editor state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<LetterCategory>('random-love-notes');
  const [isDraft, setIsDraft] = useState(true);
  const [openWhenTag, setOpenWhenTag] = useState('');
  const [useHandwritten, setUseHandwritten] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  const fetchLetters = async () => {
    const { data } = await supabase
      .from('love_letters')
      .select('*')
      .order('created_at', { ascending: false });
    setLetters(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchLetters(); }, []);

  const resetEditor = () => {
    setTitle(''); setContent(''); setCategory('random-love-notes');
    setIsDraft(true); setOpenWhenTag(''); setUseHandwritten(false);
    setScheduledDate(''); setEditing(null);
  };

  const openEditor = (letter?: LoveLetter) => {
    if (letter) {
      setEditing(letter);
      setTitle(letter.title); setContent(letter.content);
      setCategory(letter.category); setIsDraft(letter.is_draft);
      setOpenWhenTag(letter.open_when_tag || '');
      setUseHandwritten(letter.use_handwritten_font);
      setScheduledDate(letter.scheduled_date ? letter.scheduled_date.split('T')[0] : '');
    } else {
      resetEditor();
    }
    setShowEditor(true);
  };

  const saveLetter = async (publish: boolean) => {
    if (!title.trim()) { toast.error('Give your letter a title'); return; }
    if (!user) return;
    setSaving(true);

    const letterData = {
      title: title.trim(),
      content,
      category,
      is_draft: publish ? false : true,
      is_published: publish,
      open_when_tag: category === 'open-when' ? openWhenTag : null,
      use_handwritten_font: useHandwritten,
      scheduled_date: scheduledDate ? new Date(scheduledDate).toISOString() : null,
      author_id: user.id,
    };

    if (editing) {
      const { error } = await supabase.from('love_letters').update(letterData).eq('id', editing.id);
      if (error) { toast.error('Failed to update'); setSaving(false); return; }
      toast.success('Letter updated ♥');
    } else {
      const { error } = await supabase.from('love_letters').insert(letterData);
      if (error) { toast.error('Failed to save'); setSaving(false); return; }
      toast.success(publish ? 'Letter sent with love ♥' : 'Draft saved');
    }

    setSaving(false);
    setShowEditor(false);
    resetEditor();
    fetchLetters();
  };

  const deleteLetter = async (id: string) => {
    await supabase.from('love_letters').delete().eq('id', id);
    toast.success('Letter deleted');
    fetchLetters();
  };

  const toggleFavorite = async (letter: LoveLetter) => {
    await supabase.from('love_letters').update({ is_favorite: !letter.is_favorite }).eq('id', letter.id);
    fetchLetters();
  };

  const filtered = letters.filter((l) => {
    if (filterCategory !== 'all' && l.category !== filterCategory) return false;
    if (filterFav && !l.is_favorite) return false;
    if (search && !l.title.toLowerCase().includes(search.toLowerCase()) && !l.content.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getCategoryInfo = (cat: string) => LETTER_CATEGORIES.find((c) => c.value === cat);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold gradient-text flex items-center gap-2">
            <Mail className="w-6 h-6" /> Love Letters
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">Words from the heart, written for you.</p>
        </div>
        <Button variant="romantic" onClick={() => openEditor()}>
          <Plus className="w-4 h-4" /> Write a Letter
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search letters..."
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--lavender)] transition"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="h-10 px-3 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--lavender)]"
        >
          <option value="all">All Categories</option>
          {LETTER_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
          ))}
        </select>
        <Button variant={filterFav ? 'romantic' : 'outline'} size="icon" onClick={() => setFilterFav(!filterFav)}>
          <Star className="w-4 h-4" fill={filterFav ? 'currentColor' : 'none'} />
        </Button>
      </div>

      {/* Open When Collection */}
      <div className="glass rounded-xl p-5 border border-[var(--border)]">
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[var(--rose-pink)]" /> Open When... Collection
        </h3>
        <div className="flex flex-wrap gap-2">
          {OPEN_WHEN_TAGS.map((tag) => {
            const hasLetter = letters.some((l) => l.open_when_tag === tag && l.is_published);
            return (
              <button
                key={tag}
                onClick={() => {
                  const letter = letters.find((l) => l.open_when_tag === tag && l.is_published);
                  if (letter) setShowReader(letter);
                  else { openEditor(); setCategory('open-when'); setOpenWhenTag(tag); }
                }}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs border transition-all',
                  hasLetter
                    ? 'bg-[var(--lavender)]/15 border-[var(--lavender)]/30 text-[var(--lavender)] hover:bg-[var(--lavender)]/25'
                    : 'border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--lavender)]/30'
                )}
              >
                Open when {tag} {hasLetter ? '💌' : '✍️'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Letters Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-xl bg-[var(--muted)] animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Mail className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-4" />
          <p className="text-[var(--muted-foreground)]">No letters yet. Write one from the heart.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((letter, i) => (
            <motion.div
              key={letter.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-xl border border-[var(--border)] hover:border-[var(--lavender)]/30 transition-all cursor-pointer group overflow-hidden"
            >
              <div className="p-5" onClick={() => setShowReader(letter)}>
                <div className="flex items-start justify-between mb-2">
                  <span className="text-lg">{getCategoryInfo(letter.category)?.icon}</span>
                  <div className="flex gap-1">
                    {letter.is_draft && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">Draft</span>
                    )}
                    {letter.scheduled_date && !letter.is_published && (
                      <Clock className="w-3 h-3 text-[var(--muted-foreground)]" />
                    )}
                  </div>
                </div>
                <h3 className="font-semibold mb-1 line-clamp-1">{letter.title}</h3>
                <p className="text-sm text-[var(--muted-foreground)] line-clamp-3 mb-3">{letter.content}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--muted-foreground)]">{formatDate(letter.created_at)}</span>
                  <span className="text-xs text-[var(--lavender)]">{getCategoryInfo(letter.category)?.label}</span>
                </div>
              </div>
              <div className="flex border-t border-[var(--border)] opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => toggleFavorite(letter)} className="flex-1 py-2 text-xs text-[var(--muted-foreground)] hover:text-[var(--rose-pink)] transition flex items-center justify-center gap-1">
                  <Star className="w-3 h-3" fill={letter.is_favorite ? 'currentColor' : 'none'} />
                </button>
                <button onClick={() => openEditor(letter)} className="flex-1 py-2 text-xs text-[var(--muted-foreground)] hover:text-[var(--lavender)] transition flex items-center justify-center gap-1">
                  <Edit className="w-3 h-3" />
                </button>
                <button onClick={() => deleteLetter(letter.id)} className="flex-1 py-2 text-xs text-[var(--muted-foreground)] hover:text-[var(--destructive)] transition flex items-center justify-center gap-1">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Letter Editor Modal */}
      <AnimatePresence>
        {showEditor && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => { setShowEditor(false); resetEditor(); }}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto glass rounded-2xl border border-[var(--border)] p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold gradient-text">{editing ? 'Edit Letter' : 'Write a Love Letter'}</h2>
                <button onClick={() => { setShowEditor(false); resetEditor(); }}><X className="w-5 h-5 text-[var(--muted-foreground)]" /></button>
              </div>

              <div className="space-y-4">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Letter title..."
                  className="w-full h-11 px-4 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-lg font-medium focus:outline-none focus:ring-2 focus:ring-[var(--lavender)] transition"
                />

                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as LetterCategory)}
                  className="w-full h-10 px-3 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--lavender)]"
                >
                  {LETTER_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                  ))}
                </select>

                {category === 'open-when' && (
                  <select
                    value={openWhenTag}
                    onChange={(e) => setOpenWhenTag(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--lavender)]"
                  >
                    <option value="">Select tag...</option>
                    {OPEN_WHEN_TAGS.map((tag) => (
                      <option key={tag} value={tag}>Open when {tag}</option>
                    ))}
                  </select>
                )}

                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Pour your heart out..."
                  rows={10}
                  className={cn(
                    'w-full px-4 py-3 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--lavender)] transition resize-none letter-paper',
                    useHandwritten && 'font-handwritten text-lg'
                  )}
                />

                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] cursor-pointer">
                    <input type="checkbox" checked={useHandwritten} onChange={(e) => setUseHandwritten(e.target.checked)} className="rounded" />
                    Handwritten style
                  </label>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[var(--muted-foreground)]" />
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="h-9 px-3 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--lavender)]"
                      placeholder="Schedule for..."
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={() => saveLetter(false)} disabled={saving} className="flex-1">
                    <Save className="w-4 h-4" /> Save Draft
                  </Button>
                  <Button variant="romantic" onClick={() => saveLetter(true)} disabled={saving} className="flex-1">
                    <Send className="w-4 h-4" /> {saving ? 'Sending...' : 'Send with Love'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Letter Reader Modal */}
      <AnimatePresence>
        {showReader && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setShowReader(null)}>
            <motion.div
              initial={{ scale: 0.9, rotateY: -90 }} animate={{ scale: 1, rotateY: 0 }} exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
              className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border border-[var(--border)] p-8"
              style={{ background: 'linear-gradient(135deg, var(--card), var(--deep-purple))' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <span className="text-3xl">{getCategoryInfo(showReader.category)?.icon}</span>
                <h2 className={cn('text-2xl font-bold mt-3 gradient-text', showReader.use_handwritten_font && 'font-handwritten text-3xl')}>{showReader.title}</h2>
                <p className="text-xs text-[var(--muted-foreground)] mt-2">{formatDate(showReader.created_at)}</p>
              </div>
              <div className={cn(
                'text-[var(--foreground)] leading-relaxed whitespace-pre-wrap',
                showReader.use_handwritten_font && 'font-handwritten text-xl'
              )}>
                {showReader.content}
              </div>
              <div className="mt-8 text-center">
                <Heart className="w-6 h-6 text-[var(--rose-pink)] mx-auto animate-pulse-soft" fill="currentColor" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

