'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/hooks/use-auth';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Camera, Plus, X, Trash2, Heart, Upload, RotateCw
} from 'lucide-react';

interface Polaroid {
  id: string;
  image_url: string;
  caption: string | null;
  rotation: number;
  position_x: number;
  position_y: number;
  author_id: string;
  created_at: string;
}

function getRandomRotation() {
  return Math.floor(Math.random() * 16) - 8; // -8 to 8 degrees
}

function getRandomPosition(index: number) {
  // Distribute across a grid with some randomness
  const cols = 4;
  const col = index % cols;
  const row = Math.floor(index / cols);
  return {
    x: col * 25 + Math.random() * 5,
    y: row * 280 + Math.random() * 20,
  };
}

export default function PolaroidWallPage() {
  const { user } = useAuth();
  const [polaroids, setPolaroids] = useState<Polaroid[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [caption, setCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<Polaroid | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const supabase = createClient();

  const fetchPolaroids = async () => {
    const { data } = await supabase
      .from('polaroids')
      .select('*')
      .order('created_at', { ascending: false });
    setPolaroids(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchPolaroids(); }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large (max 10MB)');
      return;
    }
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const savePolaroid = async () => {
    if (!selectedFile || !user) return;
    setSaving(true);

    // Upload image
    const ext = selectedFile.name.split('.').pop() || 'jpg';
    const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('memories')
      .upload(path, selectedFile, { contentType: selectedFile.type });

    if (uploadError) {
      toast.error('Failed to upload photo');
      setSaving(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('memories').getPublicUrl(path);
    const pos = getRandomPosition(polaroids.length);

    const { error } = await supabase.from('polaroids').insert({
      image_url: urlData.publicUrl,
      caption: caption.trim() || null,
      rotation: getRandomRotation(),
      position_x: pos.x,
      position_y: pos.y,
      author_id: user.id,
    });

    if (error) {
      toast.error('Failed to save polaroid');
    } else {
      toast.success('Polaroid added to the wall ♥');
      setCaption('');
      setSelectedFile(null);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
      setShowAdd(false);
      fetchPolaroids();
    }
    setSaving(false);
  };

  const deletePolaroid = async (id: string) => {
    await supabase.from('polaroids').delete().eq('id', id);
    toast.success('Polaroid removed');
    setSelected(null);
    fetchPolaroids();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold gradient-text flex items-center gap-2">
            <Camera className="w-6 h-6" /> Polaroid Wall
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Our photo wall — scattered with love.
          </p>
        </div>
        <Button variant="romantic" onClick={() => setShowAdd(true)}>
          <Plus className="w-4 h-4" /> Add Polaroid
        </Button>
      </div>

      {/* Polaroid Wall */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 py-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-[3/4] rounded-sm bg-[var(--muted)] animate-pulse" />
          ))}
        </div>
      ) : polaroids.length === 0 ? (
        <div className="text-center py-16">
          <Camera className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-4" />
          <p className="text-[var(--muted-foreground)]">No polaroids yet.</p>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Add your first photo to the wall.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 py-4">
          {polaroids.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, scale: 0.8, rotate: p.rotation }}
              animate={{ opacity: 1, scale: 1, rotate: p.rotation }}
              transition={{ delay: i * 0.05, type: 'spring', stiffness: 200 }}
              whileHover={{ scale: 1.05, rotate: 0, zIndex: 10 }}
              className="cursor-pointer"
              onClick={() => setSelected(p)}
            >
              <div className="bg-white dark:bg-[#1a1a2e] p-3 pb-12 rounded-sm shadow-lg hover:shadow-xl transition-shadow relative">
                <img
                  src={p.image_url}
                  alt={p.caption || 'Polaroid'}
                  className="w-full aspect-square object-cover"
                />
                {p.caption && (
                  <p className="absolute bottom-3 left-3 right-3 text-center text-xs text-[var(--muted-foreground)] font-handwritten truncate">
                    {p.caption}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Polaroid Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => { setShowAdd(false); if (preview) URL.revokeObjectURL(preview); setPreview(null); setSelectedFile(null); }}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-sm glass rounded-2xl border border-[var(--border)] p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold gradient-text">New Polaroid</h2>
                <button onClick={() => { setShowAdd(false); if (preview) URL.revokeObjectURL(preview); setPreview(null); setSelectedFile(null); }}>
                  <X className="w-5 h-5 text-[var(--muted-foreground)]" />
                </button>
              </div>

              <div className="space-y-4">
                {preview ? (
                  <div className="relative">
                    <div className="bg-white dark:bg-[#1a1a2e] p-3 pb-10 rounded-sm shadow-lg mx-auto max-w-[200px]">
                      <img src={preview} alt="Preview" className="w-full aspect-square object-cover" />
                    </div>
                    <button
                      onClick={() => { if (preview) URL.revokeObjectURL(preview); setPreview(null); setSelectedFile(null); }}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full aspect-square max-w-[200px] mx-auto rounded-lg border-2 border-dashed border-[var(--border)] hover:border-[var(--lavender)]/40 transition flex flex-col items-center justify-center gap-2 text-[var(--muted-foreground)] hover:text-[var(--lavender)]"
                    >
                      <Upload className="w-8 h-8" />
                      <span className="text-xs">Choose a photo</span>
                    </button>
                  </>
                )}

                <input
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write a caption..."
                  className="w-full h-10 px-4 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-sm font-handwritten focus:outline-none focus:ring-2 focus:ring-[var(--lavender)] transition"
                />

                <Button
                  variant="romantic"
                  className="w-full"
                  onClick={savePolaroid}
                  disabled={saving || !selectedFile}
                >
                  {saving ? 'Uploading...' : 'Pin to Wall'} <Heart className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full View Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.8, rotate: selected.rotation }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.8 }}
              className="max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white dark:bg-[#1a1a2e] p-4 pb-16 rounded-sm shadow-2xl relative">
                <img
                  src={selected.image_url}
                  alt={selected.caption || 'Polaroid'}
                  className="w-full aspect-square object-cover"
                />
                {selected.caption && (
                  <p className="absolute bottom-5 left-4 right-4 text-center text-sm text-[var(--muted-foreground)] font-handwritten">
                    {selected.caption}
                  </p>
                )}
              </div>
              <div className="flex justify-center gap-3 mt-4">
                <button
                  onClick={() => setSelected(null)}
                  className="px-4 py-2 rounded-lg text-sm text-white/60 hover:text-white transition"
                >
                  Close
                </button>
                <button
                  onClick={() => deletePolaroid(selected.id)}
                  className="px-4 py-2 rounded-lg text-sm text-[var(--destructive)] hover:bg-[var(--destructive)]/10 transition flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
