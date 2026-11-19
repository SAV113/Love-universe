'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
}

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Particle[]>([]);
  const [visible, setVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const lastSpawn = useRef(0);
  const idCounter = useRef(0);

  useEffect(() => {
    // Disable on touch devices
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsMobile(isTouch);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setPosition({ x: e.clientX, y: e.clientY });
    setVisible(true);

    const now = Date.now();
    if (now - lastSpawn.current > 80) {
      lastSpawn.current = now;
      const id = idCounter.current++;
      setParticles((prev) => {
        const next = [...prev, { id, x: e.clientX, y: e.clientY }];
        // Keep max 8 particles
        return next.length > 8 ? next.slice(-8) : next;
      });
      // Remove particle after 600ms
      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => p.id !== id));
      }, 600);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setVisible(false);
  }, []);

  useEffect(() => {
    if (isMobile) return;

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isMobile, handleMouseMove, handleMouseLeave]);

  if (isMobile) return null;

  return (
    <div style={{ pointerEvents: 'none', position: 'fixed', inset: 0, zIndex: 9999 }}>
      {/* Main cursor glow */}
      <AnimatePresence>
        {visible && (
          <motion.div
            animate={{ x: position.x - 8, y: position.y - 8 }}
            transition={{ type: 'spring', damping: 25, stiffness: 400, mass: 0.3 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: 16,
              height: 16,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(200,182,255,0.4) 0%, rgba(255,183,197,0.2) 60%, transparent 100%)',
              boxShadow: '0 0 12px rgba(200,182,255,0.3)',
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>

      {/* Trailing particles */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0.6, scale: 1 }}
            animate={{ opacity: 0, scale: 0, y: p.y - 15 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              x: p.x - 3,
              y: p.y - 3,
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--rose-pink)',
              pointerEvents: 'none',
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

