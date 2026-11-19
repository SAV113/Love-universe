-- ============================================================
-- Our Little Universe — Complete Database Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'partner' CHECK (role IN ('owner', 'partner')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2. RELATIONSHIP SETTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS relationship_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  owner_name TEXT NOT NULL DEFAULT 'Benjamin',
  partner_name TEXT NOT NULL DEFAULT 'My Love',
  anniversary_date DATE NOT NULL DEFAULT CURRENT_DATE,
  website_title TEXT NOT NULL DEFAULT 'Our Little Universe',
  greeting_message TEXT NOT NULL DEFAULT 'Welcome to our little universe.',
  theme TEXT NOT NULL DEFAULT 'dark' CHECK (theme IN ('dark', 'light')),
  background_music_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  background_music_url TEXT,
  invite_code TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. LOVE LETTERS
-- ============================================================
CREATE TABLE IF NOT EXISTS love_letters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'random-love-notes' CHECK (category IN (
    'when-i-miss-you', 'reasons-i-love-you', 'apologies',
    'good-morning', 'good-night', 'special-occasions',
    'random-love-notes', 'open-when'
  )),
  is_draft BOOLEAN NOT NULL DEFAULT TRUE,
  is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
  scheduled_date TIMESTAMPTZ,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  open_when_tag TEXT,
  photo_urls TEXT[] DEFAULT '{}',
  use_handwritten_font BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_love_letters_author ON love_letters(author_id);
CREATE INDEX IF NOT EXISTS idx_love_letters_category ON love_letters(category);
CREATE INDEX IF NOT EXISTS idx_love_letters_scheduled ON love_letters(scheduled_date) WHERE scheduled_date IS NOT NULL;

-- ============================================================
-- 4. MEMORY ALBUMS
-- ============================================================
CREATE TABLE IF NOT EXISTS memory_albums (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 5. MEMORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  location TEXT,
  media_urls TEXT[] DEFAULT '{}',
  media_type TEXT NOT NULL DEFAULT 'photo' CHECK (media_type IN ('photo', 'video')),
  album_id UUID REFERENCES memory_albums(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_memories_author ON memories(author_id);
CREATE INDEX IF NOT EXISTS idx_memories_date ON memories(date);
CREATE INDEX IF NOT EXISTS idx_memories_album ON memories(album_id) WHERE album_id IS NOT NULL;

-- ============================================================
-- 6. JOURNAL ENTRIES
-- ============================================================
CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  mood TEXT NOT NULL DEFAULT 'peaceful' CHECK (mood IN (
    'happy', 'loved', 'sad', 'angry', 'anxious', 'tired', 'peaceful'
  )),
  is_private BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_journal_author ON journal_entries(author_id);
CREATE INDEX IF NOT EXISTS idx_journal_mood ON journal_entries(mood);

-- ============================================================
-- 7. JOURNAL COMMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS journal_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_journal_comments_entry ON journal_comments(entry_id);

-- ============================================================
-- 8. LOVE REASONS
-- ============================================================
CREATE TABLE IF NOT EXISTS love_reasons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  category TEXT,
  is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_love_reasons_author ON love_reasons(author_id);

-- ============================================================
-- 9. RELATIONSHIP MILESTONES
-- ============================================================
CREATE TABLE IF NOT EXISTS relationship_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  icon TEXT,
  photo_url TEXT,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_milestones_date ON relationship_milestones(date);

-- ============================================================
-- 10. SPECIAL DATES
-- ============================================================
CREATE TABLE IF NOT EXISTS special_dates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
  reminder_days_before INTEGER NOT NULL DEFAULT 7,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_special_dates_date ON special_dates(date);

-- ============================================================
-- 11. DAILY MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS daily_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'love' CHECK (message_type IN (
    'love', 'good-morning', 'good-night', 'random', 'custom'
  )),
  scheduled_date DATE,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_messages_scheduled ON daily_messages(scheduled_date);

-- ============================================================
-- 12. DATE PLANS
-- ============================================================
CREATE TABLE IF NOT EXISTS date_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  date DATE,
  time TIME,
  location TEXT,
  budget DECIMAL(10,2),
  notes TEXT,
  photo_urls TEXT[] DEFAULT '{}',
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  is_idea BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_date_plans_date ON date_plans(date) WHERE date IS NOT NULL;

-- ============================================================
-- 13. DATE ACTIVITIES
-- ============================================================
CREATE TABLE IF NOT EXISTS date_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date_plan_id UUID NOT NULL REFERENCES date_plans(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_date_activities_plan ON date_activities(date_plan_id);

-- ============================================================
-- 14. SURPRISES
-- ============================================================
CREATE TABLE IF NOT EXISTS surprises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  surprise_type TEXT NOT NULL DEFAULT 'message' CHECK (surprise_type IN (
    'message', 'memory', 'reason', 'hug', 'letter', 'special'
  )),
  content TEXT NOT NULL,
  photo_url TEXT,
  unlock_date DATE,
  is_revealed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 15. DREAM BOARD ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS dream_board_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  photo_url TEXT,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  target_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dream_board_category ON dream_board_items(category);

-- ============================================================
-- 16. CHAT MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL DEFAULT '',
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'photo', 'emoji')),
  photo_url TEXT,
  reply_to_id UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender_id);

-- ============================================================
-- 17. MESSAGE REACTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS message_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(message_id, user_id, emoji)
);

