'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Heart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isSupabaseConfigured } from '@/lib/supabase/config';

function StarField() {
  const stars = useMemo(
    () =>
      Array.from({ length: 80 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2.5 + 0.5,
        delay: Math.random() * 5,
        duration: Math.random() * 3 + 2,
      })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

function FloatingHearts() {
  const hearts = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        id: i,
        x: 10 + Math.random() * 80,
        size: 12 + Math.random() * 20,
        delay: Math.random() * 8,
        duration: 6 + Math.random() * 6,
      })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {hearts.map((h) => (
        <div
          key={h.id}
          className="absolute text-[var(--rose-pink)] opacity-20"
          style={{
            left: `${h.x}%`,
            bottom: '-40px',
            fontSize: h.size,
            animation: `floatHeart ${h.duration}s ease-in-out ${h.delay}s infinite`,
          }}
        >
          ♥
        </div>
      ))}
      <style jsx>{`
        @keyframes floatHeart {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.3;
          }
          90% {
            opacity: 0.1;
          }
          100% {
            transform: translateY(-100vh) rotate(45deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

export default function LandingPage() {
  const [entered, setEntered] = useState(false);
  const configured = isSupabaseConfigured();

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#0B0B14] via-[#201537] to-[#0B0B14]">
      <StarField />
      <FloatingHearts />

      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[var(--lavender)] opacity-[0.04] blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] rounded-full bg-[var(--rose-pink)] opacity-[0.03] blur-[100px] pointer-events-none" />

      <AnimatePresence>
        {!entered && (
          <motion.div
            className="relative z-10 flex flex-col items-center text-center px-6 max-w-2xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            >
              <Heart className="w-16 h-16 text-[var(--rose-pink)] mb-6 animate-pulse-soft" fill="currentColor" />
            </motion.div>

            {/* Title */}
            <motion.h1
              className="text-5xl sm:text-7xl font-bold gradient-text mb-4 tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Our Little Universe
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              className="text-lg sm:text-xl text-[var(--muted-foreground)] mb-12 italic"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              A little world that belongs only to us.
            </motion.p>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.6 }}
            >
              <Link href={configured ? '/login' : '/setup'}>
                <Button variant="romantic" size="xl" className="group">
                  <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  {configured ? 'ENTER OUR LITTLE WORLD' : 'SET UP OUR UNIVERSE'}
                </Button>
              </Link>
            </motion.div>

            {/* Small decorative text */}
            <motion.p
              className="mt-8 text-xs text-[var(--muted-foreground)] opacity-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 1.5 }}
            >
              ♥ Made with love ♥
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
