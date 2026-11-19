'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/hooks/use-auth';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Settings, User, Heart, Calendar, Palette, Save, Copy, Check, Sun, Moon, Music, Volume2 } from 'lucide-react';

export default function SettingsPage() {
  const { profile, settings, user, refreshSettings } = useAuth();
  const supabase = createClient();

  const [ownerName, setOwnerName] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [anniversary, setAnniversary] = useState('');
  const [websiteTitle, setWebsiteTitle] = useState('');
  const [greeting, setGreeting] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [musicUrl, setMusicUrl] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setOwnerName(settings.owner_name || '');
      setPartnerName(settings.partner_name || '');
      setAnniversary(settings.anniversary_date || '');
      setWebsiteTitle(settings.website_title || '');
      setGreeting(settings.greeting_message || '');
      setTheme((settings.theme as 'dark' | 'light') || 'dark');
      setMusicEnabled(!!settings.background_music_enabled);
      setMusicUrl(settings.background_music_url || '');
      setInviteCode(settings.invite_code || '');
    }
    if (profile) {
      setDisplayName(profile.display_name || '');
    }
  }, [settings, profile]);

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({ display_name: displayName }).eq('id', user.id);
    if (error) {
      toast.error('Failed to update profile');
    } else {
      toast.success('Profile updated');
    }
    setSaving(false);
  };

  const saveSettings = async () => {
    if (!settings) return;
    setSaving(true);

    const { error } = await supabase.from('relationship_settings').update({
      owner_name: ownerName,
      partner_name: partnerName,
      anniversary_date: anniversary,
      website_title: websiteTitle,
      greeting_message: greeting,
      theme,
      background_music_enabled: musicEnabled,
      background_music_url: musicUrl.trim() || null,
    }).eq('id', settings.id);

    if (error) {
      toast.error('Failed to save settings');
    } else {
      // Apply theme immediately
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
      }
      toast.success('Settings saved ♥');
      await refreshSettings();
    }
    setSaving(false);
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isOwner = profile?.role === 'owner';

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold gradient-text flex items-center gap-2"><Settings className="w-6 h-6" /> Settings</h1>
        <p className="text-sm text-[var(--muted-foreground)]">Personalize your little universe.</p>
      </div>

      {/* Profile Section */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl border border-[var(--border)] p-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2"><User className="w-4 h-4 text-[var(--lavender)]" /> Your Profile</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-[var(--muted-foreground)] mb-1 block">Display Name</label>
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)}
              className="w-full h-10 px-4 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--lavender)] transition" />
          </div>
          <div>
            <label className="text-sm text-[var(--muted-foreground)] mb-1 block">Email</label>
            <input value={profile?.email || ''} disabled
              className="w-full h-10 px-4 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-sm opacity-60" />
          </div>
          <div>
            <label className="text-sm text-[var(--muted-foreground)] mb-1 block">Role</label>
            <span className="text-sm px-3 py-1 rounded-full bg-[var(--lavender)]/10 text-[var(--lavender)]">
              {profile?.role === 'owner' ? '👑 Owner' : '💕 Partner'}
            </span>
          </div>
          <Button variant="outline" onClick={saveProfile} disabled={saving}>
            <Save className="w-4 h-4" /> Save Profile
          </Button>
        </div>
      </motion.div>

      {/* Relationship Settings - Owner only */}
      {isOwner && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass rounded-xl border border-[var(--border)] p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><Heart className="w-4 h-4 text-[var(--rose-pink)]" /> Relationship Settings</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-[var(--muted-foreground)] mb-1 block">Your Name</label>
                <input value={ownerName} onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full h-10 px-4 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--lavender)] transition" />
              </div>
              <div>
                <label className="text-sm text-[var(--muted-foreground)] mb-1 block">Partner&apos;s Name</label>
                <input value={partnerName} onChange={(e) => setPartnerName(e.target.value)}
                  className="w-full h-10 px-4 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--lavender)] transition" />
              </div>
            </div>

            <div>
              <label className="text-sm text-[var(--muted-foreground)] mb-1 block flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Anniversary Date
              </label>
              <input type="date" value={anniversary} onChange={(e) => setAnniversary(e.target.value)}
                className="w-full h-10 px-4 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--lavender)] transition" />
            </div>

            <div>
              <label className="text-sm text-[var(--muted-foreground)] mb-1 block">Website Title</label>
              <input value={websiteTitle} onChange={(e) => setWebsiteTitle(e.target.value)}
                className="w-full h-10 px-4 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--lavender)] transition" />
            </div>

            <div>
              <label className="text-sm text-[var(--muted-foreground)] mb-1 block">Welcome Greeting</label>
              <textarea value={greeting} onChange={(e) => setGreeting(e.target.value)} rows={2}
                className="w-full px-4 py-3 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--lavender)] transition resize-none" />
            </div>

            {/* Theme */}
            <div>
              <label className="text-sm text-[var(--muted-foreground)] mb-2 block flex items-center gap-1">
                <Palette className="w-3 h-3" /> Theme
              </label>
              <div className="flex gap-3">
                <button type="button" onClick={() => setTheme('dark')}
                  className={cn('flex items-center gap-2 px-4 py-2 rounded-lg border transition',
                    theme === 'dark' ? 'border-[var(--lavender)] bg-[var(--lavender)]/10 text-[var(--lavender)]' : 'border-[var(--border)] text-[var(--muted-foreground)]')}>
                  <Moon className="w-4 h-4" /> Dark
                </button>
                <button type="button" onClick={() => setTheme('light')}
                  className={cn('flex items-center gap-2 px-4 py-2 rounded-lg border transition',
                    theme === 'light' ? 'border-[var(--lavender)] bg-[var(--lavender)]/10 text-[var(--lavender)]' : 'border-[var(--border)] text-[var(--muted-foreground)]')}>
                  <Sun className="w-4 h-4" /> Light
                </button>
              </div>
            </div>

            {/* Background Music */}
            <div>
              <label className="text-sm text-[var(--muted-foreground)] mb-2 block flex items-center gap-1">
                <Music className="w-3.5 h-3.5" /> Background Music
              </label>
              <div className="p-4 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Ambient Music Player</p>
                    <p className="text-xs text-[var(--muted-foreground)]">Enable floating audio player across pages</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMusicEnabled(!musicEnabled)}
                    className={cn(
                      'relative w-12 h-6 rounded-full transition-colors duration-200',
                      musicEnabled ? 'bg-[var(--lavender)]' : 'bg-[var(--muted)] border border-[var(--border)]'
                    )}
                  >
                    <span
                      className={cn(
                        'block w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200',
                        musicEnabled ? 'translate-x-6' : 'translate-x-0.5'
                      )}
                    />
                  </button>
                </div>

                {musicEnabled && (
                  <div className="pt-2 border-t border-[var(--border)]/60 space-y-1.5">
                    <label className="text-xs text-[var(--muted-foreground)] flex items-center gap-1">
                      <Volume2 className="w-3 h-3" /> Audio URL (Direct MP3 or stream link)
                    </label>
                    <input
                      type="url"
                      value={musicUrl}
                      onChange={(e) => setMusicUrl(e.target.value)}
                      placeholder="https://example.com/romantic-melody.mp3"
                      className="w-full h-10 px-4 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--lavender)] transition"
                    />
                    <p className="text-[11px] text-[var(--muted-foreground)]">
                      Tip: You can use any direct MP3 file URL. Music stays paused until explicitly played.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <Button variant="romantic" onClick={saveSettings} disabled={saving}>
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </motion.div>
      )}

      {/* Invite Code */}
      {isOwner && inviteCode && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass rounded-xl border border-[var(--border)] p-6">
          <h2 className="font-semibold mb-4">🔗 Partner Invite Code</h2>
          <p className="text-sm text-[var(--muted-foreground)] mb-3">Share this code with your partner so they can join your universe.</p>
          <div className="flex items-center gap-2">
            <code className="text-lg font-mono tracking-widest text-[var(--lavender)] bg-[var(--muted)] px-4 py-2 rounded-lg flex-1 text-center">{inviteCode}</code>
            <Button variant="outline" size="icon" onClick={copyInviteCode}>
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          {settings?.partner_id && (
            <p className="text-xs text-green-400 mt-2">✓ Partner has joined your universe</p>
          )}
        </motion.div>
      )}

      {/* About */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="glass rounded-xl border border-[var(--border)] p-6 text-center">
        <Heart className="w-6 h-6 text-[var(--rose-pink)] mx-auto mb-2" fill="currentColor" />
        <p className="text-sm gradient-text font-semibold">Our Little Universe</p>
        <p className="text-xs text-[var(--muted-foreground)] mt-1">A little world that belongs only to us. ♥</p>
        <p className="text-[10px] text-[var(--muted-foreground)] mt-2">Made with love</p>
      </motion.div>
    </div>
  );
}
