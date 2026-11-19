'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { Button } from '@/components/ui/button';
import { Heart, Mail, Lock, User, Calendar, Key, ArrowRight, Copy, Check, AlertTriangle, ExternalLink, Database, FileCode, Server } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { generateInviteCode } from '@/lib/utils';

type Mode = 'choose' | 'owner' | 'partner';

export default function SetupPage() {
  const [mode, setMode] = useState<Mode>('choose');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [anniversary, setAnniversary] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();

  const configured = isSupabaseConfigured();

  const handleOwnerSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      const code = generateInviteCode();

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: name, role: 'owner' },
        },
      });

      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        const { error: settingsError } = await supabase.from('relationship_settings').insert({
          owner_id: data.user.id,
          owner_name: name,
          partner_name: partnerName || 'My Love',
          anniversary_date: anniversary || new Date().toISOString().split('T')[0],
          invite_code: code,
        });

        if (settingsError) {
          toast.error('Account created but settings failed. You can set them up later.');
        }
      }

      setGeneratedCode(code);
      setDone(true);
      setLoading(false);
      toast.success('Your universe has been created! 🌟');
    } catch (err) {
      setLoading(false);
      if (err instanceof TypeError && err.message.includes('fetch')) {
        toast.error('Could not connect to Supabase. Please check your .env.local configuration and restart the dev server.');
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
    }
  };

  const handlePartnerSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();

      // Check invite code
      const { data: settings, error: lookupError } = await supabase
        .from('relationship_settings')
        .select('*')
        .eq('invite_code', inviteCode.toUpperCase())
        .single();

      if (lookupError || !settings) {
        toast.error('Invalid invite code. Please check and try again.');
        setLoading(false);
        return;
      }

      if (settings.partner_id) {
        toast.error('This invite code has already been used.');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: name || settings.partner_name, role: 'partner' },
        },
      });

      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        await supabase
          .from('relationship_settings')
          .update({ partner_id: data.user.id })
          .eq('id', settings.id);
      }

      toast.success('Welcome to your little universe! 💕');
      router.push('/home');
    } catch (err) {
      setLoading(false);
      if (err instanceof TypeError && err.message.includes('fetch')) {
        toast.error('Could not connect to Supabase. Please check your .env.local configuration and restart the dev server.');
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Supabase NOT configured — show setup instructions ──
  if (!configured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0B0B14] via-[#201537] to-[#0B0B14] px-4 py-12">
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[var(--rose-pink)] opacity-[0.03] blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-lg"
        >
          <div className="glass rounded-2xl p-8 shadow-2xl">
            {/* Header */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
                <AlertTriangle className="w-7 h-7 text-amber-400" />
              </div>
              <h1 className="text-2xl font-bold gradient-text">Setup Required</h1>
              <p className="text-sm text-[var(--muted-foreground)] mt-2 text-center">
                Your universe needs a database before it can come alive. Follow these steps to get started:
              </p>
            </div>

            {/* Steps */}
            <div className="space-y-4 mb-6">
              {[
                {
                  step: 1,
                  icon: ExternalLink,
                  title: 'Create a Supabase Project',
                  desc: (
                    <>
                      Go to{' '}
                      <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-[var(--lavender)] underline underline-offset-2">
                        supabase.com
                      </a>{' '}
                      and create a free project.
                    </>
                  ),
                },
                {
                  step: 2,
                  icon: Database,
                  title: 'Run the Database Schema',
                  desc: 'Open the SQL Editor in your Supabase dashboard and paste the contents of supabase/schema.sql, then run it.',
                },
                {
                  step: 3,
                  icon: FileCode,
                  title: 'Create .env.local',
                  desc: 'Copy .env.local.example to .env.local and fill in your Supabase project URL and anon key from Project Settings → API.',
                },
                {
                  step: 4,
                  icon: Server,
                  title: 'Create Storage Buckets',
                  desc: 'In Supabase Storage, create these buckets: avatars, memories, letters, chat, dreams (set them as public).',
                },
                {
                  step: 5,
                  icon: ArrowRight,
                  title: 'Restart Dev Server',
                  desc: 'Stop the dev server and run npm run dev again to pick up the new environment variables.',
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--lavender)]/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-[var(--lavender)]">{item.step}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium flex items-center gap-1.5">
                      <item.icon className="w-3.5 h-3.5 text-[var(--lavender)]" />
                      {item.title}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Code example */}
            <div className="rounded-lg bg-[var(--muted)] p-4 mb-6">
              <p className="text-xs text-[var(--muted-foreground)] mb-2 font-medium">.env.local example:</p>
              <code className="text-xs text-[var(--lavender)] block font-mono leading-relaxed">
                NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
                <br />
                NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...your-key
              </code>
            </div>

            <div className="flex gap-3">
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button variant="romantic" size="lg" className="w-full">
                  <ExternalLink className="w-4 h-4" /> Open Supabase
                </Button>
              </a>
              <Button variant="outline" size="lg" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Done — show invite code ──
  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0B0B14] via-[#201537] to-[#0B0B14] px-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-2xl p-8 max-w-md w-full text-center">
          <Heart className="w-12 h-12 text-[var(--rose-pink)] mx-auto mb-4 animate-heart-beat" fill="currentColor" />
          <h2 className="text-2xl font-bold gradient-text mb-2">Universe Created!</h2>
          <p className="text-[var(--muted-foreground)] mb-6">Share this invite code with your partner so they can join your universe:</p>
          <div className="flex items-center justify-center gap-2 mb-6">
            <code className="text-2xl font-mono tracking-widest text-[var(--lavender)] bg-[var(--muted)] px-4 py-2 rounded-lg">{generatedCode}</code>
            <button onClick={copyCode} className="p-2 rounded-lg hover:bg-[var(--muted)] transition">
              {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-[var(--muted-foreground)]" />}
            </button>
          </div>
          <Button variant="romantic" onClick={() => router.push('/home')} className="w-full">
            Enter Your Universe <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    );
  }

  // ── Main setup form ──
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0B0B14] via-[#201537] to-[#0B0B14] px-4 py-12">
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[var(--lavender)] opacity-[0.04] blur-[120px] pointer-events-none" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        {mode === 'choose' && (
          <div className="glass rounded-2xl p-8 text-center">
            <Heart className="w-10 h-10 text-[var(--rose-pink)] mx-auto mb-3" fill="currentColor" />
            <h1 className="text-2xl font-bold gradient-text mb-2">Create Your Universe</h1>
            <p className="text-sm text-[var(--muted-foreground)] mb-8">How would you like to start?</p>

            <div className="space-y-3">
              <Button variant="romantic" size="lg" className="w-full" onClick={() => setMode('owner')}>
                <User className="w-4 h-4" /> I&apos;m Creating Our Universe
              </Button>
              <Button variant="outline" size="lg" className="w-full" onClick={() => setMode('partner')}>
                <Key className="w-4 h-4" /> I Have an Invite Code
              </Button>
            </div>

            <p className="text-center text-sm text-[var(--muted-foreground)] mt-6">
              Already have an account?{' '}
              <Link href="/login" className="text-[var(--lavender)] hover:underline">Sign in</Link>
            </p>
          </div>
        )}

        {mode === 'owner' && (
          <div className="glass rounded-2xl p-8">
            <button onClick={() => setMode('choose')} className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4 block">← Back</button>
            <h2 className="text-xl font-bold gradient-text mb-6 text-center">Create Your Universe</h2>

            <form onSubmit={handleOwnerSetup} className="space-y-4">
              <div>
                <label className="text-sm text-[var(--muted-foreground)] mb-1 block">Your Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required className="w-full h-11 pl-10 pr-4 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--lavender)] transition" />
                </div>
              </div>

              <div>
                <label className="text-sm text-[var(--muted-foreground)] mb-1 block">Partner&apos;s Name</label>
                <div className="relative">
                  <Heart className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                  <input type="text" value={partnerName} onChange={(e) => setPartnerName(e.target.value)} placeholder="My Love" className="w-full h-11 pl-10 pr-4 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--lavender)] transition" />
                </div>
              </div>

              <div>
                <label className="text-sm text-[var(--muted-foreground)] mb-1 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required className="w-full h-11 pl-10 pr-4 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--lavender)] transition" />
                </div>
              </div>

              <div>
                <label className="text-sm text-[var(--muted-foreground)] mb-1 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} className="w-full h-11 pl-10 pr-4 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--lavender)] transition" />
                </div>
              </div>

              <div>
                <label className="text-sm text-[var(--muted-foreground)] mb-1 block">Anniversary Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                  <input type="date" value={anniversary} onChange={(e) => setAnniversary(e.target.value)} className="w-full h-11 pl-10 pr-4 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--lavender)] transition" />
                </div>
              </div>

              <Button type="submit" variant="romantic" size="lg" className="w-full" disabled={loading}>
                {loading ? 'Creating...' : 'Create Our Universe'} <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          </div>
        )}

        {mode === 'partner' && (
          <div className="glass rounded-2xl p-8">
            <button onClick={() => setMode('choose')} className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4 block">← Back</button>
            <h2 className="text-xl font-bold gradient-text mb-6 text-center">Join Your Universe</h2>

            <form onSubmit={handlePartnerSetup} className="space-y-4">
              <div>
                <label className="text-sm text-[var(--muted-foreground)] mb-1 block">Your Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full h-11 pl-10 pr-4 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--lavender)] transition" />
                </div>
              </div>

              <div>
                <label className="text-sm text-[var(--muted-foreground)] mb-1 block">Invite Code</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                  <input type="text" value={inviteCode} onChange={(e) => setInviteCode(e.target.value.toUpperCase())} placeholder="ABCD1234" required className="w-full h-11 pl-10 pr-4 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--lavender)] transition font-mono tracking-widest" />
                </div>
              </div>

              <div>
                <label className="text-sm text-[var(--muted-foreground)] mb-1 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" required className="w-full h-11 pl-10 pr-4 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--lavender)] transition" />
                </div>
              </div>

              <div>
                <label className="text-sm text-[var(--muted-foreground)] mb-1 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} className="w-full h-11 pl-10 pr-4 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--lavender)] transition" />
                </div>
              </div>

              <Button type="submit" variant="romantic" size="lg" className="w-full" disabled={loading}>
                {loading ? 'Joining...' : 'Join Our Universe'} <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  );
}
