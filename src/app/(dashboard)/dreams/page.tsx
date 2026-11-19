'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/hooks/use-auth';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { DREAM_CATEGORIES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { DreamBoardItem } from '@/types/database';
import { Moon, Plus, X, Check, Trash2, Edit, Heart, Sparkles } from 'lucide-react';

export default function DreamsPage() {
  const { user } = useAuth();
  const [dreams, setDreams] = useState<DreamBoardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<DreamBoardItem | null>(null);
  const [filterCat, setFilterCat] = useState('all');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Goals');
  const [targetDate, setTargetDate] = useState('');
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  const fetchDreams = async () => {
    const { data } = await supabase.from('dream_board_items').select('*').order('created_at', { ascending: false });
    setDreams(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchDreams(); }, []);

  const resetForm = () => { setTitle(''); setDescription(''); setCategory('Goals'); setTargetDate(''); setEditing(null); };

  const openEditor = (dream?: DreamBoardItem) => {
    if (dream) { setEditing(dream); setTitle(dream.title); setDescription(dream.description || ''); setCategory(dream.category); setTargetDate(dream.target_date || ''); }
    else resetForm();
    setShowAdd(true);
  };

  const saveDream = async () => {
    if (!title.trim() || !user) return;
    setSaving(true);
    const d = { title: title.trim(), description: description || null, category, target_date: targetDate || null, author_id: user.id };
    if (editing) { await supabase.from('dream_board_items').update(d).eq('id', editing.id); toast.success('Updated'); }
    else { await supabase.from('dream_board_items').insert(d); toast.success('Dream added to the board ✨'); }
    setSaving(false); setShowAdd(false); resetForm(); fetchDreams();
  };

  const toggleComplete = async (dream: DreamBoardItem) => {
    await supabase.from('dream_board_items').update({ is_completed: !dream.is_completed }).eq('id', dream.id);
    toast.success(dream.is_completed ? 'Dream reopened' : 'Dream achieved! 🎉');
    fetchDreams();
  };

  const deleteDream = async (id: string) => {
    await supabase.from('dream_board_items').delete().eq('id', id);
    toast.success('Removed'); fetchDreams();
  };

  const filtered = filterCat === 'all' ? dreams : dreams.filter((d) => d.category === filterCat);
  const completedCount = dreams.filter((d) => d.is_completed).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold gradient-text flex items-center gap-2"><Moon className="w-6 h-6" /> Our Future Dreams</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Everything we want to experience together.</p>
        </div>
        <Button variant="romantic" onClick={() => openEditor()}><Plus className="w-4 h-4" /> Add Dream</Button>
      </div>

      {/* Progress */}
      {dreams.length > 0 && (
        <div className="glass rounded-xl p-5 border border-[var(--border)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--muted-foreground)]">Dreams achieved</span>
            <span className="text-sm font-medium gradient-text">{completedCount}/{dreams.length}</span>
          </div>
          <div className="h-2 rounded-full bg-[var(--muted)] overflow-hidden">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-[var(--lavender)] to-[var(--rose-pink)]"
              initial={{ width: 0 }} animate={{ width: `${dreams.length > 0 ? (completedCount / dreams.length) * 100 : 0}%` }}
              transition={{ duration: 1, ease: 'easeOut' }} />
          </div>
        </div>
      )}

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilterCat('all')} className={cn('px-3 py-1.5 rounded-lg text-xs transition', filterCat === 'all' ? 'bg-[var(--lavender)]/15 text-[var(--lavender)]' : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)]')}>All</button>
        {DREAM_CATEGORIES.map((cat) => (
          <button key={cat} onClick={() => setFilterCat(cat)}
            className={cn('px-3 py-1.5 rounded-lg text-xs transition', filterCat === cat ? 'bg-[var(--lavender)]/15 text-[var(--lavender)]' : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)]')}>{cat}</button>
        ))}
      </div>

      {/* Dream Board - Pinterest style */}
      {loading ? (
        <div className="masonry-grid">{[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-36 rounded-xl bg-[var(--muted)] animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Moon className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-4" />
          <p className="text-[var(--muted-foreground)]">Start dreaming together. Add your first dream.</p>
        </div>
      ) : (
        <div className="masonry-grid">
          {filtered.map((dream, i) => (
            <motion.div key={dream.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className={cn('glass rounded-xl border border-[var(--border)] hover:border-[var(--lavender)]/30 transition-all p-5 group', dream.is_completed && 'opacity-70')}>
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--lavender)]/10 text-[var(--lavender)]">{dream.category}</span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => toggleComplete(dream)} className="p-1"><Check className={cn('w-3.5 h-3.5', dream.is_completed ? 'text-green-400' : 'text-[var(--muted-foreground)]')} /></button>
                  <button onClick={() => openEditor(dream)} className="p-1"><Edit className="w-3.5 h-3.5 text-[var(--muted-foreground)]" /></button>
                  <button onClick={() => deleteDream(dream.id)} className="p-1"><Trash2 className="w-3.5 h-3.5 text-[var(--muted-foreground)]" /></button>
                </div>
              </div>
              <h3 className={cn('font-semibold mb-1', dream.is_completed && 'line-through')}>{dream.title}</h3>
              {dream.description && <p className="text-sm text-[var(--muted-foreground)]">{dream.description}</p>}
              {dream.target_date && <p className="text-xs text-[var(--rose-pink)] mt-2">Target: {new Date(dream.target_date).toLocaleDateString()}</p>}
              {dream.is_completed && <span className="text-xs text-green-400 mt-2 inline-block">✓ Achieved</span>}
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => { setShowAdd(false); resetForm(); }}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-md glass rounded-2xl border border-[var(--border)] p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold gradient-text">{editing ? 'Edit Dream' : 'Add a Dream'}</h2>
                <button onClick={() => { setShowAdd(false); resetForm(); }}><X className="w-5 h-5 text-[var(--muted-foreground)]" /></button>
              </div>
              <div className="space-y-3">
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What's your dream?" className="w-full h-11 px-4 rounded-lg bg-[var(--muted)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--lavender)] transition" />
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell me more..." rows={3} className="w-full px-4 py-3 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--lavender)] transition resize-none" />
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full h-10 px-3 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--lavender)]">
                  {DREAM_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="w-full h-10 px-3 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--lavender)]" />
                <Button variant="romantic" className="w-full" onClick={saveDream} disabled={saving}>{saving ? 'Saving...' : 'Save Dream'} <Sparkles className="w-4 h-4" /></Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