CREATE INDEX IF NOT EXISTS idx_message_reactions_message ON message_reactions(message_id);

-- ============================================================
-- 18. LOVE CAPSULES
-- ============================================================
CREATE TABLE IF NOT EXISTS love_capsules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  photo_url TEXT,
  unlock_date DATE NOT NULL,
  is_opened BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_love_capsules_unlock ON love_capsules(unlock_date);

-- ============================================================
-- 19. NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT NOT NULL DEFAULT 'general',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read) WHERE is_read = FALSE;

-- ============================================================
-- Updated_at triggers
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'profiles', 'relationship_settings', 'love_letters',
      'memory_albums', 'memories', 'journal_entries',
      'love_reasons', 'relationship_milestones', 'special_dates',
      'date_plans', 'dream_board_items'
    ])
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS update_%I_updated_at ON %I;
    CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();',
      tbl, tbl
    );
  END LOOP;
END;
$$;

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationship_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE love_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE love_reasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationship_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE special_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE date_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE date_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE surprises ENABLE ROW LEVEL SECURITY;
ALTER TABLE dream_board_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE love_capsules ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Helper function: check if user is part of the relationship
CREATE OR REPLACE FUNCTION is_relationship_member(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM relationship_settings
    WHERE owner_id = user_uuid OR partner_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PROFILES: users can read both profiles, update only their own
DROP POLICY IF EXISTS "Users can view relationship profiles" ON profiles;
CREATE POLICY "Users can view relationship profiles" ON profiles
  FOR SELECT USING (is_relationship_member(auth.uid()));

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- RELATIONSHIP SETTINGS: both can read, owner can update
DROP POLICY IF EXISTS "Members can view settings" ON relationship_settings;
CREATE POLICY "Members can view settings" ON relationship_settings
  FOR SELECT USING (is_relationship_member(auth.uid()));

DROP POLICY IF EXISTS "Owner can update settings" ON relationship_settings;
CREATE POLICY "Owner can update settings" ON relationship_settings
  FOR UPDATE USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "Owner can insert settings" ON relationship_settings;
CREATE POLICY "Owner can insert settings" ON relationship_settings
  FOR INSERT WITH CHECK (owner_id = auth.uid());

-- LOVE LETTERS: both can read published, author can CRUD
DROP POLICY IF EXISTS "Members can view published letters" ON love_letters;
CREATE POLICY "Members can view published letters" ON love_letters
  FOR SELECT USING (
    is_relationship_member(auth.uid()) AND
    (is_published = TRUE OR author_id = auth.uid())
  );

DROP POLICY IF EXISTS "Members can create letters" ON love_letters;
CREATE POLICY "Members can create letters" ON love_letters
  FOR INSERT WITH CHECK (is_relationship_member(auth.uid()) AND author_id = auth.uid());

DROP POLICY IF EXISTS "Authors can update own letters" ON love_letters;
CREATE POLICY "Authors can update own letters" ON love_letters
  FOR UPDATE USING (author_id = auth.uid());

DROP POLICY IF EXISTS "Authors can delete own letters" ON love_letters;
CREATE POLICY "Authors can delete own letters" ON love_letters
  FOR DELETE USING (author_id = auth.uid());

-- MEMORIES: all members can CRUD
DROP POLICY IF EXISTS "Members can view memories" ON memories;
CREATE POLICY "Members can view memories" ON memories
  FOR SELECT USING (is_relationship_member(auth.uid()));

DROP POLICY IF EXISTS "Members can create memories" ON memories;
CREATE POLICY "Members can create memories" ON memories
  FOR INSERT WITH CHECK (is_relationship_member(auth.uid()) AND author_id = auth.uid());

DROP POLICY IF EXISTS "Authors can update own memories" ON memories;
CREATE POLICY "Authors can update own memories" ON memories
  FOR UPDATE USING (author_id = auth.uid());

DROP POLICY IF EXISTS "Authors can delete own memories" ON memories;
CREATE POLICY "Authors can delete own memories" ON memories
  FOR DELETE USING (author_id = auth.uid());

-- MEMORY ALBUMS: all members can CRUD
DROP POLICY IF EXISTS "Members can view albums" ON memory_albums;
CREATE POLICY "Members can view albums" ON memory_albums
  FOR SELECT USING (is_relationship_member(auth.uid()));

DROP POLICY IF EXISTS "Members can create albums" ON memory_albums;
CREATE POLICY "Members can create albums" ON memory_albums
  FOR INSERT WITH CHECK (is_relationship_member(auth.uid()) AND author_id = auth.uid());

DROP POLICY IF EXISTS "Authors can update own albums" ON memory_albums;
CREATE POLICY "Authors can update own albums" ON memory_albums
  FOR UPDATE USING (author_id = auth.uid());

DROP POLICY IF EXISTS "Authors can delete own albums" ON memory_albums;
CREATE POLICY "Authors can delete own albums" ON memory_albums
  FOR DELETE USING (author_id = auth.uid());

-- JOURNAL ENTRIES: private entries only visible to author, shared to both
DROP POLICY IF EXISTS "Members can view shared entries" ON journal_entries;
CREATE POLICY "Members can view shared entries" ON journal_entries
  FOR SELECT USING (
    is_relationship_member(auth.uid()) AND
    (is_private = FALSE OR author_id = auth.uid())
  );

DROP POLICY IF EXISTS "Members can create entries" ON journal_entries;
CREATE POLICY "Members can create entries" ON journal_entries
  FOR INSERT WITH CHECK (is_relationship_member(auth.uid()) AND author_id = auth.uid());

DROP POLICY IF EXISTS "Authors can update own entries" ON journal_entries;
CREATE POLICY "Authors can update own entries" ON journal_entries
  FOR UPDATE USING (author_id = auth.uid());

DROP POLICY IF EXISTS "Authors can delete own entries" ON journal_entries;
CREATE POLICY "Authors can delete own entries" ON journal_entries
  FOR DELETE USING (author_id = auth.uid());

-- JOURNAL COMMENTS: members can comment on shared entries
DROP POLICY IF EXISTS "Members can view comments" ON journal_comments;
CREATE POLICY "Members can view comments" ON journal_comments
  FOR SELECT USING (is_relationship_member(auth.uid()));

DROP POLICY IF EXISTS "Members can create comments" ON journal_comments;
CREATE POLICY "Members can create comments" ON journal_comments
  FOR INSERT WITH CHECK (is_relationship_member(auth.uid()) AND author_id = auth.uid());

DROP POLICY IF EXISTS "Authors can delete own comments" ON journal_comments;
CREATE POLICY "Authors can delete own comments" ON journal_comments
  FOR DELETE USING (author_id = auth.uid());

-- LOVE REASONS: all members
DROP POLICY IF EXISTS "Members can view reasons" ON love_reasons;
CREATE POLICY "Members can view reasons" ON love_reasons
  FOR SELECT USING (is_relationship_member(auth.uid()));

DROP POLICY IF EXISTS "Members can create reasons" ON love_reasons;
CREATE POLICY "Members can create reasons" ON love_reasons
  FOR INSERT WITH CHECK (is_relationship_member(auth.uid()) AND author_id = auth.uid());

DROP POLICY IF EXISTS "Authors can update own reasons" ON love_reasons;
CREATE POLICY "Authors can update own reasons" ON love_reasons
  FOR UPDATE USING (author_id = auth.uid());

DROP POLICY IF EXISTS "Authors can delete own reasons" ON love_reasons;
CREATE POLICY "Authors can delete own reasons" ON love_reasons
  FOR DELETE USING (author_id = auth.uid());

-- MILESTONES: all members
DROP POLICY IF EXISTS "Members can view milestones" ON relationship_milestones;
CREATE POLICY "Members can view milestones" ON relationship_milestones
  FOR SELECT USING (is_relationship_member(auth.uid()));

DROP POLICY IF EXISTS "Members can create milestones" ON relationship_milestones;
CREATE POLICY "Members can create milestones" ON relationship_milestones
  FOR INSERT WITH CHECK (is_relationship_member(auth.uid()) AND author_id = auth.uid());

DROP POLICY IF EXISTS "Authors can update own milestones" ON relationship_milestones;
CREATE POLICY "Authors can update own milestones" ON relationship_milestones
  FOR UPDATE USING (author_id = auth.uid());

DROP POLICY IF EXISTS "Authors can delete own milestones" ON relationship_milestones;
CREATE POLICY "Authors can delete own milestones" ON relationship_milestones
  FOR DELETE USING (author_id = auth.uid());

-- SPECIAL DATES: all members
DROP POLICY IF EXISTS "Members can view special dates" ON special_dates;
CREATE POLICY "Members can view special dates" ON special_dates
  FOR SELECT USING (is_relationship_member(auth.uid()));

DROP POLICY IF EXISTS "Members can create special dates" ON special_dates;
CREATE POLICY "Members can create special dates" ON special_dates
  FOR INSERT WITH CHECK (is_relationship_member(auth.uid()) AND author_id = auth.uid());

DROP POLICY IF EXISTS "Authors can update own special dates" ON special_dates;
CREATE POLICY "Authors can update own special dates" ON special_dates
  FOR UPDATE USING (author_id = auth.uid());

DROP POLICY IF EXISTS "Authors can delete own special dates" ON special_dates;
CREATE POLICY "Authors can delete own special dates" ON special_dates
  FOR DELETE USING (author_id = auth.uid());

-- DAILY MESSAGES: all members
DROP POLICY IF EXISTS "Members can view messages" ON daily_messages;
CREATE POLICY "Members can view messages" ON daily_messages
  FOR SELECT USING (is_relationship_member(auth.uid()));

DROP POLICY IF EXISTS "Members can create messages" ON daily_messages;
CREATE POLICY "Members can create messages" ON daily_messages
  FOR INSERT WITH CHECK (is_relationship_member(auth.uid()) AND author_id = auth.uid());

DROP POLICY IF EXISTS "Members can update messages" ON daily_messages;
CREATE POLICY "Members can update messages" ON daily_messages
  FOR UPDATE USING (is_relationship_member(auth.uid()));

-- DATE PLANS: all members
DROP POLICY IF EXISTS "Members can view date plans" ON date_plans;
CREATE POLICY "Members can view date plans" ON date_plans
  FOR SELECT USING (is_relationship_member(auth.uid()));

DROP POLICY IF EXISTS "Members can create date plans" ON date_plans;
CREATE POLICY "Members can create date plans" ON date_plans
  FOR INSERT WITH CHECK (is_relationship_member(auth.uid()) AND author_id = auth.uid());

DROP POLICY IF EXISTS "Authors can update own date plans" ON date_plans;
CREATE POLICY "Authors can update own date plans" ON date_plans
  FOR UPDATE USING (author_id = auth.uid());

DROP POLICY IF EXISTS "Authors can delete own date plans" ON date_plans;
CREATE POLICY "Authors can delete own date plans" ON date_plans
  FOR DELETE USING (author_id = auth.uid());

-- DATE ACTIVITIES: all members
DROP POLICY IF EXISTS "Members can view date activities" ON date_activities;
CREATE POLICY "Members can view date activities" ON date_activities
  FOR SELECT USING (is_relationship_member(auth.uid()));

DROP POLICY IF EXISTS "Members can create date activities" ON date_activities;
CREATE POLICY "Members can create date activities" ON date_activities
  FOR INSERT WITH CHECK (is_relationship_member(auth.uid()));

DROP POLICY IF EXISTS "Members can update date activities" ON date_activities;
CREATE POLICY "Members can update date activities" ON date_activities
  FOR UPDATE USING (is_relationship_member(auth.uid()));

DROP POLICY IF EXISTS "Members can delete date activities" ON date_activities;
CREATE POLICY "Members can delete date activities" ON date_activities
  FOR DELETE USING (is_relationship_member(auth.uid()));

-- SURPRISES: all members
DROP POLICY IF EXISTS "Members can view surprises" ON surprises;
CREATE POLICY "Members can view surprises" ON surprises
  FOR SELECT USING (is_relationship_member(auth.uid()));

DROP POLICY IF EXISTS "Members can create surprises" ON surprises;
CREATE POLICY "Members can create surprises" ON surprises
  FOR INSERT WITH CHECK (is_relationship_member(auth.uid()) AND author_id = auth.uid());

DROP POLICY IF EXISTS "Authors can update own surprises" ON surprises;
CREATE POLICY "Authors can update own surprises" ON surprises
  FOR UPDATE USING (author_id = auth.uid());

-- DREAM BOARD: all members
DROP POLICY IF EXISTS "Members can view dreams" ON dream_board_items;
CREATE POLICY "Members can view dreams" ON dream_board_items
  FOR SELECT USING (is_relationship_member(auth.uid()));

DROP POLICY IF EXISTS "Members can create dreams" ON dream_board_items;
CREATE POLICY "Members can create dreams" ON dream_board_items
  FOR INSERT WITH CHECK (is_relationship_member(auth.uid()) AND author_id = auth.uid());

DROP POLICY IF EXISTS "Authors can update own dreams" ON dream_board_items;
CREATE POLICY "Authors can update own dreams" ON dream_board_items
  FOR UPDATE USING (author_id = auth.uid());

DROP POLICY IF EXISTS "Authors can delete own dreams" ON dream_board_items;
CREATE POLICY "Authors can delete own dreams" ON dream_board_items
  FOR DELETE USING (author_id = auth.uid());

-- CHAT MESSAGES: all members
DROP POLICY IF EXISTS "Members can view chat" ON chat_messages;
CREATE POLICY "Members can view chat" ON chat_messages
  FOR SELECT USING (is_relationship_member(auth.uid()));

DROP POLICY IF EXISTS "Members can send messages" ON chat_messages;
CREATE POLICY "Members can send messages" ON chat_messages
  FOR INSERT WITH CHECK (is_relationship_member(auth.uid()) AND sender_id = auth.uid());

DROP POLICY IF EXISTS "Senders can update own messages" ON chat_messages;
CREATE POLICY "Senders can update own messages" ON chat_messages
  FOR UPDATE USING (sender_id = auth.uid());

-- MESSAGE REACTIONS: all members
DROP POLICY IF EXISTS "Members can view reactions" ON message_reactions;
CREATE POLICY "Members can view reactions" ON message_reactions
  FOR SELECT USING (is_relationship_member(auth.uid()));

DROP POLICY IF EXISTS "Members can add reactions" ON message_reactions;
CREATE POLICY "Members can add reactions" ON message_reactions
  FOR INSERT WITH CHECK (is_relationship_member(auth.uid()) AND user_id = auth.uid());

DROP POLICY IF EXISTS "Users can remove own reactions" ON message_reactions;
CREATE POLICY "Users can remove own reactions" ON message_reactions
  FOR DELETE USING (user_id = auth.uid());

-- LOVE CAPSULES: all members (content hidden until unlock_date)
DROP POLICY IF EXISTS "Members can view capsules" ON love_capsules;
CREATE POLICY "Members can view capsules" ON love_capsules
  FOR SELECT USING (is_relationship_member(auth.uid()));

DROP POLICY IF EXISTS "Members can create capsules" ON love_capsules;
CREATE POLICY "Members can create capsules" ON love_capsules
  FOR INSERT WITH CHECK (is_relationship_member(auth.uid()) AND author_id = auth.uid());

DROP POLICY IF EXISTS "Authors can update own capsules" ON love_capsules;
CREATE POLICY "Authors can update own capsules" ON love_capsules
  FOR UPDATE USING (author_id = auth.uid());

-- NOTIFICATIONS: only own notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "System can create notifications" ON notifications;
CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (is_relationship_member(auth.uid()));

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
-- Run these in the Supabase dashboard or via API:
-- 1. Create bucket 'avatars' (public)
-- 2. Create bucket 'memories' (private, requires auth)
-- 3. Create bucket 'letters' (private, requires auth)
-- 4. Create bucket 'chat' (private, requires auth)
-- 5. Create bucket 'dreams' (private, requires auth)

-- ============================================================
-- PROFILE AUTO-CREATION TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, display_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'partner')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();



