# 🌌 Our Little Universe

> *A little world that belongs only to us.*

A beautiful, interactive, private digital space for you and your partner — a romantic full-stack web application built with Next.js, TypeScript, Tailwind CSS, Framer Motion, and Supabase.

---

## ✨ Features

### 🏠 Home Dashboard
- Personalized welcome with partner names
- Live relationship duration counter (years, months, days, hours)
- Daily romantic quotes
- Quick action cards
- "You Are Loved" interactive experience with floating hearts

### 💌 Love Letters
- Write, save drafts, edit, and delete letters
- Categories: When I Miss You, Good Morning/Night, Special Occasions, etc.
- "Open When..." collection with tags
- Handwritten font toggle
- Schedule letters for future dates
- Beautiful letter-opening animation

### 🌷 Memory Garden
- Private photo scrapbook with captions, dates, and locations
- **Photo uploads to Supabase Storage**
- Multiple photos per memory with gallery viewer
- Masonry grid gallery and timeline view
- Tags and favorites
- Full-screen image viewer with navigation arrows

### 🫂 Feelings Space
- Private emotional journal for both partners
- Mood selection (Happy, Loved, Sad, Angry, Anxious, Tired, Peaceful)
- Private or shared entries
- Supportive comment system
- 30-day mood calendar

### ❤️ Why I Love You
- Interactive love reason cards
- "Remind Me Why You Love Me" random generator
- Categories and favorites
- Unlimited entries from both partners

### ⏳ Our Timeline
- Interactive relationship milestones
- Custom icons and descriptions
- Beautiful animated timeline

### 💗 Daily Love Messages
- Daily love message system
- Types: Love, Good Morning, Good Night, Random, Custom
- Read receipts and scheduling

### 🌹 Date Planner
- Plan dates with title, date, time, location, budget
- Quick date ideas (Movie Night, Dinner, Coffee, etc.)
- Upcoming / Ideas / Completed tabs
- Countdown to next date

### 🎁 Surprise Room
- Mystery gift box with tap-to-reveal
- Message, memory, reason, virtual hug, letter surprises
- Confetti animation on reveal
- Date-locked surprises for anniversaries

### 🌙 Our Dreams
- Shared dream board (Pinterest-style)
- Categories: Travel, Experiences, Goals, Home, etc.
- Progress tracking
- Mark as completed

### 💬 Private Chat
- Real-time messaging via Supabase Realtime
- Emoji reactions and quick emojis
- Reply to messages
- Read receipts and favorites
- Beautiful chat bubbles

### 💊 Love Capsule
- Write a message today, lock until a future date
- Countdown to unlock
- Beautiful reveal animation

### ❓ Question Time
- Random relationship question generator
- 20+ meaningful questions
- Question history

### ⚙️ Settings
- Customize names, anniversary, greeting
- Dark/Light theme toggle
- Partner invite code management

### 🎵 Background Music Player
- Floating music player pill in dashboard
- Play/pause, volume slider, mute toggle
- Reads URL from relationship settings
- Must be user-initiated (no autoplay)

### ✨ Custom Cursor
- Soft glowing cursor on desktop
- Trailing sparkle particles
- Automatically disabled on mobile/touch

### 🌸 The Little Things
- Appreciation & gratitude cards
- Categories: Small Moment, Grateful For, Made Me Smile, etc.
- Search & filter
- Favorites

### 📸 Polaroid Wall
- Digital polaroid photo wall
- Upload photos with captions
- Randomly rotated polaroid styling
- Full-screen viewer
- Beautiful hover animations

### 📱 PWA Support
- Installable as a mobile app
- Standalone display mode
- Custom theme color and icons

### 🔐 Authentication & Privacy
- Supabase Auth with only 2 authorized accounts
- Invite code system for the partner
- Row Level Security on all tables
- Private entries truly private

---

## 🛠 Tech Stack

- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Forms:** React Hook Form, Zod
- **Backend:** Supabase (PostgreSQL, Auth, Realtime, Storage)
- **Styling:** Glassmorphism, gradients, custom animations
- **Notifications:** Sonner toast

---

## 🚀 Setup

### 1. Clone and Install

```bash
cd our-little-universe
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase/schema.sql`
3. Go to **Settings → API** to get your project URL and anon key
4. Create storage buckets: `avatars` (public), `memories`, `letters`, `chat`, `dreams` (all private)

### 3. Configure Environment

Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Create Accounts

1. Run `npm run dev`
2. Go to `/setup` and select "I'm Creating Our Universe"
3. Fill in your details and create the owner account
4. Share the generated invite code with your partner
5. Your partner goes to `/setup` → "I Have an Invite Code" to join

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🌐 Deploy to Vercel

1. Push to GitHub
2. Import in [vercel.com](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login & Setup pages
│   ├── (dashboard)/     # All authenticated pages
│   │   ├── home/        # Dashboard home
│   │   ├── letters/     # Love letters
│   │   ├── memories/    # Memory garden
│   │   ├── journal/     # Feelings journal
│   │   ├── reasons/     # Love reasons
│   │   ├── timeline/    # Milestones
│   │   ├── messages/    # Daily messages
│   │   ├── dates/       # Date planner
│   │   ├── surprises/   # Surprise room
│   │   ├── dreams/      # Dream board
│   │   ├── chat/        # Private chat
│   │   ├── capsule/     # Love capsule
│   │   ├── questions/   # Question generator
│   │   └── settings/    # Settings
│   ├── auth/callback/   # Auth callback
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx         # Landing page
├── components/ui/       # Reusable UI components
├── lib/
│   ├── supabase/        # Supabase client setup
│   ├── hooks/           # Auth hook/context
│   ├── constants.ts     # App constants
│   └── utils.ts         # Utility functions
├── types/
│   └── database.ts      # TypeScript types
└── supabase/
    └── schema.sql       # Database schema + RLS
```

---

## 🎨 Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Midnight Black | `#0B0B14` | Background |
| Deep Purple | `#201537` | Cards, gradients |
| Soft Lavender | `#C8B6FF` | Accents, links |
| Rose Pink | `#FFB7C5` | Hearts, highlights |
| Warm Cream | `#FFF5EB` | Light mode bg |

---

## 💕 Database

19 tables with full Row Level Security:
profiles, relationship_settings, love_letters, memory_albums, memories, journal_entries, journal_comments, love_reasons, relationship_milestones, special_dates, daily_messages, date_plans, date_activities, surprises, dream_board_items, chat_messages, message_reactions, love_capsules, notifications

---

*Made with ♥ — "Someone really took the time to create an entire little world just for me."*
