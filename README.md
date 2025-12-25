# Flowwa Hub - Rewards & Gamification Platform

A modern rewards hub built with Next.js 16, React 19, Supabase, and Tailwind CSS. Users can earn points, track streaks, and redeem rewards.

## 🚀 Live Demo

[View Live Application](#) <!-- Add your deployed URL here -->

## ✨ Key Features

- Points balance tracker with reward progress
- Daily streak calendar with check-in system
- Referral system with social sharing
- Rewards catalog with filtering (All/Unlocked/Locked/Coming Soon)
- Real-time notifications system
- Sticky header navigation

## 🛠️ Tech Stack

Next.js 16 • React 19 • Supabase • Tailwind CSS v4 • shadcn/ui

## 🔧 Quick Setup

1. **Clone and Install**
   ```bash
   git clone <repo-url>
   npm install
   ```

2. **Environment Variables** (create `.env.local`)
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   # See Supabase Dashboard → Project Settings → API for values
   ```

3. **Setup Database**
   - Run `scripts/init-database.sql` in Supabase SQL Editor
   - Run `scripts/seed-data.sql` for sample data

4. **Create Test Account** (Supabase Dashboard → Authentication → Add User)
   - Email: `test@flowwahub.com`
   - Password: `test123456`
   - Enable "Auto Confirm User"

5. **Run Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000/auth/login](http://localhost:3000/auth/login)



## 🎯 Key Assumptions & Trade-offs

- **Single points currency** - Simplified reward economy vs multiple token types
- **Client-side filtering** - Faster UX, loads all rewards upfront (good for <100 items)
- **Static notifications** - Simpler than real-time; can upgrade with Supabase Realtime later
- **Fixed card heights (390px)** - Visual consistency vs flexible content sizing
- **Email/password auth only** - Simpler setup; can add OAuth providers later

## 📁 Project Structure

```
app/auth/          # Authentication pages
app/rewards/       # Main rewards hub
components/        # React components
lib/supabase/      # Database clients
scripts/           # Database setup SQL
```


