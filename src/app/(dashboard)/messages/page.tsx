'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/hooks/use-auth';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { formatDate, cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { DailyMessage } from '@/types/database';
import { Sparkles, Plus, X, Heart, Send, Check, Clock, Sun, Moon as MoonIcon } from 'lucide-react';

const MESSAGE_TYPES = [
  { value: 'love', label: 'Love Message', icon: '💕' },
  { value: 'good-morning', label: 'Good Morning', icon: '🌅' },
  { value: 'good-night', label: 'Good Night', icon: '🌙' },
  { value: 'random', label: 'Random Note', icon: '💌' },
  { value: 'custom', label: 'Custom', icon: '✨' },
];

export default function MessagesPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<DailyMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [content, setContent] = useState('');
  const [messageType, setMessageType] = useState('love');
  const [scheduledDate, setScheduledDate] = useState('');
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  const fetchMessages = async () => {
    const { data } = await supabase.from('daily_messages').select('*').order('created_at', { ascending: false });
    setMessages(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchMessages(); }, []);

  const sendMessage = async () => {
    if (!content.trim() || !user) return;
    setSaving(true);
    await supabase.from('daily_messages').insert({
      content: content.trim(),
      message_type: messageType,
      scheduled_date: scheduledDate || null,
      author_id: user.id,
    });
    toast.success('Message sent with love ♥');
    setContent(''); setMessageType('love'); setScheduledDate('');
    setSaving(false); setShowAdd(false); fetchMessages();
  };

  const markRead = async (id: string) => {
    await supabase.from('daily_messages').update({ is_read: true }).eq('id', id);
    fetchMessages();
  };

  const todayMessages = messages.filter((m) => {
    if (m.scheduled_date && new Date(m.scheduled_date) > new Date()) return false;
    const today = new Date().toISOString().split('T')[0];
    return m.created_at.startsWith(today) || m.scheduled_date === today;
  });

  const unreadCount = messages.filter((m) => !m.is_read).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold gradient-text flex items-center gap-2"><Sparkles className="w-6 h-6" /> Daily Love</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Little reminders that you&apos;re loved every single day.</p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <span className="text-xs px-2 py-1 rounded-full bg-[var(--rose-pink)]/20 text-[var(--rose-pink)]">
              {unreadCount} unread
            </span>
          )}
          <Button variant="romantic" onClick={() => setShowAdd(true)}><Plus className="w-4 h-4" /> Write Message</Button>
        </div>
      </div>

      {/* Today's featured message */}
      {todayMessages.length > 0 && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--deep-purple)] to-[var(--midnight)] p-8 border border-[var(--lavender)]/20 text-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--rose-pink)] opacity-[0.05] blur-[80px] rounded-full" />
          <Sparkles className="w-6 h-6 text-[var(--lavender)] mx-auto mb-4" />
          <p className="text-lg sm:text-xl italic leading-relaxed max-w-lg mx-auto">&ldquo;{todayMessages[0].content}&rdquo;</p>
          <p className="text-xs text-[var(--muted-foreground)] mt-4">
            {MESSAGE_TYPES.find((t) => t.value === todayMessages[0].message_type)?.icon} Today&apos;s message
          </p>
        </motion.div>
      )}

      {/* All messages */}
      {loading ? (
        <div className="space-y-3">{[1, 2, 3, 4].map((i) => <div key={i} className="h-24 rounded-xl bg-[var(--muted)] animate-pulse" />)}</div>
      ) : messages.length === 0 ? (
        <div className="text-center py-16">
          <Sparkles className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-4" />
          <p className="text-[var(--muted-foreground)]">No messages yet. Write something beautiful.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((m, i) => (
            <motion.div key={m.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
              className={cn('glass rounded-xl border p-4 transition-all', m.is_read ? 'border-[var(--border)]' : 'border-[var(--lavender)]/30 bg-[var(--lavender)]/5')}
              onClick={() => !m.is_read && markRead(m.id)}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">{MESSAGE_TYPES.find((t) => t.value === m.message_type)?.icon}</span>
                <div className="flex-1">
                  <p className="text-sm leading-relaxed">{m.content}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-[var(--muted-foreground)]">
                    <span>{formatDate(m.created_at)}</span>
                    {m.scheduled_date && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Scheduled</span>}
                    {m.is_read && <span className="flex items-center gap-1 text-green-400"><Check className="w-3 h-3" /> Read</span>}
                  </div>
                </div>
                {!m.is_read && (
                  <div className="w-2 h-2 rounded-full bg-[var(--rose-pink)] flex-shrink-0 mt-2" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Message Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowAdd(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-md glass rounded-2xl border border-[var(--border)] p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold gradient-text">Write a Love Message</h2>
                <button onClick={() => setShowAdd(false)}><X className="w-5 h-5 text-[var(--muted-foreground)]" /></button>
              </div>
              <div className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  {MESSAGE_TYPES.map((t) => (
                    <button key={t.value} onClick={() => setMessageType(t.value)}
                      className={cn('px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition', messageType === t.value ? 'bg-[var(--lavender)]/20 text-[var(--lavender)] ring-1 ring-[var(--lavender)]' : 'bg-[var(--muted)] text-[var(--muted-foreground)]')}>
                      {t.icon} {t.label}
                    </button>
                  ))}
                </div>
                <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write something beautiful..." rows={4} className="w-full px-4 py-3 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--lavender)] transition resize-none" />
                <div>
                  <label className="text-xs text-[var(--muted-foreground)] mb-1 block">Schedule for (optional)</label>
                  <input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} className="w-full h-10 px-3 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--lavender)]" />
                </div>
                <Button variant="romantic" className="w-full" onClick={sendMessage} disabled={saving}>
                  <Send className="w-4 h-4" /> {saving ? 'Sending...' : 'Send Love'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
