// ============================================================
// Our Little Universe — Database Types
// ============================================================

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// ---------- Profiles ----------
export interface Profile {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string | null;
  role: 'owner' | 'partner';
  created_at: string;
  updated_at: string;
}

// ---------- Relationship Settings ----------
export interface RelationshipSettings {
  id: string;
  owner_id: string;
  partner_id: string | null;
  owner_name: string;
  partner_name: string;
  anniversary_date: string;
  website_title: string;
  greeting_message: string;
  theme: 'dark' | 'light';
  background_music_enabled: boolean;
  background_music_url: string | null;
  invite_code: string | null;
  created_at: string;
  updated_at: string;
}

// ---------- Love Letters ----------
export interface LoveLetter {
  id: string;
  author_id: string;
  title: string;
  content: string;
  category: LetterCategory;
  is_draft: boolean;
  is_favorite: boolean;
  scheduled_date: string | null;
  is_published: boolean;
  open_when_tag: string | null;
  photo_urls: string[];
  use_handwritten_font: boolean;
  created_at: string;
  updated_at: string;
}

export type LetterCategory =
  | 'when-i-miss-you'
  | 'reasons-i-love-you'
  | 'apologies'
  | 'good-morning'
  | 'good-night'
  | 'special-occasions'
  | 'random-love-notes'
  | 'open-when';

// ---------- Memories ----------
export interface Memory {
  id: string;
  author_id: string;
  title: string;
  description: string | null;
  date: string;
  location: string | null;
  media_urls: string[];
  media_type: 'photo' | 'video';
  album_id: string | null;
  tags: string[];
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface MemoryAlbum {
  id: string;
  author_id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  created_at: string;
  updated_at: string;
}

// ---------- Journal Entries ----------
export interface JournalEntry {
  id: string;
  author_id: string;
  title: string;
  content: string;
  mood: MoodType;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

export type MoodType = 'happy' | 'loved' | 'sad' | 'angry' | 'anxious' | 'tired' | 'peaceful';

export interface JournalComment {
  id: string;
  entry_id: string;
  author_id: string;
  content: string;
  created_at: string;
}

// ---------- Love Reasons ----------
export interface LoveReason {
  id: string;
  author_id: string;
  reason: string;
  category: string | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

// ---------- Relationship Milestones ----------
export interface RelationshipMilestone {
  id: string;
  title: string;
  description: string | null;
  date: string;
  icon: string | null;
  photo_url: string | null;
  author_id: string;
  created_at: string;
  updated_at: string;
}

// ---------- Special Dates ----------
export interface SpecialDate {
  id: string;
  title: string;
  date: string;
  is_recurring: boolean;
  reminder_days_before: number;
  author_id: string;
  created_at: string;
  updated_at: string;
}

// ---------- Daily Messages ----------
export interface DailyMessage {
  id: string;
  author_id: string;
  content: string;
  message_type: 'love' | 'good-morning' | 'good-night' | 'random' | 'custom';
  scheduled_date: string | null;
  is_read: boolean;
  created_at: string;
}

// ---------- Date Plans ----------
export interface DatePlan {
  id: string;
  author_id: string;
  title: string;
  description: string | null;
  date: string | null;
  time: string | null;
  location: string | null;
  budget: number | null;
  notes: string | null;
  photo_urls: string[];
  is_completed: boolean;
  is_idea: boolean;
  created_at: string;
  updated_at: string;
}

export interface DateActivity {
  id: string;
  date_plan_id: string;
  title: string;
  description: string | null;
  is_completed: boolean;
  order_index: number;
  created_at: string;
}

// ---------- Surprises ----------
export interface Surprise {
  id: string;
  author_id: string;
  surprise_type: 'message' | 'memory' | 'reason' | 'hug' | 'letter' | 'special';
  content: string;
  photo_url: string | null;
  unlock_date: string | null;
  is_revealed: boolean;
  created_at: string;
}

// ---------- Dream Board ----------
export interface DreamBoardItem {
  id: string;
  author_id: string;
  title: string;
  description: string | null;
  category: string;
  photo_url: string | null;
  is_completed: boolean;
  target_date: string | null;
  created_at: string;
  updated_at: string;
}

// ---------- Chat Messages ----------
export interface ChatMessage {
  id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'photo' | 'emoji';
  photo_url: string | null;
  reply_to_id: string | null;
  is_read: boolean;
  is_favorite: boolean;
  is_deleted: boolean;
  created_at: string;
}

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

// ---------- Love Capsules ----------
export interface LoveCapsule {
  id: string;
  author_id: string;
  title: string;
  content: string;
  photo_url: string | null;
  unlock_date: string;
  is_opened: boolean;
  created_at: string;
}

// ---------- Notifications ----------
export interface UserNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  link: string | null;
  created_at: string;
}

// ---------- Database Helper Types ----------
export type InsertProfile = Omit<Profile, 'created_at' | 'updated_at'>;
export type UpdateProfile = Partial<Omit<Profile, 'id' | 'created_at'>>;

export type InsertLoveLetter = Omit<LoveLetter, 'id' | 'created_at' | 'updated_at'>;
export type UpdateLoveLetter = Partial<Omit<LoveLetter, 'id' | 'author_id' | 'created_at'>>;

export type InsertMemory = Omit<Memory, 'id' | 'created_at' | 'updated_at'>;
export type UpdateMemory = Partial<Omit<Memory, 'id' | 'author_id' | 'created_at'>>;

export type InsertJournalEntry = Omit<JournalEntry, 'id' | 'created_at' | 'updated_at'>;
export type UpdateJournalEntry = Partial<Omit<JournalEntry, 'id' | 'author_id' | 'created_at'>>;

export type InsertLoveReason = Omit<LoveReason, 'id' | 'created_at' | 'updated_at'>;
export type UpdateLoveReason = Partial<Omit<LoveReason, 'id' | 'author_id' | 'created_at'>>;

export type InsertMilestone = Omit<RelationshipMilestone, 'id' | 'created_at' | 'updated_at'>;
export type UpdateMilestone = Partial<Omit<RelationshipMilestone, 'id' | 'author_id' | 'created_at'>>;

export type InsertDatePlan = Omit<DatePlan, 'id' | 'created_at' | 'updated_at'>;
export type UpdateDatePlan = Partial<Omit<DatePlan, 'id' | 'author_id' | 'created_at'>>;

export type InsertDreamBoardItem = Omit<DreamBoardItem, 'id' | 'created_at' | 'updated_at'>;
export type UpdateDreamBoardItem = Partial<Omit<DreamBoardItem, 'id' | 'author_id' | 'created_at'>>;

export type InsertChatMessage = Omit<ChatMessage, 'id' | 'created_at'>;
export type InsertSurprise = Omit<Surprise, 'id' | 'created_at'>;
export type InsertLoveCapsule = Omit<LoveCapsule, 'id' | 'created_at'>;
export type InsertDailyMessage = Omit<DailyMessage, 'id' | 'created_at'>;
