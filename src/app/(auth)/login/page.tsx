'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { Button } from '@/components/ui/button';
import { Heart, Mail, Lock, ArrowRight, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const configured = isSupabaseConfigured();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }
      toast.success('Welcome back, my love! 💕');
      router.push('/home');
    } catch (err) {
      setLoading(false);
      if (err instanceof TypeError && err.message.includes('fetch')) {
        toast.error('Could not connect to Supabase. Check your .env.local configuration.');
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0B0B14] via-[#201537] to-[#0B0B14] px-4">
      {/* Ambient glow */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[var(--lavender)] opacity-[0.04] blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="glass rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <Heart className="w-10 h-10 text-[var(--rose-pink)] mb-3" fill="currentColor" />
            <h1 className="text-2xl font-bold gradient-text">Welcome Back</h1>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">Step into our little world</p>
          </div>

          {!configured && (
            <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-left">
              <div className="flex items-center gap-2 text-amber-400 font-medium text-sm mb-1">
                <AlertTriangle className="w-4 h-4" />
                <span>Supabase Configuration Required</span>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                Database credentials are missing. Please complete initial setup first.
              </p>
              <Link
                href="/setup"
                className="inline-flex items-center gap-1.5 text-xs text-[var(--lavender)] hover:underline mt-2.5 font-medium"
              >
                View Setup Guide <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm text-[var(--muted-foreground)] mb-1 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full h-11 pl-10 pr-4 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--lavender)] transition"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-[var(--muted-foreground)] mb-1 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full h-11 pl-10 pr-4 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--lavender)] transition"
                />
              </div>
            </div>

            <Button type="submit" variant="romantic" size="lg" className="w-full" disabled={loading}>
              {loading ? 'Entering...' : 'Enter Our Universe'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Setup link */}
          <p className="text-center text-sm text-[var(--muted-foreground)] mt-6">
            First time?{' '}
            <Link href="/setup" className="text-[var(--lavender)] hover:underline">
              Set up your universe
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
