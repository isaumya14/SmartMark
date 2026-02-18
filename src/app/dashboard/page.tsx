import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import AddBookmarkForm from "@/components/AddBookmarkForm";
import BookmarkList from "@/components/BookmarkList";
import SignOutButton from "@/components/SignOutButton";
import { Bookmark } from "@/types";

const FEATURE_TAGS = [
  { icon: "⚡", label: "Instant access" },
  { icon: "🔍", label: "Quick search" },
  { icon: "🔗", label: "Any URL" },
  { icon: "🗂️", label: "Auto-organised" },
  { icon: "🔄", label: "Synced in real-time" },
  { icon: "🔒", label: "Private by default" },
  { icon: "🌐", label: "Works everywhere" },
  { icon: "✨", label: "Zero clutter" },
];

const CAROUSEL_ITEMS = [...FEATURE_TAGS, ...FEATURE_TAGS];

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const { data: bookmarks } = await supabase
    .from("bookmarks")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const firstName = user.user_metadata?.full_name?.split(" ")[0] || "there";

  return (
    <div className="min-h-screen bg-[#060610] relative overflow-x-hidden">

      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div className="glow-top absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[520px]" />
        <div className="glow-bottom-right absolute bottom-0 right-0 w-[600px] h-[500px]" />
        <div className="bg-grid absolute inset-0 opacity-[0.025]" />
      </div>

      <header className="sticky top-0 z-20 border-b border-white/[0.05] bg-[#060610]/80 backdrop-blur-2xl">
        <div className="w-4/5 mx-auto px-4 py-3.5 flex items-center justify-between">

          <div className="flex items-center gap-2.5">
            <div className="logo-icon w-8 h-8 rounded-xl flex items-center justify-center border">
              <svg
                width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="#a5b4fc" strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round"
              >
                <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
              </svg>
            </div>
            <span className="text-[15px] font-bold tracking-tight text-white">
              Smart<span className="text-indigo-400">Mark</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-[#6b6b90] border border-white/[0.07] bg-white/[0.02] rounded-full px-3 py-1.5">
              Hey, {firstName} 👋
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="relative z-10 w-4/5 mx-auto px-4 pt-16 pb-28 space-y-12">

        <section className="anim-1 flex flex-col items-center text-center gap-5">
          <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-widest uppercase text-indigo-400 border border-indigo-500/20 bg-indigo-500/[0.08] rounded-full px-4 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Your personal web library
          </span>

          <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-white leading-[1.04]">
            Save the web,
            <br />
            <span className="gradient-heading">find it instantly.</span>
          </h1>

          <p className="text-[#6b6b90] text-sm max-w-sm leading-relaxed">
            SmartMark keeps your favourite links organised and always one click
            away — no clutter, no chaos. Just your web, curated.
          </p>
        </section>

        <div className="anim-2 marquee-wrap py-1">
          <div className="marquee-track gap-3">
            {CAROUSEL_ITEMS.map((item, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-2 text-xs font-medium text-[#6b6b90] border border-white/[0.08] bg-white/[0.03] rounded-full px-4 py-2 select-none whitespace-nowrap cursor-default transition-colors duration-200 hover:border-indigo-500/30 hover:text-indigo-300"
              >
                <span>{item.icon}</span>
                {item.label}
              </span>
            ))}
          </div>
        </div>
        <div className="anim-2 glow-sep" />    
        <section className="anim-3">
          <AddBookmarkForm userId={user.id} />
          <p className="text-center text-[11px] text-[#32324a] mt-3 tracking-wide">
            Press Enter to save · Works with any URL · Synced in real-time
          </p>
        </section>

        <section className="anim-4">
          <BookmarkList
            initialBookmarks={(bookmarks as Bookmark[]) ?? []}
            userId={user.id}
          />
        </section>
      </main>
    </div>
  );
}