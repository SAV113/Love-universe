'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/hooks/use-auth';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { formatDate, cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { Memory } from '@/types/database';
import {
  Image as ImageIcon, Plus, Search, Star, Trash2, Edit, X,
  MapPin, Calendar, Tag, ChevronLeft, ChevronRight, Heart, Filter,
  Upload, Camera
} from 'lucide-react';

export default function MemoriesPage() {
  const { user } = useAuth();
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editing, setEditing] = useState<Memory | null>(null);
  const [viewer, setViewer] = useState<{ memory: Memory; index: number } | null>(null);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'grid' | 'timeline'>('grid');

  // Editor state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState('');
  const [saving, setSaving] = useState(false);

  // Photo upload state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [existingUrls, setExistingUrls] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const supabase = createClient();

  const fetchMemories = async () => {
    const { data } = await supabase.from('memories').select('*').order('date', { ascending: false });
    setMemories(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchMemories(); }, []);

  const resetEditor = () => {
    setTitle(''); setDescription(''); setDate(new Date().toISOString().split('T')[0]);
    setLocation(''); setTags(''); setEditing(null);
    // Clear file state
    previews.forEach((p) => URL.revokeObjectURL(p));
    setSelectedFiles([]); setPreviews([]); setExistingUrls([]);
    setUploadProgress(0);
  };

  const openEditor = (memory?: Memory) => {
    if (memory) {
      setEditing(memory);
      setTitle(memory.title); setDescription(memory.description || '');
      setDate(memory.date); setLocation(memory.location || '');
      setTags(memory.tags?.join(', ') || '');
      setExistingUrls(memory.media_urls || []);
    } else resetEditor();
    setShowEditor(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 10MB)`);
        continue;
      }
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        toast.error(`${file.name} is not a supported format`);
        continue;
      }
      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }

    setSelectedFiles((prev) => [...prev, ...validFiles]);
    setPreviews((prev) => [...prev, ...newPreviews]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeNewFile = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingUrl = (index: number) => {
    setExistingUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async (): Promise<string[]> => {
    if (selectedFiles.length === 0) return [];
    if (!user) return [];

    const urls: string[] = [];
    let completed = 0;

    for (const file of selectedFiles) {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error } = await supabase.storage
        .from('memories')
        .upload(path, file, { contentType: file.type });

      if (!error) {
        const { data } = supabase.storage.from('memories').getPublicUrl(path);
        urls.push(data.publicUrl);
      } else {
        toast.error(`Failed to upload ${file.name}`);
      }

      completed++;
      setUploadProgress(Math.round((completed / selectedFiles.length) * 100));
    }

    return urls;
  };

  const saveMemory = async () => {
    if (!title.trim()) { toast.error('Give your memory a title'); return; }
    if (!user) return;
    setSaving(true);

    // Upload new files first
    const newUrls = await uploadFiles();
    const allUrls = [...existingUrls, ...newUrls];

    const memoryData = {
      title: title.trim(),
      description: description || null,
      date,
      location: location || null,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      media_urls: allUrls.length > 0 ? allUrls : null,
      author_id: user.id,
    };

    if (editing) {
      const { error } = await supabase.from('memories').update(memoryData).eq('id', editing.id);
      if (error) { toast.error('Failed to update'); setSaving(false); return; }
      toast.success('Memory updated ♥');
    } else {
      const { error } = await supabase.from('memories').insert(memoryData);
      if (error) { toast.error('Failed to save'); setSaving(false); return; }
      toast.success('Memory saved forever ♥');
    }

    setSaving(false); setShowEditor(false); resetEditor(); fetchMemories();
  };

  const deleteMemory = async (id: string) => {
    await supabase.from('memories').delete().eq('id', id);
    toast.success('Memory removed');
    fetchMemories();
  };

  const toggleFavorite = async (m: Memory) => {
    await supabase.from('memories').update({ is_favorite: !m.is_favorite }).eq('id', m.id);
    fetchMemories();
  };

  const filtered = memories.filter((m) => {
    if (search && !m.title.toLowerCase().includes(search.toLowerCase()) && !m.description?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Group by year for timeline
  const grouped = filtered.reduce((acc, m) => {
    const year = new Date(m.date).getFullYear().toString();
    if (!acc[year]) acc[year] = [];
    acc[year].push(m);
    return acc;
  }, {} as Record<string, Memory[]>);

  // Viewer navigation
  const viewerNav = (dir: number) => {
    if (!viewer) return;
    const newIndex = viewer.index + dir;
    if (newIndex >= 0 && newIndex < filtered.length) {
      setViewer({ memory: filtered[newIndex], index: newIndex });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold gradient-text flex items-center gap-2">
            <ImageIcon className="w-6 h-6" /> Memory Garden
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">Our beautiful moments, kept forever.</p>
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-lg border border-[var(--border)] overflow-hidden">
            <button onClick={() => setView('grid')} className={cn('px-3 py-1.5 text-xs transition', view === 'grid' ? 'bg-[var(--lavender)]/15 text-[var(--lavender)]' : 'text-[var(--muted-foreground)]')}>Grid</button>
            <button onClick={() => setView('timeline')} className={cn('px-3 py-1.5 text-xs transition', view === 'timeline' ? 'bg-[var(--lavender)]/15 text-[var(--lavender)]' : 'text-[var(--muted-foreground)]')}>Timeline</button>
          </div>
          <Button variant="romantic" onClick={() => openEditor()}>
            <Plus className="w-4 h-4" /> Add Memory
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search memories..." className="w-full h-10 pl-10 pr-4 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--lavender)] transition" />
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-sm text-[var(--muted-foreground)]">
        <span>{memories.length} memories</span>
        <span>·</span>
        <span>{memories.filter((m) => m.is_favorite).length} favorites</span>
        <span>·</span>
        <span>{memories.filter((m) => m.media_urls && m.media_urls.length > 0).length} with photos</span>
      </div>

      {/* Content */}
      {loading ? (
        <div className="masonry-grid">{[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-48 rounded-xl bg-[var(--muted)] animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <ImageIcon className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-4" />
          <p className="text-[var(--muted-foreground)]">No memories yet. Start capturing your beautiful moments.</p>
        </div>
      ) : view === 'grid' ? (
        <div className="masonry-grid">
          {filtered.map((m, i) => (
            <motion.div key={m.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="glass rounded-xl border border-[var(--border)] hover:border-[var(--lavender)]/30 transition-all overflow-hidden group cursor-pointer"
              onClick={() => setViewer({ memory: m, index: i })}
            >
              {m.media_urls?.[0] ? (
                <img src={m.media_urls[0]} alt={m.title} className="w-full aspect-video object-cover" />
              ) : (
                <div className="w-full aspect-video bg-gradient-to-br from-[var(--deep-purple)] to-[var(--midnight)] flex items-center justify-center">
                  <Heart className="w-8 h-8 text-[var(--lavender)] opacity-30" />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-semibold mb-1 line-clamp-1">{m.title}</h3>
                {m.description && <p className="text-sm text-[var(--muted-foreground)] line-clamp-2 mb-2">{m.description}</p>}
                <div className="flex items-center gap-3 text-xs text-[var(--muted-foreground)]">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(m.date)}</span>
                  {m.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{m.location}</span>}
                </div>
                {m.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {m.tags.map((t) => <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--lavender)]/10 text-[var(--lavender)]">{t}</span>)}
                  </div>
                )}
                {m.media_urls && m.media_urls.length > 1 && (
                  <p className="text-[10px] text-[var(--muted-foreground)] mt-2 flex items-center gap-1">
                    <Camera className="w-3 h-3" /> {m.media_urls.length} photos
                  </p>
                )}
              </div>
              <div className="flex border-t border-[var(--border)] opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => { e.stopPropagation(); toggleFavorite(m); }} className="flex-1 py-2 text-xs text-[var(--muted-foreground)] hover:text-[var(--rose-pink)] transition flex items-center justify-center">
                  <Star className="w-3 h-3" fill={m.is_favorite ? 'currentColor' : 'none'} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); openEditor(m); }} className="flex-1 py-2 text-xs text-[var(--muted-foreground)] hover:text-[var(--lavender)] transition flex items-center justify-center">
                  <Edit className="w-3 h-3" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); deleteMemory(m.id); }} className="flex-1 py-2 text-xs text-[var(--muted-foreground)] hover:text-[var(--destructive)] transition flex items-center justify-center">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* Timeline View */
        <div className="space-y-8">
          {Object.entries(grouped).sort(([a], [b]) => Number(b) - Number(a)).map(([year, mems]) => (
            <div key={year}>
              <h3 className="text-lg font-bold gradient-text mb-4 sticky top-0 bg-[var(--background)] py-2 z-10">{year}</h3>
              <div className="relative pl-8 border-l-2 border-[var(--border)] space-y-6">
                {mems.map((m) => (
                  <div key={m.id} className="relative">
                    <div className="absolute -left-[calc(2rem+5px)] w-3 h-3 rounded-full bg-[var(--lavender)] border-2 border-[var(--background)]" />
                    <div className="glass rounded-xl border border-[var(--border)] p-4 hover:border-[var(--lavender)]/30 transition cursor-pointer overflow-hidden" onClick={() => setViewer({ memory: m, index: 0 })}>
                      {m.media_urls?.[0] && (
                        <img src={m.media_urls[0]} alt={m.title} className="w-full aspect-video object-cover rounded-lg mb-3" />
                      )}
                      <p className="text-xs text-[var(--muted-foreground)] mb-1">{formatDate(m.date)}</p>
                      <h4 className="font-semibold">{m.title}</h4>
                      {m.description && <p className="text-sm text-[var(--muted-foreground)] mt-1">{m.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Memory Editor Modal */}
      <AnimatePresence>
        {showEditor && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => { setShowEditor(false); resetEditor(); }}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="w-full max-w-lg glass rounded-2xl border border-[var(--border)] p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold gradient-text">{editing ? 'Edit Memory' : 'New Memory'}</h2>
                <button onClick={() => { setShowEditor(false); resetEditor(); }}><X className="w-5 h-5 text-[var(--muted-foreground)]" /></button>
              </div>
              <div className="space-y-4">
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Memory title..." className="w-full h-11 px-4 rounded-lg bg-[var(--muted)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--lavender)] transition" />
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What happened?" rows={4} className="w-full px-4 py-3 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--lavender)] transition resize-none" />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[var(--muted-foreground)] mb-1 block">Date</label>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full h-10 px-3 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--lavender)]" />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--muted-foreground)] mb-1 block">Location</label>
                    <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Where?" className="w-full h-10 px-3 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--lavender)]" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[var(--muted-foreground)] mb-1 block">Tags (comma separated)</label>
                  <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="first date, special, funny..." className="w-full h-10 px-3 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--lavender)]" />
                </div>

                {/* Photo Upload Section */}
                <div>
                  <label className="text-xs text-[var(--muted-foreground)] mb-2 block flex items-center gap-1">
                    <Camera className="w-3 h-3" /> Photos
                  </label>

                  {/* Existing photos (when editing) */}
                  {existingUrls.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {existingUrls.map((url, i) => (
                        <div key={url} className="relative w-20 h-20 rounded-lg overflow-hidden border border-[var(--border)] group">
                          <img src={url} alt="" className="w-full h-full object-cover" />
                          <button
                            onClick={() => removeExistingUrl(i)}
                            className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                          >
                            <X className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* New file previews */}
                  {previews.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {previews.map((preview, i) => (
                        <div key={preview} className="relative w-20 h-20 rounded-lg overflow-hidden border border-[var(--lavender)]/30 group">
                          <img src={preview} alt="" className="w-full h-full object-cover" />
                          <button
                            onClick={() => removeNewFile(i)}
                            className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                          >
                            <X className="w-3 h-3 text-white" />
                          </button>
                          <div className="absolute bottom-0.5 left-0.5 px-1 py-0.5 rounded bg-[var(--lavender)]/80 text-[8px] text-white font-bold">NEW</div>
                        </div>
                      ))}
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-20 rounded-lg border-2 border-dashed border-[var(--border)] hover:border-[var(--lavender)]/40 transition flex flex-col items-center justify-center gap-1 text-[var(--muted-foreground)] hover:text-[var(--lavender)]"
                  >
                    <Upload className="w-5 h-5" />
                    <span className="text-xs">Click to add photos</span>
                  </button>
                </div>

                {/* Upload progress */}
                {saving && uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="w-full bg-[var(--muted)] rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[var(--lavender)] to-[var(--rose-pink)] transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}

                <Button variant="romantic" className="w-full" onClick={saveMemory} disabled={saving}>
                  {saving ? (uploadProgress > 0 ? `Uploading... ${uploadProgress}%` : 'Saving...') : editing ? 'Update Memory' : 'Save This Memory'} <Heart className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full-screen Viewer */}
      <AnimatePresence>
        {viewer && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setViewer(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="max-w-2xl w-full text-center" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setViewer(null)} className="absolute top-4 right-4 text-white/60 hover:text-white z-10"><X className="w-6 h-6" /></button>

              {/* Nav arrows */}
              {viewer.index > 0 && (
                <button onClick={() => viewerNav(-1)} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white z-10">
                  <ChevronLeft className="w-8 h-8" />
                </button>
              )}
              {viewer.index < filtered.length - 1 && (
                <button onClick={() => viewerNav(1)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white z-10">
                  <ChevronRight className="w-8 h-8" />
                </button>
              )}

              {viewer.memory.media_urls?.[0] ? (
                <img src={viewer.memory.media_urls[0]} alt={viewer.memory.title} className="max-h-[60vh] mx-auto rounded-lg object-contain mb-4" />
              ) : (
                <div className="w-full aspect-video max-h-[60vh] bg-gradient-to-br from-[var(--deep-purple)] to-[var(--midnight)] rounded-lg flex items-center justify-center mb-4">
                  <Heart className="w-16 h-16 text-[var(--lavender)] opacity-20" />
                </div>
              )}

              {/* Photo gallery for multiple photos */}
              {viewer.memory.media_urls && viewer.memory.media_urls.length > 1 && (
                <div className="flex gap-2 justify-center mb-4 overflow-x-auto px-4 py-2">
                  {viewer.memory.media_urls.map((url, i) => (
                    <img
                      key={url}
                      src={url}
                      alt=""
                      className="w-16 h-16 rounded-lg object-cover cursor-pointer border-2 border-transparent hover:border-[var(--lavender)] transition"
                      onClick={() => {
                        // Update the main image
                        const updatedMemory = { ...viewer.memory, media_urls: [url, ...viewer.memory.media_urls!.filter((_, idx) => idx !== i)] };
                        setViewer({ ...viewer, memory: updatedMemory });
                      }}
                    />
                  ))}
                </div>
              )}

              <h2 className="text-2xl font-bold text-white mb-2">{viewer.memory.title}</h2>
              {viewer.memory.description && <p className="text-white/60 mb-3">{viewer.memory.description}</p>}
              <div className="flex items-center justify-center gap-4 text-white/40 text-sm">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(viewer.memory.date)}</span>
                {viewer.memory.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{viewer.memory.location}</span>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
