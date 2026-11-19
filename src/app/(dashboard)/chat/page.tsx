'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/hooks/use-auth';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/types/database';
import { MessagesSquare, Send, Heart, Star, Trash2, Reply, Smile } from 'lucide-react';

const QUICK_EMOJIS = ['❤️', '😘', '🥰', '💕', '😂', '🤗', '💜', '✨'];

export default function ChatPage() {
  const { user, settings, profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })
      .limit(200);
    setMessages(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchMessages(); }, []);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('chat')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, (payload) => {
        setMessages((prev) => [...prev, payload.new as ChatMessage]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark unread as read
  useEffect(() => {
    if (!user || messages.length === 0) return;
    const unread = messages.filter((m) => m.sender_id !== user.id && !m.is_read);
    if (unread.length > 0) {
      supabase.from('chat_messages').update({ is_read: true }).in('id', unread.map((m) => m.id)).then();
    }
  }, [messages, user, supabase]);

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !user) return;

    await supabase.from('chat_messages').insert({
      sender_id: user.id,
      content: newMessage.trim(),
      message_type: 'text',
      reply_to_id: replyTo?.id || null,
    });

    setNewMessage('');
    setReplyTo(null);
  };

  const sendEmoji = async (emoji: string) => {
    if (!user) return;
    await supabase.from('chat_messages').insert({
      sender_id: user.id,
      content: emoji,
      message_type: 'emoji',
    });
  };

  const toggleFavorite = async (msg: ChatMessage) => {
    await supabase.from('chat_messages').update({ is_favorite: !msg.is_favorite }).eq('id', msg.id);
    fetchMessages();
  };

  const deleteMessage = async (id: string) => {
    await supabase.from('chat_messages').update({ is_deleted: true }).eq('id', id);
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  const isOwner = profile?.role === 'owner';
  const partnerName = isOwner ? settings?.partner_name : settings?.owner_name;

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateHeader = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Today';
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
  };

  // Group messages by date
  const groupedMessages: { date: string; msgs: ChatMessage[] }[] = [];
  messages.forEach((msg) => {
    const dateKey = new Date(msg.created_at).toDateString();
    const last = groupedMessages[groupedMessages.length - 1];
    if (last && last.date === dateKey) {
      last.msgs.push(msg);
    } else {
      groupedMessages.push({ date: dateKey, msgs: [msg] });
    }
  });

  const replyMessage = replyTo ? messages.find((m) => m.id === replyTo.id) : null;

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] lg:h-[calc(100vh-3rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-[var(--border)]">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--rose-pink)] to-[var(--lavender)] flex items-center justify-center text-sm font-bold text-[var(--midnight)]">
          {partnerName?.charAt(0) || '♥'}
        </div>
        <div>
          <h1 className="font-semibold flex items-center gap-2">
            <MessagesSquare className="w-4 h-4 text-[var(--lavender)]" />
            Private Chat
          </h1>
          <p className="text-xs text-[var(--muted-foreground)]">Just the two of us</p>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto py-4 space-y-1 px-1">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Heart className="w-8 h-8 text-[var(--rose-pink)] animate-pulse-soft" fill="currentColor" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <Heart className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-3" />
              <p className="text-[var(--muted-foreground)]">Start your conversation</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">Say something sweet 💕</p>
            </div>
          </div>
        ) : (
          groupedMessages.map((group) => (
            <div key={group.date}>
              <div className="text-center my-4">
                <span className="text-[10px] px-3 py-1 rounded-full bg-[var(--muted)] text-[var(--muted-foreground)]">
                  {formatDateHeader(group.msgs[0].created_at)}
                </span>
              </div>
              {group.msgs.map((msg) => {
                const isMine = msg.sender_id === user?.id;
                const repliedMsg = msg.reply_to_id ? messages.find((m) => m.id === msg.reply_to_id) : null;

                return (
                  <motion.div key={msg.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                    className={cn('flex mb-1 group', isMine ? 'justify-end' : 'justify-start')}>
                    <div className={cn('max-w-[75%] relative')}>
                      {/* Reply preview */}
                      {repliedMsg && (
                        <div className={cn('text-[10px] px-3 py-1 rounded-t-lg border-l-2 mb-0.5',
                          isMine ? 'bg-[var(--lavender)]/10 border-[var(--lavender)] text-right' : 'bg-[var(--muted)] border-[var(--rose-pink)]')}>
                          <span className="text-[var(--muted-foreground)] line-clamp-1">{repliedMsg.content}</span>
                        </div>
                      )}
                      {/* Message bubble */}
                      <div className={cn(
                        'px-4 py-2 rounded-2xl text-sm leading-relaxed',
                        isMine
                          ? 'bg-gradient-to-br from-[var(--lavender)] to-[var(--rose-pink)] text-[var(--midnight)] rounded-br-md'
                          : 'bg-[var(--muted)] rounded-bl-md',
                        msg.message_type === 'emoji' && 'bg-transparent !text-3xl px-1 py-0'
                      )}>
                        {msg.content}
                      </div>
                      {/* Meta */}
                      <div className={cn('flex items-center gap-1 mt-0.5 px-1', isMine ? 'justify-end' : 'justify-start')}>
                        <span className="text-[9px] text-[var(--muted-foreground)]">{formatTime(msg.created_at)}</span>
                        {isMine && msg.is_read && <span className="text-[9px] text-[var(--lavender)]">✓✓</span>}
                        {msg.is_favorite && <Star className="w-2.5 h-2.5 text-amber-400" fill="currentColor" />}
                      </div>
                      {/* Actions on hover */}
                      <div className={cn('absolute top-0 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity',
                        isMine ? 'right-full mr-1' : 'left-full ml-1')}>
                        <button onClick={() => setReplyTo(msg)} className="p-1 rounded bg-[var(--muted)] hover:bg-[var(--border)] transition"><Reply className="w-3 h-3 text-[var(--muted-foreground)]" /></button>
                        <button onClick={() => toggleFavorite(msg)} className="p-1 rounded bg-[var(--muted)] hover:bg-[var(--border)] transition"><Star className="w-3 h-3 text-[var(--muted-foreground)]" /></button>
                        {isMine && <button onClick={() => deleteMessage(msg.id)} className="p-1 rounded bg-[var(--muted)] hover:bg-[var(--border)] transition"><Trash2 className="w-3 h-3 text-[var(--muted-foreground)]" /></button>}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick emojis */}
      <div className="flex gap-1 px-1 py-2 overflow-x-auto">
        {QUICK_EMOJIS.map((emoji) => (
          <button key={emoji} onClick={() => sendEmoji(emoji)} className="text-lg hover:scale-125 transition-transform px-1">{emoji}</button>
        ))}
      </div>

      {/* Reply bar */}
      <AnimatePresence>
        {replyTo && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="flex items-center gap-2 px-3 py-2 bg-[var(--muted)] rounded-t-lg border-l-2 border-[var(--lavender)]">
            <Reply className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
            <span className="text-xs text-[var(--muted-foreground)] flex-1 line-clamp-1">{replyTo.content}</span>
            <button onClick={() => setReplyTo(null)} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <form onSubmit={sendMessage} className="flex gap-2 pt-2 border-t border-[var(--border)]">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 h-11 px-4 rounded-full bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--lavender)] transition"
        />
        <Button type="submit" variant="romantic" size="icon" className="rounded-full w-11 h-11" disabled={!newMessage.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}

