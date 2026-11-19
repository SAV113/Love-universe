'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/hooks/use-auth';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Sparkles, Heart, Mail, Image, Calendar, ChevronRight, ChevronLeft, Award, Flame } from 'lucide-react';
import { getRelativeDuration } from '@/lib/utils';

export default function WrappedPage() {
  const { settings } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [counts, setCounts] = useState({
    memories: 0,
    letters: 0,
    reasons: 0,
    milestones: 0,
    chat: 0,
  });

  const supabase = createClient();

  useEffect(() => {
    async function loadStats() {
      const [{ count: memCount }, { count: letCount }, { count: reasCount }, { count: mileCount }] = await Promise.all([
        supabase.from('memories').select('*', { count: 'exact', head: true }),
        supabase.from('love_letters').select('*', { count: 'exact', head: true }),
        supabase.from('love_reasons').select('*', { count: 'exact', head: true }),
        supabase.from('relationship_milestones').select('*', { count: 'exact', head: true }),
      ]);

      setCounts({
        memories: memCount || 12,
        letters: letCount || 18,
        reasons: reasCount || 36,
        milestones: mileCount || 6,
        chat: 240,
      });
    }
    loadStats();
  }, [supabase]);

  const duration = settings?.anniversary_date ? getRelativeDuration(settings.anniversary_date) : { totalDays: 365 };

  const slides = [
    {
      id: 'welcome',
      icon: Sparkles,
      title: "Our Relationship Wrapped",
      subtitle: "A story written across stars and moments.",
      highlight: `${settings?.owner_name || 'Benjamin'} & ${settings?.partner_name || 'My Love'}`,
      description: "Here is everything we've shared, loved, and experienced together this year.",
      gradient: "from-[#201537] via-[#2d1b4e] to-[#0B0B14]",
    },
    {
      id: 'days',
      icon: Heart,
      title: "Days of Pure Love",
      subtitle: "Every single day with you is a gift.",
      highlight: `${duration.totalDays.toLocaleString()} Days`,
      description: "Countless smiles, laughs, hugs, and moments that made life infinitely brighter.",
      gradient: "from-[#3a1c36] via-[#201537] to-[#0B0B14]",
    },
    {
      id: 'letters',
      icon: Mail,
      title: "Words from the Heart",
      subtitle: "Love expressed in letters and notes.",
      highlight: `${counts.letters} Love Letters`,
      description: "Poured out onto pages, saved forever to remind each other of this rare love.",
      gradient: "from-[#1d1f3b] via-[#241738] to-[#0B0B14]",
    },
    {
      id: 'memories',
      icon: Image,
      title: "Our Memory Scrapbook",
      subtitle: "Snapshots of our journey.",
      highlight: `${counts.memories} Memories Saved`,
      description: "From our favorite spontaneous adventures to cozy lazy mornings.",
      gradient: "from-[#2b1736] via-[#1c1b33] to-[#0B0B14]",
    },
    {
      id: 'reasons',
      icon: Flame,
      title: "Infinite Reasons",
      subtitle: "Why you are so easy to love.",
      highlight: `${counts.reasons} Reasons Why`,
      description: "Your laugh, your warmth, the gentle way you care, and every little thing you do.",
      gradient: "from-[#381a28] via-[#201537] to-[#0B0B14]",
    },
    {
      id: 'verdict',
      icon: Award,
      title: "Our Cosmic Title",
      subtitle: "The Universe has spoken:",
      highlight: "Soulmates in Every Lifetime",
      description: "Thank you for being my favorite chapter, my home, and my whole heart.",
      gradient: "from-[#25153d] via-[#3a1d3c] to-[#0B0B14]",
    },
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) setCurrentSlide(currentSlide + 1);
  };

  const prevSlide = () => {
    if (currentSlide > 0) setCurrentSlide(currentSlide - 1);
  };

  const active = slides[currentSlide];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress Bars */}
      <div className="flex gap-1.5 px-2">
        {slides.map((s, idx) => (
          <div key={s.id} className="flex-1 h-1 rounded-full bg-[var(--muted)] overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                idx <= currentSlide ? 'bg-gradient-to-r from-[var(--lavender)] to-[var(--rose-pink)]' : ''
              }`}
            />
          </div>
        ))}
      </div>

      {/* Main Slide Card */}
      <div className="relative min-h-[460px] rounded-3xl overflow-hidden border border-[var(--border)] shadow-2xl flex flex-col justify-between p-8 sm:p-12 text-center">
        {/* Background Gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${active.gradient} opacity-95 transition-all duration-700`} />
        
        {/* Ambient Orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[var(--rose-pink)] opacity-[0.06] blur-[100px] pointer-events-none" />

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.05, y: -15 }}
            transition={{ duration: 0.4 }}
            className="relative z-10 space-y-6 my-auto"
          >
            <div className="w-16 h-16 rounded-2xl bg-[var(--lavender)]/15 border border-[var(--lavender)]/30 mx-auto flex items-center justify-center shadow-lg">
              <active.icon className="w-8 h-8 text-[var(--lavender)] animate-pulse-soft" />
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest text-[var(--lavender)] font-semibold">{active.subtitle}</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] mt-1">{active.title}</h2>
            </div>

            <div className="py-2">
              <span className="text-4xl sm:text-5xl font-black gradient-text tracking-tight block">
                {active.highlight}
              </span>
            </div>

            <p className="text-sm sm:text-base text-[var(--muted-foreground)] max-w-md mx-auto leading-relaxed">
              {active.description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Controls */}
        <div className="relative z-10 flex items-center justify-between pt-6 border-t border-white/5">
          <Button
            variant="ghost"
            size="sm"
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="text-[var(--muted-foreground)] hover:text-white"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Previous
          </Button>

          <span className="text-xs text-[var(--muted-foreground)]">
            {currentSlide + 1} of {slides.length}
          </span>

          {currentSlide < slides.length - 1 ? (
            <Button variant="romantic" size="sm" onClick={nextSlide}>
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button variant="romantic" size="sm" onClick={() => setCurrentSlide(0)}>
              Replay <Sparkles className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

