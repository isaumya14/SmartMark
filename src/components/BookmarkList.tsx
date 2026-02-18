
"use client";

import { Bookmark } from "@/types";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";

const getDomain = (url: string) => {
  try { return new URL(url).hostname; } catch { return url; }
};

const countDomains = (items: Bookmark[]) =>
  new Set(items.map((b) => getDomain(b.url))).size;

function StatCell({
  value,
  label,
  accent = false,
}: {
  value: number | string;
  label: string;
  accent?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef(value);

  useEffect(() => {
    if (prev.current !== value && ref.current) {
      ref.current.classList.remove("stat-pop");
      void ref.current.offsetWidth;
      ref.current.classList.add("stat-pop");
      prev.current = value;
    }
  }, [value]);

  return (
    <div className="flex flex-col items-center justify-center py-7 gap-1.5 select-none">
      <span
        ref={ref}
        className={`text-4xl font-black leading-none tracking-tight tabular-nums ${
          accent ? "text-indigo-300" : "text-white/90"
        }`}
      >
        {value}
      </span>
      <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#32324a]">
        {label}
      </span>
    </div>
  );
}

export default function BookmarkList({
  initialBookmarks,
  userId,
}: {
  initialBookmarks: Bookmark[];
  userId: string;
}) {
  const supabase = createClient();
  const [bookmarks, setBookmarks] = useState(initialBookmarks);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const totalBookmarks = bookmarks.length;
  const totalDomains = countDomains(bookmarks);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel>;

    const setupRealtime = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      supabase.realtime.setAuth(session.access_token);

      channel = supabase
        .channel(`bookmarks:user=${userId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "bookmarks",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            if (payload.eventType === "INSERT") {
              const newBookmark = payload.new as Bookmark;
              setBookmarks((prev) =>
                prev.some((b) => b.id === newBookmark.id)
                  ? prev
                  : [newBookmark, ...prev]
              );
            }

            if (payload.eventType === "DELETE") {
              const deletedId = payload.old?.id;
              if (deletedId) {
                setBookmarks((prev) =>
                  prev.filter((b) => b.id !== deletedId)
                );
              }
            }
          }
        )
        .subscribe();
    };

    setupRealtime();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [userId]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await supabase.from("bookmarks").delete().eq("id", id);
    setDeletingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="stats-card grid grid-cols-3 rounded-2xl overflow-hidden border border-white/[0.06]">
        <div className="border-r border-white/[0.05]">
          <StatCell value={totalBookmarks} label="Bookmarks" accent />
        </div>
        <div className="border-r border-white/[0.05]">
          <StatCell value={totalDomains} label="Domains" />
        </div>
        <StatCell value="∞" label="Storage" />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] font-black tracking-[0.22em] uppercase text-white/75">
            Bookmarks
          </span>
          {totalBookmarks > 0 && (
            <span className="text-[10px] font-bold tabular-nums text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-2 py-0.5">
              {totalBookmarks}
            </span>
          )}
        </div>
        <span className="text-[11px] font-medium text-[#32324a]">
          {totalDomains} domain{totalDomains !== 1 ? "s" : ""}
        </span>
      </div>

      {bookmarks.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-24 rounded-2xl border border-dashed border-indigo-500/[0.12] bg-indigo-500/[0.025]">
          <div className="empty-icon w-14 h-14 rounded-2xl flex items-center justify-center border">
            <svg
              width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="#818cf8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
            </svg>
          </div>
          <div className="text-center space-y-1.5">
            <p className="text-white/70 text-sm font-semibold">Nothing saved yet</p>
            <p className="text-xs text-[#32324a]">Add your first bookmark above ↑</p>
          </div>
        </div>
      ) : (
        <ul className="bookmark-list rounded-2xl overflow-hidden border border-white/[0.06]">
          {bookmarks.map((bookmark, i) => (
            <li
              key={bookmark.id}
              className={`row-enter group relative flex items-center gap-4 px-6 py-4 transition-colors duration-150 hover:bg-indigo-500/[0.07] ${
                i > 0 ? "border-t border-white/[0.04]" : ""
              } ${i % 2 === 0 ? "bg-white/[0.018]" : "bg-transparent"}`}
              style={{ animationDelay: `${Math.min(i * 0.05, 0.4)}s` }}
            >
              <div className="accent-bar absolute left-0 top-0 bottom-0 w-0.5 rounded-r opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

              <div className="w-9 h-9 flex-shrink-0 rounded-xl flex items-center justify-center border border-white/[0.08] bg-white/[0.04] overflow-hidden">
                <img
                  src={`https://www.google.com/s2/favicons?sz=32&domain=${bookmark.url}`}
                  alt=""
                  className="w-4 h-4"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>

              <div className="flex-1 min-w-0">
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-sm text-white/90 hover:text-indigo-300 truncate block transition-colors duration-150"
                >
                  {bookmark.title}
                </a>
                <p className="text-xs text-[#32324a] truncate mt-0.5 font-medium">
                  {getDomain(bookmark.url)}
                </p>
              </div>

              <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex-shrink-0">
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open link"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6b6b90] border border-white/[0.07] bg-white/[0.03] hover:bg-indigo-500/15 hover:border-indigo-500/30 hover:text-indigo-300 transition-all duration-150"
                >
                  <svg
                    width="11" height="11" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.2"
                    strokeLinecap="round" strokeLinejoin="round"
                  >
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                  </svg>
                </a>

                <button
                  onClick={() => handleDelete(bookmark.id)}
                  disabled={deletingId === bookmark.id}
                  aria-label="Delete bookmark"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6b6b90] border border-white/[0.07] bg-white/[0.03] hover:bg-red-500/[0.12] hover:border-red-500/[0.28] hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150"
                >
                  {deletingId === bookmark.id ? (
                    <svg
                      className="animate-spin w-3 h-3" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" strokeWidth="2.5"
                    >
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" />
                    </svg>
                  ) : (
                    <svg
                      width="11" height="11" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.2"
                      strokeLinecap="round" strokeLinejoin="round"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                    </svg>
                  )}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

