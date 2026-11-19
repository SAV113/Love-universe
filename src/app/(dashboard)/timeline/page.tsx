'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/hooks/use-auth';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { formatDate, cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { RelationshipMilestone } from '@/types/database';
import { Clock, Plus, X, Heart, Trash2, Edit, Calendar, MapPin } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

export default function TimelinePage() {
  const { user, settings } = useAuth();
  const [milestones, setMilestones] = useState<RelationshipMilestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<RelationshipMilestone | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [icon, setIcon] = useState('💕');
  const [saving, setSaving] = useState(false);

  const supabase = createClient();
  const fetchMilestones = async () => {
    const { data } = await supabase.from('relationship_milestones').select('*').order('date', { ascending: true });
    setMilestones(data || []);
    setLoading(false);
  };
  useEffect(() => { fetchMilestones(); }, []);

  const resetForm = () => { setTitle(''); setDescription(''); setDate(''); setIcon('💕'); setEditing(null); };
  const openEditor = (m?: RelationshipMilestone) => {
    if (m) { setEditing(m); setTitle(m.title); setDescription(m.description || ''); setDate(m.date); setIcon(m.icon || '💕'); }
    else resetForm();
    setShowAdd(true);
  };

  const saveMilestone = async () => {
    if (!title.trim() || !date || !user) return;
    setSaving(true);
    const d = { title: title.trim(), description: description || null, date, icon, author_id: user.id };
    if (editing) { await supabase.from('relationship_milestones').update(d).eq('id', editing.id); toast.success('Updated'); }
    else { await supabase.from('relationship_milestones').insert(d); toast.success('Milestone added ♥'); }
    setSaving(false); setShowAdd(false); resetForm(); fetchMilestones();
  };

  const deleteMilestone = async (id: string) => {
    await supabase.from('relationship_milestones').delete().eq('id', id);
    toast.success('Removed'); fetchMilestones();
  };

  const milestoneIcons = ['💕', '💍', '🎉', '✈️', '🏠', '📸', '🎵', '🌹', '⭐', '🎂', '🤝', '💋'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold gradient-text flex items-center gap-2"><Clock className="w-6 h-6" /> Our Timeline</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Every milestone in our journey together.</p>
        </div>
        <Button variant="romantic" onClick={() => openEditor()}><Plus className="w-4 h-4" /> Add Milestone</Button>
      </div>

      {/* Anniversary counter */}
      {settings?.anniversary_date && (
        <div className="glass rounded-xl p-5 border border-[var(--border)] text-center">
          <Calendar className="w-5 h-5 text-[var(--rose-pink)] mx-auto mb-2" />
          <p className="text-sm text-[var(--muted-foreground)]">Our story began on</p>
          <p className="text-lg font-bold gradient-text">{formatDate(settings.anniversary_date)}</p>
        </div>
      )}

      {loading ? (
        <div className="space-y-6">{[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-xl bg-[var(--muted)] animate-pulse" />)}</div>
      ) : milestones.length === 0 ? (
        <div className="text-center py-16">
          <Clock className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-4" />
          <p className="text-[var(--muted-foreground)]">Start documenting your journey together.</p>
        </div>
      ) : (
        <div className="relative pl-8 border-l-2 border-[var(--lavender)]/30 space-y-8">
          {milestones.map((m, i) => (
            <motion.div key={m.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="relative group">
              <div className="absolute -left-[calc(2rem+9px)] w-5 h-5 rounded-full bg-[var(--card)] border-2 border-[var(--lavender)] flex items-center justify-center text-[10px]">
                {m.icon || '💕'}
              </div>
              <div className="glass rounded-xl border border-[var(--border)] hover:border-[var(--lavender)]/30 transition p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-[var(--lavender)] mb-1">{formatDate(m.date)}</p>
                    <h3 className="font-semibold text-lg">{m.title}</h3>
                    {m.description && <p className="text-sm text-[var(--muted-foreground)] mt-1">{m.description}</p>}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEditor(m)} className="p-1.5 rounded-lg hover:bg-[var(--muted)]"><Edit className="w-3.5 h-3.5 text-[var(--muted-foreground)]" /></button>
                    <button onClick={() => deleteMilestone(m.id)} className="p-1.5 rounded-lg hover:bg-[var(--muted)]"><Trash2 className="w-3.5 h-3.5 text-[var(--muted-foreground)]" /></button>
                  </div>
                </div>
              </div>
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
                <h2 className="text-lg font-bold gradient-text">{editing ? 'Edit Milestone' : 'New Milestone'}</h2>
                <button onClick={() => { setShowAdd(false); resetForm(); }}><X className="w-5 h-5 text-[var(--muted-foreground)]" /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-[var(--muted-foreground)] mb-2 block">Icon</label>
                  <div className="flex gap-1 flex-wrap">
                    {milestoneIcons.map((ic) => (
                      <button key={ic} onClick={() => setIcon(ic)} className={cn('w-8 h-8 rounded-lg flex items-center justify-center transition', icon === ic ? 'bg-[var(--lavender)]/20 ring-2 ring-[var(--lavender)]' : 'hover:bg-[var(--muted)]')}>{ic}</button>
                    ))}
                  </div>
                </div>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Milestone title..." className="w-full h-11 px-4 rounded-lg bg-[var(--muted)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--lavender)] transition" />
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description..." rows={3} className="w-full px-4 py-3 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--lavender)] transition resize-none" />
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full h-10 px-3 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--lavender)]" />
                <Button variant="romantic" className="w-full" onClick={saveMilestone} disabled={saving}>{saving ? 'Saving...' : 'Save Milestone'}</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

