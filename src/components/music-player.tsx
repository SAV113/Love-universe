'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '@/lib/hooks/use-auth';

export default function MusicPlayer() {
  const { settings } = useAuth();
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [volume, setVolume] = useState(0.3);
  const [expanded, setExpanded] = useState(false);
  const [ready, setReady] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const musicUrl = settings?.background_music_url;
  const enabled = settings?.background_music_enabled;

  useEffect(() => {
    if (!musicUrl || !enabled) return;

    const audio = new Audio(musicUrl);
    audio.loop = true;
    audio.volume = volume;
    audio.muted = true;
    audioRef.current = audio;

    const handleReady = () => setReady(true);
    const handleError = () => setReady(false);

    audio.addEventListener('canplay', handleReady);
    audio.addEventListener('canplaythrough', handleReady);
    audio.addEventListener('loadeddata', handleReady);
    audio.addEventListener('error', handleError);

    return () => {
      audio.pause();
      audio.removeEventListener('canplay', handleReady);
      audio.removeEventListener('canplaythrough', handleReady);
      audio.removeEventListener('loadeddata', handleReady);
      audio.removeEventListener('error', handleError);
      audio.removeAttribute('src');
      audioRef.current = null;
    };
  }, [musicUrl, enabled]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = muted;
    }
  }, [muted]);

  if (!enabled || !musicUrl || !ready) return null;

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.muted = false;
      setMuted(false);
      try {
        await audio.play();
        setPlaying(true);
      } catch {
        // Browser blocked autoplay
      }
    }
  };

  const toggleMute = () => {
    setMuted(!muted);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-20 lg:bottom-6 right-4 z-40"
    >
      <div className="glass rounded-full border border-[var(--border)] shadow-lg">
        <AnimatePresence mode="wait">
          {expanded ? (
            <motion.div
              key="expanded"
              initial={{ width: 48 }}
              animate={{ width: 200 }}
              exit={{ width: 48 }}
              className="flex items-center gap-2 px-3 py-2 overflow-hidden"
            >
              <button
                onClick={togglePlay}
                className="shrink-0 w-8 h-8 rounded-full bg-[var(--lavender)]/15 flex items-center justify-center hover:bg-[var(--lavender)]/25 transition"
              >
                {playing ? (
                  <Pause className="w-3.5 h-3.5 text-[var(--lavender)]" />
                ) : (
                  <Play className="w-3.5 h-3.5 text-[var(--lavender)]" />
                )}
              </button>

              <button onClick={toggleMute} className="shrink-0">
                {muted ? (
                  <VolumeX className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 text-[var(--lavender)]" />
                )}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-16 h-1 accent-[var(--lavender)] cursor-pointer"
              />

              <button
                onClick={() => setExpanded(false)}
                className="shrink-0 text-[var(--muted-foreground)] text-xs hover:text-[var(--foreground)]"
              >
                ✕
              </button>
            </motion.div>
          ) : (
            <motion.button
              key="collapsed"
              onClick={() => { setExpanded(true); if (!playing) togglePlay(); }}
              className="w-12 h-12 flex items-center justify-center hover:scale-105 transition-transform"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Music className={`w-5 h-5 ${playing ? 'text-[var(--lavender)]' : 'text-[var(--muted-foreground)]'}`} />
              {playing && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-[var(--lavender)]"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

