# SmartMark

> Save the web, find it instantly.

A personal bookmark manager built with Next.js 14, Supabase, and Tailwind CSS.
Bookmarks sync across sessions in real-time — no refresh needed.

![SmartMark Dashboard](./preview.png)

## Features

- Google OAuth login
- Add and delete bookmarks instantly
- Real-time sync using Supabase Realtime
- User isolation — each user only sees their own bookmarks
- Responsive dark UI built with Tailwind CSS

## Tech Stack

| Layer     | Technology              |
|-----------|-------------------------|
| Framework | Next.js 14 (App Router) |
| Database  | Supabase (PostgreSQL)   |
| Auth      | Supabase Auth (Google)  |
| Realtime  | Supabase Realtime       |
| Styling   | Tailwind CSS            |
| Hosting   | Vercel                  |

## Getting Started

### 1. Clone the repo

\`\`\`bash
git clone https://github.com/YOUR_USERNAME/smartmark.git
cd smartmark
npm install
\`\`\`

### 2. Set up environment variables

Create a `.env.local` file in the root:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

Get these from your Supabase project → **Settings → API**.

### 3. Run locally

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000).

## Supabase Setup

### Database table

\`\`\`sql
create table bookmarks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  url text not null,
  created_at timestamp with time zone default now()
);
\`\`\`

### Row Level Security

\`\`\`sql
alter table bookmarks enable row level security;

create policy "Users can view own bookmarks"
  on bookmarks for select using (auth.uid() = user_id);

create policy "Users can insert own bookmarks"
  on bookmarks for insert with check (auth.uid() = user_id);

create policy "Users can delete own bookmarks"
  on bookmarks for delete using (auth.uid() = user_id);

alter publication supabase_realtime add table bookmarks;
\`\`\`

## Deployment

Deployed on Vercel.

## Author

Built by **Saumya Singh**