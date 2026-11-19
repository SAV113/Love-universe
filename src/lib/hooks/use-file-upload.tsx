'use client';

import { useState, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

interface UploadedFile {
  file: File;
  preview: string;
}

interface UseFileUploadReturn {
  files: UploadedFile[];
  uploading: boolean;
  progress: number;
  inputRef: React.RefObject<HTMLInputElement | null>;
  pickFiles: () => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadFiles: (userId: string) => Promise<string[]>;
  removeFile: (index: number) => void;
  clearFiles: () => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm'];
const ACCEPTED_TYPES = [...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES];

export function useFileUpload(bucket: string): UseFileUploadReturn {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const pickFiles = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles: UploadedFile[] = [];

    for (const file of selectedFiles) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        continue;
      }
      validFiles.push({
        file,
        preview: URL.createObjectURL(file),
      });
    }

    setFiles((prev) => [...prev, ...validFiles]);
    // Reset input so the same file can be selected again
    if (inputRef.current) inputRef.current.value = '';
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  }, []);

  const clearFiles = useCallback(() => {
    files.forEach((f) => URL.revokeObjectURL(f.preview));
    setFiles([]);
    setProgress(0);
  }, [files]);

  const uploadFiles = useCallback(async (userId: string): Promise<string[]> => {
    if (files.length === 0) return [];
    setUploading(true);
    setProgress(0);

    const supabase = createClient();
    const urls: string[] = [];
    let completed = 0;

    for (const { file } of files) {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error } = await supabase.storage
        .from(bucket)
        .upload(path, file, { contentType: file.type, upsert: false });

      if (!error) {
        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
        urls.push(urlData.publicUrl);
      }

      completed++;
      setProgress(Math.round((completed / files.length) * 100));
    }

    setUploading(false);
    return urls;
  }, [files, bucket]);

  return {
    files,
    uploading,
    progress,
    inputRef,
    pickFiles,
    handleFileChange,
    uploadFiles,
    removeFile,
    clearFiles,
  };
}

