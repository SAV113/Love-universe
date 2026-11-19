'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/hooks/use-auth';
import { createClient } from '@/lib/supabase/client';
import { getRelativeDuration, getRandomItem } from '@/lib/utils';
import { ROMANTIC_QUOTES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import {
  Heart, Mail, Image, BookHeart, Gift, Sparkles,
  CalendarHeart, Clock, ArrowRight, X
} from 'lucide-react';

export default function HomePage() {
  const { settings, profile } = useAuth();
  const [duration, setDuration] = useState({ years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0, totalDays: 0 });
  const [quote, setQuote] = useState('');
  const [showLoved, setShowLoved] = useState(false);
  const [recentMemories, setRecentMemories] = useState<any[]>([]);
  const [upcomingDates, setUpcomingDates] = useState<any[]>([]);

  // Daily quote based on date
  useEffect(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    setQuote(ROMANTIC_QUOTES[dayOfYear % ROMANTIC_QUOTES.length]);
  }, []);

  // Live counter
  useEffect(() => {
    if (!settings?.anniversary_date) return;
    const tick = () => setDuration(getRelativeDuration(settings.anniversary_date));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [settings?.anniversary_date]);

  // Fetch data
  useEffect(() => {
    const supabase = createClient();
    supabase.from('memories').select('*').order('created_at', { ascending: false }).limit(4)
      .then(({ data }) => setRecentMemories(data || []));
    supabase.from('special_dates').select('*').gte('date', new Date().toISOString().split('T')[0]).order('date').limit(3)
      .then(({ data }) => setUpcomingDates(data || []));
  }, []);

  const partnerName = settings?.partner_name || 'My Love';
  const ownerName = settings?.owner_name || 'Benjamin';
  const isOwner = profile?.role === 'owner';
  const displayName = isOwner ? partnerName : ownerName;

  const quickActions = [
    { href: '/letters', label: 'Write a Love Letter', icon: Mail, color: 'from-purple-500/20 to-pink-500/20' },
    { href: '/memories', label: 'Add a Memory', icon: Image, color: 'from-blue-500/20 to-cyan-500/20' },
    { href: '/journal', label: 'How I Feel', icon: BookHeart, color: 'from-green-500/20 to-emerald-500/20' },
    { href: '/surprises', label: 'Surprise Me', icon: Gift, color: 'from-amber-500/20 to-orange-500/20' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--deep-purple)] to-[var(--midnight)] p-8 border border-[var(--border)]"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--rose-pink)] opacity-[0.06] blur-[80px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[var(--lavender)] opacity-[0.06] blur-[60px] rounded-full" />

        <div className="relative z-10">
          <p className="text-[var(--muted-foreground)] text-sm mb-1">Hey, {displayName} ♥</p>
          <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-2">
            Welcome to our little universe.
          </h1>
          <p className="text-[var(--muted-foreground)] max-w-md">
            {settings?.greeting_message || 'Every moment with you is a memory I treasure.'}
          </p>

          {/* Couple display */}
          <div className="flex items-center gap-4 mt-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--lavender)] to-[var(--rose-pink)] flex items-center justify-center text-lg font-bold text-[var(--midnight)]">
                {ownerName.charAt(0)}
              </div>
              <span className="text-sm font-medium">{ownerName}</span>
            </div>
            <Heart className="w-5 h-5 text-[var(--rose-pink)] animate-pulse-soft" fill="currentColor" />
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--rose-pink)] to-[var(--lavender)] flex items-center justify-center text-lg font-bold text-[var(--midnight)]">
                {partnerName.charAt(0)}
              </div>
              <span className="text-sm font-medium">{partnerName}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Relationship Counter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-6 border border-[var(--border)]"
      >
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-[var(--lavender)]" />
          <h2 className="text-sm font-medium text-[var(--muted-foreground)]">Together for</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { value: duration.years, label: 'Years' },
            { value: duration.months, label: 'Months' },
            { value: duration.days, label: 'Days' },
            { value: duration.hours, label: 'Hours' },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <p className="text-3xl sm:text-4xl font-bold gradient-text">{item.value}</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">{item.label}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-[var(--muted-foreground)] mt-4">
          That&apos;s <span className="text-[var(--rose-pink)] font-medium">{duration.totalDays.toLocaleString()}</span> days of loving you ♥
        </p>
      </motion.div>

      {/* Daily Quote */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-2xl p-6 border border-[var(--border)] text-center"
      >
        <Sparkles className="w-5 h-5 text-[var(--lavender)] mx-auto mb-3" />
        <p className="text-lg italic text-[var(--foreground)] max-w-lg mx-auto">&ldquo;{quote}&rdquo;</p>
        <p className="text-xs text-[var(--muted-foreground)] mt-3">Today&apos;s Love Quote</p>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {quickActions.map((action, i) => (
          <motion.div
            key={action.href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.05 }}
          >
            <Link href={action.href}>
              <div className={`glass rounded-xl p-5 border border-[var(--border)] hover:border-[var(--lavender)]/30 transition-all group cursor-pointer bg-gradient-to-br ${action.color}`}>
                <action.icon className="w-6 h-6 text-[var(--lavender)] mb-3 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium">{action.label}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* You Are Loved Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex justify-center"
      >
        <Button variant="romantic" size="lg" onClick={() => setShowLoved(true)} className="group">
          <Heart className="w-4 h-4 group-hover:animate-heart-beat" fill="currentColor" />
          You Are Loved
        </Button>
      </motion.div>

      {/* "You Are Loved" overlay */}
      <AnimatePresence>
        {showLoved && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--midnight)]/90 backdrop-blur-sm"
            onClick={() => setShowLoved(false)}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', damping: 15 }}
              className="text-center px-8"
              onClick={(e) => e.stopPropagation()}
            >
              <Heart className="w-20 h-20 text-[var(--rose-pink)] mx-auto mb-6 animate-heart-beat" fill="currentColor" />
              <h2 className="text-4xl sm:text-5xl font-bold gradient-text mb-4">You are so loved</h2>
              <p className="text-lg text-[var(--muted-foreground)] max-w-md mx-auto mb-8">
                Never forget that someone in this world thinks you&apos;re the most amazing person alive. You are my everything. ♥
              </p>
              <button
                onClick={() => setShowLoved(false)}
                className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition"
              >
                <X className="w-6 h-6 mx-auto" />
              </button>
              {/* Floating hearts */}
              {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-[var(--rose-pink)] pointer-events-none"
                  initial={{ x: 0, y: 0, opacity: 1, scale: 0.5 + Math.random() }}
                  animate={{
                    x: (Math.random() - 0.5) * 400,
                    y: -200 - Math.random() * 300,
                    opacity: 0,
                    scale: 0,
                  }}
                  transition={{ duration: 2 + Math.random() * 2, delay: Math.random() * 0.5 }}
                  style={{ left: '50%', top: '50%', fontSize: 16 + Math.random() * 20 }}
                >
                  ♥
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upcoming Dates */}
      {upcomingDates.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-6 border border-[var(--border)]"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarHeart className="w-4 h-4 text-[var(--rose-pink)]" />
              <h2 className="font-medium">Upcoming Special Dates</h2>
            </div>
            <Link href="/timeline" className="text-xs text-[var(--lavender)] hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingDates.map((d: any) => {
              const daysLeft = Math.ceil((new Date(d.date).getTime() - Date.now()) / 86400000);
              return (
                <div key={d.id} className="flex items-center justify-between p-3 rounded-lg bg-[var(--muted)]">
                  <span className="text-sm">{d.title}</span>
                  <span className="text-xs text-[var(--rose-pink)] font-medium">{daysLeft} days away</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Recent Memories */}
      {recentMemories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-medium flex items-center gap-2">
              <Image className="w-4 h-4 text-[var(--lavender)]" /> Latest Memories
            </h2>
            <Link href="/memories" className="text-xs text-[var(--lavender)] hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {recentMemories.map((m: any) => (
              <div key={m.id} className="aspect-square rounded-xl bg-[var(--muted)] border border-[var(--border)] overflow-hidden relative group">
                {m.media_urls?.[0] ? (
                  <img src={m.media_urls[0]} alt={m.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image className="w-8 h-8 text-[var(--muted-foreground)]" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <p className="text-xs text-white">{m.title}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

