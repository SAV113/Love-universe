'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from '@/lib/hooks/use-auth';
import {
  Heart, Home, Mail, Image, BookHeart, Sparkles, Clock,
  MessageCircle, CalendarHeart, Gift, Moon, MessagesSquare,
  Pill, HelpCircle, Settings, LogOut, Menu, X, ChevronRight,
  Music, Award, PartyPopper, Flower2, Camera
} from 'lucide-react';
import { cn } from '@/lib/utils';
import MusicPlayer from '@/components/music-player';
import CustomCursor from '@/components/custom-cursor';

const NAV_ITEMS = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/letters', label: 'Love Letters', icon: Mail },
  { href: '/memories', label: 'Memory Garden', icon: Image },
  { href: '/journal', label: 'Feelings', icon: BookHeart },
  { href: '/reasons', label: 'Why I Love You', icon: Heart },
  { href: '/timeline', label: 'Our Timeline', icon: Clock },
  { href: '/messages', label: 'Daily Love', icon: Sparkles },
  { href: '/dates', label: 'Date Planner', icon: CalendarHeart },
  { href: '/surprises', label: 'Surprise Room', icon: Gift },
  { href: '/dreams', label: 'Our Dreams', icon: Moon },
  { href: '/chat', label: 'Private Chat', icon: MessagesSquare },
  { href: '/capsule', label: 'Love Capsule', icon: Pill },
  { href: '/questions', label: 'Questions', icon: HelpCircle },
  { href: '/song', label: 'Our Song', icon: Music },
  { href: '/wrapped', label: 'Relationship Wrapped', icon: Award },
  { href: '/little-things', label: 'Little Things', icon: Flower2 },
  { href: '/polaroids', label: 'Polaroid Wall', icon: Camera },
  { href: '/anniversary', label: 'Anniversary', icon: PartyPopper },
  { href: '/settings', label: 'Settings', icon: Settings },
];

function Sidebar() {
  const pathname = usePathname();
  const { profile, settings, signOut } = useAuth();

  return (
    <aside className="hidden lg:flex flex-col w-[260px] h-screen fixed left-0 top-0 glass border-r border-[var(--border)] z-40">
      {/* Logo */}
      <div className="p-5 border-b border-[var(--border)]">
        <Link href="/home" className="flex items-center gap-2">
          <Heart className="w-6 h-6 text-[var(--rose-pink)]" fill="currentColor" />
          <span className="font-bold gradient-text text-lg">Our Little Universe</span>
        </Link>
        {settings && (
          <p className="text-xs text-[var(--muted-foreground)] mt-1 ml-8">
            {settings.owner_name} & {settings.partner_name}
          </p>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group',
                active
                  ? 'bg-[var(--lavender)]/15 text-[var(--lavender)]'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]'
              )}
            >
              <item.icon className={cn('w-4 h-4 transition-colors', active && 'text-[var(--lavender)]')} />
              {item.label}
              {active && (
                <ChevronRight className="w-3 h-3 ml-auto opacity-50" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-[var(--border)]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--lavender)] to-[var(--rose-pink)] flex items-center justify-center text-xs font-bold text-[var(--midnight)]">
            {profile?.display_name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{profile?.display_name || 'Loading...'}</p>
            <p className="text-xs text-[var(--muted-foreground)] truncate">{profile?.email}</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-2 text-xs text-[var(--muted-foreground)] hover:text-[var(--destructive)] transition w-full px-2 py-1.5 rounded-lg hover:bg-[var(--muted)]"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign out
        </button>
      </div>
    </aside>
  );
}

function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { profile, signOut } = useAuth();

  const mainTabs = [
    { href: '/home', label: 'Home', icon: Home },
    { href: '/letters', label: 'Letters', icon: Mail },
    { href: '/memories', label: 'Memories', icon: Image },
    { href: '/chat', label: 'Chat', icon: MessagesSquare },
  ];

  return (
    <>
      {/* Bottom tab bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 glass border-t border-[var(--border)] z-50 px-2 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-16">
          {mainTabs.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-1 transition-colors',
                  active ? 'text-[var(--lavender)]' : 'text-[var(--muted-foreground)]'
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px]">{item.label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setOpen(true)}
            className="flex flex-col items-center gap-1 px-3 py-1 text-[var(--muted-foreground)]"
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px]">More</span>
          </button>
        </div>
      </div>

      {/* Full menu overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50 lg:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 lg:hidden glass rounded-t-2xl max-h-[80vh] overflow-y-auto"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold gradient-text">Menu</span>
                  <button onClick={() => setOpen(false)}>
                    <X className="w-5 h-5 text-[var(--muted-foreground)]" />
                  </button>
                </div>
                <nav className="space-y-1">
                  {NAV_ITEMS.map((item) => {
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-all',
                          active
                            ? 'bg-[var(--lavender)]/15 text-[var(--lavender)]'
                            : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)]'
                        )}
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
                <div className="mt-4 pt-4 border-t border-[var(--border)]">
                  <div className="flex items-center gap-3 px-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--lavender)] to-[var(--rose-pink)] flex items-center justify-center text-xs font-bold text-[var(--midnight)]">
                      {profile?.display_name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <p className="text-sm font-medium">{profile?.display_name}</p>
                  </div>
                  <button
                    onClick={() => { signOut(); setOpen(false); }}
                    className="flex items-center gap-2 text-sm text-[var(--destructive)] px-3 py-2 w-full"
                  >
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="flex flex-col items-center gap-4">
          <Heart className="w-10 h-10 text-[var(--rose-pink)] animate-pulse-soft" fill="currentColor" />
          <p className="text-[var(--muted-foreground)] text-sm">Loading your universe...</p>
          <div className="flex gap-1 mt-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-[var(--lavender)]"
                style={{ animation: `pulse-soft 1.4s ease-in-out ${i * 0.2}s infinite` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated — AuthProvider already redirects, but guard anyway
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="flex flex-col items-center gap-4">
          <Heart className="w-10 h-10 text-[var(--rose-pink)]" fill="currentColor" />
          <p className="text-[var(--muted-foreground)] text-sm">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Sidebar />
      <MobileNav />
      <main className="lg:ml-[260px] min-h-screen pb-20 lg:pb-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 page-transition">
          {children}
        </div>
      </main>
      <MusicPlayer />
      <CustomCursor />
    </>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardContent>{children}</DashboardContent>
    </AuthProvider>
  );
}

