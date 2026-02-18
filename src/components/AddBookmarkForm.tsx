"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function AddBookmarkForm({ userId }: { userId: string }) {
  const supabase = createClient();
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !title.trim()) return;

    setLoading(true);
    await supabase.from("bookmarks").insert({ user_id: userId, url, title });
    setUrl("");
    setTitle("");
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="form-card flex flex-col sm:flex-row gap-2 p-2 rounded-2xl border border-white/[0.08]"
    >
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        required
        className="input-glow flex-1 min-w-0 px-4 py-3.5 rounded-xl text-sm bg-white/[0.03] border border-white/[0.07] text-white/90 placeholder:text-[#32324a] transition-colors duration-150"
      />
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://..."
        required
        className="input-glow flex-[2] min-w-0 px-4 py-3.5 rounded-xl text-sm bg-white/[0.03] border border-white/[0.07] text-white/90 placeholder:text-[#32324a] transition-colors duration-150"
      />
      <button
        type="submit"
        disabled={loading}
        className="btn-add flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm text-white disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
      >
        {loading ? (
          <svg
            className="animate-spin w-4 h-4" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2.5"
          >
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" />
          </svg>
        ) : (
          <>
            <span className="text-lg leading-none font-light">+</span> Add
          </>
        )}
      </button>
    </form>
  );
}