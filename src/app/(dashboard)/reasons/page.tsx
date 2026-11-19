'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/hooks/use-auth';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { getRandomItem, cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { LoveReason } from '@/types/database';
import { Heart, Plus, X, Star, Trash2, Shuffle, Sparkles } from 'lucide-react';

export default function ReasonsPage() {
  const { user } = useAuth();
  const [reasons, setReasons] = useState<LoveReason[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [highlight, setHighlight] = useState<LoveReason | null>(null);
  const [reason, setReason] = useState('');
  const [category, setCategory] = useState('');
  const [saving, setSaving] = useState(false);
  const [flipped, setFlipped] = useState<Set<string>>(new Set());

  const supabase = createClient();

  const fetchReasons = async () => {
    const { data } = await supabase.from('love_reasons').select('*').order('created_at', { ascending: false });
    setReasons(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchReasons(); }, []);

  const addReason = async () => {
    if (!reason.trim() || !user) return;
    setSaving(true);
    await supabase.from('love_reasons').insert({ reason: reason.trim(), category: category || null, author_id: user.id });
    toast.success('Reason added ♥');
    setReason(''); setCategory(''); setSaving(false); setShowAdd(false);
    fetchReasons();
  };

  const deleteReason = async (id: string) => {
    await supabase.from('love_reasons').delete().eq('id', id);
    toast.success('Removed'); fetchReasons();
  };

  const toggleFav = async (r: LoveReason) => {
    await supabase.from('love_reasons').update({ is_favorite: !r.is_favorite }).eq('id', r.id);
    fetchReasons();
  };

  const showRandom = () => {
    if (reasons.length === 0) return;
    setHighlight(getRandomItem(reasons));
  };

  const toggleFlip = (id: string) => {
    setFlipped((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold gradient-text flex items-center gap-2"><Heart className="w-6 h-6" /> Why I Love You</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Every reason, written from the heart.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={showRandom}><Shuffle className="w-4 h-4" /> Remind Me</Button>
          <Button variant="romantic" onClick={() => setShowAdd(true)}><Plus className="w-4 h-4" /> Add Reason</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="glass rounded-xl p-5 border border-[var(--border)] text-center">
        <p className="text-4xl font-bold gradient-text">{reasons.length}</p>
        <p className="text-sm text-[var(--muted-foreground)]">reasons and counting... ♥</p>
      </div>

      {/* Random highlight */}
      <AnimatePresence>
        {highlight && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setHighlight(null)}>
            <motion.div initial={{ rotateY: -90 }} animate={{ rotateY: 0 }} transition={{ type: 'spring', damping: 15 }}
              className="max-w-md w-full glass rounded-2xl p-8 text-center border border-[var(--border)]" onClick={(e) => e.stopPropagation()}>
              <Heart className="w-12 h-12 text-[var(--rose-pink)] mx-auto mb-4 animate-heart-beat" fill="currentColor" />
              <p className="text-2xl font-bold gradient-text mb-4">{highlight.reason}</p>
              <Button variant="romantic" onClick={showRandom}><Sparkles className="w-4 h-4" /> One More Reason</Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reasons Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-32 rounded-xl bg-[var(--muted)] animate-pulse" />)}
        </div>
      ) : reasons.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-4" />
          <p className="text-[var(--muted-foreground)]">Start adding reasons why you love them.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reasons.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              onClick={() => toggleFlip(r.id)}
              className="glass rounded-xl border border-[var(--border)] hover:border-[var(--rose-pink)]/30 transition-all cursor-pointer p-5 min-h-[120px] flex flex-col justify-between group"
              style={{ perspective: '1000px' }}
            >
              <div>
                <Heart className="w-4 h-4 text-[var(--rose-pink)] mb-2" fill="currentColor" />
                <p className="text-sm leading-relaxed">{r.reason}</p>
                {r.category && <span className="text-[10px] text-[var(--lavender)] mt-2 inline-block">{r.category}</span>}
              </div>
              <div className="flex gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => { e.stopPropagation(); toggleFav(r); }} className="p-1 hover:text-[var(--rose-pink)]">
                  <Star className="w-3 h-3" fill={r.is_favorite ? 'currentColor' : 'none'} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); deleteReason(r.id); }} className="p-1 hover:text-[var(--destructive)]">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowAdd(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-md glass rounded-2xl border border-[var(--border)] p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold gradient-text">Add a Reason</h2>
                <button onClick={() => setShowAdd(false)}><X className="w-5 h-5 text-[var(--muted-foreground)]" /></button>
              </div>
              <div className="space-y-3">
                <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="I love you because..." rows={3} className="w-full px-4 py-3 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--lavender)] transition resize-none" />
                <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category (optional)" className="w-full h-10 px-4 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--lavender)]" />
                <Button variant="romantic" className="w-full" onClick={addReason} disabled={saving}>
                  {saving ? 'Adding...' : 'Add Reason'} <Heart className="w-4 h-4" fill="currentColor" />
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

