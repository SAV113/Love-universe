'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/hooks/use-auth';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { formatDate, getDaysUntil, cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { LoveCapsule } from '@/types/database';
import { Pill, Plus, X, Lock, Unlock, Heart, Clock } from 'lucide-react';

export default function CapsulePage() {
  const { user } = useAuth();
  const [capsules, setCapsules] = useState<LoveCapsule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [viewing, setViewing] = useState<LoveCapsule | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [unlockDate, setUnlockDate] = useState('');
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  const fetchCapsules = async () => {
    const { data } = await supabase.from('love_capsules').select('*').order('unlock_date', { ascending: true });
    setCapsules(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchCapsules(); }, []);

  const createCapsule = async () => {
    if (!title.trim() || !content.trim() || !unlockDate || !user) return;
    setSaving(true);
    await supabase.from('love_capsules').insert({
      title: title.trim(), content: content.trim(), unlock_date: unlockDate, author_id: user.id,
    });
    toast.success('Love capsule sealed! 💊');
    setTitle(''); setContent(''); setUnlockDate('');
    setSaving(false); setShowAdd(false); fetchCapsules();
  };

  const openCapsule = async (capsule: LoveCapsule) => {
    if (new Date(capsule.unlock_date) > new Date()) {
      toast.error(`This capsule unlocks on ${formatDate(capsule.unlock_date)}! 🔒`);
      return;
    }
    if (!capsule.is_opened) {
      await supabase.from('love_capsules').update({ is_opened: true }).eq('id', capsule.id);
      fetchCapsules();
    }
    setViewing(capsule);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold gradient-text flex items-center gap-2"><Pill className="w-6 h-6" /> Love Capsule</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Write a message today, open it in the future.</p>
        </div>
        <Button variant="romantic" onClick={() => setShowAdd(true)}><Plus className="w-4 h-4" /> Create Capsule</Button>
      </div>

      {/* Capsules grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-40 rounded-xl bg-[var(--muted)] animate-pulse" />)}
        </div>
      ) : capsules.length === 0 ? (
        <div className="text-center py-16">
          <Pill className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-4" />
          <p className="text-[var(--muted-foreground)]">No capsules yet. Write a message to your future selves.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {capsules.map((capsule, i) => {
            const isLocked = new Date(capsule.unlock_date) > new Date();
            const daysLeft = getDaysUntil(capsule.unlock_date);

            return (
              <motion.div key={capsule.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                onClick={() => openCapsule(capsule)}
                className={cn(
                  'rounded-xl border p-5 cursor-pointer transition-all hover:scale-[1.02]',
                  isLocked
                    ? 'bg-gradient-to-br from-[var(--deep-purple)] to-[var(--midnight)] border-[var(--lavender)]/20'
                    : capsule.is_opened
                      ? 'glass border-[var(--border)]'
                      : 'glass border-[var(--rose-pink)]/30 glow-pink'
                )}>
                <div className="flex items-center justify-between mb-3">
                  {isLocked ? <Lock className="w-5 h-5 text-[var(--lavender)]" /> : <Unlock className="w-5 h-5 text-[var(--rose-pink)]" />}
                  {capsule.is_opened && <span className="text-[10px] text-green-400">Opened</span>}
                </div>
                <h3 className="font-semibold mb-1">{capsule.title}</h3>
                {isLocked ? (
                  <div>
                    <p className="text-sm text-[var(--muted-foreground)]">Unlocks on {formatDate(capsule.unlock_date)}</p>
                    <p className="text-2xl font-bold gradient-text mt-2">{daysLeft}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">days remaining</p>
                  </div>
                ) : (
                  <p className="text-sm text-[var(--muted-foreground)]">{capsule.is_opened ? 'Tap to read again' : 'Ready to open! 💕'}</p>
                )}
                <p className="text-[10px] text-[var(--muted-foreground)] mt-3 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Created {formatDate(capsule.created_at)}
                </p>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* View capsule modal */}
      <AnimatePresence>
        {viewing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setViewing(null)}>
            <motion.div initial={{ scale: 0.8, rotateX: -20 }} animate={{ scale: 1, rotateX: 0 }}
              transition={{ type: 'spring', damping: 15 }}
              className="max-w-md w-full glass rounded-2xl p-8 border border-[var(--lavender)]/20 text-center"
              onClick={(e) => e.stopPropagation()}>
              <Pill className="w-10 h-10 text-[var(--lavender)] mx-auto mb-4" />
              <h2 className="text-xl font-bold gradient-text mb-2">{viewing.title}</h2>
              <p className="text-xs text-[var(--muted-foreground)] mb-6">Written on {formatDate(viewing.created_at)}</p>
              <p className="text-lg leading-relaxed whitespace-pre-wrap mb-6">{viewing.content}</p>
              <Heart className="w-6 h-6 text-[var(--rose-pink)] mx-auto animate-pulse-soft" fill="currentColor" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create capsule modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowAdd(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="w-full max-w-md glass rounded-2xl border border-[var(--border)] p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold gradient-text">Create Love Capsule</h2>
                <button onClick={() => setShowAdd(false)}><X className="w-5 h-5 text-[var(--muted-foreground)]" /></button>
              </div>
              <div className="space-y-3">
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Capsule title..."
                  className="w-full h-11 px-4 rounded-lg bg-[var(--muted)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--lavender)] transition" />
                <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write a message to your future selves..." rows={5}
                  className="w-full px-4 py-3 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--lavender)] transition resize-none" />
                <div>
                  <label className="text-xs text-[var(--muted-foreground)] mb-1 block">Unlock date</label>
                  <input type="date" value={unlockDate} onChange={(e) => setUnlockDate(e.target.value)}
                    min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                    className="w-full h-10 px-3 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--lavender)]" />
                </div>
                <Button variant="romantic" className="w-full" onClick={createCapsule} disabled={saving}>
                  <Lock className="w-4 h-4" /> {saving ? 'Sealing...' : 'Seal Capsule'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

