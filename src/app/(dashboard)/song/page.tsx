'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Music, Play, Pause, Volume2, VolumeX, Disc, Heart, Sparkles } from 'lucide-react';

export default function SongPage() {
  const { settings } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(195); // default mock duration
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const songTitle = "Can't Help Falling in Love";
  const artist = "Our Special Melody";

  const lyrics = [
    { time: 0, text: "Wise men say only fools rush in..." },
    { time: 12, text: "But I can't help falling in love with you..." },
    { time: 28, text: "Shall I stay? Would it be a sin?" },
    { time: 42, text: "If I can't help falling in love with you?" },
    { time: 58, text: "Like a river flows surely to the sea..." },
    { time: 74, text: "Darling, so it goes, some things are meant to be." },
    { time: 92, text: "Take my hand, take my whole life too..." },
    { time: 110, text: "For I can't help falling in love with you ♥" },
  ];

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold gradient-text flex items-center justify-center gap-2">
          <Music className="w-7 h-7 text-[var(--lavender)]" /> Our Song
        </h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          The melody that will forever belong to you and me.
        </p>
      </div>

      {/* Vinyl & Player Area */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--deep-purple)] via-[#141226] to-[var(--midnight)] p-8 sm:p-12 border border-[var(--border)] shadow-2xl flex flex-col md:flex-row items-center gap-10">
        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-[var(--rose-pink)] opacity-[0.08] blur-[90px] pointer-events-none" />

        {/* Spinning Vinyl Record */}
        <div className="relative flex-shrink-0">
          <motion.div
            animate={{ rotate: isPlaying ? 360 : 0 }}
            transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
            className="w-56 h-56 sm:w-64 sm:h-64 rounded-full bg-[#0a0a0f] border-4 border-[#1e1b2e] shadow-2xl flex items-center justify-center relative"
            style={{
              backgroundImage: 'radial-gradient(circle, #1a1829 2px, transparent 2px), repeating-radial-gradient(circle, #0e0d17 0, #0e0d17 4px, #1a182b 5px, #0e0d17 6px)',
            }}
          >
            {/* Center Label */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[var(--lavender)] to-[var(--rose-pink)] flex flex-col items-center justify-center p-2 text-center shadow-inner">
              <Heart className="w-6 h-6 text-[var(--midnight)] mb-1" fill="currentColor" />
              <span className="text-[10px] font-bold text-[var(--midnight)] uppercase tracking-wider">Our Song</span>
            </div>
          </motion.div>
        </div>

        {/* Player Controls & Info */}
        <div className="flex-1 w-full text-center md:text-left space-y-5">
          <div>
            <span className="text-xs uppercase tracking-widest text-[var(--lavender)] font-semibold">Special Track</span>
            <h2 className="text-2xl sm:text-3xl font-bold mt-1 text-[var(--foreground)]">{songTitle}</h2>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">{artist} • Dedicated to {settings?.partner_name || 'My Love'}</p>
          </div>

          {/* Progress Slider */}
          <div className="space-y-2">
            <div className="h-2 rounded-full bg-[var(--muted)] overflow-hidden cursor-pointer relative">
              <div
                className="h-full bg-gradient-to-r from-[var(--lavender)] to-[var(--rose-pink)] transition-all"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-[var(--muted-foreground)]">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center md:justify-start gap-4">
            <Button
              variant="romantic"
              size="lg"
              onClick={togglePlay}
              className="rounded-full w-14 h-14 p-0 flex items-center justify-center shadow-xl hover:scale-105 transition-transform"
            >
              {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 ml-1 fill-current" />}
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={toggleMute}
              className="rounded-full w-11 h-11"
            >
              {isMuted ? <VolumeX className="w-5 h-5 text-[var(--muted-foreground)]" /> : <Volume2 className="w-5 h-5 text-[var(--lavender)]" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Lyrics Display */}
      <div className="glass rounded-2xl p-8 border border-[var(--border)] text-center space-y-4">
        <Sparkles className="w-5 h-5 text-[var(--rose-pink)] mx-auto animate-pulse-soft" />
        <h3 className="text-lg font-semibold gradient-text">Lyrics to Our Hearts</h3>
        <div className="space-y-4 py-4 max-w-lg mx-auto">
          {lyrics.map((line, idx) => (
            <p
              key={idx}
              className="text-base sm:text-lg text-[var(--muted-foreground)] hover:text-[var(--lavender)] transition-colors italic cursor-default"
            >
              &ldquo;{line.text}&rdquo;
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

