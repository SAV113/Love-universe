'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/hooks/use-auth';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { SURPRISE_TYPES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { Surprise } from '@/types/database';
import { Gift, Plus, X, Heart, Sparkles, PartyPopper } from 'lucide-react';

export default function SurprisesPage() {
  const { user, settings } = useAuth();
  const [surprises, setSurprises] = useState<Surprise[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [revealed, setRevealed] = useState<Surprise | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const [surpriseType, setSurpriseType] = useState('message');
  const [content, setContent] = useState('');
  const [unlockDate, setUnlockDate] = useState('');
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  const fetchSurprises = async () => {
    const { data } = await supabase.from('surprises').select('*').order('created_at', { ascending: false });
    setSurprises(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchSurprises(); }, []);

  const addSurprise = async () => {
    if (!content.trim() || !user) return;
    setSaving(true);
    await supabase.from('surprises').insert({
      surprise_type: surpriseType,
      content: content.trim(),
      unlock_date: unlockDate || null,
      author_id: user.id,
    });
    toast.success('Surprise created! 🎁');
    setContent(''); setSurpriseType('message'); setUnlockDate('');
    setSaving(false); setShowAdd(false); fetchSurprises();
  };

  const revealSurprise = async (surprise: Surprise) => {
    if (surprise.unlock_date && new Date(surprise.unlock_date) > new Date()) {
      toast.error('This surprise isn\'t ready yet! 🎁');
      return;
    }
    setIsRevealing(true);
    // Dramatic reveal animation
    setTimeout(() => {
      setRevealed(surprise);
      setIsRevealing(false);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      if (!surprise.is_revealed) {
        supabase.from('surprises').update({ is_revealed: true }).eq('id', surprise.id).then(() => fetchSurprises());
      }
    }, 1500);
  };

  const getRandomUnrevealedSurprise = () => {
    const unrevealed = surprises.filter((s) => !s.is_revealed && (!s.unlock_date || new Date(s.unlock_date) <= new Date()));
    if (unrevealed.length === 0) {
      // Fall back to any surprise
      if (surprises.length > 0) revealSurprise(surprises[Math.floor(Math.random() * surprises.length)]);
      else toast.info('No surprises yet!');
      return;
    }
    revealSurprise(unrevealed[Math.floor(Math.random() * unrevealed.length)]);
  };

  const anniversaryLocked = surprises.filter((s) => s.unlock_date && s.unlock_date === settings?.anniversary_date);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold gradient-text flex items-center gap-2"><Gift className="w-6 h-6" /> The Surprise Room</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Every gift box holds something special.</p>
        </div>
        <Button variant="romantic" onClick={() => setShowAdd(true)}><Plus className="w-4 h-4" /> Create Surprise</Button>
      </div>

      {/* Mystery Gift Box */}
      <motion.div
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--deep-purple)] to-[var(--midnight)] p-12 border border-[var(--lavender)]/20 text-center cursor-pointer"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={getRandomUnrevealedSurprise}
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--rose-pink)] opacity-[0.04] blur-[100px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--lavender)] opacity-[0.04] blur-[80px] rounded-full" />

        <AnimatePresence mode="wait">
          {isRevealing ? (
            <motion.div key="revealing" initial={{ scale: 1 }} animate={{ scale: [1, 1.2, 0.8, 1.1, 1], rotate: [0, -5, 5, -3, 0] }} transition={{ duration: 1.5 }}>
              <Gift className="w-24 h-24 text-[var(--lavender)] mx-auto animate-pulse-soft" />
              <p className="text-lg text-[var(--muted-foreground)] mt-4">Opening your surprise...</p>
            </motion.div>
          ) : (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Gift className="w-24 h-24 text-[var(--lavender)] mx-auto mb-4" />
              <h2 className="text-2xl font-bold gradient-text mb-2">Tap the Gift Box</h2>
              <p className="text-sm text-[var(--muted-foreground)]">Discover a surprise waiting just for you</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Surprises grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="aspect-square rounded-xl bg-[var(--muted)] animate-pulse" />)}
        </div>
      ) : surprises.length > 0 && (
        <>
          <h3 className="text-sm font-medium text-[var(--muted-foreground)]">All Surprises ({surprises.length})</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {surprises.map((s, i) => {
              const locked = s.unlock_date && new Date(s.unlock_date) > new Date();
              const typeInfo = SURPRISE_TYPES.find((t) => t.value === s.surprise_type);
              return (
                <motion.div key={s.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                  onClick={() => revealSurprise(s)}
                  className={cn(
                    'aspect-square rounded-xl border flex flex-col items-center justify-center p-4 cursor-pointer transition-all hover:scale-105',
                    s.is_revealed ? 'glass border-[var(--border)]' : 'bg-gradient-to-br from-[var(--deep-purple)] to-[var(--midnight)] border-[var(--lavender)]/20',
                    locked && 'opacity-60'
                  )}>
                  <span className="text-3xl mb-2">{locked ? '🔒' : typeInfo?.icon}</span>
                  <p className="text-xs text-center text-[var(--muted-foreground)]">
                    {locked ? 'Locked' : s.is_revealed ? 'Revealed' : 'Tap to open'}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </>
      )}

      {/* Confetti overlay */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 pointer-events-none z-[60]">
            {Array.from({ length: 40 }).map((_, i) => (
              <motion.div key={i} className="absolute"
                initial={{ x: '50vw', y: '40vh', opacity: 1 }}
                animate={{
                  x: `${Math.random() * 100}vw`,
                  y: `${Math.random() * 100}vh`,
                  opacity: 0,
                  rotate: Math.random() * 720,
                }}
                transition={{ duration: 2 + Math.random(), ease: 'easeOut' }}
                style={{ fontSize: 12 + Math.random() * 16, color: ['#C8B6FF', '#FFB7C5', '#FFD700', '#FF69B4', '#87CEEB'][Math.floor(Math.random() * 5)] }}
              >
                {['♥', '✨', '⭐', '💕', '🎉'][Math.floor(Math.random() * 5)]}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reveal modal */}
      <AnimatePresence>
        {revealed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => setRevealed(null)}>
            <motion.div initial={{ scale: 0, rotateY: -180 }} animate={{ scale: 1, rotateY: 0 }}
              transition={{ type: 'spring', damping: 15 }}
              className="max-w-md w-full glass rounded-2xl p-8 text-center border border-[var(--lavender)]/20"
              onClick={(e) => e.stopPropagation()}>
              <span className="text-5xl block mb-4">{SURPRISE_TYPES.find((t) => t.value === revealed.surprise_type)?.icon}</span>
              <h2 className="text-xl font-bold gradient-text mb-4">{SURPRISE_TYPES.find((t) => t.value === revealed.surprise_type)?.label}</h2>
              <p className="text-lg leading-relaxed mb-6">{revealed.content}</p>
              {revealed.surprise_type === 'hug' && (
                <div className="my-4">
                  <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                    <span className="text-6xl">🤗</span>
                  </motion.div>
                  <p className="text-sm text-[var(--rose-pink)] mt-2">Sending you the biggest virtual hug! ♥</p>
                </div>
              )}
              <Button variant="romantic" onClick={() => setRevealed(null)}>
                <Heart className="w-4 h-4" fill="currentColor" /> Close
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Surprise Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowAdd(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="w-full max-w-md glass rounded-2xl border border-[var(--border)] p-6"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold gradient-text">Create a Surprise</h2>
                <button onClick={() => setShowAdd(false)}><X className="w-5 h-5 text-[var(--muted-foreground)]" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-[var(--muted-foreground)] mb-2 block">Surprise Type</label>
                  <div className="flex gap-2 flex-wrap">
                    {SURPRISE_TYPES.map((t) => (
                      <button key={t.value} onClick={() => setSurpriseType(t.value)}
                        className={cn('px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition',
                          surpriseType === t.value ? 'bg-[var(--lavender)]/20 text-[var(--lavender)] ring-1 ring-[var(--lavender)]' : 'bg-[var(--muted)] text-[var(--muted-foreground)]')}>
                        {t.icon} {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write the surprise content..." rows={4}
                  className="w-full px-4 py-3 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--lavender)] transition resize-none" />
                <div>
                  <label className="text-xs text-[var(--muted-foreground)] mb-1 block">Lock until date (optional)</label>
                  <input type="date" value={unlockDate} onChange={(e) => setUnlockDate(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--lavender)]" />
                </div>
                <Button variant="romantic" className="w-full" onClick={addSurprise} disabled={saving}>
                  <Gift className="w-4 h-4" /> {saving ? 'Creating...' : 'Create Surprise'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