-- ============================================================
-- LITTLE THINGS (New)
-- ============================================================
CREATE TABLE IF NOT EXISTS little_things (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  category TEXT DEFAULT 'moment',
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE little_things ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "little_things_select" ON little_things;
CREATE POLICY "little_things_select" ON little_things
  FOR SELECT USING (is_relationship_member(auth.uid()));
DROP POLICY IF EXISTS "little_things_insert" ON little_things;
CREATE POLICY "little_things_insert" ON little_things
  FOR INSERT WITH CHECK (auth.uid() = author_id AND is_relationship_member(auth.uid()));
DROP POLICY IF EXISTS "little_things_update" ON little_things;
CREATE POLICY "little_things_update" ON little_things
  FOR UPDATE USING (auth.uid() = author_id);
DROP POLICY IF EXISTS "little_things_delete" ON little_things;
CREATE POLICY "little_things_delete" ON little_things
  FOR DELETE USING (auth.uid() = author_id);

-- ============================================================
-- POLAROIDS (New)
-- ============================================================
CREATE TABLE IF NOT EXISTS polaroids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url TEXT NOT NULL,
  caption TEXT,
  rotation NUMERIC NOT NULL DEFAULT 0,
  position_x NUMERIC NOT NULL DEFAULT 0,
  position_y NUMERIC NOT NULL DEFAULT 0,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE polaroids ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "polaroids_select" ON polaroids;
CREATE POLICY "polaroids_select" ON polaroids
  FOR SELECT USING (is_relationship_member(auth.uid()));
DROP POLICY IF EXISTS "polaroids_insert" ON polaroids;
CREATE POLICY "polaroids_insert" ON polaroids
  FOR INSERT WITH CHECK (auth.uid() = author_id AND is_relationship_member(auth.uid()));
DROP POLICY IF EXISTS "polaroids_update" ON polaroids;
CREATE POLICY "polaroids_update" ON polaroids
  FOR UPDATE USING (auth.uid() = author_id);
DROP POLICY IF EXISTS "polaroids_delete" ON polaroids;
CREATE POLICY "polaroids_delete" ON polaroids
  FOR DELETE USING (auth.uid() = author_id);
