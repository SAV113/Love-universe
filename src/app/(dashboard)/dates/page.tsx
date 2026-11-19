'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/hooks/use-auth';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { DATE_IDEAS } from '@/lib/constants';
import { formatDate, getDaysUntil, cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { DatePlan } from '@/types/database';
import { CalendarHeart, Plus, X, MapPin, Clock, DollarSign, Check, Trash2, Edit, Heart, Lightbulb } from 'lucide-react';

export default function DatesPage() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<DatePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editing, setEditing] = useState<DatePlan | null>(null);
  const [tab, setTab] = useState<'upcoming' | 'ideas' | 'completed'>('upcoming');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [notes, setNotes] = useState('');
  const [isIdea, setIsIdea] = useState(false);
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  const fetchPlans = async () => {
    const { data } = await supabase.from('date_plans').select('*').order('date', { ascending: true });
    setPlans(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchPlans(); }, []);

  const resetForm = () => {
    setTitle(''); setDescription(''); setDate(''); setTime(''); setLocation('');
    setBudget(''); setNotes(''); setIsIdea(false); setEditing(null);
  };

  const openEditor = (plan?: DatePlan, asIdea?: boolean) => {
    if (plan) {
      setEditing(plan); setTitle(plan.title); setDescription(plan.description || '');
      setDate(plan.date || ''); setTime(plan.time || ''); setLocation(plan.location || '');
      setBudget(plan.budget?.toString() || ''); setNotes(plan.notes || ''); setIsIdea(plan.is_idea);
    } else { resetForm(); if (asIdea) setIsIdea(true); }
    setShowEditor(true);
  };

  const savePlan = async () => {
    if (!title.trim() || !user) return;
    setSaving(true);
    const d = {
      title: title.trim(), description: description || null, date: date || null,
      time: time || null, location: location || null, budget: budget ? parseFloat(budget) : null,
      notes: notes || null, is_idea: isIdea, author_id: user.id,
    };
    if (editing) { await supabase.from('date_plans').update(d).eq('id', editing.id); toast.success('Updated'); }
    else { await supabase.from('date_plans').insert(d); toast.success(isIdea ? 'Idea saved!' : 'Date planned ♥'); }
    setSaving(false); setShowEditor(false); resetForm(); fetchPlans();
  };

  const toggleComplete = async (plan: DatePlan) => {
    await supabase.from('date_plans').update({ is_completed: !plan.is_completed }).eq('id', plan.id);
    toast.success(plan.is_completed ? 'Marked as upcoming' : 'Date completed! ♥');
    fetchPlans();
  };

  const deletePlan = async (id: string) => {
    await supabase.from('date_plans').delete().eq('id', id);
    toast.success('Removed'); fetchPlans();
  };

  const upcoming = plans.filter((p) => !p.is_completed && !p.is_idea);
  const ideas = plans.filter((p) => p.is_idea && !p.is_completed);
  const completed = plans.filter((p) => p.is_completed);
  const nextDate = upcoming.find((p) => p.date && new Date(p.date) >= new Date());

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold gradient-text flex items-center gap-2"><CalendarHeart className="w-6 h-6" /> Date Planner</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Plan beautiful moments together.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => openEditor(undefined, true)}><Lightbulb className="w-4 h-4" /> Save Idea</Button>
          <Button variant="romantic" onClick={() => openEditor()}><Plus className="w-4 h-4" /> Plan Date</Button>
        </div>
      </div>

      {/* Next date countdown */}
      {nextDate && nextDate.date && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 border border-[var(--rose-pink)]/20 bg-gradient-to-br from-[var(--deep-purple)] to-[var(--midnight)] text-center">
          <Heart className="w-6 h-6 text-[var(--rose-pink)] mx-auto mb-2 animate-pulse-soft" fill="currentColor" />
          <p className="text-sm text-[var(--muted-foreground)]">Next Date</p>
          <h3 className="text-xl font-bold gradient-text">{nextDate.title}</h3>
          <p className="text-3xl font-bold text-[var(--rose-pink)] mt-2">{getDaysUntil(nextDate.date)}</p>
          <p className="text-xs text-[var(--muted-foreground)]">days away</p>
          {nextDate.location && <p className="text-xs text-[var(--muted-foreground)] mt-2 flex items-center justify-center gap-1"><MapPin className="w-3 h-3" />{nextDate.location}</p>}
        </motion.div>
      )}

      {/* Date Ideas Suggestions */}
      <div className="glass rounded-xl p-5 border border-[var(--border)]">
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2"><Lightbulb className="w-4 h-4 text-[var(--lavender)]" /> Quick Date Ideas</h3>
        <div className="flex gap-2 flex-wrap">
          {DATE_IDEAS.map((idea) => (
            <button key={idea.title} onClick={() => { setTitle(idea.title); setDescription(idea.description); setIsIdea(true); setShowEditor(true); }}
              className="px-3 py-1.5 rounded-full text-xs bg-[var(--muted)] hover:bg-[var(--lavender)]/10 transition border border-[var(--border)] hover:border-[var(--lavender)]/30">
              {idea.icon} {idea.title}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-[var(--muted)] p-1">
        {(['upcoming', 'ideas', 'completed'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={cn('flex-1 py-2 rounded-md text-sm transition capitalize', tab === t ? 'bg-[var(--card)] shadow-sm text-[var(--foreground)]' : 'text-[var(--muted-foreground)]')}>
            {t} ({t === 'upcoming' ? upcoming.length : t === 'ideas' ? ideas.length : completed.length})
          </button>
        ))}
      </div>

      {/* Plans list */}
      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-xl bg-[var(--muted)] animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          {(tab === 'upcoming' ? upcoming : tab === 'ideas' ? ideas : completed).map((plan, i) => (
            <motion.div key={plan.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass rounded-xl border border-[var(--border)] hover:border-[var(--lavender)]/20 transition p-5 group">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className={cn('font-semibold', plan.is_completed && 'line-through opacity-60')}>{plan.title}</h3>
                  {plan.description && <p className="text-sm text-[var(--muted-foreground)] mt-1">{plan.description}</p>}
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-[var(--muted-foreground)]">
                    {plan.date && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(plan.date)}</span>}
                    {plan.time && <span>{plan.time}</span>}
                    {plan.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{plan.location}</span>}
                    {plan.budget && <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{plan.budget}</span>}
                  </div>
                  {plan.notes && <p className="text-xs text-[var(--muted-foreground)] mt-2 italic">{plan.notes}</p>}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => toggleComplete(plan)} className="p-1.5 rounded-lg hover:bg-[var(--muted)]"><Check className={cn('w-4 h-4', plan.is_completed ? 'text-green-400' : 'text-[var(--muted-foreground)]')} /></button>
                  <button onClick={() => openEditor(plan)} className="p-1.5 rounded-lg hover:bg-[var(--muted)]"><Edit className="w-3.5 h-3.5 text-[var(--muted-foreground)]" /></button>
                  <button onClick={() => deletePlan(plan.id)} className="p-1.5 rounded-lg hover:bg-[var(--muted)]"><Trash2 className="w-3.5 h-3.5 text-[var(--muted-foreground)]" /></button>
                </div>
              </div>
            </motion.div>
          ))}
          {(tab === 'upcoming' ? upcoming : tab === 'ideas' ? ideas : completed).length === 0 && (
            <div className="text-center py-12">
              <CalendarHeart className="w-10 h-10 text-[var(--muted-foreground)] mx-auto mb-3" />
              <p className="text-sm text-[var(--muted-foreground)]">{tab === 'upcoming' ? 'No upcoming dates planned.' : tab === 'ideas' ? 'No saved ideas.' : 'No completed dates yet.'}</p>
            </div>
          )}
        </div>
      )}

      {/* Editor Modal */}
      <AnimatePresence>
        {showEditor && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => { setShowEditor(false); resetForm(); }}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-lg glass rounded-2xl border border-[var(--border)] p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold gradient-text">{editing ? 'Edit' : isIdea ? 'Save Date Idea' : 'Plan a Date'}</h2>
                <button onClick={() => { setShowEditor(false); resetForm(); }}><X className="w-5 h-5 text-[var(--muted-foreground)]" /></button>
              </div>
              <div className="space-y-3">
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Date title..." className="w-full h-11 px-4 rounded-lg bg-[var(--muted)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--lavender)] transition" />
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description..." rows={3} className="w-full px-4 py-3 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--lavender)] transition resize-none" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-10 px-3 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--lavender)]" />
                  <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="h-10 px-3 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--lavender)]" />
                </div>
                <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location..." className="w-full h-10 px-4 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--lavender)]" />
                <input value={budget} onChange={(e) => setBudget(e.target.value)} type="number" placeholder="Budget (optional)" className="w-full h-10 px-4 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--lavender)]" />
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes..." rows={2} className="w-full px-4 py-3 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--lavender)] transition resize-none" />
                <Button variant="romantic" className="w-full" onClick={savePlan} disabled={saving}>{saving ? 'Saving...' : 'Save'} <Heart className="w-4 h-4" /></Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
