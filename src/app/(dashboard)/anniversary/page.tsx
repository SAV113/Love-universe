'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Heart, Sparkles, Lock, Gift, PartyPopper, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function AnniversaryPage() {
  const { settings } = useAuth();
  const [unlocked, setUnlocked] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  const annivDateStr = settings?.anniversary_date || '2025-01-01';

  useEffect(() => {
    const checkAnniv = () => {
      const now = new Date();
      const target = new Date(annivDateStr);
      // Check if today matches anniversary month & day
      const isToday = now.getMonth() === target.getMonth() && now.getDate() === target.getDate();
      if (isToday) {
        setUnlocked(true);
      }

      // Next occurrence countdown
      let nextAnniv = new Date(now.getFullYear(), target.getMonth(), target.getDate());
      if (nextAnniv.getTime() < now.getTime()) {
        nextAnniv.setFullYear(now.getFullYear() + 1);
      }

      const diff = Math.max(0, nextAnniv.getTime() - now.getTime());
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / 1000 / 60) % 60);
      const s = Math.floor((diff / 1000) % 60);
      setCountdown({ days: d, hours: h, mins: m, secs: s });
    };

    checkAnniv();
    const interval = setInterval(checkAnniv, 1000);
    return () => clearInterval(interval);
  }, [annivDateStr]);

  return (
    <div className="max-w-3xl mx-auto space-y-8 text-center py-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold gradient-text flex items-center justify-center gap-2">
          <PartyPopper className="w-7 h-7 text-[var(--rose-pink)]" /> Anniversary Sanctuary
        </h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          A magical tribute crafted exclusively for our special milestone.
        </p>
      </div>

      {!unlocked ? (
        /* Locked State */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--deep-purple)] via-[#141226] to-[var(--midnight)] p-10 sm:p-16 border border-[var(--border)] shadow-2xl space-y-6"
        >
          <div className="w-20 h-20 rounded-full bg-[var(--lavender)]/10 border border-[var(--lavender)]/20 mx-auto flex items-center justify-center">
            <Lock className="w-9 h-9 text-[var(--lavender)]" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-[var(--foreground)]">Sealed Until Our Anniversary</h2>
            <p className="text-sm text-[var(--muted-foreground)] max-w-md mx-auto mt-2">
              This cinematic time capsule unlocks on our official anniversary date: <span className="text-[var(--lavender)] font-semibold">{formatDate(annivDateStr)}</span>.
            </p>
          </div>

          {/* Countdown Clock */}
          <div className="grid grid-cols-4 gap-3 max-w-md mx-auto py-4">
            {[
              { val: countdown.days, label: 'Days' },
              { val: countdown.hours, label: 'Hours' },
              { val: countdown.mins, label: 'Minutes' },
              { val: countdown.secs, label: 'Seconds' },
            ].map((slot) => (
              <div key={slot.label} className="glass rounded-xl p-3 border border-[var(--border)]">
                <span className="text-2xl sm:text-3xl font-bold gradient-text block">{slot.val}</span>
                <span className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider">{slot.label}</span>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUnlocked(true)}
              className="text-xs text-[var(--muted-foreground)] border-dashed hover:text-[var(--foreground)]"
            >
              (Preview Mode — Unlock Early)
            </Button>
          </div>
        </motion.div>
      ) : (
        /* Unlocked Cinematic Experience */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2f183f] via-[#1a122e] to-[#0B0B14] p-10 sm:p-16 border border-[var(--rose-pink)]/30 shadow-2xl space-y-8"
        >
          {/* Floating Confetti Hearts */}
          {Array.from({ length: 16 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: 0, opacity: 0.8 }}
              animate={{ y: -200, opacity: 0 }}
              transition={{ repeat: Infinity, duration: 4 + Math.random() * 3, delay: Math.random() * 2 }}
              className="absolute text-[var(--rose-pink)] pointer-events-none select-none"
              style={{
                left: `${10 + Math.random() * 80}%`,
                bottom: '10px',
                fontSize: `${14 + Math.random() * 16}px`,
              }}
            >
              ♥
            </motion.div>
          ))}

          <Heart className="w-20 h-20 text-[var(--rose-pink)] mx-auto animate-heart-beat" fill="currentColor" />

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--lavender)]">Happy Anniversary</span>
            <h2 className="text-3xl sm:text-5xl font-black gradient-text">
              To Another Year Of Loving You
            </h2>
          </div>

          <p className="text-base sm:text-lg text-[var(--warm-cream)]/90 leading-relaxed max-w-xl mx-auto italic font-serif">
            &ldquo;From the first moment our paths crossed to right now, loving you has been the easiest, sweetest, and most wonderful journey of my life. Thank you for filling my days with warmth and making this world our little universe.&rdquo;
          </p>

          <div className="glass rounded-2xl p-6 border border-[var(--border)] max-w-md mx-auto text-center space-y-2">
            <Sparkles className="w-5 h-5 text-[var(--lavender)] mx-auto" />
            <p className="text-sm font-semibold gradient-text">Forever and Always</p>
            <p className="text-xs text-[var(--muted-foreground)]">
              {settings?.owner_name || 'Benjamin'} & {settings?.partner_name || 'My Love'}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

