# SmartMark

> Save the web, find it instantly.

A real-time personal bookmark manager built with Next.js 14, Supabase, and Tailwind CSS.

![SmartMark Dashboard](./preview.png)

## What it does

- Google OAuth login
- Add and delete bookmarks instantly
- Stats (bookmark count, domains) update in real-time — no refresh needed
- Each user only sees their own bookmarks
- Responsive dark UI

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (Google OAuth) |
| Realtime | Supabase Realtime |
| Styling | Tailwind CSS |
| Hosting | Vercel |

---

## Problems I faced and how I solved them

### 1. I didn't know where to start with Supabase Realtime
I had never used Supabase Realtime before. I knew I wanted the bookmark list
to update without refreshing the page but had no idea how to set it up.

I read the Supabase docs and learned about `postgres_changes` — it lets you
listen to INSERT, UPDATE and DELETE events on any table. Once I understood
the concept, I set up a channel inside a `useEffect` that fires when the
component mounts. That became the foundation for all the real-time features
in the app.

### 2. Bookmarks were showing up twice when added
After getting realtime working, every time I added a bookmark it appeared
twice in the list. It took me a while to figure out why.

The problem was that the page already fetches all bookmarks from the server
when it loads. Then when I added a new one, the Realtime INSERT event fired
and added it again to the state — resulting in a duplicate.

**Fix:** Before adding a new bookmark to state, I check if it already exists:
```ts
setBookmarks((prev) =>
  prev.some((b) => b.id === newBookmark.id) ? prev : [newBookmark, ...prev]
);
```

### 3. Delete worked in the database but the UI wasn't updating
Clicking delete removed the bookmark from Supabase but it stayed on screen
until I refreshed the page. I spent a long time debugging this one.

After a lot of searching I found that Supabase only sends back the `id` in
`payload.old` for DELETE events — not other columns like `user_id`. I had
written a check `if (deleted.user_id === userId)` which was always failing
silently because `user_id` was `undefined`.

**Fix:** Removed the `user_id` check for DELETE events. The channel filter
already makes sure only the right user's events come through:
```ts
if (payload.eventType === "DELETE") {
  const deletedId = payload.old?.id;
  if (deletedId) {
    setBookmarks((prev) => prev.filter((b) => b.id !== deletedId));
  }
}
```

### 4. One user could technically see another user's bookmarks
Early on I only had client-side checks to filter bookmarks by user. But I
realised that anyone could bypass the frontend and call the Supabase API
directly to read any row in the table.

**Fix:** I enabled Row Level Security (RLS) on the bookmarks table in
Supabase and added policies so users can only SELECT, INSERT or DELETE their
own rows. This means even if someone bypasses the UI entirely, the database
itself rejects the request. I also added a `filter` to the realtime channel
so users don't receive each other's live events either.

### 5. Bookmark count and domain stats were stuck after adding/deleting
The stats strip showing "3 Bookmarks, 2 Domains" was calculated on the
server at page load and never changed even after adding or deleting bookmarks
in real-time.

**Fix:** I moved the stats calculation into the client component and derived
it directly from the `bookmarks` state array. Since the state updates with
every realtime event, the stats now update automatically with no extra code.

### 6. Google login was redirecting to the wrong place after deploy
Everything worked perfectly on localhost but after deploying to Vercel,
Google OAuth was redirecting back to `localhost:3000` instead of the live
site. Users were getting a blank error page after signing in.

**Fix:** I went to Supabase → Authentication → URL Configuration and added
the Vercel deployment URL as both the Site URL and an allowed Redirect URL.
I also had to add the Vercel URL as an authorised redirect in the Google
Cloud Console under OAuth credentials.

### 7. Vercel build was failing with a config error
The build kept failing with:
`Configuring Next.js via 'next.config.ts' is not supported`

Next.js 14 on Vercel doesn't support TypeScript config files.

**Fix:** Renamed `next.config.ts` to `next.config.mjs` and the build
passed immediately.

---

## Local Setup

### 1. Clone
```bash
git clone https://github.com/isaumya14/SmartMark.git
cd SmartMark
npm install
```

### 2. Environment variables
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run
```bash
npm run dev
```

---

## Supabase Setup

### Table
```sql
create table bookmarks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  url text not null,
  created_at timestamp with time zone default now()
);
```

### RLS Policies
```sql
alter table bookmarks enable row level security;

create policy "Users can view own bookmarks"
  on bookmarks for select using (auth.uid() = user_id);

create policy "Users can insert own bookmarks"
  on bookmarks for insert with check (auth.uid() = user_id);

create policy "Users can delete own bookmarks"
  on bookmarks for delete using (auth.uid() = user_id);

alter publication supabase_realtime add table bookmarks;
```

---

## Author

Built by **Saumya**