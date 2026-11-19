'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/hooks/use-auth';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Sparkles, Plus, Heart, X, Trash2, Star, Search, Flower2
} from 'lucide-react';

interface LittleThing {
  id: string;
  content: string;
  author_id: string;
  is_favorite: boolean;
  created_at: string;
  category: string | null;
}

const CATEGORIES = [
  { value: 'moment', label: '✨ Small Moment', color: 'var(--lavender)' },
  { value: 'gratitude', label: '🙏 Grateful For', color: 'var(--rose-pink)' },
  { value: 'smile', label: '😊 Made Me Smile', color: 'var(--warm-cream)' },
  { value: 'love', label: '💕 Why I Love You', color: 'var(--lavender)' },
  { value: 'notice', label: '👀 I Noticed', color: 'var(--rose-pink)' },
];

export default function LittleThingsPage() {
  const { user } = useAuth();
  const [things, setThings] = useState<LittleThing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('moment');
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<string | null>(null);

  const supabase = createClient();

  const fetchThings = async () => {
    const { data } = await supabase
      .from('little_things')
      .select('*')
      .order('created_at', { ascending: false });
    setThings(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchThings(); }, []);

  const saveThing = async () => {
    if (!content.trim() || !user) return;
    setSaving(true);

    const { error } = await supabase.from('little_things').insert({
      content: content.trim(),
      category,
      author_id: user.id,
    });

    if (error) {
      toast.error('Failed to save');
    } else {
      toast.success('Little thing saved ♥');
      setContent('');
      setShowAdd(false);
      fetchThings();
    }
    setSaving(false);
  };

  const deleteThing = async (id: string) => {
    await supabase.from('little_things').delete().eq('id', id);
    toast.success('Removed');
    fetchThings();
  };

  const toggleFavorite = async (thing: LittleThing) => {
    await supabase
      .from('little_things')
      .update({ is_favorite: !thing.is_favorite })
      .eq('id', thing.id);
    fetchThings();
  };

  const filtered = things.filter((t) => {
    if (search && !t.content.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCat && t.category !== filterCat) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold gradient-text flex items-center gap-2">
            <Flower2 className="w-6 h-6" /> The Little Things
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            The small moments that make our love beautiful.
          </p>
        </div>
        <Button variant="romantic" onClick={() => setShowAdd(true)}>
          <Plus className="w-4 h-4" /> Add Something
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search little things..."
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--lavender)] transition"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterCat(null)}
            className={`px-3 py-1.5 rounded-full text-xs transition ${!filterCat ? 'bg-[var(--lavender)]/15 text-[var(--lavender)]' : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)]'}`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setFilterCat(filterCat === cat.value ? null : cat.value)}
              className={`px-3 py-1.5 rounded-full text-xs transition ${filterCat === cat.value ? 'bg-[var(--lavender)]/15 text-[var(--lavender)]' : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)]'}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-[var(--muted)] animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Sparkles className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-4" />
          <p className="text-[var(--muted-foreground)]">No little things yet.</p>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Start noticing the small beautiful moments together.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((thing, i) => {
            const cat = CATEGORIES.find((c) => c.value === thing.category);
            return (
              <motion.div
                key={thing.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="glass rounded-xl border border-[var(--border)] p-4 hover:border-[var(--lavender)]/30 transition-all group"
              >
                {cat && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--lavender)]/10 text-[var(--lavender)] mb-2 inline-block">
                    {cat.label}
                  </span>
                )}
                <p className="text-sm leading-relaxed mb-3">{thing.content}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[var(--muted-foreground)]">{formatDate(thing.created_at)}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => toggleFavorite(thing)}
                      className="p-1 text-[var(--muted-foreground)] hover:text-[var(--rose-pink)] transition"
                    >
                      <Star className="w-3.5 h-3.5" fill={thing.is_favorite ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      onClick={() => deleteThing(thing.id)}
                      className="p-1 text-[var(--muted-foreground)] hover:text-[var(--destructive)] transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowAdd(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-md glass rounded-2xl border border-[var(--border)] p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold gradient-text">A Little Thing</h2>
                <button onClick={() => setShowAdd(false)}>
                  <X className="w-5 h-5 text-[var(--muted-foreground)]" />
                </button>
              </div>

              <p className="text-xs text-[var(--muted-foreground)] mb-4">
                What small thing made your heart smile today?
              </p>

              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setCategory(cat.value)}
                      className={`px-3 py-1.5 rounded-full text-xs transition ${category === cat.value ? 'bg-[var(--lavender)]/15 text-[var(--lavender)] border border-[var(--lavender)]/30' : 'text-[var(--muted-foreground)] border border-[var(--border)] hover:border-[var(--lavender)]/20'}`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="The way you laughed today..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--lavender)] transition resize-none"
                  autoFocus
                />

                <Button
                  variant="romantic"
                  className="w-full"
                  onClick={saveThing}
                  disabled={saving || !content.trim()}
                >
                  {saving ? 'Saving...' : 'Save This Moment'} <Heart className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
